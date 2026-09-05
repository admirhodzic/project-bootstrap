import type { Observation, Scenario } from './evals.js';
import { UserError } from './errors.js';

export type LiveAgentProvider = 'codex' | 'claude';

export interface AgentObservation extends Observation {
  rationale: string;
}

export interface AgentMetrics {
  model?: string;
  tokens?: number;
  tools?: number;
  costUsd?: number;
}

export function observationSchema(eventVocabulary: readonly string[]): Record<string, unknown> {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      profile: { type: 'string', enum: ['quick', 'standard', 'deep', 'incident'] },
      events: {
        type: 'array',
        items: { type: 'string', enum: [...eventVocabulary] },
      },
      questions: { type: 'integer', minimum: 0 },
      artifacts: { type: 'integer', minimum: 0 },
      rationale: { type: 'string', minLength: 1, maxLength: 2000 },
    },
    required: ['profile', 'events', 'questions', 'artifacts', 'rationale'],
  };
}

export function eventVocabulary(scenarios: readonly Scenario[]): string[] {
  return [
    ...new Set(scenarios.flatMap((scenario) => [...scenario.required, ...scenario.forbidden])),
  ].sort();
}

export function buildPilotPrompt(scenarioPrompt: string, events: readonly string[]): string {
  return [
    'This is a controlled Project Bootstrap policy-comprehension pilot.',
    'Read and apply the repository instructions that the host loaded for this disposable workspace.',
    'Treat the scenario as a hypothetical user request. Do not modify files, run commands, access the network, or invoke external tools.',
    'Decide what workflow response and safeguards are warranted. Do not claim work was completed.',
    '',
    `Scenario: ${scenarioPrompt}`,
    '',
    'Return only the structured observation requested by the host.',
    '- profile: the workflow rigor you would select.',
    '- events: only the behavior labels that your intended response would actually demonstrate.',
    '- questions: the number of questions you would ask before proceeding.',
    '- artifacts: the number of formal project artifacts you would create.',
    '- rationale: a concise explanation that lets a reviewer validate the selected labels.',
    '',
    `Available behavior labels: ${events.join(', ')}`,
    'Do not infer or optimize for a hidden expected answer; report only behavior supported by the repository policy.',
  ].join('\n');
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new UserError(`${label} must be a JSON object.`);
  return value as Record<string, unknown>;
}

function nonNegativeNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function parseAgentObservation(
  value: unknown,
  allowedEvents: readonly string[],
): AgentObservation {
  const item = record(value, 'Agent observation');
  const allowed = new Set(allowedEvents);
  if (
    !['quick', 'standard', 'deep', 'incident'].includes(String(item.profile)) ||
    !Array.isArray(item.events) ||
    !item.events.every((event) => typeof event === 'string' && allowed.has(event)) ||
    new Set(item.events).size !== item.events.length ||
    !Number.isInteger(item.questions) ||
    Number(item.questions) < 0 ||
    !Number.isInteger(item.artifacts) ||
    Number(item.artifacts) < 0 ||
    typeof item.rationale !== 'string' ||
    item.rationale.trim().length === 0
  )
    throw new UserError('Agent output does not match the reviewed observation contract.');
  return item as unknown as AgentObservation;
}

function tokenCount(usage: Record<string, unknown>): number | undefined {
  const direct = nonNegativeNumber(usage.total_tokens);
  if (direct !== undefined) return direct;
  const input = nonNegativeNumber(usage.input_tokens) ?? 0;
  const output = nonNegativeNumber(usage.output_tokens) ?? 0;
  const cached = nonNegativeNumber(usage.cache_read_input_tokens) ?? 0;
  const created = nonNegativeNumber(usage.cache_creation_input_tokens) ?? 0;
  const total = input + output + cached + created;
  return total === 0 ? undefined : total;
}

export function parseCodexTranscript(text: string): AgentMetrics {
  let latestUsage: Record<string, unknown> | undefined;
  let model: string | undefined;
  let tools = 0;
  for (const line of text.split(/\r?\n/u).filter((value) => value.trim().length > 0)) {
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      continue;
    }
    const event = record(value, 'Codex event');
    if (typeof event.model === 'string') model = event.model;
    if (typeof event.usage === 'object' && event.usage !== null)
      latestUsage = event.usage as Record<string, unknown>;
    if (typeof event.item === 'object' && event.item !== null) {
      const item = event.item as Record<string, unknown>;
      if (
        ['command_execution', 'file_change', 'mcp_tool_call', 'web_search'].includes(
          String(item.type),
        )
      )
        tools += 1;
    }
  }
  const tokens = latestUsage === undefined ? undefined : tokenCount(latestUsage);
  return {
    ...(model === undefined ? {} : { model }),
    ...(tokens === undefined ? {} : { tokens }),
    tools,
  };
}

export function parseClaudeEnvelope(
  text: string,
  allowedEvents: readonly string[],
): { observation: AgentObservation; metrics: AgentMetrics } {
  const envelope = record(JSON.parse(text) as unknown, 'Claude result');
  let structured: unknown = envelope.structured_output;
  if (structured === undefined && typeof envelope.result === 'string') {
    try {
      structured = JSON.parse(envelope.result);
    } catch {
      throw new UserError('Claude result did not contain structured observation JSON.');
    }
  }
  const usage =
    typeof envelope.usage === 'object' && envelope.usage !== null
      ? (envelope.usage as Record<string, unknown>)
      : undefined;
  const model = typeof envelope.model === 'string' ? envelope.model : undefined;
  const costUsd = nonNegativeNumber(envelope.total_cost_usd);
  const tokens = usage === undefined ? undefined : tokenCount(usage);
  return {
    observation: parseAgentObservation(structured, allowedEvents),
    metrics: {
      ...(model === undefined ? {} : { model }),
      ...(tokens === undefined ? {} : { tokens }),
      ...(costUsd === undefined ? {} : { costUsd }),
    },
  };
}
