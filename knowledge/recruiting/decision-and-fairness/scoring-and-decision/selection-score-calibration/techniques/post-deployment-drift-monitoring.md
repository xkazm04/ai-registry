---
layer: technique
type: technique
subject: selection-score-calibration
technique: post-deployment-drift-monitoring
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence, every-decision-names-its-actor]
shared_with: []
use_when: [operating a screening score after launch, setting drift alarm thresholds, satisfying an ongoing monitoring duty for a high-risk selection system]
---

# Post-deployment drift monitoring

A validity study is a photograph. A deployed selection score lives in a world
that moves: the applicant mix changes with the labour market, the same job title
means something different a year later, the underlying model gets swapped, and
recruiters learn to work with — and around — the number. Any of these dissolves
the score's relationship to outcomes without a single line of code changing.
Monitoring is the practice of noticing, on a schedule, before someone else does.

For a system that makes consequential decisions about people this is also an
obligation, not a nicety, and it is split. The EU AI Act puts the documented
post-market monitoring system on the *provider* (Article 72(1)); the deployer must
monitor operation against the instructions for use, report problems up to the
provider (Article 26(5)) and keep the logs for at least six months (26(6)); one
organisation that builds and runs its screen owes both. A recruitment or
screening system is high-risk under Annex III 4(a), and those obligations apply
from 2 December 2027, not the 2 August 2026 first enacted (Regulation (EU)
2026/1744; read 2026-09-29, re-read by 2026-12-29). A monitor built for one is not
automatically the evidence the other owes. Build the
monitor so its output *is* the evidence: a periodic, retained record with the
window, the sample, the metric values and the verdict, rather than a dashboard
whose history is whatever the database happens to still hold.

## Three axes, because there are three ways to go wrong

- **Predictive decay.** The score still separates, but less. Recompute the
  proper scoring rule on a recent window and compare to the reference period. The
  delta is **signed, not absolute**: improvement must never alarm, and folding an
  absolute value around it is the fastest way to teach the team that the alarm is
  meaningless. Size the cut against the rule's reference points, not its range:
  the squared-error rule runs from zero to one, and a worsening of 0.05 is a fifth
  of the 0.25 that always saying 0.5 scores. That is a size worth alarming on and
  it is *not* past run-to-run jitter on small windows. Measured on a calibrated
  score with both windows from one population (no drift, 4,000 window pairs), the
  standard deviation of the between-window delta was 0.057 at 20 outcomes per
  window, 0.035 at 50, 0.026 at 100, 0.018 at 200 and 0.012 at 400. And a cut
  equal to the change it must catch finds it about half the time at best: a true
  worsening of 0.05 tripped a 0.05 cut on about half of pairs at every window size
  from 20 to 1,000. Set the cut below the smallest change worth catching, and size the
  window so its noise is a small fraction of the cut.
- **Input distribution shift.** The population being scored has changed, whether
  or not outcomes have caught up yet. This is the *early* signal, because it
  arrives before outcomes resolve. A distribution-stability index over the score
  bands is the standard instrument: values under about 0.1 read as stable,
  0.1–0.25 as worth investigating, above 0.25 as a material shift. Alarm only at
  the significant cut and *report* the middle band without alarming — a monitor
  that shouts at "moderate" is a monitor that gets muted. Those cuts are a rule of
  thumb with no error rate behind it: the one paper that studies the index's
  statistics says they "are used without reference to statistical type I or type II
  error rates" (Yurdakul and Naranjo, J. Risk Model Validation 14(4); the
  dissertation it builds on was not read). Its sampling result is what sets the
  window: with B bins and no shift at all, the expected index is (B−1)(1/n + 1/m)
  for windows of n and m, so ten bins and 50 per window expect 0.36, above the
  alarm line, and 100 per window expect 0.18. In their simulation the 0.10 cut has
  too high a false-positive rate unless both windows exceed 400, and the 0.25 cut
  is only conservative above 200. Below that, compare the index against
  χ²(α, B−1)·(1/n + 1/m) or say *not evaluated*. Give the index a small epsilon
  floor so an empty band on one side contributes a large-but-finite term instead
  of dividing by zero, and note that at these sizes most bands are empty, which is
  the sampling problem again. Run it over **every scored candidate**, not only
  those whose outcome has resolved: the input axis needs no outcome, its windows
  are far larger, and that is what makes it the early signal.
- **Base-rate movement.** The outcome itself became more or less common — the
  team got pickier, a hiring freeze started, a requisition wave changed the mix.
  A shift of about ten points in the positive rate invalidates every threshold
  recommendation derived under the old rate, even if the score is unchanged.
  Without this axis, a hiring slowdown is misdiagnosed as model decay and
  somebody retrains a model that was fine.

Report all three every cycle, with their values, not just the ones that tripped.
A monitor that speaks only when alarmed teaches its readers that silence means
"fine" rather than "not evaluated".

## The honesty gate: a thin window may not alarm

This is the rule that decides whether the monitor survives its first year. If the
comparison window holds too few resolved outcomes to support the statistic, the
monitor returns **not evaluated**, with the count — never "no drift detected",
and never an alarm. Both wrong answers are fatal in their own way: a false
all-clear on three outcomes is a lie the surface will be believed about, and a
false alarm on three outcomes gets the monitor muted within a month, after which
it protects nobody.

The gate applies to **either** side of the comparison. A rich current window
against a thin baseline is just as unevaluable as the reverse, and the failure is
sneakier because the surface looks busy. The floor is the same *class* of gate as
the whole-surface outcome minimum and it is **not the same number**. Comparing two
windows is a harder act than drawing one curve, and reusing the curve's floor is
how a monitor comes to alarm on everything. Measured on a three-axis comparison
(score-shape delta of 0.05, index of 0.25, advance-rate move of 0.10) over two
windows drawn from one population under a perfectly calibrated score, so that every
alarm is false, 4,000 window pairs per size: at 20 outcomes per window the
comparison alarmed on 99.8% of pairs, at 30 on 98.9%, at 50 on 91%, at 100 on 43%,
at 200 on 6% and at 400 on 0.4%. The index carried most of it (median 1.8 at 20),
and the advance-rate axis alone alarmed on 64% at 20, because two proportions near
one half differ by more than ten points about half the time at that size. Set the
monitor's floor per axis from the statistic's own sampling behaviour, keep it
above the curve's, and check it *before* any axis is computed, so the report
carries no half-computed values a reader could quote. About 200 resolved outcomes
per window is where all three axes of this design were near a few per cent. Thin windows are the
normal state of most pipelines most weeks; a monitor designed around the busy
weeks is a monitor designed for someone else's pipeline.

## Procedure

1. **Fix a reference period** — the window the current threshold was justified
   from — and store its metrics as a sealed baseline. A baseline that silently
   rolls forward can never detect slow drift, because it drifts with the data.
2. **Evaluate on a schedule**, with a window long enough to clear the floor.
   Weekly for input shift, which resolves immediately; monthly or quarterly for
   predictive decay, which cannot resolve faster than the pipeline does.
3. **Segment by arm.** Drift in the clean arm and drift in the production arm
   mean different things: the second can be the threshold's own effect.
4. **Emit a record, not a notification.** Window bounds, counts, all three axis
   values, the thresholds in force, and the verdict. Retain it. This is the
   artifact anyone auditing the system will ask for, and reconstructing it later
   from raw rows is not possible once the score model has changed.
5. **Route the verdict to a person.** A drift alarm is not an automated
   retraining trigger and must never silently move a threshold — the threshold is
   a policy act with a named actor. The monitor's job ends at "a human must look
   at this", and the record names who did.

## Decision rules

- **When input shift trips but outcomes have not resolved yet,** do not wait for
  confirmation to inform the team. Early warning is the whole value of that axis;
  suppressing it until the slower axis agrees converts a leading indicator into a
  lagging one.
- **When base-rate movement explains the decay, say so and stop.** Retraining
  against a moved base rate bakes a temporary hiring posture into the model.
- **When the scoring model itself changed,** reset the baseline and mark the
  break in the series. Metrics across a model change are not a trend; they are
  two series drawn on one axis, which is the most persuasive misleading chart in
  this subject.
- **When the monitor has been silent for several cycles, check that it ran.** A
  monitor whose failure mode is silence is indistinguishable from a healthy one,
  which is why the record is emitted every cycle including the quiet ones.

## When not to use it

Do not run drift monitoring as a substitute for a clean arm. Stability is not
validity: a score that never worked will drift very little, and a perfectly flat
monitor over a circular measurement is a stable measurement of nothing.

Do not fold group-level outcome monitoring into this technique. Watching whether
selection rates diverge across groups over time is essential and it is a
different instrument with different thresholds, different sample rules and, in
most jurisdictions, different reporting duties. Running it inside a generic drift
job guarantees it inherits the wrong floors.
