---
layer: technique
type: technique
subject: read-serving-replicas
technique: preemptive-forward-for-known-writes
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [a request wraps its response in a single-use token, a read consumes a use-count or a one-time credential, an operation must observe the authority's state at this instant, deciding what belongs on the pre-dispatch forward list]
---

# Preemptive forward for known writes

[Forward-on-storage-error](./forward-on-storage-error.md) catches every write
the edge cannot see, at the price of one failed local attempt per catch.
For most requests that price is a few microseconds of wasted handler time.
For a small class it is not a price but a correctness failure: the local
attempt does something before its first write that the forward cannot undo,
or the request's meaning depends on the authority's state at this instant
and a replica's answer — however fresh — is the wrong kind of answer. This
technique names that class, keeps it deliberately short, and forwards it
before dispatch.

## Three shapes that belong on the list

**Effects that precede the first write.** A handler whose first act is to
consume something — decrement a use-count, burn a one-time credential,
take a slot from a bounded pool, call out to a remote system — and whose
first storage write comes after, cannot be replayed. Local execution
consumes; the shim refuses the write that would record the consumption;
the forward consumes again on the authority. Where the consumption and its
record can be reordered so the write comes first, reorder and let the shim
handle it; where they cannot — the decrement *is* the read's authorisation
— the request forwards before the handler runs.

**Responses that must mint state.** A request that asks for its response to
be wrapped — delivered as a single-use token whose storage holds the actual
payload, so the response can be handed through an untrusted intermediary —
is a read whose completion is a write, and the write is not incidental: the
token must exist before the response leaves, and the payload must be
readable only through it. The replica can compute the payload; it cannot
mint the token. Forwarding after the handler ran would compute the payload
twice, once uselessly. The request carries a marker (the wrap request
itself) that makes the write certain, so the edge forwards on the marker.

**Operations on the authority's own instant.** Leadership hand-off, cluster
membership, key rotation, root-credential ceremonies, anything that changes
the cluster's identity rather than its data: these must run where the
authority is, against the state the authority holds at that moment, and a
replica executing them locally is not stale, it is *the wrong node*. A
replica's applied index is irrelevant to "step down now". These forward
unconditionally, and they are the operations a routing table would
have listed anyway.

## The inverse entry: what must never forward

The list has a complement, and it is easy to forget because it is so
short. A request whose subject is *this node* — its metrics, its health,
its own position in the log — must never be forwarded, because the
authority's answer would be about a different node and would be wrong
with a confident status code. When such a request cannot be served
locally (the replica is not yet read-serving, and the request needs local
state that is not loaded) the honest answer is a refusal that says so,
not a forward that answers a question nobody asked. The marker on this
entry is the opposite of the others: not "always forward" but "forward
is an error here", and the middleware honours both markers from one table.

## The rule, and the list's shape

**When a request carries a marker that guarantees a write, or names an
operation whose pre-write effects cannot be replayed, or whose subject is
the authority itself rather than its data, forward before dispatch — and
otherwise let the shim decide, because every operation the list misses is
caught there.** The list is one closed vocabulary with one definition
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
the middleware reads it, the operator documentation is generated from it,
and the test that asserts "these forward, everything else attempts locally"
reads the same table. Two copies of the list — one in the router, one in a
docs page — drift on the next addition.

The failure mode of the naive reading runs the other way from the shim's.
There, the error was trusting the edge to see writes. Here, the error is
letting the list grow into the verb classifier it was meant to replace: an
operator adds each newly observed write to the pre-dispatch list "to save
the failed attempt", the list acquires forty entries, and the property that
made it safe — that a missing entry costs microseconds, not correctness —
is forgotten, so the next missing entry that *does* cost correctness is
treated as one more line to add after the incident. Keep the list to the
three shapes. An entry that is on the list only because it writes, with
no pre-write effect and no instant-of-authority semantics, is a
performance optimisation masquerading as a routing rule, and it belongs in
a measured decision rather than a table of correctness cases.

## Testing the seam

The two techniques share one property under test: for every operation the
system exposes, either the pre-dispatch list forwards it, or the local
attempt on a replica completes, or the local attempt hits the sentinel and
the forward completes with no doubled effect. A test suite that runs every
operation against a two-node cluster and asserts the outcome from the
authority's audit line — one execution, one effect — is the gate that
observes what it gates
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A suite that
only asserts the response code passes when the replica's local attempt
succeeded and the forward ran too.
