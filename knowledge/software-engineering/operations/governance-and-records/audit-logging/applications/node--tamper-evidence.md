---
layer: application
type: application
subject: audit-logging
technique: tamper-evidence
stack: node
verified_on: 2026-08-20
---

# Migration-free tamper evidence on a live audit table

A repository-maturity product whose entire output is compliance evidence
took its audit table from "a plain mutable table, no hash/chain/signature"
to examiner-grade **without a schema change**, and the module that does it
states its own limits in its header rather than hiding them:
`src/lib/db/audit-integrity.ts:1-12`.

## Rung two, chosen on purpose, with the trade-off written down

The mechanism is a per-row keyed digest — `signAudit` computes an
HMAC-SHA256 over the row's own content and returns it base64url
(`audit-integrity.ts:58-62`), and `withAuditSignature` folds it into the
row's existing free-form `meta` JSON as `_sig` (`:64-71`). No new column,
no migration, no backfill; a live table gains tamper evidence on the next
deploy.

The header names the cost the technique insists on naming: "No new column,
**no chain (so no concurrent-writer fork)**, verifiable independently per
row" (`:6-7`). That is the ladder's rung-2/rung-3 decision made
explicitly — this ledger is written by many concurrent request handlers
and cron lanes, a chain would fork, and the price paid is that a *deleted*
row is undetectable while an *altered* row is not. The trade-off is
recorded where the next reader meets it, which is the difference between a
priced decision and an overclaim.

## The canonical form, and the timestamp trap

`canonical()` (`:46-55`) serializes a fixed field list — action, orgId,
actorId, createdAt, meta — with `sortKeys()` (`:31-44`) recursively
sorting object keys "so two equal objects serialize identically regardless
of build order". The covered set is exactly those five fields, and the
read model's own type comment enforces the consequence: `orgId` "is a
SIGNED field … so it must be present in any export for per-row HMAC
verification to be reconstructable" (`src/lib/db/scans-audit.ts:161-163`).

The stored-versus-intended rule appears as a fix with the incident above
it. The write door stamps the time explicitly — "Stamp the time explicitly
so the value we SIGN matches the value we STORE" (`scans-audit.ts:34-38`)
— because letting the database default the column would sign a different
instant than the row carries and, per the regression test, "verify every
row as `tampered`" (`src/lib/db/org-watch.test.ts:350-353`).

## Verification on read — the half that was missing

The signature shipped before anything checked it, and the field comment
that fixed it is the technique's thesis in the repo's own words:
"verification was write-side only, **which is not tamper-EVIDENCE —
evidence requires someone to look**" (`scans-audit.ts:167-173`). Now
`getAuditLog` recomputes a verdict per row as it is served
(`scans-audit.ts:323-329`), reconstructing exactly the signed shape, so
the API, the CSV export and the dashboard panel all state a verdict.

The verdict type is four-valued — `"ok" | "tampered" | "unsigned" |
"no-secret"` (`audit-integrity.ts:73`) — and the comment insists on the
rendering rule: `unsigned` "is a real and expected value, not a failure …
It must be rendered distinctly from `ok` — 'we cannot vouch for this row'
is not 'this row is fine'" (`scans-audit.ts:175-178`). Comparison is
constant-time (`:84-86`), and with no secret configured the module signs
nothing and degrades "to today's behaviour rather than failing a write"
(`:11-12`).

The unsigned population as a coverage detector is demonstrated by a real
defect: a conformance write in `src/lib/db/org-watch.ts` used to
`JSON.stringify` its meta directly, bypassing `withAuditSignature`, "so
conformance rows landed unsigned in the one table whose purpose is
tamper-evidence, and for the one action a customer self-reports from their
own CI (the rows most worth forging)" (`org-watch.test.ts:350-352`). The
fixed write signs over the timestamp it stores (`org-watch.ts:520-538`).
An unsigned row was the only symptom of a second write door.

## The filed artifact, and the truncation rule

Exports carry `sha256Hex` of the delivered bytes in an
`x-ascent-content-sha256` response header — beside the content, not inside
it (`audit-integrity.ts:89-96`; used at `src/app/api/audit/route.ts:82`,
`src/app/api/history/route.ts:105`,
`src/app/api/org/conformance-pack/route.ts:129`). The audit CSV export
also states the completeness rule the technique demands, verbatim:
"TRUNCATION HONESTY: … The SHA below signs whatever bytes we emit, so a
truncated file would otherwise be filed as complete compliance evidence
with a valid integrity hash — false confidence"
(`api/audit/route.ts:64-68`). A capped run therefore ships
`x-ascent-truncated`, `x-ascent-row-count`, `x-ascent-row-cap` and a
`-PARTIAL` filename (`:69-87`).

## The registered deviation: a delete on the append-only ledger

The weekly digest cron uses an audit row as its at-most-once key —
`DIGEST_SENT_ACTION = "org.digest.sent"`, "migration-free, since
Organization has no spare last-sent column"
(`src/app/api/cron/digest/route.ts:57-61`) — claimed by one conditional
insert inside a retried transaction (`src/lib/db/scans-audit.ts:78-129`).
Correct as a claim, and its failure path is exactly the collision this
subject flags: `releaseAuditClaim` (`scans-audit.ts:131-143`) performs
`auditLog.delete({ where: { id } })` — a targeted, content-specific delete
on the ledger, which is a mutation surface however narrowly scoped. The
standard's preferred shapes (keep the claim in a control store, or express
retraction as a record) are not what this ledger does; the row simply
disappears, and with it the per-row signature that would have made its
disappearance visible — the one alteration this rung of tamper evidence
cannot detect. Recorded here as an instance of the defect, not as a
lowering of the rule.
