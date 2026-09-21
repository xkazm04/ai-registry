---
layer: technique
type: technique
subject: campaign-anomaly-triage
technique: one-target-reciprocal-thresholds
status: forged
laws: [one-target-one-threshold, label-convention-as-convention]
shared_with: []
use_when: [adding a coloured cell or badge that judges a campaign, expressing one target in both a return and a cost-share form, threading a client's own goal into triage]
---

# One target, reciprocal thresholds

A paid portfolio judges efficiency in two equivalent vocabularies: return on spend
(value over cost, higher is better) and cost share of revenue (cost over value,
lower is better). They are reciprocals of each other, so a target in one form
determines the target in the other exactly, and a *threshold* placed as a multiple
of one target determines the equivalent multiple of the other exactly. The
technique is to type each of these once and derive every sibling.

## The band that a hand-typed sibling opens

Suppose the critical bar is "return below 0.6 of target". The equivalent
cost-share bar is "cost share above 1/0.6 of target", which is 1.6667 recurring.
A practitioner who types 1.6 for readability has opened a band, from 1.6 to
1.6667 times the target, where the cost-share cell goes red while the return cell
and the badge stay neutral. Nobody set out to make the two cells disagree; the
disagreement is an arithmetic residue of rounding. The band is narrow enough to be
invisible in testing and wide enough that a real campaign will sit in it within a
month.

The fix is not to type 1.6667. It is to never type the sibling at all: derive it
as the reciprocal of the constant it mirrors, so a change to one cannot leave the
other behind.

## Procedure

1. **Declare the target once, in one form.** Choose the form the business actually
   agreed - usually the cost share, because that is how a budget conversation is
   phrased - and derive the other: return target = 1 / cost-share target.
2. **Declare each threshold as a multiple of the target, once.** "Critical when
   return is below 0.6 of target." The sibling is derived: cost-share critical
   multiple = 1 / 0.6. Write the derivation where the constant lives.
3. **Route every judging surface through the same functions.** The cell tone, the
   badge rule, the banner count, the sort weight and any generated prose call the
   same predicate with the same resolved target. A surface that re-implements the
   comparison has re-opened the band.
4. **Thread a per-client target through the same resolver.** When a client's own
   agreed goal is known, build both targets from that one number; when it is
   absent or degenerate (zero, negative, not a number), fall back to the portfolio
   constant so a blank profile can never flip a rule into nonsense. The no-goal
   path must be byte-identical to the pre-goal behaviour.
5. **Label the scope.** A paid-portfolio target is usually looser than the
   whole-business blended target because paid carries prospecting. Every surface
   says which scope it judges against, so two different numbers on two pages are
   read as two scopes and not as a contradiction.

## Decision rules

- When a threshold exists in one vocabulary, derive the other; never type both,
  because two typed constants drift and the drift is a band where cells disagree.
- When a metric is lower-is-better, invert the comparison, never the number. A
  cost share of 30% is shown as 30%; the verdict flips, the figure does not.
- When the target changes, only the target changes. Thresholds are multiples and
  move with it; a threshold typed as an absolute value is a second target in
  disguise.
- When a client goal is missing or degenerate, use the portfolio constant and say
  so. A silent fallback to a different number produces a verdict the client will
  not recognise.
- When a cell reads "no spend" or "no revenue", it is muted, not red and not
  green: an undefined ratio has no verdict.

## What is convention here

The critical multiple itself - 0.6 of target, and therefore 1.6667 of the
cost-share target - is practitioner convention. It is roughly "lost forty percent
of the efficiency the business planned for", which is where most managers agree a
campaign has stopped being a tuning problem. Nothing in any platform's
documentation sets it, and a team may pick 0.5 or 0.7 with equal legitimacy. What
is not convention is the reciprocity: once the multiple is chosen, the sibling is
determined, and a technique that lets it float has a defect, not a preference.
Say this in the constant's comment and in any prose that quotes the bar.

## When not to use this

Do not apply the technique across scopes. The paid-portfolio target and the
blended whole-business target are two targets on purpose, and forcing one to be
derived from the other erases the reason they differ. The rule is one target *per
scope*; the reciprocity holds within a scope.

Do not use reciprocal derivation for thresholds that are not multiples of a
ratio target - a spend floor in currency, a click count, a minimum number of
weeks. Those are absolute gates with their own justification, and dressing them
as multiples of a target makes them move when the target moves, which is wrong.

Do not let a margin-based break-even masquerade as the target. Break-even is the
inverse of gross margin and belongs to the profitability subject; it is threaded
into triage as an optional second reference, never substituted for the agreed
target, because a business may deliberately run a scope at a loss for
prospecting.
