---
layer: application
type: application
subject: search-term-mining
technique: spend-and-click-floors-before-negation
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# A fixed ten clicks reads the same at every conversion rate

The marketing workspace at `systedo-case` (commit `7d119216`, 2026-10-22, branch
`cur/click-floor-from-rate`; `package.json` engines field `24.x` is the witness for
`node@24`) held both floors as constants, and said so only for one of them.

## What the tree already had

- **Both floors as absolute constants.** `src/lib/campaigns/term-moves.ts:40` "export const TERM_MIN_SPEND_CZK = 500" and the click floor beside it, read on the
  campaign total of a query rather than on one row, so the evidence is the sum.
- **The invariant ahead of the floors.** A promote is tested first, and the negative
  gate reads `conversions === 0` on an unrounded count, so no floor can negate a
  converting query.
- **One predicate for the recommender and the panel.** The panel lists call the same
  `isWastedTerm`, so the operator sees the rows the proposal will carry.

## The defect

The click floor was ten, for every account. At a 2% conversion rate ten clicks without a
conversion happens about four times in five, so a query with forty clicks and 900 of
spend was proposed as a permanent campaign negative on a window that said nothing
about it. The constant was documented as a threshold, not as a convention.

## The change

The click floor is now `max(10, ceil(ln(0.05) / ln(1 - r)))` where `r` is the window's
own conversions over clicks: `src/lib/campaigns/term-moves.ts:88` "Math.ceil(Math.log(TERM_CLICK_TOLERANCE)". It only ever raises the constant: a high-converting window, a window with no
conversions and a window with more than one conversion per click all keep ten. An
explicit `minClicks` option still wins. The panel's wasted list and its footnote read
the same derived number, so the proposal and the console still agree.

## Measured

Paired, one variable, through the real recommender. Fixture: 40 clicks, 900 spend, no
conversion, beside a converting row that puts the window at 2%. Target: negatives
emitted. A (the old constant) 1 of 1, B 0 of 1; at 150 clicks B emits it. Floor: the
derivation matches the technique's own figures (2% gives 149, 10% gives 29, 1% gives
299), the converting-query invariant loop is unchanged, and the term-move suites pass
35 of 35 with `tsc` and eslint green.

The seam was chosen to falsify the technique's claim that a fixed count is wrong for
every rate but one. It held, and it returned a boundary the technique does not state:
with few conversions in the window the derived floor approaches the window's **total**
clicks (about `3 / r` where `r` is conversions over clicks, so three conversions in the
account put the floor at roughly every click taken). Seven existing fixtures went red
for that reason, all of them accounts with three or four conversions in total, and had
to be given a converting row to describe an account that has a rate. A thin window
negates nothing, which is the technique's intent, and is also how a new account looks.

## What this cannot tell you

The spend floor was not moved: the tree carries no target cost per acquisition, so the
half stated in multiples of it has nothing to multiply. The lag allowance is not built
either, because stored rows carry period totals and no per-day clicks. Neither the share
of live proposals the new floor would suppress nor the right tolerance was measured;
one-in-twenty is the technique's convention, not a finding.
