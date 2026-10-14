---
layer: application
type: application
subject: interview-story-portfolio
technique: practice-score-needs-outcomes-before-it-is-trusted
stack: process
status: forged
verified_on: 2026-10-14
---

# A prompt-only interview coach: the three-outcome calibration rule

Pinned at commit `634a8dd8` of a candidate-side interview-coaching skill. It is markdown
instructions to a model, with no runtime and no version file, so `verified_against` is
omitted. What this realization cannot do: nothing counts outcomes, nothing refuses to
declare a status when the count is low, and nothing stops the model from adjusting a
dimension and then reporting the adjusted scores as accurate. The calibration status is
whatever the model writes into a state file. This document is mostly a record of where the
rule over-claims; the tree located a real gap and filled it with a rule that does not hold.

Anchors are root-relative to that tree.

## What conforms

- **Uncalibrated is a state, and it exists.**
  references/calibration-engine.md:33 "Fewer than 3 real interview outcomes" is named as
  uncalibrated, with the honest consequence "cannot verify its own accuracy". The
  technique's state of too few outcomes to tell is the same idea, though at a different
  count.
- **Unmeasured factors are investigated as hypotheses.** When scores do not predict
  outcomes, the module looks outside the rubric:
  references/calibration-engine.md:192 "investigate factors outside the scoring rubric".
  The technique's closing point about what the rubric does not measure matches this.
- **The root-cause hypothesis is stated to be tested.**
  references/calibration-engine.md:213 "Energy level is driving outcomes more than content quality" is an example of a
  specific, testable guess, followed by a drill designed to vary it.

## Deviations

1. **Three outcomes advance the status.**
   references/calibration-engine.md:34 "3+ outcomes exist, first calibration check in progress" and the drift check runs
   at the same threshold: references/calibration-engine.md:42 "when 3+ real interview outcomes exist in the Outcome Log".
   A worthless rubric separates three outcomes perfectly a third of the time when one was
   a rejection. The standard states no fixed count but a double-digit one for any claim of
   accuracy, and says the usual state across a search is too few to tell.
2. **The status of calibrated rests on a correlation among a handful.**
   references/calibration-engine.md:35 "practice scores reasonably predict outcomes (correlation exists)" has no
   sample statement, no confounds and no way to render the count it stands on.
3. **External feedback outranks the score unconditionally.**
   references/calibration-engine.md:61 "Weight external feedback higher than internal scoring" with no requirement that
   the feedback name a behaviour. The standard weights it only when it does.
4. **The scoring is moved on that feedback, by an amount finer than the instrument.**
   references/calibration-engine.md:68 "Tighten Structure scoring by 0.5" is proposed from a few outcomes, and the
   candidate is told how to hear it:
   references/calibration-engine.md:71 "Frame drift corrections as improved predictive accuracy, NOT as goalpost-moving".
   The framing instruction is the very thing a self-grading predictor needs to avoid;
   there is no stamp of rubric version on earlier scores, so adjusted and unadjusted scores
   mix in the history.
5. **The grading circle is not named.** The adjusted score is then checked against the
   same outcomes that moved it. The standard names this as a predictor grading its own
   labels and requires outcomes not yet seen.

## Upward lesson

The root-cause lifecycle is the source of the companion technique, and it is more careful
than the drift rule: it requires recurrence before graduating a cause
(references/calibration-engine.md:81 "2+ consecutive sessions"), prescribes a single treatment
(references/calibration-engine.md:89 "Prescribe ONE intervention"), and demands sustained movement before closing
(references/calibration-engine.md:94 "over 3+ sessions"). Applied to a root cause the same small
counts are too soft to claim real-interview effect, but as a practice-level hypothesis
tracker it is sound.

## Not covered

The tree has no count of outcomes beyond the status wording, no minimum for the claim of
calibrated, and no way to show an outcome log as small. It does not mention interviewer
feedback that arrives with no reason.
