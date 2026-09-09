---
layer: technique
type: technique
subject: period-comparison-significance
technique: noise-muted-not-coloured
status: forged
laws: [statistical-honesty-before-a-verdict, one-target-one-threshold, not-measured-is-not-zero]
shared_with: []
use_when: [designing a delta badge or change indicator, ranking auto-generated insight lines, a channel table prints the same delta on every row]
---

# Noise is muted, not coloured

A delta badge carries two independent channels of meaning: **direction** (better or
worse for this metric) and **confidence** (the significance tier). The rendering
rule keeps them separate. A noise-tier delta keeps its sign and magnitude, loses its
colour, and gains a hover that says "within normal variance". It is never removed
and never painted green or red.

## The badge grammar

| Tier | Colour | Suffix on hover / accessible label | Ranking weight |
| --- | --- | --- | --- |
| strong | good/bad tone by metric direction | "significant" | leads |
| weak | good/bad tone by metric direction | "weak signal" | second |
| orientational | good/bad tone by metric direction | "directional read, ratio metric, no significance test" | third |
| noise | muted | "change within normal variance, not statistically significant" | last |
| below rounding | muted | "no change" | not ranked |

Two details carry the honesty. The colour follows the metric's **good direction**,
not up/down: a falling cost ratio is the good tone, a falling conversion rate the
bad one, so a reader never has to remember which way is up for which metric. And a
delta whose magnitude would print as 0.0 % at the surface's precision renders as the
words "no change" rather than as a signed zero, because "+0.0 %" with an up arrow is
a direction claim the number does not support. The sub-rounding floor (half of the
displayed precision) is convention and is stated in one place.

The wording also names the baseline. Under a year-over-year comparison the hover
reads "versus the same period last year"; under the adjacent window it reads
"versus the previous period". The same number under two baselines is two different
claims, and the badge must say which it is making.

## Procedure

1. Accept the delta, the metric's good direction and the tier as three inputs; do
   not derive one from another.
2. If the delta is not finite or is below the rounding floor, render "no change" in
   the muted tone and stop.
3. If the tier is noise, render the signed magnitude with its arrow in the muted tone
   and the variance hover, and stop. The arrow stays: the direction happened, it is
   only not distinguishable from variance.
4. Otherwise pick the tone from direction and good-direction, and append the tier's
   suffix to the hover and to the accessible label so a screen reader hears the
   confidence too.
5. Every other consumer of the tier reads the same field: the insight ranking sorts
   strong, weak, orientational, noise with magnitude as the tiebreak inside a tier;
   the chart's automatic colouring is suppressed for a noise metric; the narrative
   grounding receives the tier alongside the number. One computation, one threshold,
   every surface.

## Decision rules

- When the tier is noise, mute and keep the number, because removing it teaches the
  reader the dashboard shows only wins and colouring it manufactures a trend.
- When the magnitude is below the rounding floor, say "no change", because a signed
  zero with an arrow asserts a direction that rounding erased.
- When ranking insight lines, sort by tier first and magnitude second, because a
  large move the engine knows is variance must never outrank a small move it knows
  is real.
- When two rows would show the identical delta because they are projected as a
  fixed share of one total, show the delta once on the total row, because per-row
  identical deltas read as fake data and are.
- When a metric's good direction is lower-is-better, invert the tone, never the
  number, because the sign of the change is a fact and the colour is the judgement.

## Why muted rather than hidden

Hiding insignificant deltas has a predictable second-order effect: the surface fills
with colour only when something clears the bar, the client learns that a blank badge
means "nothing to see", and the agency's incentive becomes clearing the bar. Muted
badges keep the whole picture visible - eleven grey deltas and one green one is an
honest month - and put the significance in the reader's peripheral vision rather
than in a footnote. The reader who hovers gets the reason; the reader who does not
still sees the right amount of colour.

## When NOT to use

Do not mute an orientational delta. It is untested, not insignificant; it is
coloured with the "no significance test" suffix so a money-ratio move stays
visible while its confidence stays unclaimed.

Do not use the muted tone for an absent delta (no prior window, no trials). Absence
is a blank or a "not measured" label, not a muted number, because a muted number
still says a comparison was made.

Do not apply the badge grammar to a goal gap. Distance from a target is a different
quantity with its own threshold scope (paid versus blended) and its own colouring
rule; a delta badge answers "did it move", a goal chip answers "is it on plan", and
a surface that overloads one for the other has two cells that can disagree.
