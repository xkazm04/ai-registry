---
layer: application
type: application
subject: data-retention
technique: destructive-override-floor
stack: node
status: forged
---

# Node: a safety floor that refuses a fat-fingered retention window

A repository-audit product where the per-organization scan history *is* the
compliance evidence realizes the floor in `src/lib/db/retention.ts`. The
comment block at `src/lib/db/retention.ts:69-77` states the threat in the
form this technique argues for:

> A per-org override is applied verbatim, so a fat-fingered
> `retentionMaxScans = 1` (meant `100`) or `retentionAuditDays = 1` would
> irreversibly wipe nearly all of an org's scan history / audit trail on the
> next cron tick — for an audit product, the compliance evidence itself.

## The shape, mapped to the technique

**Policy resolution first.** `envRetentionDefaults()` reads the global
defaults; `resolveRetention(defaults, org)` (a pure, unit-tested function)
applies the per-org override with `??`, so an explicit `0` wins over the
default and `null` inherits. Both windows — `maxScansPerRepo` (keep newest N
per repo) and `auditDays` (age-based) — live on one `RetentionPolicy`, the
two window shapes the technique names.

**The floor is two named constants**, `RETENTION_MIN_SCANS_PER_REPO = 5` and
`RETENTION_MIN_AUDIT_DAYS = 7` (`retention.ts:76-77`), enforced in the purge
loop at `retention.ts:416-433` — at the resolution site every deletion path
passes through, not in a settings form.

**It refuses, it does not clamp.** The below-floor branch pushes a message
onto `errors` and `continue`s: the org is skipped entirely, nothing is
deleted, and the stored (dangerous) value is left visible rather than
silently corrected. The error text names both the offending value and the
floor, then tells the operator the two ways forward — preview it, or opt in.

**The refusal is loud.** `errors.length > 0` trips a 207 Multi-Status at
`src/app/api/cron/purge/route.ts:68-77`, chosen because the scheduled runner
and uptime monitors watch only the HTTP status. The route's own comment
records the regression that taught this: gating the 207 on `errors` alone
returned 200 for a run whose trailing sweeps were skipped for budget, so the
decision was widened to `errors.length > 0 || summary.stoppedEarly` — both
degradation channels in one place, rather than scattering `(budget):` error
strings across every skip branch. That is the golden path's "degraded is
never green" as a maintained invariant, discovered the hard way.

**The opt-in is out of band.** The bypass is the process-level
`RETENTION_FORCE=1` (`retention.ts:417`), not a request parameter — the
person editing the org's window cannot also authorize bypassing the check on
it. Exactly the separation the technique requires.

**The sentinel is exempt.** Both guards read `policy.X > 0 && policy.X <
FLOOR`, so `0` — "keep everything" — passes through untouched. The module
carries the same 0-means-unlimited convention through its sibling settings,
including the run's own time budget (`RETENTION_TIME_BUDGET_MS=0` is
unlimited), so there is one vocabulary for "off" rather than two.

**Preview is exempt too, deliberately.** `retention.ts:417` guards the floor
with `!opts.dryRun`: a dry run previews a sub-floor policy unimpeded. The
inline note — "previewing a sub-floor policy is exactly what it is for"
(`retention.ts:290-292`) — is the reasoning behind the technique's rule that
the preview shows the yield the refusal is protecting against, rather than
reporting a misleading zero.

## Adjacent guards this pairs with in the same code

- **Fail-closed entry point.** `src/lib/cron-auth.ts:49-68` returns 503 when
  `CRON_SECRET` is unset (never "skip the check"), 401 on a bad credential,
  accepts the secret only from an `Authorization` header, and compares with
  `timingSafeEqual`. The file's own history is the lesson: the shared helper
  was once *weaker* than the hand-rolled checks it replaced (it accepted
  `?key=` and compared with `!==`), so two routes refused to adopt it until
  the canonical gate became the strict one.
- **Fail-closed configuration.** `purge/route.ts:33-48` refuses with 503 when
  the database is unconfigured, because a deploy that lost its connection
  string would otherwise return a green 200 daily while every retention
  window silently stopped being enforced. A genuinely database-less
  deployment opts into the quiet skip explicitly.

## Deviation worth noting

The floor protects the *purge* path. The on-demand erasure path
(`src/app/api/org/erase/route.ts`) can erase an org's entire audit trail via
`includeAudit: true` with no floor at all — correct for a compelled erasure,
but it means the audit trail's protection rests entirely on the confirmation
ladder there rather than on any minimum. The standard in the technique
stands: where an unattended path can reach the same population, it needs the
floor regardless of what the attended path does.
