---
layer: technique
type: technique
subject: sync-replication
technique: in-flight-is-per-connection
status: forged
laws: [count-carries-predicate, record-precedes-effect]
shared_with: []
use_when: [every new edit resends all previously unacknowledged batches, sync traffic grows with round-trip time rather than with edits, deciding what state a retransmit queue keeps per connection, a reconnect must replay without duplicating]
stage: multi-service
---

# In-flight is per connection

A sync client holds an outbox of unacknowledged batches. The naive push loop
sends *the whole outbox* whenever anything changes, which is correct on a fast
link and quietly quadratic on a slow one: at a high round-trip time every new
edit finds the previous edits still unacknowledged and sends them again. The
server deduplicates, so nothing is wrong and nobody notices, except that the
bytes, the latency and the battery are all multiplied.

## The rule

Keep two different facts about each batch and give them different lifetimes:

- **Pending** is durable. A batch is pending until the server acknowledges it
  by its id. It survives restart.
- **In flight** is not durable and belongs to one connection. A batch is in
  flight once it has been written to *this* socket. It is never persisted
  (a reloaded snapshot starts all-unsent), and it is cleared in one place when
  the connection drops.

The push loop sends `pending minus in_flight`, marks what it sent, and an
acknowledgement removes the batch from pending. Reconnect clears every flag, so
the next connection replays the whole durable outbox with the same
deduplication ids. Two properties follow and both are testable:

1. N edits at any round-trip time produce N successful pushes, not a
   triangular number.
2. A dropped connection loses no batch, because nothing in flight was ever
   promoted to acknowledged.

Two corollaries keep the flag honest. Never coalesce a batch that is in flight
(the server has seen its id; merging changes what the id means). And an
explicit quota or rate-limit retry keeps its head-of-queue position rather than
being treated as a fresh edit.

## Measuring it

The measurement is cheap and the result is large enough to see at three runs:
twenty edits at 100 ms spacing over a link throttled to 2 KiB/s per direction
with 600 ms added one-way delay, three alternating runs per arm, fresh room
each time. The pre-fix arm made 30 successful push attempts (range 30 to 61)
for 20 unique batches; the fixed arm made exactly 20 every run. Outbound bytes
fell about 29 percent and completion about 26 percent. Report the repeated
experiment, not the best single run: an earlier single comparison showed a
larger gain, and the median is the honest figure. The counts are application
bytes of the decrypted stream, not wire bytes, and the predicate (successful
push attempts for unique batches) must travel with the number.

## Boundary

This sits between the cursor technique (what the server has seen) and the
conflict policy (what to do when copies disagree). It decides only what a
client resends. Idle and stall detection on the transport is a separate
question, see the progress-lease technique in the stream-proxy-hop subject.
