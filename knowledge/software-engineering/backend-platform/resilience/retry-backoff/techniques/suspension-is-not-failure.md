---
layer: technique
type: technique
subject: retry-backoff
technique: suspension-is-not-failure
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value]
shared_with: []
use_when: [a client exhausts its retries while offline and gives up before reconnecting, deciding whether a blocked attempt counts against the budget, work resumes in a backgrounded tab and nobody wanted it to, distinguishing "the dependency failed" from "we could not reach it to ask"]
---

# Suspension is not failure

The golden path names exactly four terminal states for a retry ladder, and it
is right about all four. What it does not model is the state a ladder can be
in without terminating: **suspended** — the schedule has halted, no attempt is
being made, no budget is being spent, and the work is still alive. Every
terminal state answers "how did this stop for good"; this one answers "why is
nothing happening right now", and a machine that cannot say it will report
either a lie or nothing at all.

The distinction is not academic, because the cheapest way to get this wrong is
also the most common: treat "could not attempt" as "attempted and failed".
A client on a dead network runs its ladder against a precondition that was
never satisfied, burns three attempts against nothing in under ten seconds,
lands in **exhausted**, and is sitting in a dead-letter lane when
connectivity returns four seconds later. The dependency was never asked. The
budget was spent on the *inability to ask*, which is precisely the confusion
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
forbids — the instrument could not run, and its output was recorded as the
instrument's verdict.

**A blocked attempt is not an attempt. It consumes no budget, advances no
ladder position, and produces no error to classify.** Where the four-class
table asks what kind of failure occurred, suspension's answer is that none
did; the classifier is never reached because there is no response to classify.
Recording a suspension as a transient failure fabricates evidence about a
dependency that was never contacted
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

## Suspension and denial look alike and are attributed oppositely

The four terminal states already include **denied** — a breaker refused to
attempt — and it is the state suspension is most often mistaken for, because
both describe "no call left the process". They differ in the two ways that
matter for an operator reading the record:

- **Denial is terminal; suspension is not.** A denied call is over and its
  caller has been answered. A suspended one is still owed a result.
- **Denial is a judgment about the dependency; suspension is a fact about
  the caller.** A breaker denies because the *remote* is failing and load
  should be withheld from it. A ladder suspends because the *local*
  environment cannot currently issue the call at all — no network, no
  credential yet, the process backgrounded, a required lease not held.
  Attributing a suspension to the dependency's health record is how a
  perfectly healthy service acquires an outage in your telemetry every time a
  laptop lid closes.

Spell them differently in the record, and never let a suspension increment a
dependency's failure count.

## The predicate that resumes is stricter than the predicate that starts

The rule that makes this safe is an asymmetry, and it is the part most designs
miss: **the condition for starting work and the condition for resuming it are
different predicates, and resumption's is strictly stronger.**

Starting is user-intent-driven — something was mounted, someone clicked, a
request arrived — and the precondition is only "can this call be made at all".
Resuming is machine-driven: a timer fired, a signal arrived, and nobody is
necessarily watching. So resumption additionally requires that the work still
be *wanted*, not merely possible.

Concretely, an attempt may begin in a backgrounded or unattended context —
the user asked for it before leaving, and the answer should be waiting — while
a *retry* in that same context should wait for attention to return. The
difference is that the first attempt is the one the user paid for; the second
through fourth are the machine's own initiative, and unattended initiative
against a failing dependency is how a fleet of idle clients turns a partial
outage into a full one. Reserve the stricter gate for the attempts nobody
asked for.

Write the two predicates as two named functions. When one function serves both
roles, it is always the *starting* predicate that survives — it is the one the
happy path exercises — and the ladder quietly gains the right to hammer a
dependency from contexts no user is present in.

## Resumption is guarded at the sleeper, not at the waker

A suspended ladder wakes on a signal — connectivity restored, focus regained,
lease acquired — and those signals are noisy, arrive in bursts, and can fire
when the condition has already lapsed again. Putting the check in every
signal source multiplies the predicate across call sites and guarantees they
drift.

Guard the wake-up **where the sleeper resumes**: the suspended work re-tests
its own resumption predicate and goes back to sleep if it is not met. Signal
sources then need no knowledge of the condition, and a spurious wake costs one
predicate evaluation instead of a wasted attempt against a dependency that is
still unreachable. This is the same shape as
[storm-control](./storm-control.md)'s objection to per-site bounds, applied to
wake-ups rather than to attempts.

## What the record must show

Suspension is a state an operator will see and must be able to act on, which
means it needs the same treatment the four terminal states get:

- **A suspended item is distinguishable from a pending one.** Both are
  "not finished"; only one is *waiting on a precondition nobody in the system
  is going to fix by retrying*. Name the unmet precondition in the record.
- **Time suspended is not time spent retrying.** A latency metric that folds
  an eight-hour offline window into a call's duration has destroyed its own
  distribution. Suspended time is excluded from attempt latency and reported
  separately.
- **Suspension is bounded too, but by a different clock.** A ladder may
  suspend indefinitely without harm — nothing is being consumed — but the
  *work* usually has a deadline beyond which its result is worthless. That
  expiry is a property of the work, not of the retry schedule, and when it
  fires the outcome is a terminal state (**exhausted**, with the precondition
  named), not a silent drop.

## Checks

- No code path increments the failure count or advances the ladder on a
  blocked attempt.
- Suspension and denial are separate states in the record, and suspension
  never touches a dependency's health statistics.
- Starting and resuming are two named predicates, and the resuming one is a
  strict superset of the starting one.
- The resumption condition is evaluated by the suspended work itself, not by
  each signal source.
- Suspended time is excluded from attempt-latency reporting.
- Indefinitely suspended work has a stated expiry that ends in a terminal
  state with the unmet precondition named.
