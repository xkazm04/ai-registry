---
layer: technique
type: technique
subject: goal-pacing-and-forecast
technique: implied-extra-spend-capped
status: forged
laws: [a-gate-before-money-and-copy, efficiency-is-not-profitability, label-convention-as-convention]
shared_with: []
use_when: [pricing a revenue-pace shortfall in extra daily spend, choosing between trailing-average and marginal return as the basis, bounding a spend prescription so it cannot invent a number]
---

# Implied extra spend, capped

A shortfall in required versus recent daily revenue becomes a steering number: the
extra ad spend per day it would take to close it. Which return prices that spend, and
what happens when no affordable spend closes the gap, is what separates an honest
steering number from a fabricated one.

## Procedure

1. **Shortfall per day** = max(0, required daily minus recent daily). Zero when on pace,
   and then nothing further is computed or shown.
2. **Choose the basis.**
   - *Trailing average.* Divide the shortfall by the return on spend over a trailing
     window (twenty-eight days in the workspace, matching its anomaly baseline; a
     convention). Assumes the next unit of spend performs like the last four weeks
     did. The optimistic answer for an account near its ceiling.
   - *Marginal, along a fitted response curve.* Solve for the extra daily spend at
     which the curve's revenue at (today's spend plus extra) minus revenue at today's
     spend meets the shortfall. Bisection on a monotone curve converges in a few dozen
     steps. The next unit is priced at its marginal return, so a saturated account is
     told that the gap costs far more than the average suggests. Use the curve
     whenever one is fitted and today's daily spend is positive; the curve's fitting
     gate belongs to the profit-economics lane and is not restated here.
3. **Cap the answer.** Bound the search at a multiple of today's daily spend - three
   times is the workspace convention - for two reasons stated together: a curve fitted
   on today's spend band says nothing about tripling the account (honesty), and a
   bisection needs a ceiling (termination). When even the cap cannot close the gap,
   return the cap and label it "at least this much", never a number the curve was
   extrapolated to produce.
4. **Guard the unknowns.** No spend in the window, or a return that is zero or
   undefined, yields zero implied spend with the basis marked unknown - the surface
   then hides the spend line rather than printing "+0 / day", which would read as
   "nothing needed".
5. **Say which basis produced the number.** "At the current return that is about +X
   per day" and "along the account's response curve that is about +X per day" are
   different promises, and the hover, the footnote and the assistive text all state
   the same one. A number whose basis was stated in one place and contradicted in
   another is an incident waiting to happen; the workspace had exactly that and fixed
   it by deriving every label from one basis field.

## Decision rules

- When a curve is fitted, use it, because the trailing average is the marginal return
  only for an account that is nowhere near saturation, and the account that is behind
  goal is often the one that already spent up to its ceiling.
- When the curve answer hits the cap, the card shows the cap with "at least" and does
  not show a probability of success for the extra spend, because the curve has no
  information above the band it was fitted on.
- When the trailing-average and curve answers differ by more than a factor of two,
  that difference is itself a finding (the account is saturated) and belongs in the
  narrative, not just in the smaller number.
- When a margin is known, price the shortfall in profit terms as well: extra spend that
  closes a revenue gap at a marginal return below break-even is buying a hit goal with
  a loss, and the card says so
  ([efficiency is not profitability](../../../_laws.md#efficiency-is-not-profitability)).
- When the implied spend is shown, it is a steering number and nothing else. It does
  not edit a budget. Any change to spend goes through simulate, guardrail, approval
  and a reversible ledger in the reallocation lane
  ([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).

## Convention, measured, documented

The twenty-eight-day trailing window and the three-times cap are conventions and are
labelled as such where they appear
([label convention as convention](../../../_laws.md#label-convention-as-convention)).
That marginal return falls below average return on a concave response curve is
arithmetic. That platform-reported return is the platform's own attribution of itself is
documented behaviour, and the implied spend inherits that caveat: it prices the gap in
platform-credited revenue, not in incremental revenue.

## When NOT to use this

- When on pace or the goal is banked: nothing is implied and nothing is shown.
- When the return in the window is unknown - a zero-spend series, an organic-only
  business - the number is absent, not zero, and the card says the basis is unknown.
- When the goal is an efficiency ratio rather than revenue: the prescription is a
  ceiling on cost, not an extra spend, and this technique does not apply.
- As a reallocation between campaigns. This is an account-level "how much more"; which
  campaign should receive it is the reallocation lane's question, and a budget-capped
  winner is detected in the anomaly-triage lane.
- On sample data, where an implied spend is an invitation to spend real money against
  a fictional gap.
