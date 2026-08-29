---
layer: application
type: application
subject: optional-dependency-degradation
technique: absent-degrades-malformed-fails-fast
stack: node
status: forged
verified_on: 2026-08-29
verified_against: node@24
---

# Tree A — a marketing-and-dashboard app that boots with an empty environment

Citations re-resolved 2026-08-29 against `personas-web@a6ec62f` (Next.js 16,
Node 24 on the verifying machine); the stats-route lines had moved and are
updated below. Tree B (a different app in the same fleet, 2026-08-29) follows.

This repo is a Next.js 16 app whose environment template opens with the claim
the whole subject is about (`.env.example:5-6`): "The app boots without any of
these set; Supabase- and orchestrator-backed features simply degrade (no voting
persistence, no live dashboard, etc.)." Fourteen variables, none required, and
the asymmetry implemented in two different places for the two dependencies that
have an address to get wrong.

## The malformed half: one validator, three messages

`src/lib/orchestrator-config.ts` is the technique's message rule written out.
One error class (`OrchestratorConfigError`, `:1-10`) and one validator
(`validateOrchestratorUrl`, `:12-33`) producing three distinct refusals:

- **missing** (`:13-15`) — the class's default message names the variable, gives
  an example (`https://orchestrator.example.com`) and states the next action
  ("then redeploy");
- **malformed** (`:20-25`) — `Malformed NEXT_PUBLIC_ORCHESTRATOR_URL: <value>.
  Expected an absolute URL like …`, with the raw value passed through
  `JSON.stringify` so a trailing space or an embedded newline is visible in the
  log;
- **wrong protocol** (`:26-31`) — a separate message naming the observed
  protocol, because "you forgot the scheme" and "you used the wrong scheme" have
  different fixes.

Quoting the value in full is correct here and is the source of the technique's
trust-class split: this variable is a public address, not a secret. The
service-role key three lines away in the template would have to be described,
never echoed.

## Fail fast means the runtime's earliest hook

`src/instrumentation.ts:13-23` calls the validator from the framework's
`register()` hook — before the first request — and the comment states exactly
who the timing is for: fail here "so a bad deploy surfaces here (with the
offending value named) instead of as a generic `Invalid URL` DOMException on
every API call."

The guard around the call is the technique's presence-branch, spelled out in
three conditions (`:17-21`): skip when mock mode is on, skip when the variable
is `undefined`, skip when it trims to empty. Absent never reaches the validator;
only a present value is judged. And the mock-mode skip is the exemption taken
the right way — `NEXT_PUBLIC_USE_MOCK_API !== "true"` gates the whole
validation, with the reason written at the skip ("Skipped when running mock-mode
dev where the URL is intentionally absent"), rather than the validator being
loosened so that every deployment tolerates a bad address.

The empty-string normalisation appears again, generalised, in
`src/lib/server/env.ts:3-6`: `getOptionalEnv` returns `undefined` for a value
that is missing *or* whitespace-only, so every server-side reader gets one
answer to "is this set" instead of each one deciding whether `""` counts.

## The absent half: four fallback shapes, one per surface

- **A throwing accessor.** `src/lib/supabase.ts:5-14` memoises a client and
  throws `Supabase env vars not configured` when the public pair is absent —
  never a null, never a stub. `src/stores/authStore.ts:89-99` is the catch that
  makes it worth it: the auth bootstrap wraps *only* the accessor call, and on a
  throw it sets `isLoading: false` and returns, falling through to the
  unauthenticated gate. The comment names the guarantee it is protecting —
  "Keeps the 'demo is always available' guarantee" — and the alternative it
  refuses: "Don't hard-error into the session-error screen."
- **A closed door.** `.env.example:95-101` documents `STATS_ADMIN_TOKEN` as
  "Leave unset to disable the purge endpoint entirely (it returns 503 when this
  is absent, so it can never be reached unauthenticated)", and
  `src/app/api/stats/route.ts:503-511` implements exactly that ordering: the
  unset-token 503 is checked *before* `isAdminAuthorized`, which itself returns
  false rather than throwing when the variable is missing (`:458-459`). Absence
  closes the door; it never opens it.
- **An empty string consumers test.** `src/lib/seo.ts:15-21` states the
  convention in its own doc comment — "Empty string means no status page is
  configured for this deployment; the consumer should hide the related link
  rather than render a broken one" — and `SITE_URL` (`:3-4`) shows the other
  half of the same idea, a real default rather than an empty one, because a
  canonical address has a correct fallback and a status page does not.
- **A conditional security directive.** `next.config.ts:50` adds `*.sentry.io`
  to `connect-src` only when `NEXT_PUBLIC_SENTRY_DSN` is set, then filters the
  empty entries out of the joined list. This is the companion-setup-step fact
  from the template's sibling technique enforced in code: the credential alone
  would not have been enough, because the browser blocks the host the value
  points at.

## Deviations

- **The boot summary does not exist.** Nothing prints, at start-up, which
  features are running degraded. A deployment missing the orchestrator URL, the
  service-role key and the error DSN boots identically to a fully configured
  one, and the only trace is a single `console.warn` fired at most once per
  instance from `src/lib/supabase-admin.ts:34-42` — on an ephemeral serverless
  runtime, a once-per-instance warning is a warning nobody reads.
- **Only one of the fourteen variables is shape-validated.** The orchestrator
  URL is checked; `NEXT_PUBLIC_SUPABASE_URL` is not, even though
  `src/stores/authStore.ts:106-108` parses a project reference out of it with a
  regular expression and silently gets `""` when the shape is wrong. The
  template's own placeholders (`https://YOUR_PROJECT.supabase.co`,
  `YOUR_ANON_KEY`, `YOUR_SERVICE_ROLE_KEY`, `.env.example:12-21`) are
  mechanically recognisable — exactly what the technique asks for — and no
  validator rejects them, so a copied-but-unedited template produces a
  present-and-wrong configuration that boots clean.
- **The typed error is not the general case.** `OrchestratorConfigError` is a
  named class the proxy route can `instanceof`
  (`src/app/api/orchestrator/[...path]/route.ts:25`); the Supabase accessor
  throws a bare `Error` with a message, so `authStore` has to catch everything
  and can only be correct because the guarded region is one line long.

# Tree B — an org dashboard whose ingest secret used to have a default

`ascent@10cbd8fa` (Next.js 16, Node 24 per `package.json` engines) is the
technique's two edge cases in one tree: a secret that was defaulted to a
constant, and a set of tunables that still default on parse failure.

## The constant that stood in for a secret

Commit `ba86700e` is the incident, in the repo's own words: the per-org ingest
token was an HMAC under `INTEGRATIONS_INGEST_SECRET`, and the reader fell back
to a hardcoded `"ascent-dev-integrations-secret"` — "described in its own
comment as 'a clearly-marked dev default so the local demo shows a working
token'. It was neither dev-only nor marked at runtime: there was no NODE_ENV
guard, and `.env.example` never named `INTEGRATIONS_INGEST_SECRET` or
`ENCRYPTION_KEY`, so the documented way to deploy this project produced a live,
internet-facing ingest endpoint whose per-org tokens were signed under a
constant that ships in an AGPL repository." Anyone reading the source could
mint a valid token for any org and write usage rows into its data.

The fix is the golden path's "minted value is never a constant" rule
implemented as a closed door. `src/lib/integrations/ingest-token.ts:39-41` now
reads the secret at call time and returns `null` with no fallback; `:48-50`
exports `isIngestConfigured()` as the companion predicate; `:66-74` makes the
mint function throw rather than "mint a credential nobody can verify". And the
template entry written in the same change (`.env.example:274-289`) is a
blast-radius line in the exact shape the sibling technique asks for — "WHAT IT
COSTS TO LEAVE UNSET: the whole ingest path is refused…", "WHAT IT COSTS TO
ROTATE: every org's token changes at once" — including the cross-variable
coupling nobody would otherwise find (`ENCRYPTION_KEY` is accepted as a
fallback, so rotating *that* also invalidates every ingest token).

## Tunables that still default on a parse failure

`src/lib/integrations/ingest-guard.ts:32-35` is the idiom the technique's
tunables section names:

```ts
function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
```

Absent, `Number(undefined)` is `NaN` and the default applies — correct. But
`RATE_LIMIT_INGEST_PER_IP=3,000` (a thousands separator), `=3000/min`, or
`=0` all take the same branch and silently run the limiter at the default
(`:59-65`). The ceiling above it is *derived* — a fifty-line comment
(`:37-58`) recomputes it from the exporter's real push cadence and declares
`basis: "derived"` — so an operator who raised the cap for a larger fan-in
and mistyped it gets the derived default back with no line in any log, and
the first sign is a legitimate exporter receiving 429s.

The boolean twin is `src/lib/rate-limit.ts:352-355`: `sharedFailOpen()`
accepts `1` and `true` after lower-casing; `yes`, `on`, or `enabled` read as
fail-closed. That is the safe direction of the misread for this switch (the
default is closed, `:16-21`), which is why nobody has noticed. The strictness
switch in the same template, `CONFORMANCE_INGEST_STRICT=1`
(`.env.example:297-299`), has the dangerous direction: a mistyped `true ` with
a trailing space reads as off, and the deployment keeps accepting the legacy
deployment-wide token with only a deprecation warning.

## Deviations

- **No boot-time validator, and no boot.** This app deploys to a
  per-cold-start runtime, so the technique's "where there is no boot" case
  applies in full: nothing validates the tunables or the secret's shape at
  build or deploy, and a malformed value would surface per request. The
  closed-door refusal for the secret is right; the tunables are still the
  parse-then-default shape at three sites (`ingest-guard.ts:61-62`,
  `rate-limit.ts:352-355`).
- **The template's own placeholder convention is absent.** The ingest secret
  is documented with a generation command (`openssl rand -hex 32`) rather than
  a recognisable placeholder, which is the right choice for a secret — but no
  validator rejects a short or whitespace-padded value, so a secret pasted with
  a trailing newline signs tokens under a different key than the one the
  operator thinks they set.
