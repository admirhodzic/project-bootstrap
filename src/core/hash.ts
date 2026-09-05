import { createHash } from 'node:crypto';

export function normalizeText(value: string): string {
  return value.replace(/\r\n?/gu, '\n');
}

export function hashBytes(value: Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}

export function hashText(value: string): string {
  return hashBytes(Buffer.from(normalizeText(value), 'utf8'));
}
