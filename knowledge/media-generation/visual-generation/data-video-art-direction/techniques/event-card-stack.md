---
layer: technique
type: technique
subject: data-video-art-direction
technique: event-card-stack
status: draft
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [placing several evidence cards in one timeline, events that fall close together, cards that vanish before they can be read, choosing card enter and exit transitions]
---

# Event-card stack

Evidence cards need reading time, but a warped clock races through the
month right after an event. Tying a card to data months makes it either
vanish too early or "outlast its month". The fix is to give each card **its
own lifespan in frames**, put **the event's date on the card**, and **stack**
cards when their lifespans overlap.

## Procedure

1. **Lifespan:** each card lives for its readable time plus ~2 s (~4 s in
   total for a headline + one sub-line + credit), counted in frames from its
   entry. The timeline keeps running underneath.
2. **Date on the card:** "EVENT · 7 FEB 2023" in the stamp line, plus an
   event tick on the progress bar. The card can then outlive its month
   honestly.
3. **Stack on overlap:** a newer card lands on top. Each older card sinks
   one level per newer visible card (offset ≈ +24 px x, −62 px y, scale
   −6 %, brightness −12 %), like a pile. Depth changes are animated by the
   newer card's own enter and exit progress.
4. **Each card exits on its own clock,** even from under the pile. Cap the
   visible depth at 3.
5. **Vary the transition by card type,** one motion cue each:
   - photo → **photo-flash snap** (white flash + scale snap in; tossed out with a drop and a slight rotation);
   - screenshot or page → **page-flip** (hinged at the top, a shaded fold);
   - chart-caused or text event → **wipe from the chart line** (circular reveal from the line head; collapses back into the moving head);
   - fast news → **slide with motion blur** (horizontal blur + skew while moving);
   - data milestone → **rubber-stamp drop** (scale 1.7 → 1 with a slight rotation).
6. Build it **once** as a reusable component (event queue in, cards out),
   e.g. StatReel's `EventStack`.

## Decision rules

- The pile counts as **one card** in the motion budget. The transition of
  the card entering is the frame's one card cue. Never start two
  transitions on the same frame.
- Transitions may tilt past 15° **only in motion** (a page-flip is under
  0.4 s). Resting tilt stays at 3° or less.
- New cards share the pile's anchor (the same pocket of the chart), so the
  pile reads as one object.
- Chips (rank firsts) are on-data badges, not cards. They get ≥ 1.5 s in
  frames, also independent of the warp.

## When not to use it

- **Events more than ~4 s apart:** cards never overlap, so use single cards
  with the same lifespan rule.
- **More than 3 overlapping events:** cut to the strongest ones. A tall pile
  hides the chart.
