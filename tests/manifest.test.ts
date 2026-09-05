import { describe, expect, it } from 'vitest';
import { parseManifest, serializeManifest } from '../src/core/manifest.js';

const valid = {
  schemaVersion: 1 as const,
  packageVersion: '2.0.0',
  installedAt: '2026-09-03T00:00:00.000Z',
  profile: 'standard' as const,
  platforms: ['codex' as const],
  files: [{ source: 'AGENTS.md', destination: 'AGENTS.md', hash: 'a'.repeat(64) }],
};

describe('manifest', () => {
  it('round trips schema version 1', () =>
    expect(parseManifest(serializeManifest(valid))).toEqual(valid));
  it('rejects invalid JSON', () => expect(() => parseManifest('{')).toThrow(/valid JSON/u));
  it('fails safely on unknown versions', () =>
    expect(() => parseManifest('{"schemaVersion":2}')).toThrow(/compatible release|migration/u));
  it('rejects traversal destinations', () =>
    expect(() =>
      parseManifest(
        JSON.stringify({ ...valid, files: [{ ...valid.files[0], destination: '../x' }] }),
      ),
    ).toThrow(/unsafe/u));
});
