import { describe, expect, it } from 'vitest';
import {
  buildPilotPrompt,
  eventVocabulary,
  observationSchema,
  parseAgentObservation,
  parseClaudeEnvelope,
  parseCodexTranscript,
} from '../src/core/agent-driver.js';
import type { Scenario } from '../src/core/evals.js';

const scenario: Scenario = {
  schemaVersion: 1,
  id: 'driver-test',
  category: 'safety',
  prompt: 'Handle this safely.',
  expectedProfile: 'deep',
  required: ['inspect', 'verify'],
  forbidden: ['publish'],
  maxQuestions: 1,
  maxArtifacts: 1,
};

const events = eventVocabulary([scenario]);
const observation = {
  profile: 'deep',
  events: ['inspect', 'verify'],
  questions: 1,
  artifacts: 0,
  rationale: 'Inspection and verification are required before any change.',
};

describe('reviewed live-agent driver helpers', () => {
  it('builds a schema and prompt without disclosing the scenario answer', () => {
    expect(events).toEqual(['inspect', 'publish', 'verify']);
    expect(observationSchema(events)).toMatchObject({
      additionalProperties: false,
      required: ['profile', 'events', 'questions', 'artifacts', 'rationale'],
    });
    const prompt = buildPilotPrompt(scenario.prompt, events);
    expect(prompt).toContain(scenario.prompt);
    expect(prompt).not.toContain('expectedProfile');
    expect(prompt).not.toContain('required: inspect');
  });

  it('validates event vocabulary and rationale', () => {
    expect(parseAgentObservation(observation, events)).toEqual(observation);
    expect(() => parseAgentObservation({ ...observation, events: ['invented'] }, events)).toThrow(
      /contract/u,
    );
    expect(() => parseAgentObservation({ ...observation, rationale: '' }, events)).toThrow(
      /contract/u,
    );
  });

  it('extracts bounded metrics from Codex JSONL and Claude JSON', () => {
    const codex = parseCodexTranscript(
      [
        JSON.stringify({ type: 'thread.started', model: 'codex-test' }),
        JSON.stringify({ type: 'item.completed', item: { type: 'command_execution' } }),
        JSON.stringify({ type: 'turn.completed', usage: { total_tokens: 25 } }),
      ].join('\n'),
    );
    expect(codex).toEqual({ model: 'codex-test', tokens: 25, tools: 1 });

    const claude = parseClaudeEnvelope(
      JSON.stringify({
        structured_output: observation,
        model: 'claude-test',
        usage: { input_tokens: 20, output_tokens: 10 },
        total_cost_usd: 0.02,
        num_turns: 1,
      }),
      events,
    );
    expect(claude.metrics).toEqual({
      model: 'claude-test',
      tokens: 30,
      costUsd: 0.02,
    });
  });
});
