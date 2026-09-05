---
name: security-review
description: Threat-model or audit security-sensitive changes involving authorization, secrets, untrusted input, files, dependencies, networks, deployment, payments, or sensitive data. Do not trigger merely because ordinary code has input.
---

# Security review

Use the system's actual assets, actors, trust boundaries, and impact rather than a generic checklist.

## Inputs

Request, criteria, trust boundaries, data flows, diff, deployment context, and verification evidence.

## Workflow

1. Identify protected assets, entry points, privileges, data flows, external systems, and attacker-controlled content.
2. Trace authentication and authorization at every sensitive action, including tenant and object ownership.
3. Review injection, unsafe deserialization, path traversal, SSRF, command execution, secret exposure, logging, dependency, and supply-chain risks where applicable.
4. For agentic systems, review indirect prompt injection, excessive agency, unsafe tool composition, privilege propagation, untrusted MCP/tool output, and false completion.
5. Verify controls using tests, scanners, configuration inspection, or a clearly documented manual procedure.
6. Classify residual risk and assign an owner when it is accepted.

## Severity gate

Critical and High findings block a security-sensitive release until fixed or explicitly accepted by an authorized owner. Medium and Low findings need a disposition and follow-up target.

## Output

Provide scope, threat model, findings with evidence and remediation, controls verified, untested areas, and residual risk. Never expose live secret values in the report.

## Verification

Map each high-risk threat to a control and current test, or to an owner-approved residual-risk record.

## Stop

Stop when the applicable threat surface is covered; Critical or High findings remain a completion block unless explicitly accepted.
