---
layer: golden-path
type: golden-path
subject: fault-signal-propagation
status: forged
use_when: [an upstream producer failed and its consumers must be told inside the channel they already read, designing the event vocabulary a data edge carries beside payloads, deciding what a consumer may do while an input is stale, a restarted producer left in-flight work orphaned downstream]
techniques:
  - typed-edge-events-in-band
  - edge-deadline-arming
  - recoverable-vs-closed
  - last-value-degradation
  - restart-notification-scope
  - no-synthetic-terminal
---

# Fault-signal propagation across a process graph

When long-lived processes are joined by declared data edges, a fault is never
local. A camera driver crashes; a fusion stage upstream of a planner loses one
of its four inputs; the planner keeps publishing as though nothing happened,
because from where it sits nothing *did* happen — messages simply stopped
arriving on one channel, which is exactly what an idle channel also looks like.
This subject owns the machinery that closes that gap: **telling a consumer,
inside the data channel it already reads, that an upstream edge went stale, came
back, or that its producer was restarted — and stating what the consumer is
entitled to do with that.**

The asymmetry is the whole problem. Somebody already knew. The supervisor saw
the exit status, ran the restart, watched the deadline expire; it holds a fact.
If it keeps that fact to itself, every consumer downstream reconstructs it from
absence, and absence is the weakest evidence in the system. Each consumer picks
its own timeout, none of them can know the right threshold, and they are wrong
in different directions on the same incident: one declares a healthy 1 Hz edge
dead, another waits four minutes on a producer that died in the first second.
**A consumer's timeout is a private re-derivation of a fact the supervisor
already had.** Propagation exists so that re-derivation is unnecessary.

## The boundaries with the neighbouring subjects

[Subprocess lifecycle](../../../llm-agent/runtime-and-io/subprocess-lifecycle/subprocess-lifecycle.md)
owns one supervisor and one child: the spawn contract, the slot, the stall
detector, the ceiling, the termination ladder, the reap. Everything it knows, it
knows about a process it started. This subject begins at the moment that
supervisor has a verdict and *other* processes downstream have a stake in it —
it owns the delivery of the verdict, its vocabulary, its audience, and the
consumer's licence to degrade. The two subjects share exactly one rule, and
share it deliberately: a liveness clock arms at first contact, never at spawn.
The process side of that rule is stated over there, in
[liveness-and-heartbeats](../../../llm-agent/runtime-and-io/subprocess-lifecycle/techniques/liveness-and-heartbeats.md);
the edge side is stated here, and cites it rather than repeating it.

[Retry and backoff](../../resilience/retry-backoff/retry-backoff.md) owns what a
**caller** does after its own call failed: classify the failure, space the next
attempt, trip a breaker, spend a budget. Nothing in this subject makes an
attempt. The rule a reader uses is the direction of the arrow: if you are
deciding whether to *call again*, that is retry's subject; if you are being told
that something you *passively read* has gone quiet, come back, or been replaced,
it is this one. The two compose in one direction only — an edge event is
legitimate evidence to feed a breaker, and the breaker still lives over there.

[Self-healing](../../resilience/self-healing/self-healing.md) owns the machine
diagnosing a failure and *changing the world* to fix it. This subject changes
nothing: it reports a fact and hands a consumer a bounded set of degraded modes
designed in advance. Degrading is not repairing, and a design that lets
propagation drift into remediation acquires a healer nobody scoped, with none of
that subject's consent, blast radius or effectiveness accounting.

## The stance: supervision facts are typed, in-band, and addressed

Four commitments carry this subject, and each one is a rejection of a design
that looks simpler and costs more.

**One, the fact travels in the data channel.** A supervision event arrives in
the same stream, in the same order relation, as the payloads it is about. This
is not a convenience — the ordering *is* the information. An out-of-band
notification races the data path, and when it wins the race the consumer marks
an edge dead while three good messages are still in flight behind it, or
attributes post-restart values to the pre-restart producer. Deliver the fact
where the data is, and "everything before this event came from before the
failure" is true by construction.

**Two, the vocabulary is closed and small.** Four events cover the ground: an
edge closed, an edge recovered, a producer restarted, and every input closed.
They are not log lines and not a generic "something changed, go look" — the
consumer branches on them, so they are typed values that survive to the
outermost consumer that acts
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)), with
one authority over the enum rather than one definition per language binding
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).
A binding that cannot express an event kind does not get to drop it quietly; it
is an unfinished binding, and the gap is stated.

**Three, only facts are admitted.** An event says what the supervisor observed —
this edge's deadline expired, this producer exited and was respawned, this
producer reached a terminal state. The moment a supervisor starts publishing
inferences ("the upstream is probably degraded"), consumers inherit a threshold
they cannot see and cannot tune, and the transition they *could* have branched on
is buried underneath it.

**Four, the audience is derived, never listed.** Each event goes to exactly the
consumers that read the affected edge, computed from the routing table the runtime
already maintains to move the data. A hand-maintained notification list is a
second copy of the topology and drifts from it on the next change; a broadcast is
worse, because it teaches every consumer to filter out facts about strangers and,
on the day of a restart storm, to filter out the one that mattered.

## The four events, and what each one licenses

| Event | The supervisor observed | The consumer may |
|---|---|---|
| **edge closed** | this input's producer is gone, or its deadline expired with the edge unrefreshed | drop to a degraded mode for that input, on cached state, with the age visible |
| **edge recovered** | data is flowing on this input again, and the delivery landed | re-arm, clear the degraded mode, treat the cached value as superseded |
| **producer restarted** | this producer exited and a new instance now holds its outputs | reset per-producer caches, abandon in-flight exchanges against it, re-negotiate anything it had agreed |
| **all inputs closed** | every input of this consumer is closed *for good* | finish: this is the terminal verdict, and the only one |

Two distinctions in that table are the ones implementations collapse and then
pay for. The first is that **broken is not closed.** An edge whose producer is
mid-restart is broken and expected back; an edge whose producer reached a
terminal state is closed. Only the second counts toward the all-closed verdict,
and a broken input *blocks* it — otherwise a consumer exits during its
upstream's restart window and the graph loses a healthy participant to a
transient fault, which is the quietest way ever devised to make a recoverable
failure permanent. The second is that **recovery is proven by delivery, not by
attempt.** A producer that resumed sending has not recovered the edge if the
consumer's queue is saturated and nothing is landing; announcing recovery on the
send side reports the gate's proxy rather than its target
([gate-sees-target](../../../_laws.md#gate-sees-target)), and the consumer clears
a degraded mode it is still in.

## The deadline question comes before the deadline

Every consumer that declares a staleness bound on an input has already made two
decisions it usually did not notice. The first is *when the clock starts*, and
the answer is at the edge's first message, never at start-up: a producer may
still be loading, may not have been spawned yet, may legitimately publish once a
minute, and silence measured from an instant when nothing was owed converts
every cold start into a fault — under a restart policy, into a loop. The second
is *who refreshes it*, and this one reaches further than it looks. A deadline is
refreshed only by the party that observes messages on the edge. So an edge whose
transport bypasses that party cannot carry a deadline at all, and the resolution
is fixed in one direction: **the declared deadline stands and the transport is
demoted, never the reverse.** A deadline silently left unrefreshed by a faster
path is not a lost optimisation, it is a false close — it orders a consumer to
degrade while its data is flowing perfectly, and it does so as an
[absent guard](../../../_laws.md#absent-guard-is-loud) that nobody logged.

## Degradation is a decision, and a decision needs material

The point of telling a consumer that an input died is that it can then do
something other than stop. That requires the runtime to have kept something for
it to act on, which is why the last value per edge is cached — and, against
every instinct, **kept after the edge closes.** Clearing the cache on close is
the naive move and it is exactly backwards: the close is the moment the cached
value becomes load-bearing, and deleting it converts "I hold a detection that is
400 milliseconds old" into "I hold nothing." The cache carries the value's age
and its edge's health beside it, because a stale reading served without those
reads identically to a fresh one, which is
[unknown rendered as a definite value](../../../_laws.md#unknown-is-not-a-value)
at the worst possible boundary.

With material in hand the consumer picks from a set of modes designed *before*
the outage: continue on the last value up to a stated maximum age, fuse with
fewer inputs and widen the declared uncertainty, fall back to reduced capability,
or enter a safe state. Which inputs are critical — their close forces the safe
state — is declared per edge by the designer, because no runtime can infer that
one measurement edge is survivable and another is not.

## What supervision refuses to do

The last commitment is a refusal, and stating it plainly is what makes the rest
usable. **Supervision does not manufacture terminal replies.** When a producer
restarts, every exchange in flight against it is orphaned — the correlation
state lived in the two endpoints and one of them is gone — and the runtime does
not fabricate an error response, a cancellation, or an empty result to keep the
consumer's code path uniform. A synthesised terminal is indistinguishable at the
consumer's branch point from a real one, so the consumer records "my request was
refused" when the truth is "nobody ever answered, and the peer I was waiting for
no longer exists." What the consumer gets instead is the restart signal and its
own deadline, and three outcomes it can tell apart: answered, timed out,
abandoned-by-restart. A timeout is a hypothesis about a live peer; an
abandonment is a fact about a dead one, and they route to different repairs.
How the exchange was correlated in the first place is the sibling subject
correlated-exchange-over-broadcast; this subject owns the stance and the signal.

## What "done" looks like for this subject

The layer meets the bar when: no consumer in the graph invents a timeout to
discover an upstream failure, because the fact reaches it as a typed event in
the channel it already reads; the event vocabulary is closed, has one authority,
and each event reaches exactly the consumers of the affected edge, once; a
staleness deadline arms at first message and is refreshed by a party that
actually sees the messages, with any transport that cannot honour it demoted
rather than the deadline dropped; broken and closed are distinct states, a
broken input blocks the terminal verdict, and recovery is announced on delivery;
every consumer of a degradable input has a designed degraded mode and a cached
last value, with age and health attached, to run it on; a restarted producer's
consumers are told, so they can reset caches and abandon correlations rather
than fuse two generations of state; and nothing anywhere synthesises an answer
that was never given.

## The techniques

- [typed-edge-events-in-band](./techniques/typed-edge-events-in-band.md) — the
  closed event vocabulary, why it rides the data channel, and what may never
  enter it.
- [edge-deadline-arming](./techniques/edge-deadline-arming.md) — per-edge
  staleness bounds, arming at first message, refresh ownership, and the rule
  that a declared deadline demotes the transport.
- [recoverable-vs-closed](./techniques/recoverable-vs-closed.md) — the state
  machine of an edge, the terminal verdict a broken input blocks, and recovery
  proven by delivery.
- [last-value-degradation](./techniques/last-value-degradation.md) — the
  per-edge cache that survives a close, its age and health metadata, the
  declared degraded modes, and re-identification after a restart.
- [restart-notification-scope](./techniques/restart-notification-scope.md) —
  deriving the audience from the routing table, once per restart per receiver,
  and what a consumer does on receipt.
- [no-synthetic-terminal](./techniques/no-synthetic-terminal.md) — the refusal
  to fabricate an outcome, the three distinguishable ends of a wait, and the
  contract that replaces the fabrication.
