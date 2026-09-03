---
layer: technique
type: technique
subject: concurrency-guards
technique: renewal-deadline-two-thirds-ttl
status: forged
laws:
  - gate-sees-target
  - failure-not-empty-success
shared_with: []
use_when: [sizing a cluster lock's TTL against its renewal cadence, a renewal that hangs past the point another node could win, lease expiry compared across hosts with different clocks, the lock's heartbeat starving under the work it protects]
stage: multi-service
---

# The renewal deadline at two thirds of the TTL

A lease-based cluster lock has one ordering invariant that every other
number serves: **the holder must learn that it has lost the lock before any
other party can win it.** Loss is discovered by the holder's own renewal
failing; winning is possible the instant the lease's validity passes. If a
renewal can still be in flight — waiting on a slow store, a saturated
connection, a partition healing — at the moment validity passes, then a
contender can acquire while the old holder still believes it is renewing, and
the old holder keeps serving writes until the renewal finally returns. That is
the zombie the fence exists to stop, but a fence catches writes one at a time
after the fact; the renewal deadline stops the holder *before* the window
opens, which is cheaper and covers the effects no fence can see.

The naive renewal has no deadline at all: it issues the renewal write and
waits for the store. Under normal conditions it returns in milliseconds and
the absence of a deadline is invisible. Under the one condition the lease
exists for — the store is slow or unreachable — the renewal waits
indefinitely, the lease expires underneath it, and the holder's loss
notification fires only when the store answers, if it ever does.

## The arithmetic

The invariant is an inequality: renewal cadence plus the renewal's own
deadline, plus whatever propagation the loss notification needs, must be less
than the TTL by a margin that covers clock and network skew. The conventional
shape gives up a renewal at **two thirds of the TTL**: the cadence is short (a
third of the TTL, so a missed renewal is not fatal), the deadline consumes the
remaining budget, and a renewal that has not succeeded by then is declared
failed and the holder stops. Two thirds is not magic; it is where the two
demands meet — enough time for a slow but live store to answer, and a hard
stop before the lease can be taken.

The check to make on any concrete set of numbers is whether they sum to the
TTL exactly or leave room. Cadence of a third plus a deadline of two thirds is
the TTL with no margin: the holder is told it has lost the lock at the same
instant a contender may take it, and the contender's retry cadence is the only
thing standing between the two. Shave the deadline, or lengthen the TTL, until
the sum is strictly inside it; the "grace for network latency" the deadline
is usually described as providing exists only if the sum leaves any.

## Expiry in the store's clock

Validity is a timestamp, and the question "has it passed?" is asked by two
parties: the holder renewing and the contender stealing. If they consult
different clocks, the lease is exactly as safe as the skew between them,
which nobody controls. The fix is to keep every clock but one out of the
protocol: **the store sets validity from its own clock and evaluates expiry
against its own clock**, in the same statement that writes or steals. Node
clocks then never enter the comparison — a node with a clock an hour wrong
renews and steals exactly as correctly as one with a perfect clock, because it
sends a duration, not a time. The corollary is that the TTL travels as a
relative interval in the write, never as an absolute deadline computed on the
node.

## Renewal reads its result; a stolen lock stops the holder

The renewal is a conditioned update — extend validity where identity and key
are still mine — and it returns how many rows it touched. Zero means the lock
is no longer this holder's, and that verdict must close the loss channel
immediately (law: gate-sees-target: the renewal *is* the holder's gate on its
own legitimacy). The steal and the renewal are two different statements on
purpose: the steal creates or overwrites only an *expired* row, the renewal
only touches the holder's *own* row and never creates one, so neither can
accidentally do the other's job — a renewal cannot revive a deleted lock, and
a steal cannot extend a live one.

An error from the store on the renewal path is a separate case from zero
rows, and it is logged as an error with the key and the cause before the loss
channel closes (law: failure-not-empty-success): a renewal that stops silently
on error leaves an operator with a leadership change and no explanation. The
choice to treat a store error as *lost* rather than *unknown* is the cluster
lock's, and it differs from a job lease's for a reason: one active node
losing leadership to a false positive costs a failover the cluster is built to
survive, while an active node that keeps writing through an unknown is the
corruption the whole subject defends against. The job-lease posture that
keeps working through an unanswerable store is the right one for per-job
leases over a separate lease store, and the boundary is the golden path's.

## The renewal must not starve behind the work

The renewal is a write, and it needs the same resource the work needs. Where
the work can hold every slot of a bounded pool — long transactions, a burst
of writes under exactly the load a failover is likely to occur in — the
renewal queues behind the work and the deadline above expires a live holder
that was merely busy. **Reserve one connection for the lock's renewal**, by
capping the work's transactions one below the pool's size; the renewal then
waits on nothing but itself. The reservation is a rule for pooled multi-writer
engines; on a single-writer engine it does not exist and pretending it does
converts a wait into a failure. That condition, with its measurement, is
stated once in job-coordination's lease-renewal technique, in its section
"Renewal must not queue behind the work", and is not restated here.

## Decision rules

- Give every renewal a deadline, and place it so that cadence plus deadline
  plus notification lands strictly inside the TTL; a sum equal to the TTL has
  no margin, whatever the comment says.
- Give up a renewal at about two thirds of the TTL and close the loss channel
  on giving up; the holder must stop writing before the lock is acquirable.
- Set and evaluate validity in the store's clock, in the statement that
  writes; send the TTL as an interval and keep node clocks out of the
  comparison.
- Keep steal and renew as two statements: steal only expired rows, renew only
  your own, never create on renew.
- Read the renewal's row count; zero closes the loss channel now. Log a store
  error with its cause before treating it as lost.
- On a pooled engine, reserve one connection for the renewal; on a
  single-writer engine, bound the longest write instead, per the neighbour's
  condition.
