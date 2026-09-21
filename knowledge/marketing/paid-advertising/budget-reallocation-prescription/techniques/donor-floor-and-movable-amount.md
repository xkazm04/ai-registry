---
layer: technique
type: technique
subject: budget-reallocation-prescription
technique: donor-floor-and-movable-amount
status: forged
laws: [a-gate-before-money-and-copy, not-measured-is-not-zero]
shared_with: []
use_when: [converting a recommended period amount into a daily budget change, deciding how much a donor can actually give, making a projection reconcile with what the account will apply]
---

# The donor floor and the movable amount

A recommendation says "move 3 600 over the period". The account has no such
control. It has a daily budget on the donor and a daily budget on the recipient,
and the shift is a daily delta applied to both. Between the sentence and the
account sit three facts the projection must respect: the amount is a period total
and the account works in days; the donor keeps a small daily budget so it keeps
serving; and the recipient gains exactly what the donor gave up, never a rounded
cousin of it.

## The floor

The donor is never dropped below a small daily budget. Convention places it at the
smallest amount that keeps the campaign eligible to serve - single-digit units of a
national currency per day is typical - and the value is labelled as convention. The
reason is not the money. A campaign at zero budget stops serving, and a campaign
that stops serving loses its auction history, its quality signals and its learning;
a campaign at a token budget keeps all three alive so that a revert restores a live
campaign rather than a cold one. The floor is also the reason a "shift" can never
silently become a pause: a pause is a decision a person makes, not a side effect of
arithmetic.

## The movable amount

Over a period of `days`, the most a donor can give is

    giveable = max(0, (dailyBudget - floor) x days)

and the amount a move carries is the smaller of what was requested and what is
giveable. Two rules follow.

The projection is built on the floored amount, not the requested one. A value gain
computed on the full request over-promises by exactly the part the floor refuses,
and the approval screen then shows a lift the apply cannot deliver. Applied should
equal simulated, modulo the rounding the daily conversion introduces.

When the donor's daily budget or the period length is unknown, no floor is applied
and the requested amount stands. An unknown budget is not a zero budget; flooring
against zero would refuse every move on an older record that never carried the
field. Absent is absent.

## Procedure

1. **Round** the requested shift to a tidy increment in the account's currency so
   the recommendation reads cleanly; the increment is a convention.
2. **Floor** it to the giveable amount when the daily budget and period are known;
   never above the donor's own period spend either way.
3. **Skip** the move when the floored amount is zero or less - the donor is already
   at its floor and there is nothing to move - rather than emitting a zero move that
   an apply would refuse anyway.
4. **Convert** to a daily delta at apply time by dividing the period amount by the
   period days, in the account's smallest unit, rounded once.
5. **Plan** the donor's new budget as the maximum of the floor and the old budget
   minus the delta; the moved amount is the old budget minus the new; the
   recipient's new budget is its old plus exactly that moved amount. If the moved
   amount is zero or less, refuse with "already at minimum" instead of writing two
   no-op updates to a live account.
6. **Net to zero.** Where the account keeps whole-unit budgets, round the donor
   side once and fund the recipient with what the rounded donor actually gave up.
   Rounding both sides independently can move a unit that never left the donor.

## Decision rules

- When the floored amount differs from the requested one, show the floored one and
  say why, because a reader who approved 3 600 and sees 2 100 applied has been lied
  to by the screen, not by the account.
- When the two campaigns share one budget object, refuse the shift, because a
  donor-to-recipient move on a shared budget is two writes to the same object that
  net to nothing.
- When the daily delta rounds to zero, refuse before touching the account, because
  a shift too small to change a budget is not a shift.
- When the recommender's own shift fraction keeps the donor well above the floor -
  a shift of forty percent leaves sixty - the floor never binds on an
  auto-recommendation and only a manually enlarged move sees it; that is a property
  to state, not to rely on silently.

## Apply order and rollback

Two live writes with no transaction between them: lower the donor first, then raise
the recipient. If the recipient write fails, the donor has already been throttled;
restore it to its captured prior value immediately and record the failed attempt,
so a real campaign is never left starved by a half-applied move and the shift is
never a zero-trace event. The prior values captured for that rollback are the same
snapshots the revert uses later.

## When NOT to use

- When the recipient is not budget-capped: the movable amount is about what the
  donor can give, not what the recipient can spend, and a recipient constrained by
  its auction will leave the extra budget unspent. Ask the pacing read first.
- On networks or account types where budgets are not daily: the floor and the
  conversion assume a daily cap, and a lifetime or monthly budget needs its own
  arithmetic.
- As a substitute for the pause: a donor floored to its minimum is still serving at
  its minimum. If the intent is to stop it, pause it.
