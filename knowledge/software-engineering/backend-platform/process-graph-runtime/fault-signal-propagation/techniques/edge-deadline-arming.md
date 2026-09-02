---
layer: technique
type: technique
subject: fault-signal-propagation
technique: edge-deadline-arming
status: forged
laws: [gate-sees-target, absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [an input that is idle at boot is being declared dead, deciding which party refreshes a staleness clock, a fast transport bypasses the component that enforces a declared timeout]
---

# Arming an edge deadline

A staleness deadline on an input is a promise that a consumer will be told when
that input stops being current. Whether the promise is kept turns on two
questions asked before any threshold is chosen: **when does the clock start**,
and **who is allowed to refresh it**. Both have counter-intuitive answers, and
both failures they prevent are of the same expensive shape — a healthy edge
declared dead.

## The clock arms at the first message

A deadline that begins counting at start-up is measuring a period during which
nothing was owed. The producer may still be initialising. It may not have been
spawned yet — placement, image pull, dependency ordering all take time the
consumer has no view of. It may be a sensor that legitimately publishes on
external stimulus and has not been stimulated. In all three cases the silence is
correct, and a threshold short enough to catch a genuinely hung producer is short
enough to kill all three. Under a restart policy the mistake compounds: every
respawn repeats the cold start, and the deadline fires again on schedule.

So an edge is **unarmed** until its first message and **armed** from then on.
Being unarmed is a distinct, reportable state, not a healthy one
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)): an edge
that has never spoken is not the same as an edge that is current, and a consumer
asking "is this input fresh" gets three answers — never armed, fresh, stale —
not two.

The process side of this rule is stated by the neighbouring supervision subject,
in
[liveness-and-heartbeats](../../../../llm-agent/runtime-and-io/subprocess-lifecycle/techniques/liveness-and-heartbeats.md):
the stall clock arms at first contact, the pre-contact window gets its own
separate time-to-first-contact deadline, and which deadline fired is recorded
because "never connected" and "went silent" route to different repairs. That
statement is not repeated here. What the edge side adds is **granularity**: the
arming state is per edge, not per process. One producer with two outputs may
have spoken on one and never on the other, and only the second is unarmed —
which is precisely the wiring fault a per-process clock cannot see, because the
process is demonstrably alive.

## The deadline belongs to a channel that promised continuity

Only put a staleness bound on an edge whose contract is periodic — a sensor
stream, a state broadcast, a heartbeat topic. On a request-shaped edge, a
natural idle interval between requests is byte-identical to a dead upstream, and
the detector becomes a false-alarm generator whose alarms consumers learn to
ignore. Request-shaped exchanges are bounded per outstanding request instead:
one deadline per wait, not one timer per channel.

## Refresh ownership decides which transport the edge may use

A deadline is refreshed by the party that observes messages arriving on the
edge. That party is a *place in the path*, and the moment a system has more than
one path, this stops being bookkeeping and becomes a routing constraint.

A high-throughput system typically grows a fast path that lets a producer hand
payloads to a consumer directly, leaving the brokering component to see only
lifecycle traffic. That component is usually also the one refreshing edge
deadlines. Put the two facts together and a consumer that declared a deadline on
an edge which then takes the fast path has a timer nobody is refreshing: it
expires on schedule while data flows perfectly, and the consumer is ordered to
degrade in the middle of a healthy run. Nothing looks broken at either end,
which is why this is expensive to find.

The resolution is fixed and runs in one direction only:

> **A declared deadline demotes the transport. The transport never demotes the
> deadline.**

An edge carrying a staleness bound is pinned to the path whose observer refreshes
it. The fast path is an optimisation and the deadline is a stated safety
requirement, and an optimisation that silently disables a stated requirement is
the textbook
[absent guard](../../../../_laws.md#absent-guard-is-loud) — it protects the
configurations nobody optimised and stops protecting the ones that mattered
enough to tune. If the demotion's cost is unacceptable for a particular edge, the
answer is to remove the deadline deliberately and record that removal, never to
keep a deadline that no longer measures anything.

The same law of observation governs the refresh point itself: the refresh must be
triggered by an *arrival at the consumer's side*, not by a send at the producer's
([gate-sees-target](../../../../_laws.md#gate-sees-target)). A deadline refreshed
on send is green throughout a total delivery outage, which is the one condition it
exists to catch.

There is one honest compromise, and it needs its guard stated. Where a producer
takes a direct path and the only signal the deadline's owner receives is the
producer's own *"I sent"* notification, that notification is not a delivery
confirmation — the consumer's receive side may be dropping payloads at admission
while the producer publishes happily. Refreshing from it unmodified makes the
deadline unfireable for precisely the slow consumer it should have caught. If the
notification is all there is, **gate the refresh on independent evidence that the
receiver is keeping up** — its own queue's free capacity is the usual proxy, and
a receiver with no live stream at all counts as not keeping up, never as absent
evidence. The refresh then tracks a fact about the consumer rather than a claim
by the producer.

## Decision rules

- **Arm on the first message — and a recovery *is* a first message.** Because a
  recovery is only declared when a payload has actually landed, the recovered
  edge's deadline arms at that payload; there is no unarmed window after a
  recovery, and an implementation that reopens the edge unarmed has invented one
  in which the edge can never time out again.
- **Disarm on close, and drop the deadline record with it.** A deadline left
  behind on a closed edge fires later against an edge that no longer exists,
  manufacturing a spurious broken state for it. Where a broken state is what
  blocks the graph's terminal verdict, that spurious record blocks it *forever*
  and the consumer is eventually killed as a straggler — a hang whose cause is
  three steps upstream of where it is observed.
- **Record which bound fired.** Never armed, expired-while-armed, and closed-by-
  producer-exit are three different diagnoses. Collapsing them into "input
  timeout" sends an operator to inspect a producer that was never scheduled.
- **The bound is per edge and declared by the consumer that reads it.** The
  consumer knows its own tolerance; a global default is a number chosen by
  whoever wrote the runtime, applied to a graph they have never seen.
- **Size the bound from the edge's declared period, not from a round number.** A
  bound at a small multiple of the expected interval catches a real stall; a
  bound picked because it looked generous catches nothing until well past the
  point where degrading would have helped.

## When not to use this

Do not put a deadline on an edge whose producer publishes on demand or on
external events — use per-request bounds.

Do not put one on an edge the consumer cannot act on: a deadline whose expiry
leads to no designed degraded mode produces an event that gets logged and
ignored, and the logging costs more than it returns.

Do not put one on an edge whose expected period is unknown at design time.
Measure first; a deadline chosen before the period is known is a guess dressed
as a safety requirement, and it will be tuned during an incident by someone with
worse information than you have now.
