---
layer: technique
type: technique
subject: read-serving-replicas
technique: client-carried-index
status: forged
laws: [verdict-survives-boundary, gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [a client cannot read back what it just wrote, choosing how a lagging replica answers a request that expects newer state, deciding whether writers should wait for replicas, designing a consistency token that survives load balancing]
---

# Client-carried index

The properties a client actually wants from a replicated read path are
per-session: *read your writes* (a read after my write reflects it) and
*monotonic reads* (a later read never shows less than an earlier one).
Neither is a property of any node. They are properties of a sequence of
requests from one client, and the only party that knows the sequence is
the client. So the client carries the proof: the server returns, with
every response, an opaque index naming the position the responding node
had applied; the client echoes the latest index it holds on every
subsequent request; a node behind that index does not answer as if it
were current. Consistency becomes something one client buys for one
request, at the cost of latency on a lagging node, and the writer is never
made to wait for anyone.

## The index

The index is **opaque to the client and totally ordered at the server.**
On a log-replicated backend it is the applied index; on a shared database
it is whatever monotone position that backend exposes (a log position, a
transaction serial), encoded so the client cannot parse it and need not.
The client stores it as a string, replaces it with whatever the newest
response carries, and sends it back. It never compares two indexes itself,
because the encoding is the backend's and a client that decoded it would
break on the next backend.

Monotonicity across replicas comes from the ordering being the
authority's: every node's index is a position in the same log. And it comes
from a server-side rule: a response's index is never older than the
request's, because a node only answers a request once it has reached the
request's index (or has forwarded the request to one that has). A client
that replaces its held index with each response's therefore holds a
non-decreasing sequence without comparing anything, **but only while its
requests are sequential and each one started from the held index.** Two
overlapping requests that left with the same index return two later ones,
and whichever response lands last wins, including the older one. A write's
index can be overwritten by a concurrent read's. Both implementations read
for this subject replace on every response, and one of them comments on the
hazard in its own code. Once a client overlaps requests, it keeps the
greater index, not the latest. That comparison belongs in the backend's own
client library, which ships with the encoding, never in application code.

The index also **names the authority whose log it counts.** Positions are
comparable only within one log. An index minted by another cluster, by the
instance before a rename, or by the history before a restore is one the
node will never reach. If the node cannot recognise such an index, it
waits for it until the timeout on every request for as long as the client
holds it, or it gives up and serves stale. The node treats a foreign index
as absent and handles the request as though it carried none.

The *moving* index rides on the request, never inside a credential. A token
is minted once and is immutable; a moving position cannot live in it, and a
credential that had to be re-issued after every write would make the
write path as expensive as the design is trying to make it cheap. A
credential may carry the one index that does not move: the position at
which it was itself written. A node that has not yet applied a token's
creation then answers "not yet here", retryable, instead of "invalid
token", which would be a confident verdict about a fact it does not have
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

The carrier is a header or an equivalent per-request field, and the client
library owns the echo so application code never sees it. **A cookie is a
carrier only browsers echo.** An API client that ignores `Set-Cookie`
receives the index and never returns it, so it silently gets eventual
consistency from a system that claims read-your-writes for it. A cookie on
a response a shared cache may store either makes the response uncacheable
or replays one client's index to every visitor. Where the carrier is a
cookie, it is set only on responses that are uncacheable already
(authenticated sessions, writes), and the cache is taught to strip it
defensively.

## Three answers from a lagging node

A node receiving a request whose index is ahead of its own position has
three honest behaviours, and the **listener declares which**, because the
right one depends on who is on the other end.

**Fail.** Return a distinct, retryable status: a precondition failure, or a
rate-limit status carrying a retry-after that generic retry layers already
honour. It must be typed, not a generic error, so the client's retry layer
can branch on it
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary))
— and let the client retry, on the same node after a delay or on another.
Right for clients with a retry library and a load balancer that will move
them: the cheapest for the server, and the client pays only when it is
actually ahead of the node it landed on.

**Forward.** Send the request to the authority, which is current by
definition, and return its answer. Right as the default for authenticated
APIs whose clients are not expected to implement retry semantics: the
client sees one request and one answer, and the cost is one cross-node
hop for exactly the requests that needed it.

**Await.** Hold the request until the node's position reaches the index,
bounded by a timeout after which the behaviour degrades to fail or
forward. Right for read-heavy clients that tolerate latency and for nodes
whose lag is short and steady; wrong as a default, because an unbounded
await on a badly lagging node turns every consistent read into a held
connection and the node into a queue. The timeout falls back to fail or
forward, never to serving. A node that serves the replica's answer when the
wait expires has returned the stale read the index existed to prevent, with
nothing to tell the client so. The usual reason for the fallback is an index
the node will never reach, and naming the authority in the index prevents
that case before the timeout ever matters.

The rule: **when a request carries an index the node has not reached,
fail, forward or await per the listener's declared policy, never serve —
and never make the writer wait for replicas instead, because a writer-side
wait makes every replica fresh only by coupling every write to every
replica.** The naive reading — wait on the write side so every read is
safe — buys consistency for every client by charging every writer. The
forms that do not halt on a dead replica also do not buy the guarantee:
- A semi-synchronous acknowledgement means the replica *received* the
  write, not that it *applied* it, and the documented timeout falls back to
  asynchronous replication without telling the reader.
- A k-of-n quorum makes the write visible on the k that answered, not on
  the replica the next read lands on.

Only a wait for *apply* on *every* serving replica makes an arbitrary
replica fresh, and that wait is as slow as the slowest replica and stops
when one dies. The one exception is a small, fixed serving set whose
design accepts that write latency. There, a wait-for-replay-on-commit
mode is honest, because it names who pays.

**A time window is not an index.** Some systems route a session to the
authority for a fixed period after its write, with no index at all. That is
a guess that lag stays under the window, and it guesses on behalf of the
writer only. It is admissible where three things hold:
- Only the writer's own session needs its write.
- The backend exposes no position to carry.
- Replicas whose lag passes the window are removed from serving, so the
  guess is enforced.

Without that removal, a lag spike past the window is a stale read that no
check sees. A window held in one process's memory covers only requests that
land on that process.

## What the check compares against

The node's side of the comparison is its position as
[evict-not-update-on-commit](./evict-not-update-on-commit.md) defines it:
the index after which every derivation has been invalidated, not the index
the consensus layer has accepted. A check against the accepted index passes
while the cache still holds the pre-write value, and the client, having
been told it is safe, reads the stale value with a green consistency
check ([gate-sees-target](../../../../_laws.md#gate-sees-target)). On a
backend that builds its own invalidation stream, the node's position is the
storage index it recorded as it *drained* the corresponding invalidation,
which is the same rule in the other shape.

## What it does not buy

It buys read-your-writes and monotonic reads for the client that carries
it. It does not buy them for a different client, a different session, or
an observer with no index — those see eventual consistency, and the
system should say so rather than imply otherwise. What a replica does with a
request that carries no index is therefore a listener decision too. When
read-serving is added under clients that predate it, the safe default
forwards index-less requests, so those clients keep the consistency they
had. Only a client that has declared it understands the index is served
locally.

The index does not make the
system linearisable: two clients with two indexes see two consistent
prefixes of one history, which is exactly what session guarantees promise
and exactly what they do not. Strict consistency, here, is an appearance
one client purchases per request; the property the system has is single-
leader ordering with lagging followers, and every honest status page
describes the second.
