---
layer: application
type: application
subject: grant-source-landscape
technique: close-date-normalization
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: three deadline dialects, one normalized shape (grant-writing-nonprofits)

The ingest layer of `grant-writing-nonprofits` normalizes three sources'
deadline conventions into one `closeDate` / `closeTime` / `closeTz` triple
on `IngestedGrant`, each at its own adapter boundary.

## The end-of-day convention, stamped at ingest

The U.S. federal clearinghouse publishes bare close *dates*. Its
documented convention — applications close 23:59 Eastern on the stated
date — is encoded once, in `normalize()` at
`src/features/grant-ingest/grantsGov.ts:83-86`:

```ts
closeDate: sanitizeCloseDate(raw.closeDate ?? null),
// grants.gov's documented convention: applications close 23:59 ET on the date.
closeTime: "23:59",
closeTz: "America/New_York",
```

Every downstream consumer (deadline radar, "still applicable" filters)
computes a true instant from the triple; no reader-timezone drift is
possible because the publisher's convention travels with the row.

## Multi-cutoff calls resolve to the next upcoming deadline

The EU portal adapter (`sources/sedia.ts`) receives `deadlineDate` as a
*list* plus a `deadlineModel` marker (single-stage / two-stage / multiple
cut-off) — collected via `allMeta(m, "deadlineDate")` at `sedia.ts:201-202`.
`normalizeSediaGrant` resolves the operative deadline at `sedia.ts:283-289`:

```ts
// Multi-cutoff calls (two-stage / multiple cut-off) hold several deadlines;
// resolve to the NEXT upcoming cutoff so the call stays live until its last
// one passes, instead of vanishing after cutoff 1 (deadline-radar#2).
const c = sediaCloseParts(nextUpcomingDeadline(allDeadlines(rec.deadlineDate), now));
```

The comment cites the incident that forged the rule (`deadline-radar#2`):
with first-deadline semantics, still-open calls vanished from the corpus
after their first cutoff. `now` is an injectable parameter
(`normalizeSediaGrant(rec, now = new Date())`, line 261-264), keeping the
resolution unit-testable, and the full deadline list survives in
`rawJson`. These rows keep their explicit portal times — they are never
coerced into the federal 23:59 convention.

## Impossible dates are dropped by the consumer's own parser

The national EU-funds export adapter validates dates with the exact
round-trip its consumer uses (`sources/czEuFunds.ts:114-119`):

```ts
// date would masquerade as an always-open RFP in the match shortlist. Validate
// via the same round-trip the deadline radar uses and drop an impossible date
// at the boundary.
return parseCloseDate(iso) ? iso : null;
```

Two technique rules in three lines: the honest null (a garbage date is
stored as `null`, not as a string that date filters cannot see — which in
this corpus would read as "always open" and park the row permanently in
the match shortlist), and the shared-validator rule (the boundary and the
deadline radar call the same `parseCloseDate`, so ingest and consumption
cannot disagree about which rows have deadlines). The shared sanitizer is
also applied on the federal path (`sanitizeCloseDate` from
`sources/normalize.ts`, used at `grantsGov.ts:83`).

## Why this is a faithful realization

Each publisher's dialect is resolved where its convention is known — the
adapter — and the corpus schema carries all three deadline parts so no
convention leaks across sources. The one instructive gap: curated floor
files (`stateGrantsCurated.ts`, `curatedFoundations.ts`) carry date-only
static strings without the explicit time/zone stamp, relying on maintained
refresh instead — acceptable for hand-verified entries, but the technique's
full form would stamp their end-of-day convention too.
