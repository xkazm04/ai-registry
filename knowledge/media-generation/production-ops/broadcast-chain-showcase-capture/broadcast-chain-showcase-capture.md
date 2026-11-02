---
layer: golden-path
type: golden-path
subject: broadcast-chain-showcase-capture
status: forged
use_when: [filming a tool a streamer runs so the audience sees the action and its result on stream, recording a tool window, the broadcast output and the platform player for one film, a showcase of a stream tool reads as broken or unreadable, deciding what to check before a take that goes through a live broadcast]
techniques:
  - shared-marker-per-recording
  - platform-latency-measured
  - player-page-and-window-ownership
  - one-overlay-per-shot
  - probe-before-take
---

# Broadcast-chain showcase capture

A tool a streamer runs does nothing visible where it runs. The streamer presses a button
in a control window; the consequence appears somewhere else entirely, in the picture the
broadcasting software composites, and then again, seconds later, in the player a viewer
watches on the streaming platform. A film that shows only the control window shows a
settings screen. A film that shows only the stream shows an effect with no cause. The
showcase of such a tool is the discipline of **filming the whole chain, the action in the
tool, its result in the broadcast and its arrival on the platform, on one clock, with a
stream picture that was designed to be looked at**.

The principle the subject holds to:

> **The stream picture is the evidence; the tool window is the caption.** The audience
> believes a stream tool works when they see its result in the frame a viewer would see.
> The tool's own interface explains what was asked for. If the stream picture is
> unreadable, the film has no evidence, however good the tool window looks.

This inverts the instinct of a team filming its own product. The team built the tool
window, polished it, and wants it on screen; the stream picture is something the tool
merely touches. For the audience it is the other way round. The control window is
interesting only because of what it causes, and what it causes lives in a picture the team
does not fully own: the streamer's scene, the broadcasting software's compositing, a
platform player that adds its own chrome and its own delay.

## Three recordings, one clock

The chain produces three pictures that no single capture can hold well: the tool's window,
the broadcasting software's program output, and the platform player. A screen grab of a
desktop with all three windows tiled on it is one capture, but every pane is small and the
platform pane is already late; the edit that wants to cut between them full-frame needs
each as its own recording. Three recordings means three clocks, and a film that cuts from
the button press in one to the result in another is making a causal claim with the cut.
If the clocks are aligned by eye, the claim is a guess.

The repair is a **marker shared by every recording**: one event, fired once at the start
and once at the end of a take, that is visible in each capture at the instant it reaches
that capture. The tool window shows it when it fires; the broadcast output shows it when
the broadcasting software composites it; the platform player shows it when the platform
delivers it. Each recording then carries its own measured start and end, and the cut
between them is made on a measured offset, not a remembered one
([shared-marker-per-recording](./techniques/shared-marker-per-recording.md)).

## The platform is late, and the lateness is measured

Between the broadcast output and the platform player sits the platform's ingest,
transcode and delivery. Low-latency modes bring that to a second or a few; ordinary
segment-based delivery runs to many seconds; the figure varies by session, by player
setting and by viewer. A film that shows the button press and the platform result
side by side, without saying the platform is late, either hides the delay with an
invisible edit or shows a result arriving "too late" and reads as a defect.

The same marker that aligns the recordings measures the delay, provided the two arrivals
are compared on one clock. Subtracting the marker's position in one file from its position
in another is the tempting arithmetic and it is wrong, because separately started captures
never start together; the error is the gap between their starts, and it can exceed the
delay, so the same formula gives a plausible second on one take and a negative one on the
next. Measured properly, at both ends of the take, the delay decides three things: how the
film cuts the platform pane, how long the take keeps recording after its end marker, and
what, if anything, the film says about responsiveness. A delay at or below zero is not a
fast platform; it is a recording of the wrong window or a sum across two clocks
([platform-latency-measured](./techniques/platform-latency-measured.md)).

## Every window in the frame is owned

A capture of the platform player is a capture of a web page that the platform designs for
engagement: recommendations, chat, banners, a consent prompt, an autoplay preview. A
capture of the broadcasting software is a capture of an application that opens dialogs
whenever its state changes. And the desktop all of this sits on has other applications
that raise windows, notifications and drawers whenever they like. Each of these is an
uninvited window in a recording, and each arrives at the moment of greatest activity,
because state changes are what the film is about.

The most dangerous of them is the broadcasting software itself. Going live opens its
information panels and brings its main window forward, and its preview pane shows the very
markers and overlays the platform recording is looking for, so a recording of the wrong
window can pass an automated alignment. So the capture owns its windows: the player is
opened on the platform's minimal player-only page rather than the channel page, each
recorded window is found by an identity the driver gave it, raised, sized and re-pinned at
every beat, the broadcasting software is parked where no region can see it, and the take
checks that nothing covers the pixels it reads its markers from
([player-page-and-window-ownership](./techniques/player-page-and-window-ownership.md)).

## One overlay is the subject of each shot

A stream tool usually owns several overlays. A showcase that provisions all of them and
then films beat after beat shows every overlay in every shot, and the one the beat is
about is lost among the others. Worse, if the product places overlays by default, the
film shows a pile. The film's direction is that **each shot has one overlay as its
subject**, visible and placed; the others are hidden or absent for that shot. The shot is
applied when its overlay exists, which for an overlay born inside the beat is after the
action and not at the beat's start, and a shot that found its subject missing fails the
beat instead of logging a line. That is a
direction decision with a disclosure, not a cover-up: the film declares that overlays were
shown one at a time, and a composition defect the director worked around is filed against
the product, not fixed in the film
([one-overlay-per-shot](./techniques/one-overlay-per-shot.md)).

## The take is probed before it is spent

A take through a live chain costs more than a take of a local application. It needs the
broadcasting software live, a platform session, a stream that may be public, and a
rehearsal store in a known state. Most of the ways it fails are visible in one frame
before it starts: a dialog over the player, the wrong scene on program, a source that has
not painted, an overlay left over from the previous take, an end marker that will be
covered. The tool's own dry run, which walks the beats and screenshots the tool, sees none
of these, because it looks at the caption and not at the evidence. A **probe** grabs one
frame of each recording region with the chain live, applies every shot the film will use
and checks the program picture for each, and the take does not start until the probe
passes
([probe-before-take](./techniques/probe-before-take.md)).

## Why a showcase of a stream tool fails

The characteristic failure is not a crash. Every step of the take succeeds: the tool
received its commands, the broadcasting software composited its sources, the platform
delivered the stream. The film is still unwatchable, because the stream picture, which is
the evidence, was never designed or checked as a picture. Overlays sit on top of each
other in the centre; pale cards read as broken over a black scene; a dialog from the
broadcasting software covers the platform pane for a whole take; another application's
window drifts across the capture; the end marker is hidden so the clock cannot be closed.
None of those is visible in the tool's logs, and every one of them is visible in a single
frame. A team that judges the take by its logs ships the failure; a team that judges it by
the stream picture catches it before the take.

The case that taught this subject ended that way. Every take's beats reported success and
every recording found its markers. The cross-file delay figures read about one to two
seconds on three takes, against a preparation note that had expected several, and minus
one and a quarter seconds on the fourth, which is how both the arithmetic and the window on
that take were found wrong. And the film was abandoned. On that take the broadcasting software's go-live panel sat over the platform
region for the whole recording; on another a drawer left open in the tool hid the end
marker; another application's window crossed the platform capture; the overlays, provisioned
without placement, stacked in the canvas centre as pale cards that read as broken over the
dark scene; and the shot for the giveaway plate was applied before the plate existed, so
the plate arrived unplaced. The tool window looked finished throughout, which is precisely
why it could not carry the film.

The honest outcome of a take that fails this way is to say so. A film abandoned because its
stream picture was not presentable has taught what the next take must check, and it is
recorded as such rather than salvaged with edits that make the tool look better than the
stream does.

## What a principal practitioner holds true

- The stream picture is the evidence. A showcase that is good in the tool window and bad
  in the stream has shown nothing.
- Every recording carries the same marker at both ends. A cut between recordings on an
  unmeasured offset is a causal claim made by guess.
- Platform delay is measured per take, on one clock, from the markers, and stated. A typed
  latency figure is a claim about a different session, and a delay at or below zero is a
  failed recording.
- A marker found proves the colour changed, not which window changed it.
- The capture owns every window in its regions and checks the marker pixels are uncovered;
  a dialog that appears with a state change appears in the take.
- Each shot has one overlay as its subject. Choosing that is direction; hiding a product
  defect by it is not, and the defect goes to the product.
- One probe frame per region before the take, against a written list of conditions. A take
  started without one spends the chain to discover what one frame would have shown.

## Boundaries

**Against [live-system demo film](../live-system-demo-film/live-system-demo-film.md)**,
which owns the general craft of filming a working system: audio-first pacing, the script
as single source, the recorder that asserts its claims, the seeded stage, the
recorder-owned overlay, and the native window grab with a clock measured from flashes.
This subject inherits all of it and adds what a chain of three pictures needs: a marker
that every recording shares rather than a flash inside one window, a delay between
recordings that is itself a measurement, windows the capture does not own and must
control, and a stream picture that is directed shot by shot. The rule: if the question is
about filming one system, it is the demo film; if it is about the relation between the
tool, the broadcast and the platform in one film, it is here.

**Against [stream moment capture](../../streaming/live-show/stream-moment-capture/stream-moment-capture.md)**,
which finds and cuts the moments worth clipping out of a broadcast. That subject's material
is the stream itself and its question is which seconds travel. This subject's material is a
film about a tool and its question is how the stream is recorded so the tool's effect is
believable. Both deal with the lag between a cause and its evidence; moment capture
reconstructs a cause from a reaction, this subject measures a delay it caused on purpose.

**Against [overlay composition and safe area](../../streaming/broadcast-integration/overlay-composition-and-safe-area/overlay-composition-and-safe-area.md)**,
which owns where each overlay sits on the streamer's canvas and the proof that the
composed scene reads. A showcase uses that subject's check as one of its probes and does
not restate it; what it adds is the film's choice of which overlay each shot is about.

Cross-cutting invariants these techniques cite live in [`_laws.md`](../../_laws.md).
