---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: send-on-change-with-a-heartbeat-floor
status: forged
laws: [declaring-an-input-is-not-consuming-it, one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [the host resends an identical display snapshot to every phone many times a second, a large catalogue is re-sent on a timer over a reliable socket, a controller page rewrites its interface on every message whether or not anything changed]
---

# Send on change, with a heartbeat floor

The concern: the stream a host sends back to each controller — speed, position, the weapon's charge,
the garage catalogue, the career card — is a snapshot too, and a host that rebuilds and resends it on
a fixed timer pays for every unchanged copy three times: once to build and encode it, once on the
radio, and once on the phone, which parses it and rewrites an interface that did not change. A phone
sitting in a menu that receives ten identical frames a second is doing all of that work for nothing.
The remedy is to send the display stream only when it changed, with a slow heartbeat as the floor so
that a quiet stream still proves the link is alive — and to make every stage of the path, down to the
page's document, skip work for values that did not change.

## Procedure

**1. Build into reused buffers and compare before sending.** The host serialises the snapshot into a
buffer kept across ticks, compares it with the last snapshot sent to that seat, and sends only when
they differ or when the heartbeat interval has passed since the last send. A change still reaches the
phone within one tick; a static screen costs one frame per heartbeat.

**2. Separate the slow block from the live block.** Catalogues, names, the car's statistics and the
career card change on phase changes, not every tick. Send them in full on a phase change and on every
connection or reconnection, then as deltas or not at all. On a reliable, ordered transport a delta is
never lost, so a periodic full refresh is a safety net against bugs, not against loss, and its
interval can be long — a minute, not seconds.

**3. Send only what the consumer reads.** For each field in the live block, find the code on the phone
that reads it. A field the page never reads is cost with no consumer, and the diagnostic readers who
do want the full object get it from their own endpoint, built when they ask for it
([declaring-an-input-is-not-consuming-it](../../../_laws.md#declaring-an-input-is-not-consuming-it)).
Numbers go out at the resolution the consumer displays, in a fixed-point form, not as the longest
decimal the language will print.

**4. Shrink the uplink frame to what the host needs.** Axes rounded to the resolution the simulation
can use, a send time to the resolution the age check uses, and channels at their resting value left
out under a written contract that a missing channel reads as resting. The contract is stated on both
ends; a host that read a missing field as "unchanged" instead of "resting" would turn the omission
into a latched control.

**5. Make the page write only on change.** The controller page caches the last value it wrote to each
text node, meter, class and accessibility attribute, and touches the document only when the new value
differs. A slow block whose objects are preserved across deltas is skipped by identity instead of by a
deep comparison. Interface writes on every acknowledgement are the single largest idle cost of a
controller page, because each one can force the browser to lay the page out again. Do not rely on
the browser to notice that a written value equals the old one: some engines skip such a write in
narrow cases and others invalidate anyway, so the guard in the page's own code is the only
behaviour that holds everywhere.

**6. Measure frames, bytes and page work, per phase.** Frames per second and bytes per second per
phone, in a menu and in a race; the page's layouts, mutations and main-thread time per second. State
where each was measured ([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

## Decision rules

- **When suppression is added, the heartbeat floor is added with it.** A stream that goes silent when
  nothing changes is indistinguishable from a dead link, and the phone's failure detector needs the
  floor to tell them apart.
- **When the transport is not reliable and ordered, suppress only with acknowledged baselines.** Over a
  lossy link, a delta against a snapshot the receiver never got is wrong; send against the last
  snapshot the receiver acknowledged, or send whole snapshots. This is how datagram game protocols
  have long done it, and there a full snapshot goes out on joining or after heavy loss, not on a
  timer; over a reliable socket the same full snapshot belongs to joining and reconnecting.
- **When the uplink carries a held control, it is not suppressed.** The absolute-state cadence is the
  heartbeat the host's staleness rule depends on; send-on-change applies to the display stream and to
  idle uplink, never to a held posture.
- **When a field is removed from the live block, its readers move with it.** The diagnostic endpoint
  that used it builds it lazily from the same source, so there is still one producer of each value
  ([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)).
- **When a page reconnects, it gets everything.** Change suppression is per seat and per connection; a
  new connection starts from an empty "last sent".

## When not to use

Not for the input uplink during play, which is the protocol's heartbeat and must stay periodic. Not
where the snapshot is tiny and the phone renders it with a single cheap write: the comparison costs
more than the copy. And not as a first fix for a page that is slow for another reason — a layout read
after every write, a handler that runs on every pointer move — where the bytes on the wire were never
the cost.
