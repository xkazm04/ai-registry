---
layer: golden-path
type: golden-path
subject: stream-proxy-hop
status: forged
use_when: [putting a gateway or edge function in front of a streaming backend, a live view claims connected while nothing arrives, an upstream failure makes clients reconnect forever, deciding where a streaming credential lives]
techniques:
  - idle-heartbeat-injection
  - lifetime-cap-rotation
  - upstream-status-normalization
  - abort-versus-unreachable
  - origin-non-disclosure
  - credential-attachment-at-the-hop
  - reconnect-storm-hygiene
---

# Stream proxy hop

A stream proxy hop is the box in the middle of a long-lived server-pushed
read: a client opens one connection that is meant to stay open for minutes or
hours, the hop terminates it, opens its own connection to an origin the client
must never address directly, and re-emits the origin's bytes downstream. A
gateway, a backend-for-frontend, an edge function, a tenant-routing shim — the
label changes, the contract does not. The unit of work is **one long-lived
outbound read, terminated and re-emitted**, and the job of this subject is
everything that becomes the hop's responsibility the moment it stands in that
position.

That is more than "copy bytes". A hop inherits four obligations no
straight-through connection has: **keep the idle path warm** across
infrastructure neither end controls, **translate every upstream failure mode
into something a dumb auto-reconnecting client can act on**, **distinguish a
client that walked away from an origin that fell over**, and **not leak the
origin** while doing any of it. Each exists to prevent one instance of the same
failure, so that failure is worth naming once, at the top.

## The failure this subject exists to prevent

A long-lived stream that stops delivering does not, by default, look broken.
Intermediaries the deployment did not choose and cannot see — load balancers,
corporate proxies, content networks, mobile carrier gateways — reap idle
connections on between-bytes timers whose documented defaults run from ten
seconds to a little over two minutes, with sixty the most common. When one
does, the client's stream reader often observes an **orderly end of stream**:
no error, no reset, just the producer apparently finishing — a cut chunked
body is formally incomplete and some readers do report it, but a terminating
intermediary that re-frames on the way out hands the client a clean close,
and that is the shape to design for. From there the damage takes one of two
shapes, and which one it takes is a property of the client. The standard
server-pushed-stream client re-opens endlessly — its specification
reconnects on a clean end of body as on an error — while the interface,
whose connection indicator was derived from "did we open successfully" rather
than from "when did anything last arrive", goes on claiming the lane is live.
A hand-rolled reader over a general fetch sees the producer finish, nothing
reconnects, and the lane stays dead until the user reloads the page. From the
screen the two are identical.

**A green indicator over a dead lane** is the signature failure of this
surface, expensive precisely because it is silent — the user sees a plausible
screen, the operator sees no error rate, and the only symptom is that nothing
has happened for a while, which is also what a quiet system looks like. It is
failure spelled as empty success
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)), with
the transport itself doing the spelling. Every stance below follows from
refusing it: the idle path is kept warm so an idle stream is never mistaken for
a dead one, and every abnormal end is converted into something the client can
*tell apart* from a normal one.

## The hop keeps the path warm — not the origin

Traffic is what keeps an idle connection from being reaped, so something must
emit on a schedule when the application has nothing to say, and that something
is **the hop**. The origin knows its own timeouts and the client knows its own;
only the hop sits across the infrastructure between them, where the reaping
happens. Making the origin responsible would also make the origin's liveness a
precondition for the *transport's* liveness, which inverts the diagnosis you
want: a hop that heartbeats independently of upstream traffic tells you the
lane is open while the origin is silent, and that is precisely the state worth
distinguishing.

The emission is a **no-op the wire format already defines as ignorable** — a
comment line, a padding frame, whatever the protocol offers — so a
spec-compliant client parser discards it before application code ever sees it.
A heartbeat the client must filter is not a keep-alive, it is a protocol
change. Its period is derived from the *shortest* idle timeout anywhere on the
path, with margin for one missed tick. The
[idle-heartbeat-injection](./techniques/idle-heartbeat-injection.md) technique
owns the sizing, the emission point, and the timer's reaper — for the leg it
warms; the hop's own upstream client carries a between-chunks timeout of its
own, and the technique names that second leg too.

Not every timer on the path is an idle timer. A **total-duration cap** — a
function platform's maximum invocation time, a gateway's whole-response
budget — counts from the first byte regardless of traffic, kills the hop's
process rather than the connection, and takes the hop's error handling with
it. Against that the only move is to end the stream deliberately before the
cap with a resumable marker, which
[lifetime-cap-rotation](./techniques/lifetime-cap-rotation.md) owns.

## Every upstream failure becomes a client-actionable answer

The client on the far side of the hop is, by design, stupid: an
auto-reconnecting reader whose entire decision procedure is "the connection
ended abnormally, so open it again." It cannot read prose or follow a runbook,
and it will do whatever the hop's response implies, thousands of times, for as
long as the condition lasts. The hop's error surface is therefore not
documentation for a human — it is **an instruction set for a machine that
retries**. Three consequences:

- **The status the hop emits is inside the range a response can carry.** An
  origin that answers with something out of range — a transport failure
  reported as a zero, a non-standard code from an appliance in the middle, an
  absent status after a connect error — makes a naive hop throw *while
  constructing the response*. That throw becomes the runtime's own opaque
  server error, which reads as "temporary, reconnect immediately", while the
  condition that caused it is usually permanent. The clamp is the difference
  between one failed request and an unbounded retry loop. The
  [upstream-status-normalization](./techniques/upstream-status-normalization.md)
  technique owns it.
- **The error body is a closed vocabulary, branchable by code** — a stable
  machine-readable code, a retryable flag, and a message the client may show,
  in that order of importance. Prose is the least load-bearing part, which is
  what makes the next rule affordable. Know, though, **who can actually read
  it**: the standard client for a server-pushed stream reports a failed
  connection as a bare error with no status and no body, so the vocabulary
  serves the operator's logs, the fallback read path and any hand-rolled
  consumer — never the reconnect loop itself.
- **A client abort is not an error at all** — the single most commonly
  conflated pair on this surface.

## An abort and an outage are different facts

Long-lived streams end for a benign reason far more often than a broken one:
the user navigates away, the view unmounts, a tab is discarded, the client
tears down on purpose in order to reconnect. Every one of those aborts the
request mid-flight, and at the hop it looks exactly like a connection that
failed.

The hop must tell them apart and answer differently: a **client abort** gets a
distinct status, no body, and **no telemetry** — nothing was wrong, so nothing
should be counted; an **unreachable or failing origin** gets the structured
error and *is* counted. Conflating them destroys the signal in both directions.
Count aborts as errors and every real outage is buried under a baseline of user
navigations that rises and falls with traffic; treat real failures as aborts
and the outage is invisible. The
[abort-versus-unreachable](./techniques/abort-versus-unreachable.md) technique
owns the detection and the two answers.

The abort carries a second obligation: it must **reap the work the hop started
on that request's behalf** — the heartbeat timer cancelled, the upstream reader
cancelled, the upstream connection released. A hop whose per-request resources
outlive the request accumulates them at exactly the rate its users navigate
([creation-names-reaper](../../../_laws.md#creation-names-reaper)), and the
failure appears as a slow memory climb with no responsible request in any log.

## The origin does not appear in anything the client can see

The client was given the hop's address, not the origin's, and that is a
security boundary rather than a convenience. So the origin's hostname, port,
internal path, and its raw error text never appear in a response the client
can read — not in a message, not in a stack, not in a passed-through header,
and above all not in the tempting "upstream said: …" debug string that gets
added during an incident and never removed.

The rule sounds like it costs debuggability, and it would, if the error were
prose. It does not, because the error is a **closed vocabulary** whose codes
come from a set the hop defines and both sides derive from
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)),
so the scrubbed message carries no decision weight. What the operator needs —
which origin, which host, which upstream status — goes to telemetry on the
private side of the hop, correlated by an identifier the client-visible error
may safely carry. Non-disclosure and usefulness are not in tension; the closed
vocabulary is what buys both. The
[origin-non-disclosure](./techniques/origin-non-disclosure.md) technique owns
the scrub and the correlation handle.

## The credential lives at the hop because the client cannot hold one

A mundane protocol fact decides a piece of architecture here: the standard
client for a server-pushed stream **cannot set request headers**. It sends what
the browser attaches automatically and nothing else. Every design that wants an
authenticated long-lived stream collides with this, and the collisions have
three shapes — put the credential in the query string (where it lands in access
logs and history), abandon the standard client for a hand-rolled reader, or
**terminate at a hop that holds the credential**. The third is the one this
subject is about, and it is often why the hop exists at all.

So the hop holds the origin's key server-side and attaches it outbound, while
the *caller's* own identity is a separate concern — carried by whatever the
platform does attach, verified at the hop, forwarded to the origin explicitly
if the origin needs it. Two credentials, two paths, neither substituting for
the other. What keeps that from rotting is that **forwarded headers are an
allowlist, never a spread**: copying the inbound set wholesale sends the
caller's cookies onward, re-asserts the platform's routing headers into a
request they no longer describe, and re-asserts a content length that stopped
being true when the hop reframed the body. Enumerate what crosses, in one
place, so the set is auditable
([one-validation-door](../../../_laws.md#one-validation-door)). The
[credential-attachment-at-the-hop](./techniques/credential-attachment-at-the-hop.md)
technique owns the split and the allowlist.

## The client half of the contract

A hop cannot make a badly-behaved client safe, and the client behaviours that
matter here are the ones the *hop* forces. When the hop's answer says "abnormal
end", the client reconnects — and a client that reconnects naively converts one
upstream outage into a self-inflicted denial of service: every open view
retrying at full rate, in lockstep, against the thing that just fell over.

Four disciplines make the reconnecting half safe: **one socket at a time**
(close the previous before opening the next, or a wobbly upstream leaves two
sockets per view double-delivering every event), **one timer at a time**,
**exponential backoff with a ceiling and jitter**, and **fallback polling while
reconnecting rather than instead of it**, so the user sees data during the
outage and live updates the moment the lane comes back. The
[reconnect-storm-hygiene](./techniques/reconnect-storm-hygiene.md) technique
owns them.

## Where this subject stops, and the neighbours start

Three neighbours border this ground closely enough that a reader can pick the
wrong document, and the rule for choosing is *which box you are standing in*.
[realtime-events](../../../client-architecture/realtime-events/realtime-events.md)
owns the client's relationship to pushed facts — the subscription's lifecycle,
the closed event vocabulary, the doctrine that push invalidates while a refetch
decides — assuming a lane and describing what travels it. This subject owns the
lane's middle box, and touches the client only where the hop's behaviour
dictates the client's: the reconnect disciplines above are stated here as the
hop's consequences and cross-referenced rather than restated. When the question
is "what should this view do with an event", that is the neighbour's; when it
is "why did the view stop receiving any", it is this one.
[streaming-output](../../../llm-agent/runtime-and-io/streaming-output/streaming-output.md)
owns the *content* of one producer's incremental output — parsing it into typed
events, bounding its buffers, throttling its render, finalizing its outcome —
and is indifferent to how many hops the bytes crossed; this subject is
indifferent to what the bytes mean and cares only that the connection carrying
them stays honest. And [webhook-ingestion](../webhook-ingestion/webhook-ingestion.md),
the sibling in this subcategory, owns the mirror image: inbound posts from a
party you do not control, arriving at an endpoint you exposed, where the hard
problems are sender authentication and hostile input. Yours is outbound,
long-lived, and initiated by your own client. None of the three owns the
intermediary that must keep a stream alive across infrastructure it does not
control and turn every upstream failure mode into an answer a dumb reconnecting
client can act on — that gap is this subject.

## What the hop owes the operator

- **Upstream failures counted by cause, with aborts excluded.** Connect
  refused, upstream 5xx, upstream timeout and mid-stream drop are four
  diagnoses; one "stream errors" total with client navigations mixed in
  supports no claim made from it
  ([count-carries-predicate](../../../_laws.md#count-carries-predicate)).
- **Stream age and last-emission time, observable per stream** — the only
  question an incident on this surface starts with.
- **Whether the last upstream connect succeeded, separately from whether any
  client is connected.** Collapsing those into one health light reproduces the
  green-over-dead failure in the monitoring layer after fixing it in the
  transport.

## The techniques

- [idle-heartbeat-injection](./techniques/idle-heartbeat-injection.md) — the
  ignorable no-op line, sized under the shortest hop timeout, emitted by the
  hop rather than demanded of the origin, and the timer that names its reaper.
- [lifetime-cap-rotation](./techniques/lifetime-cap-rotation.md) — the
  total-duration cap a heartbeat cannot defeat, the deliberate close before it
  with a resume cursor, and the hop that forwards that cursor.
- [upstream-status-normalization](./techniques/upstream-status-normalization.md)
  — clamping an out-of-range upstream status before constructing a response,
  and why the unclamped throw becomes an infinite reconnect.
- [abort-versus-unreachable](./techniques/abort-versus-unreachable.md) — the two
  answers, the two telemetry postures, and the reaping an abort triggers.
- [origin-non-disclosure](./techniques/origin-non-disclosure.md) — what never
  crosses to the client, and the correlation handle that keeps a scrubbed error
  debuggable.
- [credential-attachment-at-the-hop](./techniques/credential-attachment-at-the-hop.md)
  — the hop's key versus the caller's token, and the explicit forwarded-header
  allowlist.
- [reconnect-storm-hygiene](./techniques/reconnect-storm-hygiene.md) — the
  single-socket guard, the cleared timer, capped jittered backoff, and polling
  alongside reconnection rather than in place of it.
