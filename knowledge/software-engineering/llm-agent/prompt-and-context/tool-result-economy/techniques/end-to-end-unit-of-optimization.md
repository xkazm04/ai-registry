---
layer: technique
type: technique
subject: tool-result-economy
technique: end-to-end-unit-of-optimization
status: forged
laws: [gate-sees-target, count-carries-predicate]
shared_with: []
use_when: [a change shortened every response and the bill did not fall, choosing the boundary an efficiency experiment is measured inside, quoting a saving measured on one workload for another, a promising optimization measured worse end to end]
---

# End-to-end unit of optimization

An efficiency change is proposed as a reduction: fewer tokens per response,
fewer bytes per tool result, a smaller prefix. Every one of those is a
measurement inside a boundary, and the boundary is chosen — usually
implicitly, usually by whichever instrument was already emitting a number.
This technique fixes the boundary before the experiment runs, because a
boundary chosen after the fact is chosen by the result.

The rule:

> **The unit of optimization is the unit the payer is charged for: from the
> request to the final result, the whole completed task.** Not the call, not
> the turn, not the session.

Anything narrower shares one defect. An efficiency metric whose boundary is
narrower than the unit being paid for **can always be improved by moving work
across that boundary**, and a local reduction is therefore not evidence of a
reduction. The metric is a proxy, and a gate reading a proxy passes exactly
when the proxy diverges from the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Displacement is the mechanism, and it is not gaming

The move is not adversarial and nobody has to intend it. Call it
**displacement**: work removed from inside the boundary reappears outside it,
where the metric cannot see it, and the reappearance is usually the model
behaving correctly.

The measured instance is worth holding in mind exactly. A utility shortened
shell output before the agent read it. Individual responses got shorter, as
designed, reliably. Where the omitted text mattered, the model reopened the
original file or re-ran the command — and those recovery steps did two
things, only the first of which is obvious. They added turns. And they
**carried more context forward on every subsequent turn**, because a turn in a
tool-using conversation re-transmits the accumulated prefix rather than the
increment. So the displaced cost is charged at a multiplier the local metric
has no access to: one recovery does not cost one extra call, it costs one
extra call plus a permanent increase to the price of every turn that follows.
The completed tasks cost more. The response-level number was true the whole
time.

That asymmetry is why the boundary cannot be split by convention. Local
savings are linear in the result; local costs are quadratic in the transcript.
Any metric that sees the first and not the second is biased in a known
direction, and the bias grows with task length — which means the longer and
more valuable the task, the more confidently the instrument is wrong.

## Choosing the boundary

- **The request-to-result task.** The user asks for something; the system
  works; a result comes back. Everything spent in between is inside the
  boundary — every turn, every retry, every re-read, every summarization call
  the harness made on its own behalf. This is the unit to optimize because it
  is the unit that has a value on the other side of it.
- **Not the call.** Isolates the single cheapest thing to improve and hides
  every consequence of improving it.
- **Not the turn.** Better, and still blind to added turns, which is the
  commonest displacement channel.
- **Not the session.** Worse in the other direction: a session mixes tasks
  with unrelated difficulty, so it is too noisy to attribute a change to and
  too coarse to act on. It is the right unit for capacity planning and the
  wrong one for an experiment.

## Workload locality: a result does not transfer

The boundary rule fixes *what* is measured. A second constraint fixes *where*,
and it is the honest reason a technique in this subject can be entirely right
and still not apply to you.

**A result established on one workload does not transfer to another, even when
they share the harness.** Field instance: a tighter instruction set that
reduced cost on one product surface increased it on a second surface running
the same underlying harness, and was not shipped. Same code, same tools,
different task mix, opposite sign. The mechanism is that the task mix decides
how often the removed material was load-bearing, and nothing about the harness
predicts that.

The consequence is procedural. Every surface re-measures before adopting, and
a saving that travels — into a document, a dashboard, a rollout plan — travels
with the workload it was measured on
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
"Cut cost 5%" is not a finding. "Cut cost 5% on this task population, measured
end to end, at this sample size" is a finding, and it is also the sentence
that stops the next team from quoting it for their own surface.

This is the workload-locality corollary of the cheap-instrument ladder: a
theoretical or offline pass can disqualify a candidate broadly, but the
verdict it hands up is about the population it ran on, and promotion to a
different population is a new experiment rather than a rollout.

## Boundary against metric roles

A sibling discipline decides which metric a suite optimizes and which are
thresholds it must clear — the
[metric role contract](../../../evaluation-and-cost/eval-harness/techniques/metric-role-contract.md).
That is about **roles**; this technique is about **scope**, and the two
failures are independent. A correctly-roled optimized metric measured inside
too small a boundary is still wrong, and a correctly-scoped metric with no
declared role is still un-decidable the first time two numbers move in
opposite directions. Both are required. Neither substitutes.

The practical composition: declare the roles, then declare the boundary each
role is measured inside, then run. Cost is almost always an operational
constraint rather than the optimized metric — which is precisely why its
boundary gets set carelessly, since a constraint nobody expects to bind gets
less design attention than the number the work exists to move.

## A negative result is a landing

A change evaluated end to end and found to cost more is **finished work**, not
wasted work, and it must be recorded as such. Two things come out of it and
the second is the valuable one.

The first is the decision: do not ship. The second is the explanation of **why
it looked good locally**, and that half is reusable. The shell-output case
does not merely retire one utility; it retires the whole family of "shorten
the output before the model reads it" proposals that do not first establish
what the model does when the removed part mattered. A team that records only
"we tried it, it didn't work" has thrown away the general lesson and will fund
the next member of the family in a year.

Write the negative result where the next proposal will be read, name the
displacement channel it went out through, and keep the local number beside the
end-to-end number. The gap between those two is the most instructive artifact
the experiment produced.

## Decision rules

- Declare the boundary before the experiment runs; a boundary chosen after
  the result is chosen by the result.
- Measure the completed task, from request to final result, including retries,
  recoveries, and the harness's own internal model calls.
- Treat any per-call or per-response reduction as a hypothesis, never as a
  finding, until an end-to-end number exists.
- When a local metric improves and the end-to-end metric does not, do not
  average them and do not split the difference — the end-to-end number is the
  verdict and the local one is the diagnosis.
- Re-measure on every workload before adopting, and never quote a saving
  without the workload, the boundary and the sample it was measured on.
- Land negative results with the local-versus-end-to-end gap and the
  displacement channel named.
- When a change cannot be measured end to end at all — the population is too
  small, the tasks too heterogeneous — it does not ship as an efficiency
  change. It may still ship as something else, on that thing's evidence.
