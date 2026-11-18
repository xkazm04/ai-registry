---
layer: technique
type: technique
subject: live-system-demo-film
technique: frame-stepped-page-capture
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [recording a browser page for a demo film, a page recording stutters or drops frames during a camera move or a transition, a cut needs the exact frame an on-screen action happened, the recorder's frame rate differs from the film's, a stepped capture is not identical between two runs]
---

# Frame-stepped page capture

A page recorded in real time keeps whatever frames the recorder managed to sample. Under
load that is far fewer than the film needs: a camera flight across a drawn scene came out
as about 21 distinct frames of 36. Even at rest the recorder's own fixed rate rarely
matches the film's, so a 25-frame stream resampled to 30 repeats one frame in six. And an
action's time is known only within the recorder's latency.
[recording-that-asserts-its-claims](./recording-that-asserts-its-claims.md) counts the frames
a sampler dropped and fails a take whose picture clock drifted. This technique removes the
drop instead of counting it: **the page does not run while it is filmed, it is stepped.**

## The mechanism

Replace the page's clock with one the driver controls, then render one output frame per
step:

1. **Install a controllable clock before the page loads**, covering the wall clock, the
   high-resolution timer, timers and animation-frame callbacks. Load the page and let it
   reach rest on that clock.
2. **Pause, then for each output frame advance exactly one frame interval and take one
   screenshot.** Frame `i` is time `i / fps`, whatever the machine's speed. A slow render
   makes the take slower, not shorter.
3. **Perform actions at frame indexes.** A click scheduled for 3.5 s happens between frame
   104 and frame 105, and the cut, the captions and the narration read that index rather
   than a logged wall time.

## A page runs on more than one clock

The script clock is the one that can be replaced. Two others keep the browser's real time
and must be seeked on every step:

- **Style animations and transitions.** Pause each running animation and set its current
  time to the frame's time. A page whose motion is all style-driven looks frozen, or
  jumps, when only the script clock is stepped.
- **Declarative animations inside SVG documents.** These are not reported by the page's
  animation list at all. Pause each SVG root's own timeline and set its current time.

Anything still moving after those three is on a clock the driver does not own: a playing
video element, a canvas that reads real time, an effect the compositor runs. Find it before
the take, not in the cut.

## The gate: two runs of one frame

Determinism is the property this technique sells, so test it rather than assume it: capture
the same frame indexes in two separate runs and compare the images. Identical frames mean
every clock is owned. A region that differs is a clock not yet owned, and the bounding box of
the difference says where it is. Run the check on the pages the film uses, before the first
take, and report the count of frames that matched. A stepped capture that was never compared
against itself is an unmeasured claim of determinism
([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)).

## Decision rules

- **When a page carries continuous motion (a flight, a transition, a looping indicator),
  step it.** Real-time capture is acceptable only for a page at rest between actions.
- **When the two-run check shows a differing region, own that clock or keep the region out
  of frame.** Never publish a sync or frame-accuracy claim over a region that moved on its
  own ([output-never-outruns-evidence](../../../_laws.md#output-never-outruns-evidence)).
- **When the page plays sound, stepping records none.** Place the sound in the edit from
  the action's frame index or the product's own event log, not from a capture.
- **When the page waits on a real network response, let it settle on the paused clock
  before stepping resumes.** A stepped clock does not make a server answer sooner, and a
  step taken mid-request films the loading state.

## When not to use it

A desktop application whose page the recorder cannot reach is grabbed from the screen
instead, under [native-window-grab-with-measured-clock](./native-window-grab-with-measured-clock.md).
A film of a page that is static between actions gains little: the real-time recording's
duplicate frames are invisible on a still picture.

## Evidence status

One project's demo film captured a web scene by stepping the script clock and seeking every
style animation per frame: 29 to 30 distinct frames of 30 against about 21 of 36 in real
time, with exact action times; that project already noted that style transitions keep the
real clock. A second project's design page, captured both ways for 4 s at 30 frames per
second: the real-time recorder delivered a 25 frame-per-second stream, so 99 of 118 frames
changed against 119 of 119 stepped. The same page showed the gate's value: frames stepped
with the script clock and style animations owned matched across two runs 0 times in 61,
because a declarative SVG spinner kept the real clock; seeking the SVG timelines raised that
to 37 of 61, and the remaining 24 differed only inside the spinner's 20 by 50 pixel region.
Converges with a deterministic page-to-video renderer that renders by seeking an integer
frame index and never by playing.
