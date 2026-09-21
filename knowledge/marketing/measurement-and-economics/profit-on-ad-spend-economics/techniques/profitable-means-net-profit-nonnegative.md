---
layer: technique
type: technique
subject: profit-on-ad-spend-economics
technique: profitable-means-net-profit-nonnegative
status: forged
laws: [efficiency-is-not-profitability, not-measured-is-not-zero, one-target-one-threshold]
shared_with: []
use_when: [writing the predicate that colours a row or counts unprofitable channels, an organic or direct channel reads as a loss, two surfaces disagree about whether one channel is profitable]
---

# Profitable means net profit is non-negative

A channel is profitable when its gross profit minus its ad cost is greater than or
equal to zero. Not when its return on ad spend clears break-even, not when its profit
on ad spend clears one, not when its cost share sits below the margin - although for a
paid channel every one of those is the same inequality rearranged. The net-profit form
is chosen because it is the only one that stays correct when the rearrangement is
illegal.

## The zero-cost case

Divide a channel's revenue by zero cost and the guarded divide returns zero. Zero is
below every break-even. An organic, direct, referral or owned-audience channel - the
lines that cost nothing and return the most - reads as "loses money after margin". The
ratio test has not measured anything; it has rendered a guard's fallback as a verdict.
Gross profit minus zero cost is gross profit, which is positive whenever there is
revenue, and the net-profit predicate gets the answer right without a special case.

The rule: **when a surface needs a profitable-or-not verdict, compute it from net
profit and never from a ratio, because the ratio form silently fails on every channel
whose denominator is zero, and those are the channels a business most wants credited.**

## One predicate, everywhere

The verdict feeds a row colour, a count of unprofitable channels, a sort, a summary
line, a prompt constraint and an alert. If each of those recomputes it, one of them
will use the ratio form and the surfaces will disagree about one channel. The
predicate lives in the same shared row computation that produces gross profit, net
profit and profit on ad spend, so a consumer cannot obtain the numbers without also
obtaining the verdict derived from them. A loaded variant of the same predicate -
contribution profit greater than or equal to ad cost - lives beside it for the
overhead view, and the count of unprofitable channels on that view reads the loaded
predicate, so a row's colour and the summary's count cannot diverge.

## Boundary at zero

Net profit of exactly zero is profitable: the channel covered its spend and its
margin, and calling that a loss would put break-even itself on the wrong side of the
line. The comparison is greater-than-or-equal, and the same inclusive boundary holds
for the loaded predicate.

## Decision rules

- **When a paid channel's net profit is negative and its return is above the agreed
  target**, the verdict is unprofitable, because the target is an efficiency
  convention and the margin is the fact.
- **When a channel has revenue and no cost**, it is profitable and its ratio is
  rendered as "no spend", not as zero and not as infinity, because both would be a
  number where there is no measurement.
- **When a channel has cost and no revenue**, it is unprofitable by exactly its spend,
  and its inverse ratio (cost share) is rendered as "no return" so it cannot be
  confused with a paused line.
- **When the margin is absent**, the predicate cannot be evaluated; the surface shows
  efficiency and withholds the verdict rather than substituting a fallback margin,
  because a fabricated margin makes a fabricated profit.
- **When the profit-and-loss view and the per-channel view disagree on the count of
  unprofitable channels**, one of them is reading a ratio; find it.

## Procedure

1. Compute gross profit = revenue x margin, net profit = gross profit - ad cost.
2. Set profitable = net profit >= 0 in the same function, returned with the numbers.
3. Derive the ratio (profit on ad spend) from the same gross profit through the
   shared guard, for display only.
4. For the overhead view, compute contribution profit = gross profit - allocated
   overhead - fulfilment, and contribution-profitable = contribution profit >= ad
   cost, in the same place.
5. Have every consumer - colour, count, sort, prompt - read the flag, never recompute.
6. Test the zero-cost channel and the zero-revenue channel as first-class cases; the
   first is the one that fails silently.

## When not to use

Do not use the net-profit predicate as a reallocation criterion: "profitable" says the
average unit of spend paid, and the move decision needs the marginal unit, which the
budget-reallocation subject ranks. Do not use it to compare two periods: a channel that
is profitable in both months may still be collapsing, and whether that is real belongs
to period-comparison significance. And do not apply it to sample or illustrative
rows; a verdict on disclosed sample data is a fabricated track record.
