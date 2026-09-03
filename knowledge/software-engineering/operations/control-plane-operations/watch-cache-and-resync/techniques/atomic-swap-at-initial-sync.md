---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: atomic-swap-at-initial-sync
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse]
shared_with: []
use_when: [a resynchronisation makes readers see a half-filled replica, deciding what a reader sees during a re-read, entries deleted while disconnected refuse to disappear]
---

# Atomic swap at initial sync

A replica that repairs itself by re-reading its whole slice spends an interval
holding two answers: the snapshot it has been serving, and the snapshot it is
assembling. This technique is the discipline that **no reader ever observes a
mixture of the two**, and it is short to state and easy to get wrong under the
pressure of wanting the new data to be visible as soon as it arrives.

## The procedure

1. On the marker that begins a re-read, allocate a **fresh empty collection**
   as the assembly buffer. Do not clear the live one. Do not reuse the previous
   buffer's storage — releasing it and allocating anew returns the memory,
   where clearing in place holds a peak-sized allocation for the life of the
   process, and the peak is the size of the largest slice ever read.
2. For each item delivered as a snapshot member, write it into the buffer.
   Readers continue to be served from the live snapshot throughout, and are
   told nothing.
3. On the completion marker, **install the buffer as the live snapshot in one
   operation** — a pointer or map swap under the same lock every reader takes
   — and release the old one. This is the only point at which the visible
   answer changes.
4. After the swap, and not before, publish the completeness signal
   ([completeness-barrier-with-a-warm-queue](./completeness-barrier-with-a-warm-queue.md)).
5. Ordinary events arriving outside a re-read apply directly to the live
   snapshot. There is no buffer in the steady state, and adding one would only
   add latency.

Step 3 is what makes the whole re-read a legitimate recomputation of a stored
derivation rather than a partial overwrite of one
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
the re-read either happened entirely or it did not happen at all.

## Why serving stale beats serving partial

The tempting variant applies snapshot members to the live collection as they
arrive and, at the end, removes whatever was not re-seen. It shows fresh data
sooner and it is one collection instead of two, and it produces, for the length
of the re-read, a set that is neither snapshot: entries deleted while the reader
was away are still present, entries created while it was away appear one at a
time in arrival order, and the collection's size passes through every value
between the two.

The failure is not that readers see old data — they would see old data under
the correct design too. It is that readers see a set that **was never true**,
and the consumers most damaged by it are the ones asking set-shaped questions:
how many of these exist, which of these are missing, is this collection empty.
A consumer reasoning about a snapshot that is thirty seconds old draws a
conclusion that was correct thirty seconds ago and will be corrected by the
next event. A consumer reasoning about a half-installed snapshot draws a
conclusion that was never correct and that nothing will contradict, because the
membership it inferred is exactly the membership the completed swap will also
show. Staleness is a bounded, announceable, self-healing error; incompleteness
is an unbounded silent one.

The rejected variant has one legitimate use and it is worth naming so the rule
does not overreach: when the consumer is a display that streams items in as
they arrive and never asks a set-shaped question, progressive application is
fine and the buffer is waste. The test is whether any consumer can conclude
*absence* from the collection. If one can, the swap is mandatory.

## The delete you never see

The reason the swap must *replace* rather than *merge* is deletion. A change
stream carries deletions as events, and events that occurred while the reader
was disconnected are precisely the ones it did not receive. Merging a fresh
snapshot into a live collection preserves every entry the snapshot omits — so
records deleted during the gap are resurrected and persist forever, which is
the same resurrection failure the sync subject names for durable replicas,
arriving here through a different door. Replacement is what makes an omission
mean *deleted*: the protocol's contract is that anything present before the
re-read and absent from it should be treated as removed, and only a wholesale
swap honours that contract without the reader having to compute a difference.

## Identity, and the trap of keying on a name

The buffer and the live collection are keyed, and the key decides what
"the same entry" means across a swap. Keying on a human-assigned name is the
obvious choice and it is wrong in one case that matters: a record deleted and
recreated under the same name between two snapshots is a **different record**
that occupies the same key, so a consumer holding a reference sees a silent
substitution rather than a removal followed by a creation. Where the source
mints a unique identity at creation, the key includes it
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); where it
does not, the limitation is documented at the replica's read interface rather
than left for a consumer to discover, because a consumer that keys durable
local state on the replica's key inherits the ambiguity without ever being told
about it.

The pragmatic counter-argument is real and should be answered rather than
ignored: consumers frequently want to look an entry up by name alone, and a key
carrying a creation identity makes that lookup impossible. The resolution is to
key on identity and offer a by-name index beside it, not to weaken the key.

## Boundary

This technique owns the moment of replacement and nothing else. What *triggers*
a re-read is
[desync-is-a-state](./desync-is-a-state.md); what dependents do with the fact
that a first snapshot now exists is
[completeness-barrier-with-a-warm-queue](./completeness-barrier-with-a-warm-queue.md);
how the snapshot's members are obtained is
[initial-read-strategy-behind-a-gate](./initial-read-strategy-behind-a-gate.md).
And the durable analogue — a replica whose recovery is a merge against a base
version rather than a wholesale replacement — is [conflict detection and
policy](../../../../backend-platform/data-layer/sync-replication/techniques/conflict-detection-and-policy.md),
which applies exactly when the local copy has writes of its own to defend. A
watch cache never does, which is the whole reason a swap is available to it.
