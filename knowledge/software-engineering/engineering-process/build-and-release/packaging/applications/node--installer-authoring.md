---
layer: application
type: application
subject: packaging
technique: installer-authoring
stack: node
verified_on: 2026-09-02
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A managed region is not a user-owned value

A knowledge registry links its skills and rules into every project that
declares them, and the linking script writes one thing into a file the
project owns: a marked block in the project's ignore file, listing the
links so machine state never gets committed. The block sits between a
begin marker and an end marker; the script rewrites the whole block on
every run and compares nothing inside it first.

Read against the three-state rule for configuration the user owns, that
looks like the failure the rule exists for: an installer rewriting an
operator-edited file without checking whether the operator edited it.

## The paired comparison

Arm A is the script as it is: regenerate the block wholesale. Arm B is the
three-state rule applied to the block: rewrite only when its lines are
exactly what a prior run would have written, pass when they already match
the declaration, and refuse and report when any line inside the markers is
not one the script writes.

The measurable is the number of projects where the two arms disagree, and
the instrument is a walk over every connected checkout's ignore file,
classifying each line inside the markers as *ours* or *foreign*. Seven of
eight checkouts carry the block; one has none. Foreign lines: three
projects carry one each. All three are the same line — a comment an
earlier version of the script itself wrote, whose wording the script has
since changed. No project carries an operator's line inside the markers.

Arm A rewrites all seven and is correct in all seven. Arm B refuses three
and reports an operator edit that never happened.

## The verdict, and the condition it landed

**Not better**, and the reason is structural rather than a matter of
degree. The block is a **machine-owned region**: the markers declare it,
the comment inside it tells the reader the declaration lives elsewhere, and
the operator's legitimate edits are all outside the markers. The
three-state rule is for values the operator is entitled to have changed;
applied to a region the operator is told not to touch, its "custom" state
has no honest population and fills up with the script's own past. The
technique now says so in its closing paragraph — the rule is for the values
outside such regions.

The same walk found the seam the rule *does* fit, one directory over: each
project's manifest declares which skills it uses, that list is operator-
owned, and when the registry renames a skill the script already does the
right third-state thing — reports the stale name and refuses to edit — and
lacks the first-state half, because there is no shipped default block to
recognise. Return condition: the day a rename map exists, the migration of
that declaration is the case to build, with the consent flag.
