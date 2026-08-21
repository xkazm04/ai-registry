---
layer: application
type: application
subject: portable-hiring-records
technique: personal-data-egress-audit
stack: node
status: forged
---

# Two egress doors, two gates, one manifest

This codebase has two personal-data egress paths, and they are instructive
together because one is bulk and one is per-subject, and they solve the audit
problem differently.

## The bulk door: manifest-scoped and double-gated

`app/api/workspace/export/route.ts:11` records what it replaced:

> This replaced a WHOLE-DATABASE dump. That version enumerated `sqlite_master` and did
> `SELECT * FROM <table>` with no predicate, so with `KP_MULTI_WORKSPACE` on any
> signed-in member could download every other team's candidates, contacts and
> transcripts in one request — which is why it was hard-refused (503) rather than
> shipped.

That is the golden path's "refuse it outright" rule executed in production: the
over-broad door was closed while the narrow one was built, not left open for one
more sprint.

The replacement is scoped by **manifest, not by enumeration**. `orgExportClass`
(`app/_lib/tenancy.ts:453`) returns an export class per table and returns `null`
for anything unclassified; `dumpOrg` is driven by that manifest rather than by
`sqlite_master`. The fail-closed half is a test:
`app/_lib/tenancy-coverage.test.ts:86` collects every declared table whose class is
`null` and asserts the list is empty, with the reasoning in the comment above it —
*"then it fails HERE, in CI, instead of by leaking or by silently omitting
somebody's data."* An unclassified table breaks the build. That is exactly the
technique's coverage check, and it is the difference between a manifest and a
document.

The gate is double, and the route says why (`:25`): *"this exports FULL PII
(candidates, contacts, transcripts) for the whole org, so it is gated twice — a
valid non-demo session, AND `org:manage`."* `requireOperator()` rejects the
anonymous demo session that the proxy would otherwise accept; `requireOrgCapability
("org:manage")` resolves org-wide from live memberships rather than from the
session's team, which is what makes it hold under multi-workspace.

The exclusions travel with the file: `ORG_CONFIG_NOT_PORTABLE`
(`app/_lib/tenancy.ts:472`) is echoed into the payload's `notPortable` *"so the
reason travels with the file"*, and a second test (`tenancy-coverage.test.ts:94`)
asserts each of those tables really is classified `exclude` — because a summary
promising an absence that the file contradicts is worse than no summary.

## The per-subject door: audited on the subject's own timeline

`app/api/ats/candidate/[id]/route.ts` returns one candidate's full portable record.
Its audit is filed not in a global export log but on that candidate's own immutable
pipeline-event timeline, and `app/api/ats/candidate/ats-candidate-audit.ts:3`
states the threat it addresses — the finding's remaining gap was *"unscoped,
unlogged, and enumerable"*, and the fix makes *"a bulk harvest detectable after the
fact."*

The detail line is deliberately PII-light: `buildAtsExportAudit` writes the schema
version plus whether a sealed decision and an offer were included — *"enough to
prove WHAT egressed without copying the PII into the audit row."* That is the
technique's rule against accumulating export payloads in the audit store, applied
without being told.

## The import side

`app/api/workspace/import/route.ts:3` is dry-run-by-default, apply-by-flag, and
delete-by-second-flag, with the reason stated in the header: *"so '12 tables' can
never stand in for 'and 4,000 rows are about to go'."* And the foreign-file refusal
sits before `planOrgRestore`, not before `restoreOrg`, with the reason at `:44`:
planning a foreign file *"would report counts for a scope this caller has no
authority over"* — the dry run gated exactly like the apply.

## One deviation, and the standard stays

The per-candidate audit write is best-effort. `route.ts` wraps `recordEvent` in a
`try/catch` and continues on failure, falling back to a server error log — the
comment argues *"a failed audit-write must not break a legitimate operator export,
but it is never silent."* The fallback is genuinely better than nothing, and the
availability argument is real for a single-record read.

The standard does not move. For a personal-data egress the record is a
precondition, because the failure mode is not an inconvenienced operator, it is an
export nobody can prove happened — and the conditions under which an audit write
fails (load, incidents, a degraded store) correlate with the conditions under which
you will most want the record. The asymmetry the decision-audit discipline draws
holds here too: a refused export costs a retry; an unrecorded one costs the ability
to answer whose data left.
