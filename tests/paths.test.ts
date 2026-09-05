import { mkdtemp, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { rm } from 'node:fs/promises';
import { normalizeRelativePath, resolveContainedPath } from '../src/core/paths.js';

const roots: string[] = [];
afterEach(async () =>
  Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))),
);

describe('safe paths', () => {
  it.each(['../escape', 'a/../../escape', '/absolute', 'C:\\absolute', './dot', 'a//b'])(
    'rejects %s',
    (path) => expect(() => normalizeRelativePath(path)).toThrow(),
  );

  it('accepts portable relative paths', () =>
    expect(normalizeRelativePath('.agents\\skills\\x.md')).toBe('.agents/skills/x.md'));

  it('resolves a new target within the root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'pb-path-'));
    roots.push(root);
    await expect(resolveContainedPath(root, 'a/b.md')).resolves.toBe(join(root, 'a', 'b.md'));
  });

  it('rejects an existing symlink that exits the root when supported', async () => {
    const parent = await mkdtemp(join(tmpdir(), 'pb-link-'));
    roots.push(parent);
    const root = join(parent, 'root');
    const outside = join(parent, 'outside');
    await mkdir(root);
    await mkdir(outside);
    try {
      await symlink(
        outside,
        join(root, 'linked'),
        process.platform === 'win32' ? 'junction' : 'dir',
      );
    } catch {
      return;
    }
    await expect(resolveContainedPath(root, 'linked/file.md')).rejects.toThrow(/symlink|junction/u);
  });
});
