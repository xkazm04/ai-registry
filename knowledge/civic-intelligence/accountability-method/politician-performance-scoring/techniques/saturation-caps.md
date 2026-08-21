---
layer: technique
type: technique
subject: politician-performance-scoring
technique: saturation-caps
status: forged
laws: [deterministic-code-owns-numbers, one-definition-one-import, every-cap-ships-its-population]
shared_with: []
use_when: [bounding count-based score components against volume gaming, choosing and publishing saturation points, explaining why more activity stops paying]
---

# Saturation caps

Count-based components — instruments authored, questions filed, speaking turns —
are the gameable half of an activity index. The field's core critique of
parliamentary scorecards is precisely this: once a count pays linearly, the
cheapest activity to mass-file dominates the ranking, and members respond to the
metric instead of the mandate. A saturation cap converts each count into a
bounded term: value over cap, clamped to one, times the component weight. Past
the cap, more of the same activity buys nothing.

## What a cap claims, and what it does not

A cap encodes an editorial judgment: *beyond this point, additional volume of
this activity is no longer evidence of additional contribution.* That is a
defensible claim — the difference between zero and three authored instruments is
signal; the difference between forty and four hundred filed questions is filing
behavior. But the cap deliberately does **not** claim that the fortieth speech
was worthless, and the methodology text must say which claim is being made. A
cap presented as a quality judgment invites a quality debate the index cannot
win; a cap presented as an anti-gaming bound is self-evidently reasonable.

## Choosing the saturation point

- **Set it from the population's distribution, not from intuition.** A cap below
  the population median saturates half the chamber and the component stops
  discriminating; a cap above the 95th percentile is decorative. Aim where the
  distribution's informative range ends — typically between the median and the
  upper decile — and record the distribution you set it against.
- **Different components saturate at wildly different scales.** Breadth of body
  membership saturates in single digits (a person can meaningfully serve on only
  so many); floor speaking turns saturate in the tens; do not force symmetry.
- **Publish the saturated population.** "N of M people are at this component's
  cap" is part of the disclosure: it tells the reader how much of the ranking
  this component can still move, and it is the number that tells *you* when a cap
  has drifted out of range. A cap whose saturated share silently grows past half
  the population has become a participation trophy.

## Caps are shared constants

The cap is a named constant with one definition, imported by the scorer, the
methodology surface, the per-person decomposition ("2 of 3 bodies — 1 more
reaches the cap"), and any headroom or what-if display. A mirrored cap literal
on the read side is the classic drift: the scorer's cap changes, the dossier
keeps explaining the old one, and the product publishes two methodologies at
once. The same identity discipline that governs counting applies to the cap's
input: saturate over deduplicated identities (distinct bodies, distinct
instruments), never over registry rows, or the cap can be reached by filing
convention alone.

## Interaction with corrections

Because caps clamp, a counting correction changes not just scores but the
*saturated set* — deduplicating a double-filed body row moves people back under
the cap and un-saturates them. When shipping such a correction, measure and
publish both effects: total points moved, and the change in the saturated
population. The second number is the one that shows whether the component
regained discriminating power.

## When not to use this

Do not cap rate components — participation and attendance are already bounded by
their denominators, and capping a rate re-introduces an arbitrary threshold with
no anti-gaming story. Do not use a soft curve (log, square root) when a hard cap
will do: a curve is harder to explain, harder to render as headroom in native
units, and its tail still pays volume — the property the cap exists to remove. A
diminishing-returns curve is the right tool only when the ranking must still
discriminate *above* the informative range, which for an effort screen it should
not need to. And never tune a cap to move a specific person's rank; caps are
population-level instruments, and the correction path for a wrong rank is a
counting fix, not a threshold nudge.
