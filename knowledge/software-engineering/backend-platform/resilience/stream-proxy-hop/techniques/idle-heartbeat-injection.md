---
layer: technique
type: technique
subject: stream-proxy-hop
technique: idle-heartbeat-injection
status: forged
laws: [failure-not-empty-success, creation-names-reaper]
shared_with: []
use_when: [a stream dies silently after about a minute, deciding who emits keep-alives across a proxy, a connection indicator that stays green with no data]
---

# Idle heartbeat injection

An idle connection is indistinguishable from an abandoned one to every box it
passes through, so boxes reap it. Load balancers, corporate proxies, content
networks and carrier gateways all carry an idle timeout, typically thirty to
sixty seconds, and none of them tells either endpoint that the reap is what
happened. The client sees the stream **end normally**. The technique is the
periodic emission of an ignorable no-op that keeps the connection out of the
idle state, and the discipline around who emits it, how often, and what kills
the timer.

## Why the silent close is the expensive one

If a reaped connection produced an error, this technique would be optional —
the client's reconnect logic would fire and recover. It does not. A reaped
connection produces an orderly end of stream, which a reader reports as the
producer finishing, which is also what a healthy completed stream looks like.
The client does not reconnect, and any indicator derived from "did we open
successfully" keeps claiming the lane is live. Silence becomes
indistinguishable from success at the exact place the distinction mattered
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

That is also why the fix cannot be "detect the close and reconnect". Detection
is worth having, but it fires after the fact and only where the close is
observable; the heartbeat prevents the close from happening at all, which is a
strictly stronger position.

## The emission must be invisible to a compliant parser

The heartbeat is **a construct the wire format already defines as ignorable** —
a comment line, a padding frame, an empty keep-alive record — chosen so that a
spec-compliant client parser discards it before application code sees it.

This is a hard requirement, not a preference. If the heartbeat is a normal
message with a special name, then every consumer must know to filter it: the
client, the reconnection logic that counts messages, the tests that assert on
sequences, any recording layer, and every future consumer nobody has written
yet. A keep-alive that consumers must know about is not a transport detail, it
is a protocol change, and it will eventually be rendered to a user as an empty
item because one consumer forgot. Use the format's ignorable construct, and the
heartbeat stays where it belongs — below the application.

## Sizing: shortest timeout, halved

The period is derived, not chosen by feel:

- **Take the shortest idle timeout on the path**, not the one you control. The
  path includes intermediaries the deployment never configured, so the working
  number is the smallest plausible one — treat thirty seconds as the default
  assumption unless the whole path is known.
- **Emit at most every half of it.** Halving means one late or lost tick still
  does not cross the threshold; emitting at three-quarters means a single
  scheduler hiccup reaps the connection, and those hiccups are common on
  runtimes that throttle timers in background tabs or suspend idle instances.
- **Do not go much below that.** Every heartbeat is a wakeup on every open
  stream; at high connection counts an over-eager period is a real cost paid
  continuously to prevent an event that would not have happened.

A period around ten to fifteen seconds satisfies the arithmetic for a
thirty-second assumption, and the number belongs in a **named constant beside
the reconnect constants**, not inline in the emission call. When someone later
tunes backoff or diagnoses a reap, the two numbers must be readable together —
a heartbeat slower than the shortest hop timeout and a client that reconnects
instantly are a pathology that only becomes visible when both constants are on
the same screen.

## The hop emits, not the origin

Put the emission in the intermediary. The origin does not know what the path
looks like — it may be reached directly by some callers and through three
intermediaries by others — and making the origin responsible couples the
transport's liveness to the application's. When the origin is slow, wedged, or
merely quiet, an origin-sourced heartbeat stops, the connection is reaped, and
the diagnosis is now ambiguous between "network reaped us" and "the producer
stalled".

A hop that heartbeats on its own timer separates the two facts cleanly: the
lane stays open and demonstrably warm while the origin says nothing, and *that*
state — connected, receiving keep-alives, receiving no data — is a diagnosis
rather than a mystery. It also means the technique works against origins you do
not control and cannot modify, which is most of them.

Emit the first heartbeat immediately on establishing the downstream response,
not one period later. The opening emission flushes any buffering intermediary
that is waiting for bytes before it commits headers, and it proves the lane
works at a moment when a failure is still cheap to report.

## The heartbeat needs the response headers that keep it a heartbeat

An intermediary that buffers, caches or recompresses the response defeats this
technique completely: the keep-alive bytes are written on schedule and held,
the connection is idle from the outside anyway, and — worse — the application's
own events are held too, so the surface goes quiet while every component
believes it is working. The downstream response therefore declares itself
**uncacheable and untransformable**, alongside the stream's own content type.
The transform prohibition is the one people omit, because caching is the
obvious hazard and transformation is not; it is the clause that stops a
compressing intermediary from accumulating a buffer before it forwards
anything. These headers are part of the technique, not boilerplate around it: a
heartbeat behind a buffering hop is a timer with no effect.

## The timer names its reaper

A heartbeat is a repeating timer created per request, and it is the canonical
example of a resource that must state what destroys it at the point it is
created ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). It
is cleared on **every** exit: the client aborting, the upstream ending, the
upstream erroring, the response being closed for any other reason. Missing one
path leaves a timer writing into a closed stream forever — which either throws
on every tick into a handler nobody reads, or worse, succeeds silently against
a buffer nobody drains.

Two failure shapes are worth naming because both are common:

- **The orphaned interval.** Cleanup is attached to one exit path (the normal
  end) and not to the abort path. Since abort is the *most* frequent exit for a
  long-lived stream, the leak accumulates at the rate users navigate.
- **The timer that outlives its reader.** The heartbeat is cleared but the
  upstream reader is not cancelled, so the hop keeps draining an origin
  response for a client that left. Both cancellations belong on the same exit
  handler, written together, because separating them guarantees one is
  eventually forgotten.

## When not to use it

- **When the protocol has its own keep-alive and the path honours it.** A
  transport-level ping is better than an application-level one: it is invisible
  by construction, and no parser is involved. Add an application heartbeat only
  where the transport's own mechanism does not survive the intermediaries — a
  common situation, but worth checking before adding a second mechanism.
- **When the stream is expected to be short.** A read that finishes inside the
  shortest idle timeout cannot be reaped, and a heartbeat on it is a timer that
  never fires and a constant that misleads its next reader.
- **When emitting costs more than reconnecting.** For an enormous number of
  mostly-idle connections where a reconnect is genuinely cheap and no state is
  lost, letting them drop and reconnect with backoff is a legitimate design —
  but it is only legitimate if the drop is *observable* to the client, which
  means the client cannot be a plain reader that sees a clean close. That is
  the trade, and it must be made deliberately rather than discovered.
