import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { parseObservation, redactSecrets, runLiveEvaluation } from '../src/core/live-evals.js';
import type { Scenario } from '../src/core/evals.js';

const roots: string[] = [];
const scenario: Scenario = {
  schemaVersion: 1,
  id: 'runner-test',
  category: 'safety',
  prompt: 'Return a safe observation.',
  expectedProfile: 'quick',
  required: ['verified'],
  forbidden: ['unsafe'],
  maxQuestions: 0,
  maxArtifacts: 0,
};

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe('live evaluation runner', () => {
  it('runs a non-shell driver repeatedly and writes redacted reports', async () => {
    const root = await mkdtemp(join(tmpdir(), 'project-bootstrap-live-test-'));
    roots.push(root);
    const fakeToken = ['npm', 'abcdefghijklmnopqrstuvwxyz123456'].join('_');
    const driver = `process.stdin.resume(); process.stdout.write(JSON.stringify({profile:'quick',events:['verified'],questions:0,artifacts:0,tokens:12,tools:1,interventions:0})); process.stderr.write('${fakeToken}');`;
    const artifacts = await runLiveEvaluation({
      root,
      scenario,
      scenarioRevision: 'abc123',
      frameworkVersion: '2.0.0-beta.0',
      platform: 'fixture',
      agent: 'fake-agent',
      agentVersion: '1.0.0',
      command: process.execPath,
      args: ['-e', driver],
      repetitions: 3,
      timeoutMs: 5000,
      spendCeilingUsd: 0,
      outputRoot: 'runs',
      allowedEnvironment: [],
      credentialBoundary: 'No credentials supplied.',
    });

    expect(artifacts.report.summary).toMatchObject({
      runs: 3,
      successes: 3,
      successRate: 1,
      tokens: { mean: 12, min: 12, max: 12 },
      tools: { mean: 1, min: 1, max: 1 },
      interventions: { mean: 0, min: 0, max: 0 },
    });
    expect(await readFile(artifacts.markdown, 'utf8')).toContain('Passed: 3/3');
    const raw = await readFile(join(artifacts.directory, 'raw', 'run-1.json'), 'utf8');
    expect(raw).toContain('[REDACTED_NPM_TOKEN]');
    expect(raw).not.toContain(fakeToken);
  });

  it('rejects malformed observations and unsafe run limits', async () => {
    expect(() => parseObservation('{}')).toThrow(/contract/u);
    expect(() =>
      parseObservation(
        JSON.stringify({ profile: 'quick', events: [], questions: -1, artifacts: 0 }),
      ),
    ).toThrow(/contract/u);
    expect(redactSecrets('Bearer abc.def.ghi')).toBe('Bearer [REDACTED]');
    await expect(
      runLiveEvaluation({
        root: process.cwd(),
        scenario,
        scenarioRevision: 'abc123',
        frameworkVersion: '2',
        platform: 'fixture',
        agent: 'fake-agent',
        agentVersion: '1',
        command: process.execPath,
        args: [],
        repetitions: 21,
        timeoutMs: 5000,
        spendCeilingUsd: 0,
        outputRoot: 'evals/runs',
        allowedEnvironment: [],
        credentialBoundary: 'None.',
      }),
    ).rejects.toThrow(/Repetitions/u);
  });

  it('rejects a fixture that is not a directory', async () => {
    const root = await mkdtemp(join(tmpdir(), 'project-bootstrap-live-test-'));
    roots.push(root);
    await writeFile(join(root, 'fixture.txt'), 'not a directory', 'utf8');

    await expect(
      runLiveEvaluation({
        root,
        scenario,
        scenarioRevision: 'abc123',
        frameworkVersion: '2',
        platform: 'fixture',
        agent: 'fake-agent',
        agentVersion: '1',
        command: process.execPath,
        args: [],
        repetitions: 1,
        timeoutMs: 5000,
        spendCeilingUsd: 0,
        outputRoot: 'runs',
        fixture: 'fixture.txt',
        allowedEnvironment: [],
        credentialBoundary: 'None.',
      }),
    ).rejects.toThrow(/must be a directory/u);
  });
});
