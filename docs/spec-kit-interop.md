# ADR: Spec Kit interoperability

- Status: Accepted for beta
- Decision date: 2026-09-03

## Context

Spec Kit and Project Bootstrap may both create specifications, plans, and tasks. Two authoritative state trees would drift.

## Decision

Use coexistence/import, not a second copy. Existing Spec Kit artifacts become inputs to Project Bootstrap skills. Install only missing workflows/adapters. The manifest never owns Spec Kit artifacts.

## Fixture walkthrough

Given `.specify/specs/001-feature/spec.md` and `plan.md`, select rigor by risk, reference those files from task/handoff state, install `AGENTS.md` and skills, and do not make a second active spec. Update/uninstall cannot alter `.specify/`.

## Consequences

This prevents duplicated authority and supports gradual adoption. Future import/export needs an explicit schema and round-trip-loss analysis.
