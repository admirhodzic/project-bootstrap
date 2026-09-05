#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { loadScenarios } from './core/evals.js';
import { UserError } from './core/errors.js';
import { runLiveEvaluation } from './core/live-evals.js';

const { values } = parseArgs({
  options: {
    help: { type: 'boolean', default: false },
    root: { type: 'string', default: '.' },
    scenario: { type: 'string' },
    platform: { type: 'string' },
    agent: { type: 'string' },
    'agent-version': { type: 'string' },
    command: { type: 'string' },
    arg: { type: 'string', multiple: true, default: [] },
    repetitions: { type: 'string', default: '3' },
    'timeout-ms': { type: 'string', default: '300000' },
    'spend-ceiling-usd': { type: 'string' },
    'output-root': { type: 'string', default: 'evals/runs' },
    fixture: { type: 'string' },
    'allow-env': { type: 'string', multiple: true, default: [] },
    'credential-boundary': { type: 'string' },
  },
  strict: true,
});

const help = `Usage: project-bootstrap live evaluation

pnpm eval:live -- --scenario ID --platform NAME --agent NAME --agent-version VERSION
  --command PATH [--arg VALUE ...] --repetitions N --timeout-ms N
  --spend-ceiling-usd N --credential-boundary DESCRIPTION

Optional: --root DIR --output-root RELATIVE_DIR --fixture RELATIVE_DIR --allow-env NAME
Driver arguments may use {workspace}, {prompt-file}, and {scenario} placeholders.
`;

function required(name: keyof typeof values): string {
  const value = values[name];
  if (typeof value !== 'string' || value.trim().length === 0)
    throw new UserError(`--${name} is required.`);
  return value;
}

async function main() {
  const root = resolve(values.root);
  const scenarioId = required('scenario');
  const scenario = (await loadScenarios(root)).find((item) => item.id === scenarioId);
  if (!scenario) throw new UserError(`Unknown scenario: ${scenarioId}`);
  const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')) as {
    version: string;
  };
  const scenarioText = await readFile(
    resolve(root, 'evals', 'scenarios', `${scenario.id}.json`),
    'utf8',
  );
  const artifacts = await runLiveEvaluation({
    root,
    scenario,
    scenarioRevision: createHash('sha256').update(scenarioText).digest('hex'),
    frameworkVersion: packageJson.version,
    platform: required('platform'),
    agent: required('agent'),
    agentVersion: required('agent-version'),
    command: required('command'),
    args: values.arg,
    repetitions: Number(values.repetitions),
    timeoutMs: Number(values['timeout-ms']),
    spendCeilingUsd: Number(required('spend-ceiling-usd')),
    outputRoot: values['output-root'],
    allowedEnvironment: values['allow-env'],
    credentialBoundary: required('credential-boundary'),
    ...(values.fixture ? { fixture: values.fixture } : {}),
  });
  process.stdout.write(
    `${JSON.stringify({ directory: artifacts.directory, passed: artifacts.report.summary.successes, runs: artifacts.report.summary.runs }, null, 2)}\n`,
  );
  if (artifacts.report.summary.successes !== artifacts.report.summary.runs) process.exitCode = 1;
}

if (values.help) process.stdout.write(help);
else
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
