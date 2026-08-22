---
layer: application
type: application
subject: mcp-tools
technique: transport-selection
stack: node
verified_on: 2026-08-22
---

# Transport selection in the MCP TypeScript SDK (Node)

How the protocol's own reference implementation realizes transport-selection.
Citations are against `@modelcontextprotocol/sdk` `2.0.0-alpha.0`,
`modelcontextprotocol/typescript-sdk` commit `3924de9` (2026-08-18) — the v2
monorepo, whose `core-internal`, `server`, `client` and `middleware/*` packages
are each at `2.0.0`. This is a reconciliation against an external tree, so the pin
lives here in prose rather than in `verified_against`, whose contract is a stack
runtime version. The tree is mid-migration between protocol eras, which makes it
unusually good evidence: each transport exists twice, once for the 2025 handshake
world and once for the 2026-07-28 stateless world, and the diff between them is
the technique's argument written as code. Paths below are under `packages/`.

## 1. The era split is a module, and the two version lists never mix

`protocolEras.ts` names the split in 48 pure lines — `'legacy'` (2025-11-25 and
earlier, negotiated by `initialize`) versus `'modern'` (2026-07-28+, no handshake,
`_meta` envelope on every request) (`core-internal/src/shared/protocolEras.ts:19,25`).
The load-bearing detail: `SUPPORTED_MODERN_PROTOCOL_VERSIONS` is kept "deliberately
separate from `SUPPORTED_PROTOCOL_VERSIONS` … so adding a revision here can never
leak a modern version string into a 2025-era handshake" (`:27-33`). Revision ids are
ISO dates, so era membership is a lexicographic compare (`:36-38`) — no table to drift.

## 2. Standard streams: identity by parenthood, and a real reaper

`StdioServerTransport` is the whole surface: `stdin`/`stdout` of the current
process, no listener, no credential (`server/src/server/stdio.ts:19-38`) — and no
authentication code, which is the technique's point, since identity was settled by
the spawn. Client-side that spawn is `cross-spawn` with
`stdio: ['pipe', 'pipe', stderr ?? 'inherit']` (`client/src/client/stdio.ts:130-136`):
diagnostics default to the parent's stderr, and no protocol-level logging exists to
tempt anyone onto the framed channel.

Custody is an escalation ladder. `close()` ends the child's stdin, waits 2 s for
`close`, sends `SIGTERM`, waits 2 s more, then `SIGKILL` (`client/src/client/stdio.ts:274-313`).
The internal `_dispose()` is stricter: it awaits `exit` rather than `close`, "so a
helper process holding the child's stdio pipes can never block disposal"
(`:219-251`), then destroys the *parent-side* pipe handles, since an inherited write
end would otherwise keep the host's event loop alive (`:252-270`). That is
[creation-names-reaper](../../../../_laws.md#creation-names-reaper) past the easy
case: the spawner reaps the child *and* the handles it minted for it. The framing
channel is bounded — `ReadBuffer` errors at a 10 MB ceiling rather than growing
(`core-internal/src/shared/stdio.ts:4,19-21`) — and `send()` honors `write()`
backpressure via a single-settle `drain` handshake (`server/src/server/stdio.ts:119-153`).

## 3. Streamable HTTP: the local-port defense moved out of the transport

The legacy `WebStandardStreamableHTTPServerTransport` carries the full web-facing
apparatus — sessions, SSE, resumability through a pluggable `EventStore` with
`Last-Event-ID` replay (`server/src/server/streamableHttp.ts:30-57`), keep-alive
frames (`:276,279-293`, 15 s default at `sseKeepAlive.ts:2`), and a `retryInterval`
hint letting the server dictate client reconnect pacing (`:146-151`).

Its in-transport `allowedHosts`, `allowedOrigins` and `enableDnsRebindingProtection`
are now all marked `@deprecated Use external middleware` (`:125-144`); the check
they gate is a plain allowlist compare (`:347-374`). The replacement is two pure
framework-agnostic helpers, `validateHostHeader` and `validateOriginHeader`
(`server/src/server/middleware/hostHeaderValidation.ts:17-35`,
`middleware/originValidation.ts:38-60`), wrapped by four middleware packages
(express, fastify, hono, node) and shipped with a localhost allowlist
(`hostHeaderValidation.ts:40-42`, `originValidation.ts:66-68`). Their rule fits a
mixed browser/non-browser caller set exactly: "deny-on-failure: a present `Origin`
value that cannot be parsed (including the opaque `null` origin) is rejected, never
passed through. Requests without an `Origin` header pass — non-browser MCP clients
do not send one" (`originValidation.ts:11-16`, enforced at `:39-53`). A missing
`Host` is instead a hard failure (`hostHeaderValidation.ts:18-20`); the asymmetry is
deliberate, since `Host` is not optional for any HTTP/1.1 caller.

**Deviation: the protection is opt-in on every path.** The legacy transport defaults
`enableDnsRebindingProtection` to `false` "for backwards compatibility"
(`streamableHttp.ts:139-144`, applied at `:273`), and the modern entry goes further:
`createMcpHandler` states that "the entry itself is deliberately validation-free"
and prints the snippet a consumer must mount in front of it
(`server/src/server/createMcpHandler.ts:586-602`). Every *other* gate there is
mandatory — a POST whose media type is not `application/json` is refused 415 before
the body is parsed (`:864-866`) — so the one check the technique names as the
characteristic local-HTTP failure is the one left to consumer diligence. The
standard stays: binding a port enters the second world, allowlist or not.

## 4. Sessions deleted by name; cross-call state becomes a bound handle

`PerRequestHTTPServerTransport` serves one already-classified message and produces
one `Response`; its module doc enumerates the drops — "session ids and session
headers, resumability (event ids, priming events, `Last-Event-ID` replay, retry
hints), the standalone GET stream, and request-header validation (which belongs to
middleware)" (`server/src/server/perRequestTransport.ts:24-29`). `createMcpHandler`
serves each POST from a fresh factory instance (`createMcpHandler.ts:299-301`).
Change notifications follow: `subscriptions/listen` is opt-in, ack-first with the
*honored subset* of the requested filter, capacity-guarded at
`DEFAULT_MAX_SUBSCRIPTIONS = 1024` (`server/src/server/listenRouter.ts:14-24,39-40`),
and backed by no replay store — so redelivery across a reconnect is genuinely
best-effort and polling stays the correctness path.

The contrast with what that transport replaced is the technique's warning verbatim.
Legacy `validateSession` compares the `mcp-session-id` header against one in-memory
`this.sessionId`, answering `400` for a missing id and `404` for a wrong one
(`streamableHttp.ts:998-1025`) — a bearer id with no principal binding. The modern
answer is `createRequestStateCodec`: cross-call state as an opaque HMAC-SHA256
envelope minted by the server and echoed back as an ordinary argument, with a
≥32-byte key, a 600 s default TTL, and an optional `bind` callback whose documented
use binds the method and the authenticated `clientId` — "the spec's user-binding
MUST for state that influences authorization"
(`server/src/server/requestStateCodec.ts:6-43`). The binding is stored as a
domain-separated HMAC tag, "so a principal identifier in the binding does not appear
in the wire value the client holds" (`:33-36`); `verify` throws only fixed opaque
reason codes — `'malformed'`/`'mac'`/`'expired'`/`'bind'` — never the payload
(`:66-76`); tag comparison is constant-time (`:88-102`).
Handle-possession-is-not-authentication is implemented, not merely documented.
**Deviation the tree labels itself:** the codec is opt-in — "the SDK applies no
protection of its own; this helper is the convenience implementation of the spec's
integrity MUST" (`:116-120`), so the default handle is unprotected.

## 5. Version mismatch is a per-request answer that names the alternatives

Legacy `validateProtocolVersion` runs on every GET, every DELETE and every
post-initialization POST (`streamableHttp.ts:469-473`, `:822-827`, `:977-981`),
returning `Unsupported protocol version: X (supported versions: …)` (`:1040-1047`).
The modern classifier answers an envelope-less request with a typed `-32022`
carrying `{ supported, requested }`, omitting `requested` "rather than fabricating"
it when the request named no version
(`core-internal/src/shared/inboundClassification.ts:941-986`; HTTP 400 at `:400`).
An era mismatch inside the protocol layer sends `-32022` with the *full* supported
list, reason spelled out: "so the peer can pick a mutually supported version from
the error alone" (`core-internal/src/shared/protocol.ts:964-994`).

**Upward finding — the transport decides what silence means.** The client's
negotiation probe inherits the standard request timeout, but its verdict is
transport-aware: "on stdio, a probe that gets no response within the timeout
indicates a legacy server and falls back to the `initialize` handshake …; on HTTP,
where a deployed server answers and silence means an outage, `connect()` rejects
with the standard typed timeout error instead"
(`client/src/client/versionNegotiation.ts:39-53`; modes at `:67-90`). The stdio probe
runs on a short-lived sibling process spawned from the same parameters with stderr
discarded, so a child that exits on an unrecognized pre-`initialize` request is
classified legacy without poisoning the real connection (`:76-85`). The same timeout
is a *capability* signal on a pipe and an *availability* signal on a network; the
technique's decision table has no row for that.

**Counter-finding.** `serveStdio` classifies the opening exchange once, pins the
connection to one era instance, and states "no per-message era classification ever
runs after the connection is pinned" (`server/src/server/serveStdio.ts:1-13`; the
`server/discover` probe deliberately does not pin, `:26-32`). So "every request
carries its own context" holds on HTTP and is consciously relaxed on stdio —
defensible, because the parenthood that establishes identity also establishes
exactly one peer whose era cannot change mid-stream.

## Reconciliation summary

Confirmed: identity by parenthood with no auth code on the stdio path; a reaper with
a SIGTERM→SIGKILL ladder that also releases parent-side handles; stderr as the
diagnostic channel over a bounded framing buffer; origin/host validation extracted
into pure deny-on-failure helpers with a justified browser/non-browser asymmetry;
sessions deleted by name on the modern transport and replaced by a MAC'd, TTL'd,
principal-bindable handle; opt-in best-effort notification streams; version
rejection that always names the acceptable set. Deviations: DNS-rebinding protection
is opt-in on the legacy transport and absent by construction from the modern entry,
documented as validation-free; the `requestState` codec implementing the spec's
integrity MUST is likewise opt-in, so the default handle is unprotected. Upward
lessons: the meaning of silence is a transport property, not a timeout setting; and
per-request self-description is an HTTP obligation a single-peer pipe may
legitimately amortize into a connection pin. Not present by scope: install and
configuration consent, token issuance, and catalog curation — an SDK ships the
transports and the validation helpers, and leaves who-may-call to the middleware its
consumer mounts.
