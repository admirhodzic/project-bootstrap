import type { Profile } from '../types.js';

export interface WorkFactors {
  urgentIncident?: boolean;
  securitySensitive?: boolean;
  destructive?: boolean;
  externalSideEffects?: boolean;
  greenfield?: boolean;
  architectural?: boolean;
  ambiguous?: boolean;
  localized?: boolean;
  readOnly?: boolean;
}

export function selectProfile(factors: WorkFactors): Profile {
  if (factors.urgentIncident) return 'incident';
  if (
    factors.securitySensitive ||
    factors.destructive ||
    factors.externalSideEffects ||
    factors.greenfield ||
    factors.architectural ||
    factors.ambiguous
  )
    return 'deep';
  if (factors.localized || factors.readOnly) return 'quick';
  return 'standard';
}
