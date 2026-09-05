import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { InstallManifest, ManagedFile, Platform, Profile } from '../types.js';
import { UserError } from './errors.js';
import { normalizeRelativePath } from './paths.js';

export const manifestPath = '.project-bootstrap/manifest.json';

function isManagedFile(value: unknown): value is ManagedFile {
  if (typeof value !== 'object' || value === null) return false;
  const file = value as Record<string, unknown>;
  return (
    typeof file.source === 'string' &&
    typeof file.destination === 'string' &&
    /^[a-f0-9]{64}$/u.test(String(file.hash))
  );
}

function managedFiles(value: unknown): ManagedFile[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result: ManagedFile[] = [];
  for (const item of value) {
    if (!isManagedFile(item)) return undefined;
    result.push(item);
  }
  return result;
}

export function parseManifest(text: string): InstallManifest {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new UserError(
      'Installation manifest is not valid JSON; repair or move it before continuing.',
    );
  }
  if (typeof value !== 'object' || value === null)
    throw new UserError('Installation manifest must be an object.');
  const record = value as Record<string, unknown>;
  if (record.schemaVersion !== 1) {
    throw new UserError(
      `Unsupported installation manifest schema ${String(record.schemaVersion)}; use a compatible release or migration.`,
    );
  }
  const files = managedFiles(record.files);
  if (
    typeof record.packageVersion !== 'string' ||
    typeof record.installedAt !== 'string' ||
    typeof record.profile !== 'string' ||
    !Array.isArray(record.platforms) ||
    files === undefined
  ) {
    throw new UserError('Installation manifest does not match schema version 1.');
  }
  for (const file of files) normalizeRelativePath(file.destination);
  return {
    schemaVersion: 1,
    packageVersion: record.packageVersion,
    installedAt: record.installedAt,
    profile: record.profile as Profile,
    platforms: record.platforms as Platform[],
    files,
  };
}

export async function readManifest(root: string): Promise<InstallManifest | undefined> {
  try {
    return parseManifest(await readFile(join(root, ...manifestPath.split('/')), 'utf8'));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

export function serializeManifest(manifest: InstallManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
