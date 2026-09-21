---
layer: technique
type: technique
subject: profit-on-ad-spend-economics
technique: ratio-vocabulary-one-guarded-divide
status: forged
laws: [not-measured-is-not-zero, one-target-one-threshold]
shared_with: []
use_when: [defining the marketing ratios a surface computes, a ratio is inlined in more than one place, a zero denominator has produced a verdict]
---

# Ratio vocabulary, one guarded divide

The marketing ratios are all the same operation with different names: a numerator
over a denominator, both measured, the denominator sometimes zero or absent. Return on
ad spend is value over cost; cost share of revenue is cost over value; profit on ad
spend is gross profit over cost; average order value is value over conversions;
conversion rate is conversions over a chosen denominator (visits for a site, clicks
for a campaign); cost per acquisition is cost over conversions; cost per click is cost
over clicks; click-through rate is clicks over impressions. The technique is to write
the divide once, guard it once, and define every named ratio as that one call, so the
guard's interpretation is a single decision the whole surface inherits rather than
eight decisions that drift.

## Why one divide

Two engines that inline the same formula produce the same number until one of them is
edited. A dashboard naming its inputs revenue and visits and a campaign engine naming
them conversion value and clicks are computing identical ratios; when each carries its
own guard, one returns zero on a missing denominator, the other returns
not-a-number, a third returns infinity, and the three cannot be compared in a table.
One primitive, named per ratio, is the only structure under which "the same number
from one source of truth" is a property rather than a hope.

## The guard is an interpretation

When the denominator is zero, the guard decides what the ratio means. The common
choice is zero. It is convenient - sums, sorts and charts all accept it - and it is
wrong twice over. A channel with zero cost is not earning zero per unit spent; it is
earning infinitely, or more honestly, the question does not apply. And a channel that
spent and returned nothing is genuinely a zero-return channel; rendering both as zero
erases the distinction between "no spend" and "spend with no return", which is the
distinction a triage surface most needs.

Decision rules:

- **When a ratio feeds a verdict** (profitable, on plan, over budget), do not read the
  guarded value; read the underlying net profit or the underlying counts, because the
  guard's zero is a rendering choice, not a fact about the channel.
- **When a ratio feeds a display**, render a zero-denominator case as "not measured"
  or a dash, never as zero, because the law that absence is not zero applies at the
  divide; and render a zero-numerator-over-positive-denominator case as the zero it
  is, with the inverse ratio shown as "infinite" or "no return" rather than blank,
  because that channel burned money and must not look paused.
- **When a ratio must be summed or averaged across rows**, do not average ratios;
  re-derive the ratio from summed numerators and summed denominators, because a mean
  of ratios weights a tiny channel as heavily as the largest one.
- **When a lower-is-better ratio (cost share, cost per acquisition) has a threshold**,
  the threshold is the reciprocal of the higher-is-better sibling's threshold by
  construction, never typed separately, because two hand-entered thresholds leave a
  band in which two cells disagree about one campaign.

## Procedure

1. Write the guard: numerator over denominator when the denominator is positive,
   otherwise a sentinel the caller must interpret (zero is acceptable only if no
   verdict reads it; a typed absence is better).
2. Define each named ratio as one line calling the guard, with the ratio's plain
   definition in a comment beside it so a marketer auditing the number finds it.
3. Grep the surface for inlined divides of the same quantities and replace each with
   the named call. The refactor changes no number; that is the point, and it is the
   test.
4. Where a verdict currently reads a ratio, rewrite it against the primitive the
   ratio was derived from.
5. Where a display shows a zero-denominator ratio, decide the rendering per case
   ("no spend" versus "no return") and label it.

## Naming discipline

Profit on ad spend is gross profit over cost, and gross profit is revenue times
margin. It is the margin-aware sibling of return on ad spend and lives in the same
vocabulary through the same guard, so the two are directly comparable side by side
with a break-even of one for the profit ratio and one over margin for the revenue
ratio. A surface that shows the two under different guards will show a profitable
channel with a blank return and an efficient one with a blank profit.

## When not to use

Do not force a ratio where a count is the honest unit: a channel with three
conversions has a cost per acquisition that swings by a third on the next order, and
the count with its spend tells the reader more than the ratio. Do not apply the
shared guard to a divide that is not a marketing ratio - a share of revenue used as an
allocation key, for instance, has its own semantics (a zero total means no allocation,
not no data) and should carry its own guard with its own comment. And do not let the
one-divide principle become a reason to share a threshold: one guard, many
thresholds, each derived from its own agreed target.
