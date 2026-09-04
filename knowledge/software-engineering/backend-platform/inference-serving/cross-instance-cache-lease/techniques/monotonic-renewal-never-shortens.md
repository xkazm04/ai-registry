---
layer: technique
type: technique
subject: cross-instance-cache-lease
technique: monotonic-renewal-never-shortens
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [several senders renew one holder, a renewal message may be duplicated or delivered out of order, a deadline appears to move backwards]
---

# Monotonic renewal never shortens

A renewal extends a deadline to **the later of the deadline already stored and
the one being requested**. It never assigns. One line of code, and a whole
class of race disappears:

> stored deadline := max(stored deadline, now + extension)

Assignment is the natural way to write it — the message carries the new
deadline, so store the new deadline — and it is wrong in every system where a
renewal can be duplicated, retried, reordered, or sent by more than one party.

## The race that assignment creates

Renewals are small, frequent and unimportant individually, so they travel over
whatever is cheapest and are retried freely. That means the holder can see them
out of order. Under assignment, an older renewal arriving after a newer one
**shortens** a live lease, and the resource is reclaimed while a claimant is
still coming for it. The bug is timing-dependent, load-dependent, and
invisible in the logs of either party: the claimant sent renewals correctly and
on schedule, the holder applied every one of them, and the resource vanished
anyway.

The multi-sender case makes it worse and is common the moment leasing is
per-item and batching is per-peer: several senders renew the same holder for
different items, batches interleave, and a batch computed slightly earlier
lands slightly later. Nobody misbehaved. There is no sender-side ordering fix
that survives retries.

Monotonic extension makes each renewal **idempotent and order-independent**.
Replay one, drop one, deliver three out of order: the stored deadline is the
maximum of whatever arrived, which is always safe, because the error direction
is *holding slightly too long* — the cheap failure — and never *releasing too
early* — the expensive one. Under this rule the renewal channel can be
lossy, unordered and at-least-once, which is precisely what a cheap channel
is, and the deadline still survives every reordering and retry the messages
actually undergo
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## The procedure

1. **Compute the deadline at the receiver**, from the receiver's own clock plus
   the extension the message asks for, rather than trusting a timestamp the
   sender computed. If the message must carry an absolute deadline instead, see
   [a deadline is not portable between
   clocks](./a-deadline-is-not-portable-between-clocks.md) before comparing it.
2. **Apply with a maximum, under whatever protects the entry**, so that
   concurrent renewals for the same item cannot interleave a read and a write.
   A read-modify-write without that protection loses one of two simultaneous
   extensions, which is the same bug with a smaller window.
3. **Make the operation total.** A renewal for an item that has already been
   collected or already expired is a no-op that returns a clear outcome, not an
   error and not a resurrection. Late renewals are normal traffic; treating one
   as an anomaly produces noise, and treating one as a re-grant lets a
   reclaimed resource come back from the dead.
4. **Check the expiry sweep's ordering assumption.** A common sweep walks the
   pending items in insertion order and stops at the first one that has not
   expired, which is correct only while insertion order matches deadline order.
   Monotonic extension breaks that: an early item renewed far into the future
   sits at the head and shields later, genuinely expired items from the sweep.
   The error is in the safe direction — over-retention, never early release —
   but it means worst-case retention is no longer bounded by the sweep period,
   and that should be a stated consequence rather than a surprise. Reorder on
   extension, or sweep the whole set, or write down why the delay is
   acceptable.
5. **Never expose a shorten operation on the same path.** If early release is
   genuinely needed, it is a distinct, explicit *release* with its own name and
   its own authorization, not a renewal with a small number. Once one caller
   can shorten via the renewal path, the monotonic invariant is only a
   convention, and conventions do not survive retries.

## Decision rules

- **When a renewal arrives that would shorten the lease, ignore it silently and
  count it.** The count is the signal that senders are reordering, which is
  information; the ignoring is the correctness.
- **When several parties may renew one item, no coordination is required.** Any
  of them extending is enough for all of them, and that is the property
  monotonicity buys — do not add a leader or a sequence number to a problem a
  maximum already solved.
- **When an explicit early release is added, make it carry the same identity
  the grant did**, so a release for a superseded grant cannot free a resource
  that has since been re-granted.
- **When extension length varies by caller**, monotonicity still holds and a
  short-extension caller can never truncate a long-extension one. This is the
  reason it is safe to let different callers ask for different extensions at
  all.

## Failure signatures

- A deadline observed moving backwards in a trace.
- Resources released while a pull is in flight, at low frequency, only under
  load, with no error on either side.
- Renewal retries correlated with expiries — the retry is the message that
  shortened the lease.
- Two extension calls at the same instant, one of which has no effect on the
  stored deadline.

## When not to use this

There is no case in this subject where assignment is preferable; the rule costs
nothing and the failure it prevents is silent. The one adjacent situation that
looks similar and is not: a **deliberate downgrade of a grant** — quota
reduction, revocation, an operator draining a machine. That is a different
operation with a different authorization story, and it must be modelled as
revocation rather than as a short renewal, so that the renewal path can keep
its invariant.
