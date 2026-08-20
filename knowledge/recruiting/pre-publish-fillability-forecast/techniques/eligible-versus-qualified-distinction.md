---
layer: technique
type: technique
subject: pre-publish-fillability-forecast
technique: eligible-versus-qualified-distinction
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [choosing the denominator for a counterfactual delta, presenting a pool count to a recruiter, a lever appears to have no effect]
---

# Eligible versus qualified

A pool count is meaningless until it says which of two populations it counted.
**Eligible** means admitted into scoring: the person survived every hard filter
the requisition imposes and is a legitimate candidate for consideration.
**Qualified** means recommended: the person is eligible *and* scores at or above
the threshold that puts them in front of a recruiter. Eligible is a
subtraction; qualified is a ranking cut applied afterward.

Every requirement in a requisition acts on exactly one of these populations,
and which one is a property of the requirement's *type*, not of how important
the hiring manager thinks it is. This technique is the rule for deciding, and
the discipline of carrying the answer into every number the forecast emits.

## The classification rule

A requirement is a **gate** when failing it removes the person from
consideration entirely — legal authorization to work, a licence or
certification whose absence makes the work unlawful, a language level below
which the job cannot be performed, a location or on-site constraint, a minimum
education floor where one is genuinely imposed. A gate is boolean and its
failure is terminal.

A requirement is a **weighted criterion** when failing it lowers a score —
essentially every skill, tool, domain and years-of-experience expectation. A
must-have skill is a weighted criterion with a large weight, or one whose
absence caps the achievable score; it is emphatically *not* a gate, however
emphatically it was written.

The test that settles ambiguous cases: **if a candidate missing this could
still be worth an interview when everything else is exceptional, it is a
criterion.** If the answer is no under any circumstances, it is a gate. Most
requirements a manager calls "hard" fail this test, which is precisely the
finding requirement-inflation-control exists to act on.

## Why the denominator follows from the type

- Loosening a **gate** changes who is admitted. The delta is
  `eligible(loosened) − eligible(baseline)`, and it is a count of people whose
  *only* disqualification was that gate. This is the most actionable number the
  forecast produces, because its meaning survives translation into a sentence.
- Demoting a **criterion** cannot change eligibility at all — the same people
  were in the pool before and after — so its delta must be measured on the
  qualified count: `qualified(demoted) − qualified(baseline)`, where qualified
  means at-or-above the same threshold in both runs.

Measure a criterion demotion on eligibility and you get zero, every time, and
conclude the lever is useless. Measure a gate loosening on the qualified count
and you get a muddied number: the newly admitted people are also being score-
filtered, so the delta silently mixes "who the gate excluded" with "who scores
well", and no sentence describes it correctly.

## Rules

1. **Every emitted count names its population.** Not "+14" but "+14 eligible"
   or "+14 reaching the recommendation threshold". The two words do the work
   that a paragraph of caveats otherwise has to.
2. **Both arms of a delta use the same population and the same threshold.**
   Changing the threshold between baseline and counterfactual is the easiest
   way to manufacture a delta out of nothing.
3. **Qualified is always a subset of eligible.** If an implementation can
   produce a qualified count exceeding its eligible count, the scoring path and
   the filter path have diverged and both numbers are void.
4. **State the base when it shrinks.** Some levers only apply to the part of
   the pool that has the relevant field recorded — a language level, a
   graduation year. When the comparable base is smaller than the pool, report
   the reduced base in the same breath as the rate, never a percentage over a
   silently different denominator
   ([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
   The same holds for candidates the scoring pass could not read: a profile
   that fails to parse is skipped **and listed**, with an identifier and a
   reason, so the recruiter can see the counts were computed over a reduced
   denominator and can go fix the two records that mattered.
5. **Unknowns do not fail gates.** A gate whose input is missing is skipped,
   not failed, so eligibility is never reduced by the record's incompleteness
   ([uncertainty resolves toward the candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
   The counterfactual inherits this rather than reimplementing it — see
   `reuse-the-production-scorer-not-a-model-of-it`.

## The presentation consequence

Recruiters do not hold this distinction in their heads, and should not have to.
The interface earns it for them by using two different verbs and never mixing
them in one list: gates produce "**can be considered**" and criteria produce
"**would be recommended**". A single ranked list of levers sorted by raw delta
reads as one currency and is therefore wrong, no matter how the tooltip is
worded. Group by lever type, sort within group.

## When not to use this

- **When there are no gates.** Some requisitions are pure weighted criteria; in
  that case there is one population and the distinction costs vocabulary
  without buying anything. Say "matching the role" and move on.
- **When the qualified threshold is not stable.** If the recommendation cut
  moves with the pool — a top-N rather than an absolute score — then the
  qualified count is nearly invariant by construction and demotion deltas are
  meaningless. Report score movement of specific people instead, or fix the
  threshold for the duration of the forecast and say that you did.
- **When the pool is too small.** Under a floor where a count is not a
  proportion, neither population supports a rate. Report the raw counts and an
  explicit insufficient-pool verdict.
