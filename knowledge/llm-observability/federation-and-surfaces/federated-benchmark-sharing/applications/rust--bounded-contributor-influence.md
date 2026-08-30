---
layer: application
type: application
subject: federated-benchmark-sharing
technique: bounded-contributor-influence
stack: rust
status: forged
verified_on: 2026-08-30
verified_against: rust@1.96
---

# Rust: winsorized source weights in LightTrack's collective merge

LightTrack's collective-intelligence module merges benchmark digests from
many installations into a public model leaderboard. The influence bound
lives in `crates/core/src/collective/merge.rs`, in pure code so it holds
for every backend.

## The ceiling and its rationale, verbatim

`merge.rs:38-45` declares the constant with its whole argument attached:

```rust
/// **Bounded unilateral influence.** The largest share of a merged row's weight any single source may
/// hold, once the row has ≥2 sources. Flat case-weighting takes `n_cases` at face value, so the row
/// goes to whoever types the biggest number; winsorizing the top source's weight to this share means a
/// contributor can *lead* a row but never *own* it. 0.8 is deliberately generous — a genuinely large
/// contribution still outweighs everyone else combined 4:1, so sample size keeps mattering — and the
/// residual is closed at ingest, where implausible case counts are rejected outright. Every row
/// discloses its realized `max_source_share`.
pub const MAX_SOURCE_WEIGHT_SHARE: f64 = 0.8;
```

Both halves of the technique's doctrine are in that comment: the generous
ceiling that preserves evidence-proportionality, and the explicit statement
that the ingest gate (`crates/api/src/collective/sanitize.rs`) closes the
residual — the two defenses are designed as a pair.

## Exact clamp of the single possible violator

`winsorized_weights` (`merge.rs:335-350`) exploits the arithmetic fact that
only the largest element can breach an 0.8 share: it finds the max, computes
the ceiling as `others * share / (1 - share)`, and clamps just that one
element. A single-source row returns untouched — the comment notes there is
no collective to skew and the hub's `min_contributors` floor decides that
row's fate, exactly the technique's placement rule.

`merge_leaderboard` (`merge.rs:358-406`) then uses the winsorized weights
for *everything* in the row: the pooled means, and — deliberately — the
between-source heterogeneity term, with the comment at `merge.rs:377-379`
("so a whale can no more dominate the row's disagreement than it can its
point estimate"). The raw `n_cases` total is reported uncapped, and the
realized `max_source_share` is published on every `LeaderboardRow`
(`merge.rs:433`).

## The tests state the goals and the non-goals

`one_source_cannot_own_a_row_but_still_leads_it` (`merge.rs:782-809`) feeds
a 1M-case whale against two 100-case sources: flat pooling would hand the
row to the whale; winsorized, `max_source_share` realizes exactly `0.8`,
the merged quality lands at the hand-computed `0.202`, and `n_cases`
truthfully reports `1_000_200`. The companion test
`sample_size_still_matters_and_honest_rows_are_untouched`
(`merge.rs:812-873`) pins the non-goals: 10k cases still beats 10 by a wide
margin, sources within 4× of each other are never touched (share 0.75, no
winsorization), and a contributor pooling its *own* runs in `build_digest`
gets no ceiling at all (`merge.rs:282` — "weight == cases (nothing to
bound)").

Digest-side honesty about the interval machinery rides the same file:
`quality_ci95` (`merge.rs:234-245`) refuses to fabricate an interval when
under half the row's cases carry a known variance (`VARIANCE_COVERAGE_MIN`,
`merge.rs:36`) — the bounded weights feed a CI that would rather be absent
than invented.
