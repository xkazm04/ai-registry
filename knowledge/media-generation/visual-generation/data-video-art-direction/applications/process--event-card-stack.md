---
layer: application
type: application
subject: data-video-art-direction
technique: event-card-stack
stack: process
status: draft
verified_on: 2026-10-22
applied: code
ab_verdict: better
---

# Two cards that entered on the same frame

A data-video studio already builds the stack the technique describes, once, as a
reusable component: each card lives its own lifespan in frames (120 by default, 105-135
allowed), the date sits on the card's stamp line, a newer card pushes older ones back
by +24 px x, -62 px y, -6 % scale and -12 % brightness per level, and the pile is capped
at three deep with the buried card fading out under the newcomer's entrance. It
deliberately keeps ONE transition (a side reveal alternating left and right) instead of
one per card type. The seam was chosen to falsify "the stack is already complete here"
against the decision rule nobody had encoded: never start two transitions on the same
frame.

## Where the frame comes from

A card's start frame is not chosen; the timing plan computes it from the event's period.
Dwell bumps around each event push adjacent periods apart (20 frames or more in the
measured cases, wider than the 14-frame entrance), so the only way to collide is two
events on one period, which get one start frame. Nothing refused that, and card
entrances are not counted in the studio's motion-cue budget, which covers chip pops,
the leader fade and the clock roll.

## A and B

- **A (as it was):** two events on one period were accepted by the generation rules,
  and both side reveals ran together for 14 frames.
- **B (the rule applied):** the card-lifespan rule also refuses two cards whose start
  frames are closer than one entrance (14 frames, now one shared limit that the
  composition reads too), with a message that says to merge them into one card or move
  one to another period. The generation prompt and the tool's rule text say the same.

## Result

Target: same-period event pairs accepted, measured on the studio's own sample race
through the real planner. Before: 2 of 2 accepted, each with 14 frames of double
entrance. After: 0 of 2. The sample as it is (gaps of 35 and 32 frames, three cards
stacked) and an adjacent-period variant (20 frames) pass in both arms. Three new rule
tests: two fail on the old rules, all pass on the new. Floor: full workspace suite (1,637
tests), type check, script tests and the lint ratchet green. Shipped stat-reel 47faa47
on origin main.

Held at its own boundary: the stack, lifespan, date and depth cap were already right,
and the per-type transition rule was declined by the studio on purpose. The technique's
"cut to the strongest" for more than three overlaps is realised as burial (the oldest
fades out), which keeps the cap without ranking events.

Not measured: how often generated cases put two events on one period (no log of
refused props by code is kept). Return: a count of `card-entrances-overlap` refusals
from the generation job log; if a real case needs two same-month events, a planner
stagger that keeps the dates on the cards is the alternative to refusing.
