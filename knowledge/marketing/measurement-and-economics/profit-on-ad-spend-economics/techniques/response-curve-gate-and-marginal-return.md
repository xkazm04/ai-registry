---
layer: technique
type: technique
subject: profit-on-ad-spend-economics
technique: response-curve-gate-and-marginal-return
status: forged
laws: [label-convention-as-convention, statistical-honesty-before-a-verdict, efficiency-is-not-profitability]
shared_with: []
use_when: [deciding whether more spend on a channel will still pay, fitting a diminishing-returns curve to daily spend and revenue, a surface labels a projection as curve-based]
---

# Response-curve gate and marginal return

The constant-return model says the next unit of spend earns what the average unit
earned. It is true in a narrow band around today's budget and false beyond it, because
auctions get more expensive as a channel is fed and the cheapest demand is bought
first. The honest shape is diminishing returns. The technique is to fit that shape
only when the data can support it, to read it only where it was measured, and to make
allocation decisions on the marginal return - never the average - once a fit has
earned the right to be used.

## The model

Revenue = a x spend^b with b in (0, 1). Fitted by ordinary least squares on
ln(revenue) = ln(a) + b ln(spend) over daily spend-revenue pairs. b is the elasticity
of revenue to spend: 1 is constant return, below 1 is diminishing. Marginal return on
ad spend is the derivative, a b s^(b-1); marginal profit per unit of spend is marginal
return x margin - 1, positive when the next unit earns more gross profit than it costs.
A log-linear or a saturating S-shaped model serves the same purpose; the power law is
chosen for having one shape parameter and a closed-form derivative, and nothing below
depends on the choice except the parameter names.

Days with zero or non-finite spend or revenue are dropped: a logarithm is undefined
there, and a zero-spend day says nothing about the marginal unit.

## The gate

A fit is used only if it clears every bar; otherwise it is returned unfitted, with
linear parameters (b = 1, a = trailing return) and a flag every caller must honour by
keeping its constant-return behaviour and disclosing "linear". The bars, and their
footing:

- **Minimum spend days: 14.** Convention. Two calendar weeks average out the weekday
  shape the curve does not model. Practitioner guidance for weekly-grain media models
  asks for twelve or more weeks; at daily grain two weeks is the floor below which the
  weekday cycle is the dominant signal.
- **Minimum log-log r-squared: 0.3.** Convention. Below it the spend-revenue cloud has
  no usable shape and a curve would be a confident-looking coin flip.
- **Elasticity in [0.2, 1).** Convention on both ends. A measured slope at or above 1
  shows constant or increasing returns - precisely what the linear model already
  assumes - so it is rejected outright rather than clamped: acting on it would swap
  each row's arithmetic return for the fit's geometric one and label the swap "curve".
  A slope below 0.2 claims spend barely matters, which is almost always a broken series
  rather than a real account, so it is clamped up and the scale term re-solved through
  the centroid of the log-log cloud so the clamped curve still passes through the
  data.
- **Degenerate spend or revenue** (every day identical) is rejected on the ranges,
  not the sums of squares, because the sums are floating-point dust that would divide
  into a confident slope.
- **Non-finite solved parameters** are rejected.

## Reading the curve

A fit is evidence about the band it was measured in. Convention: the curve may be
evaluated up to 1.5x the largest observed daily spend, and is held flat past it so an
allocator cannot buy revenue in a region no data supports. Below the smallest observed
spend the derivative is held at the edge, because a power law read at zero spend
yields an infinite marginal return. Zero spend is zero revenue - a fact, not an
extrapolation.

## Basis disclosure

When a dataset carries per-day channel mix, each channel is fitted on its own daily
spend and revenue: basis "channel". When only the account series exists, one account
curve is fitted and re-based onto each channel's static share; the elasticity is the
account's, not the channel's, and the surface must say "account-scaled". A channel
with no spend share gets an unfitted curve: there is no marginal unit to price.

## Decision rules

- **When at least one channel has a fitted curve, allocate by marginal profit along
  the curves; when none has, keep the constant-return path unchanged**, because the
  constant path is what every existing measurement and pinned expectation describes,
  and it must stay output-for-output identical.
- **When a channel's marginal profit at its current spend is below zero, the next
  unit loses money even if the average unit earns**, and a surface that says
  "profitable, scale it" without the marginal reading has confused the average with
  the margin.
- **When a curve fails its gate, say "linear" on the surface**, because a curve
  label on a linear projection is the more convincing of the two lies.
- **When a projection reaches the extrapolation ceiling, say so**; the allocator
  stopped there because the data did, not because the channel saturated.

## Procedure

1. Collect daily (spend, revenue) pairs per channel; drop non-positive days.
2. Apply the gate in order: count, range degeneracy, slope, r-squared, elasticity
   band, finiteness.
3. On success, return a, b, n, r-squared, observed spend range and basis; on
   failure, return the unfitted linear curve with the same diagnostics so the surface
   can explain why.
4. Read marginal return only inside [spend min, 1.5 x spend max].
5. Hand the marginal profit per unit to the allocation subject; this technique
   supplies the criterion and the reallocation subject supplies the move.

## When not to use

Do not fit on fewer days than the gate demands by widening the window into a period
whose bids, targets or margins differ; the fit averages two regimes into one wrong
shape. Do not fit on monthly buckets for a small account - twelve points is a line,
not a curve. Do not use a curve fitted on platform-reported revenue as a causal claim
about incremental revenue; its input is the platform's attribution of itself, and the
attribution subject owns that caveat. And do not let a fitted curve override a
pacing or forecast that has its own evidence rules; the pacing subject may borrow the
marginal return, but the borrowing is its decision.
