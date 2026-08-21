---
layer: application
type: application
subject: decision-audit-and-traceability
technique: capture-the-machine-verdict-before-a-human-overwrites-it
stack: node
---

# Sealing the AI verdict before the accept nulls it (TypeScript / Next.js server)

`app/_lib/pipeline-entry-action.ts` is the one canonical move/decide action against a
pipeline entry, shared by the per-entry route (`/api/pipeline/[id]`) and the batch route
(`/api/pipeline/batch`) precisely so the guards that matter cannot diverge between them —
including the seal.

## The field that destroys itself

The header comment at `:38-46` is the technique's failure mode stated as an incident:

> The AI verdict the human is ratifying or overriding. It lives only in the entry's
> `approval_detail` JSON, and the accept/reject write NULLs that column — so unless it is
> read off the pre-write snapshot and sealed here, the pair (what the machine proposed,
> what the human decided) is destroyed by the very act of deciding, and the override rate
> can never be computed after the fact.

`aiVerdict(entry)` (`:48-59`) reads `recommendation` and `confidence` off the **pre-write
snapshot** the action already loaded for its optimistic-concurrency check, and every seal
site takes its values from that call before the mutating write: `:285-286` for the accept
path (`policyVersion: "interview-plan"`, `reasonCode: "accept"`), `:327-328` for the
generic accept/reject path (`policyVersion: "manual"`, `reasonCode: action`). The
`try/catch` returning `{ aiRecommendation: null, aiConfidence: null }` (`:56-58`) is the
standard's "the machine did not run is a distinct state" rule: a plain board move has no
AI verdict behind it, and that is the normal case rather than an error.

## The actor, server-derived

`sealActor` resolves at `:170` — `simActor ? SIM_SEAL_ACTOR : await humanActor()` — and
`humanActor()` (`app/_lib/auth/operator-approver.ts`) reads the signed session cookie and
the users table, **never a request body** (`:33-36`: "a caller must not be able to
attribute a decision to someone else"), returning `null` rather than a guess outside a
request, on a session without a subject, or when the id no longer resolves.

The fallback chain is the three-state rule in production form. `approverIdentity()` prefers
the natural person; absent one, `HUMAN_ROLE_ACTOR = "human:recruiter"` (`:22-24`) is "the
role, which is all a session without identity can honestly assert"; and
`operatorApprover()` (`:7-20`) records the *posture* — `"operator (single-operator
deployment)"` — rather than a name, because the prior hardcoded `"operator (in-app
approval)"` "named NOBODY in the immutable record — the central 'who reviewed this' claim
was a constant string for every in-app commit."

The claimed-actor downgrade rule is `:34-37`: a caller may declare itself the engine via
`actor: "sim"`, but only that known non-human value is honoured, so "the claim can only
DOWNGRADE authority (human → automated) and can never forge a human decision." The
decision-chain vocabulary it maps to is `SIM_SEAL_ACTOR = "auto:sim"`.

## Sealing is a guard, not a side effect

The module header lists "the tamper-evident decision seal" alongside the `expectedStage`
CAS and the terminal-stage 422 as the guards the two routes share (`:22-28`). Seals go
through `sealDecisionSafe` (`app/_lib/decision-record-store.ts:307`), which wraps
`sealDecisionRecord` so a refused append becomes a logged skip rather than a thrown
route — the deliberate trade in this codebase, and the point where it stops short of the
standard's stricter "if the record cannot be sealed, the decision does not happen."

**Deviation, recorded as such:** on this path an unsealable record still commits the move.
The standard's rule stands. The mitigation here is that the only refusal
`sealDecisionRecord` raises is the downgrade guard (`decision-record-store.ts:264-271`),
which is a configuration error rather than a load condition — but a logged skip is still
an unrecorded decision, and a system holding to the standard would fail the action.

## Attribution the aggregate can trust

`app/_lib/decision-attribution.ts` is the one auto/human map, imported by **both** the
per-row badge (client) and the analytics automation rollup (server) "so the per-row label
and the aggregate can never drift" (`:1-8`). The advance split is explicit at `:20-24`:
`actOnPipelineEntry` writes `advanced` for human routes and `auto_advanced` when the caller
passed actor `"system"`, because "a recruiter's gate click must never badge AUTO in the
log."

Two entries there are the standard's rarer rules in code. `screen_wave_holdout`
(`:63-68`) seals the calibration clean arm's *decision not to act*: "Sparing a candidate is
a machine decision about that candidate, so it belongs in the operator's audit trail with
an attribution" — while staying excluded from the candidate-facing projection
(`status-decisions.ts:44`). And `offer_auto_extended` (`:50-53`) is toned amber rather than
neutral because "the machine put an offer in front of a person with no human in the loop"
is the automation event a reviewer most wants to notice.

Reversals seal to the reverser: the reconsider queue (`app/_lib/db/pipeline.ts:846`,
`listReconsiderQueue`) surfaces only entries carrying an `auto_rejected` event, "a manual
human reject is a deliberate decision, not a queue item", and the reinstate writes its own
event under the acting person rather than inheriting the wave's actor.
