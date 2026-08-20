---
layer: technique
type: technique
subject: operator-surfaces-for-llm-spend
technique: agent-prompts-as-dashboards
status: forged
laws: [never-present-absence-as-an-answer]
shared_with: []
use_when:
  - packaging recurring operator journeys for a conversational agent
  - deciding what a spend tool's prompt catalog should contain
---

# Agent prompts as dashboards

When a conversational agent is wired to a spend store's read tools, the
recurring operator questions — "what did we spend, are we near any limit",
"who is losing me money", "did the latest run regress" — become the agent-era
equivalent of a saved dashboard. The technique: **ship each journey as a named
prompt over the agent-tool protocol, so the platform surfaces it as a
command, and write each prompt as a small operating procedure: which read
tools to call, in what order, and how to frame the result.**

## What a journey prompt contains

Each prompt resolves, with its arguments woven in, to a single instruction
with three parts:

1. **Tool plan.** The exact read tools to call, named, with the arguments the
   operator supplied. The prompt removes the model's tool-selection
   uncertainty for the common case — the journey is deterministic even though
   the narration is generated.
2. **Presentation contract.** "Present the returned table **verbatim** — it is
   already formatted." The render layer owns the numbers; the model's job is
   framing, not re-tabulation, because a model that re-renders a table will
   eventually re-round, re-order, or hallucinate a row. The verbatim rule is
   what lets the single render layer's guarantees survive the agent surface.
3. **Analytic framing.** The judgment the operator actually wants, stated as
   instructions keyed to the renderer's own signals: call out any rule
   breached or at ≥80% of its threshold, naming metric and window; call out
   every loss-glyph row; state whether the latest run regressed versus the
   prior. Close with a synthesis of fixed shape — the single biggest driver,
   plus one concrete lever (reprice, cap with a limit rule, move to a cheaper
   model) *only when the data supports it*, e.g. when one model dominates
   spend.

## Graceful degradation is part of the contract

A journey invoked without its identifying argument must not error. The prompt
degrades one level: call the listing tool first and either proceed across all
entities or ask the operator which one they meant. The most common invocation
of any command is the bare one; a journey that dead-ends on missing arguments
trains the operator back into ad-hoc questioning, which is exactly the
inconsistency the catalog exists to remove. Degrading to a listing also honors
the domain's absence discipline — the journey reports "here is what exists,
which did you mean" rather than fabricating a scope or answering as if the
argument had a default the operator never chose.

## Decision rules

- Catalog size follows the operator's week, not the API's surface. Seven
  journeys that each answer a real recurring question beat thirty generated
  wrappers. Add a journey when the same multi-tool question has been asked
  ad hoc three times.
- Journeys are read-only by construction: a prompt never instructs a write
  tool, even where writes are enabled. A "dashboard" that mutates on view is
  a trap; remediation is a separate, human-initiated act.
- Keep thresholds in prompts aligned with the renderer's glyph rules, and
  state them numerically in the prompt anyway — the model should not need to
  reverse-engineer the band from colors.
- Version prompts with the tools they name. A renamed tool with a stale
  prompt catalog fails on its first step, on every invocation, for every
  operator at once.
- Each prompt carries a one-line description good enough to be its menu entry;
  the catalog listing is itself a surface and should read like a dashboard
  index.

## When not to use it

Do not encode one-off investigations as journeys — the catalog is for
recurring shapes, and a prompt nobody re-runs is maintenance surface without
audience. Do not use journey prompts to compensate for a missing report: if
the framing instructions are doing arithmetic the store should do ("sum these
three tables"), the gap is in the API, and the prompt will paper over it with
generated math that is wrong exactly when it matters. And where the operator
population includes people who must not see a given report at all, a prompt is
not an access control — entitlement lives in the tools and the API keys, never
in the phrasing of the journey.
