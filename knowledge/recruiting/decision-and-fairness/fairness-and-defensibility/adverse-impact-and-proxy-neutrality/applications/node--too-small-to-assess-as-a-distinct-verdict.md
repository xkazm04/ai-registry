---
layer: application
type: application
subject: adverse-impact-and-proxy-neutrality
technique: too-small-to-assess-as-a-distinct-verdict
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# A mixed result headlined as clean, in a four-fifths check (TypeScript)

The hiring platform's four-fifths module already honours most of the technique:
its result type carries `reliable`, per-group `reliable`, a null ratio for a
sub-floor group and an `unassessedGroups` count; a fully unassessable set
renders a distinct "insufficient sample" state that says outright it is not a
finding of no adverse impact. The seam hunt went to the aggregation guard, the
place the technique says collapses happen: **the roll-up**.

## The seam (chosen to falsify)

The verdict was derived inline in the UI component as a five-way ladder whose
last rung was `clean`. A set with two assessed groups showing nothing and two
groups below the floor fell through to `clean`: the green check and "No group
falls below the 80% threshold", with the unassessed count demoted to a grey
footnote underneath. That is the technique's "mixed reports state the mix in the
headline" rule broken, and the technique's own roll-up warning in miniature. A
caught outcome would have been a project that already headlined the mix; it did
not.

## A and B

- **A:** mixed input (two assessed groups at 50% and 48%, two sub-floor groups)
  reads `clean`, green, headline silent about the two unassessed groups.
- **B:** a sixth verdict, `cleanPartial`, computed by a pure
  `adverseImpactVerdict(result)` moved out of the component so it is testable.
  Neutral tone, the question-mark icon the insufficient state uses, and a
  headline that states the mix and says it is not a finding for the whole set;
  the detectable-ratio line still follows. A real finding still outranks it,
  `clean` is kept only when nothing was left out, and the copy is added to all
  four locales.

## Reading

Target: mixed-input headlines that read as an affirmative clean verdict, 1 of 1
under A, 0 of 1 under B (new test; the ladder on A has no such state to
assert). Floor: the other five verdicts unchanged for their inputs (the 30
existing module tests plus a case each for full-clean, insufficient, null and
adverse), typecheck, lint and the i18n parity check green.

Not measured: whether a recruiter reading the neutral headline acts differently
from the green one, and the exported or printed forms of the result (this
surface has none; the technique's export rule has no seam here yet).
