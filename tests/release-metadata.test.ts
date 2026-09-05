import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  name: string;
  version: string;
};

function run(tag: string) {
  return spawnSync(process.execPath, ['scripts/release-metadata.mjs', tag], {
    encoding: 'utf8',
  });
}

describe('release metadata validation', () => {
  it('emits package metadata for the matching release tag', () => {
    const result = run(`v${packageJson.version}`);
    const prerelease = packageJson.version.split('-', 2)[1];
    const expectedNpmTag = prerelease ? prerelease.split('.', 1)[0] : 'latest';

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`package-name=${packageJson.name}\n`);
    expect(result.stdout).toContain(`package-version=${packageJson.version}\n`);
    expect(result.stdout).toContain(`npm-tag=${expectedNpmTag}\n`);
  });

  it('rejects a tag that does not match the package version', () => {
    const result = run(`v${packageJson.version}-mismatch`);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('does not match package version');
  });
});
