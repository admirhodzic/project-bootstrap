import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { Platform } from '../types.js';

const signals: ReadonlyArray<readonly [Platform, string]> = [
  ['copilot', '.github'],
  ['cursor', '.cursor'],
  ['cline', '.clinerules'],
  ['windsurf', '.windsurf'],
  ['claude', 'CLAUDE.md'],
  ['gemini', 'GEMINI.md'],
  ['aider', '.aider.conf.yml'],
  ['codex', '.codex'],
];

export async function detectPlatforms(root: string): Promise<Platform[]> {
  const found: Platform[] = [];
  for (const [platform, signal] of signals) {
    try {
      await stat(join(root, signal));
      found.push(platform);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  return found.length > 0 ? found : ['codex'];
}
