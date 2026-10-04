---
layer: technique
type: technique
subject: vehicle-archetype-balance
technique: identity-pair-via-authored-band
status: forged
laws: [an-instrument-proves-it-had-input, unmeasured-is-not-a-pass]
shared_with: []
use_when: [every vehicle must be strong somewhere and weak somewhere, a peer-based outlier test cannot work on a two-vehicle tier, writing the lint that guards a roster's shape]
---

# Identity pair via authored band

The concern: equal rating invites an all-average roster, because the cheapest way to hit a
budget is to avoid extremes. The technique makes extremes mandatory: every vehicle must carry
an **identity pair**, at least one stat well above the tier reference and at least one well
below, and the rating budget then forces the high stat to be paid for. A vehicle at budget with
no weakness fails; a vehicle with a weakness and no strength fails.

Status of claims: the pair, the band width and the thresholds are **authored**. Whether a
weakness is *felt* — drawn in a warning colour, punished by a course — is **simulated** at best
and in the source of this subject **unmeasured** with people.

## Authored band, not sample deviation

"Two deviations high on one stat and two low on another" is the natural phrasing and it breaks
at the sizes a roster actually has. A tier of two vehicles has a sample deviation determined by
the gap between them; each member sits exactly one deviation from the mean, so neither can be
two. A tier of three has a ceiling on how many deviations an outlier can reach. Rosters are
small, so the test must not be statistical.

Replace the deviation with an **authored reference band width**: a number of stat points the
designer writes in data, with a separate integer count of bands. The threshold is
`width * count` points from the tier reference. Authored means legible (a designer knows
what two bands is), stable (adding a vehicle does not move the threshold) and defensible (the
width is a design stance rather than an accident of who else is in the tier).

## The reference, and what it includes

The reference is the tier's mean of each stat. Two choices need stating because they change
the threshold's effective size. If the mean includes the vehicle being tested, a vehicle in a
two-member tier differs from the mean by half its gap to its partner, so a band of one point
requires a two-point gap. If it excludes the vehicle, the delta is the full gap to its peers.
Either is defensible; the technique's rule is to state which and size the band accordingly,
because an unstated inclusion silently doubles the stat spread the roster must carry. The
peer-outlier lint in the neighbouring simulation subject excludes the subject, and a roster
that mixes the two conventions will disagree with itself.

## Procedure

1. Choose the band width and count; write them in data next to the other roster rules.
2. For each vehicle compute, per stat, its delta from the tier reference.
3. High set: stats at or above the threshold. Low set: stats at or below its negative.
4. Fail the vehicle if either set is empty. Report both sets so the finding names which side is
   missing.
5. Separately, report a *peer-population* note when the tier is too small to have a shape.
   This is a different finding from the pair, and it must render as "not enough peers to
   judge", never as a pass
   ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
6. Show the weak stat to the player: the low stat is drawn in a warning colour on every screen
   the stats appear on. The weakness is an honest price only if the player sees it paid.

## Reading the pair against the course set

A pair is meaningful only if some course punishes the weakness and some course rewards the
strength. A heavy, fast vehicle with poor steering needs a tight course where it loses; a
light, agile one with a speed cap needs a long straight where the cap shows. If the declared
course mix has no hairpin, the weakness is decoration. The pair check therefore has a partner
in the acceptance technique: each class is best on at least one course type and worst on at
least one. A pair that fails there is authored but not real.

## Decision rules

- When a vehicle is "balanced", give it a milder pair, not none. A generalist pays a little
  straight speed and durability for its flexibility; the safe pick is allowed to be safe but not
  free. Why: a vehicle with no price is a strictly dominant default that the rating cannot see.
- When the pair gate fails by a hair, move a stat, do not widen the band. Why: a band tuned to
  pass is the tolerance loosened in disguise.
- When a vehicle has two strengths and one weakness, check the rating budget, not the pair: the
  pair is satisfied and the cost should show it.
- When the high stat is one the rating prices at nearly nothing, the pair is satisfied and the
  trade is not. See the fit technique.

## When not to use it

For a roster of identical-purpose vehicles in a spec series, where fairness is sameness; the
pair is the wrong rule. For tiers with one vehicle, the reference is the vehicle itself and
every delta is zero; the output is "no peers", not a failure.
