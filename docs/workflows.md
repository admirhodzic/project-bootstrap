# Workflow profiles and examples

## Quick

Use for a read-only answer, documentation correction, formatting, or localized reversible fix. Inspect the affected area, change it, and run a focused check. Do not create a specification or backlog unless requested.

## Standard

Use for ordinary features and bugs. State observable acceptance criteria, make a short dependency-aware plan, implement within scope, run focused checks while iterating, then run broader relevant verification.

## Deep

Use for greenfield systems, architecture, migration, authentication, payments, destructive behavior, external writes, or sensitive data. Make requirements and non-goals explicit, model threats and risks, compare consequential alternatives, stage rollout/rollback, and seek independent review.

## Incident

Use for an urgent regression. Reproduce, contain impact, apply the smallest safe correction, run targeted regression checks, and record non-urgent follow-up work.

## Examples

- Greenfield: inspect supplied assets and constraints, clarify only product/security decisions, write a spec and threat model, plan a vertical slice, then establish runnable verification.
- Brownfield: inspect current instructions, Git state, manifests, representative code, and tests; preserve architecture and conventions; add only artifacts justified by the feature.
- Quick fix: correct the bounded defect, run the relevant linter or test, and report the exact evidence without producing process documents.
- Security-sensitive change: identify assets, actors, entry points, privileges, and data flow; map high risks to controls/tests; block completion on unresolved Critical/High findings.

The user may request a profile. Explain a material escalation or de-escalation based on scope, ambiguity, reversibility, security, and external side effects.
