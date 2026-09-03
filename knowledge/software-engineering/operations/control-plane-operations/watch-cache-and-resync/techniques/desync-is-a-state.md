---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: desync-is-a-state
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a reconnect resumes from a cursor that may have expired, a replica quietly disagrees with its source, the repair path has never been exercised]
---

# Desync is a state

A stream reader that keeps a position has exactly two failure families, and
conflating them is the defect this technique exists to prevent. **Transport
failures** — the connection dropped, the source refused, the read timed out —
leave the position valid; the repair is to reconnect and resume. **Positional
failures** — the position is no longer inside the window the source retains —
leave the position *meaningless*; the repair is to discard everything and read
the whole slice again. The two arrive through the same channel, look alike in
a log, and are handled identically by every reader written as a retry loop.

## Make the reader a state machine, not a loop

The shape that keeps the two families apart is an explicit enumeration of the
reader's states, with one step function that takes a state and returns an item
plus the next state. The states are the ones the protocol actually has:

- **empty** — nothing read yet; the next step begins the initial read.
- **reading the initial snapshot** — items are being delivered as snapshot
  members, and no position is yet usable.
- **snapshot complete, holding a position** — the snapshot is installed, the
  stream not yet open.
- **following** — the stream is open; every item advances the position.

Desync is not a sixth state; it is a **transition available from every state
that holds a position, and its target is `empty`**. Writing it as a transition
rather than a state is the point — it removes the possibility of a code path
that observes the signal and continues, because there is no state to continue
in. The reciprocal rule is that every *other* error keeps the position and
returns to the state it came from, which is what makes a retry loop safe for
everything except the one case it must not handle.

Three transitions are easy to get wrong and worth writing down before the
first line of code:

**A stream that ends without an error returns to *snapshot complete*, not to
*empty* — provided a complete snapshot exists.** A closed connection is a
transport fact; the position it left behind is still inside the window.
Re-reading the whole slice on every idle timeout converts a routine reconnect
into a full re-read on a fixed cadence, which is a load amplifier disguised as
robustness. The qualifier is the half that gets dropped: an end-of-stream
*during* the initial snapshot has no complete snapshot and no usable position
to return to, so it resets to `empty` — the same input, two destinations,
decided by which state received it, which is the clearest argument for
enumerating states rather than branching on errors.

**Detect a dead connection yourself; do not wait for the source to close it.**
Sources close idle streams on a schedule, and a reader that treats "no items"
as "nothing is happening" will wait forever when the network dropped the
connection without either end noticing. Arm an idle timeout at the source's own
close interval plus a small margin — the margin is what stops the client racing
a close that is on its way — and treat expiry as an end-of-stream, which the
transition above already routes correctly.

**A missing or empty position on an item is a desync, not a parse warning.** An
item that carries no position cannot advance the cursor, so continuing means
following the stream with a cursor frozen at some earlier point — which will
age out and desync later, far from the item that caused it. Fail immediately to
`empty`: an absent position is not a position
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

**The initial read has its own desync.** If the snapshot itself is being
delivered as a stream, the signal can arrive mid-snapshot, and the answer is
the same — discard the partial snapshot and start again — but the code path is
a different one, and it is the path most often left out. Enumerating states
first is what surfaces it.

## The rejected alternative, and the force that kills it

The alternative is to treat every stream error alike: reconnect, resume from
the last position, and let the source sort it out. It is smaller code and it
works in every test anyone writes, because reaching the failure it mishandles
requires the reader to be absent for longer than the source's retention window
— minutes at least, and typically only under a load spike or a long garbage
collection pause, i.e. exactly when nobody is reading logs carefully.

What kills it is the failure's shape. A source asked to resume from an expired
position does one of two things, and both are worse than an error. It refuses,
in which case a reader that treats the refusal as transient reconnects into a
refusal loop and the replica freezes at its last-known state while the process
looks healthy — a stalled stream is not the same observable as an idle one
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). Or
it silently starts from the oldest position it still holds, in which case the
replica misses every change in the gap and **never learns it did**: entries
deleted during the gap remain forever, entries created during it never appear,
and no future event repairs either, because the stream only carries changes and
nothing changed about the things it missed. The replica is a stored derivation
of the source, and the full re-read is its named recomputation
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation));
resuming from an expired position skips the recomputation while claiming to
have done it.

## The rule for reasoning about the window

Two numbers decide how often the desync path runs: the source's retention
window, and the longest interval during which the reader may fail to advance
its position. The second is not the same as downtime — a reader that is
connected but not consuming, because a downstream consumer is applying
backpressure, is not advancing either. Size the consumer chain so its worst-case
stall is a small fraction of the window, and **measure the resynchronisation
count** rather than asserting the margin: a rising count is the only honest
evidence that the margin was mis-sized, and it is cheap to emit.

The corollary sounds paradoxical and matters: a slice that changes rarely is
the one most likely to desync, because a position that only advances on change
is a position that ages. Sources that offer periodic no-op progress markers
solve this, and enabling them is not an optimisation — see
[initial-read-strategy-behind-a-gate](./initial-read-strategy-behind-a-gate.md).

## Drive the machine without the source

The desync path is the one path that never runs during development and always
runs eventually in production, so it is tested or it is decorative. A state
machine written as *(state, input) produces (item, next state)* is testable by
construction — feed it a scripted sequence of protocol items and assert the
state sequence — but only if the interface it reads from is one the tests can
substitute. The discipline is to make the source a narrow interface with two
operations (read a page, open a stream at a position), so a fake can be handed
in. Without that seam the machine has the shape of a testable design and none
of the benefit, which is a specific and common failure: the enum is right, the
transitions are right, and the only way to reach them is a live source that has
been ignored for the length of its retention window.

The tests worth writing are four: the signal mid-stream resets to `empty`; the
signal mid-initial-snapshot resets to `empty` and discards the partial;
an ordinary transport error keeps the position; and an item without a position
resets rather than continuing.

## When this does not apply

If the source does not distinguish an expired position from an ordinary
failure, this technique cannot be built and the replica should not be either —
go back to the golden path's four properties and invalidate instead of
replicating. If the reader's cursor is durable across restarts and the source
retains changes indefinitely, the positional-failure family does not exist and
the durable transfer loop in [change tracking and
cursors](../../../../backend-platform/data-layer/sync-replication/techniques/change-tracking-and-cursors.md)
is the right shape — that technique owns advance-after-settlement and the
bounded first backfill, which this one deliberately does not restate. And if
the repair for a lost position is a merge rather than a re-read, the copy is a
peer and belongs to that subject entirely.
