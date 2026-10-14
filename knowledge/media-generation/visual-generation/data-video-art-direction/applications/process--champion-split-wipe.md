---
layer: application
type: application
subject: data-video-art-direction
technique: champion-split-wipe
stack: process
status: draft
verified_on: 2026-10-14
applied: experiment
ab_verdict: unmeasurable
---

# One lead-change transition for a run with nine lead changes a minute and one with two

A data-video studio renders a ranked bar race whose far plane already follows the
leader: a tint of the leader's colour that cross-fades over 16 frames, starting 6
frames before the period knot where the rank swap is centred. That is the whole
vocabulary for a change of leader. It is a pure function of the timing plan, and it
is counted as one of the frame's two motion cues.

## A and B

- **A (as it is):** every lead change gets the same 16-frame cross-fade, whether the
  run changes leader twice or twenty times, and none marks a reign as ended.
- **B (the technique's rule):** a jagged split-wipe for a real, rare succession, the
  cross-fade where leaders change often.

## What was read

The seam was chosen to falsify the technique's reach: it says "use it only for real
changes of champion" and "several changes per minute loses the meaning", and the
studio has no champion, only a rank order. A caught outcome would have meant the
wipe has no home in a bar race. The cadence of lead changes was read from the two
committed timing plans (order[0] differing from the period before, counted over the
plan's knots at 30 fps):

| plan | lead changes | length | per minute | shortest gap |
| --- | --- | --- | --- | --- |
| real season series (F1 driver seasons) | 5 | 34 s | 8.8 | 3.1 s |
| invented sample, 96 periods | 1 | 34 s | 1.8 | none |

On the real series B equals A: nine a minute is the technique's own "frequent"
case and the cross-fade is what it prescribes, so the existing choice is conformant,
not an omission. On the sparse sample B differs (a wipe), but that plan is an
invented fixture, not a case anyone ships. The technique held at its boundary; what it
did not do is name where "several per minute" stops. The decision rule added to the
technique records the one measured datum.

Target: lead changes that a fixed cross-fade treats the same as a rare succession,
A 1 of 2 fixtures (the sparse one), B not built. Floor: no project file touched, so
type check, tests and render unchanged by construction.

Not measured: a rendered split-wipe, its cost against the two-cue budget, any
portrait or record-strike data (the studio carries no champion record), and a real
run with only one or two real successions. The wipe stays unbuilt: it needs a
reign record in the props and a second transition in the composition, larger than
a few lines.

Return: a real series with at most one lead change per 30 seconds (a title-holder
succession), or a render of the wipe against the cross-fade on the sample.
