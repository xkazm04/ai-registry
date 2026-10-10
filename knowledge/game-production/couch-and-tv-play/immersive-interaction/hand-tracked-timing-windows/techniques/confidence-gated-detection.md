---
layer: technique
type: technique
subject: hand-tracked-timing-windows
technique: confidence-gated-detection
status: draft
laws: [an-instrument-proves-it-had-input, structural-proof-is-never-sufficient]
shared_with: []
use_when: [tracking confidence drops during fast motion, a low-confidence pose earned a reward, deciding between rejecting and deferring a low-confidence sample]
---

# Confidence-gated detection

The named concern: a hand tracker reports each sample with a confidence, or with a coarse
state such as tracked, low or lost. Confidence falls during fast motion, edge-on palms and
overlapping fingers, which are exactly the conditions of a defence. Detection that ignores
confidence awards rewards for poses the tracker was guessing at. Detection that rejects
every low-confidence sample punishes the fastest, most committed players. The gate between
those failures is designed, not defaulted.

## The two decisions confidence gates

**Eligibility**: may this sample contribute to a rewarded verdict? A perfect, a parry or
anything else that grants advantage requires a classification built from samples above the
**reward floor**. Measure that floor: it sits where the per-sample pose error stops being
small compared with the difference between the poses the game distinguishes.

**Timing**: may this sample contribute to the onset estimate? Position is often usable at
confidence levels where finger articulation is not. A palm centre can be trusted for a
speed estimate while the finger curls that tell an open palm from a fist cannot. Gate each
quantity on the confidence that matters for it. The gate is per joint or per feature where
the tracker reports that detail, and per hand where it does not.

**With per-hand confidence, the timing gate is where the phantoms are.** If one number
covers the whole hand, a low-confidence position is as doubtful as a low-confidence pose,
and it reaches the verdict through the onset walk rather than through the classification.
An eligibility gate on its own leaves that path open. In one replay the eligibility gate
took sub-floor rewards to zero, and phantom perfects stayed at 1.3-5.4% of perfect time
against 1.8-4.7% without it. Gate timing as a **hold**: an untrusted sample measures
nothing, carries the last trusted speed and height, and the next trusted sample is measured
across the gap. Adding that hold cut phantoms to 0.2-0.5%, at a cost of 0.2-0.4% of perfect
time on dips where the position had been right. A held-sample rule that already exists for
a slow camera is the same mechanism. Its time bound is what separates a re-sent pose from
stillness, and confidence is the flag that lets a low-confidence hold outlast that bound
without being read as stillness.

## Defer or reject

When the classification candidate is built from low-confidence samples:

- **Defer** for a bounded number of samples, waiting for confident data that confirms or
  denies the pose. If confirmation arrives within the deferral, the verdict uses the
  recovered onset. The player loses nothing, because onset time does not move while the
  game waits. The deferral bound sits below the resolution horizon so it cannot hold a
  window open on its own.
- **Reject** when the deferral expires without confirmation, or when the pose under
  consideration is one where a wrong accept is worse than a miss.

Defer is the default for defences. Reject is the default for commands that spend resources
or commit the player, where a false accept costs more.

**Deferral is free only where the verdict waits for it.** The player loses nothing only if
hits are judged against the recovered onset after a resolution horizon. If the window opens
at the recognition event and a hit's verdict is final when it lands, a deferral does two
things. It moves the window by the deferral's length, and every hit inside the deferral
lands unguarded. In one replay that cost 13% of guard time on 83 ms dips where the tracker
had been right. Build the horizon before the deferral.

**Size the bound from the dips, not from "a few samples".** The bound has to cover the dips
the tracker actually produces on a correct pose. If it does not, expiry withholds the reward
from a correct defence. In the same replay, a three-sample bound lost a fifth of perfect
time on six-sample dips, and an eight-sample bound lost none.

## Hysteresis

Use two confidence thresholds: a higher one to enter the trusted state and a lower one to
leave it. A single threshold flickers when confidence hovers at the boundary, and every
flicker restarts the classifier's hold, delaying the verdict or splitting a stroke.

## Procedure

1. Record confidence alongside pose for every sample in the history.
2. Measure per-sample pose error against confidence on a recorded corpus, using a
   reference such as a motion-capture rig, a scripted mechanical hand or a held pose of known
   shape. Without a reference, confidence floors are guesses and are labelled as guesses.
3. Set the reward floor, the timing floor and the hysteresis pair in the canon.
4. Implement deferral with an explicit bound, and log every deferral with its outcome:
   confirmed, expired or contradicted.
5. Count rewarded verdicts by the lowest confidence that contributed. A reward from below
   the floor is a defect and should be impossible. That count reads zero as soon as any gate
   exists, so it shows that a gate is present, not that it works. Also count rewards that the
   same clip does not earn without the dip. Only that second count measures the gate.

## Decision rules

- **When deferrals mostly expire, the floor is too high or the classifier needs a different
  feature.** Do not lower the floor until the error measurement supports it.
- **When rewards are granted on poses that look wrong in replay, check the contributing
  confidence first.**
- **When the tracker exposes a higher-rate or wide-motion mode, measure confidence and jitter
  in both modes before switching.** Higher sample rates can bring more jitter with them.
- **When the test clips carry confidence and no detector reads it, the gate is missing, not
  passed.** A synthetic dip that changes nothing proves only that nothing reads the field.
- **When the sub-floor reward count is zero and phantom rewards have not moved, the onset
  is reading doubtful positions.** Gate timing as a hold before raising the reward floor.
- **When the live window opens at recognition and the tests judge on onset, measure both.**
  A gate that is better under one rule can fail the floor under the other.
- **When confidence is unavailable**, treat sudden pose changes, impossible joint angles and
  bone-length changes as a derived low-confidence signal, and name it derived.

## When not to use it

- **For cosmetic hand rendering**, where a low-confidence pose may be shown smoothed. The gate
  governs verdicts, not visuals.
- **When the classifier already gates on confidence internally**, do not gate twice with
  different floors. Read its floor and own it in one place.
