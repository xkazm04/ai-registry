---
layer: application
type: application
subject: agent-runtime-assembly
technique: indeterminate-closure-on-interruption
stack: rust
verified_on: 2026-09-03
verified_against: rust@1.80.0
applied: simulation
ab_verdict: not-better
---

# A tree that had already built this, and had built more of it

A local-first desktop agent-orchestration app whose executions are rows in
an embedded database. It was picked as a seam for this technique and turned
out to have implemented it first, more completely, and with a measurement
the technique did not have. The verdict is **not-better**: the technique as
landed would not have improved this tree, and the comparison instead
supplied the mechanism the technique was missing.

Recording it that way round is the point. The registry's rule was written
from one repository's recovery table; this tree had paid for the same
lesson and gone one step further, and the step is the one that matters
operationally.

## What was already there

A dedicated boot-classification module replaces what its own header calls
"the blind-fail sweep". The prior behaviour matches the technique's named
anti-pattern exactly — every mid-run row marked failed with a fixed
sentence, and a downstream classifier recovering the truth by matching that
sentence in two languages. The tree measured the damage rather than
asserting it: **74 of 2,188 executions** on a dated backup carry the legacy
marker, with no liveness check and no user surface. Its prescription is one
line: *at boot, do not declare — classify.*

Three classes, not one status: plausibly mid-flight (re-admitted once),
unproven (neither success nor failure, surfaced for a person), and
suspended (terminal). The state enum is deliberately **not** widened —
an existing value already means "ran, never finished, not a failure anyone
observed", and the extra bit rides a nullable column rather than a variant
that would cross a generated type boundary into four consumers.

## The three cases, walked under both policies

| Case, drawn from this tree | Technique as landed | This tree's policy |
| --- | --- | --- |
| The 74 legacy rows carrying the marker string | Fixed: first-class status, no string matching | Fixed, and the marker is kept as a named constant so the population is **countable** while it drains |
| A running row with a missing or unparseable start stamp | Silent. The technique sorts by "could the effect have escaped", which does not answer "is this resumable" | Classified unproven — cannot be shown to be mid-flight, so a person decides |
| A run that kills the process every time it resumes | **Re-admitted forever.** Closing it honestly says nothing about whether to retry it, and a freshness test always passes for a unit that just crashed | Escalation checked *before* the freshness window; past three consecutive restarts the run is suspended |

The third row is why the verdict is not-better rather than a tie. Applying
the technique as written to a tree without an escalation cap converts a
crash into a boot loop, and every iteration looks locally correct.

## What the comparison gave back

Four mechanisms, now in the technique, all read from this tree rather than
invented:

- **Classify, do not declare** — the disposition is at least three
  outcomes sorted by evidence the sweep already holds.
- **The window is not a fresh number.** It is the same threshold the live
  stall sweep already uses, on the stated ground that two answers to "was
  this in flight" in one system is a defect by itself.
- **Involuntary interruption counts on its own key**, never merged with the
  retry counter for observed failures, because an involuntary interruption
  produces no failure identity for a healing loop to match on.
- **Clear the mark on completion, not on the attempt** — clearing at resume
  time makes every crash the first crash, and the escalation can never fire.

## What this tree cannot settle

The 74-of-2,188 figure measures the *old* behaviour's blast radius, not the
new policy's benefit. There is no post-change measurement here — no count
of rows by class since the sweep shipped, and no record of how often the
escalation actually fires. The classifier is a pure function with unit
tests, so its decisions are pinned; its calibration is not. A team copying
the three-class split should instrument the class distribution before
trusting the window and the cap, because those two numbers are the whole
policy and both were chosen by argument.
