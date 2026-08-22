---
layer: application
type: application
subject: stream-proxy-hop
technique: upstream-status-normalization
status: forged
stack: node
verified_on: 2026-08-22
verified_against: node@22
---

# Clamping the upstream status across three Next.js proxy routes

Three route handlers in this repo terminate a request and re-emit an
orchestrator response: `src/app/api/events/stream/route.ts`,
`src/app/api/executions/[id]/stream/route.ts`, and the non-streaming catch-all
`src/app/api/orchestrator/[...path]/route.ts`. All three carry the clamp, and
one of them carries the derivation.

## The chain, recorded at the site (`executions/[id]/stream/route.ts:58-63`)

```ts
// Normalize the upstream status before forwarding. The Response
// constructor throws RangeError on values outside 200-599, so a 1xx
// (informational) or 0 (some Node fetch impls when the response was
// never assembled) blew up here and produced an unhandled 500 with no
// body — which EventSource then interpreted as "connection died,
// reconnect immediately", driving an infinite reconnect storm.
```

Every link of the standard's chain is here and in past tense — it happened.
Out-of-range status → `RangeError` from the `Response` constructor → Next.js's
own handler emits an opaque 500 → the client treats 500 as transient →
reconnect → the upstream condition is unchanged → loop. The clamp itself is
three lines (`:65-66`, and identically at `events/stream/route.ts:58-59`):

```ts
const safeStatus =
  upstream.status >= 200 && upstream.status < 600 ? upstream.status : 502;
```

502 is the substitute, which is the standard's "choose by meaning" rule applied
to the case that produced it: a status the gateway could not use *is* a bad
gateway.

## The non-streaming sibling carries it too (`orchestrator/[...path]/route.ts:61-63`)

```ts
// Response() throws on a status outside 200-599 (some fetch impls yield 0).
const safeStatus =
  upstream.status >= 200 && upstream.status < 600 ? upstream.status : 502;
```

This is the standard's "non-streaming siblings obey the same rule" clause
satisfied — and it is the more usual outcome that it would *not* be, since the
streaming route is the one that visibly broke. Here the fix travelled to the
plain proxy, which shares the same origin and the same `fetch` behaviour.

## The sibling arm: abort before classification (`events/stream/route.ts:31-51`)

The clamp handles a response that arrived. The `catch` handles one that did
not, and it asks the abort question first:

```ts
if (err instanceof DOMException && err.name === "AbortError"
    || (err as { name?: string } | null)?.name === "AbortError") {
  return new Response(null, { status: 499 });
}
```

— 499, no body, no telemetry, with the comment naming why (`:32-34`: "not a
real failure … don't pollute Sentry with non-actionable noise"). Anything else
becomes the structured error (`:44-50`), and the comment states the
non-disclosure rule inline: *"Return a structured 502 the EventSource onerror
path can branch on, and never surface the orchestrator hostname."* The same
pairing appears at `executions/[id]/stream/route.ts:36-55` and, for the plain
proxy, `orchestrator/[...path]/route.ts:52-58` — where the non-disclosure rule
is the only comment in the block (`:56`).

## The finding: nothing on the retry path reads the structured error

The routes emit `{"error":"upstream_unreachable"}` with a status, and the
comments describe it as something "the EventSource onerror path can branch on".
It cannot. `EventSource`'s `onerror` receives a bare `Event` with no status and
no body, and `src/hooks/useEventStream.ts:131-153` accordingly branches on
nothing:

```ts
es.onerror = () => {
  es?.close(); es = null;
  if (disposed) return;
  setStatusRef.current("reconnecting");
  scheduleFallbackPolling();
  …
};
```

Every failure — 499, 502, a clamped 503, an opaque 500 — produces the same
reaction. So the vocabulary's real readers here are the server logs, the
fallback poll (`fetchEvents`, an ordinary request that *can* read a status),
and any future non-`EventSource` consumer. The clamp is still what prevents the
storm, because it prevents the *unhandled* 500 and keeps the failure inside the
route's own accounting; but the branch the comment anticipates does not exist
on the client, and wiring the fallback poll's answer into the loop's stopping
condition is the change that would make it exist.

## Deviations

**No cause taxonomy.** All non-abort failures collapse to
`"upstream_unreachable"` — DNS failure, connection refused, TLS failure,
upstream 5xx and upstream timeout are one code and one counter. The standard
asks for the causes to stay distinguishable while the hop still has them; here
they are discarded at the first `catch`.

**No retryability flag and no correlation handle.** The body is a single
`error` key: no `retryable`, no request identifier tying the client's copy to
the server-side record. The scrub is correct, but the operator-side half of the
non-disclosure bargain — a handle that gets you from the user's screenshot to
the full upstream detail — is not built.

**The abort is classified from the error's shape, not from the signal.** The
double test at `events/stream/route.ts:35-38` — `instanceof DOMException` plus a
duck-typed `name` check — is defensive precisely because the shape is not
guaranteed across runtimes, which is the argument for asking
`req.signal.aborted` instead. The signal is already in scope (it is passed to
`fetch` at `:29`); consulting it first would make the classifier independent of
how any runtime words its cancellation error.

**`503` for a missing configuration is untyped** (`events/stream/route.ts:13`,
`executions/[id]/stream/route.ts:16`): `new Response("Orchestrator URL not
configured", { status: 503 })` returns a bare string rather than a coded body,
so the one failure the operator can fix in a minute is the one that arrives in
a different shape from every other. The catch-all route does this correctly —
`Response.json({ error: "orchestrator_not_configured" }, { status: 503 })`
(`orchestrator/[...path]/route.ts:26`) — which makes the streaming routes'
version a straightforward alignment rather than a design question.
