#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildPilotPrompt,
  eventVocabulary,
  observationSchema,
  parseAgentObservation,
  parseClaudeEnvelope,
  parseCodexTranscript,
  type AgentMetrics,
  type AgentObservation,
  type LiveAgentProvider,
} from './core/agent-driver.js';
import { parseScenario, type Scenario } from './core/evals.js';
import { UserError } from './core/errors.js';

interface Options {
  provider: LiveAgentProvider;
  cli: string;
  scenario: string;
  maxBudgetUsd: number;
}

const MAX_NATIVE_OUTPUT = 8 * 1024 * 1024;

function valueAfter(args: string[], index: number): string {
  const value = args[index + 1];
  if (value === undefined) throw new UserError(`Missing value after ${String(args[index])}.`);
  return value;
}

function parseArgs(args: string[]): Options {
  let provider: LiveAgentProvider | undefined;
  let cli: string | undefined;
  let scenario: string | undefined;
  let maxBudgetUsd: number | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = valueAfter(args, index);
    index += 1;
    if (arg === '--provider' && (value === 'codex' || value === 'claude')) provider = value;
    else if (arg === '--cli') cli = value;
    else if (arg === '--scenario') scenario = value;
    else if (arg === '--max-budget-usd') maxBudgetUsd = Number(value);
    else throw new UserError(`Unknown or invalid driver option: ${String(arg)}.`);
  }
  if (provider === undefined || cli === undefined || scenario === undefined)
    throw new UserError('Driver requires --provider, --cli, and --scenario.');
  if (!isAbsolute(cli)) throw new UserError('Driver CLI path must be absolute.');
  if (maxBudgetUsd === undefined || !Number.isFinite(maxBudgetUsd) || maxBudgetUsd <= 0)
    throw new UserError('Driver requires a positive --max-budget-usd ceiling.');
  return { provider, cli, scenario, maxBudgetUsd };
}

async function loadAllScenarios(root: string): Promise<Scenario[]> {
  const directory = join(root, 'evals', 'scenarios');
  const names = (await readdir(directory)).filter((name) => name.endsWith('.json')).sort();
  return Promise.all(
    names.map(async (name) => parseScenario(await readFile(join(directory, name), 'utf8'), name)),
  );
}

function checkedSpawn(command: string, args: string[], cwd: string, input?: string) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    timeout: 280_000,
    maxBuffer: MAX_NATIVE_OUTPUT,
    ...(input === undefined ? {} : { input }),
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = (result.stderr ?? '').slice(-16_000);
    const stdout = (result.stdout ?? '').slice(-16_000);
    throw new UserError(
      `Agent CLI exited with status ${String(result.status)}.\nstdout:\n${stdout}\nstderr:\n${stderr}`,
    );
  }
  return result;
}

async function installInstructions(root: string, workspace: string, platform: LiveAgentProvider) {
  const cli = join(root, 'dist', 'cli.js');
  checkedSpawn(
    process.execPath,
    [cli, 'init', '--root', workspace, '--source', root, '--platform', platform],
    workspace,
  );
  await rm(join(workspace, '.project-bootstrap', 'manifest.json'), { force: true });
}

function mergeMetrics(observation: AgentObservation, metrics: AgentMetrics, durationMs: number) {
  return {
    ...observation,
    durationMs,
    ...(metrics.tokens === undefined ? {} : { tokens: metrics.tokens }),
    ...(metrics.tools === undefined ? {} : { tools: metrics.tools }),
    interventions: 0,
    ...(metrics.costUsd === undefined ? {} : { costUsd: metrics.costUsd }),
  };
}

async function runCodex(
  options: Options,
  workspace: string,
  prompt: string,
  schemaPath: string,
  events: readonly string[],
) {
  const resultPath = join(workspace, '.project-bootstrap-observation.json');
  const started = performance.now();
  const result = checkedSpawn(
    options.cli,
    [
      'exec',
      '--ephemeral',
      '--sandbox',
      'read-only',
      '--skip-git-repo-check',
      '--ignore-user-config',
      '--json',
      '--color',
      'never',
      '-c',
      'model_reasoning_effort="low"',
      '-C',
      workspace,
      '--output-schema',
      schemaPath,
      '--output-last-message',
      resultPath,
      '-',
    ],
    workspace,
    prompt,
  );
  const durationMs = Math.round(performance.now() - started);
  const observation = parseAgentObservation(
    JSON.parse(await readFile(resultPath, 'utf8')) as unknown,
    events,
  );
  return mergeMetrics(observation, parseCodexTranscript(result.stdout ?? ''), durationMs);
}

function runClaude(
  options: Options,
  workspace: string,
  prompt: string,
  schema: Record<string, unknown>,
  events: readonly string[],
) {
  const started = performance.now();
  const result = checkedSpawn(
    options.cli,
    [
      '--print',
      '--no-session-persistence',
      '--output-format',
      'json',
      '--json-schema',
      JSON.stringify(schema),
      '--max-budget-usd',
      String(options.maxBudgetUsd),
      '--max-turns',
      '4',
      '--permission-mode',
      'plan',
      '--permission-prompts',
      'none',
      '--tools',
      '',
      '--strict-mcp-config',
      '--mcp-config',
      '{"mcpServers":{}}',
      '--no-chrome',
      '--disable-slash-commands',
      '--setting-sources',
      'project',
      prompt,
    ],
    workspace,
  );
  const durationMs = Math.round(performance.now() - started);
  const parsed = parseClaudeEnvelope(result.stdout ?? '', events);
  return mergeMetrics(parsed.observation, parsed.metrics, durationMs);
}

async function run(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const scenarios = await loadAllScenarios(root);
  const scenario = scenarios.find((item) => item.id === options.scenario);
  if (scenario === undefined) throw new UserError(`Unknown scenario: ${options.scenario}`);
  const events = eventVocabulary(scenarios);
  const schema = observationSchema(events);
  const workspace = process.cwd();
  await installInstructions(root, workspace, options.provider);
  const schemaPath = join(workspace, '.project-bootstrap-observation.schema.json');
  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
  const prompt = buildPilotPrompt(scenario.prompt, events);
  const observation =
    options.provider === 'codex'
      ? await runCodex(options, workspace, prompt, schemaPath, events)
      : runClaude(options, workspace, prompt, schema, events);
  process.stdout.write(`${JSON.stringify(observation)}\n`);
}

run().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = error instanceof UserError ? error.exitCode : 1;
});
