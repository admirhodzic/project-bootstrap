#!/usr/bin/env node

const observations = {
  'quick-doc-fix': {
    profile: 'quick',
    events: ['focused-check'],
    questions: 0,
    artifacts: 1,
    tools: 1,
    interventions: 0,
  },
};

const scenario = process.argv[2];
const observation = observations[scenario];
if (!observation) {
  process.stderr.write(`Fake driver has no observation for scenario: ${String(scenario)}\n`);
  process.exitCode = 2;
} else {
  process.stdout.write(`${JSON.stringify(observation)}\n`);
}
