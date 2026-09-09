---
layer: technique
type: technique
subject: profit-on-ad-spend-economics
technique: efficiency-is-not-profitability
status: forged
laws: [efficiency-is-not-profitability, never-invent-proof, label-convention-as-convention]
shared_with: []
use_when: [a report or generated summary uses the word profitable, a surface has ratios but no margin, briefing a model to comment on ad performance]
---

# Efficiency is not profitability

Return on ad spend and its inverse, the cost share of revenue, measure spend against
revenue. They say how efficiently the budget was turned into turnover. They do not say
whether the business made money, because the cost of the goods, the fulfilment and the
overhead never enter the ratio. A surface, a report or a generated summary that has
only these ratios may speak of efficiency; the moment it speaks of profit it has
invented a margin.

## The doctrine, as a rule for every writer of a surface

**When no margin has been supplied, speak of efficiency and refuse to judge
profitability; when a margin has been supplied, judge profitability by net profit and
demote the ratio to a supporting number, because the ratio was never a profit metric
and treating it as one is the domain's most reproduced error.**

Corollaries the doctrine forces:

- Break-even is 1 / margin, never an agreed number.
- A channel is profitable when its net profit is non-negative, never when its ratio
  clears a target.
- Reallocation ranks donors by profit destroyed - cost x (1 - return x margin) - and
  not by revenue missed against a target; the reallocation subject owns the move, but
  its criterion is fixed here.
- A zero-cost channel is never a false loss (its ratio is a guard's fallback, not a
  measurement).
- A high-ratio, low-margin channel is never a false win (a 4x return at fifteen
  percent margin loses forty cents per unit spent).

## The two vocabularies on one surface

A practitioner keeps both because both are wanted. The agreed efficiency target is how
an account is run day to day: bids, budgets, the pace of a campaign, the badge on a
row. It is a convention, chosen by the business, and a surface labels its scope (paid
portfolio versus blended) so that a looser blended number is not read as a
contradiction. The margin-derived break-even is how the account is judged. A row can
be on plan by the target and unprofitable by its margin, or off plan and earning; a
surface shows both states with both labels, and a summary that reduces them to one
word has chosen which lie to tell.

## Generated commentary

A model asked to summarise performance will reach for "profitable" because the word
is in every training example. The instruction that it must not confuse efficiency
with profitability is necessary and not sufficient; the structural enforcement is
that the model receives the profit verdict pre-computed when a margin exists and
receives no profit field when one does not, so it cannot compute one. Two further
rules travel with it: no external benchmarks or "industry standard" thresholds that
are not in the supplied numbers - every threshold in a recommendation is derived from
the data handed over, and the derivation is stated, or the threshold is omitted; and
every number cited is one the surface passed in. A summary that says "a 3x return is
healthy" has imported a margin from nowhere.

## Decision rules

- **When a client asks "are the ads profitable" and the surface has no margin**,
  answer with the efficiency figures and the one question that would let you answer:
  the gross margin. Never estimate it to be helpful.
- **When a channel clears the target with a negative net profit**, the headline is the
  loss, and the target is the footnote.
- **When two channels have the same return and different margins**, they are
  different businesses; rank them by profit and show why.
- **When a surface offers a "good / bad" colour on a ratio**, the colour reads the
  agreed target and says "against target", not "profitable".
- **When a generated recommendation proposes a threshold**, it says which of the
  supplied numbers it was derived from and how.

## Procedure

1. Audit every surface and prompt for the words profit, profitable, margin,
   break-even. Each occurrence either reads a supplied margin or is rewritten in
   efficiency language.
2. Where a margin exists, route every profit statement through the shared net-profit
   row so the verdict is derived once.
3. Where it does not, hide the profit fields rather than render them at a fallback
   margin.
4. In prompts, hand the model the computed verdicts and forbid benchmarks; check the
   output for numbers not in the input.

## When not to use

The doctrine does not say ratios are useless. Inside an account, at the grain of
campaigns and ad groups, margin is usually uniform and the ratio ranks correctly;
optimising bids by target return is right, and the profit lens adds nothing until the
margin varies across what is being compared. It also does not license paralysis: a
business that cannot supply a margin is still run on efficiency, and the surface says
so plainly rather than refusing to report. The doctrine forbids one thing - calling an
efficiency number a profit - and permits everything else.
