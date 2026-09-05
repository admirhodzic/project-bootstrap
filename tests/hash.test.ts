import { describe, expect, it } from 'vitest';
import { hashBytes, hashText, normalizeText } from '../src/core/hash.js';

describe('hashing', () => {
  it('normalizes text line endings when requested', () => {
    expect(normalizeText('a\r\nb\rc')).toBe('a\nb\nc');
    expect(hashText('a\r\nb\n')).toBe(hashText('a\nb\n'));
  });

  it('hashes raw bytes deterministically', () => {
    expect(hashBytes(Buffer.from('hello'))).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });
});
