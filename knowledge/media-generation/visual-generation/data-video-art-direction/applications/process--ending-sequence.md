---
layer: application
type: application
subject: data-video-art-direction
technique: ending-sequence
stack: process
status: draft
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# An ending that could crown a name the data did not show

A data-video studio already renders the ending as the technique describes: the
timeline stops, every row but the winner's dims to 20 %, the winner scales 8 %,
the card carries one or two fact-checked figures, then like and subscribe, then the
sign-off mark recoloured per video, 60 + 60 + 90 frames in a fixed order that props
cannot override. The seam was chosen to falsify "the spotlight states the result
once, clearly, from checked data": who decides which entity the card crowns, and
does anything compare that choice with the figures the card prints?

## A and B

- **A (as it was):** the card crowns the last entry of the timing plan's final
  order and prints that entity's last value from the props. The plan is computed by
  a tool from one input and the props are written separately, so they can disagree.
  The gate compared plan hash, period count, entity ids, frame sections and the
  fact refs, but never the crowned entity against the final values.
- **B (the rule applied):** one rule on the ending: the crowned entity must hold the
  largest final value in the props (a tie is accepted, a missing value counts as
  zero as the planner does), else the plan is refused with the two names and values.

## Result

A test that moves a runner-up above the crowned entity fails on the old rule set and
passes with the new one; a tie still passes. Floor: 1,633 tests across the
workspace and the type check green. Shipped stat-reel bc288c7 on origin main.

Considered and not done: checking that a spotlight fact belongs to the winner. The
technique itself allows the runner-up's record on the card, so a subject check would
refuse a legitimate card.

Not measured: how often a generated plan and its props disagreed before this (no
corpus of rejected plans is kept; the planner already corrects its own smoothing
artefacts, so the exposure is a hand-edited or stale plan).
Return: a count of refused plans by code from the generation job log.
