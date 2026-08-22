---
layer: application
type: application
subject: optional-dependency-degradation
technique: absent-degrades-malformed-fails-fast
stack: node
status: forged
verified_on: 2026-08-22
verified_against: node@22
---

# A marketing-and-dashboard app that boots with an empty environment

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
  `src/app/api/stats/route.ts:426-438` implements exactly that ordering: the
  unset-token 503 is checked *before* `isAdminAuthorized`, which itself returns
  false rather than throwing when the variable is missing (`:377-379`). Absence
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
