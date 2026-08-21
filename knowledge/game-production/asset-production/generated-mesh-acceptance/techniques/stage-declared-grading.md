---
layer: technique
type: technique
subject: generated-mesh-acceptance
technique: stage-declared-grading
status: forged
laws: [a-verdict-is-bound-to-its-content, grade-against-what-ships-not-on-a-curve, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a gate rejects everything at one pipeline stage, explaining a harsh verdict without softening it, routing a rejection to finishing or re-generation]
---

# Stage-declared grading

Every verdict states **which production stage the artifact was at when it was graded**.
The thresholds do not move; the *interpretation* of the verdict does. An undeclared stage
is reported as undeclared and never inferred.

## Why the stage and not the threshold

Geometry arrives raw from a generator — dense, un-retopologised, un-unwrapped, un-baked —
or finished, after a pass that joined, decimated, unwrapped and baked. Held to one bar,
raw output fails on things the finishing stage exists to fix. The reflex is to lower the
bar for raw meshes. That is grading on a curve, and it destroys the one property the gate
has: an absolute standard measured against what actually ships.

Declaring the stage keeps the standard and adds the missing basis. A rejection then reads
"this does not meet the shipping bar, *and* here is which failing criteria a known
downstream stage resolves" — which is both honest and actionable, whereas a lowered
threshold is neither.

## Procedure

1. **Define the stage enumeration**, minimally: raw (straight from a generator), finished
   (post-finishing pass), unknown (the caller did not say).
2. **Take the stage from the caller.** Never infer it. Inferring it from density couples
   the explanation to the very metric under dispute, and a mesh can be dense for reasons
   that have nothing to do with its stage.
3. **Partition the failing codes** against the published remedy lists: which fails the
   finishing stage resolves, which another generation roll could plausibly change, and
   which neither addresses.
4. **Compute the mis-tiered flag** narrowly: true only when a caller-declared *raw* mesh is
   condemned **solely** by criteria the finishing stage exists to satisfy. One unaddressed
   fail, or one bad-draw fail, and the flag is false — the mesh is genuinely failing, not
   merely early.
5. **Derive the caveat sentence from those partitions**, naming the actual codes. Distinct
   sentences for: mis-tiered, raw-with-a-mix, unknown stage, and finished-with-unaddressed.
6. **Emit routing booleans** — would finishing change this outcome, would another roll —
   so the caller does not re-derive them.

## The hard rule: assessment may not soften a verdict

The stage assessment is **display and routing only**. It reads a verdict; it must contain
no code path that can produce or weaken one. There is no branch that turns a fail into a
warn because the mesh was early.

This is the property that keeps "the gate is mis-tiered" from becoming "so ship it
anyway", and it is the reason the technique is safe to add to a gate that people already
distrust. Enforce it structurally: the function takes a verdict as input and returns
metadata, and never the reverse.

Two related refusals:

- **When no verdict was reached at all** — the critic was absent, or it errored — there is
  nothing to tier. Return the empty assessment. A missing gate must never be dressed up as
  a calibration problem.
- **When the stage is unknown**, say exactly that: this verdict cannot distinguish a defect
  from an unfinished input, declare the stage to get a tiered reading. Do not guess, and do
  not fall back to the most flattering stage.

## Decision rules

- **When a claim about your gate's behaviour has been standing for a while, re-measure it
  before acting on it.** Gate folklore is remarkably durable and remarkably wrong. One
  standing claim held that a gate graded raw output against finished density thresholds and
  failed it near 100% of the time. Re-measured on a real 52-file corpus: density had **no
  fail rule at all** and never failed anything; the true rejection rate was **10 of 52
  (19.2%)**; and **all ten** were debris. The claim was right in substance — a post-finish
  bar was being applied to pre-finish geometry — and wrong in mechanism.
- **Fix the mechanism you measured, not the one you assumed.** In that case the response
  was to make the gate declare its stage rather than re-tune the density threshold the
  claim blamed, *because re-tuning that number would have changed exactly zero verdicts*.
  A change that moves no verdict is a change to nothing; measure the move before you make
  it.
- **When a re-derivation is more conservative than the real critic, say which direction the
  bias runs.** Welding on exact position finds more components than welding with a
  tolerance, so a rejection rate derived that way is an upper bound. A measurement without
  its bias direction is not a measurement.
- **When the finishing stage is claimed to resolve a class, verify it on a before/after
  pair.** Measured: one mesh went from 2 components and 1 speck at 1.48M faces to 17
  components and 16 specks at 47k faces — warn to fail. Decimation collapses density and
  multiplies debris. A remedy list built from intuition would have promised the opposite.
- **When nothing on disk has ever scored a clean pass**, treat that as a finding about the
  gate's placement in the pipeline, not as a reason to lower it.

## When not to use this

- **As a substitute for a per-stage bar where one is genuinely warranted.** If a stage has
  its own shipping standard — an intermediate artifact that is itself delivered — give it
  its own explicit thresholds and its own name. Stage declaration explains a verdict; it
  does not replace a missing standard.
- **When the caller cannot know the stage.** Then unknown is the honest answer and the
  caveat says so. Do not invent a default.
- **To justify shipping.** Nothing here changes what may enter the engine.
