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
obligation, not a nicety. Modern high-risk-AI regimes require a documented,
ongoing monitoring plan over the deployed system's real-world performance, with
retained logs and a defined route for reporting serious problems — the deployer
carries oversight and log-keeping duties distinct from the provider's. Build the
monitor so its output *is* the evidence: a periodic, retained record with the
window, the sample, the metric values and the verdict, rather than a dashboard
whose history is whatever the database happens to still hold.

## Three axes, because there are three ways to go wrong

- **Predictive decay.** The score still separates, but less. Recompute the
  proper scoring rule on a recent window and compare to the reference period. The
  delta is **signed, not absolute**: improvement must never alarm, and folding an
  absolute value around it is the fastest way to teach the team that the alarm is
  meaningless. Size the cut against the rule's own range — for the squared-error
  rule, which spans zero to a quarter, a worsening of about 0.05 eats a fifth of
  the whole range and is comfortably past run-to-run jitter at realistic window
  sizes.
- **Input distribution shift.** The population being scored has changed, whether
  or not outcomes have caught up yet. This is the *early* signal, because it
  arrives before outcomes resolve. A distribution-stability index over the score
  bands is the standard instrument: values under about 0.1 read as stable,
  0.1–0.25 as worth investigating, above 0.25 as a material shift. Alarm only at
  the significant cut and *report* the middle band without alarming — a monitor
  that shouts at "moderate" is a monitor that gets muted. Treat those cuts as
  industry convention rather than law, and recalibrate them to your own volume
  once you have a year of history. Give the index a small epsilon floor so an
  empty band on one side contributes a large-but-finite term instead of dividing
  by zero and reporting infinity as drift.
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
sneakier because the surface looks busy. The floor is the same class of gate as
the whole-surface outcome minimum — reuse the same number rather than inventing a
monitoring-specific one — and it is checked *before* any axis is computed, so the
report carries no half-computed values a reader could quote. Thin windows are the
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
