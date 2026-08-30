---
layer: application
type: application
subject: analytics-store-design
technique: capability-flags-and-refusal
stack: rust
status: forged
verified_on: 2026-08-30
verified_against: rust@1.96
---

# Tested refusal on the document-store backend (LightTrack)

LightTrack's `Store` trait fronts SQLite (reference), Postgres, and a
Firestore document-store port; the refusal discipline shows sharpest on the
last, where server-side aggregation genuinely does not exist.

## Refusal per physics, flag, startup announcement, and test

`docs/FIRESTORE.md:34-40` is the technique in four sentences. The trace
listing is "a `GROUP BY trace_id` with aggregate `HAVING` predicates and an
`(ended, trace_id)` keyset — the one rollup that cannot be reconstructed
client-side within a bounded read." So:

- `list_traces` / `list_trace_events` / `list_trace_scores` answer
  `StoreError::Unsupported` → HTTP **501 `unsupported`** — "rather than an
  empty page";
- the capability flag `Store::serves_traces()` returns `false`, so callers
  discover the gap before colliding with it;
- `FirestoreStore::connect` "says so on stderr at startup" — the operator
  reads the trade-off at deploy time;
- and "the conformance suite asserts the refusal, so it cannot decay into
  'you have no traces'" — the technique's highest-leverage clause,
  confirmed verbatim: refusal under test, immune to a refactor that swaps
  in an empty default.

The filter-level granularity lives in the query contract
(`docs/DATA_MODEL.md:46-48`): "Backends that have not ported the extended
predicates answer 501 `unsupported` naming the filter — never an unfiltered
page presented as if the filter had been honored." Repo doctrine states the
stake directly (`CLAUDE.md:62-64`): "a `Store` method that SQLite implements
and another backend silently defaults is how caps and filters become
advisory."

## What the same backend serves instead

Where a bounded client-side reconstruction *is* honest, Firestore implements
rather than refuses: `usage_since` and `cost_summary` run a filtered
`runQuery` and aggregate in the service, disclosed as "O(matched-docs) reads
— fine at the target load" (`docs/FIRESTORE.md:24-32`). Refusal is reserved
for the surface whose client-side version would be unbounded — the
technique's "prefer implementing" boundary, applied per method.

## The documented tension: quiet defaults on the margin surface

`docs/MARGIN.md:53-72` is the honest counter-case the technique's parity
sibling wrestles with. The margin parity matrix shows Postgres inheriting
the trait's *empty* defaults for `tokens_by_dimension` and
`daily_cost_by_dimension`: the trend endpoint returns a real revenue series
beside a **zero cost series**, framed as "a documented handoff, not a bug",
under the trait's "additive default methods" convention. This is the
forbidden fourth state half-redeemed by documentation: the matrix exists and
is truthful, but the disclosure lives in the docs, not the payload — a
reader of the rendered trend chart cannot tell a zero-cost series from a
free month. The standard stays above the repo here: analytical degradation
is tolerable only when announced in-band; the matrix is the map, not the
disclosure. (Upward lesson taken in the other direction: the matrix itself —
per method × per backend, blast-radius-ordered — is the portable artifact.)
