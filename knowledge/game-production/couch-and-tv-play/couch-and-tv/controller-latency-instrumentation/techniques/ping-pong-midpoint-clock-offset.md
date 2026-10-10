---
layer: technique
type: technique
subject: controller-latency-instrumentation
technique: ping-pong-midpoint-clock-offset
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [turning a controller-side timestamp into the screen device's clock, estimating one-way age without synchronised clocks, a fresh connection has no offset yet]
---

# Ping-pong midpoint clock offset

The controller and the screen device each read a monotonic clock that started at an
arbitrary moment, so a timestamp from one means nothing on the other until the two are
related. The offset is estimated with a three-instant exchange, the older and simpler
cousin of the four-instant exchange that network time protocols use. Both are two-party; the
difference is how many readings the answering side contributes. The controller sends a probe
carrying its send instant, the screen device answers with that instant echoed back plus one
reading of its own clock, and the controller notes its receive instant.

## Procedure

Let the controller's send instant be t0, the screen device's reading in the reply be T,
and the controller's receive instant be t1. The round trip is t1 minus t0. The estimated
offset, which is what must be added to a controller timestamp to express it in the
screen device's clock, is T minus the midpoint of t0 and t1. Apply it at the receiving end
when an input arrives: the corrected stamp is the controller's stamp plus the offset, and
the age at consumption is the consumer's clock minus that corrected stamp.

Three details decide whether this is an instrument or a decoration.

The echo must be the controller's own send instant, returned verbatim. If the controller
looks the instant up from a table by sequence number it can look up the wrong one after a
reconnect; if the screen device substitutes its receive instant it measures a different
interval. Carry the original value in the reply and compute the round trip from it.

Both timestamps must come from clocks that never step. A wall clock that is adjusted by
the operating system mid-session produces an offset that jumps and an age series with a
cliff in it. Use the monotonic clock on both sides, and treat any wall clock as unusable
for this.

"Never steps" is not "never stops" and not "never changes rate". As documented in 2026, a
page's high-resolution clock pauses while the device sleeps in most browsers, except on
one desktop platform. So after a phone's screen lock, the controller's clock has lost the
whole sleep, and an offset estimated before it is wrong by that much. A monotonic clock on
a host whose time daemon is slewing can also run fast or slow by far more than the crystal
drift: it never jumps, but its rate is not stable. Treat a resume as a discontinuity, the
same as a reconnect.

The controller's receive instant must be taken as early as possible after arrival. Every
millisecond of handling jitter on the controller's side is charged to the offset as if it
were network time.

## One reading or two

The single reading on the screen device is where the three-instant form pays. Whatever the
screen device spends between receiving the probe and taking its reading counts as outbound
network time. With equal legs, that handling time shifts the offset by half its length, and
it inflates the round trip, and so the bound, by all of it. A reply sent from the socket
handler costs well under a millisecond. A reply queued for the game's next simulation step
can cost a whole step, which at sixty steps a second is up to eight milliseconds of bias in
a quantity measured in tens.

So answer the probe from the receive path, never from a game tick, and take the reading
just before replying. Where the answer cannot be immediate, send two readings instead of
one: the screen device's receive instant T2 and its transmit instant T3. Then the offset is
half of (T2 minus t0) plus (T3 minus t1), and the round trip used for the bound is (t1
minus t0) minus (T3 minus T2). The handling time drops out of both. This is the network
time protocol's own formula, and it costs one more number in the reply.

## What the estimate means, and its error bar

The midpoint is exact only when the outbound and return legs took equal time. If the
outbound leg took a and the return leg took b, the estimate is wrong by half of a minus b,
and since neither can be negative the error can never exceed half the round trip. That is
the error bar, and it is a property of the sample, not of the method: a clean sample of
four milliseconds carries a two-millisecond bar, a queued sample of eighty carries forty.
Record the round trip beside the offset so the bar travels with the number.

Two consequences follow. First, a one-way age derived from this offset is never more
trustworthy than half the round trip of the sample behind it, so an age of a few
milliseconds measured on a link whose best round trip is ten has no meaning below five.
Second, the error is a bias, not noise: every input in the session is shifted by the same
amount, so the whole distribution slides left or right rather than widening. A sliding
distribution cannot be detected from inside it.

## Decision rules

- **When inputs arrive before any probe has completed, do not synthesise an offset.**
  Fall back to the receive instant, and flag the stream as unsynchronised in every
  report; the consumer's age is then a lower bound that excludes the outbound leg.
- **When a corrected stamp is in the consumer's future by more than a small tolerance,
  reject the input and count it.** A future stamp means the offset is wrong, and
  admitting it makes the age negative and the tail look better than it is.
- **When an age comes out negative, count it before any clamp.** A clamp to zero is
  acceptable for the control path, but the count of clamped values belongs in the report,
  because it is the only trace of a bad offset the distribution will ever show.
- **Probe on a timer for the life of the connection, not once.** Clocks drift against
  each other slowly and a single early sample goes stale; which sample to keep is the
  selection technique's concern, and the probe rate must be low enough that probes are not
  themselves load.
- **Re-estimate after every reconnect, and after every resume from sleep or a hidden page.**
  A new connection can cross a different path with a different asymmetry, and a resumed
  page's clock may have stopped while it slept. The previous offset has no claim on either.
  A socket that survived the sleep is not evidence that the clock did.
- **Answer the probe where it is received.** A reply that waits for the game loop charges
  half the wait to the offset; when it must wait, return both of the screen device's
  readings.

## When not to use it

- **When the receiving side can read the controller's clock directly**, as with a wired
  controller on the same machine. There is nothing to estimate and the estimate would only
  add error.
- **When only the round trip is wanted.** The round trip needs no offset at all, and
  computing one adds a failure mode for nothing.
- **When the link is known to be strongly asymmetric**, as on some cellular and satellite
  paths. The half-round-trip bound then understates the real error and the technique
  should be replaced, not tuned.

## What this does not give you

It gives the age of an input at the moment the simulation read it, in one clock. It does
not give the time until a frame showing the result is on the display, and a report that
presents it that way has promoted a consumption figure to a photon figure; the labelling
technique and the optical protocol exist to stop that.
