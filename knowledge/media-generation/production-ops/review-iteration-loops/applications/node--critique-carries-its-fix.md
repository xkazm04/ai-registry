---
layer: application
type: application
subject: review-iteration-loops
technique: critique-carries-its-fix
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Node: an extract loop that already refuses to iterate on a shrug

The Gravitone style-extraction engine (`lib/foundry/extract/` in the
`gravitone-gcloud` repo) runs a critique loop over generated replicas: an
image is scored against a target style, a vision model returns a critique,
and the next round regenerates from a rewritten recipe. It is a machine
consuming its own review findings, which is the regime this technique is
written for.

## What the tree already confirms

The constructive half is enforced at the schema, not by convention.
`CRITIQUE_SCHEMA` marks both `critique` (the finding) and `recipe_fix` (the
repair) as **required**, so a critique that identifies without repairing
cannot be returned at all. `usableFix()` then gates adoption twice: a fix
under 40 characters is a shrug, and a fix identical to the current recipe
would "spend a round to learn nothing."

The consequence is the strongest form of the rule available: at
`replicaSettled`, a round whose critique carries no usable fix **ends the
loop**. The unactionable finding is never allowed to drive a regeneration.
Nobody wrote this from the technique — the engine reached it independently,
which is what makes it evidence rather than an echo.

## The asymmetry the A/B found

`replicaSettled` returns a bare boolean, and four different causes reach that
`true`: the round cap, a generation failure, the target being met, and no
usable fix. Downstream, `doneUnits` credits any settled replica with the full
round cap — and the project's own commit message for the progress-strip fix
(2026-08-29) states the justification: counting rounds at their cap "is what
lets a loop that meets its target early finish the strip early rather than
late." The accounting was designed around **target-met**. The other three
causes ride the same path and take the same credit.

So a replica abandoned because the critic could not say what to change is
accounted identically to one that succeeded in half the rounds.

## A/B

Both arms run the shipped predicates verbatim (types stripped) under the
shipped `DEFAULT_OPTIONS` — `rounds: 2`, `target: 0.85` — over four replicas,
one per settle cause, each having taken one of its two rounds. Predicate
stated before running: how many causes a manifest consumer can recover, and
what progress credit an abandoned loop takes against a completed one.

| | arm A (shipped) | arm B (settle reason recorded) |
|---|---|---|
| settle causes recoverable | **1 of 4** | **3 of 4** |
| credit: target-met | 2 | 2 |
| credit: no-usable-fix | 2 | 1 |
| over-credit across 3 abandoned replicas | **3 units never performed** | 0 |

Verdict **better**, on the second measure rather than the first: recovering
the cause is worth little on its own, but the progress strip is charged for
three units of work nobody did, and under-reporting-then-snapping is the
precise dishonesty that commit already exists to remove. The same file has
now paid for this class twice — the earlier fix corrected a ceiling that made
`done` unreachable; this is the same arithmetic drifting in the other
direction, from a cause the boolean cannot see.

## What this realization cannot do

The harness runs the predicates, not the engine: it says what the accounting
does with a settle, not how often each cause occurs in real runs. The share
of replicas that settle unactionably is the number that decides whether this
is worth a change, and no persisted manifest in the tree records it — which
is itself the finding, since a bare boolean is exactly what prevents the
count. The instrument that would settle it is a settle-cause field on the
round, which is arm B.

Nothing here tests the demotion's *routing* claim either. The engine has one
consumer of a settled replica; a pipeline that surfaced investigations to a
human alongside blocking findings would exercise the half this tree does not
have.
