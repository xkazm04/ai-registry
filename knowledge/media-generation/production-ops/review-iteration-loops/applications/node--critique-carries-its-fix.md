---
layer: application
type: application
subject: review-iteration-loops
technique: critique-carries-its-fix
stack: node
status: forged
verified_on: 2026-08-31
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node: an extract loop that refuses to iterate on a shrug, and catalogued it anyway

The Gravitone style-extraction engine (`lib/foundry/extract/` in the
`gravitone-gcloud` repo) runs a critique loop over generated replicas: an image
is scored against a target style, a vision model returns a critique, and the
next round regenerates from a rewritten recipe. It is a machine consuming its
own review findings, which is the regime this technique is written for.

## What the tree already confirmed

The constructive half was enforced at the schema, not by convention.
`CRITIQUE_SCHEMA` marks both `critique` (the finding) and `recipe_fix` (the
repair) as **required**, so a critique that identifies without repairing cannot
be returned at all. `usableFix()` then gates adoption twice: a fix under 40
characters is a shrug, and a fix identical to the current recipe would "spend a
round to learn nothing."

The consequence was already the strongest form of the rule: at
`replicaSettled`, a round whose critique carries no usable fix **ends the
loop**. The unactionable finding was never allowed to drive a regeneration.
Nobody wrote that from the technique — the engine reached it independently,
which is what makes it evidence rather than an echo.

## The defect, and one claim that did not survive

`replicaSettled` returned a bare boolean, and four causes reach it:
`round-cap`, `target-met`, `generation-failed`, `no-usable-fix`. Two are
outcomes; two are the loop giving up.

An earlier pass over this seam proposed that the cost lands in progress
accounting — `doneUnits` credits any settled replica the full round cap, so an
abandoned replica is counted as complete. **That reading is wrong and is
recorded here because it was nearly shipped.** The progress strip answers "will
more work happen here", and for that question an abandoned replica *is*
finished; the repo's own probe asserts `doneUnits` "was always right: it equals
what the engine actually did," and it does. Changing that arithmetic would have
reintroduced the stall the 2026-08-29 progress fix removed.

The real cost is one layer further on, in `store.ts`. When a style is kept and
committed to the catalogue, each replica contributes its best-scoring frame as
an **exemplar** — and exemplars are what later generation conditions on. A
replica abandoned at round one because the critic could not say what to change
entered the catalogue as evidence that the recipe works, indistinguishable from
one that hit the target. The finding was routed correctly at the loop and
laundered at the door.

## A/B

Two runs through the real engine on the probe's fixture, identical in every
respect except whether the critic returns a usable `recipe_fix`. Both end with
every replica **below target** (0.8 against 0.85) — one because it gave up at
round one, one because it walked both rounds and never arrived. Measurable
named first: can a consumer of the catalogue tell an abandoned replica from a
completed one?

| arm | instrument | result |
|---|---|---|
| **A** — the proxy available before | best round's score < target | gave-up run **3**, capped run **3** — indistinguishable |
| **B** — the settle reason | `settleReason()` | `no-usable-fix` vs `round-cap`, **3 of 3** replicas classified |

The score cannot separate them because neither run arrived. The difference is
*why* each stopped, which is precisely what the boolean discarded.

Verdict **better**. Shipped: `settleReason` returns the cause on the same
conditions and in the same order; `replicaSettled` delegates to it and is
behaviourally unchanged; the reason travels with the exemplar. **Marked, not
dropped** — a near miss is still material, and dropping it would be a second
silent decision, where the technique asks only that the state be visible and
obligate nothing. Gate: `tsc` clean, lint ratchet at baseline, 387 tests pass.

## What this realization cannot do

It says nothing about how often replicas are abandoned in real runs. The share
is the number that decides whether the marking matters, and no persisted run in
the tree records it — which was itself the finding, since a bare boolean is
what prevented the count. The change makes that share countable for the first
time; it does not report it.

It also leaves the technique's routing claim untested. This engine has one
consumer of a settled replica, and the demotion argument is about a stage that
would otherwise *act* on a blocking finding. A pipeline surfacing investigations
to a human alongside blocking findings would exercise the half this tree does
not have.

Finally, the marking is inert until something reads it. Nothing today filters
conditioning material by `settled`, so the immediate effect is legibility, not
better output — the claim proved here is that the distinction is recoverable at
all, which it was not.
