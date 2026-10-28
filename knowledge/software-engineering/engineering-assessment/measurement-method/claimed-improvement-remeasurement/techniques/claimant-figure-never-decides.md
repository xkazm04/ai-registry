---
layer: technique
type: technique
subject: claimed-improvement-remeasurement
technique: claimant-figure-never-decides
status: forged
laws: [claimant-does-not-adjudicate, verdict-survives-boundary]
shared_with: []
use_when: [designing the input contract of a judge that checks a claimed gain, a claim record carries a figure and a description, reviewing where a tolerance or window comes from]
---

# The claimant's figure never decides

A claim of improvement arrives carrying a number: *CI time down from fourteen minutes to
nine*, *p95 latency down forty percent*. The number is useful — readers want to see it, and
the distance between it and what was measured is a record of how well the claimant knows its
own work. It is also the single most dangerous input a judge could read, because a judge that
knows the answer it is meant to reach is no longer measuring. The rule is
[claimant-does-not-adjudicate](../../../../_laws.md#claimant-does-not-adjudicate) taken
literally: the figure is **stored and displayed, and no parameter of the verdict is computed
from it**.

## The two channels

Split the claim record at ingestion into two parts with different destinations.

1. **The identity of the change** — the commit or merge that carries it, the pipeline or
   service it targets, the metric named. This is what the judge needs to find samples, and it
   is something the claimant cannot inflate: a commit either is or is not in a run's ancestry.
2. **The assertion** — the claimed before and after, the claimed percentage, the prose, any
   chart. This goes to the display and to the claimant's calibration record, and nowhere else.

The judge's function signature is the enforcement. It takes the change identity and the raw
run records; it does not take the claim. A judge that receives the whole claim object "for
context" will eventually read a field from it, and nothing in review will notice the line
that does.

## Where the figure leaks back in

The leaks are never a judge that copies the claimed verdict. They are free parameters that
somebody filled in from the only number in sight:

- **The tolerance.** "Credit if head beats base by at least half the claimed gain" sounds
  rigorous and makes a larger claim easier to *partially* confirm, so inflation pays. The
  tolerance comes from reviewed policy or from the samples' own spread, and from nothing the
  claimant wrote. The subtle case is a tolerance stated by the evidence job itself: that job
  runs in a pipeline the change under judgement can edit, so a stated tolerance is a claim too.
  Accept it only up to a ceiling held in reviewed policy, outside the change's reach, and when
  it exceeds the ceiling, say so with both numbers.
- **The window.** A claim that says "since Tuesday" invites a judge to start the head window
  on Tuesday. The window is defined by ancestry and sample floors, never by the claim's dates
  — and the claim's own timestamp and identifier are stamped by the receiving system, refused
  when the claimant supplies them, so a claim cannot be backdated to a window that suits it.
- **The direction.** Whether lower or higher is better is a property of the metric, not of
  the claim. A judge that reads "direction: up" from a claim about a duration will credit a
  change for making the pipeline slower, exactly as claimed. Fix direction per target kind in
  policy; a claim's stated direction is checked against it, and a mismatch is a refused claim.
- **The metric.** A claim names the metric that improved; the judge measures the metric the
  claim class declares, chosen in policy before the claim existed. An agent that trims test
  coverage to make CI faster has improved the metric it named and regressed one it did not.
- **The sample selection.** "Exclude the runs that hit the flaky integration stage" is a
  claimant's edit to the evidence. Exclusion rules are the judge's, fixed, and applied to
  base and head alike.
- **The base figure.** A claim that states its own *before* number offers the judge a
  ready-made base. The base is re-measured from runs the system collected; the claimed
  before is displayed only.

## What the figure is good for

Keep the figure, and use it after the verdict. Plot the claimed delta against the measured
delta across a claimant's history: a claimant whose claims run consistently above its
measurements is miscalibrated, and that is a property worth showing — beside the verdicts,
never inside them. The verdict and the claim travel together to every surface they reach, so
no reader sees the claim without the measurement, which is the
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary) half of the rule.

## Decision rules

- When a judge needs a parameter and the claim is the only nearby source, the parameter is
  missing, not found: derive it from the samples or fix it in policy.
- When a claimant can edit the record the judge reads — a trailer, a description, a label —
  that record is display-only, however convenient its fields.
- When the claim and the measurement disagree in direction, record both and say so; do not
  ask the claimant to reconcile them, because the reconciliation would be another claim.

## When not to use it

When there is no judge — a claim that will only ever be displayed, never credited, gated or
counted — the separation costs nothing and buys little; display it with a label saying it is
unverified. And this technique does not make the claimant's *measurement* worthless: a
claimant's raw samples, collected by the claimant, can be offered as a second opinion and
shown as such. They are never pooled into the judge's samples.
