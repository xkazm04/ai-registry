---
layer: application
type: application
subject: live-system-demo-film
technique: frame-stepped-page-capture
stack: python
status: forged
verified_on: 2026-11-18
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# Python: one design page captured both ways, and the clock nobody stepped

The page is `docs/design/features-reference/b3-the-harness/index.html` in `xkazm04/personas`
(public), last changed at `c3110967c3`: a static design reference with style keyframe
animations and two declarative SVG transforms on a status spinner. The harness is a
throwaway script driving headless Chromium through the Python driver (1.64.0 where it ran).
No `verified_against`: the page pins nothing a run could read as a witness.

- `b3-the-harness/index.html:110` "animation:pulse 1.7s ease-in-out infinite" - a style
  animation that never rests.
- `b3-the-harness/index.html:249` "<animateTransform" - a declarative SVG animation, which
  the page's animation list does not report.

## The A/B

Same page, same viewport (1280 by 800), same 4 s at 30 frames per second.

- **Arm A, real time.** The driver's own screencast, sampled at 30 fps from 0.5 s.
- **Arm B, stepped as the source describes it.** Script clock installed and paused; every
  style animation paused and seeked to `i / 30` s; one screenshot per frame.
- **Arm B', stepped with the SVG timelines also seeked** (each SVG root paused and set to
  the frame's time).

| | A real time | B stepped | B' stepped + SVG |
|---|---|---|---|
| Frames that differ from the previous one | 99 of 118 | 119 of 119 | 119 of 119 |
| Recorder's own stream rate | 25 fps | - | - |
| Same frame identical across two runs (floor) | - | 0 of 61 | 37 of 61 |

Target (frames that change during continuous motion) moved from 99/118 to 119/119. The floor
(determinism: a stepped frame is the same image every time) fell under arm B, 0 of 61,
because the spinner's SVG animation kept the browser's real clock and the page's animation
list reported zero animations at every step. Seeking the SVG timelines raised it to 37 of 61;
the remaining 24 frames differed only inside the spinner's 20 by 50 pixel box, by up to 37
of 255 in one channel. Verdict **not-better** for the method as the source states it, and the
reason is now in the technique: a page runs on more than one clock, and the two-run comparison
is the gate that finds the one nobody stepped.

## What the realization cannot do

It films no sound, and it does not say which clock the last 24 frames were on; the box says
where to look. A page that animates through a canvas reading real time, or plays video,
would need its own seek, or has to be kept out of frame.
