import { spawnSync } from 'node:child_process';
import { cp, lstat, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Observation, RunSample, Scenario, ScenarioResult } from './evals.js';
import { gradeScenario, markdownReport, summarizeRuns } from './evals.js';
import { UserError } from './errors.js';
import { resolveContainedPath } from './paths.js';

const MAX_OUTPUT_BYTES = 1024 * 1024;
const BASE_ENVIRONMENT = [
  'PATH',
  'Path',
  'PATHEXT',
  'SystemRoot',
  'WINDIR',
  'ComSpec',
  'TEMP',
  'TMP',
  'TMPDIR',
] as const;

export interface LiveRunOptions {
  root: string;
  scenario: Scenario;
  scenarioRevision: string;
  frameworkVersion: string;
  platform: string;
  agent: string;
  agentVersion: string;
  command: string;
  args: string[];
  repetitions: number;
  timeoutMs: number;
  spendCeilingUsd: number;
  outputRoot: string;
  fixture?: string;
  allowedEnvironment: string[];
  credentialBoundary: string;
}

export interface LiveRunSample extends RunSample {
  platform: string;
  startedAt: string;
  rawOutput: string;
  exitCode: number | null;
  error?: string;
}

export interface LiveRunReport {
  schemaVersion: 1;
  runId: string;
  scenario: string;
  platform: string;
  agent: string;
  agentVersion: string;
  frameworkVersion: string;
  scenarioRevision: string;
  startedAt: string;
  completedAt: string;
  repetitions: number;
  timeoutMs: number;
  spendCeilingUsd: number;
  concurrency: 1;
  credentialBoundary: string;
  allowedEnvironment: string[];
  samples: LiveRunSample[];
  summary: ReturnType<typeof summarizeRuns>;
}

export interface LiveRunArtifacts {
  directory: string;
  json: string;
  markdown: string;
  report: LiveRunReport;
}

export function redactSecrets(value: string): string {
  return value
    .replace(/npm_[A-Za-z0-9]{20,}/gu, '[REDACTED_NPM_TOKEN]')
    .replace(/github_pat_[A-Za-z0-9_]{20,}/gu, '[REDACTED_GITHUB_TOKEN]')
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/gu, '[REDACTED_GITHUB_TOKEN]')
    .replace(/sk-[A-Za-z0-9_-]{20,}/gu, '[REDACTED_API_KEY]')
    .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/giu, 'Bearer [REDACTED]');
}

export function parseObservation(text: string): Observation {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new UserError('Live driver stdout must contain one JSON observation object.');
  }
  if (typeof value !== 'object' || value === null)
    throw new UserError('Live observation must be an object.');
  const item = value as Record<string, unknown>;
  if (
    !['quick', 'standard', 'deep', 'incident'].includes(String(item.profile)) ||
    !Array.isArray(item.events) ||
    !item.events.every((event) => typeof event === 'string') ||
    !Number.isInteger(item.questions) ||
    Number(item.questions) < 0 ||
    !Number.isInteger(item.artifacts) ||
    Number(item.artifacts) < 0
  )
    throw new UserError('Live observation does not match the required contract.');
  for (const optionalMetric of ['durationMs', 'tokens', 'tools', 'interventions'])
    if (
      item[optionalMetric] !== undefined &&
      (!Number.isFinite(item[optionalMetric]) || Number(item[optionalMetric]) < 0)
    )
      throw new UserError(`Live observation has an invalid ${optionalMetric}.`);
  return value as Observation;
}

function environment(allowed: readonly string[]): NodeJS.ProcessEnv {
  const selected = new Set([...BASE_ENVIRONMENT, ...allowed]);
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([name, value]) => selected.has(name) && value !== undefined,
    ),
  );
}

function failedResult(scenario: Scenario, message: string): ScenarioResult {
  return {
    scenario: scenario.id,
    passed: false,
    failures: [message],
    metrics: { questions: 0, artifacts: 0 },
  };
}

async function assertSafeFixture(path: string, root = path): Promise<void> {
  const status = await lstat(path);
  if (status.isSymbolicLink())
    throw new UserError(`Live fixture contains a symlink or junction: ${path}`);
  if (path === root && !status.isDirectory())
    throw new UserError(`Live fixture must be a directory: ${path}`);
  if (!status.isDirectory()) return;
  for (const entry of await readdir(path)) await assertSafeFixture(join(path, entry), root);
}

function reportMarkdown(report: LiveRunReport): string {
  const results = report.samples.map((sample) => sample.result);
  return [
    '# Live evaluation report',
    '',
    `- Run: ${report.runId}`,
    `- Scenario: ${report.scenario}`,
    `- Platform: ${report.platform}`,
    `- Agent: ${report.agent} ${report.agentVersion}`,
    `- Framework: ${report.frameworkVersion}`,
    `- Scenario revision: ${report.scenarioRevision}`,
    `- Repetitions: ${report.repetitions}`,
    `- Timeout per run: ${report.timeoutMs} ms`,
    `- Provider spend ceiling: USD ${report.spendCeilingUsd}`,
    `- Concurrency: ${report.concurrency}`,
    `- Credential boundary: ${report.credentialBoundary}`,
    '',
    markdownReport(results)
      .trim()
      .replace(/^# Evaluation report/u, '## Grader results'),
    '',
    'Raw driver output is stored separately and is automatically redacted for common token formats. Review it before accepting a baseline.',
    '',
  ].join('\n');
}

export async function runLiveEvaluation(options: LiveRunOptions): Promise<LiveRunArtifacts> {
  if (!Number.isInteger(options.repetitions) || options.repetitions < 1 || options.repetitions > 20)
    throw new UserError('Repetitions must be an integer from 1 through 20.');
  if (
    !Number.isInteger(options.timeoutMs) ||
    options.timeoutMs < 1000 ||
    options.timeoutMs > 3600000
  )
    throw new UserError('Timeout must be an integer from 1000 through 3600000 milliseconds.');
  if (!Number.isFinite(options.spendCeilingUsd) || options.spendCeilingUsd < 0)
    throw new UserError('Provider spend ceiling must be a non-negative number.');
  if (options.command.trim().length === 0) throw new UserError('Live driver command is required.');
  if (options.credentialBoundary.trim().length === 0)
    throw new UserError('Credential boundary description is required.');

  const root = resolve(options.root);
  const fixture = options.fixture ? await resolveContainedPath(root, options.fixture) : undefined;
  if (fixture) await assertSafeFixture(fixture);
  const outputRoot = await resolveContainedPath(root, options.outputRoot);
  await mkdir(outputRoot, { recursive: true });
  const startedAt = new Date().toISOString();
  const runId = `${startedAt.replaceAll(/[:.]/gu, '-')}-${options.scenario.id}-${randomUUID().slice(0, 8)}`;
  const directory = join(outputRoot, runId);
  const rawDirectory = join(directory, 'raw');
  await mkdir(rawDirectory, { recursive: true });
  const samples: LiveRunSample[] = [];

  for (let index = 0; index < options.repetitions; index += 1) {
    const sandbox = await mkdtemp(join(tmpdir(), 'project-bootstrap-live-'));
    const workspace = join(sandbox, 'workspace');
    const sampleStarted = new Date().toISOString();
    const rawRelative = `raw/run-${index + 1}.json`;
    try {
      if (fixture) {
        await cp(fixture, workspace, { recursive: true, errorOnExist: true });
      } else {
        await mkdir(workspace);
      }
      const promptFile = join(workspace, '.project-bootstrap-scenario.txt');
      await writeFile(promptFile, `${options.scenario.prompt}\n`, 'utf8');
      const args = options.args.map((argument) =>
        argument
          .replaceAll('{workspace}', workspace)
          .replaceAll('{prompt-file}', promptFile)
          .replaceAll('{scenario}', options.scenario.id),
      );
      const started = performance.now();
      const processResult = spawnSync(options.command, args, {
        cwd: workspace,
        env: environment(options.allowedEnvironment),
        input: `${options.scenario.prompt}\n`,
        encoding: 'utf8',
        shell: false,
        timeout: options.timeoutMs,
        maxBuffer: MAX_OUTPUT_BYTES,
      });
      const measuredDuration = Math.round(performance.now() - started);
      const stdout = redactSecrets(processResult.stdout ?? '');
      const stderr = redactSecrets(processResult.stderr ?? '');
      let result: ScenarioResult;
      let observation: Observation | undefined;
      let error: string | undefined;
      if (processResult.error) {
        error = redactSecrets(processResult.error.message);
        result = failedResult(options.scenario, `driver error: ${error}`);
      } else if (processResult.status !== 0) {
        error = `driver exited with status ${String(processResult.status)}`;
        result = failedResult(options.scenario, error);
      } else {
        try {
          observation = parseObservation(stdout.trim());
          result = gradeScenario(options.scenario, observation);
        } catch (parseError) {
          error = parseError instanceof Error ? parseError.message : String(parseError);
          result = failedResult(options.scenario, error);
        }
      }
      const rawRecord = {
        schemaVersion: 1,
        scenario: options.scenario.id,
        repetition: index + 1,
        startedAt: sampleStarted,
        command: basename(options.command),
        args: args.map(redactSecrets),
        exitCode: processResult.status,
        stdout,
        stderr,
        error,
      };
      await writeFile(
        join(directory, rawRelative),
        `${JSON.stringify(rawRecord, null, 2)}\n`,
        'utf8',
      );
      samples.push({
        frameworkVersion: options.frameworkVersion,
        agent: options.agent,
        platform: options.platform,
        scenarioRevision: options.scenarioRevision,
        result,
        durationMs: observation?.durationMs ?? measuredDuration,
        startedAt: sampleStarted,
        rawOutput: rawRelative,
        exitCode: processResult.status,
        ...(observation?.tokens === undefined ? {} : { tokens: observation.tokens }),
        ...(observation?.tools === undefined ? {} : { tools: observation.tools }),
        ...(observation?.interventions === undefined
          ? {}
          : { interventions: observation.interventions }),
        ...(error ? { error } : {}),
      });
    } finally {
      const resolvedSandbox = resolve(sandbox);
      if (resolvedSandbox.startsWith(resolve(tmpdir())))
        await rm(resolvedSandbox, { recursive: true, force: true });
    }
  }

  const report: LiveRunReport = {
    schemaVersion: 1,
    runId,
    scenario: options.scenario.id,
    platform: options.platform,
    agent: options.agent,
    agentVersion: options.agentVersion,
    frameworkVersion: options.frameworkVersion,
    scenarioRevision: options.scenarioRevision,
    startedAt,
    completedAt: new Date().toISOString(),
    repetitions: options.repetitions,
    timeoutMs: options.timeoutMs,
    spendCeilingUsd: options.spendCeilingUsd,
    concurrency: 1,
    credentialBoundary: options.credentialBoundary,
    allowedEnvironment: options.allowedEnvironment,
    samples,
    summary: summarizeRuns(samples),
  };
  const json = join(directory, 'report.json');
  const markdown = join(directory, 'report.md');
  await writeFile(json, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(markdown, reportMarkdown(report), 'utf8');
  return { directory, json, markdown, report };
}
