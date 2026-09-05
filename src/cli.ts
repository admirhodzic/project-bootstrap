#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectPlatforms } from './core/detect.js';
import { inspectInstallation } from './core/doctor.js';
import { UserError } from './core/errors.js';
import { applyPlan, buildInstallPlan, buildUninstallPlan, formatPlan } from './core/file-plan.js';
import { readManifest } from './core/manifest.js';
import { entriesFor } from './core/registry.js';
import { validateContent } from './core/validate.js';
import { platforms, type Platform, type Profile } from './types.js';

type Command =
  'init' | 'update' | 'validate' | 'doctor' | 'uninstall' | 'migrate' | 'help' | 'version';
interface Options {
  command: Command;
  root: string;
  sourceRoot: string;
  selected?: Platform[];
  profile: Profile | undefined;
  dryRun: boolean;
  json: boolean;
}

const cliDirectory = dirname(fileURLToPath(import.meta.url));
const defaultSourceRoot = resolve(cliDirectory, '..');

function usage(): string {
  return `Project Bootstrap

Usage: project-bootstrap <command> [options]

Commands:
  init       Install canonical workflows without overwriting existing files
  update     Update unchanged managed files; emit candidates for conflicts
  validate   Validate canonical content, budgets, and skill contracts
  doctor     Inspect an installation and report drift
  uninstall  Remove only unchanged managed files
  migrate    Safely install v2 alongside a copied or customized v1

Options:
  --root <path>          Target project (default: current directory)
  --source <path>        Package/content root (advanced)
  --platform <list>      Comma-separated platform adapters
  --profile <name>       quick, standard, deep, or incident
  --dry-run              Print the complete plan without writing
  --json                 Emit machine-readable output
  --help                 Show help
  --version              Show package version`;
}

function valueAfter(args: string[], index: number, name: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith('--'))
    throw new UserError(`${name} requires a value.`);
  return value;
}

function parseArgs(args: string[]): Options {
  let command: Command = 'help';
  let root = process.cwd();
  let sourceRoot = defaultSourceRoot;
  let profile: Profile | undefined;
  let dryRun = false;
  let json = false;
  let selected: Platform[] | undefined;
  const first = args[0];
  if (first === '--help' || first === '-h')
    return { command: 'help', root, sourceRoot, profile, dryRun, json };
  if (first === '--version' || first === '-v')
    return { command: 'version', root, sourceRoot, profile, dryRun, json };
  if (first !== undefined) {
    if (!['init', 'update', 'validate', 'doctor', 'uninstall', 'migrate'].includes(first))
      throw new UserError(`Unknown command: ${first}`);
    command = first as Command;
  }
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--dry-run') dryRun = true;
    else if (arg === '--json') json = true;
    else if (arg === '--root') {
      root = resolve(valueAfter(args, index, arg));
      index += 1;
    } else if (arg === '--source') {
      sourceRoot = resolve(valueAfter(args, index, arg));
      index += 1;
    } else if (arg === '--profile') {
      const value = valueAfter(args, index, arg);
      if (!['quick', 'standard', 'deep', 'incident'].includes(value))
        throw new UserError(`Unknown profile: ${value}`);
      profile = value as Profile;
      index += 1;
    } else if (arg === '--platform') {
      const values = valueAfter(args, index, arg).split(',');
      if (values.some((value) => !platforms.includes(value as Platform)))
        throw new UserError(`Unknown platform in: ${values.join(',')}`);
      selected = [...new Set(values as Platform[])];
      index += 1;
    } else if (arg === '--help' || arg === '-h') command = 'help';
    else throw new UserError(`Unknown option: ${arg}`);
  }
  return {
    command,
    root,
    sourceRoot,
    ...(selected === undefined ? {} : { selected }),
    profile,
    dryRun,
    json,
  };
}

async function packageVersion(sourceRoot: string): Promise<string> {
  const value = JSON.parse(await readFile(resolve(sourceRoot, 'package.json'), 'utf8')) as {
    version?: unknown;
  };
  if (typeof value.version !== 'string') throw new UserError('Package version is missing.');
  return value.version;
}

function output(value: unknown, json: boolean): void {
  process.stdout.write(`${json ? JSON.stringify(value, null, 2) : String(value)}\n`);
}

async function run(args: string[]): Promise<void> {
  const options = parseArgs(args);
  if (options.command === 'help') {
    output(usage(), false);
    return;
  }
  if (options.command === 'version') {
    output(await packageVersion(options.sourceRoot), false);
    return;
  }
  if (options.command === 'validate') {
    const report = await validateContent(options.sourceRoot);
    output(
      options.json
        ? report
        : report.valid
          ? `Valid: ${report.checked} registry entries checked.`
          : report.issues
              .map((issue) => `${issue.code}: ${issue.file ?? ''} ${issue.message}`)
              .join('\n'),
      options.json,
    );
    if (!report.valid) process.exitCode = 1;
    return;
  }
  if (options.command === 'doctor') {
    const detected = await detectPlatforms(options.root);
    const report = await inspectInstallation(options.root);
    const result = { ...report, detected };
    const details = report.files
      .filter((file) => file.state !== 'current')
      .map((file) => `${file.state.toUpperCase()} ${file.destination}`)
      .join('\n');
    output(
      options.json
        ? result
        : `${report.healthy ? 'Installation is healthy.' : report.installed ? 'Installation has drift.' : 'No installation manifest found.'}\nDetected platforms: ${detected.join(', ')}${details ? `\n${details}` : ''}`,
      options.json,
    );
    if (!result.healthy) process.exitCode = 1;
    return;
  }
  const previous = options.command === 'update' ? await readManifest(options.root) : undefined;
  const selectedPlatforms =
    options.selected ?? previous?.platforms ?? (await detectPlatforms(options.root));
  let plan =
    options.command === 'uninstall'
      ? await buildUninstallPlan(options.root)
      : await buildInstallPlan({
          root: options.root,
          sourceRoot: options.sourceRoot,
          entries: entriesFor(selectedPlatforms),
          packageVersion: await packageVersion(options.sourceRoot),
          profile: options.profile ?? previous?.profile ?? 'standard',
          platforms: selectedPlatforms,
          command: options.command,
        });
  if (options.command === 'migrate') {
    try {
      await readFile(resolve(options.root, 'AGENT.md'));
      plan = {
        ...plan,
        operations: [
          {
            action: 'retain',
            destination: 'AGENT.md',
            reason: 'legacy v1 file detected; preserving it for manual reconciliation',
          },
          ...plan.operations,
        ],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  output(options.json ? plan : formatPlan(plan), options.json);
  if (!options.dryRun) await applyPlan(plan);
}

run(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = error instanceof UserError ? error.exitCode : 1;
});
