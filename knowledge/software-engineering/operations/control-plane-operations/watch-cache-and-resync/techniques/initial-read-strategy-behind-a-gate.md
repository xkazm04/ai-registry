---
layer: technique
type: technique
subject: watch-cache-and-resync
technique: initial-read-strategy-behind-a-gate
status: forged
laws: [limits-are-derived, unknown-is-not-a-value]
shared_with: []
use_when: [the source offers a newer initial-read protocol some deployments lack, choosing between a consistent read and a cheap one, a rarely-changing slice desyncs more often than a busy one]
---

# The initial read, kept behind a capability gate

Filling a replica for the first time is a different operation from following
its changes, it has more than one correct implementation, and which
implementations are available is a property of the deployment rather than of
the code. This technique is the discipline of keeping both paths, choosing
explicitly, and being honest about what each choice costs.

## Two protocols, and why both stay

The long-standing shape is **read then follow**: page through the whole slice,
note the position the read was consistent at, then open a stream from that
position. It works against any source that can paginate and can open a stream
at a position, which is to say all of them.

The newer shape is **follow with the snapshot inline**: open the stream with a
flag asking the source to emit the current state as a prelude and then mark the
prelude's end with a progress marker. It costs one round trip instead of many,
avoids a large materialised page at the source, and removes the gap between the
read and the stream. It also depends on a source-side capability that a given
deployment may not have — an older version, an unset feature switch, a proxy
that does not forward the flag.

The rule: **when a better protocol depends on a capability the fleet does not
uniformly have, it is added beside the old one and selected explicitly; it does
not replace it.** A capability gate is not a migration that finishes, because
the reader does not control the deployments. Two consequences follow. Options
that only affect one path say so at their declaration, or callers will set them
and wonder why nothing changed — a knob that silently does nothing on the
selected path is a lie with a straight face. And the selection must be visible
in the replica's reported state, because the two paths fail differently and an
operator diagnosing a fill needs to know which one ran.

The reconnect case is the detail this gets wrong most often. The
snapshot-inline flag belongs to the **first** stream only; a stream reopened at
a held position must not ask for the prelude again, or every routine reconnect
replays the whole slice. Model the two as distinct phases at the point where
the request is built, rather than as a boolean somebody remembers to clear.

## The consistency knob

Sources typically offer the initial read at two consistency levels: a
strongly-consistent read that reflects every write acknowledged before it, and
a cheaper read served from the source's own cache that may be arbitrarily
behind. The strong read is the safe default and the wrong one for a large
slice.

The reasoning is specific and generalises. A consumer of this replica will
process what the read returned over the following seconds or minutes — the
queue is deep, the loop is rate-limited, the objects are many. A consistency
guarantee that expires the moment the read completes has bought nothing for a
consumer that will not look at most of the results until long after that
moment, and it has cost the source a coordinated read across its whole slice
at precisely the time it is under pressure — the resynchronisation of a large
consumer is often correlated with the source having a bad day. So: **strong
consistency when the read's result is acted on immediately and a stale answer
is a correctness problem; the cheap read when the result feeds a queue.** The
honest form of the cheap read is the one that specifies a floor — *not older
than this position* — rather than *any version at all*, because a read with no
floor can legitimately return a state older than one the reader has already
seen, and a replica that moves backwards is worse than one that is behind.
Wherever the cheap read is used, the replica's reported position must be
carried with its answers; an unknown age presented as the current state is the
laundering this rule exists to prevent
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## The page size is a derived number

Paged reads need a page size, and it is a real trade: smaller pages cap the
peak memory of a fill and cost more round trips; larger pages do the reverse.
The number should be derived and the derivation written beside it
([limits-are-derived](../../../../_laws.md#limits-are-derived)) — a memory budget
for the fill divided by a worst-case entry size is the honest form, and it
re-derives when either input changes.

Two weaker practices are common and should be recognised for what they are.
Pinning to the value another well-known client defaults to is a *compatibility*
argument, not a derivation: it inherits the other client's memory assumptions,
which were made about different objects in a different process, and it does not
move when yours do. And leaving the size unbounded is a decision to let the
largest slice the deployment ever holds decide the peak, which is the same
number nobody measured. Pinning is defensible when the argument is explicitly
"match the reference implementation so operators' expectations hold"; it stops
being defensible the moment the fill's memory is the constraint, and at that
point the number must be re-derived rather than nudged.

## Progress markers on a quiet stream

A position that only advances when something changes is a position that ages,
so **the slice that changes least is the slice most likely to desync** — the
opposite of everyone's intuition, and the reason a rarely-used replica
resynchronises on a schedule set by the source's retention window while a busy
one never does.

Sources that offer periodic no-op progress markers on an otherwise idle stream
solve this exactly: the marker carries a current position and nothing else, the
reader advances its cursor, and the position never ages while the connection
lives. Enable them. They are also what makes the inline-snapshot protocol
expressible at all, since its end-of-prelude signal is one such marker carrying
a distinguishing annotation. Treat the switch that disables them as a debugging
affordance rather than a tuning option, and say so where it is declared: the
saving is a handful of tiny messages per interval, and the cost is a
resynchronisation of the entire slice on a cadence the reader does not control.

## Boundary

This technique covers how the first snapshot is obtained and at what
consistency. What is done with the snapshot once assembled is
[atomic-swap-at-initial-sync](./atomic-swap-at-initial-sync.md); when a fill is
triggered by a lost position is [desync-is-a-state](./desync-is-a-state.md).
The bounded, resumable, chunk-at-a-time first backfill for a replica whose
progress is durable is a different design under different forces and is owned by
[change tracking and
cursors](../../../../backend-platform/data-layer/sync-replication/techniques/change-tracking-and-cursors.md)
— there, partial progress is kept because re-reading is expensive; here, partial
progress is discarded because re-reading is the repair.
