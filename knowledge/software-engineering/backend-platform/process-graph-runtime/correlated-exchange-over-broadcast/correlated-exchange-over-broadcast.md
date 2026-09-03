---
layer: golden-path
type: golden-path
subject: correlated-exchange-over-broadcast
status: forged
use_when: [building request/reply or goal/result on a publish-subscribe bus, a reply is consumed by the wrong client, a targeted wait swallows unrelated traffic, a caller hangs forever after a peer restarts]
techniques:
  - correlation-key-vocabulary
  - terminal-status-set
  - passthrough-buffered-wait
  - orphaned-correlation-on-peer-restart
  - reply-fan-out-filtering
  - binding-parity-floor
---

# Correlated exchange over a broadcast bus

A broadcast bus does one thing: it takes a message from a publisher and hands
it to everyone subscribed to that topic. It has no idea that one message
*answers* another. Yet a graph of long-lived processes joined by such a bus
needs, sooner or later, three exchanges that are entirely about that
relationship — a **request** expecting exactly one reply, a **goal** that runs
for minutes emitting feedback, ends in a result and can be canceled mid-flight,
and a **stream** cut into sessions and segments that can be interrupted and
resumed. Each is a conversation; the bus offers only announcements.

There are two ways to close the gap. Put the conversation on the wire — new
message types, a broker that tracks outstanding calls, descriptor syntax that
declares a service rather than an edge. Or leave the wire alone and carry the
conversation in **metadata on ordinary messages**, a small set of well-known
keys a sender attaches and a receiver reads, so a request is just a message, a
reply is just a message on another edge, and everything difficult about the
exchange lives in the two endpoints. This subject is the second answer taken
seriously: the vocabulary, the lifetime of a correlation id, the wait that
resolves it without destroying unrelated traffic, what happens when the peer
holding the other half restarts, and how far the pattern carries across
languages.

## What the convention buys, and what it charges

It is a trade with a clear ledger. It buys **portability** — a pattern
expressed as keys works in every binding that can attach and read metadata,
with no per-binding protocol work; **recordability**, because an exchange
captured off the bus is a plain sequence of messages and replay needs no broker
state, there being none; and **additivity**, since a new pattern ships as a
documented key plus a helper rather than a wire version bump, and a subscriber
that ignores the keys still receives valid data. And it keeps the broker off
the critical path: one that never learns what a request *is* cannot become the
place where requests queue.

It charges three things, and every failure in this subject is one of them
coming due. **Nothing enforces the convention** — the bus will cheerfully
deliver a reply whose correlation id is missing, misspelled or copied from the
wrong request, and the only detector is the endpoint's own predicate.
**Correlation state is endpoint memory**, so it dies with the endpoint. And
**every participant must implement the discipline identically**, which turns
parity across bindings into a documented contract with a floor. So: metadata
when the transport is already broadcast, the participants are peers rather than
a client tier and a server tier, and patterns will multiply; a wire primitive
when the *broker* must enforce the timeout, admit or refuse calls under load,
or be the one place an operator sees every outstanding call, because that
enforcement cannot live in the endpoints.

## The vocabulary is the mechanism

A correlated exchange is nothing but its keys, so the keys are the contract.
One shared definition names them — a request identifier; a goal identifier and
a goal status; a session, a segment, a sequence number, a finality marker, an
interruption marker — and every layer answering "is this message part of a
correlation?" derives its predicate from that one list
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
A second copy of that list — in a scheduler that classifies messages, a bridge
that translates them, another language's helper — is a defect with a delay
fuse: it works until someone adds a key, updates one copy, and ships a runtime
where half the layers read the new exchange as ordinary traffic. The
[correlation-key-vocabulary](./techniques/correlation-key-vocabulary.md)
technique owns the list, the namespacing, and the single-derivation rule.

That predicate is load-bearing in a place nobody designs for: **a correlated
edge carries heterogeneous payloads.** Metadata, not a fixed per-edge type, says
what a message is, so every mechanism assuming one edge means one shape — a
static type check, a decoder caching one schema per edge, a validator rejecting
shapes it did not see first — must exempt correlated traffic explicitly. Those
scattered exemptions are where private copies of the predicate get written, and
where divergence costs most: a well-formed reply silently dropped by an
optimization.

## A correlation id has a lifetime, and it is short

The id is minted once, by the requester, at the moment of asking. The responder
never invents one; it **echoes** the requesting message's metadata back on its
reply, which is what makes the reply recognizable at all
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)). Echoing
wholesale is the right default with a sharp edge: that metadata also carries the
runtime's internal plumbing, and forwarding it attaches stale routing or
decoding hints to a payload they do not describe — which is why internal keys
are namespaced and stripped at the wire-to-user boundary. The id lives until a
terminal event carrying it arrives, or until the requester gives up, and then
it is dead and not reusable: a recycled id lets a late reply to a previous
exchange satisfy a current wait.

What counts as terminal is an enumerated set, not a shape. A goal ends
*succeeded*, *aborted* or *canceled*; there is no fourth value, no free-text
status, and matching is exact and case-sensitive. The rule that survives
contact with reality is what a receiver does with a value outside the set:
**an unrecognized status is the failure value, never success and never "keep
waiting"** ([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).
A waiter that ignores what it does not recognize hangs until its deadline on a
peer that is telling it, in a spelling nobody agreed on, that the work is over.
The
[terminal-status-set](./techniques/terminal-status-set.md) technique owns the
set, the matching rule and the echo obligation.

## A targeted wait must not become a message sink

This is where the naive implementation fails, and it fails silently. A helper
that waits for one request id does the obvious thing: loop, receive, discard
anything that does not match, return on the match. On a broadcast bus that loop
is a **message sink** — every parameter update, input frame, lifecycle event
and unrelated reply arriving during the wait fails the predicate and is thrown
away, so the node loses inputs around a call that itself succeeded.

The discipline is **passthrough**: every non-matching event received during a
targeted wait is buffered for the caller's ordinary event loop and replayed on
its later receives, in arrival order. Two rules keep it honest — the wait reads
the transport by a path that does not re-drain its own buffer, or it hands
itself back what it just deposited and spins; and a wait for a pipelined
request scans the buffer *first*, because its reply may have arrived during an
earlier wait. The
[passthrough-buffered-wait](./techniques/passthrough-buffered-wait.md)
technique owns the buffer, the livelock rule, and the replay order.

## No delivery guarantee restores a correlation

A delivery guarantee is a promise about a message reaching a processor; a
correlation is a promise about an endpoint still remembering why it cares. The
second does not follow from the first, and conflating them produces the most
expensive bug here: a caller waiting forever because the process it was waiting
on came back as a new instance with an empty table of in-flight ids and no
ability to synthesize the replies it never knew it owed.

So every correlated wait carries two exits besides its match: a **deadline**,
and a **watch on the supervisor's restart signal for the specific peer**. The
sibling subject that propagates restart and input-closure signals owns that
signal; this subject owns what a waiting endpoint does with it, and the rule is
that *restarted* is a distinct outcome from *timed out*. They call for opposite
actions — a restart means the peer exists again and the request can be reissued
immediately against the new instance, a timeout means the peer is unresponsive
and reissuing is how a slow system becomes an overloaded one
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)). The
[orphaned-correlation-on-peer-restart](./techniques/orphaned-correlation-on-peer-restart.md)
technique owns the outcome taxonomy and the reissue rule.

## Everyone hears every reply

A reply is published to a topic, and every subscriber receives it — including
the clients that did not ask. That is not a misconfiguration; it is what
broadcast means, and a service with three clients is one output edge fanned out
to all three. The rule has no exceptions: **a client filters replies by its own
correlation id and never assumes an arriving reply was meant for it.** Treating
the next message on the reply topic as your answer works perfectly with one
client and returns somebody else's result the day a second is added — a defect
that reads as data corruption, not a routing bug, because the payload is
well-formed and the handler is innocent. The
[reply-fan-out-filtering](./techniques/reply-fan-out-filtering.md) technique
owns the filter, the sizing consequences of fan-out, and when to split the
reply edge instead.

## The parity floor is a documented per-binding fact

A metadata-only pattern is portable to exactly those bindings that expose
metadata **on send and on receive**. One that can attach but not read can issue
requests and never recognize a reply; one whose message type has no metadata
surface cannot host the pattern in any direction, whatever helper code sits
above it. The failure mode is not a compile error but a document claiming the
pattern works everywhere. So the obligation is documentary: **state the
capability per binding, as send-half / receive-half / full**, so a hole is
announced rather than implied shut
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)). The
[binding-parity-floor](./techniques/binding-parity-floor.md) technique owns the
floor, the table, and the control-plane instance of the same discipline: a
mutation commits only on the *exact typed reply variant* for the request it
sent, because accepting any successful reply as proof — or skipping a reply
carrying no payload — is how a control plane records a change that never
happened.

## Where this subject stops

**Against an in-application event bus.** A bus of discrete named facts
([realtime-events](../../../client-architecture/realtime-events/realtime-events.md))
owns the closed vocabulary of event *names*, the lifecycle of subscriptions and
the fan-out of a fact to consumers that did not cause it; it explicitly refuses
the case where the emitter expects an answer, calling that a command that
deserves a call boundary. This subject is what you build when that command must
travel over a broadcast transport between processes anyway: the name registry
and subscription discipline stay there; the correlation metadata, the wait that
resolves it and the orphaning of that wait are here.

**Against a two-world command boundary.**
[ipc-contract](../../../client-architecture/ipc-contract/ipc-contract.md)
governs the shape of a command crossing one boundary between two language
worlds that ship together — generated types, lockstep, error mapping — and
assumes a transport that already has a call-and-return primitive and exactly
one door. Here there is no call primitive to wrap and no single door: the reply
is a broadcast reaching every subscriber, and the endpoint reconstructs "this
answers me" from metadata. When the transport gives you request/response
natively, that subject applies; when you are building it out of publish and
subscribe, this one does.

**Against delivery guarantees.** Everything in
[delivery-guarantees](../../work-execution/delivery-guarantees/delivery-guarantees.md)
— guarantee selection, atomic claiming, dead lettering, reaping the stuck —
concerns whether an accepted message is eventually processed and what record
survives when it is not. That is a property of the message; a correlation is a
property of an *endpoint's memory*, and the strongest delivery guarantee ever
shipped still leaves a restarted responder with no knowledge of the request id
it owes an answer to. Read that subject to decide whether the reply will be
delivered; read this one to decide whether the caller can still recognize it,
and what it does when the answer can no longer come.
