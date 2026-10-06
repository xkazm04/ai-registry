---
layer: technique
type: technique
subject: data-video-art-direction
technique: legibility-floor
status: draft
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [laying out a vertical data-video frame, checking text sizes and safe zones, deciding whether to tilt a chart or map]
---

# Legibility floor

A data video is watched on a phone with the platform's interface on top of
it. A frame that fails at phone size fails, whatever it looks like on a
monitor. These are floors to check on every frame, not targets.

## Procedure

1. **Story text at 26 px or more at 1080 wide**: titles, values, labels,
   card headlines. Below that, text is decoration, not story.
2. **Micro-credits and source lines at 15 to 18 px** are the one deliberate
   exception. They are credits, not story, and the full credit also goes in
   the description.
3. **Keep content inside the safe box** of the target platform (for a
   1080×1920 vertical, roughly y 150–1580). Keep the right-edge icon column
   mostly clear; only a card corner may reach into it.
4. **Tilt only up to 15°** on anything carrying data (rows, maps, axes), or
   tilt only the background plane.
5. **Check the smallest entity**: small states on a map, a 14 px grid label,
   a one-month sliver. If it carries meaning, enlarge it, call it out, or
   move the meaning to a list.
6. **Review at actual phone size** (about a third of full scale) before
   approving.

## Decision rules

- When text does not fit at 26 px, cut words, never size.
- Two timelines on one frame (a zoomed strip and a full-run bar) must look
  clearly different, or one goes.
- The empty band at the bottom of a vertical is the platform's, on purpose.
  Do not fill it with story.

## When not to use it

- **Landscape and big-screen formats.** Rescale the floor; the principle
  holds, the numbers change.
