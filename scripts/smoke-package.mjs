import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const input = resolve(process.argv[2] ?? '');
if (!existsSync(input)) throw new Error(`Package artifact not found: ${input}`);

const tarball = statSync(input).isDirectory() ? findTarball(input) : input;

function findTarball(directory) {
  const tarballs = readdirSync(directory)
    .filter((entry) => entry.endsWith('.tgz'))
    .map((entry) => join(directory, entry));
  if (tarballs.length !== 1)
    throw new Error(`Expected exactly one tarball in ${directory}; found ${tarballs.length}.`);
  return tarballs[0];
}

const sandbox = mkdtempSync(join(tmpdir(), 'project-bootstrap-package-'));
const consumer = join(sandbox, 'consumer');
const target = join(sandbox, 'target');
mkdirSync(consumer);
mkdirSync(target);
writeFileSync(join(consumer, 'package.json'), '{"private":true}\n');

function run(command, args, cwd = consumer) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(' ')} failed\n${String(result.error ?? '')}\n${String(result.stdout ?? '')}\n${String(result.stderr ?? '')}`,
    );
  return result.stdout;
}

try {
  if (process.platform === 'win32') {
    const npmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    run(process.execPath, [
      npmCli,
      'install',
      tarball,
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
    ]);
  } else {
    run('npm', ['install', tarball, '--ignore-scripts', '--no-audit', '--no-fund']);
  }
  const packageRoot = join(consumer, 'node_modules', '@admirhodzic', 'project-bootstrap');
  const cli = join(packageRoot, 'dist', 'cli.js');
  if (existsSync(join(packageRoot, 'evals', 'runs')))
    throw new Error('Package includes unreviewed raw live-evaluation runs.');
  run(process.execPath, [cli, '--version']);
  run(process.execPath, [
    cli,
    'init',
    '--root',
    target,
    '--source',
    packageRoot,
    '--platform',
    'codex',
    '--dry-run',
  ]);
  if (existsSync(join(target, '.project-bootstrap', 'manifest.json')))
    throw new Error('Dry run wrote a manifest.');
  run(process.execPath, [
    cli,
    'init',
    '--root',
    target,
    '--source',
    packageRoot,
    '--platform',
    'codex',
  ]);
  if (!existsSync(join(target, 'AGENTS.md'))) throw new Error('Init did not install AGENTS.md.');
  const doctor = run(process.execPath, [cli, 'doctor', '--root', target, '--json']);
  if (!JSON.parse(doctor).healthy) throw new Error('Doctor did not report a healthy installation.');
  writeFileSync(
    join(target, 'AGENTS.md'),
    `${readFileSync(join(target, 'AGENTS.md'), 'utf8')}\nUser customization.\n`,
  );
  run(process.execPath, [
    cli,
    'update',
    '--root',
    target,
    '--source',
    packageRoot,
    '--platform',
    'codex',
  ]);
  if (!existsSync(join(target, '.project-bootstrap', 'candidates', 'AGENTS.md')))
    throw new Error('Update did not emit a conflict candidate.');
  run(process.execPath, [cli, 'uninstall', '--root', target]);
  if (!existsSync(join(target, 'AGENTS.md')))
    throw new Error('Uninstall removed modified user content.');
  process.stdout.write('Packed package smoke test passed.\n');
} finally {
  const resolvedSandbox = resolve(sandbox);
  if (resolvedSandbox.startsWith(resolve(tmpdir())))
    rmSync(resolvedSandbox, { recursive: true, force: true });
}
