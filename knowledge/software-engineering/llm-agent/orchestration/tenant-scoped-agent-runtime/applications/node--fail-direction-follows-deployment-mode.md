---
layer: application
type: application
subject: tenant-scoped-agent-runtime
technique: fail-direction-follows-deployment-mode
stack: node
status: forged
verified_on: 2026-10-10
refresh_by: 2027-01-10
verified_against: node@18
applied: code
ab_verdict: better
proof: ab-paired
---

# Node — the overlay leaked toward the destination, not toward a tenant

The realization is the cloud worker in the desktop agent app (personas,
`cloud-worker/server.mjs`), a dependency-free HTTP server implementing the
contract the desktop's cloud client speaks: deploy a persona, execute it, poll
the result. Its `package.json` declares `"node": ">=18"`, which is the witness
for `verified_against`; the arms below ran on Node 24.14. Read at personas
commit `8bfc211f64` (the fix, pushed 2026-10-10) and its parent `abe93cd3e6`
(arm A). The worker is a proof of concept, not a shipped surface, and it is
the fleet's only place where a unit of work carries its own credential scope
over a process environment holding the worker's own keys.

## The seam

Each persona carries a model profile — provider, model, base address and an
optional token — and the worker resolves an engine from it per execution. The
profile is the scope; the worker's environment is the process. Before the
change the resolver was the overlay this technique prescribes for a
single-operator deployment, written as a chain of `||`: the persona's token,
else the worker's key for that provider, else (on the second protocol) the
*other* provider's key. The worker admits any caller with a non-empty bearer
token:

- `cloud-worker/server.mjs:376` "// --- Auth: accept any non-empty Bearer token for the PoC."
- `cloud-worker/server.mjs:406` "if (body.id) personas.set(body.id, body);"

and the headless driver states the intended contract — the key is the
worker's, the persona omits it:

- `cloud-worker/headless.mjs:39` "We omit auth_token"

By the technique's own reading this is isolation off: one operator, one set
of keys, nothing to leak from. The seam was chosen because it could falsify
exactly that sentence.

## The structural fact

The profile names **where the call goes** as well as what it carries. A
persona with a base address and no token resolved to the worker's own key
and sent it to that address. The leak needs no second tenant; it needs only
a scope that overrides the destination and not the credential. And the
second-protocol fall-through sent one provider's key to the other provider's
host whenever the first key was absent, and the reverse when both were set
and the persona pointed at the compatibility endpoint.

The change binds the worker key to the host it was issued for, parsed rather
than prefix-matched:

- `cloud-worker/server.mjs:151` "const DASHSCOPE_HOST = /^dashscope(-intl|-us)?\.aliyuncs\.com$/;"
- `cloud-worker/server.mjs:155` "if (host === 'api.anthropic.com') return process.env.ANTHROPIC_API_KEY || '';"
- `cloud-worker/server.mjs:177` "apiKey: mp.auth_token || workerKeyFor(baseUrl),"
- `cloud-worker/server.mjs:186` "apiKey: mp.auth_token || workerKeyFor(baseUrl),"

The operator's own configured endpoint counts as an issued host for the
worker's default key, because the operator chose it. A miss resolves to the
empty string, which the worker already turns into a labelled result rather
than a silent one:

- `cloud-worker/server.mjs:248` "if (!engine.apiKey) {"
- `cloud-worker/server.mjs:253` "[mock — no API key configured for engine"

## Proof

**Measurable.** Target: process credentials delivered to a host they were not
issued for. Floor: every other resolution — persona token, worker key to its
own host, no key — unchanged.

**Arms.** The resolver was sliced out of each commit and replayed over twelve
profiles (default, own token, own base address on and off the provider's
hosts, a suffix-spoofed host, a loopback host, the compatibility endpoint)
crossed with four environment states (either key, both, neither): 48 cases
per arm.

| | foreign-host deliveries | floor rows unchanged | no-key results |
| --- | --- | --- | --- |
| A (`abe93cd3e6`) | 13 / 48 | — | 14 |
| B (`8bfc211f64`) | 0 / 48 | 35 / 35 | 26 |

One case improved rather than closed: with both keys set, a persona on the
compatibility endpoint received the other provider's key in A and its own in
B. The classifier and the fix share one definition of "issued host", so a
second layer checked it independently: each arm ran as a real process with a
canary key, and a local capture server stood in for a caller-chosen base
address. Arm A delivered the canary to it on the second-protocol path; arm B
sent no request there. The operator-configured endpoint received the canary
in both arms. Lint and the project's commit and push gates (typecheck, census,
i18n, evals) were green.

## What this realization cannot do

The worker still accepts any non-empty bearer token, so "isolation off" here
is an assumption about who reaches it, not a declared mode, and nothing in the
process says which one it is. If it were ever offered to callers other than
its operator, a persona with neither token nor base address would still spend
the operator's key on the default host — which is the mode question this
technique asks, now with the destination half closed. And a keyless engine
completes as a labelled stand-in rather than failing; that satisfies "a
fallback that fires says so", but a caller reading only the status sees
`completed`.
