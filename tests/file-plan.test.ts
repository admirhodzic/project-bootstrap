import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { applyPlan, buildInstallPlan, buildUninstallPlan } from '../src/core/file-plan.js';
import { readManifest } from '../src/core/manifest.js';
import type { RegistryEntry } from '../src/types.js';

const roots: string[] = [];
afterEach(async () =>
  Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))),
);
const entry: RegistryEntry = {
  id: 'test',
  category: 'instruction',
  source: 'source.md',
  destination: 'AGENTS.md',
  install: true,
};

async function fixture(): Promise<{ root: string; sourceRoot: string }> {
  const parent = await mkdtemp(join(tmpdir(), 'pb-plan-'));
  roots.push(parent);
  const root = join(parent, 'target');
  const sourceRoot = join(parent, 'source');
  await mkdir(root);
  await mkdir(sourceRoot);
  await writeFile(join(sourceRoot, 'source.md'), 'version one\n');
  return { root, sourceRoot };
}

async function plan(root: string, sourceRoot: string, command: 'init' | 'update' = 'init') {
  return buildInstallPlan({
    root,
    sourceRoot,
    entries: [entry],
    packageVersion: '2.0.0',
    profile: 'standard',
    platforms: ['codex'],
    command,
    now: '2026-09-03T00:00:00.000Z',
  });
}

describe('file plans', () => {
  it('supports dry planning with no writes, then installs and manifests', async () => {
    const { root, sourceRoot } = await fixture();
    const initial = await plan(root, sourceRoot);
    expect(initial.operations[0]?.action).toBe('create');
    await expect(readFile(join(root, 'AGENTS.md'))).rejects.toMatchObject({ code: 'ENOENT' });
    await applyPlan(initial);
    expect(await readFile(join(root, 'AGENTS.md'), 'utf8')).toBe('version one\n');
    expect((await readManifest(root))?.files).toHaveLength(1);
  });

  it('updates unchanged managed content', async () => {
    const { root, sourceRoot } = await fixture();
    await applyPlan(await plan(root, sourceRoot));
    await writeFile(join(sourceRoot, 'source.md'), 'version two\n');
    const update = await plan(root, sourceRoot, 'update');
    expect(update.operations[0]?.action).toBe('update');
    await applyPlan(update);
    expect(await readFile(join(root, 'AGENTS.md'), 'utf8')).toBe('version two\n');
  });

  it('does not adopt ownership of identical pre-existing content', async () => {
    const { root, sourceRoot } = await fixture();
    await writeFile(join(root, 'AGENTS.md'), 'version one\n');
    const initial = await plan(root, sourceRoot);
    expect(initial.operations[0]?.action).toBe('retain');
    await applyPlan(initial);
    expect((await readManifest(root))?.files).toHaveLength(0);
  });

  it('retains a modified file and writes a reviewable candidate', async () => {
    const { root, sourceRoot } = await fixture();
    await applyPlan(await plan(root, sourceRoot));
    await writeFile(join(root, 'AGENTS.md'), 'user customization\n');
    await writeFile(join(sourceRoot, 'source.md'), 'version two\n');
    const update = await plan(root, sourceRoot, 'update');
    expect(update.operations[0]?.action).toBe('conflict');
    await applyPlan(update);
    expect(await readFile(join(root, 'AGENTS.md'), 'utf8')).toBe('user customization\n');
    expect(
      await readFile(join(root, '.project-bootstrap', 'candidates', 'AGENTS.md'), 'utf8'),
    ).toBe('version two\n');
    expect((await readManifest(root))?.files).toHaveLength(1);
  });

  it('uninstalls only unchanged managed content', async () => {
    const { root, sourceRoot } = await fixture();
    await applyPlan(await plan(root, sourceRoot));
    const uninstall = await buildUninstallPlan(root);
    expect(uninstall.operations[0]?.action).toBe('remove');
    await applyPlan(uninstall);
    await expect(readFile(join(root, 'AGENTS.md'))).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('retains modified content during uninstall', async () => {
    const { root, sourceRoot } = await fixture();
    await applyPlan(await plan(root, sourceRoot));
    await writeFile(join(root, 'AGENTS.md'), 'mine\n');
    const uninstall = await buildUninstallPlan(root);
    expect(uninstall.operations[0]?.action).toBe('conflict');
    await applyPlan(uninstall);
    expect(await readFile(join(root, 'AGENTS.md'), 'utf8')).toBe('mine\n');
    expect((await readManifest(root))?.files).toHaveLength(1);
  });
});
