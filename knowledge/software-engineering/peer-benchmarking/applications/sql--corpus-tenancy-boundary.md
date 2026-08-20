---
layer: application
type: application
subject: peer-benchmarking
technique: corpus-tenancy-boundary
stack: sql
status: forged
verified_on: 2026-08-20
---

# Tenancy invariants in the corpus queries

Three query-shaped surfaces in the source repo read across the tenant
boundary, each with a different membership policy, each enforcing it in the
query rather than inheriting it.

## The benchmark corpus: membership as a `where` predicate

`src/lib/db/org-insights.ts:846`:

```ts
where: { orgId: { not: org.id }, isPrivate: false, scans: { some: BENCHMARK_ELIGIBLE } },
orderBy: { updatedAt: "desc" },
take: BENCHMARK_CORPUS_CAP,
```

The comment above it (line 838, "TENANCY") records the incident shape
precisely: without `isPrivate: false`, "another org's PRIVATE repo scores fed
`corpusAvg*`/the percentile that this org reads back" on the portfolio page,
in the digest, and in the exported briefing — "a cross-tenant leak of exactly
the repos a tenant marked as not-for-sharing (aggregated, but still derived
from them, and observable: a small corpus moves measurably when one private
repo enters it)". That last clause is the technique's re-identification
argument: aggregation is not anonymization when the cohort is small.

The same comment states the deliberate asymmetry — the subject's own query
at line 875 has no privacy predicate, because "an org is always entitled to
its own repos" — while the comparability predicate is applied to both sides.
Two filters in one function with opposite symmetry rules, each annotated so
the next maintainer does not "fix" one into the other.

`BENCHMARK_CORPUS_CAP = 5000` (line 807) is the bounded-read rule: the
comment notes the prior query "pulled EVERY other org's repos into memory —
a cross-tenant memory blow-up that grows with the whole corpus, not this
tenant", and frames the result as "a representative recent sample, not the
universe". Recency ordering fills the cap, which is the sampling decision the
technique asks to be made deliberately.

## The public register: per-row enforcement at a single door

`src/lib/register/data.ts` states two load-bearing invariants in its module
comment (lines 4-17). Invariant 1 is the technique's per-row rule, arrived at
the hard way: every query is pinned to the public org *and* `isPrivate:
false`, and "BOTH predicates are re-asserted on the second (id-keyed) fetch
rather than trusted from the first. A private repo's row can exist under the
public org (a legacy persist, or a repo that went private after being
scanned), so 'it came back from a public-org query' is not proof — the
private flag is the proof, and it is checked on every read."

The final gate is `registerEntryFrom` (line 139), which every row from every
query in the module passes through:

```ts
if (r.isPrivate) return null; // never publish a private repo, whatever the query returned
```

Its doc-comment names it "the enforcement point for invariant 1 … so no
future caller can route around it" — the
[one-validation-door](../../_laws.md#one-validation-door) shape applied to a
read path rather than a write path. The candidate window is likewise bounded
(`REGISTER_CANDIDATE_CAP = 500`, line 93) and, notably, the truncation is
disclosed: the `windowed` flag at line 65 tells the surface that the ranking
is "top N", not global.

## The operator rollup: a separate door with caller-side authorization

`src/lib/org/portfolio.ts:1-6` is the fleet-of-fleets view, and its header
draws the technique's boundary between an operator rollup and a peer
comparison: "Every other dashboard is single-tenant by slug; this assembles N
orgs' existing rollups into one table … Authorization (which orgs the viewer
may read) is the CALLER's job (the page filters via `canReadOrg`) so this
stays a pure data fetch that never leaks a tenant it was handed."

`buildPortfolio(orgSlugs)` (line 76) therefore takes an **explicit,
pre-authorized tenant list** — never "all rows the connection can see" — and
composes per-org reads rather than issuing a new cross-tenant query. The peer
path and the operator path stay distinct: one tells a tenant its position,
the other enumerates tenants a named principal may read, and neither is
reachable by passing a different argument to the other.
