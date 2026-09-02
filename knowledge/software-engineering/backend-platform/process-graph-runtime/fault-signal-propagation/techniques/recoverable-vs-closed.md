---
layer: technique
type: technique
subject: fault-signal-propagation
technique: recoverable-vs-closed
status: forged
laws: [gate-sees-target, failure-not-empty-success, identity-survives-reuse]
shared_with: []
use_when: [a consumer exits during its upstream's restart window, deciding what counts toward an all-inputs-closed verdict, a recovery signal fires while the receiver is still saturated]
---

# Recoverable versus closed

An input that has stopped producing is in one of two states, and treating them
as one state is the most consequential collapse in this subject. **Broken** means
the producer is expected back — it is restarting, its host is reconnecting, its
transport is re-establishing — and data may resume, at which point the edge
recovers. **Closed** means it will not: the producer reached a terminal state,
exhausted its restart allowance, or the edge was removed from the topology.

The difference is not descriptive. It decides whether a consumer is permitted to
finish.

## The terminal verdict counts only closed edges

A consumer whose every input is closed has nothing left to do, and that is the
one legitimate reason for it to complete on its own. The verdict is therefore
computed over *closed* inputs only, and **a broken input blocks it**.

The failure mode of the lenient version is worth naming precisely, because it is
silent and it is permanent. A producer crashes and its supervisor begins a
restart. If the broken edge is counted as closed, the consumer sees every input
closed, completes normally, and exits — reporting success. The producer comes
back a second later and publishes into a graph that has lost a healthy
participant, and the consumer's own supervisor, seeing a clean completion, has no
reason to restart it. One transient fault has been converted into a permanent
topology change, with a green record on both sides. That is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
at graph scale.

The strict version costs a consumer some time waiting on an input that never
comes back. That cost is bounded by the producer's own restart allowance: when
the supervisor exhausts it, the edge transitions from broken to closed, the
verdict recomputes, and the consumer finishes then. The wait is bounded by
policy; the lenient version's damage is not bounded by anything.

The asymmetry has a structural cause worth naming, because it is what makes the
rule non-negotiable rather than merely prudent: **the terminal verdict's side
effects are irreversible.** Issuing it typically disables the consumer's own
restart policy — the graph is saying "this participant is done, do not bring it
back" — and that disabling has no undo. A verdict issued on a recoverable state
therefore cannot be repaired when the state recovers. One-way side effects may
only be triggered by one-way states.

The obligation runs the other way too. **A state that blocks the terminal verdict
must be guaranteed to leave it.** A broken record that can be orphaned — created
by a deadline for an edge that had already closed, left behind by a transition
that took another path — pins the blocking predicate true permanently, and the
consumer never finishes, never restarts, and is eventually killed as a straggler.
Every path that creates the blocking state names the path that clears it, and a
path that could create it for an edge already past recovery rolls its own record
back. A safety rule with no exit is a deadlock wearing a safety rule's clothes.

## Draining outranks a stale deadline

A consumer whose deadline on an input has expired still holds whatever that input
already delivered — real data that arrived before the fault, about which the
expiry says nothing. **A stale deadline never discards buffered payloads.** A
consumer told its inputs are all closed drains what it holds and finishes on the
last message, rather than dropping the tail because a clock fired first.

The rule generalises: staleness is a statement about the *future* of an edge, not
a retroactive judgment on its past. Discarding on expiry converts an upstream
stall into downstream data loss, and the loss lands exactly on the last
observations before the fault — the ones an investigation most wants.

## Recovery is proven by delivery

An edge is recovered when a message has *landed* on the consumer's side, not
when the producer resumed sending. The distinction matters because the two come
apart under precisely the condition that follows a fault: the consumer's queue is
saturated, its loop is behind, and sends are being refused or dropped at
admission while the producer believes it is publishing normally.

Announcing recovery from the send side reports a proxy rather than the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)), and its consequence
is worse than a missing signal: the consumer clears its degraded mode and reverts
to full-confidence behaviour with no data behind it. A late recovery signal costs
a few extra cycles of correct degradation; an early one costs correctness.

So the recovery event is emitted on the same evidence the consumer would accept:
a successful delivery into its stream. If the receiver is saturated, the edge
stays broken from the consumer's point of view — which is true — and the signal
follows when a delivery succeeds. Reopening the edge while the consumer is still
behind does not even buy an early recovery; it buys a flap, closing and reopening
on every timeout interval for as long as the backlog lasts.

**And the delivery-proof rule must hold at every layer that keeps an edge-health
view.** A graph typically has two: the supervisor's, and a per-consumer helper
holding a local health map for application code to query. If the supervisor
declares recovery only on a landed message but the helper flips an input back to
healthy on the *restart announcement* — before the new producer has published
anything — the strictest layer's guarantee is undone by the loosest, and
application code reads healthy from a view with no post-restart evidence behind
it. The announcement restores *eligibility*; health returns with the first
message.

## The state machine, and why closed is absorbing

Healthy → broken → healthy is the recovery cycle; healthy → broken → closed, or
healthy → closed directly, is the terminal path. **Closed is absorbing:** there
is no transition out of it.

A recovery arriving on a closed edge is not a lenient case to accommodate; it is
a defect to surface, and its usual cause is identity reuse. A new producer was
placed on the slot of a dead one and inherited its edge name, so a consumer
holding closed state receives data from a stranger and attributes it to the
producer it lost. Edge identity is minted once and carries across restarts of the
same producer
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)); a
different producer occupying the same position is a different edge, and the
consumer is entitled to be told so rather than quietly re-subscribed.

## Decision rules

- **A broken edge blocks the terminal verdict; a closed edge counts toward it.**
  This is the technique in one line.
- **The transition from broken to closed is the supervisor's, on its restart
  policy's exhaustion — never the consumer's, on a timer.** A consumer that
  promotes broken to closed on its own has re-derived a policy it cannot see, and
  two consumers of the same producer will disagree about when it died.
- **Emit both transitions.** A consumer told an edge broke but never told it
  closed keeps a degraded mode forever.
- **Recovery arms the deadline at the message that proved it.** Since recovery is
  declared on a landed payload, that payload is the edge's new first message;
  reopening the edge with an unarmed deadline leaves it unable to time out again.
- **A consumer draining its queue finishes its queue.** Expiry and closure both
  concern what will arrive, never what has.

## When not to use this

Where no producer in the graph has a restart policy, every break is a close, and
carrying two states models a transition that cannot occur. Say so explicitly
rather than leaving it implicit — the distinction has to be reintroduced the day
the first restart policy is declared, and finding the consumers that assumed it
away is harder than writing the sentence.

A consumer that is stateless per message, holds no correlations, and has no
degraded mode can be driven by the terminal verdict alone. It still receives both
transitions; it simply ignores one.
