---
layer: technique
type: technique
subject: fault-signal-propagation
technique: restart-notification-scope
status: forged
laws: [one-authority-per-vocabulary, identity-survives-reuse, verdict-survives-boundary]
shared_with: []
use_when: [deciding who hears that a producer was restarted, a restart storm floods every consumer with facts about strangers, a consumer fuses state from two generations of the same producer]
---

# Scoping the restart notification

A producer restarts. Somewhere in the graph there are consumers holding caches
seeded by its old instance, correlations awaiting replies it will never send, and
negotiated agreements — a schema, a session, a calibration epoch — that the new
instance has not made. Those consumers need to know. Nobody else does, and the
difference between "those consumers" and "everybody" is what this technique
decides.

## The audience is derived from the routing table

The set that must hear about a producer's restart is exactly the set of consumers
subscribed to that producer's outputs. That set already exists: the runtime
maintains it to move the data. Derive the notification audience from it, at the
moment of the restart, and the audience is correct by construction on every
topology the graph has ever been in.

The two alternatives both fail, and they fail differently.

**A maintained subscriber list** — a second structure enumerating who cares about
whom — is a copy of the topology, and it drifts from the original at the first
change nobody remembered to mirror. Two hand-maintained copies of one
relationship are a race with a delay fuse
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
the drift is discovered during an incident, when a consumer that should have been
told was not.

**Broadcasting to every consumer** avoids the drift and buys a worse problem. In
a graph of any size the notification fan-out becomes quadratic at exactly the
moment it must not — a restart storm, where a shared dependency's failure
restarts a dozen producers at once and every consumer receives a dozen facts
about processes it does not read. The practical damage is not the traffic; it is
that consumers write filters, and a filter that discards facts about strangers is
one refactor away from discarding the one that mattered.

## Once per restart, per receiver

A restart is one event about one producer. A runtime that emits it per output, or
per edge, or once per queued message hands each consumer a deduplication problem,
and consumers deduplicate on time windows — which is precisely wrong for the slow
restart the window was not sized for, and produces a consumer that resets its
caches twice and abandons a correlation it had already retried.

Emit once, per receiving consumer, carrying the producer's **declared identity**:
the identity that survives the restart, not the operating-system process identity
of either instance
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
notification keyed by a process identity is unusable by definition — the consumer
never knew the old one and cannot recognise the new one — and process identities
are recycled, so the key is ambiguous as well as useless.

## Ordering: before the new instance's first message

The signal is only useful if it arrives ahead of any data from the new instance.
A consumer that receives three post-restart values and *then* the restart
notification has already fused two generations of state, and resetting the cache
afterwards discards the good new values along with the stale old ones.

Delivering the notification in the consumer's own data stream gives this ordering
for free, because there is one sequence and the runtime places the event in it
before it places the new instance's first payload. A side channel does not give
it, and no amount of timestamping repairs it: the consumer would have to buffer
every payload for a skew window it cannot compute, on the chance that a
notification is in flight behind it.

## The one event that may not be dropped, and the deadlock that guards it

Most supervision events tolerate loss badly. The restart signal tolerates it not
at all: a consumer that misses it stays blocked on correlations against a process
that no longer exists, and stays blocked indefinitely, because nothing else will
ever tell it. So this event is delivered with a guarantee — attempted without
blocking first, and on refusal escalated to a delivery that waits.

That escalation is where an obvious implementation deadlocks, and the shape is
general enough to be worth stating. The waiting send must **not** be awaited on
the supervisor's own serial loop. The receiver whose queue is full is very often
full *because* it is itself parked trying to send into the supervisor — and a
supervisor blocked on that receiver never returns to drain the channel the
receiver is waiting on. Two components each holding what the other needs, and the
whole graph stops. Hand the waiting delivery to a detached task with its own
handles, and keep the supervisor's loop draining. The general rule: **a
supervisor never blocks its own loop on a consumer it also serves.**

Guaranteed delivery also has to keep the bookkeeping honest. Whatever counter or
ledger tracks messages owed to a consumer is incremented by the offloaded task if
and only if the message actually enqueued — the same coupling the inline path has
— because a counter incremented on intent and decremented on consumption drifts by
exactly the number of failed deliveries, and it drifts during the incident.

## What the receiving consumer does

The signal licenses four actions, and a consumer's handler is a decision about
each one:

- **Reset per-producer caches**, or re-validate them against a source identity
  before trusting them again — the conditional restoration the degradation
  technique owns.
- **Abandon in-flight correlations against that producer**, terminating each
  wait with an outcome that is distinct from a timeout. That the runtime does not
  invent a reply in their place is a stance, stated in this subject's
  no-synthetic-terminal technique.
- **Re-establish negotiated agreements** — anything the two endpoints agreed once
  and neither re-sends per message. A new instance has agreed to nothing, and a
  consumer that keeps applying the old agreement misparses the first messages it
  receives, usually without an error.
- **Record the restart against its own outputs**, so that a downstream stage can
  see the discontinuity rather than infer it from a jump in the data.

Each of these is a branch, which is the reason the notification is a typed value
reaching the consumer's own handler rather than a log line
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).

## Decision rules

- **Compute the audience from the routing table at emission time.** Never from a
  cached snapshot taken at graph start-up: a graph that admits topology changes
  will have changed.
- **A topology change that removes an edge notifies the dependents that lose it**
  — with a close, from the same derived audience. The mechanism is one mechanism,
  used for two causes.
- **One notification per restart per receiver, carrying the declared producer
  identity.**
- **Deliver ahead of the new instance's first payload**, which in practice means
  in-band.
- **A consumer with no caches and no correlations still receives it.** The
  runtime cannot know that a consumer is stateless, and a consumer that wants to
  ignore the signal ignores it in one line. Filtering at the source to save that
  line trades a trivial cost for a class of missed notifications.

## When not to use this

Where no producer carries a restart policy, no restart notification exists to
scope, and the machinery is dead weight — until the first policy is declared.

Where a graph's every consumer is genuinely stateless per message, the signal is
informational only. Keep emitting it: it costs one event per restart, it is the
only record of a discontinuity a consumer's own output can carry, and the
assumption of statelessness expires the first time somebody adds a filter with
memory.
