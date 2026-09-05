import { describe, expect, it } from 'vitest';
import { validateContent } from '../src/core/validate.js';

describe('content validation', () => {
  it('validates the canonical registry', async () => {
    const report = await validateContent(process.cwd());
    expect(report.issues).toEqual([]);
    expect(report.valid).toBe(true);
  });
});
