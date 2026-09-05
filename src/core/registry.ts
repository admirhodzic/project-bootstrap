import type { Platform, RegistryEntry } from '../types.js';

const skillNames = [
  'bootstrap-project',
  'specify-change',
  'plan-change',
  'implement-change',
  'review-change',
  'security-review',
  'handoff',
] as const;
const templateNames = ['spec', 'plan', 'task', 'adr', 'risk-register', 'project-state'] as const;
const agentNames = ['reviewer', 'security-reviewer', 'test-runner', 'researcher'] as const;

const adapterFiles: ReadonlyArray<readonly [Platform, string, string]> = [
  [
    'copilot',
    'content/adapters/copilot/copilot-instructions.md',
    '.github/copilot-instructions.md',
  ],
  [
    'cursor',
    'content/adapters/cursor/project-bootstrap.mdc',
    '.cursor/rules/project-bootstrap.mdc',
  ],
  ['cline', 'content/adapters/cline/project-bootstrap.md', '.clinerules/project-bootstrap.md'],
  [
    'windsurf',
    'content/adapters/windsurf/project-bootstrap.md',
    '.windsurf/rules/project-bootstrap.md',
  ],
  ['claude', 'content/adapters/claude/CLAUDE.md', 'CLAUDE.md'],
  ['gemini', 'content/adapters/gemini/GEMINI.md', 'GEMINI.md'],
  ['aider', 'content/adapters/aider/aider.conf.yml', '.aider.conf.yml'],
];

const nativeAgentFiles: ReadonlyArray<readonly [Platform, string, string]> = [
  ['codex', 'content/adapters/codex/reviewer.toml', '.codex/agents/reviewer.toml'],
  [
    'codex',
    'content/adapters/codex/security-reviewer.toml',
    '.codex/agents/security-reviewer.toml',
  ],
  ['codex', 'content/adapters/codex/test-runner.toml', '.codex/agents/test-runner.toml'],
  ['codex', 'content/adapters/codex/researcher.toml', '.codex/agents/researcher.toml'],
  [
    'copilot',
    'content/adapters/copilot/reviewer.agent.md',
    '.github/agents/project-bootstrap-reviewer.agent.md',
  ],
  [
    'copilot',
    'content/adapters/copilot/security-reviewer.agent.md',
    '.github/agents/project-bootstrap-security-reviewer.agent.md',
  ],
];

export const registry: readonly RegistryEntry[] = [
  {
    id: 'root-instructions',
    category: 'instruction',
    source: 'AGENTS.md',
    destination: 'AGENTS.md',
    install: true,
  },
  ...skillNames.map((name) => ({
    id: `skill-${name}`,
    category: 'skill' as const,
    source: `content/skills/${name}/SKILL.md`,
    destination: `.agents/skills/${name}/SKILL.md`,
    install: true,
  })),
  ...templateNames.map((name) => ({
    id: `template-${name}`,
    category: 'template' as const,
    source: `content/templates/${name}.md`,
    destination: `.project-bootstrap/templates/${name}.md`,
    install: true,
  })),
  ...agentNames.map((name) => ({
    id: `agent-${name}`,
    category: 'agent' as const,
    source: `content/agents/${name}.md`,
    destination: `.agents/profiles/${name}.md`,
    install: true,
  })),
  ...adapterFiles.map(([platform, source, destination]) => ({
    id: `adapter-${platform}`,
    category: 'adapter' as const,
    source,
    destination,
    platform,
    install: true,
  })),
  ...nativeAgentFiles.map(([platform, source, destination], index) => ({
    id: `native-agent-${platform}-${index}`,
    category: 'adapter' as const,
    source,
    destination,
    platform,
    install: true,
  })),
  {
    id: 'adapter-codex-note',
    category: 'adapter',
    source: 'content/adapters/codex/AGENTS.md',
    platform: 'codex',
    install: false,
  },
  { id: 'legacy-v1', category: 'legacy', source: 'content/legacy/AGENT-v1.md', install: false },
];

export const contentBudgets = {
  rootInstructions: { bytes: 10 * 1024, lines: 200 },
  skillDescription: { characters: 1024 },
  platforms: {
    codex: {
      bytes: 32 * 1024,
      source: 'https://developers.openai.com/codex/guides/agents-md',
      reviewed: '2026-09-05',
    },
    copilot: {
      bytes: 16 * 1024,
      source:
        'https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot',
      reviewed: '2026-09-03',
    },
    cursor: {
      bytes: 16 * 1024,
      source: 'https://docs.cursor.com/context/rules',
      reviewed: '2026-09-03',
    },
    cline: {
      bytes: 16 * 1024,
      source: 'https://docs.cline.bot/customization/cline-rules',
      reviewed: '2026-09-03',
    },
    windsurf: {
      bytes: 16 * 1024,
      source: 'https://docs.windsurf.com/windsurf/cascade/memories',
      reviewed: '2026-09-03',
    },
    claude: {
      bytes: 16 * 1024,
      source: 'https://code.claude.com/docs/en/memory',
      reviewed: '2026-09-05',
    },
    gemini: {
      bytes: 16 * 1024,
      source: 'https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md',
      reviewed: '2026-09-05',
    },
    aider: {
      bytes: 16 * 1024,
      source: 'https://aider.chat/docs/config/aider_conf.html',
      reviewed: '2026-09-05',
    },
  },
} as const;

export function entriesFor(platforms: readonly Platform[]): RegistryEntry[] {
  return registry.filter(
    (entry) =>
      entry.install && (entry.platform === undefined || platforms.includes(entry.platform)),
  );
}
