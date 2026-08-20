---
layer: golden-path
type: golden-path
subject: judge-calibration-and-drift
status: forged
use_when: [standing up an LLM judge over production traces, deciding whether judge scores can gate anything, a judge's scores look off after a model or prompt change, choosing which model to use as a judge]
techniques:
  - golden-set-agreement-measurement
  - trust-bar-verdict
  - scheduled-recalibration
  - reserved-rubric-persistence
  - windowed-score-drop-alerting
  - judge-selection-by-spread
---

# Judge calibration and drift

Every quality number in an LLM observability system flows through one
instrument: the judge. Scorecards, regression gates, per-customer quality
trends, alert thresholds — all of them inherit the judge's error, silently and
multiplicatively. The builder-side evaluation harness gets to assume its
assertions are correct, because a human wrote them and a human can re-read
them. The operator side has no such luxury: the judge is a stochastic model
scoring other models, and the only honest posture is that **the measuring
instrument is itself the thing under test — and stays under test for as long
as it is in service.**

This subject is the discipline of that posture. It has three movements:
establish agreement with humans (calibration), declare what that agreement
licenses (trust), and detect when the agreement silently ends (drift). Skip
any one and the other two are theater: calibration without a trust verdict
produces a number nobody consults; trust without recalibration is a
photograph of an instrument that has since been swapped out under you; drift
detection without an initial calibration is measuring change against an
anchor nobody validated.

## Agreement is measured, not argued

A judge is trustworthy exactly to the extent that it agrees with a human who
read the same outputs — and that agreement is a measurement with a
methodology, not an impression formed by spot-checking a few verdicts.

The apparatus is a **golden set**: a frozen collection of real inputs and
outputs, each carrying a human ground-truth quality score. The judge
re-scores the same outputs (judge-only — it never generates), and the paired
scores yield a small family of metrics that answer different questions:
correlation for whether the judge ranks quality in the same order the human
does; mean absolute error for how far individual verdicts sit from the
human's; directional bias for whether the judge is systematically more
generous or harsher; and a **chance-corrected agreement coefficient** —
Cohen's kappa on the binarized pass/fail decision — for the question a gate
actually asks. Chance correction is not statistical pedantry: on an
imbalanced set where most outputs pass, a judge that passes *everything*
scores a high raw agreement rate while carrying zero information. Kappa is
what separates "agrees with the human" from "agrees with the base rate."
Field practice converges on a kappa bar around 0.6 as the floor of
acceptability and 0.8 as strong — with the human inter-annotator kappa on the
same set as the ceiling no judge can be expected to beat.

The deep obligation here is honesty about statistical power. Golden sets are
small, because human labels are expensive — and small samples make paired
tests underpowered by construction. A real degradation can sit just outside
conventional significance for want of items, and a tool that reports "no
detectable change" as "no change" is worse than no tool: it converts absence
of evidence into a green light. Verdicts over a golden set lead with effect
size, and any conclusion that rests on *not* detecting a shift carries a
low-power caveat when the sample is small.

## Trust is a verdict, not a vibe

Calibration must terminate in an explicit, machine-readable state:
**trusted** or **untrusted**, determined by whether kappa clears a
pre-committed bar. This verdict is the boundary object between the
calibration machinery and everything downstream. Its consequences are
categorical, not gradual:

- A trusted judge's scores are **measurements**. They may feed gates, alerts,
  customer-facing quality trends, and regression verdicts.
- An untrusted judge's scores are **leads**. They may prioritize what a human
  looks at; they may never close a question, fail a release, or appear in a
  number a customer sees as fact.

The naive reading collapses this into "the judge is pretty good, use it."
That collapse is how organizations end up gating releases on an instrument
nobody has checked in months. The verdict must also handle absence honestly:
a judge that has *never* been calibrated is not implicitly trusted — unknown
trust is its own disclosed state, and it licenses exactly what untrusted
does. Absence of calibration is a fact to surface, never a default to
assume through.

## Calibration expires — drift is the steady state

The judge sits on foundations you do not control. The provider updates the
underlying model without changing its name; your own team tweaks the rubric
prompt; production traffic shifts into a domain the golden set never
covered. Any of these can erode agreement without a single error being
thrown. A one-shot calibration is therefore a *dated* claim, and the system
must re-earn trust on a schedule.

Two detection horizons cover drift, and both are needed because they fail in
opposite directions:

- **Immediate, per-cycle**: each recalibration compares its kappa to the
  previous cycle's. Below the bar is an alert; a large single-cycle drop
  that is still above the bar is an early warning. This fires on the very
  next bad run, with no warm-up — but a slow slide of small steps walks
  right under it.
- **Windowed, over history**: a rolling window of calibration results
  compares the recent mean against the established baseline mean and alarms
  on relative regression. This catches the slow slide the per-cycle check
  misses — but it needs a minimum number of samples before it can say
  anything, so it is blind for exactly the first days of a new judge's life.

The elegant move — and an operational lesson worth stealing — is that the
windowed detector need not be built at all if calibration history is
persisted *as scores in the system's own quality store*, under a reserved
instrument name. The same trend machinery that catches a quality regression
on any rubric then catches a kappa regression on the judge itself, riding
the same alert channels, with zero calibration-specific wiring. The meter is
measured by its own dial. This also gives the history the store's existing
properties for free: append-only cycles, queryable trends, provenance per
entry — and it inherits the no-restatement discipline, so a recalibration
never rewrites what an earlier cycle claimed.

## The judge is chosen for discrimination, not price

Calibration also answers the *selection* question: which model judges. The
tempting metrics — agreement error, correlation, cost — are all secondary to
**spread**: the gap between what the judge gives known-good outputs and what
it gives known-bad ones. A judge with narrow spread cannot separate quality
from deflection at *any* threshold; every downstream verdict inherits that
blindness no matter how carefully the bar is tuned. And spread failures are
sneaky: a judge can post respectable correlation while compressing
everything into a band, or show healthy extremes while being generous
exactly in the middle — passing half-answers and confidently wrong answers,
the two most expensive mistakes an operator can miss. Because the quality
apparatus is unbudgeted by construction — judge spend never enters product
cost and no usage cap throttles the scoring path — price is a tiebreaker
between judges that discriminate, never a reason to accept one that does
not.

One more instrument-integrity rule: any change to *how* judging happens —
batching multiple cases per call, a new sampling strategy, a rubric wording
pass — is a change to the instrument, and its effect is measured, not
assumed. The same golden set judged both ways, paired, tells you whether
verdicts moved; comparing a run under the new method against a baseline
recorded under the old one tells you nothing but the method delta wearing a
quality costume.

## Failure modes of the naive reading

- **Calibrate once, trust forever.** The instrument under the trust verdict
  is silently replaced by provider updates; the verdict outlives its
  subject.
- **Raw agreement rate as the trust metric.** Inflated by class imbalance; a
  rubber-stamp judge looks excellent on a mostly-passing set.
- **Silent golden-set refresh.** Swapping items changes what kappa means and
  every trend across the swap is an artifact. The set is frozen; refreshes
  are deliberate, versioned events that re-baseline the history.
- **Reading an underpowered null as safety.** Small-n paired tests that
  "found nothing" are reported as if they looked everywhere.
- **Trust leaking past its scope.** Kappa is earned per judge model, per
  rubric, per threshold. A new rubric, a new judge, or a moved pass bar
  starts untrusted — the verdict does not transfer.
- **The uncalibrated gate.** Scores from an untrusted or never-calibrated
  judge failing builds, closing tickets, or reaching customers as fact.

## The techniques

- [golden-set-agreement-measurement](techniques/golden-set-agreement-measurement.md) —
  the frozen human-labeled set, the metric family, and what each metric can
  and cannot say.
- [trust-bar-verdict](techniques/trust-bar-verdict.md) — the explicit
  trusted/untrusted state, its scope, and what each state licenses.
- [scheduled-recalibration](techniques/scheduled-recalibration.md) — the
  drift sentinel: re-earning trust on a cadence, per-cycle drift checks,
  scheduler integration by exit contract.
- [reserved-rubric-persistence](techniques/reserved-rubric-persistence.md) —
  storing calibration history as first-class scores under a reserved
  instrument name, so trend tooling applies to the meter itself.
- [windowed-score-drop-alerting](techniques/windowed-score-drop-alerting.md) —
  the rolling recent-vs-baseline detector, its warm-up honesty, and why it
  pairs with the immediate check.
- [judge-selection-by-spread](techniques/judge-selection-by-spread.md) —
  choosing the judge by discrimination between known-good and known-bad,
  and re-verifying after any method change.
