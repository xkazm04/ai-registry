---
layer: application
type: application
subject: roll-call-vote-analysis
technique: tally-reconciliation
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Tally reconciliation against the chamber's own totals (node)

`features/votetrack/record/reconcile.ts` in the politicas repo is the
technique end to end, born from the incident the technique warns about. Its
header (dated 2026-08-10) records that discipline, lines and rebellion had
all stood on the product's own recount of ~406,000 individual ballots, and
nobody had ever compared that recount to the totals the chamber publishes
for every division — "on a surface whose brand is 'every number can be
checked', this was the one layer that couldn't be."

## One-to-one comparison, estimation refused

The module compares exactly three slots (`ReconcileBucket = "yes" | "no" |
"k"`), in a fixed exported order (`RECONCILE_BUCKETS`) so reports are
deterministic. The source publishes `abstain` and `notVoting` as separate
columns while the modern recorded codes merge them, so the two published
columns are *summed* to the merged bucket's grain — arithmetic, not
estimation. The `away` slot (not logged in / excused) is deliberately not
compared: the source publishes no column for it, and deriving one would
mean estimating how many members "should have been" in the hall — "an
estimate, not a datum", per the header.

## Missing is not zero, enforced at the call site

`ReconcileInput.derived` is `ClubTally | null`, where `null` means "we hold
not a single ballot for this division — no recount exists". The caller in
`derive.ts:502-514` feeds `totals.get(e.pspId) ?? null` and the comment
explains why it must NOT pass `stat.total`: the display-layer stat
zero-fills empty tallies for rendering, and feeding that in would turn
missing ballots into a zero recount — a fabricated wild discrepancy per
division. Ballot-less divisions land in their own summary category
(`withoutBallots`) instead.

## Findings, never repairs

Per division the output is `{ compared, deltas, distance }` — signed
recount−published delta per comparable slot, Σ|delta| as distance, 0 meaning
agreement. The header is explicit that nothing is corrected: a difference is
a **finding** — either the ingest or the source's published data is wrong —
and it is published with its count and worst example, citing the repo's own
precedent for impossible contract dates (`lib/analysis/plausible-date.ts`:
the row keeps its value, the difference is stated, never rewritten). The
corpus summary (`ReconciliationSummary`) counts the funnel explicitly:
divisions examined → recounted → compared → agreed / discrepant, plus
compared-slot totals and the divisions where the source published no
comparable column — so a green result is scoped to what was actually
comparable rather than read as blanket verification.

The module is pure (no store, no server-only import) and fixture-tested in
`reconcile.test.ts`, following the same DB-free convention as the rest of
the derivation stack — the reconciliation rules themselves are unit-testable
without a database.
