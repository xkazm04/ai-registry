---
layer: application
type: application
subject: client-reporting-and-data-provenance
technique: lower-is-better-inverts-verdict-not-number
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Lower-is-better inverts the verdict - and a zero denominator is not a good CPA

The Czech-first adtech workspace (`systedo-case`, commit
`2afda110`, 2026-10-14) already honours the technique's main rule. A metric's good
direction is declared once (`goodDirection` in the metric table, `goodWhenDown` in
the report tile preset), the delta is the arithmetic change, and only the verdict
colour combines sign and direction. Reconciliation with the invoice holds: cost per
lead up 12 % renders +12 %, red. The advice ledger states the same split in its own
words (the reported change is never sign-flipped for an inverse key; only the verdict
inverts), and net-profit change is recomputed from component periods with an absolute
-value base, never narrated from the ratio.

## The seam, chosen to falsify

The technique's decision rule about "spent, no return" was the clause nothing in the
tree could be assumed to satisfy: the tree guards every ratio with a divide that
returns 0 for a zero denominator. Cost per lead is therefore 0 in a month that spent
money and produced no leads. The report tile then rendered "0 Kč", a -100 % delta
against the prior CPL, and the down-is-good colour made that green: the worst state on
the page drawn as the best number on it. The same held for cost share of revenue with
zero revenue. A passing quadrant test (up/down x good-up/good-down) cannot see this,
because the failure is not in the direction table but in a number that was never a
measurement.

## A and B

A: the tile renders the guarded 0 with its delta and tone. B: a pure predicate
`spentNoReturn(spec, snap)` (cost over 0 and the cost-over-return metric's
denominator exactly 0) makes the shared report page, the in-app report and the
markdown export print "Spent, no return" and drop the delta. No spend stays an
ordinary zero, a real result is untouched, spend and visits carry no state. A new test
fails against the old tile logic's reading (tone "positive" for -100 % on CPA) and
passes with the predicate; typecheck, lint, the report unit suite and the repo's
pre-push gate were green, and the change shipped to the default branch.

## What the finding refuted and what it left

The technique held. The tree's direction tables were correct; the miss was the
precondition the technique states in its decision rules rather than its procedure, and
the tree had no test for it. Left unchanged and recorded: the tile preset and the
overview metric table both mark cost (spend) as down-is-good, which the technique's
"do not apply a direction to a metric that has none" would colour-free; the report
header says the two surfaces mirror each other, so changing one is a product decision
for both. A reallocation table also colours a planned spend change green or red as a
recommendation signal.

## Falsifiers

A tile spec that gains a cost-over-return metric other than CPA or PNO without being
added to the predicate would reintroduce the state. A report type with a legitimate
zero-conversion spend (brand-awareness) would read "Spent, no return" and may want a
neutral wording.
