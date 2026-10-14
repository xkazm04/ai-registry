---
layer: application
type: application
subject: attribution-and-incrementality
technique: triangulate-attribution-incrementality-and-mix-model
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Triangulate, do not blend - the portfolio header that summed a fixture into a measured ROAS

The workspace at commit `897b4996` computes no mix model and no holdout, so the
technique's three-instrument form has no seam there. Its refusal rule does: "when a
surface is about to blend instruments into one figure, refuse and show them side by
side". The portfolio overview labels every table row with its data source (live
synced platform rows, or a sample fixture), and then its one-line header summed
revenue and cost over every row and printed a single ROAS. A measured figure and a
fixture figure were folded into a number neither produced; the row labels did not
reach the header.

## The seam, chosen to falsify

The claim under test was "the surface is already honest because each row carries its
source". A caught outcome would have been a header that already filtered or labelled;
it did neither. With one live project (100 revenue, 50 cost) beside two fixtures (900
and 100 each), the old arithmetic printed ROAS 7.6 against the live project's 2.0.

## A and B

- A: the header sums all rows. Mixed portfolio -> 7.6.
- B: a pure helper reads the rows' existing `live` flag. All live -> unchanged. Mixed ->
  live rows only, and the header says "live data from 1 of 3 projects". No live row ->
  unchanged numbers, labelled sample data. Zero cost reads as zero.

Target: a mixed portfolio's header ROAS equals the live rows' own ROAS (A 7.6, B 2.0).
Floor: the all-live header and the demo portfolio model unchanged; the existing
portfolio model suite (byte-identity to the legacy computation, memoization) passes,
`tsc` clean, lint clean, repository pre-push gates green. Shipped to the default
branch.

## What was not measured

Whether operators read the header differently once it names its basis. The currency
rule was not exercised: all rows are CZK there. The choice to drop sample rows from a
mixed total rather than show two figures is a judgement; the table below the header
still lists every project with its own number.
