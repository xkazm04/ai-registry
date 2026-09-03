---
layer: technique
type: technique
subject: measurement-honesty
technique: unelidable-measurement
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [building a harness that measures the cost of doing work, a measured cost is implausibly good and nobody can explain why, deciding what a timing or work-count harness must do with the result it computes, a measurement improved by orders of magnitude after a refactor that changed no algorithm]
---

# The measured work must be unremovable by the thing that optimizes it

The seven states of a datum treat the instrument as a passive reader: it looks,
and either sees something, sees nothing, cannot see, or has been contaminated
by what it looked at. This is an eighth mechanism and it is structurally
different from all of them, because here the instrument does not merely observe
the subject — **it hosts it**.

Any harness that measures the cost of performing work runs that work inside a
system entitled to remove work whose result nobody observes. Compilers do this;
so do query planners, build systems, layout engines, caches, and lazy
evaluators. The entitlement is correct and desirable everywhere except here.
The harness asks the subject to do the work, discards the result because the
harness only wanted the cost, and the optimizer — reading the discard — deletes
the work. What gets measured is the cost of *not doing the work*.

## Why this is not the compromised state

State 7 is contamination *of* the subject: the subject met the instrument
before it was measured, so the value is invalid even though everything about
the measurement was clean. It is a fact about a relationship formed in the
past, and it is detectable only by a second instrument the subject has not met.

This is contamination *by* the harness, in the present, mechanically. The
subject is innocent. The instrument is correct. The number is produced by a
faithful measurement of a program that is not the program under test, because
the act of measuring it — specifically, the act of not using the result —
changed which program ran ([_laws:
gate-sees-target_](../../../../_laws.md#gate-sees-target)). Unlike state 7, it is
detectable from inside the system, cheaply, and it is repairable by changing
the harness rather than by finding a new instrument.

## The signature

The failure renders as an **implausibly fast, perfectly well-formed number**.
No error. No warning. No absent input, no short denominator, no failed
collector, nothing to reconcile against. The value has the right type, the
right units, and a plausible number of digits; it is simply two or three orders
of magnitude better than the work could possibly be done in. It passes every
technique in this subject, because none of them examines whether the work
happened.

Two things make it survive review. First, a fast number is the number everyone
wanted, and nobody audits good news. Second, the elision is usually partial and
conditional — it appears when the result is discarded, disappears when a later
edit happens to use the result, and moves when the optimization level changes.
So the metric's history shows large unexplained steps that correlate with
refactors that changed no algorithm, which reads as noise rather than as the
diagnosis it is.

This is [_laws:
failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success) in an
unusual costume: the instrument did not fail to run and it did not find
nothing. It succeeded at measuring an empty program, and empty-program success
is spelled identically to real success.

## The repair: make the result observable to the optimizer

The harness's obligation is to ensure the subject's result is **consumed in a
way the optimizer cannot see through**. The general mechanism is an opaque
sink: a construct whose contents the optimizer is required to treat as unknown,
so the value handed to it must actually be computed. Every measurement
environment that measures cost has one, under some name, and a harness that
does not use it is not measuring the thing it claims to.

Three rules make the repair reliable:

1. **Both ends need it, not just the output.** The result is fed to a sink so
   the computation cannot be deleted; the *input* is fed through a sink so the
   computation cannot be folded into a constant at build time. A harness that
   guards only the output still measures a constant lookup whenever its inputs
   are literals in the harness source.
2. **The instrument asserts its own liveness.** A measurement that could
   plausibly be zero-cost is checked against a floor derived from the work it
   claims to have done — a per-operation cost that cannot be beaten, a count of
   operations that must have been performed. A run below the floor is reported
   as an instrument fault, not as a record-breaking result. Without this, the
   defect is caught only by someone who happens to find the number too good,
   which is a person, not a mechanism.
3. **The predicate travels.** A cost number carries the statement that its
   result was observed, in the same place it carries its sample count and its
   noise band. "Measured with the result consumed through an opaque sink" is
   part of what the number means, and a series that changes this mid-history is
   not one series.

The same discipline reaches beyond timing. Any harness whose subject is *work*
rather than *output* is exposed: a memory-pressure measurement whose
allocations are never touched, a serialization cost whose bytes are never read,
a cache benchmark whose lookups are provably pure. In each case the question is
identical — can the system under measurement tell that nobody wants the answer?

## When not to force observability

**Where the optimizer's elision is itself the behaviour under test.** If the
subject is a build step that removes unreachable code, a bundler measured on
how much it strips, a compiler pass measured on what it folds away, or a lazy
pipeline measured on how much it declines to evaluate — then forcing the result
to be observed disables exactly the mechanism being measured. The harness would
report a program the product never ships, and the number would be honest about
a thing nobody runs.

The distinction to write down at the harness's front door: **is the work the
subject, or is the removal of the work the subject?** Where the work is the
subject, the sink is mandatory. Where the removal is the subject, the sink is
forbidden and the measurement's honesty problem is the opposite one — the
harness must show that the work *would* have happened, by measuring the same
program with the elision disabled and publishing the pair.

A third case sits between them and is worth naming so it is not resolved by
accident: a product whose shipped configuration lets the optimizer elide the
work, measured to decide whether the work is affordable. There the honest
answer is two numbers with two predicates — the cost when the result is used
and the cost as shipped — because a single figure will be read as whichever one
the reader was hoping for.

## Decision rules

- Any harness that measures the cost of work consumes the result through an
  opaque sink, and passes its inputs through one too.
- Give every cost measurement a floor derived from the work it claims to
  perform; a result below the floor is an instrument fault, never a finding.
- Treat an unexplained order-of-magnitude improvement that no algorithm change
  accounts for as elision until proven otherwise — check the harness before
  celebrating.
- Record "result observed" as part of the number's predicate, and break the
  series when it changes.
- Where the elision is the subject, do not force observability; publish the
  elided and non-elided measurements as a pair.
