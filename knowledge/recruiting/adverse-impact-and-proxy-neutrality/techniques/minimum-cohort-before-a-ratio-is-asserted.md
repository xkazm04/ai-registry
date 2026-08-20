---
layer: technique
type: technique
subject: adverse-impact-and-proxy-neutrality
technique: minimum-cohort-before-a-ratio-is-asserted
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [setting the floor below which a selection rate is not reported, defending a fairness number that was computed over few people]
---

# Minimum cohort before a ratio is asserted

A proportion computed over a handful of people is not a measurement. It is a
count wearing a percent sign, and it moves by tens of percentage points when
one person's outcome changes. The floor is the rule that stops a fairness
system from asserting things its sample cannot support — in either direction,
which is the half people forget.

## The floor

**Thirty considered candidates per group** is the working default, and it is a
convention with reasons rather than a law of statistics.

- Below roughly thirty, the sampling distribution of a proportion is skewed
  enough that the normal approximation most tooling uses is misleading, so the
  interval around the rate is both wide and wrong.
- The interval at n=30 is still wide — around a 50% rate it spans roughly
  ±18 points — so thirty is the floor at which a rate becomes *reportable*,
  not the point at which it becomes precise. Treat it as the boundary of
  admissibility, never as a quality bar.
- It is a recognisable number. A floor a reviewer has seen before does not
  itself become the argument.

Raise the floor where the base rate is extreme. At a 3% selection rate, thirty
considered candidates yields an expected one selection, and a ratio built on
one person is arithmetic, not evidence. The honest secondary rule is a floor on
the numerator too: **at least five selected in each compared group**, or the
rate is too-small regardless of how many were considered.

## Two qualifying groups, minimum

A ratio compares. One qualifying group produces a selection rate and no
comparison; zero produce nothing. **A full analysis requires at least two
groups at or above the floor**, and the reference group must be one of them.
When only one qualifies, the correct output states the one rate, states that no
comparison was possible, and does not imply that the absent comparison came
back clean.

## Decision rules

- **The floor is per group, not per report.** Nine hundred candidates across
  four groups where three are under the floor is three too-small states and one
  rate, not a well-powered analysis.
- **Never pool groups to clear the floor.** Merging distinct protected
  categories into an "other" bucket to reach thirty produces a rate for a
  population that does not exist and hides the group you were asked about. If
  a regime permits excluding a negligibly-sized category from a published
  computation, exclude it and label it — do not blend it.
- **Never widen the window silently to clear the floor.** Extending from a
  quarter to a year is legitimate and is a different question; the result must
  carry the window it actually used, and a report comparing a one-year cohort
  against a one-quarter cohort is comparing two populations.
- **The floor binds the reference group.** A yardstick that cannot carry its
  own rate cannot set anyone else's — see
  [reference-group-selection](reference-group-selection.md).
- **Under the floor, do not fall back to a "directional" ratio.** A number
  labelled indicative is still the number that gets copied into a slide. The
  fallback is the too-small state, which has its own
  [distinct verdict](too-small-to-assess-as-a-distinct-verdict.md).

## What to do while under the floor

Small cohorts are the normal condition for most teams hiring most roles, so the
answer cannot be "wait". Three things remain available and are worth more than
an underpowered ratio:

- **Accumulate deliberately.** Hold the analysis at role-family and annual
  granularity, where the cohort actually reaches the floor, rather than
  reporting per-requisition noise monthly.
- **Test the function instead of the outcome.** Perturbation testing has no
  cohort requirement at all — it needs one résumé and a perturbation set. It is
  the fairness work that is always available.
- **Audit the instrument.** Requirement justification, cutoff rationale, rubric
  review and proxy inspection do not need a population. Most real disparities
  are visible in the instrument before they are visible in the outcomes.

## When not to use this

Do not apply the floor to *suppress* a known problem. If a hiring manager
rejected every candidate from one background across eleven decisions, the
statistical claim is unavailable and the finding is not: the floor governs what
a computed ratio may assert, not what a human review may notice. The floor is a
rule about the arithmetic's honesty, never a reason to stop looking.
