---
layer: technique
type: technique
subject: budget-reallocation-prescription
technique: guardrails-simulate-approve-revert
status: forged
laws: [a-gate-before-money-and-copy, provenance-is-binary-and-labelled]
shared_with: []
use_when: [building or reviewing the path from a recommendation to a live account, deciding what blocks an apply and what merely warns, designing a revert that restores rather than inverts]
---

# Guardrails, simulate, approve, revert

Between a prescription and a live account stands one lifecycle, and it is the same
lifecycle whether the moves came from a recommender, an alert, or a person typing
a number. The steps are ordered and none is optional: simulate, check guardrails,
require explicit approval, write a reversible ledger, capture prior state, apply,
settle honestly, and revert from snapshots. The law names it; this technique is
its construction.

## The change set

A change set is the unit of governance: a small list of moves with their
simulation, its confidence, the calibration that shaped it, its guardrail
violations, and its lifecycle state. Every move is self-describing - both ends'
names, ratios, the donor's period spend, the network each end belongs to - so the
set read back a month later still says what it proposed and why. A set is
single-network by construction; a move whose donor and recipient sit on different
networks is two unrelated writes wearing one move's clothes, and the guardrail
refuses it even before any recommender can emit one.

## Guardrails

A guardrail is a blast-radius cap, and it blocks. Convention gives three: a
maximum amount per move, a maximum number of moves per set, and no cross-network
shift. The per-move cap reads a pause's amount as its period spend and a keyword
move's amount as the query's period spend, because the cap means "the size of what
this touches" everywhere. A breach is a human-readable sentence, never an
exception; the set stores its breaches and shows them before approval; and an
approval of a breaching set without an explicit override is refused with the
breaches attached. Overridden sets are marked as such in the ledger forever. A
guardrail that merely warns is decoration.

## Approval and apply

Approval is a human act. Nothing in this lifecycle applies on a schedule, on a
threshold, or on a confidence score. The apply loop runs once per set under a
claim, and the claim is what makes two concurrent approvals safe: exactly one
proceeds, the other is a no-op.

The forward apply performs *relative* budget shifts - lower the donor by a delta,
raise the recipient by what the donor gave - and relative writes are not
idempotent. So a stranded claim (an actor that crashed mid-loop, detected by a
claim older than a stated time-to-live) is never re-run. It is recovered to a
terminal state chosen by the evidence the crashed loop left behind: the loop
persists each move's result and snapshots incrementally, so a stranded set that
carries snapshots demonstrably landed moves and recovers to `applied`, revertable
through those snapshots; only a snapshot-less stranded set recovers to `failed`.
A claim that cannot be dated counts as stale - one we cannot date is one we must be
able to recover, never one that blocks forever.

Settling is honest: a set where every move failed is `failed`, never `applied`,
because it captured no snapshots and must not offer a bogus revert; any move
landing makes the set `applied`.

## Snapshots and revert

Before each budget write, the prior value of every touched budget is captured; before
each pause, the prior serving state; for a keyword move, the created criterion
itself, because a created thing has no prior value and the only handle a revert has
is what was made. A revert restores those exact values - an absolute write - and is
therefore idempotent, which is why a stranded *revert* claim can safely be
re-claimed and re-run where a stranded apply cannot. Where a budget appears in
several snapshots, the earliest wins, so a revert lands on the state before the
first move rather than on an intermediate one.

A revert with nothing to restore is refused. The alternative - applying inverse
shifts for moves that never landed - re-reads current budgets, re-floors the donor,
and moves real money the other way for a change that did not happen. A set settles
`reverted` only when the whole restore landed; any failure keeps it `applied` so the
operator can retry, and the one state where a retry is needed is exactly the one
where it is safe.

## The ledger

Every live write, successful or failed, produces an audit entry under the same
scope as the campaigns it touched, with the amounts actually moved, the prior
values, and the actor. A failed recipient write rolls the donor back and still
writes its entry, so a half-applied shift is never a zero-trace event. History is
never rewritten; a schema change adds a discriminant and tolerates its absence.

## Decision rules

- When a set breaches any guardrail, block the apply until a person overrides,
  because a warning on a money-moving screen is read as a suggestion.
- When a set has no restore snapshots, refuse the revert, because reverting a set
  that never landed moves real money the wrong way.
- When a claim is stale and the set carries snapshots, recover to `applied`, never
  to `failed`, because a `failed` status that denies money actually moved leaves a
  throttled donor with no path back.
- When the data under a set is sample, degraded or illustrative, refuse to create
  the set at all, because `provenance-is-binary-and-labelled` forbids a real
  account write on disclosed illustrative numbers.
- When a set was staged off an alert, resolve the alert on apply and keep the
  back-reference, so the diagnosis and the action are one record.

## When NOT to use

- For advisory surfaces that never write: a report that says "consider moving
  budget" needs the projection and its confidence, not the lifecycle.
- As a substitute for the pacing and learning-period judgement: the gate stops a
  large move from applying without a yes; it does not know whether the move is
  wise. That is the projection's label and the marketer's read.
- Where an account offers a native experiment or a draft-and-apply flow with its
  own rollback: use the native one and ledger the fact, rather than building a
  second revert on top of a first.
