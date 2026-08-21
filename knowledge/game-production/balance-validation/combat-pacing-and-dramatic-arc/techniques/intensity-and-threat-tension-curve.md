---
layer: technique
type: technique
subject: combat-pacing-and-dramatic-arc
technique: intensity-and-threat-tension-curve
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
shared_with: []
use_when: [building a pacing instrument from an event timeline, deciding how to normalize a drama metric, porting encounter pacing analysis to a different genre]
---

# Intensity-and-threat tension curve

The named concern: turn a timestamped event log of one encounter into a single bounded
series that rises when the fight is dramatic and falls when it is not — and make that series
mean the same thing in every encounter it is computed for.

## The two terms

**Intensity — rate of consequence.** Sum the consequential events inside a sliding window and
divide by a fixed reference. Damage is the usual carrier; count both directions, because a
fight where the player takes nothing is not tense and a fight where the player deals nothing
is not either. Weight high-consequence events above their raw magnitude: a critical or a burst
that removes a large fraction of a health bar in one hit reads louder than the same total
delivered as chip damage. A multiplier around 1.35 on critical events is enough to make the
spike visible without letting a lucky streak dominate the curve.

**Threat — distance to failure.** One minus the player's remaining health fraction, sampled at
the same instants. In genres without a health bar, substitute the normalized distance to
whatever ends the run: objective integrity lost, gap to the elimination position, remaining
lives, remaining time against the time needed.

**Blend.** A weighted sum. An even split is the honest starting point and a slight lean toward
threat — around 55 to 45 — holds up better, because stakes age well and spectacle does not.
Skew further toward threat for attrition encounters, toward intensity for spectacle ones, and
record the weights with the output: a curve whose weights are unknown cannot be compared with
another. Add one deliberate nonlinearity — when the defender falls below roughly a quarter of
its resource, add a fixed bump, in the region of 0.15 to 0.2, to the blended value. A linear
blend under-reports the last sliver of a health bar, which is the part players remember.

## Procedure

1. **Collect the timeline.** Every event with a timestamp, an actor, a magnitude, and a flag
   for high-consequence. Include the defender's resource level at each event, or reconstruct it.
2. **Choose the window and state it.** Two constraints: short enough to resolve the shortest
   beat you intend to detect, long enough that a single hit does not create a spike. The
   tiebreaker is agreement — match the bucket size any sibling detector already uses on the
   same timeline. If a separate check calls a two-second bucket empty, integrate the curve
   over two seconds, or the two instruments will disagree about whether a lull exists. Sample
   at a fraction of the window, a quarter is comfortable, so no beat falls between samples.
3. **Pick the normalization reference before you see any data.** Effective player health per
   second at the encounter's intended difficulty is a good default: it makes "1.0 intensity"
   mean "enough is happening to kill the player in a second". Never divide by the maximum
   observed in the encounter being measured.
4. **Compute per window**, blend, and clamp into the bounded range.
5. **Smooth minimally, and keep the raw terms alongside.** A moving average of radius one is
   enough to make the arc continuous. Anything heavier hides the spikes the next stage looks
   for. Emit intensity, threat and the reconstructed resource fraction unsmoothed in the same
   sample, because some beats must be detected on the raw signal rather than the blend.
6. **Exclude the edge windows from any spread statistic.** The first and last windows integrate
   fewer events by construction and always read low; a dynamic range computed over them
   under-reports variance and will mislabel a fight as flat. Compute spread over the interior.
7. **Emit the basis with the series**: window length, sample rate, normalization reference and
   its unit, blend weights, critical-event weight, near-death bump. A series without this
   block is not a measurement.
8. **Keep the whole computation deterministic** — no wall clock, no randomness, same timeline
   in, same curve out. A curve that cannot be reproduced cannot be diffed across a tuning pass,
   and cannot be used as a regression fixture.

## Decision rules

- When the curve is being compared across encounters, patches or builds, the normalization
  reference must be external and constant. When it is being read for a single fight in
  isolation and never compared, self-normalization is still wrong, because someone will
  compare it later.
- When intensity and threat disagree sharply and persistently — high intensity, near-zero
  threat — do not tune the blend to hide it. That divergence is a finding: the encounter is
  loud and safe.
- When a fight has phases with different rules (a boss that changes form), compute one
  continuous curve and mark the phase boundaries as annotations. Restarting the curve per
  phase destroys the comeback and near-death signatures that cross a boundary, which are
  usually the best moments in the fight.
- When many trials are simulated, keep the per-trial curves. Aggregate at the beat layer, not
  at the curve layer: the mean of a thousand curves is smooth no matter what any of them did.
- Exactly one implementation owns this quantity. If a lightweight version exists for a live
  readout, it adapts into the canonical one or it is barred from producing a verdict.

## When not to use this

- **Turn-based or fully deterministic encounters** where the interesting variable is decision
  quality, not moment-to-moment pressure. A curve over turn index is defensible but the beat
  vocabulary below it mostly does not fire.
- **Encounters with no failure state** — a scripted set piece, a tutorial that cannot be lost.
  The threat term is identically zero and the blend degenerates to a busyness meter, which is
  exactly the failure the two-term construction exists to prevent. Say so rather than shipping
  the curve.
- **As a fitness function for automated tuning.** The curve is a description, not a target.
  Optimizing an encounter to maximize area under the tension curve produces a fight that is
  loud and lethal throughout, which the taxonomy will correctly call flat.
