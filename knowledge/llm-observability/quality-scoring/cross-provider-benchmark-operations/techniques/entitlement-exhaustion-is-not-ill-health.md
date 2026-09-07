---
layer: technique
type: technique
subject: cross-provider-benchmark-operations
technique: entitlement-exhaustion-is-not-ill-health
status: forged
laws: [never-present-absence-as-an-answer, estimation-announces-itself, quality-apparatus-stays-unbudgeted]
shared_with: []
use_when: [a target is reached through a purchased allowance rather than a metered account, one column of a matrix stopped producing rows and the operator's ceiling never fired, a rate limit keeps reopening the same target's breaker, deciding whether a halted target is worth re-running, a benchmark run is charged to a plan nobody can price per call]
---

# Entitlement exhaustion is not ill health

A matrix that halts a target part-way through has to say why, because the answer decides
what happens next. The operations discipline already separates the two causes it was built
for: the operator's money ran out, or the provider was unwell. Both are recorded, and a
report that renders them identically is lying by omission.

There is a third cause, it is common wherever a target is reached through a **purchased
allowance** rather than a per-call meter, and it arrives wearing the second one's clothes.
The allowance ends; the endpoint answers with the same too-many-requests status a burst
limiter uses; the retry ladder spends its attempts; the target's breaker opens; the report
says the provider was unhealthy. It was not. The provider is fine and would serve anyone
else. What ended is **this account's entitlement**, and nearly everything a reader would do
next differs between those two readings.

## Why it is not the health case, in three ways that each change a decision

**It is a fact about the account, not about the target.** A health filter exists to stop a
sick provider from contaminating a scorecard, and its correctness rests on the fault being
the provider's. An exhausted allowance indicts the buyer. Filing it as ill health puts a
defect in the column of a target that did nothing wrong, and any downstream reader ranking
providers by reliability reads it as evidence.

**Re-running reproduces it.** This is the practical difference and it is the whole reason
the distinction earns a technique. Ill health is transient by construction — the standing
advice for a health-filtered target is to run it again later, and that advice is correct.
Run an exhausted allowance again on the same plan and it fails at the same point, or
earlier. A report that says *unhealthy* is telling the operator to spend the run twice.

**It is correlated with the target under test, so it is also a measurement.** The other
truncation causes are independent of which target they land on: an operator ceiling halts
whichever cell reaches it, a cancel lands wherever the operator was standing. An allowance
runs out on the target that consumed the most of it — which is a fact about that target's
appetite, and the only cost signal available when the plan is not priced per call.
Discarding it as noise throws away the one number the run did earn
([never-present-absence-as-an-answer](../../../_laws.md#never-present-absence-as-an-answer)).

The sibling subject's truncation rule holds unchanged for the verdict: a run that judged
part of its dataset is unverified, and this cause converges with the rest on *that* point.
What does not converge is the diagnosis, and the enumeration of causes there — ceiling,
cancel, pre-flight refusal, crash — is a list of things the harness or its operator did.
This one is done to the run from outside it.

## The discriminator is the stated wait, not the status code

The status code cannot separate a burst limit from an exhausted plan; both providers say
the same thing. What separates them is already on the wire, and a retry ladder that honours
a stated wait is already reading it: **compare the wait the response asked for against the
budget the run has to give it.**

- A wait inside the call's own budget is a burst limiter asking for a pause. Sleep, retry,
  carry on — this is the transient case, correctly retried.
- A wait that exceeds the call budget, or exceeds the whole run's remaining wall clock, is
  not a pause. It is a refusal with a resumption date, and no number of attempts inside this
  run will satisfy it.
- **A response that names no wait at all is the ambiguous case and must be recorded as
  ambiguous**, not silently sorted into either bin
  ([estimation-announces-itself](../../../_laws.md#estimation-announces-itself)). Repeated
  refusals with no stated wait, on one target, after the ladder has exhausted itself, are
  the strongest evidence available and should be reported as *suspected exhaustion* with the
  attempt count that produced the suspicion.

The structural precondition is the part most implementations miss: this classification is
only possible if the failure's **cause survives to the component that decides**. A runner
that reduces each cell's outcome to a success/failure boolean before the breaker sees it
has made the distinction unrepresentable — not unimplemented, unrepresentable — and no
amount of care further downstream can recover it. Carry the typed error, or accept that
every provider-side absence renders as ill health.

## Procedure

1. **Record which targets are plan-reached** in the matrix declaration, beside the provider
   and model. It is one field, it is knowable before the run, and it is what tells a reader
   which columns are even eligible for this failure. A target billed per call cannot exhaust
   an allowance and should never be diagnosed with one.
2. **Preserve the typed failure to the classifier.** The breaker and the report need the
   cause, not a boolean; collapse it afterwards if the counters want a boolean.
3. **Classify each terminal provider refusal** as transient, exhausted, or ambiguous, by the
   stated-wait rule above.
4. **Render the three absence classes distinctly** on every surface that shows coverage —
   money-halted, health-filtered, entitlement-exhausted — with the counts beside every
   aggregate they were excluded from. A reader asking "why does this column have forty rows"
   must get the answer from the artifact.
5. **Report the exhaustion point as a cost observation**, in whatever unit the plan exposes
   (cases completed, wall clock, the plan's own remaining figure if it publishes one), and
   mark it a **lower bound** — the run stopped, so the target's real appetite is at least
   this and the number is not comparable to a metered target's dollars.
6. **Do not resume into the same plan within the run.** Fail the target's remaining cells to
   entitlement-exhausted immediately once classified, rather than paying the retry ladder on
   every subsequent cell; the ladder's cost is real and it buys a foregone conclusion.

## Decision rules

- **A plan-reached column and a metered column are not commensurable on cost, at any sample
  size.** They can be compared on quality across the cases both completed, and that is the
  paired comparison the statistics subject already requires. The cost axis of the scorecard
  reports them as different units and refuses to rank them, because a ranking would be
  arithmetic over a conversion nobody performed.
- **An exhausted target may not carry a winner claim**, even where its completed cases score
  highest. It stopped for a reason the other columns were not subject to, and the cases it
  did not reach are not a random sample of the set — they are the ones at the end of the run,
  which is where an ordered dataset puts whatever it ordered last.
- **When exhaustion recurs across runs, it is a benchmark design finding, not an incident.**
  The matrix is too large for the plan that reaches it: cut the case set deliberately, split
  the matrix across runs, or move that target to a metered credential. Raising nothing and
  re-running is how a scorecard acquires a column that is permanently three-quarters absent.
- **Never let the plan's ceiling become the run's ceiling.** The quality apparatus governs
  its own spend by explicit consent
  ([quality-apparatus-stays-unbudgeted](../../../_laws.md#quality-apparatus-stays-unbudgeted));
  a plan quota is somebody else's ceiling arriving unannounced, and treating it as the
  budget signal means the run's stopping condition is set by a party with no stake in the
  measurement.

## When not to use it

- **Every target is billed per call.** Then the failure genuinely is health or money, the
  existing two classes are complete, and adding a third produces a bin that never fills.
- **A single-target run.** The correlation argument is what makes exhaustion informative,
  and it needs a matrix to be informative *about*. On one target the halt is still recorded
  and still stops the verdict, but it says nothing comparative.
- **As a reliability score.** Exhaustion counts belong to the account, not to the provider,
  and rolling them into a provider's reliability figure is the exact confusion this technique
  exists to prevent — arriving through the aggregate instead of through the label.
