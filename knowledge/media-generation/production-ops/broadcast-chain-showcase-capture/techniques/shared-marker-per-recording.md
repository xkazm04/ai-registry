---
layer: technique
type: technique
subject: broadcast-chain-showcase-capture
technique: shared-marker-per-recording
status: forged
laws: [unmeasured-is-not-pass, causality-over-sequence]
shared_with: []
use_when: [one film cuts between several recordings of the same take, aligning a tool window, a broadcast output and a platform player recording, a cut between recordings looks out of sync]
---

# A shared marker in every recording

When a take produces more than one recording, every recording carries the same marker at
its start and at its end, and each recording is put on the take's clock by its own
measured marker frames. The marker is one event, fired once by the driver, that becomes
visible in each recording at the moment it reaches that recording's part of the chain.

This extends the single-window clock of a demo film, where a flash drawn inside the one
recorded window fixes offset and drift. It does not replace it: each recording still finds
two flashes and still fails without them. What changes is where the flash is drawn and what
the flash is allowed to prove.

## Why one flash per window is not enough

A chain film has several windows, and the naive extension draws a flash into each of them
from the driver. That aligns each recording to the driver's wall clock, and it hides the
thing the film is about. A flash painted directly into the player's window arrives
instantly; the platform's delay never enters the measurement, and the film then cuts the
platform result under the action that caused it as though delivery took no time.

The shared marker travels the path the evidence travels. It is drawn in the tool's window
and, at the same instant, raised as a source in the broadcasting software, so it enters the
broadcast output by compositing and the platform player by delivery. Each recording sees it
when its part of the chain sees it, which is exactly what the cut needs to know.

## Procedure

1. **Choose a marker nothing else on screen can be.** A full-region flash in a saturated
   colour no product surface, overlay or stream art uses, held long enough to survive the
   platform's compression and frame-rate conversion, so one sampled patch per frame finds
   it reliably.
2. **Fire it at both ends of the take.** One marker gives an offset; two give an offset and
   a scale, and the scale is where a long take's drift shows.
3. **Lift the broadcast marker to the top every time it fires.** Sources the tool adds
   during the take land above whatever was placed at setup, so a marker positioned once at
   the start is under the overlays by the end.
4. **Clear every layer the marker cannot beat before firing it.** Inside an application
   window, surfaces in the platform's top layer (modal drawers, popovers, native dialogs)
   draw above any stacking value a page can set. Close them, return the tool to a neutral
   view, then fire the end marker; an end marker drawn under an open drawer is not in the
   recording.
5. **Sample a patch nobody covers**, inside the marker region and outside every overlay,
   control and dialog, and confirm it on a probe frame before the take.
6. **Record the wall time of each firing** and find the first marker frame in every
   recording.
7. **Fail the alignment of any recording that found fewer than two markers.** Its clock is
   unknown, and every cut into it is unmeasured.

## A marker found is not the right window found

The marker proves that *something* in the recorded region turned the marker colour at that
frame. It does not prove which window that was. The broadcasting software's own window has
a preview pane that shows the marker the instant it is composited; if that window slides
over the player's region, the player recording "finds" both markers on time, the alignment
passes, and the recording is of the wrong window. The tell is the platform delay: a marker
that reaches the platform recording no later than it reaches the broadcast recording did
not come through the platform. Treat a chain delay at or below zero as a failed recording,
never as a fast platform.

## Fallback, declared

A recording may lose one marker for a reason worth carrying on through: the platform
session dropped before the end, a top-layer surface hid the end flash in the tool window.
Then that recording is aligned by its one marker and the driver's own interval between
firings, assuming no drift, and the alignment carries a mark naming the recording and the
assumption. An estimated alignment may cut a rehearsal or a review; a delivered film cuts
only on measured ones.

## Decision rules

- When the film cuts between recordings, align every recording by its own markers, because
  the cut asserts a sequence between them.
- When a marker must reach a recording through the chain, fire it through the chain and
  never paint it into that recording's window directly, because a marker that skips the
  chain cannot measure it.
- When a marker is missing, mark the alignment estimated and name the recording, because
  an estimate that reads as a measurement is the defect this technique removes.
- When the platform recording's marker is not later than the broadcast recording's, fail
  that recording, because the platform cannot deliver before it receives.

## When not to use it

A film with one recording uses the single-window flash and needs nothing more. A film that
shows the chain only as a tiled desktop in one capture already has one clock, and its panes
cannot be cut apart anyway; it still needs the chain marker to measure the platform delay,
which is the next technique's business.
