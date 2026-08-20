---
layer: application
type: application
subject: degrade-never-block-a-candidate
technique: never-cache-a-degraded-verdict
stack: node
status: forged
---

# Cacheability as a property of provenance — TypeScript

Two caches in KP hold model-produced judgments about people, and each solves the
freezing problem a different way. Together they show both halves of the technique: the
write-side refusal, and the key-side separation.

## Write-side refusal: per-match reasoning

`app/_lib/reasoning-cache-policy.ts:1-24` is the whole policy, kept DB-free so it is
unit-testable in isolation. `reasoning_cli` tags every payload with a `source`:
`"llm"` when the model produced the rationale, `"deterministic"` when the provider was
unavailable or its call failed and it fell back to the local template. The contract
(`reasoning-cache-policy.ts:8-15`):

> Policy: only an *authoritative* LLM verdict is cacheable. Freezing a deterministic
> fallback for the full TTL (168h) would serve a low-quality rationale for a week with
> no way to upgrade once the provider returns — the silent staleness trap this
> contract exists to close.

`CACHEABLE_REASONING_SOURCE = "llm"` and `isCacheableReasoning(payload)` implement it
as a predicate at the write. The recovery mechanism is the cheap one the technique
recommends: the deterministic verdict is still returned to the caller, just never
stored, so the first request after the provider recovers recomputes, gets an `"llm"`
verdict, and caches that. Lazy invalidation falls out of never having written.

The producing side matches. `pipeline/jobfit/match_reasoning.py:300` — `_coerce()` —
returns `(reasoning, degraded)` where `degraded` is True when **the core of the
result (verdict + strengths)** came from the deterministic template rather than the
model, which the caller reports as `source="deterministic"`. That is the technique's
"the degraded part that carries the conclusion colours the whole payload" rule, and
the comment states its purpose exactly: "so a coerced-away answer can never pose as
LLM output".

## Key-side separation: automation drafting

The automation cache took the other route — it caches degraded output, so it must key
on the grade. `app/_lib/automation-cache-key.ts:62-70` documents the incident that
forced it:

> The two produce materially different output under ONE key otherwise: a
> quota-exhausted workspace's stubs kept serving for the full 168h TTL after the
> allowance reset, and a quota exhaustion re-served a stale LLM result as if it were
> the degraded template. `payload.source` recorded which — the key did not.

Both directions of the poisoning, in one comment. Two implementation details are the
generalizable craft:

- **Folded unconditionally**, not only when `degraded` is true, so entries written
  before the axis existed — the ones that may already be poisoned — are retired by the
  key change itself.
- **Resolved before the key, not at spawn time.** `app/_lib/automation-run.ts:212`
  computes `const degraded = !meterAllows("ai_candidates", { workspace: workspaceId })`
  once; the same boolean feeds the cache-key axis at `automation-run.ts:227` and the
  `--no-llm` CLI flag at `automation-run.ts:242`, "so they can't disagree".

`app/_lib/automation-cache-key.test.ts:183` pins it: *"THE FIX: a degraded (--no-llm)
result never shares a key with an LLM result."*

Note the tenancy detail at `automation-run.ts:207-209` and `enforce.ts:99-103`: the
degrade switch reads the *asking* workspace's billing state. Before the workspace axis
existed, every tenant's automation degrade was decided by the default workspace's plan
— one team's candidates ran on another team's quota.

## Deviations from the standard

- **No incident-window sweep.** The standard asks that degraded entries produced during
  an incident be actively invalidated and recomputed on recovery. Both caches here rely
  on lazy repair — reasoning by never writing, automation by key separation — which
  limits damage but does not proactively re-run the candidates processed in the window.
  The standard stays.
- **No degraded-write metric.** Neither cache counts uncacheable results, so a week of
  weak instrument is not visible as an operational signal.
