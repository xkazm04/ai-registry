---
layer: application
type: application
subject: browser-credential-boundary
technique: outbound-fetch-destination-validation
stack: node
status: forged
verified_on: 2026-09-01
verified_against: node@24
---

# Two gates and no redirects, in `kp`

`kp` (Node 24, Next.js App Router) fetches three kinds of address it did not
choose: an operator-registered ATS webhook target, an LLM provider base URL
stored next to the decrypted key that will be sent to it, and a lead-feed
`pull_url`. It landed the guard as **two modules at two boundaries**, and the
split is the interesting part.

## The string gate is client-importable; the resolving gate is not

`app/_lib/safe-url.ts:90-117` is `assertPublicHttpsEndpoint` — scheme, host
normalization, IP-literal refusal, internal-name refusal — and it is imported
by `"use client"` components. `app/_lib/ats-egress-guard.ts` holds the half
that needs a resolver, and its header states why the split exists rather than
leaving it to be inferred (`:10-13`):

```
// This lives in its own server-only module (never imported by a client bundle) so
// the node:dns dependency stays out of `safe-url.ts`, which IS imported by
// "use client" components.
```

That is the subject's own boundary showing up in the module graph: the check a
browser may run and the check only a server can run are different checks, and
keeping the second out of the bundle is what keeps the first honest.

The order at `ats-egress-guard.ts:100-122` is the technique's order. String
gate first (`:105`, commented "FIRST gate"), then `lookup(host, {all: true})`,
then **every** returned record judged:

```ts
// app/_lib/ats-egress-guard.ts:116-120
for (const { address } of results) {
  if (isPrivateAddress(address)) {
    throw new Error(`Invalid ${label}: host "${host}" resolves to a non-public address (${address}).`);
  }
}
```

A resolve failure and an empty result are both rejections (`:110-115`), so an
unresolvable host is not a pass by omission. `isPrivateV4` (`:27-44`) covers
loopback, the RFC-1918 blocks, link-local including the metadata address, CGNAT,
benchmark and multicast, and returns `true` on a malformed value — fail closed.
`isPrivateAddress` (`:59-70`) strips the IPv6 zone id and unwraps the
IPv4-mapped form before the range test, which is the "one family embedded in
the other" case.

The literal-refusal is the deep one. `isIpLiteralHost` (`safe-url.ts:65-76`)
rejects dotted-quad, bracketed IPv6, `0x` hex, bare-integer and class-collapsed
short forms — an address is rejected as a *shape*, not matched against ranges.
And `safe-url.ts:108` normalizes the trailing dot before the name checks, with
the reason inline: `localhost.` is the same name to every resolver but the URL
parser keeps the dot on a DNS host. That one character walked an internal host
past the guard until commit `cf518565`.

## Redirects: refused, not re-judged

`ats-egress.ts:117` sends with `redirect: "manual"` and treats the resulting
opaque redirect as a delivery failure (`:122-128`). The technique offers
re-judging each hop; this tree took the stricter branch and wrote down why
(`:110-116`):

```
// vets ONLY the URL we dial; with the default `follow`, a webhook host that passes
// every check can answer `302 Location: http://169.254.169.254/…` (or a 307 to
// 127.0.0.1, which replays method + the signed PII body) and undici would dial that
// address with no re-vetting — turning the vetted endpoint into a redirector into the
// internal network, and the returned status into a port-scan oracle via /api/ats/test.
```

Both halves of the technique's redirect clause are named there: the laundered
second hop, and the credentialed replay — a 307 re-sends the signed PII body.
The port-scan-oracle sentence is the response-channel clause, reached
independently. On rejection the target is never contacted at all
(`ats-egress.ts:88-96`), so no probe result exists to leak.

The bridge client (`app/_lib/agent-hire/bridge-client.ts:156,229,259`) dials
loopback **by design** and skips the guard — an enumerated exception with its
rationale at `:6-23` — yet still uses `redirect: "manual"` on every call, so a
307 cannot replay the pairing nonce elsewhere. That is the "operator tool is a
separate door, not the same door with a flag" case, and it kept the hop rule.

## The tests assert the instrument first

`app/_lib/llm-endpoint-guard.test.ts:34` is titled `NON-VACUITY: the pre-fix
string-only gate ACCEPTS the rebind host` and asserts the *old* check passes
`https://rebind.attacker.com/v1`. Everything after it — rebind to the metadata
address (`:42`), a public+private record mix (`:53`), string-gate-fires-first
with the resolver never called (`:84`), non-resolving host (`:93`) — is then
known to be measuring something. `ats-egress-delivery.test.ts:72-84` asserts
`init?.redirect === "manual"` at the real call site rather than trusting the
handler.

## Deviations recorded against this tree

- **The verdict is not bound to the connection.** `ats-egress-guard.ts:15-20`
  says so plainly: "this is resolve-and-reject, not a hard IP pin: `fetch`
  performs its own DNS lookup after this check, so a sub-second rebind between
  the two lookups is still theoretically possible (TOCTOU). True pinning needs a
  custom undici dispatcher that dials the vetted IP while preserving SNI/Host;
  that is out of scope here." An honest, dated deferral rather than a silent
  gap — but it is the technique's central clause, and the window is open.
- **`pull-pass.ts:99` runs the string gate only**, then fetches at `:110` with
  neither resolution nor `redirect: "manual"` — while sending a bearer secret
  (`:113`). The weakest member of the family, and the one carrying a credential
  to a stored, operator-supplied address. The comment claims "same SSRF posture
  as the outbound relay"; the code is one gate short of it.
- **No single door.** Three call sites each remember to call a guard, and they
  remember differently — which is exactly how `pull-pass` ended up with the
  string half. There is no wrapped client that makes the unguarded `fetch`
  unreachable from feature code.
- **Model-supplied URLs are vetted at the render boundary, not an egress one.**
  `SalaryTab.tsx:60` runs `safeHttpLinks` over LLM-emitted `marketEvidence`
  sources before turning them into anchors, with the reason at `:56-58`. Correct
  for rendering; it is the browser's own membrane. Nothing server-side fetches
  those URLs today, so the exposure is latent rather than present — the day one
  is followed to enrich a result, it needs the resolving gate, not this one.
