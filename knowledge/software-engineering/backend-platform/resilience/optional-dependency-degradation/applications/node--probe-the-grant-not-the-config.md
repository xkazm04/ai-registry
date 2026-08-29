---
layer: application
type: application
subject: optional-dependency-degradation
technique: probe-the-grant-not-the-config
stack: node
status: forged
verified_on: 2026-08-29
verified_against: node@24
---

# A route that picks its storage tier from a truth table

Citations re-resolved 2026-08-29 against `personas-web@a6ec62f`; the route
gained a few lines above the handlers and the line references below were
moved accordingly. Every claim still holds.

`src/app/api/waitlist/route.ts` is the technique's worked example, including the
incident that produced it. The route accepts signups and can write them to a
hosted Postgres table or to a local JSON file, and the whole question is which
predicate decides.

## The truth table, in the file header

`:10-16` is a four-row matrix in a comment, one column per variable and one for
the resulting store:

```
NEXT_PUBLIC_SUPABASE_URL | ANON_KEY | SUPABASE_SERVICE_ROLE_KEY | store
unset                    | any      | any                       | file
set                      | any      | unset                     | file
set                      | any      | set                       | Supabase
unset                    | any      | set                       | file
```

The `any` column is the point of the table: the anon key — the value that most
"is the database configured?" checks read — does not appear in the answer at
all.

## Why the write-granting key is the switch

`:18-26` states the failure in the repo's own words. `getSupabaseAdmin()`
"prefers the service-role client but silently falls back to the anon client when
the key is missing", and the hardening script does `revoke all on
public.waitlist_entries from anon`. So "a URL+anon-only deployment used to route
every insert into a client that has no grants — every signup died as a generic
500." The correction is the preference order this subject argues for: "The file
store is lossy, but it is never silent about it and never eats a signup at
request time."

The predicate itself lives in `src/lib/server/env.ts:36-41`.
`hasSupabaseServiceRole()` tests the URL plus `SUPABASE_SERVICE_ROLE_KEY`, and
its doc comment (`:23-35`) is the technique compressed to four sentences:
"`hasSupabaseEnv()` only proves the *public* pair is set… a URL+anon-only config
produces a client whose every write fails. Routes that write those tables must
gate on this, not on `hasSupabaseEnv()`." The module is `import "server-only"`
(`:1`), so the privileged key can never be read from a path that ships to a
browser.

`src/lib/supabase-admin.ts:19-45` is the silent-substitution factory the gate
exists to compensate for: when the service key is absent it warns once
(`:34-42`) and returns the anon client (`:43-44`). Its own comment carries the
expiry the technique demands — "that fallback only holds while the permissive
legacy RLS is still in place" — which is the coupling between degradation and
hardening written at the substitution.

## One tier, both handlers

`:78-84` defines a local `hasSupabase()` delegating to
`hasSupabaseServiceRole()`, and the comment states the rule that keeps a
two-tier feature coherent: "GET and POST must agree on the store, or the counts
would come from one backend while the entries land in the other." `GET:163` and
`POST:233` both branch on that one expression.

## The refusal contract on the same route

The closed union is declared at `:63-66` — `rate_limited | invalid_email |
invalid_platform | store_unavailable` — with the rule beside it: the prose
`error` field is English-only and kept for existing consumers, the browser
renders a translated string chosen from the code, and "Never reword a code."
Every refusal goes through one helper (`waitlistError`, `:69-76`) that cannot
produce a body without a code.

`:241-264` is the split the technique asks for. A unique-violation
(`error.code === "23505"`) is the caller's situation and returns a 200 with
`duplicate: true`; everything else — "missing grants, table absent, network" —
is "an infrastructure fault, not a user error", and returns `store_unavailable`
with a 503 and `Retry-After: 30`. The comment also records the disclosure rule:
the Postgres error message "can echo the offending row (i.e. the email), so only
the error *code* and the platform are reported."

## Deviations

- **The failed count reaches telemetry, not the caller.** `GET:170-187` tracks
  a `failed` sentinel across three parallel count queries and reports it —
  "a zeroed response used to be indistinguishable from an empty waitlist. Report
  the fault instead of hiding it." But the fault is reported to the error
  tracker only; `:178` still writes `counts[platform] = error ? 0 : …` and
  `:189` returns those zeros with a 200. The client cannot tell a failed count
  from an empty waitlist, which is the exact condition the comment names. The
  standard wants the refusal (or a per-platform null) on the wire as well.
  Still true on 2026-08-29.
- **The naive predicate survives beside the correct one.**
  `hasSupabaseEnv()` (`src/lib/server/env.ts:16-21`) is still exported, and the
  route's local shim is still named `hasSupabase()` — the misleading name kept,
  with correctness supplied by the delegation. The next writer to reach for a
  storage gate will read the short name first.
- **The truth table is a comment on one route.** It is the best artifact in the
  repo for this technique and it is invisible from the environment template,
  which says only that the file store is "(dev-only, ephemeral)"
  (`.env.example:18-20`). The table and the blast-radius document are two copies
  of one fact.
- **The template is missing variables the code reads.** Five that select real
  behaviour are absent from it — among them `NEXT_PUBLIC_DATA_SOURCE`, which
  switches the entire dashboard data layer between the orchestrator and the
  hosted database (`src/lib/api.ts:347`), and `NEXT_PUBLIC_SITE_STATUS_URL`,
  whose fallback contract is documented in `src/lib/seo.ts:15-21` and nowhere a
  deployer would look. `TRUST_PROXY` (`src/lib/server/request.ts:35`) is the
  sharpest of them: it changes which header the rate limiter believes.
