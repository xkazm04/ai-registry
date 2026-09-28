---
layer: technique
type: technique
subject: media-playback
technique: sender-declared-playout-bound
status: forged
laws: [gate-sees-target, absent-guard-is-loud]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [a live stream is decoded by a receiver engine you do not own and its latency creeps up after a burst of motion, the receiver's own delay knob is set to zero and the delay does not come down, choosing the playout delay for interactive remote control or game streaming, a latency fix is verified by reading back the value that was set, a stream's delay only resets on reload]
---

# Sender-declared playout bound

## The case

A live stream - a remote desktop, a game, a camera someone is steering - is decoded
by a receiver the product does not own: a browser's real-time media stack, a
platform player, a vendor's client. That receiver keeps an **adaptive playout
buffer**: it watches frame arrival timing and frame sizes, estimates jitter, and
holds each frame long enough to render smoothly. Its depth is exactly the trade
[committed-buffer-steering](./committed-buffer-steering.md) names - stall
protection and reaction latency bought from one budget - except that here the
product never gets to choose. The receiver chooses, and it chooses for a use it
cannot see. It does not know whether the stream is a film that should never stutter
or a pointer that must follow a hand.

Two properties make that choice hard to live with in an interactive stream:

- **The adaptation falls much more slowly than it rises.** A burst of large frames
  (high motion, a scene cut, a keyframe train) raises the estimate within seconds;
  calm lowers it over minutes. Measured on one current receiver: timing-only jitter
  recovered to baseline about 25 s after it stopped, but frame-size jitter raised
  the applied delay from 6-7 ms to a 58-68 ms peak and it was still 24-31 ms sixty
  seconds later, in three of three runs. It is not a one-way ratchet; it is a slope
  steep enough that a user sees the delay as permanent until a reload resets it.
- **The receiver's own knobs are floors, not setpoints.** A target or hint set on
  the receiving side tells the adaptation "at least this much". Set to zero it is
  the default, and it does nothing to a buffer that has already grown: the knob
  arm tracked the untouched arm to within 2-3 ms in every window.

So the lever that works is on the other side of the wire.

## The rule

**When latency is part of what the product sells and the receiver is foreign,
declare the playout bound from the sender, in band, on the media itself.** The
real-time transport carries a per-packet header extension with a minimum and a
maximum playout delay; a receiver that has negotiated it treats the range as the
space its adaptation may use. The sender is the only party that knows the use, so
it is the right party to state it:

| use | bound | why |
| --- | --- | --- |
| interactive control, no audio (remote desktop, pointer, game) | min = max = 0 | a late frame is worth less than a fresh one; render on arrival |
| conversation with audio | a range, e.g. a few tens to a few hundred ms | the receiver's adaptation is right inside a ceiling you set |
| smooth playback of a live feed | min = max = a fixed K | constant delay beats a delay that wanders |

What the bound did, measured against the same jitter schedule:

- stamped from the first packet, the applied delay stayed at 0 ms in every window,
  through the jitter and after it, while the unbounded arm sat at 24-31 ms a minute
  after the burst;
- stamped only **after** the buffer had grown (the literal repair: can a sender pull
  a risen buffer down?), the applied delay fell from 60 ms to 0 ms within one
  five-second sample and stayed there, while the unbounded arm was still at 48-57 ms;
- stamped at min = max = 400 ms, the delay pinned at 382-390 ms through the same
  jitter. The bound **pins**, in both directions; it is not merely a way to lower.

## What it costs

Zero delay removes smoothing, so jitter that used to become delay becomes visible
stalls instead. Over fifteen seconds of heavy jitter the bounded arm froze for 6.3 s
against 3.9-4.5 s unbounded. Once the jitter stopped, frame rate and freezes were
identical. That is the trade to make on purpose: for a pointer it is the right one,
and for anything with speech it is not. That is why the table has three rows.

## Three ways to get it wrong

**Verifying the knob instead of the delay.** The receiver-side knob reads back
exactly what was set, and the receiver's reported *target* delay keeps moving under
a sender bound. In the late-stamp arm the target statistic stayed at 38-41 ms
while the delay actually applied to frames was 0. Neither number is the thing
gated. Measure the delay each frame actually spent in the buffer: cumulative buffer
delay over frames emitted, per interval ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

**Letting a missing negotiation pass silently.** The bound exists only if the
receiver accepted the extension during session setup. The natural implementation
looks up the negotiated identifier and, finding none, passes packets through
unchanged. Now a receiver that declined it, or an intermediary that stripped it,
produces the old latency with no signal anywhere. Record whether the bound was
negotiated, per session, where the latency is reported
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

**Justifying the bound by a ratchet instead of by the use.** Whether a given
receiver's adaptation decays in twenty seconds or in ten minutes depends on its
version and on whether the jitter came from timing or from frame size. A design
that sets the bound "because the receiver never shrinks" will be argued away the
first time someone watches it shrink. The reason that survives is that the receiver
cannot know the use, and the sender can.

## Every packet, or once

The extension's specification allows a sender to stop stamping once the receiver
has acknowledged a packet that carried the current values. One receiver kept a
bound stamped only during the first five seconds for the remaining ninety. Stamping
every packet is therefore robustness, not a requirement: it costs three bytes a
packet and survives a lost first packet, a receiver restart and a mid-stream
renegotiation without any acknowledgement tracking. Take it unless the header
budget is tight.

## When not to use it

- **The receiver is yours.** Set the bound where the buffer lives. The in-band field
  is for crossing an ownership line.
- **On-demand or recorded playback.** The receiver's adaptation is doing the right
  job there, and a sender bound only takes smoothing away from content that could
  have afforded it.
- **You own only the receiving side** of someone else's stream. You cannot declare
  the bound, and your knobs are floors. The honest options are a reset (renegotiate
  the session) and telling the user the delay is not yours to set.

## Relation to its neighbours

[committed-buffer-steering](./committed-buffer-steering.md) prices buffer depth when
the product owns the queue. This is the case where the depth is chosen by an engine
across the wire, and the only authority the product has is what it writes on the
packets. [engine-adapters](./engine-adapters.md) treats a foreign engine's state as a
mirror to reconcile. Here the foreign engine's *policy* is steered by a declaration
it has agreed to honour, which works only where such a declaration was negotiated.
