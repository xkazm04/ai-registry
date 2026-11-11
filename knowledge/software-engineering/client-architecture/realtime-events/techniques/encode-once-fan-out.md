---
layer: technique
type: technique
subject: realtime-events
technique: encode-once-fan-out
status: forged
laws: [gate-sees-target]
shared_with: []
applied: experiment
ab_verdict: better
use_when: [one event is pushed to many open connections, every recipient's frame differs only in a sequence number or another envelope field, serialization dominates the cost of a broadcast, deciding whether a broadcast path should cache the encoded body]
---

# Encode once, splice the envelope per recipient

A server that pushes one event to many connections usually writes the obvious
loop: for each recipient, build the frame (envelope plus payload) and encode it.
When the recipients' frames differ at all, it is almost always in a small
envelope field - a per-connection sequence number, a per-connection ack id -
while the payload, which is nearly all of the bytes, is the same for everyone.
The loop then encodes the same payload once per recipient. The cost is linear in
the fan-out for work whose result does not change.

**Encode the shared body once. Per recipient, encode only the envelope field and
join the pieces.** The frame becomes three pieces: a head that carries the
per-recipient field, the shared body, and a tail.

## Join by gather, not by copy

Where the pieces are joined decides most of the saving. Measured on one 1.9 KB
event (seeded, non-ASCII text) in a garbage-collected runtime, CPU time against
encoding the whole frame per recipient:

| | serialization only, 1000 recipients | through 50 loopback sockets | through 2 sockets |
| --- | --- | --- | --- |
| splice by copy (head + body + tail into one new buffer per recipient) | 0.67x | 0.75x | 0.90x |
| splice by gather (head, shared body, tail handed to the socket as pieces) | 0.05x | 0.45x | 0.60x |

Splicing by copy still copies the body once per recipient, so it recovers only
about a quarter to a third of the cost. The large saving needs a transport that
takes a list of pieces and writes them without joining them first: a vectored
write, a corked socket fed piece by piece, or a runtime whose output takes nested
byte lists. If the transport only accepts one contiguous buffer, splicing still
helps, but by the copy row's margin, not the gather row's.

## The splice must be byte-identical to the full encoding

The splice replaces the encoder for the head, so it must not be able to produce a
frame the encoder would not.

- **Splice only a field whose encoding is closed**: an integer, or a value
  checked against a fixed alphabet. A string spliced raw breaks the frame the first
  time it contains a quote or a line break. In the measurement, a display name
  spliced raw made 2 of 3 frames differ from the full encoding and left both
  unparseable.
- **Write the head as text the encoder would have written**, same key order, same
  number format, and keep the field the consumer reads first in the same place.
- **Gate it against the target, not against itself.** One test encodes a set of
  frames both ways - the full frame per recipient, and the splice - and requires
  the bytes to be equal, including a payload with non-ASCII text, escapes and an
  empty collection
  ([gate-sees-target](../../../_laws.md#gate-sees-target)). A test that only parses
  the spliced frame passes a frame whose field order or number format has
  drifted from what every other producer sends.

## When not to use it

- **Identical frames for everyone.** If no field varies per recipient, there is
  nothing to splice: encode once and write the same bytes to every connection.
- **A few connections.** At two recipients the saving was 0.90x by copy and
  0.60x by gather, on a cost that was already under a tenth of a millisecond per
  event. One operator's handful of tabs does not need the extra code path.
- **A payload that is filtered or redacted per recipient.** Then the body is not
  shared, and a splice ships one recipient's view to another. Split the
  recipients into classes that see the same body, and encode once per class.
- **Compression or encryption per connection.** A per-connection compression
  context or cipher transforms the whole frame, so the shared bytes stop being
  shared after that stage. Encode once still saves the serialization; the
  gather saving does not survive.

## Source and measurement

The pattern was read in a real-time chat platform's gateway, which serializes a
broadcast payload once and splices the envelope per recipient because only the
sequence number varies. Measured with a seeded harness that changes no product
code (backlog 8-014, experiment mode): five rounds per cell, median, CPU time of
the sending process; the socket rows used a separate receiving process, and every
arm delivered the same byte count. The pre-registered target was 0.25x for gather
and 0.5x for copy at 1000 recipients; gather met it and copy missed it (0.67x),
which is why the copy row is reported as the weaker form rather than the rule.
