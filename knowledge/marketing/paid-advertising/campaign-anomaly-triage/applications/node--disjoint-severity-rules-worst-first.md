---
layer: application
type: application
subject: campaign-anomaly-triage
technique: disjoint-severity-rules-worst-first
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Disjoint severity rules, worst-first - the zero-conversion rule shared an axis with the return rules

Verified against the systedo-case workspace at commit `a8e2c77c` (2026-10-14), Node 24.x.
The snapshot rules are an ordered list in `src/lib/campaigns/triage.ts`: paused but
spending, no conversions, return far below target, below target, above target but below
break-even. Each has a stable id, a predicate over raw fields, and a detail line quoting
the same fields. Ratios are re-derived from cost and conversion value, the band edges
share one boundary expression, the break-even rule is inert without a margin, and the
change-aware and history-aware rules sit in separate lists. The tree matched the
technique closely.

## The seam that did not hold

The technique says no two rules can be true of one campaign on the same axis. The
zero-conversion rule and the three return rules are two different questions about one
fact (did spend produce anything), and nothing kept a row with value but zero
conversions out of both. A 126-cell grid over status, cost, conversions (0, 0.4, 3) and
value found 16 cells carrying two return-axis reasons: 14 as no-conversions plus
far-below-target, 2 as no-conversions plus below-target, a critical and a warning line
that disagree about the same row. With a margin supplied, an above-target row also
gained a "meets target, below break-even" line next to "no conversions".

The arm made the three return rules require conversions above zero. Target: return-axis
double matches A 16, B 0. Floor: severity and headline reason identical on 252 cells
(two goal configurations), rows with conversions untouched, the existing triage tests
green. Severity never moved because the zero-conversion rule is critical and listed
first; what changed is that the tooltip no longer contradicts itself. A fractional count
such as 0.4 still reaches the return rules, as the technique requires.

Not measured: how often a real sync reports value against zero conversions; the sample
generator derives value from conversions, so it never does.

Return condition: a production sync containing such a row, to count the affected rows.
