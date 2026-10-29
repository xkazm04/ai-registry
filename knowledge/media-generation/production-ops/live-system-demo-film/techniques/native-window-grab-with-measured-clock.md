---
layer: technique
type: technique
subject: live-system-demo-film
technique: native-window-grab-with-measured-clock
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
use_when: [recording a desktop application that cannot be recorded from inside a page, driving a native shell through its debugging channel while the screen is grabbed, the picture and the driver run on two clocks that drift apart]
---

# The native window grab with a measured clock

A desktop application built on an embedded web view cannot be recorded the way a
browser page can: the page recorder does not own its window, and a window with a
transparent or composited surface has no pixels of its own to hand over. So the
picture is the **screen**, and the application is driven through its debugging
channel. That split, one tool that sees and another that acts, is the source of
every problem this technique exists to solve. The two tools run on different
clocks, the screen shows everything on the desktop and not only the application,
and the driver reports positions in a coordinate system the video does not share.

## The stage owns the desktop

A screen grab records whatever is on the screen, which on a working machine
includes other people's work. Treat the grab region as a stage that the capture
sets up and tears down, never as a window the operator is trusted to leave in
front:

- **Fix one rectangle and put the application's windows in it, on top.** Size the
  main window to the exact video size the film will use, mark the windows as
  topmost for the length of the take, and put every window back afterwards. The
  first take of a film made without this recorded an unrelated browser and an
  unrelated customer's tool in the same frame as the product.
- **Inset the region by the window's invisible frame.** A window's outer rectangle
  carries a shadow border of several pixels that shows whatever lies behind it.
  Grab the visible rectangle, not the outer one, and choose the outer size so the
  visible part is the target size exactly.
- **Move secondary windows out of the region when a beat does not use them.** A
  small helper window floating over the surface the beat is about hides the thing
  being shown. Park it outside the grab and bring it back on the beat that needs
  it, by the same call that laid the stage out.
- **Look at one frame before the first take.** Grab a single frame of the staged
  region and read it. Leakage is visible in one glance and invisible in the
  driver's own logs, which report success whatever is behind the window.
- **Delete a rejected test grab.** A frame that caught the operator's other work
  is not a deliverable and should not outlive the diagnosis.

## Calibrate the clock from the picture

The driver's wall clock and the video's frame clock agree at the start and drift
from there; over a take of a few minutes the difference is large enough to put a
caption on the wrong beat. Estimating the offset from when the grab reported its
first frame leaves an error of half a second or more, and nothing in the take
shows it. Measure it instead:

1. Before the first beat, have the driver draw a full-window flash in a colour the
   product never uses, hold it for a few frames, and note the wall time.
2. After the last beat, do it again.
3. Read one pixel per frame of the video from a spot that is inside the flashing
   window and not covered by any other window, and find the first frame of each
   flash.
4. The two frame indexes against the two wall times give the offset and the
   scale. Convert every beat's start and end from the wall clock to the video's
   with them.

The measured drift on takes of between fifteen and forty seconds was a fraction of
a percent, which is too small to see and too large to ignore across a full film,
and the method costs two flashes at the ends of footage nobody will use. A take
with fewer than two flashes found must fail: the clock is then unknown, and a film
cut on an unknown clock is an unmeasured claim presented as sync.

## Rectangles from the page to the video

Targets are located by the driver in the page's own coordinates. The video is in
device pixels measured from the grab region. The mapping is the window's position
on screen, plus the page offset, times the display's pixel ratio, minus the
region's origin. Check it once by drawing the logged rectangle onto a real frame
of the take; a systematic offset of a few pixels is the invisible frame again, and
it is far easier to see in a drawn box than in numbers.

## Failure modes

- **Success by the driver's own report.** Every step returned, every target was
  found, and the picture shows the wrong window. Assert on the picture, not on the
  absence of errors.
- **The flash that the film shows.** The calibration flashes sit outside every
  beat's window; a flash inside a window means the clock is wrong, which is itself
  the detection.
- **A region that spans two displays or a gap between windows.** Whatever lies in
  the gap is in the film. Lay the windows out to cover the region completely.
- **A target selector that matches a hidden twin.** Two controls with the same
  label, one disabled, one live; a strict locator fails and a loose one clicks the
  wrong one. Select the enabled, visible one explicitly.

## Decision rules

- When the application cannot be recorded from inside a page, grab the screen and
  drive the application through its debugging channel, because that is the only
  pair that sees it truthfully and acts on it.
- When the grab region is set, lay the stage out in code and restore it in code,
  because an operator's arrangement will not survive the next take and will leak.
- When a clock is needed, measure it from marks in the picture at both ends,
  because a start-only estimate hides the drift that a long take accumulates.
- When a take's clock cannot be measured, fail the take, because every caption
  and callout is timed from it.
