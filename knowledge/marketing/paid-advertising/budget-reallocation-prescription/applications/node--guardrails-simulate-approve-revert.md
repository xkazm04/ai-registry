---
layer: application
type: application
subject: budget-reallocation-prescription
technique: guardrails-simulate-approve-revert
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The change-set gate - guardrails, claims, snapshots and revert in a Czech adtech workspace

At commit `2893314930546ed3a314a19a155bcf2f8841a0ea` (2026-09-08) the gate lives
in `src/lib/campaigns/control-plane-types.ts` (pure policy and lifecycle
decisions), `src/lib/campaigns/mutations.ts` (the live writes with their audit)
and `src/lib/campaigns/budget-math.ts` (the floor and the move plan). The policy
and lifecycle functions are fixture-tested under Node 24 without a live account.

## Guardrails block; they do not warn

`DEFAULT_POLICY` at `control-plane-types.ts:30` is `{ maxMoveAmountCzk: 50_000, maxMoves: 3 }`
with an optional `crossSource` flag (lines 12-28) that is off by default.
`checkPolicy` (299-329) returns human-readable Czech sentences, never throws, and
the approval lifecycle treats a non-empty result as blocking: `GuardrailError`
(35-41) is thrown on approval without an explicit override, and the route turns it
into a 422 carrying the violations. `overridden` (line 217) is stamped on a set
applied despite breaches. The cross-network arm (309-321) refuses a shift whose
`fromSource` and `toSource` differ, with the comment that such a move "is two
unrelated writes wearing one move's clothes" and that the rail exists "before it
is reachable". `moveAmountViolation` (335-349) reads a pause's amount as its period
spend and a criterion move's as the query's - the cap means "the size of what this
touches" for every kind.

`test-unit/campaigns-control-plane-local-store.test.mjs:247` pins that a
guardrail-violating set refuses to apply and leaves no claim behind.

## The structural fact: relative apply is not idempotent, absolute restore is

This is the asymmetry the whole lifecycle is built around, and the tree states it
twice. `planApproveClaim` (500-516) proceeds only from `pending`; a stranded
`applying` claim (older than `CLAIM_TTL_MS`, 10 minutes, line 178) is *never
re-run* - the comment at 494-499: "the forward apply performs RELATIVE budget
shifts (not idempotent)". It is recovered to `applied` when `hasRestoreSnapshots`
is true and to `failed` otherwise, because the apply loop persists each move's
snapshots incrementally and a set carrying snapshots "demonstrably landed moves on
the live account". `planRevertClaim` (521-533) is the mirror: an `applied` set
proceeds only with snapshots, else `refuse`; a stranded `reverting` claim is
re-claimed and re-run, "safe because the restore is an ABSOLUTE snapshot write".

`settledApplyStatus` (441-443) lands `failed` only when every move failed;
`settledRevertStatus` (452-460) lands `reverted` only when budget, resume and
criterion restores all succeeded, else keeps `applied` so the operator can retry.
`isStaleClaim` (428-433) treats a missing or unparseable stamp as stale - "a claim
we can't date is one we must be able to recover, never one that blocks forever".

`NoSnapshotsError` (42-51) documents the incident behind the refuse rule:
reverting a snapshot-less set "used to fall back to applying REAL inverse budget
shifts for moves that never happened; that is now refused outright". The suite
pins the two concurrent-approve and concurrent-revert races at
`campaigns-control-plane-local-store.test.mjs:265` and `:294` (exactly one runs the
loop) and revert-from-snapshots at `:216`.

## Snapshots are captured per write, and the earliest wins

`mutations.ts` plans each shift through `planBudgetMove` (`budget-math.ts:56-67`)
with the `MIN_DAILY_MICROS` floor of 10 CZK/day (line 8, "the donor is never
dropped below this daily budget, so it keeps serving"), then `planShift`
(`mutations.ts:200-243`) produces the two writes plus both ends' prior values as
snapshots. Whole-koruna budgets on the second network round the donor once and
fund the recipient with exactly what the rounded donor gave up (lines 224-236),
refusing with `at_min` when rounding swallows the move. The apply order at
mutations 305-320: donor lowered first, recipient raised second; a failed recipient
write rolls the donor back to its captured value and still writes a failed-shift
audit doc. `dedupeSnapshots` (`budget-math.ts:81-87`) keeps the first, prior-most
value per budget so a revert lands on the pre-set state, and `restoreBudgets`
(mutations 383-426) refuses a set whose snapshots belong to another network rather
than half-restoring.

Every write - pause, resume, shift, restore, criterion add, criterion remove -
appends to the `mutations` audit sub-collection under the same project-scoped
tenant as the campaigns (mutations 20-26, 55), with "history is never rewritten".

## Human-triggered only

`mutations.ts:3` - "Human-triggered only (never automatic), live-account only".
Sample or degraded syncs skip alerting, the money verdict and change-set creation
upstream (`src/lib/campaigns/sync.ts:98-193`, per the paid scout), which is the
provenance law at the gate.

## Deviation

The gate knows nothing about *when* a set is applied: no minimum interval between
sets touching the same campaign, no learning-period hold after a large change, and
no seasonality check on the apply day. The technique leaves those to the
projection's confidence label and the marketer's judgement and records here that
the workspace does the same.
