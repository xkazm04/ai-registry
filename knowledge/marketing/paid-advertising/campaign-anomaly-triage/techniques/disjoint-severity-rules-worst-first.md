---
layer: technique
type: technique
subject: campaign-anomaly-triage
technique: disjoint-severity-rules-worst-first
status: forged
laws: [one-target-one-threshold, efficiency-is-not-profitability, not-measured-is-not-zero]
shared_with: []
use_when: [writing or reordering the rules that badge a campaign, explaining why a campaign carries the badge it does, adding a margin-aware rule without disturbing margin-blind clients]
---

# Disjoint severity rules, worst-first

A triage badge is the answer to "what is the single worst thing true about this
campaign right now?" That question has a clean answer only when the rules are
written so that no two of them can be true of the same campaign on the same axis,
and are listed from the most damaging state downward. Disjointness makes the
verdict deterministic; the order makes the first matched reason the headline.

## The rule set

Snapshot rules read one period's raw fields - status, cost, conversions,
conversion value - and re-derive the ratios, so they can run on any stored sync.
Worst-first:

1. **Paused but spending.** Status is paused and cost in the period is positive.
   Critical. A campaign that spends while the manager believes it is off is the
   one fact that overrides every efficiency number.
2. **Spending without conversions.** Cost positive, conversions exactly zero.
   Critical. The zero must be an unrounded count; a rounded 0.4 is not zero.
3. **Return far below target.** Cost positive, return positive, return below the
   critical multiple of target. Critical.
4. **Return below target.** Cost positive, return at or above the critical
   multiple and below target. Warning. This band starts exactly where the
   previous one ends, which is what makes them disjoint.
5. **Above target, below break-even.** Fires only when a margin-derived break-even
   is supplied and return is at or above target but below break-even. Warning.
   Its band starts where rule 4 ends. Without a margin it never fires, so a
   margin-blind client's verdicts are unchanged.

The severity of the campaign is the worst matched severity; the headline reason is
the first matched rule; every matched rule is kept as a secondary reason, each
with a one-line detail quoting the campaign's own numbers.

## Procedure

1. Write each rule as a predicate over raw fields plus the resolved target. Rules
   never read a colour, a label or another rule's output.
2. Prove disjointness on each axis by construction: adjacent bands share a
   boundary with one closed and one open end. Write the boundary in both rules so
   a reader can see it.
3. Order the list by damage, not by how often a rule fires. Paused-but-spending is
   rarer than below-target and sits above it.
4. Make each rule's detail line compute from the same fields the predicate read.
   A detail that quotes a different number than the one judged is a bug the
   manager will find first.
5. Give every rule a stable identifier so tests, inbox keys and downstream
   constraints refer to it by name and survive a relabel.
6. Keep change-aware and history-aware rules in separate lists that run only when
   their input is supplied. A caller without a diff or a series gets the snapshot
   verdict, byte-identical.

## Decision rules

- When two rules could both match a campaign on the same axis, one of them is
  wrong; fix the bands, do not rely on order to pick.
- When a rule needs an input a client may lack (a margin, a diff, a daily series),
  make it inert without that input rather than defaulting the input. A defaulted
  margin invents a break-even; an inert rule invents nothing.
- When a campaign has zero cost, no efficiency rule fires: an undefined ratio has
  no verdict. Only the status rule can speak, and it needs spend to speak.
- When a snapshot rule and a change rule both match, the snapshot rule still
  leads the reason list at equal severity; a current state outranks a movement
  toward it.
- When the reason list is rendered, the first reason is the badge and the rest
  are the tooltip. Never summarise reasons into a count on the badge itself.

## What is convention here

The five-rule set is a practitioner's set; another team may add "budget-capped
winner" or "no impressions" as a warning and lose nothing. The critical multiple
that splits rules 3 and 4 is convention (see the reciprocal-thresholds
technique). The ordering of paused-but-spending above spending-without-
conversions is a judgement that an unintended spend is worse than an unproductive
one; defensible, not documented anywhere.

## When not to use this

Do not badge prospecting campaigns - display, video, demand generation - against
the same return target as performance campaigns without saying so. Last-click
attribution under-credits them systematically and they trend red without being
broken. The honest treatment is informational: label the funnel role beside the
badge and keep the threshold unchanged, rather than inventing a per-role
tolerance nobody measured.

Do not use disjoint bands for anomaly detection over a daily series. Anomalies
are scored by deviation, not by band membership, and a day can carry a cost spike
and a revenue drop at once. Bands are for state; deviations are for change.

Do not let the rule set grow by adding an overlapping "catch-all". A rule that
fires on anything not caught above is a rule with no band, and it will absorb
every campaign the moment a genuine rule is tightened.
