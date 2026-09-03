---
layer: technique
type: technique
subject: cross-instance-cache-lease
technique: renew-from-arrival-not-from-work
status: forged
laws: [record-precedes-effect, creation-names-reaper]
shared_with: []
use_when: [wiring a lease renewal into a service, leases expire only under load, deciding which loop owns a keep-alive for queued work]
---

# Renew from arrival, not from work

Start renewing a lease when the request **enters the queue**, and keep renewing
it while it waits. Do not start renewing when the request is scheduled for
execution. The gap between arrival and scheduling is unbounded under load, and
it is precisely the window in which the lease would otherwise expire.

## Why the obvious wiring is the wrong one

Renewal is a message about a piece of work, so it feels like it belongs beside
the code that does the work. Every framework encourages that: the execution
path already has the request object, the peer handle, the deadline and a
natural periodic tick. Renewing from admission means touching a queue that
otherwise does nothing but hold items.

But consider when the lease is under threat. Not while the work runs — a
running request is progressing, and it either finishes or fails visibly. The
lease is under threat while the request is **waiting**, and it waits longest
exactly when the system is most loaded, which is exactly when the wasted
recomputation of a dropped result is most expensive. Renewal wired to execution
therefore starts precisely after the danger has passed, and is absent for the
entire interval it existed to cover.

The failure has a signature that misleads people for a long time: **it never
reproduces in testing**. In a quiet system arrival and scheduling are
microseconds apart, so the wrong wiring passes every test, every staging soak
and every load test that is not deep enough to build a queue. It appears first
in production, as intermittent recomputation under peak, and it presents as
"the peer is slow" rather than "we told the peer to stop holding".

This is the general rule in a specific costume: **the claim on a resource is
registered before the work that consumes it**
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)). The
holder must learn that the claimant exists before the claimant can do anything
at all — including nothing, for a long time.

## The procedure

1. **Emit the first renewal at admission.** The moment the request is accepted
   into the waiting set, before any scheduling decision, register it in the set
   of things being renewed.
2. **Renew from the loop that observes the whole waiting set**, not from a
   per-request execution context. That loop already runs on a period; it can
   walk waiting and running items alike, which is the second reason to put
   renewal there — one code path covers both phases, so no item is ever between
   owners.
3. **Keep renewing across the phase transition.** Scheduling must not be a
   handoff to a different renewer; a handoff has a gap, and the gap is where a
   deadline lands.
4. **Establish the peer connection at the same moment.** The first renewal
   forces a handshake, which is otherwise deferred to first transfer. That work
   is on the critical path exactly once and the queueing window is free time —
   so connecting early makes the *correct* choice also the *faster* one, and
   this is worth stating in the review, because a change that only pays for
   itself in a rare failure is easier to reject than one that also removes
   first-transfer latency from the hot path.
5. **Let the first renewal be deferred, not blocking.** If the peer connection
   is not yet established, start the handshake and skip this tick's renewal
   rather than waiting for it inside the loop; the next tick sends. This is
   only safe because the interval is a small fraction of the grant — the same
   derivation that tolerates a lost renewal tolerates a deferred first one —
   and it keeps a slow or unreachable peer from stalling the loop that renews
   everybody else.
6. **Give the tracking structure a reaper.** The map from peer to
   pending items is itself a resource: when a peer dies, its entry must be
   removed once the last item leaves, or the process accumulates one empty
   entry per peer it ever spoke to. The leak is small, silent and unbounded,
   which is the combination that survives review.
7. **Stop renewing at every exit**, including the ones that are not completion:
   cancellation, client disconnect, preemption out of the queue, admission
   rejection after a partial grant. The exit paths are more numerous on the
   waiting side than on the executing side, which is the cost of this wiring
   and must be paid deliberately.

## Decision rules

- **When asking where a keep-alive belongs, ask where the wait is, not where
  the work is.** The renewer lives in the phase with unbounded duration.
- **When a system has multiple queues** — admission, scheduling, a preemption
  hold, a swapped-out set — renewal covers all of them or the item can expire
  in whichever one is not covered. Enumerate the states an item can sit in and
  check the renewer walks every one; a state added later without renewal is the
  next incident.
- **When a request is preempted back out of execution**, it re-enters the
  waiting side and must keep renewing. Preemption is not completion.
- **When the queue is bounded and short by construction**, the timing argument
  weakens, but keep the wiring anyway: it is the same amount of code, and the
  bound is a property of today's admission policy rather than of the design.

## Failure signatures

- Leases expire only in production, only at peak, never in a load test that
  did not build a backlog.
- Expiry counts correlate with queue depth rather than with peer crashes.
- The first transfer of each request is measurably slower than subsequent
  ones — the handshake is on the critical path because nothing connected early.
- An item that was preempted or requeued loses its held result while the
  request itself is still perfectly alive.

## When not to use this

- **When there is no queue** — the request is executed synchronously on
  arrival — arrival and execution are the same instant and the distinction is
  empty.
- **When the waiting phase genuinely cannot hold the peer identity**, because
  routing decides the peer only at scheduling time, renewal cannot start
  earlier than knowledge of who to renew with. Then the fix is upstream: decide
  the peer at admission. Accepting late binding here means accepting an
  unrenewed window, and that window must at least be bounded and stated rather
  than left implicit.
