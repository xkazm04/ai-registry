---
layer: technique
type: technique
subject: toasts-notifications
technique: queue-discipline
status: forged
laws: [identity-survives-reuse, creation-names-reaper]
shared_with: []
use_when: [toasts arrive faster than the screen can absorb, the same failure keeps earning fresh toasts, a dismissed toast resurrects on its own]
---

# Queue discipline

Toasts arrive whenever the system has news, which means they arrive in
bursts: a batch job completing item by item, a failure storm from one dead
dependency, three subsystems reacting to the same reconnect. An undesigned
transient layer renders whatever shows up and lets the screen sort it out.
A designed one is a **queue with admission, display, and eviction policy**
— the toast a user sees is the *output* of that policy, not the direct echo
of an event.

## Identity first

Every message entering the queue gets a durable identity at creation
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)), and a
separate **semantic key** — kind plus subject ("connection-lost:
provider-X"), normalized so volatile fragments (record ids in prose,
counts, timestamps) do not make every repeat look novel.

- The **identity** keys rendering, animation, timers, and dismissal — never
  the message's position in the queue, which changes every time a neighbor
  leaves. Position-keyed toasts produce the classic defect family: the
  wrong toast dismissing, an exit animation replaying on the survivor, a
  timer inherited by whoever slid into the slot.
- The **semantic key** drives dedup and coalescing (below). Two messages
  may share a semantic key and still be distinct queue entries in time;
  they never share identity.

## Display policy

- **Max visible.** A small fixed number of toasts on screen — the rest
  wait in the queue. The number is a design constant, not "however many
  arrived"; past a handful, additional simultaneous toasts subtract
  comprehension rather than add information.
- **Dwell per severity.** Auto-dismissal time comes from the severity
  mapping table, scaled by reading time — a two-line error needs longer
  than a one-word success. Dwell applies only to awareness-class messages;
  action-required messages do not auto-dismiss at all (the golden path's
  actionability rule).
- **Attention pauses the clock.** Hover or focus on a toast suspends its
  timer; leaving resumes it (a fresh reading allowance, not the stale
  remainder — the user who returns is re-reading). Dismissing content the
  user is demonstrably attending to is the one unforgivable dwell bug.
- **Ordering is stable and newest-visible.** New messages must be able to
  appear even while old ones hold the screen — a full window plus a strict
  FIFO would hide a fresh critical behind three stale successes. Either
  reserve headroom for higher severities or allow severity to preempt:
  eviction below (see overflow) creates the room.

## Dedup and coalescing

A repeating failure — the poll that dies every ten seconds — must not earn
a toast per occurrence. Repetition is *new information exactly once*: the
transition from "happened" to "still happening".

- **Same semantic key while a toast for it is live** → coalesce: bump a
  visible count on the existing toast ("still failing — 14×"), optionally
  refresh its dwell. Never spawn a sibling.
- **Same semantic key shortly after dismissal** → a cooldown window
  decides whether the repeat re-toasts or only increments the ledger
  record. The window is severity-dependent: errors may re-surface after
  minutes; successes never need to.
- Coalescing is **counted, not silent** — a suppressed repeat still
  increments the visible count and still reaches the durable record. Dedup
  that discards is under-delivery wearing tidiness as a disguise.

## Cooldowns are claimed, not observed

A cooldown window is shared mutable state, and the two obvious ways to
use it are both wrong in the same way — they read it, then act, then
write it.

- **Check and stamp are one step.** Read-then-write with anything in
  between (a lookup, a render, a network call) lets two producers reacting
  to the same underlying event both observe an expired window and both
  emit. The window is *claimed* by a single indivisible operation whose
  result is the permission to send — one conditional write whose outcome
  decides the winner, not a read followed by a decision.
- **The stamp lands at the decision, not after the delivery.** Stamping on
  success looks more honest and is the more dangerous choice: a sink that
  is failing is usually failing *repeatedly*, so a window that only closes
  on success never closes during exactly the storm it exists to mute. The
  claim is taken when the system decides to raise the message; whether the
  message then lands is a separate outcome, recorded separately.

The last point has a genuine exception, and the two cases are opposite
about failure, so they must not share an implementation:

| | what it protects | on delivery failure |
|---|---|---|
| **Suppression window** (cooldown, dedup) | the user's attention from a repeating condition | keep the claim — releasing re-opens the floodgate |
| **At-most-once window** (a periodic push, a digest) | a scheduled message from being sent twice | release the claim — otherwise the period is silently skipped |

A suppression window that releases on failure produces a storm; an
at-most-once window that does not produces a hole the user cannot see,
because nothing was sent and nothing says so. And the at-most-once
predicate has exactly one evaluator: a second reader of "has this window
been claimed" that does not understand releases will skip a released
window and drop the message — the defect is not in the claim, it is in
the second opinion about it.

## The pool boundary is the oscillation, not the kind

Semantic identity is kind plus subject, and that is the right default —
but a suppression pool keyed strictly that way has a hole and a
starvation, and both show up in real systems.

- **Opposite transitions of one state share a pool.** "Degraded" and
  "recovered", "regressed" and "improved", "disconnected" and
  "reconnected" are different kinds and the same oscillation. Give them
  separate pools and a flapping subject alternates between them forever,
  each pool individually inside its window and the channel unreadable.
  One pool per oscillating subject, consumed by whichever direction fires
  first — which also means a repeat cannot double-fire by changing
  direction.
- **Independent conditions on one subject do not.** Two unrelated
  problems on the same subject sharing one pool means the first to fire
  starves the second for the length of the window, and the starved one is
  as likely to be the important one. Key those by subject *and* condition.

The test is not "are these the same kind" but **"is one of these the same
news as the other, told differently?"** If a user who saw the first would
learn nothing from the second, they share a pool. If they would learn
something the first did not tell them, they do not.

Sharing a pool has a cost and it is worth stating plainly, because the
alternative to stating it is discovering it: a genuine transition in one
direction, arriving inside the window a genuine transition in the other
direction just claimed, is suppressed. That is acceptable only because the
suppression is to the *interrupting* tier alone — the record is written
before the claim is taken, so the event is detected, recorded and visible
in the ledger either way. A system that takes the claim before writing the
record has not chosen a trade-off; it has lost the event.

## Overflow policy

When arrivals outrun the display window plus queue tolerance, the system
degrades *deliberately*, in order:

1. **Coalesce harder** — collapse same-kind entries across subjects
   ("3 jobs failed") before dropping anything.
2. **Summarize the tail** — one synthetic toast ("N more notifications")
   that opens the ledger, replacing the queue's tail rather than racing
   through it. Draining a 40-deep backlog at normal dwell shows the user
   old news for minutes; nobody wants a replay of the storm.
3. **Shed lowest first** — if shedding is unavoidable, drop
   awareness-class low severities, oldest first, and *route every shed
   message to the ledger*. The screen may miss it; the record may not.

## Timers are owned resources

Every dwell timer, cooldown window, and animation handle names its reaper
at creation ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)):
dismissal cancels the dwell timer, teardown of the transient layer cancels
everything outstanding, and a timer callback validates that its toast
*identity* is still live before acting. The resurrection bug — a message
reappearing or a fresh toast vanishing early because a stale timer fired
into a reused slot — is always an unowned timer plus position-keyed
identity, and both halves of the fix are in this technique.

## The queue is observable

The queue has state worth exposing to the rest of the system: current
depth, suppression counts, shed counts. At minimum, messages the queue
declined to display must be distinguishable (in the ledger, in telemetry)
from messages never sent — a transient layer that can silently drop is a
delivery system whose failure mode is indistinguishable from success.

A boolean *shown / not shown* is not enough, because the reasons a message
did not arrive demand different remedies from different people. Record the
reason as a closed set alongside the outcome, and keep three cases apart:

- **Suppressed** — the policy declined a message that was eligible
  (cooldown, coalesced, shed under overflow). The remedy, if any, is to
  tune the policy.
- **Undeliverable** — the message was eligible and the channel failed or
  was never configured. The remedy belongs to whoever owns the channel.
- **Not eligible** — the product decided this event does not travel by
  this tier at all. There is no remedy, because nothing went wrong.

Collapsing the third into the second is the common error, and it is worse
than silence: it reports a deliberate product decision as a configuration
fault and sends an operator to fix something that is not broken. An
ineligible event records a plain undelivered outcome with no reason
attached — "we did not try" is a complete answer.
