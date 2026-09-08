---
layer: technique
type: technique
subject: tool-result-economy
technique: escape-hatch-usage-as-the-safety-metric
status: forged
laws: [failure-not-empty-success, absent-guard-is-loud, count-carries-predicate]
shared_with: []
use_when: [a lossy transform is about to ship with a recovery path and no instrumentation, a compression filter shows no quality regression and nobody trusts it, deciding how to regression-test a transform on a small sample, a recovery rate looks reassuringly close to zero]
---

# Escape hatch usage as the safety metric

Every lossy transform worth shipping ships with a way back: the preserved
original, the command that can be re-run, a pointer to the full text. Teams
build that path as a **safety mechanism** — a thing that exists so the failure
mode is recoverable — and then never look at it again.

The reframe this technique exists for:

> **The recovery path is not only the safety mechanism. It is the instrument.
> The rate at which the model takes the way back is the regression signal for
> the transform, and it must be instrumented before the transform ships.**

Frequent recovery means the transform removed something valuable. That is not
an inference from the rate; it is what the rate *is*. And it says so far
earlier and far more cheaply than the measurement teams reach for instead: a
task-success regression needs a large sample to move at all, resolves only
after whole tasks complete, and when it does move it indicts the release
rather than the transform. The recovery rate moves within a turn, on tens of
cases, and points at the specific filter that fired.

The instrument is also the reason the sibling classification policy can be
narrowed by evidence rather than by taste. The diff filter that was removed
was removed because agents were observed going back for the originals — which
is this measurement, taken by eye before anyone had built the counter.

## What counts as recovery

Enumerate it explicitly, because the definition is where this measurement is
usually lost. Recovery is any of:

- the model **opened the preserved original** after reading the compressed
  form;
- the model **re-ran the command** whose output was compressed;
- the model **repeated an exploration it had already done**;
- the model **narrowed a search it had already run**;
- the transform's presence cost **an extra turn** that a full result would not
  have needed.

The last three are the ones teams miss, and they are missed for the same
reason: they do not look like recovery. They look like the agent working. A
model that re-searches a directory it already listed is not raising a flag; it
is doing exactly what a model does when it is under-informed, and the trace
reads as ordinary competent behaviour. Only the comparison against the
uncompressed arm reveals that the exploration was a repeat.

Which sets the practical requirement: the first two shapes are countable
directly from the transform's own instrumentation, and the last three are
countable only against a control. Instrument the direct two on every
deployment, and measure the indirect three in the experiment that decides
whether the transform ships.

## The advertisement precondition

A low recovery rate is evidence **only if the path is reachable and
advertised**.

An escape hatch the model was never told about has a zero use rate and a zero
meaning, and the two are indistinguishable in the data. This is the ordinary
shape of an optional guard: a mechanism that protects only where something
else remembered to switch it on protects the design and not the deployment
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The way
it engages on its own is to be **named in the result the transform produced** —
not in the tool description, not in the standing instructions, not in a
document a human read once. The result that was compressed says that it was
compressed and how to get the rest, in the same bytes the model is reading
when the question arises.

So the check comes before the reading, every time:

> Before reading the rate, confirm the way back is named in the result the
> transform produced.

Without it, "nobody took the hatch" and "nobody could have taken the hatch"
are the same number, and a system that cannot tell those apart is publishing
an unavailable mechanism as a successful one
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
Zero is the most dangerous value this metric takes, because it is the value
that looks like success and is the value that both failures produce.

## The rate is conditional, and reporting it otherwise destroys it

The denominator is the population where the transform **actually fired** —
never all tasks.

Reported over all tasks, the rate is diluted by every case that never
triggered compression, and the dilution factor is exactly the trigger rate.
A transform firing on one task in twenty, recovered from half the time it
fires, reports a 2.5% all-task recovery rate: a number that looks like an
excellent safety record and describes a filter that fails half the time it
runs. The dilution grows as the transform gets more conservative, so tightening
the trigger *improves* the diluted number while the transform's actual quality
is unchanged — the metric moves in response to something that is not the thing
it measures.

The reporting rule follows from that: the rate travels with the population and
the trigger condition, always
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
"Recovery rate 8%, over the results this filter fired on, at this trigger
threshold, on this workload" is a finding. "Recovery rate 8%" is a number that
will be quoted for a claim it does not support, most likely by someone
comparing it against a differently-denominated one.

Report both denominators if the all-task figure is wanted for cost modelling —
it is the right number for estimating aggregate spend and the wrong number for
judging the transform — and label which is which.

## Reading the rate

- **Rising after a policy change** is the policy change being wrong, and it is
  visible before any downstream metric moves. Roll back on the rate; do not
  wait for the success number to confirm it.
- **Concentrated in one producer class** is a classification error, not a
  threshold error. Move that class down a rung rather than tightening the
  filter globally.
- **Zero, with an advertised path** is a genuine result and licenses widening
  the policy — carefully, one producer class at a time, re-reading the rate
  after each.
- **Zero, with an unadvertised path** is not a result at all. Fix the
  advertisement, then start measuring.

## The hatch the transform takes on the agent's behalf

Everything above counts the model's *elections*. There is a second hatch the
count cannot see, and it fires in the population where the transform behaved
worst: the transform's own failure path, which returns the original when it
cannot produce the compressed form — the summarizer timed out, the output did
not parse, the call was refused. Nobody elected it. It fires inside the
transform and puts the uncompressed input downstream as though it were the
result.

It breaks the measurement in both directions at once.

- **It is invisible to the recovery rate.** The model never went back for
  anything, because the original arrived unasked. The rate reads zero for
  exactly the cases where the transform failed hardest — the same dangerous
  zero § *The advertisement precondition* already names, reached by a second
  route, and this one survives a correctly advertised hatch.
- **It inverts the disclosure.** That section requires the compressed result
  to say it was compressed. An involuntary fallback requires the opposite
  sentence and almost never carries it: the result must say it is **raw**, or
  the model reads a full document as if it were a summary and budgets the rest
  of its window accordingly.

And the reason this is not merely a bookkeeping gap:

> **A bounding stage's failure path is correlated with the input it was
> bounding.** The pages that time out are the slow, large ones. The outputs
> that fail to parse are the long, malformed ones. So the fallback emits its
> largest payload precisely where the transform was most needed, and a stage
> installed to cap context becomes, on failure, the single largest
> contributor to it.

The correction is three lines, not a redesign:

- **Cap the fallback separately, and below the trigger.** If the compressed
  form was budgeted at N, the involuntary fallback returns at most N,
  truncated and marked as truncated — never the whole original. A transform
  that cannot summarize can still bound.
- **Count it as its own rate, beside the elected one and never summed with
  it.** They measure different things: an elected recovery says the transform
  removed something valuable; an involuntary one says the transform did not
  run. Averaging them produces a number that means neither
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
- **A log level is not instrumentation.** A warning is read by whoever is
  reading warnings. The involuntary rate belongs wherever the elected rate is
  published, or it will be discovered during an incident
  ([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

The question to ask of any lossy transform before it ships, once: **what does
its failure path return, and how large is that?** If the answer is "the
input", the stage has a bypass whose trigger condition is correlated with the
load it was installed to reduce.

## The generalization, stated once

Nothing about this is specific to agents. **Any lossy transformation with a
documented way back can be regression-tested by counting the way back** — the
fallback path, the manual override, the request for the uncompressed original.
Where a system offers a degraded artifact and a route to the real one, the
traffic on that route measures the degradation, and it does so at a fraction
of the cost of measuring the outcome it affects. The reason the technique is
rare is that the route was built as an escape and escapes are not usually
instrumented, being thought of as things that ought not to happen rather than
as a signal about how often they do.

## Decision rules

- Instrument the recovery path before the transform ships, not after the first
  complaint. A transform shipped without it has no regression test.
- Name the way back inside the result the transform produced. A path
  advertised anywhere else is an optional guard, and an optional guard is an
  absent one.
- Count all five shapes of recovery. Instrument the two direct ones
  permanently; measure the three indirect ones against a control arm in the
  experiment that decides shipping.
- Denominate the rate on the triggered population. Publish the all-task figure
  only for cost modelling, and only with both labels.
- Read the rate before task-success, and act on it before task-success moves.
- Never widen a compression policy without re-reading the rate under the wider
  policy, and never read a zero without first checking the advertisement.
- Ask what the transform's own failure path returns. Cap it below the
  trigger, mark it, and count involuntary fallbacks separately from elected
  recoveries.
