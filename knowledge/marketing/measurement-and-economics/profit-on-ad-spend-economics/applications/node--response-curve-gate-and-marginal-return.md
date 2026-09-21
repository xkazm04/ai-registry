---
layer: application
type: application
subject: profit-on-ad-spend-economics
technique: response-curve-gate-and-marginal-return
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The response-curve gate in a log-log fitter and its curve-path allocator

The Czech-market adtech workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea`
(2026-09-08) fits `revenue = a · spend^b` in `src/lib/metrics/response-curve.ts` and
consumes the fit in the curve path of `src/lib/profit/compute.ts:253-352`. Both are
pure `node` modules; the fitter's header (`response-curve.ts:9-13`) promises
"deterministic, and NaN/∞-safe" and that a failed fit is returned "with `fitted: false`
and the LINEAR parameters ... callers must treat an unfitted curve as 'no curve'".

## The gate, constant by constant

Every bar the technique names is a named export with its footing in the doc comment:

| Bar | Constant | Value | Footing stated in the tree |
| --- | --- | --- | --- |
| Minimum spend days | `CURVE_MIN_POINTS` | 14 | `:41-43` "two calendar weeks - enough to average out the weekday shape the curve does not model" |
| Minimum log-log r² | `CURVE_MIN_R2` | 0.3 | `:45-47` "below it ... a curve would be a confident-looking coin flip" |
| Elasticity band | `CURVE_B_RANGE` | [0.2, 1] | `:49-54` slope ≥ 1 rejected outright, < 0.2 clamped up |
| Extrapolation ceiling | `CURVE_EXTRAPOLATION` | 1.5 | `:56-59` "a fit is evidence about the band it was measured in" |

All four are conventions, and the tree presents them as such - each comment argues
the number rather than citing a source. The only bar with a footing beyond convention
is the 14-day floor's reason (a weekday cycle is seven days, so two of them is the
minimum that averages it), which is a structural argument rather than a measurement.

## Order of the gate in `fitResponseCurve` (`:98-181`)

1. `:102-108` drops non-positive or non-finite days ("a zero-spend day carries no
   information about the marginal koruna").
2. `:127` rejects `n < CURVE_MIN_POINTS`.
3. `:131-133` rejects degenerate spend or revenue on the RANGES, with the reason the
   technique repeats: the sums of squares "are pure floating-point dust (~1e-30) that
   would otherwise divide into a confident-looking slope and r²".
4. `:155` rejects `sxx` not positive; `:160-163` computes r² with the flat-revenue
   case reading 0 "rather than the 1 the ratio would otherwise imply", and rejects
   below the floor.
5. `:165-171` rejects slope ≥ 1 with the incident recorded: acting on it "would swap
   each row's arithmetic ROAS for this fit's geometric one (on the demo dataset:
   6.56× → 5.92×, a 10 % move) and then label the swap 'curve' in the UI".
6. `:173-175` clamps a low slope up and re-solves `a` through the centroid.

`revenueAt` (`:197-203`) holds the prediction flat past `1.5 × spendMax` and returns
zero for zero spend "(a fact, not an extrapolation)"; `slopeSpend` (`:187-192`) clamps
the derivative's argument to `[spendMin, 1.5 × spendMax]` because "extrapolating a
power law to zero spend produces an infinite marginal return". `marginalRoas`
(`:208-213`) is `a·b·s^(b−1)`; `marginalPoas` (`:217-221`) is `marginalRoas × margin − 1`
and returns −1 on a non-finite result, so a broken input can never look like a
positive marginal profit.

## Basis disclosure

`channelCurves` (`:238-282`) fits per channel when a daily mix exists (`basis:
"channel"`) and otherwise re-bases one account curve onto static shares (`basis:
"account-scaled"`, `:229-233`: "the elasticity is the account's, not the channel's, and
the UI must qualify it as such"); a channel with no spend share gets an unfitted curve
(`:267-270`). The allocator at `compute.ts:376-385` copies `fitted`, `b`, `r2` and
`basis` onto each output row so a surface can print the disclosure.

## The structural fact: the linear path is untouched

`compute.ts:107-111` switches to `reallocateOnCurves` only when at least one channel's
curve is `fitted`; the doc comment at `:97-100` says the two paths "are deliberately
kept separate rather than 'unified'" because the constant-ROAS path "must stay
output-for-output identical". Inside the curve path, `:296` bounds a fitted channel by
`max(cap, spendMax × CURVE_EXTRAPOLATION)` and an unfitted one by the 3× cap, and the
hill-climb at `:305-327` steps in `totalBudget / 400` increments by `marginalPoas`,
skipping any channel whose marginal profit is ≤ 0. That greedy allocation and its cap
are the reallocation subject's territory; what this application confirms is that the
gate's `fitted` flag is the only switch, and that the tree never reads a curve's slope
outside the band the fitter measured.

## Where the tree stops short

The fitter does not weight by recency or de-seasonalise by weekday before the log-log
regression (the 14-day floor is its whole answer to weekday shape), and the input
revenue is platform-reported, so a fitted marginal return is a description of the
platform's attribution of itself. The tree's documentation says neither; the technique
says both.
