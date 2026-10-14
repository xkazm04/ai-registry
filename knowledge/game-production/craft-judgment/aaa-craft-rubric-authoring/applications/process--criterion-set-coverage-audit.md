---
layer: application
type: application
subject: aaa-craft-rubric-authoring
technique: criterion-set-coverage-audit
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# A gauge with a place to say "no criterion covers this"

The `pof` ARPG production tool grades generated deliverables through ten markdown craft
lenses, and an auditor posts each gauge as a level plus findings. The write door insists
every finding name a violated lens criterion (and a routing class). That is the exact shape
the technique warns about: the instrument can only speak in the categories it holds, so a
defect the auditor can see in a dimension no criterion covers had no field to go in. The
gauge simply read clean on that dimension. Existing channels all pointed the same way
(findings feed the producer's worklist), none reported on the instrument.

## What changed

The gauge may carry an optional list of coverage remarks, each a plain description of a
visible defect that no criterion covers (at most ten, each long enough to audit). They are
stored in a table of their own beside the gauge, keep the current picture per cell (a
re-gauge replaces the cell's remarks, one that reports none clears them), and are rolled up
per lens for the lens author, counting cells and naming the remark, never as a percentage.
They are read by nothing that grades: the level, the findings and the stored gauge are
identical with and without remarks. The craft-loop skill tells the auditor to use the field
instead of stretching a nearby criterion or lowering the level.

## The pair

Replay over all nine step lenses with one remark each. Target, remarks stored and surfaced
to the lens author: A 0 of 9 (the old route drops the unknown field), B 9 of 9. Floor:
gauges posted with and without remarks store the same level and findings (B), and the 139
craft and verdict tests across 9 files stay green, type check and lint clean. The new tests
fail on the old route (3 of 6) and pass on the new. Shipped on the project's default branch
as `23196728`. The seam was chosen to falsify the claim that the field can live beside the
grade without touching it; it held.

## What this did not do

The technique's first half, enumerating the deliverable class's dimensions independently of
the lens and mapping criteria onto them, was not run: it needs a practitioner with the
field's rejection incidents, and the lens files themselves state that perceptual dimensions
(rendered frame, feel) are out of scope by construction. Rendering "graded over N dimensions,
these named unmeasured" beside the level is also not built. And whether auditors will use the
field is unknown: no stored gauges exist on the machine used, so no remark has been seen yet.

## Return condition

After the next audit campaign, read the per-lens roll-up. A remark repeated across cells
belongs in the next lens version; an empty roll-up after a full campaign says the field is
not being used, not that the lenses are complete.
