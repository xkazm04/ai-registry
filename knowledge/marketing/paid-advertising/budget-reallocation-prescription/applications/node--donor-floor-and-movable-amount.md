---
layer: application
type: application
subject: budget-reallocation-prescription
technique: donor-floor-and-movable-amount
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# The donor floor in a Czech adtech workspace - the arithmetic held, the pairing order did not

At the head of the default branch on 2026-10-14 the floor lives in
`src/lib/campaigns/budget-math.ts` and is honoured end to end: a 10 CZK per day
constant, a `movableAmount` that floors a period amount to
`(dailyBudget - floor) x days` and passes the request through when either input is
unknown, a micros planner that refuses with an at-minimum error and funds the
recipient with exactly what the donor gave up, a whole-koruna branch for the
second network that rounds the donor once and derives the recipient from it, and a
shared-budget refusal on the first network. The apply path rolls the donor back
when the recipient write fails. Every numbered step of the procedure has a line.

## The seam chosen to falsify

Where the technique and the tree agree on the arithmetic, the open question is the
order of operations in the recommender. The recommender pairs the worst donor with
the best free recipient, then floors the amount, then skips the move when nothing
is giveable. It marked the recipient as used before that skip. A donor already at
its floor therefore emitted no move and still consumed the best recipient.

## The paired proof

Two arms over the same four campaigns: a worst donor at the floor, a second donor
with headroom, and two recipients above target.

- A, as it was: the donor with headroom was paired with the second-best recipient.
- B, with the recipient claimed after the skip: it was paired with the best one.

Target: the best recipient reaches the donor that can give, 0 of 1 in A, 1 of 1 in
B. Floor: the 327 campaign unit tests stayed green and the type check and lint
stayed clean; the floor arithmetic and the apply path were not touched. Status:
ab-paired at n=1 on a constructed portfolio.

## What it does not show

The recommender's own forty percent shift leaves a donor at sixty percent of its
budget, so the floor binds only on small daily budgets, a manually enlarged move
or a donor already trimmed by an earlier change-set. How often a live portfolio
has a floored-out donor ahead of a better-fed one was not measured; there is no
production portfolio snapshot in the tree. The fix costs one line and removes the
ordering dependence whatever the rate is.
