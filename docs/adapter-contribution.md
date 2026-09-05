# Adapter contribution contract

An adapter contributes platform, tier, official evidence URL/review date, canonical source, native destination, budget, feature flags, and a maintenance owner. Adapter text stays thin: reference `AGENTS.md` and skills instead of duplicating policy.

1. Add source under `content/adapters/<platform>/`.
2. Add one registry mapping with a contained portable destination.
3. Add fixture tests for output, conflicts, scope, and budget.
4. Update compatibility with **documented**, **fixture**, or **live** evidence.
5. State unsupported features. A community adapter cannot claim live-tested or Tier 1 status without evidence and ownership.

The Gemini wrapper and registry entry are the minimal example. No undocumented generator step is required.
