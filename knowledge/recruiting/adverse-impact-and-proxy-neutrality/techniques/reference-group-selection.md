---
layer: technique
type: technique
subject: adverse-impact-and-proxy-neutrality
technique: reference-group-selection
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
shared_with: []
use_when: [choosing what a selection rate is compared against, auditing a fairness report for a moved goalpost]
---

# Reference-group selection

Every ratio has a denominator, and the denominator is a choice. Choosing it
after seeing the data is the single most effective way to make an unfair
process look fair, and it is almost never done maliciously — it is done by an
analyst who "tried a couple of ways" and reported the one that looked right.

## The candidate rules

- **Highest-rate group.** The classical rule: the group with the highest
  selection rate becomes the reference and every other group is measured
  against it. Strictest, most widely recognised, and what a reader of a
  fairness report expects unless told otherwise.
- **Total-minus-group.** Each group is compared to everyone else pooled. More
  stable when several small groups are present, and it avoids one outlier
  group setting an unreachable bar — but it changes the denominator for every
  group, so the ratios are no longer mutually comparable in the classical
  sense.
- **Largest group.** Compare to the group with the most considered candidates.
  Stable, and honest about what the majority experience is — but it can read
  as normative in a way that is uncomfortable to defend.
- **Fixed reference.** A pre-declared group held constant across periods.
  Useful only for trend analysis, and never as a standalone compliance figure.

## The decision rule

**Pick one rule in policy, before the data, and record it with every result.**
The rule is a property of your methodology, not of the quarter. Where the
regulator or the audit standard names a rule, use that one and say which. Where
none is named, use highest-rate as the default — it is the strictest and the
most recognised, so a reader mis-reading your report mis-reads it in the safe
direction.

**Where a second rule genuinely adds information, report both, always, in every
period.** Two ratios reported side by side every time is analysis. Two ratios
computed and one shown is reference shopping wearing analysis clothes.

## The instability the classical rule has

The highest-rate rule inherits the fragility of its reference group. A group of
four candidates of whom all four were selected sets the reference at 100%, and
every other group in the report now fails against a rate no population sustains.
The result is a page of red that says nothing about the process.

Three disciplines contain this:

1. **The minimum cohort applies to the reference group too.** A group too small
   to carry a rate of its own is too small to be the yardstick for everyone
   else. Exclude it from reference eligibility while still listing it in the
   report with its too-small state.
2. **The exclusion is a rule, not an intervention.** "Groups below the floor
   are not reference-eligible" is a policy. "We excluded this group because it
   made the numbers look bad" is the thing the policy exists to prevent, and
   the difference is visible only if the policy predates the run.
3. **State the reference rate, not just the ratios.** A reader who can see that
   the reference rate was 100% over four people can discount the page
   themselves. A reader shown only ratios cannot.

## Bad input moves the reference, quietly

Under the highest-rate rule the reference is chosen *from the data*, which makes
every input defect a potential verdict flip. Two guards are not optional:

- **A malformed row is surfaced, never silently skipped.** When counts arrive
  as pasted or uploaded rows, a mistyped line dropped in silence can remove the
  group that would have anchored the ratio, and every other group's verdict
  changes with it. Record which rows failed to parse, by their original
  position, and state on the result that the analysis ran over a subset. An
  empty numeric field is a typo, not a real zero — treat it as malformed rather
  than fabricating a count.
- **Impossible counts are clamped, not trusted.** More selected than
  considered, or a negative count, yields a rate above 100% that instantly
  becomes the reference and drags every other group under the threshold. Clamp
  into range and surface the clamp; a corrupted reference produces a page of
  findings that are all artifacts of one bad row.

Both are the same lesson: under a data-chosen reference, input hygiene is
fairness logic, not plumbing.

## When the reference itself is the finding

Sometimes no group qualifies as a reference — every cohort is under the floor.
That is not an error state and not a pass; the analysis returns too-small
overall. Sometimes exactly one group qualifies, and a ratio needs two things to
compare, so a complete analysis requires at least two qualifying groups. One
qualifying group yields a selection rate that is true, reportable, and not a
fairness finding.

## When not to use this

- **Do not switch the rule between periods** to preserve a trend line. A
  methodology change resets the series; label the break rather than smoothing
  it.
- **Do not let a consumer choose the reference at render time.** A dropdown
  that recomputes the ratio against whichever group the viewer picks is a
  goalpost with a user interface. If exploration is genuinely needed, mark
  every non-default view as exploratory and make it non-exportable.
- **Do not carry a reference group across gates.** Each gate has its own
  considered pool; the highest-rate group at screening is often not the
  highest-rate group at offer, and reusing one is an unstated assumption that
  quietly changes what the number means.
