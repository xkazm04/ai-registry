---
layer: technique
type: technique
subject: combat-pacing-and-dramatic-arc
technique: difficulty-band-classification
status: forged
laws: [a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [turning a survival or win-rate figure into a verdict a designer can act on, naming difficulty tiers, deciding where band boundaries sit]
---

# Difficulty band classification

The named concern: collapse a continuous outcome measure into a small set of labels, chosen
so that the label itself tells a designer what to do, and published with its boundaries
visible.

## The two craft points

**Bands are named for the action they imply.** *Easy*, *fair*, *tough*, *brutal* are useful
because each maps to a decision: leave it, leave it, confirm it was meant as a wall, cut
something. *Tier 1 / Tier 2 / Tier 3* and green/amber/red map to nothing — the reader has to
learn a private key, and every reader learns a different one. A band whose name does not
survive being read aloud to a designer who has never seen the tool is the wrong name.

**Boundaries are stated, not implied.** The output carries the numbers: *fair — survival 0.71,
band boundary 0.60*. Without them a designer cannot tell whether their change moved the fight
across a line or barely at all, and cannot tell whether the tool disagrees with them about the
fight or about the line. Encoding the boundary only in a colour or a bar length is the most
common way a balance readout becomes decorative.

## A worked band set

Over a survival-rate style measure — the fraction of trials the player wins, or the mean
remaining resource at the end, stated explicitly as which — a four-band split of roughly:

| Band | Boundary | What it means to do |
| --- | --- | --- |
| Easy | at or above 0.90 | fine for a filler encounter; wrong for anything meant to be a test |
| Fair | at or above 0.60 | the intended zone for the majority of encounters |
| Tough | at or above 0.35 | acceptable only where a wall was intended; confirm intent |
| Brutal | below 0.35 | cut something — this is not a difficulty setting, it is a defect |

The boundaries are not universal law; they are a defensible starting set for a game where
most fights should be winnable and losing is cheap. Move them for a game that expects
repeated death, but move them deliberately and write down why — and keep them in one place
that both the tool and the design documentation read from, or the two will drift.

## Procedure

1. Fix the measure and state its unit. Survival rate over a stated number of trials, or
   remaining-resource fraction, or completion rate — one of them, named in the output.
2. Fix the boundaries per encounter class, not globally, where classes genuinely differ. A
   boss and a corridor ambush should not share a band table if their intended survival rates
   differ by design.
3. Classify, and emit the band name, the measured value, and the boundary that the value was
   compared against.
4. Where a value sits within a small margin of a boundary, say so. *Fair, but within 0.02 of
   tough* prevents a designer from over-reading a band flip caused by simulation variance.
5. Pair the band with a **margin** measure. Two encounters can land in the same band and feel
   nothing alike: mean remaining resource on a win separates them. A low leftover — winning
   with a sliver of health — means close calls even on victories, and it is the difference
   between a *fair* fight that thrills and a *fair* fight that is on the edge of brutal.
6. Pair the band with the pacing findings rather than replacing them. A fight can be squarely
   *fair* and completely flat; the band is one line of the verdict, not the verdict.

## Decision rules

- When a band is derived from a sampled measure, report the sample size next to it. A band
  computed from thirty trials and one computed from three thousand are not the same claim.
- When band boundaries change, re-classify historical results before comparing them, or label
  the old ones with the boundary set they were computed under. Silently re-banding history is
  how a tuning trend line invents progress.
- When two bands disagree with a designer's stated intent for the encounter, the intent is the
  input to fix first. An encounter tagged as a wall and classified *tough* is a pass, not a
  finding; the same classification on an encounter tagged as filler is the whole report.
- Treat the two directions asymmetrically. Landing harder than intended is a sharper defect
  than landing easier: an unexpected spike reads as unfair, while an unexpectedly soft fight
  reads as under-stimulating. Give the overshoot the higher severity, and say why in the note
  rather than letting the reader infer it from a colour.
- Never let a band absorb a duration failure. A fight can be *fair* and still take three times
  its envelope; those are separate lines because they have separate fixes.

## When not to use this

- **When the outcome measure is not yet stable.** Banding a figure whose confidence interval
  spans two bands publishes noise with a confident label. Widen the sample or report the
  interval instead.
- **As the headline of a pacing analysis.** The band is the summary a producer skims; the
  beats are what a designer works from. Leading with the band trains everyone to stop reading
  after one line, which reinstates the scalar this subject rejects.
- **For encounters with multiple distinct win conditions.** A single band over a mixed outcome
  space hides that the fight is trivial one way and brutal another. Band each condition, or do
  not band.
