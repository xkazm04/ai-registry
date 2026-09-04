---
layer: technique
type: technique
subject: metric-surface-contract
technique: fault-localizing-metric-set
status: forged
laws: [count-carries-predicate, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [instrumenting a multi-stage pipeline, a metric proposal cannot name the decision it changes, an incident resolved to "somewhere in the pipeline", deciding whether a stage that emits work needs its own counter, a dashboard shows a healthy consumer and an unhappy customer]
---

# The fault-localizing metric set

The admission bar this subject sets is per-metric: a quantity is published when
someone can name the decision it changes and the reader who will make it. The
bar is correct and it has one blind spot, which is where most of the diagnostic
value of a metric surface is lost.

**Diagnosability is a property of the set, not of any quantity in it.** The
question an operator actually asks is not "what is this number" but "which
stage broke", and that question is answered by the *shape of the whole surface*
— whether the stages are covered in order, and whether each stage's numbers can
be read against its neighbours'. A metric that answers no question on its own
can be the one that makes the set answer that one, and the per-metric bar
cannot see it, because the argument for it lives one stage downstream.

## The metric that only pays when it reads zero

The clearest case is a **producer counter**: the count of work a stage emits.
Considered alone it is redundant — the next stage's intake counter already says
how much arrived, and in the healthy case the two agree, so the producer
counter is a duplicate that costs cardinality and adds nothing.

Its whole value is in the unhealthy case, and it is the value the duplicate
argument hides. When the consumer's intake reads zero, exactly two situations
produce that number and they need opposite responses: *nothing was submitted*,
or *something was submitted and did not arrive*. Without the producer's count,
zero is
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) rendered
as a value — an operator reading a quiet consumer cannot tell an idle system
from a broken hand-off, and the usual outcome is hours spent on the consumer
because the consumer is what the dashboard shows.

The general form: **when a stage's silence is ambiguous, the resolving quantity
is emitted by the stage before it.** Instrument the emitting side of every
hand-off — the decision that selected the work, the enqueue and its result,
the submission's outcome — and downstream starvation becomes attributable
instead of mysterious. An enqueue failure in particular is real loss and must
be counted as an outcome at the point it happens; discovering it later as an
absence is discovering it too late.

## Split a duration wherever the two halves have different owners

The same argument applies to timings, and the split is not decorative. An
end-to-end latency that crosses a queue is two quantities with two remedies:
the wait before pickup, which is a capacity problem, and the work after
pickup, which is a code or dependency problem. Published as one number they are
indistinguishable, and the number rises identically under both — so the surface
reports that something got slower and withholds the only bit that decides who
looks at it.

Publish both terms and let end-to-end be the sum, which is
[export-terms-not-ratios](./export-terms-not-ratios.md)'s rule applied to a
decomposition rather than a quotient: the emitter owns the split it is the only
party that can see, and the consumer composes. The test for whether a duration
needs splitting is not statistical, it is organizational — **if two different
people would be paged by the two halves, they are two metrics.**

## Cover stages in order, and say what order that is

A set that covers stages one, two and four is not three-quarters of a
diagnostic surface; it is a surface with a hole that only reveals itself during
an incident, when the operator reaches the gap and starts guessing. The
construction is mechanical:

1. Write the pipeline's stages in flow order, each with its input, its output
   and its failure mode.
2. Give every stage the same skeleton — a throughput count, an error count
   dimensioned by failure category, a duration for the work it does — so a
   reader moving down the list is comparing like with like.
3. Give every hand-off between stages a producer-side count of what was emitted
   and with what result.
4. Add a level (a gauge or a signed in-flight counter) only where a quantity
   rises and falls and cannot be reconstructed from the counts, which is
   normally backlog and in-flight work.

The payoff is that a reader with no knowledge of the implementation can walk the
surface top to bottom and stop at the first stage whose numbers break. That is a
testable property, and it is worth testing the way any contract is: take a past
incident, walk the current surface in order, and find the stage it localizes to.
An incident the surface cannot localize is the gap's own bug report.

## The entrypoint is a stage, and mistaking it costs the most

The front door — the ingest route, the submission API, the trigger — is the
stage most often left to a generic framework metric and least often read as
part of the set. It is also the one whose failure most resembles a downstream
failure: work that was rejected at the door and work that was accepted and lost
inside both present as *the customer's results are missing*. Measure the
entrypoint with the same skeleton as every other stage, with its errors broken
down by failure category, so an intake problem is never diagnosed as a
processing problem.

## What this does not license

The per-metric bar still binds, and this technique is not a permit to publish a
pipeline's full internal state:

- **The set is the unit of the argument, not the excuse.** A quantity admitted
  under this technique carries a *stated* set-level role — "this resolves the
  ambiguity in stage N's zero" — and a proposal that cannot name the ambiguity
  it resolves has not met this bar either, it has evaded the other one.
- **Cardinality is still bounded, and stated as a product.** Every identity
  label multiplies every series in the set, so the set-level argument is exactly
  where an unbounded label does the most damage. Write the bound as the product
  of its dimensions' domains, and refuse any dimension whose domain is not
  enumerable.
- **A benign count is labelled benign.** Sets acquire quantities that look like
  loss and are not — a poll that found nothing, a skipped tick on a busy
  consumer. Describe them as benign on the surface itself
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)); an
  operator who has to learn which of the error-shaped numbers are harmless
  learns it during the incident.

## Decision rules

- Argue a metric at the set level when its value is that it disambiguates
  another stage's number, and state which ambiguity.
- Instrument the emitting side of every hand-off; a consumer's zero must never
  be the only evidence about it.
- Split a duration wherever its halves would page different people.
- Cover stages in flow order with one skeleton, and validate the surface by
  replaying a past incident against it.
- Treat the entrypoint as a stage of the pipeline, not as framework furniture.
- Bound cardinality as a product of enumerable domains, and mark benign counts
  benign on the surface.
