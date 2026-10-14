---
layer: application
type: application
subject: civic-knowledge-graphs
technique: forensic-view-filtering
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Node: a forensic filter that admits what it knows, not what it fails to exclude

How a TypeScript/Node civic-graph project (Czech accountability app *politicas*)
renders its default "verified only" landscape, and the one place a mature
implementation still fell through to "visible".

## What already conformed

Nearly all of the technique was present: a pure edge filter that preserves input
order; separate counts for hidden pending, hidden rejected, and pending or
rejected edges kept because a lens requested them; one canonical edge-key
function imported by the lens and the filter; a hover card computed from the
unfiltered edge list; per-relation breakdown with a deterministic tie-break and
a "more" count. A prior defect of exactly this family had been fixed once: a
rejected edge used to pass the "verified only" view as verified.

## The seam chosen to falsify it

The decision rule says an unclassified grade must not fall through to visible,
"silently verified by omission". The filter still enumerated the two BAD states
(pending, rejected) and pushed everything else, so the earlier rejected-edge fix
had added a second bad state to the list rather than inverting the test. A
CAUGHT result would show the rule is already satisfied by the closed type alone;
the seam could have refuted it as redundant.

## A: the exclusion list

A gate value outside the closed union (a corrupt bundle, or a fourth state added
to the loader before the filter) was admitted as verified, and counted by the
hover card as "no gate". The loader cannot produce one today, so no live edge
was affected.

## B: the admission list

Only `verified` and `null` (a deterministic relation with nothing to review)
pass. Any other value hides and counts as pending, in the filter and on the
card. Two tests with an out-of-union gate fail against A and pass against B.

## Verdict

Target: an out-of-union grade is hidden and counted, not shown as verified. A
passed both new tests' premise in the wrong direction (2 of 2 failed), B 2 of 2
green. Floor: the 168 graph tests, tsc, eslint and the pre-push gate held;
existing filter and card behavior for the three known grades is unchanged. The
technique held, and its decision rule earned a mechanical form: write the
filter as the list of grades it admits. Not measured: any real-world frequency,
since no live path produces such a value.
