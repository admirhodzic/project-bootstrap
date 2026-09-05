import { readFile } from 'node:fs/promises';
import { hashBytes } from './hash.js';
import { readManifest } from './manifest.js';
import { resolveContainedPath } from './paths.js';

export interface DriftItem {
  destination: string;
  state: 'current' | 'missing' | 'modified';
}
export interface DoctorReport {
  healthy: boolean;
  installed: boolean;
  files: DriftItem[];
}

export async function inspectInstallation(root: string): Promise<DoctorReport> {
  const manifest = await readManifest(root);
  if (manifest === undefined) return { healthy: false, installed: false, files: [] };
  const files: DriftItem[] = [];
  for (const file of manifest.files) {
    const target = await resolveContainedPath(root, file.destination);
    try {
      const current = hashBytes(await readFile(target));
      files.push({
        destination: file.destination,
        state: current === file.hash ? 'current' : 'modified',
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      files.push({ destination: file.destination, state: 'missing' });
    }
  }
  return { healthy: files.every((file) => file.state === 'current'), installed: true, files };
}
