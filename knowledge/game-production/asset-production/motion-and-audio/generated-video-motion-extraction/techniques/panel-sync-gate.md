---
layer: technique
type: technique
subject: generated-video-motion-extraction
technique: panel-sync-gate
status: forged
laws: [an-instrument-proves-it-had-input, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a two-panel generated clip is about to be triangulated, reading timing from a multi-view generated clip, deciding whether to shift a clip's panels into agreement or re-generate it]
---

# Panel sync gate

Two panels in one generated clip are supposed to show one instant twice. A video model is
not a pair of genlocked cameras, and it does not reliably keep them in step. When the panels
drift, triangulation fuses the front view of one instant with the side view of another, and
the result is a pose nobody performed. It is smooth, it has plausible bone lengths, and no
check on the solved skeleton can tell it from a real one. The gate runs before any
triangulation and before any timing is read, and it costs one correlation.

## The measurement

Pick a feature that both panels can see and that the composition puts on a shared row: the
top of the silhouette during an overhead action, the lowest point during a stomp, the
height of the hand that carries the weapon. Read its image row in every frame of each panel.
That gives two series of heights over time, which should be the same series if the panels
are in sync.

Compute the normalised correlation of the two series over a range of lags, a quarter of a
second or so either way. Record three numbers: the correlation at lag zero, the lag with the
highest correlation, and the correlation there. Record the mean row residual beside them.

**The gate passes when the best lag is zero.** A clip whose best agreement is found by
sliding one panel against the other has two timelines, whatever its lag-zero correlation
looks like.

Measured on one locally run video model, two seeds of the same first frame and prompt:

| Seed | r at lag 0 | best lag | best r | mean row residual |
| --- | --- | --- | --- | --- |
| A | 0.982 | 0 | 0.982 | 10.1 px |
| B | 0.942 | 4 frames | 0.983 | 13.0 px |

Seed B's lag-zero correlation of 0.94 would pass any threshold a reader is tempted to set.
Its best lag of four frames (about 170 ms) says the front panel struck while the side
panel's blade was still raised. The strike window read from seed B came out three times
wider than seed A's, because it averaged two strikes at different times. These are two
seeds, a measured example of the failure, and not a threshold.

## Decision rules

- **When the best lag is not zero, re-roll.** Do not shift. A lag found on one feature is an
  average over the clip, and nothing yet shows it is constant. The model may have rendered
  two slightly different performances rather than one performance delayed, and a shift aligns
  one moment of them while leaving the rest wrong.
- **A shift is justified only by evidence that the lag is constant.** That means the same lag
  on at least two independent row-aligned features (the top point and a foot, say), the same
  lag in sliding windows across the clip, and a row residual after shifting that falls to the
  level of a clip that was synced from the start. Even then, mark the clip as shifted, trim the
  frames that no longer have a partner, and expect the contact window to be the least
  trustworthy part of it.
- **When the feature barely moves, the gate cannot run.** Correlation of two nearly flat series
  is noise. Require a range of motion in the feature well above the row residual before
  reading any correlation. Below it the clip is *not measured for sync*, which blocks
  triangulation. It is not a pass.
- **When the row residual is high at lag zero and the lag is zero, suspect the tracked point,
  not the timing.** Something other than the body has become the top of the silhouette: an
  effect, a prop, hair. Fix the composition.
- **Report the numbers with the verdict.** The lag, both correlations, the residual, the
  feature used and the lag range searched. A pass with no numbers behind it cannot be
  distinguished from a gate that never ran.

## Procedure

1. Choose the feature by action class, and write the choice down with the clip.
2. Read its row in each panel for every frame, at the clip's native frame rate, before any
   resampling.
3. Check the feature's range of motion against the residual. Too flat means not measured; stop.
4. Correlate over the lag range. If the best lag sits at the edge of the range, widen the range
   and repeat. A best lag at the edge is not a measurement of the lag.
5. Pass at lag zero. Otherwise re-roll, or meet the shift conditions above and mark the clip.
6. Only after a pass: triangulate, and read the contact window.

## When not to use it

- **On a single-view clip.** There is nothing to sync, and the trackability gate covers it.
- **As proof that the panels agree in pose.** The gate checks timing on one feature. Two
  panels can be in step and still disagree about where the elbow is. That is what the row
  residual and the extraction's own checks are for.
- **On panels from two separate generations.** They are two performances, not one instant out
  of step, and the gate's answer about them is meaningless whatever it says.
