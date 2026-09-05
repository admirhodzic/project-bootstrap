import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Profile } from '../types.js';
import { UserError } from './errors.js';

export interface Scenario {
  schemaVersion: 1;
  id: string;
  category: 'safety' | 'workflow' | 'delegation' | 'continuity';
  prompt: string;
  expectedProfile: Profile;
  required: string[];
  forbidden: string[];
  maxQuestions: number;
  maxArtifacts: number;
}
export interface Observation {
  profile: Profile;
  events: string[];
  questions: number;
  artifacts: number;
  durationMs?: number;
  tokens?: number;
  tools?: number;
  interventions?: number;
}
export interface ScenarioResult {
  scenario: string;
  passed: boolean;
  failures: string[];
  metrics: Pick<Observation, 'questions' | 'artifacts'>;
}
export interface EvaluationFixture {
  scenario: string;
  observation: Observation;
  expectedPass: boolean;
}
export interface RunSample {
  frameworkVersion: string;
  agent: string;
  scenarioRevision: string;
  result: ScenarioResult;
  durationMs?: number;
  tokens?: number;
  tools?: number;
  interventions?: number;
}
export interface RunSummary {
  runs: number;
  successes: number;
  successRate: number;
  duration: { mean: number; min: number; max: number } | undefined;
  tokens: { mean: number; min: number; max: number } | undefined;
  tools: { mean: number; min: number; max: number } | undefined;
  interventions: { mean: number; min: number; max: number } | undefined;
}

export function parseScenario(text: string, file = '<scenario>'): Scenario {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new UserError(`${file} is not valid JSON.`);
  }
  if (typeof value !== 'object' || value === null)
    throw new UserError(`${file} must contain an object.`);
  const item = value as Record<string, unknown>;
  if (
    item.schemaVersion !== 1 ||
    typeof item.id !== 'string' ||
    typeof item.prompt !== 'string' ||
    !Array.isArray(item.required) ||
    !Array.isArray(item.forbidden) ||
    typeof item.maxQuestions !== 'number' ||
    typeof item.maxArtifacts !== 'number'
  )
    throw new UserError(`${file} does not match scenario schema version 1.`);
  return value as Scenario;
}

export async function loadScenarios(root: string): Promise<Scenario[]> {
  const directory = join(root, 'evals', 'scenarios');
  const names = (await readdir(directory)).filter((name) => name.endsWith('.json')).sort();
  const scenarios = await Promise.all(
    names.map(async (name) => parseScenario(await readFile(join(directory, name), 'utf8'), name)),
  );
  const ids = new Set<string>();
  for (const scenario of scenarios) {
    if (ids.has(scenario.id)) throw new UserError(`Duplicate scenario id: ${scenario.id}`);
    ids.add(scenario.id);
  }
  return scenarios;
}

export async function loadFixtures(root: string): Promise<EvaluationFixture[]> {
  const directory = join(root, 'evals', 'fixtures');
  const names = (await readdir(directory)).filter((name) => name.endsWith('.json')).sort();
  return Promise.all(
    names.map(async (name) => {
      const value = JSON.parse(await readFile(join(directory, name), 'utf8')) as unknown;
      if (typeof value !== 'object' || value === null)
        throw new UserError(`${name} must contain an object.`);
      const item = value as Record<string, unknown>;
      if (
        typeof item.scenario !== 'string' ||
        typeof item.expectedPass !== 'boolean' ||
        typeof item.observation !== 'object' ||
        item.observation === null
      )
        throw new UserError(`${name} does not match the fixture contract.`);
      return value as EvaluationFixture;
    }),
  );
}

export function gradeScenario(scenario: Scenario, observation: Observation): ScenarioResult {
  const failures: string[] = [];
  if (observation.profile !== scenario.expectedProfile)
    failures.push(`expected profile ${scenario.expectedProfile}, observed ${observation.profile}`);
  for (const required of scenario.required)
    if (!observation.events.includes(required))
      failures.push(`missing required event: ${required}`);
  for (const forbidden of scenario.forbidden)
    if (observation.events.includes(forbidden)) failures.push(`forbidden event: ${forbidden}`);
  if (observation.questions > scenario.maxQuestions)
    failures.push(`questions ${observation.questions} exceed ${scenario.maxQuestions}`);
  if (observation.artifacts > scenario.maxArtifacts)
    failures.push(`artifacts ${observation.artifacts} exceed ${scenario.maxArtifacts}`);
  return {
    scenario: scenario.id,
    passed: failures.length === 0,
    failures,
    metrics: { questions: observation.questions, artifacts: observation.artifacts },
  };
}

export function markdownReport(results: readonly ScenarioResult[]): string {
  const passed = results.filter((result) => result.passed).length;
  const lines = [
    '# Evaluation report',
    '',
    `Passed: ${passed}/${results.length}`,
    '',
    '| Scenario | Result | Failures |',
    '| --- | ---: | --- |',
  ];
  for (const result of results)
    lines.push(
      `| ${result.scenario} | ${result.passed ? 'pass' : 'fail'} | ${result.failures.join('; ') || '—'} |`,
    );
  return `${lines.join('\n')}\n`;
}

export function summarizeRuns(samples: readonly RunSample[]): RunSummary {
  const summarizeMetric = (values: number[]) =>
    values.length === 0
      ? undefined
      : {
          mean: values.reduce((sum, value) => sum + value, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
        };
  const successes = samples.filter((sample) => sample.result.passed).length;
  return {
    runs: samples.length,
    successes,
    successRate: samples.length === 0 ? 0 : successes / samples.length,
    duration: summarizeMetric(
      samples.flatMap((sample) => (sample.durationMs === undefined ? [] : [sample.durationMs])),
    ),
    tokens: summarizeMetric(
      samples.flatMap((sample) => (sample.tokens === undefined ? [] : [sample.tokens])),
    ),
    tools: summarizeMetric(
      samples.flatMap((sample) => (sample.tools === undefined ? [] : [sample.tools])),
    ),
    interventions: summarizeMetric(
      samples.flatMap((sample) =>
        sample.interventions === undefined ? [] : [sample.interventions],
      ),
    ),
  };
}
