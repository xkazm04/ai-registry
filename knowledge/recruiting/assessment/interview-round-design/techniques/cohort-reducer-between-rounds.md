---
layer: technique
type: technique
subject: interview-round-design
technique: cohort-reducer-between-rounds
status: forged
laws: [every-decision-names-its-actor, uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated, a-claim-carries-its-sample-and-its-basis]
shared_with: []
use_when: [deciding who advances from one round to the next, setting a shortlist size or score threshold, designing the gate between a machine round and a human round]
---

# The cohort reducer between rounds

Between every pair of rounds sits a rule that decides who continues. That rule is the
**reducer**, and it is the most consequential object in the loop: it ends more
candidacies than every rejection letter combined, it is where the loop's cost is
actually controlled, and it is the thing a fairness analysis will look at first.

Design it before the first candidate enters, because a reducer written after the results
are in is a reducer fitted to the people you already like.

## The four properties

**A basis.** One of, or an explicit combination of:

- *Threshold* — everyone at or above a stated score on a stated axis advances. Simple,
  replayable, and it does not control volume: a strong cohort blows through it.
- *Top-N shortlist* — a fixed number advance. Controls volume exactly, and it makes
  advancement relative to the cohort rather than to the bar, which is a different claim
  and must not be reported as though it were the bar.
- *Human selection* — a named person picks from a ranked or unranked set. Necessary
  where the judgment is genuinely holistic; requires the same recording as any other
  decision.
- *Combination* — typically a floor plus a shortlist: nobody below the bar advances, and
  above it the top N do. This is the honest default, because it separates "good enough"
  from "we only have capacity for six".

**A ratio.** The expected narrowing, written down. A reducer with no expected ratio
cannot be evaluated: you cannot tell whether the round before it was informative, and
you cannot capacity-plan the round after it. When the observed ratio is near one, the
round before the reducer produced no separation and is a candidate for deletion. When it
is extreme — a handful surviving from hundreds — the loop is doing its real selection in
one automated step, which raises the review bar for that step considerably.

**An actor.** Every reducer records who or what applied it, per
[every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor). A
threshold applied automatically records the automated process; a shortlist picked by a
person records that person. "The system" and a blank field are not answers, and the
authority recorded may be downgraded from human to automated when the record is unclear
— never upgraded.

**A human gate where the outcome is adverse.** A reducer's output for most of the cohort
is *not advanced*, which is a consequential adverse-ish outcome. The machine-actionable
side of a reducer is advancement and hold; the not-advanced set is reviewed and released
by a person, per
[no-adverse-outcome-is-solely-automated](../../../_laws.md#no-adverse-outcome-is-solely-automated).
Where the volume makes individual review impossible, the human approves the *exact set*
they reviewed — a preview that is re-derived at the moment of commit and refused if the
cohort has drifted since — rather than approving a rule and letting it run against a
population they never saw.

## The tie at the cutoff

A top-N reducer will produce ties at the boundary, and the tie is the single sharpest
test of whether the loop resolves uncertainty in the right direction. The rule:
**at an irreversible cutoff, spare the whole tied group rather than splitting it**, per
[uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).
Splitting a tie by arrival order, by identifier, or by any incidental ordering is
selecting on something that is not evidence — and if the ordering correlates with
anything about the population, it is selecting on that too.

Where advancing the whole tied group is genuinely impossible, the tie is broken by a
human on a stated basis that is recorded, not by the sort order of a query.

## Reporting a reducer honestly

Selection rates through a reducer are the raw material of both funnel metrics and
adverse-impact analysis, and both are downstream subjects. What this technique owes them
is a reducer whose output can be described truthfully:

- The rate states its cohort and its count, and refuses to render when the cohort is too
  small for a proportion to mean anything, per
  [a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis).
- A shortlist-based reducer is never reported as a pass rate against a standard. Twelve
  percent advanced because twelve percent was the capacity, not because eighty-eight
  percent failed to meet the bar, and conflating those is the most common way a loop's
  metrics lie about its own strictness.
- The reducer's basis is stored with the outcome, so the decision can be replayed
  against the recorded scores later. A reducer you cannot replay is a reducer you cannot
  defend.

## Reducers must be replayable, and thresholds must not be re-roll buttons

Two operational rules that come from the same place:

- **Changing a threshold changes the future, not the past.** Re-running a moved threshold
  over a cohort whose approvals were already signed invalidates the signature. Where a
  reducer's membership can move when a control moves, the control has become a way to
  spare or condemn one named individual, which is exactly what an audit trail exists to
  prevent.
- **A reducer applied to a cohort is applied once.** Late arrivals are a new cohort with
  their own application of the same rule, recorded as such. Silently re-opening a closed
  reducer to admit one person is the same defect wearing a friendlier face.

## When not to use an explicit reducer

- **Loops without volume.** Where every candidate who reaches round two would have
  reached it anyway, the reducer is a formality; state it as "all advance" rather than
  inventing a threshold that never binds. Naming it "all advance" is still worth doing —
  it makes the round before it visibly non-selective, which is information.
- **Rolling, non-cohort processes.** Continuous hiring with no batch boundary cannot use
  a shortlist; it uses a threshold plus a capacity queue, and the queue's wait becomes
  the thing that must be reported honestly to candidates.
- **Reducers as a substitute for a bar.** If the loop only ever narrows by capacity, the
  process has no standard, and it will hire the best of whoever applied that month. The
  floor is what makes the shortlist a selection rather than a ranking.
