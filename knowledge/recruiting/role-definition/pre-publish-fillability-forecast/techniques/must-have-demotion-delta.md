---
layer: technique
type: technique
subject: pre-publish-fillability-forecast
technique: must-have-demotion-delta
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [a must-have list is long and the recommended pool is empty, deciding which skill to move to nice-to-have, explaining why removing a skill requirement changed nothing]
---

# Must-have demotion delta

Demote one must-have skill to nice-to-have, re-score the pool, and count how
many more people clear the recommendation threshold. That count is what
insisting on that skill costs you in *recommendable* candidates.

The technique is the twin of `counterfactual-gate-loosening` and shares its
single-lever discipline, but it operates on a different population for a
structural reason: **a must-have skill is not a filter.** Missing it lowers a
score; it does not evict anyone. Run this lever against an eligibility count
and every row reads zero, which is how teams conclude — wrongly — that their
skill requirements are free.

## Procedure

1. **Fix the threshold.** Decide, before any pass, what score constitutes
   "would be recommended", and hold it constant across baseline and every
   counterfactual. A threshold that moves with the pool makes this lever
   unmeasurable.
2. **Score the baseline** over the pool and record the qualified count.
3. **For each must-have**, build a copy of the requisition where that one
   requirement's kind is nice-to-have — not deleted. Deletion changes the
   scoring surface twice: it removes the penalty *and* removes the credit
   candidates got for having the skill, which mixes two effects into one
   number. Demotion is the clean lever, and it is also the realistic action:
   nobody removes a skill from a job description, they downgrade it.
4. **Re-score and record** the new qualified count over the same eligible
   population.
5. **Emit the delta** as "+N would now be recommended", never "+N eligible".

## Decision rules

- **Demote, do not delete.** Stated above; it is the rule most often broken and
  the one that most quietly inflates deltas.
- **The eligible population is invariant.** If a demotion changes the eligible
  count, the requirement was acting as a gate somewhere in the pipeline — a
  hidden pre-filter, a query clause, a cap that zeroes a score. That is a bug
  worth chasing before any number is shown, because it means the requisition's
  own vocabulary does not describe what the engine does
  ([meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label)).
- **Deltas are independent, not cumulative.** Unlike gates, skills can go
  either way: two demotions may surface the same people (the sum overstates),
  or each may move a candidate a few points and only both together cross the
  bar (the sum understates). Never present a running total.
- **A zero delta usually means the threshold, not the skill, but try the pairs
  before saying so.** If demoting anything changes nothing, the pool is
  failing on distance, not on one requirement — but distance is measured in
  points, and a candidate several must-haves short can sit under the bar by
  more than any one demotion buys while a pair clears it. So when *every*
  single delta is zero, run the pairs of must-haves that some eligible
  candidate lacks (bound the skill count; the pairs are quadratic), and report
  the ones that move anyone, best first, as pairs. Only when no pair moves
  anyone is the honest report "no single demotion, and no pair, reaches the
  threshold; the pool is not close", which sends the recruiter to sourcing
  rather than to the requisition. That verdict is more valuable than six zero
  rows, and it is only earned after the pairs. Do not use "demote everything" as
  a shortcut bound: demoting a must-have a candidate *holds* lowers their score,
  so the all-demoted pool is not an upper bound on any subset.
- **Pair the delta with the raw prevalence of the gap.** Alongside "+N would
  now be recommended", report how many *eligible* candidates are missing that
  skill at all. The two numbers answer different questions — the delta says
  what the requirement costs at the threshold, the prevalence says how rare the
  skill is in your pool — and together they explain the zero case: a skill
  missing from eighty people whose demotion moves nobody says the pool is far
  from the bar, not that the skill is free. Prevalence is also the right
  tie-break when two demotions produce the same delta.
- **Rank by delta, present with the count of must-haves.** A role with nine
  must-haves whose best demotion buys two candidates has a structural problem
  no single lever addresses; the forecast should say so rather than
  recommending the least-bad row.

## What this measures and what it does not

The delta is a statement about **your scored pool under your current rubric**.
It inherits every property of that rubric, including its blind spots: if the
scorer cannot recognise an adjacent skill as evidence of the required one, the
demotion delta will overstate how many people "lack" the skill, because some of
them have it under another name. Skill adjacency and normalisation is a
neighbouring discipline and the forecast is downstream of it — a forecast run
over an un-normalised skill vocabulary produces confident numbers about a
naming problem.

For the same reason the delta must carry its base: "+11 of 240 scored" is a
claim; "+11" alone invites the reader to supply a denominator that flatters or
alarms
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## The relationship to requirement inflation

This lever is measurement, not judgment. It reports what a must-have costs; it
has no view on whether the must-have is justified. The decision of whether a
requirement *deserves* to be required — the outcome filter, the cap on
must-have count, the audit of inherited lines — belongs to requirement
inflation control, and the two are strongest when used in sequence: inflation
control produces a shortlist of requirements that cannot justify themselves,
and this technique prices each one so the conversation with the hiring manager
has a number in it.

The failure mode of skipping the judgment step is a coach that recommends
demoting whatever is most expensive, which over a few cycles converts a
specific role into a generic one that attracts volume and hires nobody.

## When not to use this

- **When must-haves are already at or below a healthy count.** Below a small
  handful, the pricing exercise mostly recommends dismantling a role that is
  already well specified. Report the counts and stop.
- **When the score is not comparable across passes.** If the rubric normalises
  scores against the pool's own distribution, demoting a requirement shifts
  everyone and the threshold no longer means the same thing. Use absolute
  scoring for the forecast or say the delta is indicative only.
- **When the recommendation threshold is not the recruiter's real cut.** If in
  practice recruiters read the top twenty regardless of score, a threshold
  delta describes a boundary nobody uses. Measure movement into the top twenty
  instead, and name that as the population.
