---
layer: technique
type: technique
subject: campaign-anomaly-triage
technique: severity-times-spend-attention-order
status: forged
laws: [one-target-one-threshold, a-gate-before-money-and-copy]
shared_with: []
use_when: [sorting a campaign table for a manager's first hour, ranking which flagged item an alert should spell out first, choosing the order in which generated evaluations are spent]
---

# Severity times spend: the attention order

Triage produces a set of verdicts; the manager needs a sequence. The sequence
that respects both the damage of a state and the money at stake is
lexicographic: severity first, then spend within severity. A critical campaign on
a small budget still outranks every warning, and among criticals the one
spending the most is opened first, because the cost of being slow scales with
spend.

## The weight

Sort weight = severity rank x a constant larger than any plausible spend + cost
in the period. With ranks critical 2, warning 1, healthy 0 and a constant of one
million million in minor currency units, no campaign's spend can lift it across a
severity boundary, and within a boundary the sort is by cost descending. The
weight is a pure function of the triage result and the row, so the table header,
the alert body and the "which campaign to evaluate next" queue all use it.

When the change-aware and history-aware rules are supplied, they count in the
severity - a crater ranks with the criticals it is. When they are not supplied,
the weight degrades to the snapshot severity and remains a valid order.

## Where the order is spent

- **The campaign table**, sorted by the weight by default, with the severity
  badge and the headline reason in the first columns.
- **The banner**, which counts criticals and warnings and says "N need
  attention"; the count is the sum, never a weighted score.
- **The alert body**, which spells out at most a handful of items ranked by the
  weight (for state alerts) or by absolute deviation (for day anomalies), and
  says how many more there were.
- **The evaluation queue.** Where a generated evaluation costs money or time per
  campaign, the order is the order in which those evaluations are worth buying;
  and a critical finding caps whatever score the evaluation produces, so a model
  cannot call a burner healthy.
- **The health timeline.** Snapshot severities per stored sync, counted over time,
  answer "are we trending healthier" for free on every sync rather than only
  when someone pays for an evaluation.

## Decision rules

- When two campaigns share a severity, the one with more spend comes first; when
  they share spend, order is stable on identifier, never on name, so a rename
  does not reorder.
- When a rule fires with a money figure in its detail, the figure is the
  campaign's own spend or the priced anomaly; never a projected loss - projection
  is the reallocation subject's.
- When the alert has more items than it can spell out, the omitted ones are
  counted, not dropped silently.
- When spend is in more than one currency, sort within currency and label the
  scope; never sort a mixed-currency list by raw numbers.
- When a sort or a badge would need a target to render, and no target exists for
  the scope, there is no colour and no order by severity - only spend. A verdict
  without a target is decoration.

## What is convention here

Ordering by spend within severity is practitioner convention, and a defensible
alternative is ordering by priced damage (adverse revenue shortfall plus
overspend) where the anomaly detector has produced one. Spend is preferred as the
default because it is always present, never modelled, and a manager can verify
it in one glance; priced damage depends on an expected value the manager did
not see computed. Ranking spelled-out day anomalies by absolute deviation rather
than by money is likewise convention, and a team whose managers think in
currency first may swap it.

## When not to use this

Do not use the attention order as a reallocation order. Which campaign to open
first and which campaign should give up budget first are different questions;
donor ranking weighs waste against the target and, with a margin, profit
destroyed, and belongs to the reallocation subject.

Do not let the order drive an automatic action. The first row is where the
manager looks, not what the system changes; nothing touches spend without
simulate, guardrail, approval and a reversible ledger.

Do not rank healthy campaigns by spend as if it meant anything. Below the
warning boundary the order is informational, and a large healthy campaign at the
top of the healthy section is not a finding.
