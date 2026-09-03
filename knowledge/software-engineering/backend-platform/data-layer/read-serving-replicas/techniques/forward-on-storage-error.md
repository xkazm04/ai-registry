---
layer: technique
type: technique
subject: read-serving-replicas
technique: forward-on-storage-error
status: forged
laws: [gate-sees-target, verdict-survives-boundary]
shared_with: []
use_when: [deciding which requests a replica may handle locally, a replica answers a read with a read-only storage error, a routing table of forwardable operations keeps growing one incident at a time, a GET handler turns out to write]
---

# Forward on storage error

A replica that serves reads must send everything else to the authority, and
the question is *how it knows which is which*. The naive answer is a
classification at the edge: inspect the request, decide whether it writes,
route accordingly. This technique states why that answer is structurally
wrong and replaces it with a gate that observes the write itself: a
read-only shim at the bottom of the storage stack refuses every mutation
with a typed sentinel, and the request middleware forwards the whole
original request to the authority when — and only when — that sentinel
surfaces.

## The edge cannot classify writes

A request's verb says what the client asked for. It does not say what the
handler will do. A read handler writes when it performs a lazy migration
on first access, stamps a last-used time, decrements a use counter,
warms a cache that is itself persisted, renews a lease as a side effect of
looking it up, or wraps its response in a single-use token that must exist
in storage before the response leaves. Every one of those is invisible at
the edge and obvious at the store. A routing table that names forwardable
operations one by one is therefore a table that is wrong until the next
incident: it grows exactly as fast as replicas are observed answering
clients with a read-only error, which is to say one operation per user
complaint. The statement "we cannot detect every request that will write
in the middleware" is not a limitation to engineer around; it is the
reason the gate lives somewhere else
([gate-sees-target](../../../../_laws.md#gate-sees-target)): the only
component that sees every write is the one every write passes through.

## The mechanism

The store on a replica is wrapped, at the lowest layer through which every
write passes — beneath every cache, beneath the encryption boundary if
there is one, at the seam where the node's storage view meets the
replicated backend — in a shim whose read paths delegate and whose write
paths (put, delete, transactional commit) return one sentinel error and
touch nothing. The sentinel is a distinct typed value, not a message, and
it survives every layer between the store and the request edge unchanged
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary));
a layer that wraps it in a generic "storage failed" has converted a
routing decision into a 500. The middleware at the request edge checks the
handler's error for the sentinel *before* any other error handling, and on
a match forwards the original request — body, headers, client identity,
the lot — to the authority over the cluster's internal channel, and
returns the authority's response as its own. The client sees one request
and one answer; the replica has spent one failed local attempt.

The rule: **when a replica's storage layer refuses a write, forward the
entire original request and discard the local attempt, because the shim
is the only gate that saw the write; never forward on the verb, and never
attempt to fix up the local partial work.** The naive reading that fails is
the retry — re-running the handler locally with writes "allowed" — which
turns a follower into a second writer.

## What the shim demands of handlers

Forwarding after a failed local attempt is a replay, and a replay is safe
only when the attempt left no trace. Three obligations follow, and the
third is the one that gets missed:

Handlers are **side-effect-free before their first storage write**, or their
pre-write effects are idempotent. A handler that calls a remote system,
then hits the sentinel, is re-executed on the authority and calls the
remote system again. Where reordering is impossible the operation belongs
on the short pre-dispatch list in
[preemptive-forward-for-known-writes](./preemptive-forward-for-known-writes.md).

Caches above the shim are **populated by reads, never by writes**. A
write-through cache that records the new value and *then* descends to the
shim leaves the replica holding a value the authority never committed,
which is worse than stale: it is a fabrication. Population on the write
path happens only after the store reports success, which on a replica is
never.

The **audit and request-accounting layers see one request**, not two. The
replica's local attempt and the authority's execution are one logical
request; whichever side records it must record it once, with the
replica's client identity, and the other must recognise the forwarded
request as already accounted. A cluster whose replicas audit the attempt
and whose leader audits the execution has doubled its audit volume and
halved the trust in each line.

## When not to forward

Not every sentinel is a write the authority should perform. A request that
reaches the shim because the handler's *read* path is broken — a lookup
that falls through to a "create default" branch it should never reach on
an initialised system — forwards a bug to the leader, and the leader
performs the write. The shim cannot tell the two apart; the review that
adds a write to a read handler can, and the question to ask at that review
is whether the write is the request's purpose or the handler's
convenience. Convenience writes on read paths (opportunistic upgrades,
bookkeeping stamps) are the ones to move off the read path entirely, into
the leader's periodic wrapper, rather than to forward.

And the shim is a replica's shim. On the authority the same layer is
absent or pass-through; on a single-node deployment it never engages. A
deployment that finds the sentinel surfacing on its only node has a
leadership problem — a node that believes it is a follower with nobody to
forward to — and the honest response is the leadership subject's, not a
local retry.
