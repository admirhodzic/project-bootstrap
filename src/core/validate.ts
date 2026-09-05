import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { RegistryEntry, ValidationIssue, ValidationReport } from '../types.js';
import { contentBudgets, registry } from './registry.js';
import { normalizeRelativePath } from './paths.js';

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

function frontmatter(text: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---/u.exec(text.replace(/\r\n?/gu, '\n'));
  if (match?.[1] === undefined) return {};
  return Object.fromEntries(
    match[1].split('\n').flatMap((line) => {
      const index = line.indexOf(':');
      return index < 1 ? [] : [[line.slice(0, index).trim(), line.slice(index + 1).trim()]];
    }),
  );
}

export async function validateContent(
  sourceRoot: string,
  entries: readonly RegistryEntry[] = registry,
): Promise<ValidationReport> {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();
  const seenSkills = new Set<string>();
  for (const entry of entries) {
    if (seenIds.has(entry.id))
      issues.push({ code: 'duplicate-id', message: `Duplicate registry id: ${entry.id}` });
    seenIds.add(entry.id);
    if (entry.install && entry.destination === undefined)
      issues.push({
        code: 'missing-destination',
        file: entry.source,
        message: 'Installable registry entry requires a destination.',
      });
    if (entry.destination !== undefined) {
      try {
        normalizeRelativePath(entry.destination);
      } catch (error) {
        issues.push({
          code: 'unsafe-destination',
          file: entry.source,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
    const path = join(sourceRoot, ...entry.source.split('/'));
    if (!(await exists(path))) {
      issues.push({
        code: 'missing-file',
        file: entry.source,
        message: `Registry source is missing: ${entry.source}`,
      });
      continue;
    }
    const content = await readFile(path, 'utf8');
    if (entry.id === 'root-instructions') {
      const bytes = Buffer.byteLength(content);
      const lines = content.replace(/\r\n?/gu, '\n').split('\n').length;
      if (bytes > contentBudgets.rootInstructions.bytes)
        issues.push({
          code: 'budget-bytes',
          file: entry.source,
          message: `AGENTS.md is ${bytes} bytes; limit is ${contentBudgets.rootInstructions.bytes}`,
        });
      if (lines > contentBudgets.rootInstructions.lines)
        issues.push({
          code: 'budget-lines',
          file: entry.source,
          message: `AGENTS.md is ${lines} lines; limit is ${contentBudgets.rootInstructions.lines}`,
        });
    }
    if (entry.category === 'adapter' && entry.platform !== undefined) {
      const budget = contentBudgets.platforms[entry.platform].bytes;
      const bytes = Buffer.byteLength(content);
      if (bytes > budget)
        issues.push({
          code: 'adapter-budget',
          file: entry.source,
          message: `${entry.platform} adapter is ${bytes} bytes; project budget is ${budget}`,
        });
    }
    if (entry.category === 'skill') {
      const meta = frontmatter(content);
      if (!meta.name || !meta.description)
        issues.push({
          code: 'skill-frontmatter',
          file: entry.source,
          message: 'Skill requires name and description frontmatter.',
        });
      if (meta.name && seenSkills.has(meta.name))
        issues.push({
          code: 'duplicate-skill',
          file: entry.source,
          message: `Duplicate skill name: ${meta.name}`,
        });
      if (meta.name) seenSkills.add(meta.name);
      if ((meta.description?.length ?? 0) > contentBudgets.skillDescription.characters)
        issues.push({
          code: 'skill-description-budget',
          file: entry.source,
          message: 'Skill description exceeds catalog budget.',
        });
      for (const section of ['Inputs', 'Workflow', 'Output', 'Verification', 'Stop'])
        if (!content.includes(`## ${section}`))
          issues.push({
            code: 'skill-section',
            file: entry.source,
            message: `Skill is missing section: ${section}`,
          });
    }
  }
  return { valid: issues.length === 0, checked: entries.length, issues };
}
