---
layer: technique
type: technique
subject: broadcast-chain-showcase-capture
technique: platform-latency-measured
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [a film shows a result arriving on the streaming platform, deciding whether to show or hide the platform's delay, a narration or caption states how fast the stream reacts, sizing how long a take waits for its end marker]
---

# Platform latency, measured per take

The delay between the broadcast output and the platform player is measured on every take,
on one clock, from the shared markers, and that measurement is the only figure the film
may state, cut to, or wait for.

## Why a known figure is not a measurement

Delivery delay depends on the platform's latency mode, the player's buffer, the viewer's
network and the session. Published figures are wide and come mostly from vendors:
segment-based delivery commonly sits at twenty seconds or more, low-latency modes at one
to a few seconds, and the vendors' own ranges are configuration-dependent targets rather
than independent benchmarks. A preparation note that says "three to ten seconds late" is a
planning prior. A film that types "about two seconds" is stating a property of a session it
did not record, and a film that offsets the platform pane by a remembered figure puts a
result under the wrong action whenever today's session differed.

## Measure on one clock, not across two files

The obvious arithmetic is wrong. Each recording knows where the marker falls *in its own
file*; subtracting the broadcast file's marker position from the platform file's gives the
delay only if both files started at the same instant, and separately started captures never
do. The error is the gap between their starts, it changes every take, and it can be larger
than the delay itself, so the same formula yields a plausible second on one take and a
negative figure on the next.

Two forms are sound:

1. **Both pictures in one recording.** Grab one region that contains the broadcast preview
   and the player, or record the player with a local marker beside the chain marker:
   painted directly into the player's window at the moment of firing, it arrives
   instantly, while the chain marker arrives through delivery. The two frame indexes are on
   one clock, and their difference is the delay.
2. **Every recording's start on the driver's clock.** Log the wall time at which each
   capture produced its first frame, measured rather than requested, convert each marker
   frame to wall time through that start, and subtract wall times. This is weaker, because a
   capture's first frame is reported with its own latency; state the tolerance beside the
   figure.

Measure at both ends of the take. The two figures and their difference say how much the
delay moved while the film was being made.

## Use the figure in three places

- **The cut.** When the delay is short against the beat's hold, show the platform pane on
  the take's clock and let the result arrive late: that is the truth, and a second's lag
  reads as a stream. When the delay would land the result in the next beat, cut the
  platform pane on the measured offset and declare in the film's boundary that it did.
- **The wait.** The take keeps recording after the end marker until the marker could have
  reached the platform: the measured delay plus a margin, not a fixed guess sized for the
  worst mode. A wait sized for segment-based delivery on a low-latency session spends
  fifteen seconds of every take on nothing; one sized below the session's delay loses the
  end marker.
- **The words.** A caption or line about responsiveness quotes the range measured across
  the takes the film used, or says nothing.

## Decision rules

- When the delay is at or below zero, the platform recording is of the wrong window or the
  arithmetic crossed two clocks; fail the take's latency rather than report it.
- When the delay moved by more than a few frames between the two markers, interpolate
  across the take, because a single offset is right only at the end it was measured.
- When only one end could be measured, the delay is measured at that end and estimated at
  the other, and it is labelled so.
- When the film hides the delay by cutting, the boundary says so, because a viewer who
  later sees the delay on their own stream will otherwise read the film as faked.
- When a declaration is claimed in a source comment, check the document it names actually
  carries it; a disclosure that exists only as a promise in code is not made.

## When not to use it

A film that never shows the platform player has no platform delay to measure. A film whose
subject is latency itself needs a measurement rig with its own clock source, not two
flashes per take.
