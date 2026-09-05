#!/usr/bin/env node
import { resolve } from 'node:path';
import { gradeScenario, loadFixtures, loadScenarios } from './core/evals.js';

const root = resolve(process.argv[2] ?? '.');
Promise.all([loadScenarios(root), loadFixtures(root)])
  .then(([scenarios, fixtures]) => {
    const byId = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
    const results = fixtures.map((fixture) => {
      const scenario = byId.get(fixture.scenario);
      if (scenario === undefined)
        throw new Error(`Fixture references unknown scenario: ${fixture.scenario}`);
      const result = gradeScenario(scenario, fixture.observation);
      return {
        scenario: fixture.scenario,
        expectedPass: fixture.expectedPass,
        actualPass: result.passed,
        matched: fixture.expectedPass === result.passed,
      };
    });
    const valid = results.every((result) => result.matched);
    process.stdout.write(
      `${JSON.stringify({ valid, count: scenarios.length, scenarios: scenarios.map((item) => item.id), fixtures: results }, null, 2)}\n`,
    );
    if (!valid) process.exitCode = 1;
  })
  .catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
