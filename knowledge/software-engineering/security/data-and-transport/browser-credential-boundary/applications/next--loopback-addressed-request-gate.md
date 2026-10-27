---
layer: application
type: application
subject: browser-credential-boundary
technique: loopback-addressed-request-gate
stack: next
status: forged
verified_on: 2026-10-27
verified_against: next@16
---

# A header gate, a bind test, and the proxy that found the gap (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (the same
tree as the hackathon mirror on GitLab). A Next.js 16 control plane that runs on the person's
machine and, in live mode, stages and runs writes as whoever is logged in to the forge's
command-line client. Its live actions answer only a request addressed to this machine, and the
history of how that gate grew is the technique's argument in order.

## The gate is one pure function with its reasons in its header

`src/server/actions/local.ts:1` opens with the threat: "Live writes and re-polls act as the
operator's own glab login, so they answer only a request addressed to this machine". The next
lines name both default failures the technique starts from — the servers "listen on 0.0.0.0
unless given `-H`", and the framework's own same-origin check "lets a request with no Origin
through, and a page reached through DNS rebinding sends its own name as both Host and Origin"
(`src/server/actions/local.ts:2-3`). The loopback set is exact (`src/server/actions/local.ts:11`
"`new Set(['localhost', '127.0.0.1', '[::1]'])`"), the Host value is parsed with its port
stripped before comparison (`src/server/actions/local.ts:14` "function hostName"), and an
opaque origin is a refusal (`src/server/actions/local.ts:26` "(an opaque origin)").

`notLocal` (`src/server/actions/local.ts:45` "export function notLocal") checks Host, then
every forwarded-host entry, then Origin, then forwarded-for, and returns the name the request
used — so the refusal tells a person who opened the app under a LAN address what to type
instead. It is called before any planning or reading by the six live server actions
(`src/server/actions/README.md:186`) and by the onboarding, start-probe and screen routes
that read local files (`src/app/api/onboard/answer.ts:20` "const why = notLocal(req.headers)").

## The bind is enforced by a test, not by a README

`package.json:16` "next dev -H 127.0.0.1" and `package.json:19` "next start -H
127.0.0.1" pass the loopback host, and
`src/server/actions/__tests__/listen.test.ts:10` "binds 127.0.0.1 only" reads the scripts and
fails if either loses the flag. The README states the dependency in the technique's terms:
"That check still depends on the server listening on loopback only"
(`src/server/actions/README.md:190`).

## The forwarded-for clause was a finding, not a design

The fourth check arrived as finding F91 (`src/server/actions/README.md:193` "F91 (Medium,
fixed)"): a container started in live mode by mistake behind a hosting front end receives
whatever Host the caller chose, so all three name headers could say localhost. The fix reads
the address the proxy appends — `X-Forwarded-For`, `Forwarded`'s `for=`, `X-Real-IP`
(`src/server/actions/local.ts:38` "function forwardedFor") — and refuses any entry outside the
loopback block, including the IPv4-mapped form (`src/server/actions/local.ts:31`). The test
`src/server/actions/__tests__/replay/forwarded.test.ts:15` covers a caller that put its own
`127.0.0.1` first and is still caught by the entry the proxy appended. That is the upward
lesson the technique took: the name headers are the caller's, the appended address is the hop's.

## Deviations and residuals recorded

- The README names the residual the technique states: a proxy that rewrites Host and adds no
  forwarding header "still passes: never put a proxy or a tunnel in front of a live Afterlife"
  (`src/server/actions/README.md:197-199`). Honest, and not closable by headers.
- The gate does not authenticate local processes, and the README says the preview id "is a
  digest of the commands, not a secret: any caller that can reach the port can preview and then
  confirm" (`src/server/actions/README.md:183-184`). On a multi-user machine that is the
  technique's per-session-credential case, which this tree does not build.
- Demo mode is not held to the gate "(it never runs anything, and the hosted replay is served
  under its own name)" (`src/server/actions/README.md:190-191`) — the exemption is written
  beside the rule, as the technique asks.
