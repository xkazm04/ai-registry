---
layer: application
type: application
subject: stream-proxy-hop
technique: idle-heartbeat-injection
stack: node
status: forged
verified_on: 2026-09-05
verified_against: node@22
---

# Heartbeat injection in the Next.js SSE proxy route

Citations are against `personas-web` at `8cdf054` (2026-09-05); the three
proxy routes and the hook last changed at `2cfaa88` (2026-07-16). The tree
declares no `engines` and no `.nvmrc`; its CI workflow runs `node-version: 22`
on both jobs, so the version witness stays at node@22 although the fleet's
newest trees pin 24. Next.js is `^16.3.3`.

The exemplar is `src/app/api/events/stream/route.ts` — a Next.js route handler
that terminates the browser's `EventSource` connection, opens its own `fetch`
to the orchestrator's `/api/events/stream`, and re-emits the body through a
`ReadableStream` that injects keep-alive comments. Its sibling,
`src/app/api/executions/[id]/stream/route.ts`, proxies the same protocol from
the same origin **without** the wrapper, and is the instructive counter-example.

## The rationale, written where the timer is (`route.ts:69-77`)

The comment above the wrapper is the whole technique in one paragraph, and it
names the failure rather than the mechanism:

```ts
// Without periodic traffic, idle SSE connections silently die behind
// load balancers / corporate proxies / CDNs (typical idle timeouts:
// 30-60s). The browser sees the connection close and reconnects
// forever; the dashboard's ConnectionStatusIndicator stays "Connected"
// because EventSource fires no error event when the close arrives
// cleanly. A 25s `: keep-alive` comment line keeps any hop awake and
// is filtered out by the EventSource parser (lines starting with `:`
// are comments per the SSE spec).
```

The comment records the reconnect-forever shape correctly and the mechanism
wrongly. `EventSource` does **not** stay silent on a clean close: the HTML
standard's end-of-body step reestablishes the connection, which fires
`error` and sets the state to `CONNECTING` before reopening (read
2026-09-05). So `useEventStream`'s `onerror` (`src/hooks/useEventStream.ts:131`)
does run on every reap, flips the store to `reconnecting`, and `onopen`
flips it back to `connected` a moment later — the indicator
(`src/components/dashboard/ConnectionStatusIndicator.tsx`, reading
`connectionStatus` from `src/stores/eventStore.ts:65`) is green almost all the
time not because no event fired but because each reopen *succeeds*. The
standard's diagnosis holds — the indicator's input is a connection status
rather than an arrival timestamp — and the tree's stated reason for it is the
part that would mislead the next reader. The comment is also the derivation of
the constant: 30-60s observed, 25s chosen; the standard's vendor range
(ten seconds to one hundred and twenty-five, five documents) puts the
observation in the middle and the choice above the floor.

## The ignorable construct is the spec's own (`route.ts:85`)

```ts
controller.enqueue(encoder.encode(": keep-alive\n\n"));
```

A leading `:` is an SSE comment, discarded by the `EventSource` parser before
any listener runs — so `useEventStream`'s `addEventListener("event", …)`
(`src/hooks/useEventStream.ts:117`) never sees it, and no consumer needs to
know the heartbeat exists. This is the standard's "invisible to a
spec-compliant parser" clause satisfied by using the format's construct rather
than inventing an event name.

## The timer names its reaper, twice (`route.ts:90-97`, `:107-115`)

```ts
const onAbort = () => {
  clearInterval(heartbeat);
  void reader.cancel().catch(() => {});
};
req.signal.addEventListener("abort", onAbort, { once: true });
```

and, on every other exit:

```ts
} finally {
  clearInterval(heartbeat);
  req.signal.removeEventListener("abort", onAbort);
  try { controller.close(); } catch { /* already closed */ }
}
```

Both cancellations — the interval and the upstream reader — sit in the same
handler, which is the standard's rule about not separating them, and the
listener itself is removed in the `finally` so the abort path does not leak a
listener when the stream ends normally. The `{ once: true }` and the
`removeEventListener` are belt-and-braces on the same resource; either alone
would do, and having both is cheap. The enqueue is wrapped in its own
`try`/`catch` (`:84-88`) so a tick landing after the controller closed does not
throw into an unhandled rejection.

## The response headers that keep the heartbeat effective (`route.ts:119-125`)

```ts
"Cache-Control": "no-cache, no-transform",
```

`no-transform` is the half usually omitted: it is what stops a conformant
intermediary from recompressing the stream, and a compressor is a buffer. It
is not what stops a buffering reverse proxy — the standard's correction on
this point — and the route sets no vendor anti-buffering header
(`X-Accel-Buffering: no`, honoured by nginx and by at least one function
platform). A sibling tree in this fleet, `ascent`, sets both in one shared
constant (`src/lib/sse-server.ts:34-38`) with a comment naming each header's
job; this route sets one.

## Deviations

**The sibling stream has no heartbeat at all**
(`src/app/api/executions/[id]/stream/route.ts:76-82`). It returns
`upstream.body` straight into the `Response`, so an execution stream watched
during a long quiet phase — precisely the case a live execution view exists
for — is reaped by the same 30-60s hops the events route was hardened against.
The two routes were written from the same template and only one was fixed;
the standard's rule that the hop keeps the path warm applies to every stream
the hop terminates, not to the one whose incident happened first.

**The period has margin for punctuality only.** 25s against a stated 30s floor
leaves five seconds. The standard's sizing rule is *at most half the shortest
idle timeout*, which would put this at 12-15s, and the difference matters on
serverless runtimes where an interval can be delayed by instance suspension or
event-loop pressure. A single late tick crosses the 30s threshold here; at 15s
it would not.

**The constant is inline, and far from its relatives.** `25_000` appears in the
`setInterval` call (`:89`) while the reconnect and fallback-poll constants are
named at `src/hooks/useEventStream.ts:8-10` (`RECONNECT_BASE_MS`,
`RECONNECT_MAX_MS`, `FALLBACK_POLL_MS`). The standard asks for the heartbeat
period to be readable beside them, because the pathologies of this surface live
in the relationship between the four numbers and are invisible when they are
read one at a time.

**A mid-stream upstream failure closes cleanly** (`:104-115`). The read loop's
`catch` swallows the error and the `finally` calls `controller.close()`, so the
browser observes a normal end of stream — the very shape the heartbeat exists
to prevent, reproduced by the hop itself on the one path where the hop knows
better. The standard-compliant repair is to enqueue a terminal error event from
the route's own vocabulary before closing, so the client can tell an abnormal
end from a finished one.

**The inner leg has its own idle timer, and it is shorter than a quiet
orchestrator.** The upstream read is the runtime's global `fetch` (`:27`)
with no dispatcher configured anywhere in `src/` (grep for `bodyTimeout` and
`setGlobalDispatcher`: none). Node's bundled fetch is undici, whose `Client`
documentation gives `bodyTimeout` — "monitors the time between consecutive
body chunks" — a default of `300e3` ms (read 2026-09-05). An orchestrator
with no events for five minutes therefore has its body torn down *by the hop's
own client*, the `catch` above swallows the `BodyTimeoutError`, the `finally`
closes cleanly, and the browser reconnects — every five quiet minutes, while
the 25s heartbeat keeps the outer leg perfectly warm. This is the standard's
two-leg sizing rule violated on the leg nobody heartbeats; the repair is a
dispatcher with `bodyTimeout: 0` (or above the longest legitimate silence) for
this route's fetch, or a keep-alive on the orchestrator's own stream.

**The resume cursor does not cross the hop.** The outbound header set is built
from scratch (`:21-23`: `Accept`, `Authorization`, `X-User-Token`), which is
the allowlist discipline done correctly — and `Last-Event-ID`, which the
browser sends automatically on every one of the reconnects this comment
describes, is not in it. Every reap-and-reopen is a fresh subscription to the
orchestrator; whatever it emitted in the gap is lost silently, and no replay
window upstream could ever be exercised through this route.

**No lifetime declared.** Neither streaming route exports a duration cap of
its own, so on a function platform each runs on the project default; a stream
that outlives it is killed with the `finally` unreached. Streams that die at
the same age regardless of traffic are the standard's signature for that, and
nothing here would distinguish it from a reap.
