---
layer: application
type: application
subject: content-acceptance-tiering
technique: config-complete-vs-runtime-verified
stack: node
---

# Two predicates over one step list

The PoF catalog computes both completion predicates in Node, from persisted step
artifacts, on every read. Nothing is stored: `pipeline_artifacts` holds `status`, `tier`
and `reason` per `(catalog_id, entity_id, step)`, and both predicates are functions of
that table.

## `configComplete` — the separating clause as code

`src/lib/catalog/rollup.ts:17` states the predicate in one comment line:

> Every step is either pass (any tier) or deferred at L3/L4 — i.e. nothing
> pending/failed.

and `summarizeEntity` implements it by counting a separate bucket for the illegal case:

```js
else if (art.status === 'deferred') {
  deferred++;
  if (art.tier !== 'L3' && art.tier !== 'L4') earlyDeferred++;
}
...
configComplete: failed === 0 && pendingTotal === 0 && earlyDeferred === 0,
```

`earlyDeferred` is the technique's deferral line, made countable. A deferral at L0–L2 is
a skipped free check and disqualifies the artifact; a deferral at L3/L4 is legitimate
progression. Note also `missing` — steps the pipeline declares that have no artifact row
at all — folded into `pendingTotal`, so a never-produced step cannot vanish from the
denominator.

## `verified` — gated on a *drained* gate, never on shape

`src/lib/catalog/lifecycle.ts:33` carries the rule and the reason for it in the same
comment block:

> the state is DERIVED from what the pipeline actually persisted — never a manual toggle
> (Rule 4b) — with one rule that must not bend: `verified` is gated on a DRAINED
> runtime/visual gate (an L3/L4 artifact that actually PASSES), never on shape checks
> alone. An entity whose every step is a green L0 shape check is config-complete and
> nothing more; it stops at `wired`, and the evidence sentence SAYS that its runtime is
> unproven. **Deriving a green dot from L0 passes is exactly the lie this derivation
> exists to refuse.**

The derivation counts `gatePasses` and `gatesUndrained` over `GATE_TIERS = ['L3','L4']`,
and produces `testResult: 'pass'` only when `gatePasses > 0`. It then routes through
`resolveTransition('wired', 'verified', testResult)` rather than assigning `verified`
directly — the comment explains why: "so the 'compiles ≠ runs' rule is enforced by
`resolveTransition` and not by a second, drift-prone copy of it." One authority, one
implementation.

The context for the rule: measured 2026-08-19, `catalog_lifecycle` held **0 rows against
817 persisted artifacts / 736 passes**. The stored lifecycle column had never moved
because nothing wrote it; every seed hard-coded `'planned'`. Deriving it was not a
refactor, it was the difference between a dashboard and a decoration.

## The evidence sentence

`evidenceSentence` (same file, line 85) generates the one-line justification per derived
state, from the same counts the predicate used:

- `wired`, gates outstanding — *"config-complete (N/M step(s) pass), but K runtime/visual
  gate(s) are still deferred — runtime UNPROVEN."*
- `wired`, no gates at all — *"config-complete on shape/static checks only — no L3/L4
  gate has been drained, so runtime is UNPROVEN."*
- `verified` — *"config-complete AND K drained L3/L4 gate(s) pass — runtime proven."*
- `generated` — *"every step has produced, but an early-tier deferral holds it below
  config-complete."*

That last one is the `earlyDeferred` bucket surfacing as prose: the reader is told
exactly which clause of the predicate refused.

## The observation must name the artifact it proved

`src/lib/catalog/acceptance/deferred.ts:11` builds the L3 deferral, and its sibling
`entityRuntimeDeferred` exists because of an incident worth reading verbatim:

> Per-entity L3 gate: the artifact's own `data.automationName` names the test that proves
> THIS entity; `fallbackTestName` covers rows that haven't declared one. Exists because a
> pipeline-level hardcoded name let one entity's gate be "proven" by another entity's
> test (Force Push passed on the Fireball test; Knockback on the Burning test —
> 2026-07-22).

A drained gate certified by someone else's run is not evidence. The per-entity name is
what makes `gatePasses` mean anything.

## The deferral reason is the runner's queue

`runtimeDeferred` does not hand-format its reason:

```js
reason: buildRuntimeDeferredReason(testName)
```

with the comment: "The reason string is built by the shared `@/types/observation`
contract so the runner's `parseTestName` reader stays in lockstep with this writer."
`buildRuntimeDeferredReason` and `parseRuntimeDeferredTestName`
(`src/types/observation.ts:174`) are defined adjacently around one
`RUNTIME_DEFERRED_PREFIX` constant — writer and reader, single-sourced. The gate-drain
sweep reads outstanding `deferred` rows, parses the test name back out, and runs it.

## The clean-run invariant, asserted by the walker

`docs/catalog/E2E-COVERAGE.md:38` is where Rule 5 is enforced end to end:

> **Acceptance derives a config-complete terminal status**: `status ∈ {pass, deferred}`,
> never `fail`/`pending`. `pass` for L0/L1/L2 (data/selection/static); `deferred` for
> L3/L4 (runtime/visual, pending a live bridge) — and a `deferred` gate must show a
> reason (Rule 4).

The walker asserts it for every step of every registered pipeline, and asserts the
persisted row is config-complete "in its own right" after a localStorage wipe and
rehydrate — the predicate is checked against server state, not against the screen.
