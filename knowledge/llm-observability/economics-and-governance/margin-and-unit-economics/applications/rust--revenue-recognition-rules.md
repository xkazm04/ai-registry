---
layer: application
type: application
subject: margin-and-unit-economics
technique: revenue-recognition-rules
stack: rust
status: forged
verified_on: 2026-08-30
verified_against: rust@1.96
---

# Rust: one recognition function serving rollup and trend (LightTrack)

LightTrack's margin surface is a Rust workspace where the entire subject lives
in three pure, I/O-free modules under `crates/core/src/` — `margin.rs`,
`margin_trend.rs`, `margin_sim.rs` — with the HTTP layer (`crates/api/src/revenue.rs`)
doing only parameter parsing, store queries, and disclosure. This file shows
how the recognition rules land in real code.

## The single recognition function

`crates/core/src/margin.rs:125-154` is `recognized_amount(r, since, until)`,
the only place recognition math exists:

- **Refund sign-flip via `abs()`** (lines 130-134): `-r.amount_usd.abs()` for
  refunds, `r.amount_usd.abs()` otherwise — so an upstream that already stored
  a refund as negative cannot double-flip it back to income.
- **Periodic amortization over period ∩ window** (lines 135-145): only when
  `pe > ps` (a degenerate period falls through to point-in-time), with
  `signed * overlap_seconds / total_seconds` over the clamped overlap.
- **Point-in-time at `ts`** with the half-open test `r.ts >= since && r.ts < until`
  (lines 146-152), so adjacent windows tile.

`compute_margin` (`margin.rs:68-111`) folds this per event into a per-key map,
joins against `CostByDimension` (untagged cost keyed to the `UNATTRIBUTED`
constant, line 17), takes the key-set **union** so cost-only customers still
get rows, and computes `margin_pct: (revenue_usd > 0.0).then(|| gross / revenue_usd)`
(line 104) — `None` on zero revenue, never a sentinel.

## Reuse by the daily trend — the doc-comment states the doctrine

`crates/core/src/margin_trend.rs:59-94` builds the per-day series by calling
the *same* `recognized_amount` over each one-day sub-window (line 86), and its
module doc (lines 1-8) says why: "no duplicated recognition math … a daily
point is just this over a one-day window." The function is `pub(crate)` — 
visible to the trend module, sealed against the API crate reimplementing it.
Totals are computed before the top-N cap (`margin_trend.rs:116-117`) and the
response carries `key_count` + `top_n` so a capped view discloses itself.

## The worked business cases as tests

`margin.rs:197-320` encodes the subject's canonical scenarios as unit tests,
each one a recognition rule made concrete: `paying_but_unprofitable_is_surfaced_first`
(ascending sort puts the money-loser first), `free_tier_is_negative_with_no_margin_pct`
(cost, no revenue → `margin_pct.is_none()`), `refund_reduces_recognized_revenue`
($20 charge − $5 refund → $15), `subscription_amortizes_across_window` ($30
over 30 days, 10 days in window → $10), `untagged_cost_lands_in_unattributed`,
and `out_of_window_revenue_is_excluded`. Reading these six tests is reading
the recognition contract.

## Currency disclosure at the API layer

`crates/api/src/revenue.rs:65-99`: the response struct carries
`unconverted_currencies` + `currency_note`, both serde-skipped when empty —
currencies stored at a 1:1 fallback (no FX rate) are enumerated in the payload
so the USD totals announce their own approximation. The FX table is a shared
static snapshot (`lighttrack_billing::shared_fx()`), matching the
no-retroactive-restatement law: rates cannot drift between two pulls of the
same report.

## Upward lesson taken from this repo

The draft standard said "one recognition rule reused everywhere"; the repo
sharpened *how*: make the function `pub(crate)` and have the trend consume it
per-day, then let the module doc-comments state the invariant at the point of
reuse. The `abs()`-before-negate refund guard was also an upward lesson — the
naive `-amount` trusts upstream sign conventions it cannot see.
