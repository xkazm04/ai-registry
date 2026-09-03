---
layer: golden-path
type: golden-path
subject: watch-cache-and-resync
status: forged
techniques:
  - desync-is-a-state
  - atomic-swap-at-initial-sync
  - completeness-barrier-with-a-warm-queue
  - one-stream-fanned-out
  - initial-read-strategy-behind-a-gate
---

# Watch caches and resynchronisation

This subject owns one decision and everything that decision costs: **a process
keeps a complete local replica of a remote store and reads the replica instead
of the store.** Not a cache of the answers it happened to ask for — a mirror of
an entire declared slice, filled once by an initial read, kept current by a
change stream, and consulted at in-memory cost by every part of the process
that needs to know what exists. The replica is not an accelerator sitting in
front of the read path. The replica *is* the read path.

That is a strong claim, and the corpus's default rule for a client holding a
copy of somebody else's data says the opposite: **invalidation, not
replication** — an event tells a consumer a fact changed, and the consumer
re-reads through the same authoritative path it would have used with no events
at all ([event bus & realtime
subscriptions](../../../client-architecture/realtime-events/realtime-events.md)). That rule
is right, and it is right for the reason it gives: under push-as-optimisation a
missed message costs staleness that the next read heals, while under
push-as-truth a missed message costs permanent divergence with nothing to heal
it.

Replication is admissible here — and only here — because the source publishes a
change stream with four properties, each of which is a load-bearing precondition
rather than a nicety:

- **Totally ordered.** Every change carries a position in one order over the
  whole slice, so "how far have I read" is a single opaque value and not a
  per-key vector clock.
- **Resumable.** The reader may hand a position back and receive everything
  after it, so a dropped connection costs a reconnect and not a re-read.
- **Compacting.** The stream carries the *current state of each identity*, not
  a journal of edits to be replayed in order. A replica that reads the whole
  slice and then follows the stream converges without ever reconstructing
  history, which is what makes a full re-read a cheap repair instead of a
  migration.
- **Explicitly desyncable.** When the reader's position has fallen outside the
  window the source retains, the source says so, in a distinguishable signal.
  It does not return an empty result, and it does not silently start from the
  oldest position it still holds.

**The discriminator is those four properties, not taste.** Before building a
replica, name each one against the actual source. If the change feed is not
totally ordered, the replica has no cursor and every reconnect is a guess. If
it is not resumable, every reconnect is a full re-read and the stream bought
nothing over polling. If it is not compacting, the replica is an event-sourcing
projection and belongs to whatever owns the log's retention. And if the fourth
property is missing — if a position that has expired comes back as *nothing
happened* — then the replica cannot know it is wrong, which is the failure this
whole subject is organised against: a replica that is **wrong is worse than a
replica that is late**, because lateness announces itself at the next event and
wrongness never does. Missing any of the four, invalidate; do not replicate.

## What this subject owns, and where each neighbour starts

The boundary work matters more here than usual, because five subjects already
hold pieces of this ground and each holds its piece correctly.

**[Sync, replication & conflict
resolution](../../../backend-platform/data-layer/sync-replication/sync-replication.md)** owns
the durable transfer loop and everything about it: the per-stream cursor and
its advance-after-settlement rule, the tick plus lossy wake plus persistent
dirty mark, the bounded first backfill, tombstones, and the conflict policy
that decides what happens when two writers disagree. This subject **composes
over that** and adds the half its golden path stops short of. Three
differences pick between them. First, sync-replication's replicas are *peers or
mirrors with their own durable store*; this subject's replica is **in memory
and disposable** — it holds no writes, contributes nothing back, and its
recovery is not a merge but a re-read from scratch. Second, and consequently,
**there is no conflict policy here at all**: a replica that never writes cannot
conflict, and any design that finds itself needing a merge rule has stopped
being a watch cache. Third, sync-replication's cursor is durable across
restart because the alternative is re-delivering everything; this subject's
cursor deliberately is **not** durable, because re-delivering everything is
exactly the repair, and it is affordable precisely because the stream compacts.
Use sync-replication when the copy outlives the process and can be written to;
use this subject when the copy dies with the process and is only read.

**[Event bus & realtime
subscriptions](../../../client-architecture/realtime-events/realtime-events.md)** owns the
other side of the discriminator above, and states it from there: events
invalidate, reads decide. That is the correct rule wherever the four properties
do not hold, which is nearly everywhere a user interface talks to a service —
and its consequence, that a system where push is an optimisation degrades to a
working system while a system where push is the truth degrades to a wrong one,
is exactly the risk this subject accepts on purpose in exchange for the desync
signal. It also owns the in-process fan-out mechanics that this subject reuses
wholesale: one boundary listener fanned out to N consumers, the cancelled-flag
discipline, the early-arrival buffer, and the reaping of the boundary
subscription when the last consumer leaves ([subscription
lifecycle](../../../client-architecture/realtime-events/techniques/subscription-lifecycle.md)).
What is added here is what happens when the thing being fanned out is not an
event but a *reference into a shared replica*, which changes the buffering
question and removes the payload-copy question entirely.

**[Client data fetching &
caching](../../../client-architecture/client-fetch-cache/client-fetch-cache.md)** owns the
demand-filled cache: keys, stale-while-revalidate windows, in-flight dedup,
warm remount. Its entries exist because somebody asked for them and its refresh
channel is a refetch. A watch cache has no keys anybody asked for — its
population is defined by a declared slice, not by traffic — and it has no
freshness windows, because its freshness is the stream's position and not a
clock. The picking rule is the population rule: **if the set of entries is
determined by what callers requested, that subject; if it is determined by a
declaration made before any caller existed, this one.**

**[Delivery guarantees &
dead-letter](../../../backend-platform/work-execution/delivery-guarantees/delivery-guarantees.md)**
owns the promise that an accepted event is processed approximately once, with
atomic claiming, stuck-reaping and dead-letter lanes. None of that applies to a
change stream that is allowed to lose events — and this stream is allowed to
lose them, because the replica does not derive its state from having seen every
event, only from having seen a consistent snapshot plus everything after it.
The rule is sharp and worth stating so nobody builds acknowledgement machinery
here: **a watch stream needs no per-event delivery guarantee, and the moment
correctness depends on one, the design has left this subject.**

The two siblings in this subcategory divide the rest. The contracts written
*onto* a record so that independent writers can converge on it — deletion
markers, ownership edges, per-field ownership, the gate before persistence —
belong to `declarative-resource-lifecycle`. The loop that reads the replica,
the queue whose unit is a deduplicated key, requeue policy and drain belong to
`convergence-loop-and-requeue`. This subject stops at the replica's edge: it
delivers a complete, consistent, self-repairing view and a signal saying when
that view first became usable, and it has no opinion about what is done with
it.

## Desync is a state, not an error path

The naive reading of the change stream is that errors are interruptions:
retry, resume from where you were, carry on. That reading is correct for every
failure except one, and the exception is not rare — it is the failure the
window was always going to produce. When the reader's position has aged past
the retained window, resuming from it is not slow, it is **wrong**: the source
either refuses or, worse, quietly serves from a different starting point, and
the replica now differs from the store in ways no future event will correct.

So the reader is written as an explicit state machine in which *desynchronised*
is one of the named states, reachable from every state that holds a cursor, and
whose only exit is a full re-read from an empty replica. Two consequences fall
straight out. The first is that the machine's transitions are enumerable and
therefore reviewable: for each state, what does an error do, what does an
end-of-stream do, and what does the desync signal do — and the answer to the
third is the same everywhere, which is how you can tell it is a state and not
a special case. The second is that **the machine must be drivable without the
real source**, because the desync path is the one path that never runs during
development and always runs in production. If the only way to reach the state
is a live source that has been ignored for the length of its retention window,
it is untested, and untested repair paths are how a replica spends an afternoon
serving a snapshot from before lunch. The state machine and its testability are
[desync-is-a-state](./techniques/desync-is-a-state.md).

## The replacement is atomic, and nothing reads a half-filled replica

A full re-read produces a second complete snapshot, and the interval during
which it is being assembled is the interesting one. The tempting
implementation applies each arriving object to the live replica as it lands and
deletes, at the end, whatever was not re-seen. During that interval every
reader sees a set that is neither the old snapshot nor the new one: entries
that were deleted while the process was away are still present, entries created
while it was away appear one at a time, and a reader that counts, groups, or
concludes *nothing here* gets a confident wrong answer.

The discipline is to assemble the new snapshot **beside** the live one and
install it in a single operation, so the only two states any reader can observe
are the previous complete snapshot and the next complete one. The stream's
protocol has to cooperate: it marks the beginning of a re-read, delivers the
snapshot's members as a distinguishable kind of event, and marks completion —
and that completion marker is the only place a swap may happen. The rule that
falls out is worth stating as a rule: **during a re-read the replica keeps
answering from the stale snapshot, and stale is the correct answer**, because
the alternative on offer is not freshness but incompleteness, and a consumer
can reason about age while it cannot reason about absence. See
[atomic-swap-at-initial-sync](./techniques/atomic-swap-at-initial-sync.md).

## Completeness is a readiness fact, and it is one-shot

The first fill is different from every later one, because before it there is no
previous snapshot to serve. An empty replica and a fully-populated replica over
an empty slice are indistinguishable at the read interface, and the consumer
that cannot distinguish them is usually the one that acts on the difference: a
convergence loop reading a cache that has not filled concludes that the things
it is responsible for do not exist, and **creates them again**. That is a
correctness bug producing duplicated real-world effects, not a latency bug
producing a slow first paint, and it is the single strongest argument for
everything in this subject.

The remedy is a barrier the replica publishes and dependents await: a one-shot
signal that opens when the first complete snapshot is installed, and that
**never closes again**. The one-shot property is the part that is easy to get
wrong out of symmetry. A later desync makes the replica temporarily stale, not
unusable, and re-closing the barrier would strand work already in flight behind
a gate that only the failed stream can open — the deadlock that the atomic swap
exists to make unnecessary. Meanwhile the work queue in front of the barrier
keeps accepting and coalescing, so the barrier costs latency on the first pass
and no work at all: by the time it opens the loop has a deduplicated backlog
rather than a cold start. Barrier and warm queue are one design and are
[completeness-barrier-with-a-warm-queue](./techniques/completeness-barrier-with-a-warm-queue.md).

## One stream, many consumers, one handshake

Several components in one process routinely want the same slice, and the naive
answer gives each its own stream. That answer costs N connections at the source,
N copies of the same objects in memory, and N independent desync clocks that
resynchronise at different moments — so two components reading "the same"
replica disagree, and the disagreement is invisible from inside either one.
The correct topology is one stream, one replica, and an in-process fan-out to N
consumers, which reduces the whole problem to the subscription lifecycle the
event subject already owns, plus two things that subject does not face. The
fan-out carries **identities, not payloads**, because the shared replica already
holds the object and a consumer that receives a reference reads the current
value rather than a snapshot of the value at notification time. And the channel
is **bounded with backpressure applied upward**, because a slow consumer must
slow the stream rather than be silently skipped: the replica's correctness
depends on the reader consuming every event in order, so shedding — the correct
answer for an event bus — is the wrong answer here. See
[one-stream-fanned-out](./techniques/one-stream-fanned-out.md).

## The initial read is negotiated, not chosen once

How the first snapshot arrives is a separate decision from how the stream is
followed, and it is a decision about the *source's* capabilities as much as the
reader's. Mature sources offer more than one initial-read protocol — a paged
read followed by a stream opened at the read's position, and a stream that
delivers the snapshot inline and then marks its own completion — and the second
usually depends on a server capability that a given deployment may not have
enabled. The rule is that **a reader keeps both paths and selects between them
explicitly**, because a capability that some deployments lack is not a
migration you can finish. The same section owns the read's consistency knob (a
strongly-consistent read is expensive at the source and often pointless for a
consumer that will process the results seconds later), the page size and where
its number comes from, and the periodic no-op progress markers that keep a
quiet stream's cursor advancing — without which a slice that changes rarely is
the slice most likely to desync, which is the opposite of what anyone expects.
See
[initial-read-strategy-behind-a-gate](./techniques/initial-read-strategy-behind-a-gate.md).

## What the replica owes the operator

A replica is infrastructure, and its health claims are observability claims.
Three numbers, each with its predicate
([count-carries-predicate](../../../_laws.md#count-carries-predicate)): how many
entries it holds and as of which position; how many times it has fully
resynchronised since start, because a rising count is the symptom of a window
too small or a consumer too slow, and neither is visible any other way; and
how long the first fill took, which is the number that sizes every dependent's
startup budget. A replica that reports only "connected" is reporting the
transport, not the replica — the same proxy failure a health check makes when
it pings a host instead of exercising the protocol
([gate-sees-target](../../../_laws.md#gate-sees-target), and the general
discipline is [health
checks](../../service-operations/health-checks/health-checks.md)). And memory is
a first-class concern rather than an afterthought: the replica's footprint is
the whole slice, so the levers — replicating only the fields consumed,
narrowing the slice by selector, and dropping bulk metadata on the way in — are
design decisions made when the slice is declared, not optimisations found later
under pressure.

## The techniques

- [desync-is-a-state](./techniques/desync-is-a-state.md) — the explicit state
  machine, the desync signal as a state transition rather than an error,
  why a stale cursor may never be resumed, and driving the machine without a
  live source.
- [atomic-swap-at-initial-sync](./techniques/atomic-swap-at-initial-sync.md) —
  assembling the new snapshot beside the live one, the completion marker as
  the only swap point, and why serving stale beats serving partial.
- [completeness-barrier-with-a-warm-queue](./techniques/completeness-barrier-with-a-warm-queue.md)
  — the one-shot readiness signal, why it never re-arms, and the queue that
  keeps coalescing behind it.
- [one-stream-fanned-out](./techniques/one-stream-fanned-out.md) — one
  handshake for N consumers, identities rather than payloads on the channel,
  bounded backpressure instead of shedding, and reaping.
- [initial-read-strategy-behind-a-gate](./techniques/initial-read-strategy-behind-a-gate.md)
  — two initial-read protocols kept side by side, the capability gate, the
  consistency knob, and progress markers on a quiet stream.
