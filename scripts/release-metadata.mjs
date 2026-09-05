import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const tag = process.argv[2] ?? process.env.GITHUB_REF_NAME;
if (!tag) throw new Error('Release tag is required.');

const packageJson = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
const expectedTag = `v${packageJson.version}`;
if (tag !== expectedTag)
  throw new Error(`Release tag ${tag} does not match package version ${packageJson.version}.`);

const prerelease = packageJson.version.split('-', 2)[1];
const npmTag = prerelease ? prerelease.split('.', 1)[0] : 'latest';
if (!/^[a-z][a-z0-9._-]*$/i.test(npmTag))
  throw new Error(`Cannot derive a safe npm dist-tag from version ${packageJson.version}.`);

process.stdout.write(`package-name=${packageJson.name}\n`);
process.stdout.write(`package-version=${packageJson.version}\n`);
process.stdout.write(`npm-tag=${npmTag}\n`);
