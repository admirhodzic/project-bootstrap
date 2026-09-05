import { lstat, realpath } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { UserError } from './errors.js';

export function normalizeRelativePath(input: string): string {
  const portable = input.replaceAll('\\', '/');
  if (
    portable.length === 0 ||
    isAbsolute(input) ||
    portable.startsWith('/') ||
    /^[A-Za-z]:/u.test(portable)
  ) {
    throw new UserError(`Destination must be a non-empty relative path: ${input}`);
  }
  const segments = portable.split('/');
  if (segments.some((segment) => segment === '..' || segment === '' || segment === '.')) {
    throw new UserError(`Destination contains an unsafe path segment: ${input}`);
  }
  return segments.join('/');
}

function isWithin(root: string, candidate: string): boolean {
  const rel = relative(root, candidate);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel));
}

async function nearestExisting(path: string): Promise<string> {
  let current = path;
  while (true) {
    try {
      await lstat(current);
      return current;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      const parent = dirname(current);
      if (parent === current) throw new UserError(`No existing ancestor for ${path}`);
      current = parent;
    }
  }
}

export async function resolveContainedPath(
  rootInput: string,
  relativeInput: string,
): Promise<string> {
  const safe = normalizeRelativePath(relativeInput);
  const root = resolve(rootInput);
  const target = resolve(root, ...safe.split('/'));
  if (!isWithin(root, target))
    throw new UserError(`Destination escapes project root: ${relativeInput}`);

  const canonicalRoot = await realpath(root);
  const ancestor = await nearestExisting(target);
  const canonicalAncestor = await realpath(ancestor);
  if (!isWithin(canonicalRoot, canonicalAncestor)) {
    throw new UserError(
      `Destination crosses a symlink or junction outside project root: ${relativeInput}`,
    );
  }
  return target;
}
