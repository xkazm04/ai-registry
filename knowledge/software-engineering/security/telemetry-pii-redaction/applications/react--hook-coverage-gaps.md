---
layer: application
type: application
subject: telemetry-pii-redaction
technique: hook-coverage-gaps
status: forged
stack: react
verified_on: 2026-08-22
verified_against: react@19
---

# One base config, two hooks, and a wrapper for the gaps

A React 19 / Next.js site sends to Sentry from three runtimes — client,
server and edge. This is how it keeps all three scrubbed and where it
writes down what the hooks cannot reach.

## One shared base so no runtime can initialise unscrubbed

`src/lib/sentry.ts:4` is the whole configuration surface:

```ts
export const baseSentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: scrubEvent,
  beforeBreadcrumb: scrubBreadcrumb,
} as const;
```

`initSentry` (`:17`) spreads it under per-runtime overrides, and all three
entry points call it: `sentry.server.config.ts:3` and
`sentry.edge.config.ts:3` are one line each with no arguments, and
`sentry.client.config.ts:3` passes only replay sample rates. Adding a
fourth runtime cannot produce an unscrubbed one, because there is nowhere
to put a `Sentry.init` that does not go through this function.

Note what the overrides in the client config actually do:

```ts
initSentry({ replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0 });
```

Session Replay is a channel `beforeSend` never sees and a field walker
could not scrub if it did — it reconstructs a screen, and the screen has
the user's data on it. The answer here is the sample rate at zero, in the
shared config, alongside `tracesSampleRate: 0`. Disabled is the only
coverage that cannot regress.

`sendDefaultPii: false` is set, and it is the *smallest* control in the
file: it suppresses what the SDK infers (IP address, cookies, framework
usernames) and nothing the application hands over.

## The gap paragraph lives at the wrapper

`src/lib/sentry-pii.ts:197` is the densest block in the tree — the docblock
above `captureExceptionScrubbed`, which states what the global hook does
**not** cover:

> The global `beforeSend` hook (`scrubEvent`) already runs on every event,
> but it only touches `event.message` / `exception.values[].value` /
> breadcrumbs — it does NOT touch the original `error.message` or
> `error.stack` strings, and it does NOT scrub `extra` / `contexts`
> payloads the caller passes in. Top-level error boundaries are the
> highest-volume Sentry path on the site and the one most likely to fire on
> real user sessions, so an explicit scrubbing wrapper here closes a
> privacy / compliance gap that CLAUDE.md mandates.

The implementation (`:208`–`:221`) rebuilds the `Error` with a scrubbed
message, copies a scrubbed `stack` and preserves `name`, then delegates to
`Sentry.captureException`. It runs *before* assembly, which is why it can
reach the raw `stack` string the hook never sees.

The hook side does reach further than that paragraph claims in one respect:
`scrubEvent` walks stack-frame `vars` (`:135`–`:142`) and the whole
`contexts` block (`:145`–`:156`), and the comment at `:145` names `contexts`
"the most common leak path" with the exact call shape that causes it —
`Sentry.captureException(err, { contexts: { persona: { id } } })` passing
raw UUIDs the message-only scrubber never sees. Two mechanisms, overlapping
deliberately.

## The call sites

`src/app/error.tsx:25` and `src/app/global-error.tsx:24` use the wrapper,
with `error.tsx:24` recording why — a raw capture "could leak file paths /
URLs with PII / emails". `src/components/dashboard/DashboardErrorBoundary.tsx:68`
uses it too, and its comment at `:65` names the React 19 specific:
`componentStack` "often quotes file paths and prop values that should never
reach Sentry raw" — which is the quoted-span pattern's reason for existing.

`src/components/WaitlistModal.tsx:121` shows the other correct move,
construction over filtering: instead of capturing the raw failure it mints
`new Error(\`waitlist POST failed (status=..., code=...)\`)` so, per the
comment at `:118`–`:119`, "the Sentry title stays machine-readable and
carries no email" — on the one form in the product where the user types
one.

The house rule is `.claude/CLAUDE.md:70`, binding every new breadcrumb or
`captureException(err, { extra })` to a check against the scrubber's field
set.

## Where this tree falls short of the technique

- **The wrapper rule is not held.** 24 call sites call
  `Sentry.captureException(` directly against 8 that call
  `captureExceptionScrubbed(` — counted across `src/` on 2026-08-22 by
  matching those two literals and excluding the scrubber module's own
  definition (`sentry-pii.ts:220`) and its docblock example (`:146`).
  Those 24 get hook coverage only, so their `error.stack` and any
  caller-supplied `extra` go out as the hook left them. This is the
  technique's own prediction — a social control violated within a
  quarter — and it is exactly why the hook stays installed underneath.
- **Neither hook is guarded.** `scrubEvent` (`:109`) and `scrubBreadcrumb`
  (`:224`) have no try/catch; a getter that throws inside `Object.entries`
  reaches the SDK, whose documented behaviour on a throwing `beforeSend` is
  not "drop the event".
- **Metrics bypass the boundary entirely.** `src/lib/analytics.ts:19`
  sends through `Sentry.metrics.count`, which `beforeSend` never sees, and
  `trackFeatureRequest` (`:86`) forwards raw user free text as
  `text.slice(0, 200)` — size-capped, never scrubbed. This is the sibling
  channel the technique warns about, live.
- **The gap paragraph is stale in one direction.** It says the hook does
  not scrub `contexts`; `scrubEvent:148` does. A coverage claim that has
  drifted from the code is the failure mode the technique names, and the
  fix is a paragraph edit in the same change as the code that outgrew it.

## Version note

`react` is pinned at `^19.2.8` (`package.json:43`) on `@sentry/nextjs`.
The three-runtime shape (client / server / edge config files) is a Next.js
App Router property, and it is the reason a single shared base config is
worth the indirection here.
