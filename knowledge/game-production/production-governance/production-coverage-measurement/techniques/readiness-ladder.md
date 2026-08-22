---
layer: technique
type: technique
subject: production-coverage-measurement
technique: readiness-ladder
status: forged
laws: [unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
shared_with: []
use_when: [designing a project-wide readiness scale, a status board reads greener than the build, deciding whether a workflow state deserves a rung]
---

# Readiness ladder

The one ordered scale on which a whole project's items are placed, where **up always
means closer to shippable**. It answers a single question — how strong is the evidence
that this thing exists and works — and it must answer nothing else.

## The rungs

Six rungs cover a production line end to end. Each carries a name and a one-line meaning
that ships with it; a rung whose meaning is not written down is a rung people will
redefine to suit the week.

| Rung | Name | Meaning |
| --- | --- | --- |
| 0 | not wired | No artifact at all — nothing has ever been produced for this. |
| 1 | hollow | Nothing real behind it: a pass on placeholder data, no producer that can make it, or produced but not passing its own check. |
| 2 | drafted | Real output exists, but only shape-level checks ran and this producer's class needs a gate to prove quality. |
| 3 | reviewed | Passes, from a producer class that reaches quality without a gate — or a judge passed it below the shippable band. |
| 4 | proven | A real quality gate passed, reproducibly and unattended, or a strict judge scored it at the shippable bar. |
| 5 | shipped | Proven quality **and** audited evidence it actually runs in the target runtime. |

Two properties of this shape matter more than the exact rung count. Rung 1 exists so that
*something that passed a check but proves nothing* has a home strictly below *something
real that only passed a weak check* — without it, placeholder passes land at 2 and the
ladder's whole middle inflates. And rung 5 is deliberately not reachable from the
grading logic alone: it needs a separate audited fact that the output ran. Structural and
check-level evidence never imply behavioural evidence.

## Procedure

1. **Fix the direction in one sentence** and write it at the top of the definition:
   *higher means closer to shippable*. Every later argument resolves against this
   sentence.
2. **Apply the strictly-more test to each adjacent pair.** Name a concrete defect that
   passes the lower rung and is caught by the higher one. If you cannot name one, merge
   the rungs. A rung that catches nothing new inflates the denominator of every
   completion percentage you will ever quote.
3. **Separate state from rung.** Model the item as *(rung, state)*. State covers
   `reached`, `waiting` (a gate is declared but has not run) and `blocked` (a check or a
   judge condemned it).
4. **Give waiting and blocked a would-be rung.** A waiting item is placed at the rung it
   *will* occupy once the declared gate runs, rendered hollow and excluded from every
   count of reached rungs. A blocked item keeps the rung that whatever *did* pass earned
   it — not the rung it was aiming at — so blocked items still sort and filter sanely.
5. **Emit a rationale with every placement.** One honest line naming the single input
   that decided it.
6. **Derive the visual ramp from the order, in one place.** The order is written down
   once; the colour ramp, the rank function and the sort all read from it.

## Decision rules

- **When a proposed rung describes waiting for a person or a decision, reject it.** A
  declared gate is not progress. An item waiting on a review is not closer to shipping
  than an item nobody has looked at, and putting it higher makes the ladder a workflow
  state machine whose ordering means nothing.
- **When a proposed rung describes failure, reject it.** A failure is not a level. It is
  a state at whatever level was actually earned.
- **When two rungs would be distinguished only by cost or difficulty, merge them.**
  Cost-ordered ladders reshuffle the moment tooling changes; kind-of-evidence orderings
  survive it.
- **When a report reaches for a maximum, check what it maximises over.** Taking the
  highest *declared* evidence tier instead of the highest *passed* one makes ambition
  render identically to achievement. This is the single most common corruption of a
  status board, and it is always introduced as a convenience fallback.
- **When choosing colours, reserve the strongest signal for the gate-proven rungs only**,
  and make everything below one weight ramp of a single hue. A multi-hue middle invites
  an argument about which hue outranks which, and the argument has no answer.
- **When two encodings both claim to describe an item, delete one.** A background
  encoding credibility and a stripe encoding evidence kind will eventually contradict —
  one saying a strong check is declared while the other says nothing has passed — and the
  reader believes whichever is greener.
- **Assert the ramp is distinguishable.** A six-step ramp built from tokens where two
  resolve to the same value has five visible steps and one invisible boundary. Pin the
  step count with a test against the order list.

## When not to use it

- **For a single item's acceptance decision.** A per-item acceptance ladder answers what
  evidence one artifact needs to be accepted; this ladder is the project-wide projection
  over many such verdicts. Deriving one from the other is right; using one as the other
  is not.
- **As a work-tracking board.** It carries no assignee, no estimate and no sequencing,
  deliberately. A ladder that also tries to be a task board becomes a task board.
- **Where the population is homogeneous and small.** Ten items of one kind are better
  reported as a list with reasons than as a distribution over six rungs.
- **As the sole quality signal.** Readiness says an artifact is proven; it says nothing
  about whether the proven thing is any good. That is the other axis's job, and the two
  must not be merged to save a column.
