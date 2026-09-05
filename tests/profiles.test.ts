import { describe, expect, it } from 'vitest';
import { selectProfile } from '../src/core/profiles.js';

describe('adaptive workflow selector', () => {
  it.each([
    [{ urgentIncident: true }, 'incident'],
    [{ securitySensitive: true }, 'deep'],
    [{ greenfield: true }, 'deep'],
    [{ externalSideEffects: true }, 'deep'],
    [{ localized: true }, 'quick'],
    [{ readOnly: true }, 'quick'],
    [{}, 'standard'],
  ] as const)('classifies %o as %s', (factors, expected) =>
    expect(selectProfile(factors)).toBe(expected),
  );
});
