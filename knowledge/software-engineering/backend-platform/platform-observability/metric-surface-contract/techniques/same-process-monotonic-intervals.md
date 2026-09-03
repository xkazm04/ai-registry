---
layer: technique
type: technique
subject: metric-surface-contract
technique: same-process-monotonic-intervals
status: forged
laws: [unknown-is-not-a-value, verdict-survives-boundary]
shared_with: []
use_when: [publishing a duration or a queue-wait metric, deciding whether a component ships events or durations, a latency series goes negative or jumps after a clock sync]
---

# Same-process monotonic intervals

A duration is a difference of two timestamps, and the difference is only
meaningful if the two timestamps are commensurable. Two clock families are
available and each fails a different way:

- A **wall clock** names an instant everyone agrees on, and it is not
  monotone. Time synchronisation slews it, steps it, and occasionally moves it
  backwards; virtualised hosts jump it on migration. Subtracting two wall
  readings yields durations that are wrong by the correction, and sometimes
  negative — a defect that appears in production, in bursts, on the days the
  clock was worst.
- A **monotonic clock** never goes backwards and is therefore the right
  instrument for a duration — but it counts from an **arbitrary reference
  point that belongs to one process**. It is not an instant; it is an offset
  from an origin nobody published. Two monotonic readings from two processes
  are two numbers with two different zeroes, and their difference is a number
  with no meaning at all, though it will look entirely plausible and will
  never be flagged by any type system.

Hence the rule, which is short and load-bearing: **an interval is computed
from two monotonic readings taken by the same process, or it is not computed.**

## The architectural consequence

That rule cannot be satisfied at the aggregator by being careful. If the
component that owns a transition is the only one that can stamp it with its
own monotonic clock, then **the owning component stamps the transition and
ships it as an event**, and whatever aggregates metrics derives intervals from
the events it received. The alternative — a central collector reconstructing
durations from the moments it happened to observe — is what the rule forbids,
and the reason is not clock hygiene but visibility.

**Teach the rejected alternative, because it is what makes the rule legible.**
A front half of a system can see a request arrive and a first result come
back; it is genuinely tempting to compute every latency there, since it needs
no new event vocabulary and no change to the hot path. What it cannot see are
the transitions that happen entirely inside the back half: the moment work was
admitted to a queue versus the moment it was actually scheduled, and the
moment running work was displaced by something with higher priority and had to
wait again. Those phases are invisible from outside, so a reconstruction does
not merely lose precision — it **assigns their duration to whichever visible
phase it can reach**, and reports queueing time as processing time, or hides a
displacement entirely inside a total that looks unremarkable. The number is
not approximate, it is a confident answer to a question the reconstructor
could not observe: unknown rendered as a definite value
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

A system that considered this alternative and wrote down *why* it was rejected
— naming which of its transitions are invisible downstream — has produced the
most useful artifact available here. Whoever proposes the reconstruction again
next year will find the answer instead of relitigating it.

## The event vocabulary

The owning component's obligation is a small, closed set of transition events,
each carrying the monotonic stamp taken at the moment it occurred, attached to
whatever the component already returns:

- **arrived / accepted** — the work became this component's responsibility.
- **started** — it began consuming the resource that matters.
- **displaced / resumed** — it lost and regained that resource. Emit both, or
  the interval between them lands somewhere it did not happen.
- **progressed** — a unit of output was produced, for systems where the
  interesting latency is to the *first* unit and between subsequent ones.
- **finished**, with its outcome as a typed value, so downstream can branch on
  success versus each named failure
  ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary))
  rather than inferring it from the absence of a subsequent event.

Rules for the vocabulary itself:

1. **Closed and centrally defined.** Consumers of these events partition
   durations by phase; a phase invented ad hoc in one code path produces
   intervals that no longer sum to the total.
2. **Every interesting interval is a difference of two members of the set.**
   If a duration a consumer wants cannot be expressed that way, the vocabulary
   is missing an event — add the event, not a pre-computed duration.
3. **Emit both ends or neither.** A start with no matching end leaves an
   interval that is open forever; the aggregator must be able to distinguish
   "still running" from "we lost the end", and both from zero.
4. **State the attribution rule for interrupted work up front.** When work is
   displaced and later resumes, exactly one question decides every affected
   interval: does the phase clock **restart at the latest start event, or does
   the displacement stay inside the interval it interrupted**? Both are
   defensible — restarting reports the phase as it was finally executed,
   including it reports the phase as the caller experienced it — and the two
   produce visibly different distributions for the same system. Pick one, write
   it beside each interval's definition, and check the implementation agrees
   with the prose; this is the single place where a document and its code most
   commonly drift apart while both look right.

5. **Anchor a user-facing interval where the user's clock starts, not where
   the internal event fires.** The time to a first result belongs to the
   caller, and the caller's clock started at arrival — before parsing,
   validation, or any preprocessing the inner component never saw. Measuring it
   from the internal start event publishes a number that is systematically
   better than the experience, and the discrepancy grows with exactly the
   preprocessing work nobody is watching. The same-process rule still binds:
   both stamps for that interval are taken by the boundary component, which is
   the one that can see arrival. So a mature surface carries **two families** —
   caller-anchored intervals stamped at the boundary, and internal phase
   intervals derived from the owning component's events — and never quietly
   substitutes one for the other.

## Decision rules

- **When both stamps are taken by one process, compute the interval there and
  publish the duration.** No event shipping is needed and none should be
  added.
- **When the two stamps belong to different processes, ship both events and
  derive the interval where they meet.** Deriving in one of the two processes
  from a foreign monotonic reading is the exact failure the rule names.
- **When only a wall-clock interval is available across a boundary** — you are
  correlating two hosts and there is no other option — publish it as a wall
  interval, label it as one, and never mix it into the same series as
  monotonic durations. Two clock families in one series is a series with no
  error bar.
- **When an event is invisible to the component doing the derivation, that
  component must not derive across it.** Publish what is observable, with the
  phase boundaries it can actually see named in the metric.

## When not to use this

- **Coarse durations far above the clock-correction magnitude** — a job that
  runs for hours, reported to the minute — survive wall-clock subtraction, and
  the operational value of a comparable absolute timestamp may outweigh the
  precision. Say which clock was used.
- **When the boundary you care about is between a producer and an ingesting
  collector**, the problem is skew between two independent clocks at ingest;
  that reconciliation is its own discipline and it does not repeal this rule
  for the durations measured inside a single process.
- **A single-process system with no hot loop and no phases worth splitting**
  does not need an event vocabulary; one timer around the operation is the
  whole design.
