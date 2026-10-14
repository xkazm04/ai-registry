---
layer: application
type: application
subject: retrieval
technique: ranking-budgets
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# Overfetch sized by evidence: widen the arm that saturated (icm)

Source tree: `github:rtk-ai/icm@5f402434` (2026-10-13), a single-binary memory store for
coding agents, read at release 0.11.4. The stack version is the floor its crates declare
(`edition = "2024"`, Rust 1.85). Nothing was executed here; the tree's own benchmark files
were read.

## The engine it replaced

The first recall engine scored a fixed pool and filtered afterwards:
`docs/architecture.md:437 "It scores at most 40 candidates per query, applies filters after that cut"`.
Its changelog records what that cost, twice, from two surfaces
(`crates/icm-cli/CHANGELOG.md:81 "CLI recall starves under a topic/project/keyword filter"`,
`crates/icm-cli/CHANGELOG.md:150 "fix MCP filter-after-limit"`), and its benchmark adapter
refused to share one store across test units because the engine
`bench/amb/README.md:120 "applies the topic filter after the candidate pool is cut, so other units'"`
memories would displace a unit's own. That is the technique's overfetch rule from the losing
side: a pool that does not pre-fund the attrition its filters cause.

## The engine it built

The second engine puts the caller's filter on the candidates, before the cut
(`crates/icm-store/src/store/ranked.rs:11 "runs on the candidates, so a topic/project/keyword filter"`,
`crates/icm-store/src/store/ranked.rs:12 "cannot empty a result set that was cut before it ran."`),
and sizes the overfetch twice. A default depth of four times the requested count, floored
(`crates/icm-store/src/recall.rs:39 "const MIN_DEPTH: usize = 100;"`,
`crates/icm-store/src/recall.rs:136 "_ => limit.saturating_mul(4).clamp(MIN_DEPTH, MAX_DEPTH),"`),
and then a second sizing driven by evidence rather than taste. Each arm reports whether it
was saturated
(`crates/icm-store/src/store/ranked.rs:35 "The arm returned as many rows as it was asked for: more may exist"`),
and when too few candidates survive the filter and an arm was saturated, the engine fetches
that arm again, deeper
(`crates/icm-store/src/store/ranked.rs:86 "A filter can discard most of a saturated arm. Fetch deeper rather"`;
`crates/icm-store/src/store/ranked.rs:26 "const WIDEN_FACTOR: usize = 4;"`,
`crates/icm-store/src/store/ranked.rs:28 "const MAX_WIDENINGS: usize = 3;"`).

The technique says the overfetch factor is an eval question, measured by how often the final
slice would have changed had the factor been larger. This tree answers it per query instead:
a filter's selectivity varies by orders of magnitude between callers (one project's topic in
a shared store against no filter at all), so no single factor is right for every caller, and
the signal that a larger factor would have changed the slice is available at query time. The
arm came back full and the filter left too little. That is a boundary the technique does not
yet state, and the tree is the realization of it.

## What its own measurement can and cannot say

The tree publishes a retrieval-only comparison of the two engines without an embedder:
`bench/amb/results/locomo10-retrieval-keyword-only-legacy-vs-v2.md:10 "| Gold sessions any@5 | 12.0% | 88.6% | +76.6 pts |"`.
The same file's settings row shows the two sides differed in more than the pool:
`bench/amb/results/locomo10-retrieval-keyword-only-legacy-vs-v2.md:6 "| Settings | engine legacy, no date sent, k=50, chunks 512 |"`
against the new engine with the document and question dates sent. Engine, pool, filter order,
fusion and the time vote all changed at once, so the 76 points cannot be credited to the
overfetch rule. The tree's benchmark page is careful elsewhere; this row is the one to read
as a release delta, not as the measurement of a mechanism.

## Return condition

`unmeasurable` for the widening alone until one variable moves: the new engine with
widening disabled against the same engine with it on, over the same shared-store split, no
dates sent to either.
