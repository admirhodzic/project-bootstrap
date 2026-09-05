export const platforms = [
  'codex',
  'copilot',
  'cursor',
  'cline',
  'windsurf',
  'claude',
  'gemini',
  'aider',
] as const;

export type Platform = (typeof platforms)[number];
export type Profile = 'quick' | 'standard' | 'deep' | 'incident';
export type RegistryCategory =
  'instruction' | 'skill' | 'template' | 'agent' | 'adapter' | 'legacy';

export interface RegistryEntry {
  readonly id: string;
  readonly category: RegistryCategory;
  readonly source: string;
  readonly destination?: string;
  readonly platform?: Platform;
  readonly install: boolean;
}

export interface ManagedFile {
  readonly source: string;
  readonly destination: string;
  readonly hash: string;
}

export interface InstallManifest {
  readonly schemaVersion: 1;
  readonly packageVersion: string;
  readonly installedAt: string;
  readonly profile: Profile;
  readonly platforms: Platform[];
  readonly files: ManagedFile[];
}

export type PlanAction = 'create' | 'update' | 'retain' | 'conflict' | 'remove';

export interface FileOperation {
  readonly action: PlanAction;
  readonly source?: string;
  readonly destination: string;
  readonly reason: string;
  readonly content?: Uint8Array;
  readonly hash?: string;
}

export interface MutationPlan {
  readonly root: string;
  readonly command: 'init' | 'update' | 'uninstall' | 'migrate';
  readonly operations: FileOperation[];
  readonly manifest?: InstallManifest;
}

export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly file?: string;
}

export interface ValidationReport {
  readonly valid: boolean;
  readonly checked: number;
  readonly issues: ValidationIssue[];
}
