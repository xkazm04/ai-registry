---
layer: technique
type: technique
subject: correlated-exchange-over-broadcast
technique: reply-fan-out-filtering
status: forged
laws: [one-validation-door, identity-survives-reuse]
shared_with: []
use_when: [a second client is added to a service that worked with one, a client receives a reply it did not ask for, sizing the reply edge of a shared service]
---

# Reply fan-out and client-side filtering

A service on a broadcast bus publishes its replies to a topic. Every
subscriber of that topic receives every reply. This is not a
misconfiguration, it is the definition of the transport: **a service with
three clients is one output edge fanned out to three receivers**, and each of
them is handed all three conversations.

The consequence is a rule with no exceptions. **A client identifies its reply
by its own correlation identifier, and treats every other message on that
edge as somebody else's.** Never "the next message on the reply topic is my
answer." Never "there is only one client, so all replies are mine."

## The defect this prevents, and why it ships

The naive client is correct in development. There is one client, so the next
reply *is* its reply, and every test passes. The defect is introduced by a
change that touches neither the client nor the service: somebody adds a
second client. Now two requests are in flight, two replies come back in an
order determined by the service's internal scheduling, and each client
returns whichever arrived first.

What makes this expensive is the shape of the failure. Nothing throws. The
payload is well-formed, it deserializes, it is the right type — it is simply
an answer to a different question. Downstream it looks like data corruption
or a logic bug in the service, and the investigation starts nowhere near the
client's receive loop. A subscriber acting on messages it never named is the
bus equivalent of a bypassed validation door
([one-validation-door](../../../../_laws.md#one-validation-door)): the filter
must exist at every receiver, structurally, not as a habit at some of them.

The filter belongs in the shared helper rather than in each client's loop.
One implementation of "is this mine", derived from the vocabulary authority,
used by every client — because the failure mode of a per-client filter is a
client written in a hurry that omits it and cannot be distinguished from a
correct one by reading either side of the exchange.

## Identifiers must be unique across clients, not just within one

Client-side filtering is only as good as the uniqueness of what it filters
on. Two clients that both number their requests from one produce colliding
identifiers on a shared reply topic, and each will happily match the other's
reply. Mint identifiers so that collision across independently started
processes is not merely unlikely by convention but structurally impossible —
a random identifier wide enough that collision is not a risk, or a
per-participant prefix plus a local counter
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
counter alone is the single most common way this technique is implemented
wrongly, and its symptom is identical to the missing-filter symptom, which
makes it doubly hard to find.

Identifiers are also not reused after an exchange ends. A late reply to an
abandoned request that matches a fresh wait is the collision problem
recreated inside one process.

Prefer an identifier scheme that is both collision-proof and **time-ordered**,
so that a sorted log of correlation ids reads as a timeline. The correlation
id is the only handle an operator has on a conversation that spans processes,
and one that sorts by creation turns "which request was this a reply to" from
a join into a glance. It costs nothing over a purely random id and it is the
difference between a debuggable exchange and an opaque one.

A client that pipelines filters against a **set** of outstanding identifiers,
not a single one. The natural implementation is a map from identifier to the
context the reply must be reunited with — the caller's continuation, the
deadline, the original request for retry — which also gives the census below
for free, and gives the abandonment list that keeps late replies from matching
a fresh wait.

## Fan-out has a cost, and the cost decides the topology

Filtering makes fan-out *correct*. It does not make it *free*. Every client
pays deserialization and delivery for every other client's replies, and on a
service whose replies are large — an image, a point cloud, a model response —
that cost dominates. Three rules, in order of preference:

- **Keep one shared reply edge** when replies are small or clients are few.
  It is the simplest topology, and the filter is cheap.
- **Split the reply edge per client** when payloads are large or the client
  count grows. The requester names its own reply topic in the request, the
  service publishes there, and fan-out disappears. The correlation identifier
  stays — a client can have several exchanges outstanding on its own topic,
  and a topic is not an identity.
- **Never make the topic the identity.** A per-client topic without a
  correlation identifier reintroduces the original defect at a smaller scale:
  the client's own pipelined replies match each other.

Where the transport lets a receiver reject a message before deserializing it
— a header filter, a subscription predicate — apply the filter there, so a
client pays for other clients' replies in delivery only and not in decoding.

## Requests are broadcast too

The mirror case is quieter and worth stating. If several instances of a
service subscribe to the same request topic — the obvious way to add capacity
— then every instance receives every request and, absent an agreement, all of
them answer it. Broadcast is not load balancing. Fanning work across
instances requires an election, a partition of the identifier space, or a
different transport; adding a second subscriber to a request topic and hoping
is how one request becomes three effects.

## What to log

The census that makes this debuggable is small: per client, how many replies
were received and how many were kept. A client whose kept-to-received ratio
falls as the fleet grows is behaving correctly; a client whose ratio is one
on a shared edge with several clients is not filtering at all, and the ratio
is the only observation that distinguishes it from a correct one before the
bug does.

## When not to use this

If the transport delivers a reply to exactly one receiver — a point-to-point
channel established per exchange, a queue with a single consumer — the filter
is redundant and the sizing discussion does not apply. Verify that claim
against the transport rather than against the current deployment: "only one
receiver today" is a deployment fact, and this technique defends against a
change in exactly that fact.
