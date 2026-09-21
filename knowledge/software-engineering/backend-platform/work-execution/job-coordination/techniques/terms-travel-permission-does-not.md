---
layer: technique
type: technique
subject: job-coordination
technique: terms-travel-permission-does-not
status: forged
laws:
  - one-authority-per-vocabulary
  - gate-sees-target
  - unknown-is-not-a-value
  - record-precedes-effect
shared_with:
  - delivery-guarantees
applied: code
ab_verdict: better
use_when: [a deferred pass judges its input against a threshold an operator can edit while the queue drains, deciding whether a stop switch or a quota should be frozen into the work or read live at execution, a consumer re-derives the class or route the producer already decided, a verdict about finished work is computed from the current row instead of from what the run recorded, a flag changed during a long turn and the output was assembled from two configurations, a configuration change had to wait for the queue to empty before anyone trusted the results, deciding what a queued record must carry beside its payload]
---

# Terms travel with the work; permission does not

A unit of work that is submitted now and executed later crosses a boundary nobody
draws: between the two moments, the configuration the system runs under can change.
The record survives the gap by design — that is this subject's whole stance — but the
*world the record will be executed in* is not part of the record, and it is read fresh
by whoever drains the queue. So the work is submitted under one set of terms and
performed under another, and no field anywhere says that happened.

The corpus already freezes configuration at one boundary: a composite built,
validated and normalized once at the outermost edge and then treated as immutable
engine state
([one-config-object-as-engine-state](../../../inference-serving/serving-process-topology/techniques/one-config-object-as-engine-state.md)),
and the same instinct applied to a tuning knob that must not move between two sends
of one stream
([size-threshold-by-page-cost](../../../process-graph-runtime/data-plane-transport-selection/techniques/size-threshold-by-page-cost.md)).
Both freeze at **process** scope, and both are correct for what they govern: a
description of the deployment. Neither reaches the value that legitimately changes
while the process lives — the threshold an operator tunes, the routing table a
release edits, the flag a rollout flips, the instrument a benchmark switches to. That
value has no frozen boundary at all, and the unit of work is the boundary it needs.

## The split is not "freeze everything"

The instinct, once the defect is visible, is to snapshot the whole world at
submission and carry it. That is wrong, and the reason is the part worth building:
some late-bound state exists *precisely* in order to affect work already in flight.
An operator's stop switch that was evaluated at enqueue is not a stop switch. A lease
that was checked once cannot prove its holder is still alive. A quota frozen an hour
ago authorizes spend nobody still has.

So there are two classes, and they get opposite treatment:

| | **Terms** | **Permission** |
| --- | --- | --- |
| what it is | what the work *means*: the bar it will be judged against, the class or route it was assigned, its parameters and budget, the policy version, the instrument that will produce its result | whether the work *may proceed at all*: the stop switch, the cancellation signal, the lease, the quota at the instant of the effect, the authorization |
| when it is bound | at submission, written into the record | at execution, read live, as late as possible |
| what a change means | the submitted unit is stale, and saying so is the only honest move | the unit stops, or narrows, now |

**The discriminator is one question, and it is mechanical:** *if this value changed
between submission and execution, do I want the unit to run under the old value, or
do I want it to stop?* Run under the old value — it is a term, freeze it. Stop — it
is permission, read it live. A value where the honest answer is "I want it to run
under the new value" is neither, and it is the answer to interrogate: it almost
always means the result will later be compared against something, and nobody has
noticed that the comparison spans two configurations.

Two corroborating forms of the same test, useful in review:

- **Direction of effect.** A value that can only ever *narrow* the work — deny,
  cancel, shed, refuse, cut short — is safe to read live, because the worst a fresh
  read can do is produce less work than was authorized. A value that changes the
  *content or meaning* of the output must be frozen, because a live read there
  produces a result that cannot be attributed to any policy
  ([gate-sees-target](../../../../_laws.md#gate-sees-target): a verdict computed
  against a configuration the work did not run under is a check over a proxy).
- **What the result is compared against.** Follow the unit's output to the place it
  is subtracted from, ranked against, or gated by something else. Everything that
  appears in that comparison is a term, on both sides of it. This is the form that
  catches the case the first question misses, because the comparison usually happens
  in different code, written by someone who never saw the queue.

## Carrying the decision is not enough: the consumer must not be able to re-derive it

A producer that classifies the work and writes the class into the record has done
half the job. The other half is that **the code path which derives the class does not
exist on the consume side.** If the consumer can recompute the route from the payload,
it eventually will — as a fallback for a missing field, as a "sanity check", as the
fast path somebody added when the field was not yet populated — and from then on a
table edit re-routes messages that are already queued. The two halves of one
submitted batch then land in different places and nothing distinguishes them
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
the classifier is one authority, and a copy on the consume side is a race with a
delay fuse). The consumer reads the field, or it refuses the record; it does not
compute.

Refusal is the part that makes the design work. The record carries the **version** of
the policy its terms were frozen under, and a drainer that cannot honour that version
fails the unit with a reason rather than re-deciding it under the current one. This is
what makes an operator's change take effect by *invalidating* in-flight work instead
of silently redefining it — and it is the missing premise of a rule this subject
already states: restart-from-zero is the correct verdict when "the plan version
changed and no honest migration of position exists"
([step-position-and-resumability](./step-position-and-resumability.md)), which can
only be *read* off a record that says which version it was submitted under.

## Absence is not disagreement

Every system that adds the pin has records that predate it. Those records carry no
term, and a predicate that reads missing as *changed* refuses every one of them at
once — which converts a correctness improvement into an outage of the verdict itself.
An absent term is unattributed work: not agreement, not drift, its own state, and it
is named as such wherever the comparison is reported
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The fix for
an unattributed backlog is to re-establish the comparison, not to widen the
predicate until it stops complaining.

## Where this sits against the two rules it looks like it contradicts

**Against re-reading at the effect.** The freshness discipline says the opposite
thing in the same words: re-read the authoritative state as the last statement before
the irreversible step, because a verdict ages across the whole preparation
([preparation-is-the-staleness-window](../../concurrency-guards/techniques/preparation-is-the-staleness-window.md)).
The two do not collide, because that re-read is a **permission** read — is this still
owed, still permitted, still unpaid — and that technique already forbids the other
use in its own domain: the fresh read may refuse, and it may widen a lock set, but it
may never swap the payload an operation identity has already promised. This technique
is the general form of that prohibition, and it is the half that decides *which
values may be read at the effect at all*. One says where a live read belongs; this one
says what may be read there. A design that takes the freshness rule without this one
re-reads the threshold too, and produces a fresh verdict about work nobody submitted.

**Against markers.** This is not a marker rule. A completion marker is written after
the effect and may cover only what was acknowledged
([marker-certifies-what-was-done](../../delivery-guarantees/techniques/marker-certifies-what-was-done.md));
the terms are written before the effect and describe what was authorized
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)). Both are
records at opposite ends of the same unit, and the defect here is the mirror image of
the marker defect: not a record that claims more than the run did, but a record that
claims less than the run needs — it says what was done and not what it was done
under.

## What over-freezing costs, so the correction is not a new defect

A queue whose terms never expire is a time capsule: units submitted under a policy
everyone has since rejected still execute under it, correctly and uselessly, and the
operator's edit appears to have done nothing. That is a real failure and it is the
reason the split has a third piece — **a submission's terms carry a validity, not
only a value.** Past the floor the operator sets, the drainer refuses and says which
version it refused, so the change lands as a visible invalidation. The three states
are then distinct and all of them are readable: executed under the terms it was
submitted with, refused because those terms are no longer honoured, and unattributed
because it carries none.

## Decision rules

- At submission, write into the record everything the work will be *judged* by: the
  threshold, the class or route, the parameters and budget, the instrument, and the
  version of the policy all of them came from.
- At execution, read live everything that can only stop or narrow the work: the stop
  switch, cancellation, the lease, the quota at the instant of the effect.
- Apply the question to every value in the drain path: old value, or stop? A third
  answer means a comparison downstream spans two configurations — find it.
- Delete the consumer's ability to derive a frozen decision. A fallback that
  recomputes the route when the field is missing is the defect with a helpful name.
- A drainer that cannot honour a record's policy version refuses the unit with a
  reason; it never re-decides under the current version.
- Treat an absent term as unattributed, never as agreement and never as drift, and
  report it as its own state at the place the comparison is made.
- Give a submission's terms a validity floor, so an operator's change invalidates
  in-flight work loudly instead of being outlasted by the queue.
- The test sits on the success path and needs no crash: change the value between
  submit and drain, and assert that the unit's result names the configuration it was
  produced under. A suite that only kills the executor tests a different technique.
