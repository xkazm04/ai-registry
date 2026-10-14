---
layer: application
type: application
subject: deadline-pipeline-management
technique: severity-band-triage
stack: node
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Node: one band function, and the comparison that bypassed it

A grant-writing app keeps four bands (critical under 7, warning under 30,
upcoming under 90, far) in a single dependency-free leaf, sorts the radar band,
then days, then fit, drops far from default views, and derives the presentation
helpers (badge tone, due-text colour) from that one function. Day math is
timezone-correct and shared. That is the technique built independently, and the
sort, the single threshold home and the tone derivations all held.

## The seam chosen to falsify

"Every surface bands identically" was tested by grepping for numeric day
comparisons outside the band function. Most were other concerns (a 90-day
ingest horizon, an "ago" label). Two were not: the funder-desk table and
matches list drew a critical dot at `daysOut <= 7`, in the same cell whose text
colour was critical only under 7. A row exactly 7 days out was warning by text
and critical by dot. A third, the email prefix, uses `<= 7` for "action needed"
by design, a reminder-ladder rung, and was left alone and recorded.

## A and B

- **A:** `daysOut <= 7` hand-written at two sites. Disagreement with the band
  at day 7: 1 of 8 probed edge days.
- **B:** `isCriticalDue(daysOut)` derives from `severityForDays`; a new test
  pins agreement with the text-colour helper at -3, 0, 6, 7, 29, 30, 89, 90
  (0 disagreements). Floor: tsc, eslint, 12 files / 83 tests green. Shipped
  grant 7ce7e85 on origin main.

## What it taught the technique

The technique held. Its decision rule on divergent surfaces blames the clock;
here the divergence was neither clock nor threshold but a presentation-layer
comparison that never called the band function, and it was inclusive where the
band is exclusive. Not measured: how often a deadline lands on exactly 7 days
for a desk row.
