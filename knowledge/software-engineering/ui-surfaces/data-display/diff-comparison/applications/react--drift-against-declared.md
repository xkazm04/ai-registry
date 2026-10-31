---
layer: application
type: application
subject: diff-comparison
technique: drift-against-declared
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Drift against declared — execution outcome vs the persona's design expectation

*Re-verified against the project tree at `a2ef6400e` on 2026-08-30: every
citation below resolves at the stated line, and every defect it records —
observation-minted finding ids, the last-50 cap, the missing
resolved-by-observation transition, the uncounted clause coverage — is
still present unchanged. Dry re-check, recorded as one.*

**Re-checked 2026-10-31 at `personas@61029d7ae0`.** The detector and all four
finding-identity defects are unchanged, and their anchors below are moved to
HEAD. **The reader is gone.** On 2026-09-04 the retired design wizard's
helpers were deleted, `useDriftEventsForPersona` and the `DesignTab` wiring
among them. Nothing in `src/` outside the store slice and the middleware now
reads `designDriftEvents` or calls `dismissDriftEvent`. Drift findings are
still computed on every completed run, persisted, and hydrated
(`executionSlice.ts:413`), but no surface renders them. The fix-or-amend
fork's routed half described below is true of `a2ef6400e` only. At HEAD the
finding stream is write-only, so the identity defects cost storage, not
attention.

Two smaller changes. (1) The streak now counts only the *prior* runs, skips a
row still queued or running, and counts `incomplete` as a failure
(`driftMiddleware.ts:36-49`). The old count included the current run, so two
failures in a row fired and three were titled "4 consecutive". (2) An
unpriced run now reaches the kernel as `costUsd: null`, not `0`
(`driftMiddleware.ts:60-63`, `designDrift.ts:29-38`), and the cost clause
guards on it (`:173`). The clause count is still four, and the empty report
still carries no coverage.

The repo has one clean instance of the promise-as-baseline species, and it
is a good teaching case precisely because it gets the *shape* right and
the *finding identity* wrong.

## The species, recognizably

`src/lib/execution/middleware/driftMiddleware.ts` runs at
`frontend_complete` as a registered pipeline middleware (`addMiddleware(
'frontend_complete', { key: 'drift-detection', priority: 30 }, …)`,
`:90-92`) — decoupled from the execution lifecycle by design (module
docstring `:1-10`: "moved from inline code in
`executionSlice.finishExecution`"). Its right side is the observed
outcome (`finalStatus`, `durationMs`, `costUsd`, `errorMessage`,
`recentExecutions`, `:26`); its left side is the persona's **declared
expectation** — `timeout_ms`, `max_budget_usd`, and the parsed
`last_design_result` (`AgentIR`) the design tab produced (`:68-75`). It
answers "where does the run depart from what this persona was designed
to do", not "what changed since last run" — the drift question exactly.

`src/lib/design/designDrift.ts::detectDesignDrift` (`:81-204`) is the
comparison. Against the technique's clauses:

- **Tolerance is part of the declaration.** Timeout drift fires at
  `ratio > 0.8` of the configured timeout on a *completed* run (`:156-158`)
  — a near-miss, not a tripwire at 100 %. Cost drift fires at
  `costRatio > 0.5`, severity stepping up at `> 0.8` (`:173-180`). Both
  thresholds are declared in the kernel, not discovered by alarm fatigue.
- **Directional vocabulary.** `DriftKind` (`:6`) is
  `error_pattern | tool_mismatch | timeout | cost_overrun | repeated_failure`
  — five named departures with per-kind severity, not one "mismatch".
- **The fix-or-amend fork, half present.** Every event names a
  `targetSection` (`errorHandling | toolGuidance | instructions |
  identity`, `:18`) and a `suggestion` that reads as *amend the promise*:
  "Update toolGuidance to add error recovery instructions" (`:109`),
  "Increase timeout_ms or simplify instructions" (`:121`). The surface
  (`DesignTab` via `useDriftEventsForPersona`,
  `src/features/agents/sub_design/libs/designStateHelpers.ts:125-131` at
  `a2ef6400e`, deleted 2026-09-04)
  routes the reader toward the declaration to edit. What is missing is
  the governed half: amending the declaration is an ordinary edit with no
  before/after record that it was done *in response to* the finding.
- **Drift over a series.** `repeated_failure` (`:189-201`) consumes
  `recentFailureCount`, computed from a snapshot captured *before* state
  reset (`driftMiddleware.ts:36-49`, with the comment explaining why) —
  gate-sees-target, honored.

## Where it departs — finding identity

`makeId()` is `` `drift_${Date.now()}_${random}` `` (`designDrift.ts:73-75`).
That is unique per *observation*. The identity the technique demands is
`(declaration clause, subject entity)` — e.g. `(cost_overrun, personaId)`
— stable across runs so run N+1 updates a standing finding. Here, a
persona that consistently spends 60 % of its budget emits one new
`cost_overrun` event per execution; `dismissed: false` is per event
(`:20`), so dismissing one does nothing to the next; and the store keeps
only `events.slice(-50)` (`saveDriftEvents`, `:65-71`) — the last-N cap
the technique predicts, evicting the oldest open findings to make room
for repeats of themselves. Persistence is `localStorage` under
`dolla:design-drift` (`:53`), hydrated into `executionSlice.designDriftEvents`
(`src/stores/slices/agents/executionSlice.ts:413`), and `dismissDriftEvent`
(`:874-880`) flips the flag on one id.

There is no "resolved — no longer observed" transition: a finding is open
until dismissed or evicted, and a persona whose budget was raised keeps
its old `cost_overrun` events until the cap rolls them out.

## Coverage of the empty report

`detectDesignDrift` evaluates four clauses. When `persona.last_design_result`
fails to parse it is silently `null` (`driftMiddleware.ts:51-54`,
`silentCatch`) and the comparison proceeds against a weaker declaration
without saying so; when the whole middleware throws it logs a warning
(`:83-85`) and returns the payload unchanged — no drift events, which the
surface renders identically to "no drift". The technique's coverage
clause ("clauses checked over clauses declared; unevaluated is not
passing") is absent: an execution that produced zero events because the
detector failed and one that produced zero because the persona is healthy
are the same empty list.

## Transplant note

The pipeline-middleware wiring is the transplantable part: a drift
detector that subscribes to a completion stage, reads the declaration
from the entity, and emits typed findings with a `targetSection` is a
pattern any repo with an execution pipeline and per-entity configuration
can host. Carry the identity fix with it — mint the finding id from
`(kind, entityId)` and *update* on re-observation — or the transplant
inherits the alarm stream on day one.
