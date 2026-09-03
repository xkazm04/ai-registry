---
layer: application
type: application
subject: browser-credential-boundary
technique: allowlisted-operator-stream
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@20
---

# A self-hosted model gateway's live log stream

The Portkey AI Gateway (`Portkey-AI/gateway`, read at commit
`669825cbe89ee51569918b8f78a9db486fd69dd4`, package version `1.15.2`) is a
proxy that holds every upstream provider credential for an installation and
attaches them to outbound calls. It ships a live log stream at `/log/stream`
and a local operator page under `/public/*`, both mounted only by the Node
entrypoint (`src/start-server.ts`) — the edge and worker builds have neither.
That is the exact shape this technique is about: a debug surface over a process
whose in-memory objects are full of other parties' secrets. The tree states no
`engines` field; its own workflows pin `node-version: '20.x'`
(`.github/workflows/check_code_formatting.yml:19`), which is the version this
document's citations are stated against.

## The allowlist, and the number that makes it one

`src/middlewares/log/index.ts:21-27` is the whole list:

```ts
const ALLOWED_PROVIDER_OPTION_KEYS = new Set([
  'provider', 'overrideParams', 'retry', 'cache', 'requestURL', 'rubeusURL',
]);
```

and `:30-38` applies it by replacing the value of every other key with
`'[REDACTED]'` while keeping the key in place — the "replace the value, keep the
key" rule, implemented exactly. Six keys survive. The object they are filtering
is `Options` (`src/types/requestBody.ts:45-180`), which carries **89 fields**,
among them `apiKey`, `virtualKey`, `awsSecretAccessKey`, `awsSessionToken`,
`azureEntraClientSecret`, `azureAdToken` and `vertexServiceAccountJson`. A
denylist over that object would have to be re-audited against each of the 75
provider directories under `src/providers/`; the allowlist was audited once and
the 90th field arrives redacted. This is the technique's central claim with the arithmetic
attached.

Headers get the category treatment at `:18-19`: `sanitizeHeaders` maps **every**
key to `'[REDACTED]'` with no list at all, and it is applied to both the
transformed outbound request headers (`:61-64`) and the upstream's response
headers (`:69-74`). Nobody enumerates safe header names anywhere in the tree,
which is the correct non-decision.

Volume is bounded at `:5` and `:127-130`: response bodies over
`MAX_RESPONSE_LENGTH = 100000` are truncated with a trailing `'...'`. Streamed
responses are not read at all — `:122-124` substitutes
`{ message: 'The response was a stream.' }` rather than tapping the stream, so
the surface cannot amplify a long generation.

## The gate

`/log/stream` is mounted behind `adminAuthMiddleware`
(`src/start-server.ts:89`), which admits either an in-memory session cookie or
`Authorization: Bearer <admin_token>` matched against `conf.json.admin_token`
(`src/middlewares/adminAuth/index.ts:80-104`). Sessions are minted only by
`/public/auth` (`:123-160`), stored in a module-level `Map` (`:6`), and set as
`HttpOnly; SameSite=Strict; Max-Age=43200` (`:71-78`). The store dies with the
process, which is the property the technique asks for: an operator session that
survives a restart of the thing it observes would be a credential nobody
inventories.

`getConfiguredAdminToken` (`:8-20`) is the check, and its failure message names
both remedies in one sentence — *"Admin UI auth requires conf.json.admin_token.
Set admin_token or start the gateway with `--headless`."* — which is the
three-way choice this technique prescribes, spelled correctly. The third state
is real: `--headless` (`src/start-server.ts:24, 32`) skips mounting the page and
the stream entirely, and so does `NODE_ENV=production` (`:33-36`).

## Where the tree falls short

**The refusal is not a boot condition. It is a 500 per request.**
`getConfiguredAdminToken` throws, but all three of its callers catch the throw
and return `c.json({status:'failure', …}, 500)` — the middleware at
`src/middlewares/adminAuth/index.ts:82-90`, the session-status handler at
`:110-118`, the login handler at `:125-133`. Nothing evaluates the token at
startup. A gateway configured with the page enabled and no `admin_token` boots
clean, binds the port, serves `/v1/*` normally, and the misconfiguration is
discovered by whoever first opens the operator page. The technique's rule —
*the check runs at start, not at first request* — is unmet, and this is a
one-line miss: the same call at module scope in `src/start-server.ts`, beside
the `isHeadless` computation at `:24`, would convert it. What saves the tree
from being an exposure rather than a defect is that the failure is closed
(500/401, never open); what it loses is the property the rule was for, which is
that a broken configuration is loud to the operator rather than to the visitor.

**The boot-adjacent check that does exist reads presence, not value.**
`src/start-server.ts:25-28` computes `hasAdminTokenKey` with
`Object.prototype.hasOwnProperty.call(conf, 'admin_token')` and `:50-55` uses it
to decide whether to serve the page or a message pointing at a discussion
thread. `"admin_token": ""` satisfies `hasOwnProperty`, so the page renders, the
login form appears, and every call behind it answers 500. That is the
gate-sees-target failure named in the technique, in its cheapest form: the check
asks whether a setting was written, not whether what it holds could gate
anything.

**The sanitized region is three sub-objects, not the record.**
`sanitizeRequestOption` (`:40-77`) touches exactly `providerOptions`,
`transformedRequest.headers`, and `responseHeaders`. The log object it is
handed (`LogObjectSchema`, `src/handlers/services/logsService.ts:9-34`) also
carries `requestParams`, `transformedRequest.body`,
`finalUntransformedRequest.body`, `originalResponse.body`, `cacheKey` and
`hookSpanId`, and every one of those is broadcast verbatim
(`src/middlewares/log/index.ts:136-146`). The allowlist is scoped one level
below the record, so it constrains the object that happens to hold credentials
*today*; a credential-bearing field added at the record's top level — or moved
there by a refactor — is published by default, which is the precise failure the
allowlist was chosen to avoid. The fix is scope, not policy: name the record as
the sanitized region and allowlist its top level too.

**The session map has no reaper.** `adminSessions` (`:6`) is only ever pruned
inside `isSessionActive` (`:52-64`), which deletes an entry when a request
presents that specific expired session id. A login whose holder never returns
leaves an entry for the life of the process. It is bounded in practice by how
many times an operator logs in, so the leak is slow rather than adversarial —
but the technique's rule is that expiry enforced only when the holder returns is
not expiry, and a sweep on a timer is a few lines.

**Confirmations worth recording.** The allowlist keeps keys and replaces values
(`:30-38`), so shape survives for the operator. Header redaction is
unconditional and list-free (`:18-19`). The surface has an explicit off switch
that does not require inventing a credential (`--headless`), and it is off by
default in production. And the stream is a genuine second door on the same data,
not a copy of the upstream's: `processLog` (`:112-114`) skips anything whose URL
does not contain `/v1/`, so the operator surface sees the proxied traffic and
nothing else.
