import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type {
  FileOperation,
  InstallManifest,
  MutationPlan,
  Platform,
  Profile,
  RegistryEntry,
} from '../types.js';
import { UserError } from './errors.js';
import { hashBytes } from './hash.js';
import { manifestPath, readManifest, serializeManifest } from './manifest.js';
import { resolveContainedPath } from './paths.js';

async function readOptional(path: string): Promise<Buffer | undefined> {
  try {
    return await readFile(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

export async function buildInstallPlan(options: {
  root: string;
  sourceRoot: string;
  entries: readonly RegistryEntry[];
  packageVersion: string;
  profile: Profile;
  platforms: Platform[];
  command: 'init' | 'update' | 'migrate';
  now?: string;
}): Promise<MutationPlan> {
  const previous = await readManifest(options.root);
  const previousByPath = new Map(previous?.files.map((file) => [file.destination, file]));
  const operations: FileOperation[] = [];
  const files: InstallManifest['files'][number][] = [];

  for (const entry of options.entries) {
    if (entry.destination === undefined) continue;
    const destination = entry.destination.replaceAll('\\', '/');
    const sourcePath = join(options.sourceRoot, ...entry.source.split('/'));
    const content = await readFile(sourcePath);
    const desiredHash = hashBytes(content);
    const target = await resolveContainedPath(options.root, destination);
    const existing = await readOptional(target);
    const prior = previousByPath.get(destination);
    let operation: FileOperation;

    if (existing === undefined) {
      operation = {
        action: 'create',
        source: entry.source,
        destination,
        reason: 'target does not exist',
        content,
        hash: desiredHash,
      };
    } else {
      const currentHash = hashBytes(existing);
      if (currentHash === desiredHash) {
        operation = {
          action: 'retain',
          source: entry.source,
          destination,
          reason: 'already current',
          hash: desiredHash,
        };
      } else if (prior !== undefined && currentHash === prior.hash) {
        operation = {
          action: 'update',
          source: entry.source,
          destination,
          reason: 'managed file is unchanged locally',
          content,
          hash: desiredHash,
        };
      } else {
        operation = {
          action: 'conflict',
          source: entry.source,
          destination,
          reason: 'existing file is unknown or locally modified',
          content,
          hash: desiredHash,
        };
      }
    }
    operations.push(operation);
    if (operation.action === 'conflict' && prior !== undefined) {
      files.push(prior);
    } else if (
      operation.action !== 'conflict' &&
      !(operation.action === 'retain' && prior === undefined)
    )
      files.push({ source: entry.source, destination, hash: desiredHash });
  }

  return {
    root: options.root,
    command: options.command,
    operations,
    manifest: {
      schemaVersion: 1,
      packageVersion: options.packageVersion,
      installedAt: options.now ?? new Date().toISOString(),
      profile: options.profile,
      platforms: options.platforms,
      files,
    },
  };
}

export async function buildUninstallPlan(root: string): Promise<MutationPlan> {
  const manifest = await readManifest(root);
  if (manifest === undefined)
    throw new UserError('No Project Bootstrap installation manifest was found.');
  const operations: FileOperation[] = [];
  const retained: typeof manifest.files = [];
  for (const file of manifest.files) {
    const target = await resolveContainedPath(root, file.destination);
    const existing = await readOptional(target);
    if (existing === undefined) {
      operations.push({
        action: 'retain',
        destination: file.destination,
        reason: 'managed file is already absent',
      });
    } else if (hashBytes(existing) === file.hash) {
      operations.push({
        action: 'remove',
        destination: file.destination,
        reason: 'managed file is unchanged',
      });
    } else {
      operations.push({
        action: 'conflict',
        destination: file.destination,
        reason: 'managed file was modified; retaining it',
      });
      retained.push(file);
    }
  }
  return {
    ...({ root, command: 'uninstall', operations } as const),
    ...(retained.length > 0 ? { manifest: { ...manifest, files: retained } } : {}),
  };
}

async function atomicWrite(path: string, content: Uint8Array): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.project-bootstrap-${process.pid}-${Date.now()}.tmp`;
  await writeFile(temporary, content, { flag: 'wx' });
  try {
    await rename(temporary, path);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

export async function applyPlan(plan: MutationPlan): Promise<void> {
  const backups = new Map<string, Buffer | undefined>();
  const touched: string[] = [];
  try {
    for (const operation of plan.operations) {
      if (
        operation.action !== 'create' &&
        operation.action !== 'update' &&
        operation.action !== 'remove'
      )
        continue;
      const target = await resolveContainedPath(plan.root, operation.destination);
      backups.set(target, await readOptional(target));
      touched.push(target);
      if (operation.action === 'remove') await rm(target, { force: true });
      else if (operation.content !== undefined) await atomicWrite(target, operation.content);
    }

    const targetManifest = await resolveContainedPath(plan.root, manifestPath);
    backups.set(targetManifest, await readOptional(targetManifest));
    touched.push(targetManifest);
    if (plan.manifest === undefined) await rm(targetManifest, { force: true });
    else await atomicWrite(targetManifest, Buffer.from(serializeManifest(plan.manifest)));

    for (const operation of plan.operations.filter(
      (item) => item.action === 'conflict' && item.content !== undefined,
    )) {
      const candidate = await resolveContainedPath(
        plan.root,
        `.project-bootstrap/candidates/${operation.destination}`,
      );
      backups.set(candidate, await readOptional(candidate));
      touched.push(candidate);
      await atomicWrite(candidate, operation.content!);
    }
  } catch (error) {
    for (const target of touched.reverse()) {
      const prior = backups.get(target);
      if (prior === undefined) await rm(target, { force: true });
      else await atomicWrite(target, prior);
    }
    throw error;
  }
}

export function formatPlan(plan: MutationPlan): string {
  const lines = [`Project Bootstrap ${plan.command} plan for ${plan.root}`];
  for (const operation of plan.operations)
    lines.push(
      `${operation.action.toUpperCase().padEnd(8)} ${operation.destination} — ${operation.reason}`,
    );
  return lines.join('\n');
}
