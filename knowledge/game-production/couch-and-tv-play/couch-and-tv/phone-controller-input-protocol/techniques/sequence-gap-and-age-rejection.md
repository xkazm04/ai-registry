---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: sequence-gap-and-age-rejection
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [validating frames from an untrusted controller, a controller's clock is unrelated to the host's, deciding what to count when frames are lost, late or duplicated]
---

# Sequence, gap and age rejection

The named concern: the checks a host applies to each incoming controller frame before it is
allowed to change anything, and the counters that make the link's health visible. The
defect this prevents is acting on an old frame because it was the newest one that arrived.

## The checks, in order

1. **Shape.** Every number is finite, every index is inside the declared range. A frame that
   fails is dropped whole and counted; partial acceptance of a malformed frame invents a
   posture the player never made.
2. **Order.** The sequence number must be strictly greater than the last accepted one. A
   frame at or below it is an old duplicate or a reorder, is rejected, and is counted as
   *out of order*, a different counter from *dropped*. The comparison is strict: the same
   number twice is a duplicate, and applying it again is harmless but uncounted noise.
3. **Gap.** If the sequence jumped by more than one, the difference minus one frames were
   never seen. Count them as dropped. The gap is information about the link, not a reason
   to refuse the frame: the frame that follows the gap is the newest truth.
4. **Age.** Translate the phone's send time onto the host's clock and compare it with the
   host's receive time. A frame older than the limit is refused; so is a frame stamped in
   the *future* by more than a small tolerance, which can only mean the clock translation
   is wrong or the sender is not what it claims. A future stamp is not an old frame that
   passed, it is evidence that the clock estimate has failed, and it should be counted
   separately if the numbers will be read.
5. **Accept.** Clamp the channels, store the frame, record the host receive time, bump the
   accepted counter, and tell the phone the outcome.

The order matters in one place. The sequence is advanced *before* the age check, so a frame
rejected for age still moves the high-water mark and every older frame is rejected after it.
Reverse the order and a rejected stale frame leaves the mailbox willing to accept an even
staler one later.

## Translating the clock

The phone's send time is meaningless on the host without an offset. Measure it with round
trips: the phone sends a ping carrying its clock, the host answers with its own clock, and
the phone estimates the offset as the host's time minus the midpoint of the round trip,
keeping the estimate from the *lowest-latency* sample seen on this connection, because the
minimum round trip is the one least distorted by queueing. It sends the offset to the host,
which uses it to translate every frame's stamp. Until an offset exists the host has no way
to judge age from the stamp, and the honest fallback is to use its own receive time and say
so rather than trust a number in a different clock's units. The offset is per connection and
is discarded when the seat's connection changes; an offset from a previous radio session is
a wrong number that looks measured.

## What each counter is for

Four counters per seat, read in the host's metrics, each with its own unit: accepted frames,
dropped frames (gaps plus rejections), out-of-order frames, and the age in milliseconds of
the frame the simulation consumed. They are not decoration. A rising dropped count with a
flat out-of-order count says the radio is losing frames; a rising out-of-order count says
the radio is reordering them; a stale-consume count says the player's actual experience has
degraded. A tuning session that cannot separate these cannot tell the player's problem from
the host's.

## Decision rules

- **When a frame is rejected, still acknowledge it with the outcome.** The phone needs to
  know acceptance to show link health and to detect a host that has stopped listening.
- **When the sequence does not advance, reject; when it jumps, accept and count.** A jump is
  a loss report; it is not an error.
- **When the stamp is in the future beyond the tolerance, refuse and treat the clock
  estimate as suspect.** Do not clamp it to now; clamping makes an unknown stamp look
  fresh.
- **When the connection is new, reset the sequence expectation.** The phone restarts its
  numbering at zero; a host that kept the old high-water mark rejects every frame of the new
  session as out of order. The reset and the phone's restart must be paired and tested
  together.
- **When no offset exists yet, say so in the metrics.** An unsynchronised seat is
  *unmeasured*, not fresh.

## Evidence status

Measured by scripted checks: a duplicate sequence is rejected and counted out of order; a
jump from four to seven counts two dropped; a non-finite value drops the frame; a frame
older than the limit is refused; a stamped-in-the-future frame is refused; a reset of the
connection lets numbering restart at zero. A scripted client against a real host also
received the acceptance flag in its acknowledgement, including a refusal. Not measured: the
accuracy of the clock offset on a real wireless link, and the right future tolerance, which
is a chosen number. The tolerance should be confirmed once real round-trip variation has
been seen on a physical handset.

## When not to use this

- **For a link carrying one-time commands.** Those are guarded by the host's phase and are
  idempotent; sequence and age checks on a start-race message only produce spurious
  rejections.
- **When the host cannot afford a clock exchange.** Fall back to receive-time-only age, and
  accept that a burst of frames held by the radio will look fresh.
- **Over a transport that already orders and bounds delay.** The sequence check is then
  redundant, though the age check usually is not.
