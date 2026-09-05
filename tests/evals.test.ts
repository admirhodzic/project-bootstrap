import { describe, expect, it } from 'vitest';
import {
  gradeScenario,
  loadFixtures,
  loadScenarios,
  markdownReport,
  parseScenario,
  summarizeRuns,
} from '../src/core/evals.js';

describe('behavioral evaluations', () => {
  it('loads all initial scenarios', async () =>
    expect(await loadScenarios(process.cwd())).toHaveLength(15));
  it('loads deterministic safe and unsafe fixtures', async () =>
    expect(await loadFixtures(process.cwd())).toHaveLength(4));
  it('rejects malformed scenarios', () => expect(() => parseScenario('{}')).toThrow(/schema/u));
  it('catches unsafe and over-ceremonial observations', async () => {
    const scenario = (await loadScenarios(process.cwd())).find(
      (item) => item.id === 'external-write',
    )!;
    const result = gradeScenario(scenario, {
      profile: 'deep',
      events: ['external-write'],
      questions: 2,
      artifacts: 2,
    });
    expect(result.passed).toBe(false);
    expect(result.failures).toHaveLength(5);
  });
  it('accepts a conforming observation and renders a report', async () => {
    const scenario = (await loadScenarios(process.cwd())).find(
      (item) => item.id === 'external-write',
    )!;
    const result = gradeScenario(scenario, {
      profile: 'quick',
      events: ['read-only-review'],
      questions: 0,
      artifacts: 0,
    });
    expect(result.passed).toBe(true);
    expect(markdownReport([result])).toContain('Passed: 1/1');
  });
  it('summarizes repeated runs with dispersion', async () => {
    const scenario = (await loadScenarios(process.cwd()))[0]!;
    const result = gradeScenario(scenario, {
      profile: scenario.expectedProfile,
      events: scenario.required,
      questions: 0,
      artifacts: 0,
    });
    const summary = summarizeRuns([
      {
        frameworkVersion: '2',
        agent: 'fixture',
        scenarioRevision: '1',
        result,
        durationMs: 10,
        tokens: 100,
        tools: 1,
        interventions: 0,
      },
      {
        frameworkVersion: '2',
        agent: 'fixture',
        scenarioRevision: '1',
        result: { ...result, passed: false },
        durationMs: 30,
        tokens: 300,
        tools: 3,
        interventions: 2,
      },
    ]);
    expect(summary).toMatchObject({
      runs: 2,
      successes: 1,
      successRate: 0.5,
      duration: { mean: 20, min: 10, max: 30 },
      tokens: { mean: 200, min: 100, max: 300 },
      tools: { mean: 2, min: 1, max: 3 },
      interventions: { mean: 1, min: 0, max: 2 },
    });
  });
});
