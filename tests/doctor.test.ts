import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { inspectInstallation } from '../src/core/doctor.js';
import { applyPlan, buildInstallPlan } from '../src/core/file-plan.js';
import type { RegistryEntry } from '../src/types.js';

const roots: string[] = [];
afterEach(async () =>
  Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))),
);

describe('doctor', () => {
  it('reports no installation, healthy content, and drift', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'pb-doctor-'));
    roots.push(parent);
    const root = join(parent, 'root');
    const sourceRoot = join(parent, 'source');
    await mkdir(root);
    await mkdir(sourceRoot);
    expect(await inspectInstallation(root)).toMatchObject({ installed: false, healthy: false });
    await writeFile(join(sourceRoot, 'source.md'), 'managed\n');
    const entry: RegistryEntry = {
      id: 'x',
      category: 'instruction',
      source: 'source.md',
      destination: 'x.md',
      install: true,
    };
    const plan = await buildInstallPlan({
      root,
      sourceRoot,
      entries: [entry],
      packageVersion: '2',
      profile: 'standard',
      platforms: ['codex'],
      command: 'init',
    });
    await applyPlan(plan);
    expect(await inspectInstallation(root)).toMatchObject({ healthy: true });
    await writeFile(join(root, 'x.md'), 'changed\n');
    const report = await inspectInstallation(root);
    expect(report.healthy).toBe(false);
    expect(report.files[0]?.state).toBe('modified');
  });
});
