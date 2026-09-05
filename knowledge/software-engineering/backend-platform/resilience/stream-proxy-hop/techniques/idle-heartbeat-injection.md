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
networks and carrier gateways all carry a *between-bytes* timeout, and none of
them tells either endpoint that the reap is what happened. The defaults are
not clustered: across five vendor documents read on 2026-09-05 they run from
ten seconds (a content network's between-bytes default) through sixty (a
common reverse proxy's read timeout, a cloud load balancer's idle timeout) to
one hundred and twenty-five (a content network's read timeout to the origin's
response). "Thirty to sixty seconds" describes the middle of that range and
nothing at either end. The technique is the periodic emission of an ignorable
no-op that keeps the connection out of the idle state, and the discipline
around who emits it, how often, and what kills the timer.

## What the client actually sees, and why it is still expensive

What a reaped connection looks like from the client depends on the framing
the reap cut, and the honest statement is a fork rather than a rule:

- **A cut chunked body is an incomplete message.** The message-framing
  standard for the first HTTP version says a chunked body without its
  terminating zero-length chunk is incomplete and the recipient must record
  it so; a general-purpose fetch reader surfaces that as a network error, and
  a multiplexed transport surfaces a mid-stream reset as an error too. The
  reap *is* observable there.
- **A clean end of stream** appears only when the intermediary re-frames on
  the way out — terminates the chunking itself — or when the response was
  close-delimited, where the standard says a completed and an interrupted body
  cannot be told apart. Many terminating proxies do exactly that, which is why
  the clean close is common; it is not universal.

The second half of the fork is the one to design for, and the client's type
decides what it costs. The **standard server-pushed-stream client
reconnects on both shapes** — its specification runs the same reestablish
step on a body that ended as on a network error, firing its error event and
reopening after its reconnection delay — so what the user sees is a lane that
re-opens forever, each open succeeding, each stream delivering nothing before
the next reap. A **hand-rolled reader** over a general fetch sees the clean
close as the producer finishing and does not reconnect at all, and the lane is
dead until the page reloads. Either way, any indicator derived from "did we
open successfully" keeps claiming the lane is live, and silence becomes
indistinguishable from success at the exact place the distinction mattered
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

That is also why the fix cannot be "detect the close and reconnect". Detection
is worth having, but it fires after the fact and only where the close is
observable; the heartbeat prevents the close from happening at all, which is a
strictly stronger position. It is not, however, a cure for every timer on the
path: a **total-duration cap** — a function platform's maximum invocation
time, a gateway's whole-response timeout — counts from the first byte and is
indifferent to traffic. A heartbeat does nothing against it, and the stream
must instead end on purpose before the cap and be resumed, which is
[lifetime-cap-rotation](./lifetime-cap-rotation.md). Read the vendor's
definition before classifying a number: "waits N seconds for a response" is
usually the first byte, "between successive reads" is the idle timer this
technique defeats, and "maximum duration" is the cap it cannot.

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
  number is the smallest plausible one. Thirty seconds is a defensible default
  assumption for a path of load balancers and reverse proxies; it is wrong
  behind a content network whose between-bytes default is ten, and a period
  sized for thirty is reaped there on every quiet stretch. When the whole path
  is not known, the floor is the smallest *documented* default of anything
  that could be on it, not the typical one.
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

It does **not** warm the other leg. The hop's heartbeat travels downstream;
the origin-to-hop connection crosses its own intermediaries and, more often
overlooked, the hop's **own client library**, which carries a between-chunks
body timeout of its own — one widely used runtime's default fetch
implementation abandons a body that goes quiet for five minutes. A hop that
heartbeats the browser faithfully while its upstream read is cut by its own
client then observes an "upstream ended", closes cleanly, and hands the
client the very shape this technique exists to prevent, once per timeout. So
the sizing rule has two legs: the downstream period is set under the shortest
timeout between hop and client, and the hop's client timeout is set *above*
the longest silence the origin may legitimately produce — or disabled and
replaced by the hop's own stall watchdog — or the origin is required to emit
its own keep-alive on the inner leg. An origin you cannot modify leaves only
the first two.

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
obvious hazard and transformation is not; it is what stops a conformant
intermediary from recompressing or re-encoding the representation, and a
compressor is a buffer.

It is not, though, what stops *buffering*. The caching standard's transform
prohibition governs changes to the representation; holding bytes and
forwarding them later changes nothing about the representation, so a reverse
proxy that buffers responses by default — a common one does, and its
documentation does not mention the directive — is untouched by it. Such
proxies are told to stop by a **vendor-specific response header or a
per-location setting**, and the hop that emits a stream must know which its
path honours and set it beside the standard headers. These headers are part
of the technique, not boilerplate around it: a heartbeat behind a buffering hop
is a timer with no effect, and the standard header alone is not proof the hop
is not buffering.

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
  by construction, and no parser is involved. The multiplexed HTTP version has
  such a frame and at least one function platform sends it on idle responses;
  the first version has no equivalent, so a client or intermediary speaking it
  is still reaped. Add an application heartbeat where any leg of the path
  speaks the older version or where the transport's own mechanism does not
  survive the intermediaries — a common situation, but worth checking before
  adding a second mechanism.
- **When the stream is expected to be short.** A read that finishes inside the
  shortest idle timeout cannot be reaped, and a heartbeat on it is a timer that
  never fires and a constant that misleads its next reader.
- **When emitting costs more than reconnecting.** For an enormous number of
  mostly-idle connections where a reconnect is genuinely cheap and no state is
  lost, letting them drop and reconnect with backoff is a legitimate design —
  but it is only legitimate if the drop is *observable* to the client, which
  means the client cannot be a plain reader that sees a clean close. That is
  the trade, and it must be made deliberately rather than discovered.
