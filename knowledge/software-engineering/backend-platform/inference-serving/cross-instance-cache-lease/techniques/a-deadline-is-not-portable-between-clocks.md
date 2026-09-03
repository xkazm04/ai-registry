---
layer: technique
type: technique
subject: cross-instance-cache-lease
technique: a-deadline-is-not-portable-between-clocks
status: forged
laws: [unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [a deadline computed by one process is compared by another, choosing which clock a protocol timestamp is read on, expiries that only affect some peer pairs]
---

# A deadline is not portable between clocks

A monotonic clock has no shared origin. Its readings are meaningful **only as
differences within the process that produced them**, and two processes on the
same machine — let alone two machines — can be arbitrarily far apart in that
reading. So a monotonic deadline that crosses a process boundary is not a time;
it is a number in a foreign unit system. Comparing it against a local reading
is exactly the mistake of treating an unknown offset as zero
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

The correction goes **at the comparison, not at the clock**. Nothing is
adjusted, stepped, or synchronized; the receiver estimates the offset once,
carries it beside the peer's identity, and applies it every time it compares
that peer's numbers.

## Why the alternatives are worse

- **Send wall-clock time instead.** Now the deadline is portable and wrong for
  a different reason: wall clocks step. A leap adjustment, a synchronization
  correction or a container resume moves it backwards or forwards, and a
  duration measured across the jump is nonsense. Wall clock is for *when
  something happened for a human*; monotonic is for *how much time has
  passed*. A lease is a duration, so it must be monotonic, so it must be
  corrected rather than replaced.
- **Rely on a synchronized clock service.** It reduces the offset but does not
  eliminate it, it adds an operational dependency to the correctness of a
  reclaim, and it fails silently and gradually. Sound systems that do rely on
  synchronized time carry a stated bound and wait it out; if that bound is not
  measured and enforced, assuming it exists is the same unknown-as-zero error
  in a smarter hat.
- **Send only durations, never deadlines.** This is the best option where the
  protocol allows it, and it should be the default: "extend by 30 seconds" is
  clock-free, and the receiver computes the deadline on its own clock. Reach
  for the offset estimate only where an absolute deadline genuinely has to
  cross — when the sender's deadline is derived from something the receiver
  cannot see, or when queueing between send and receipt would otherwise be
  charged to the wrong side.

## The procedure

1. **Estimate the offset from the handshake you already paid for.** At
   connection setup, the receiver records its own clock, sends, the peer stamps
   its clock into the reply, the receiver records its clock again. With the
   round trip *rtt* and the peer's stamp *p*, the peer's clock at the local
   midpoint is approximately *p*, so the offset is
   *p − (t₀ + rtt/2)*. The error is bounded by half the round-trip asymmetry —
   a fraction of a millisecond on a local network, and orders of magnitude
   below any sane lease. No extra message, no extra dependency.
2. **Take the estimate from the fastest round trip you observe, not the last
   one.** The estimate's error is bounded by the round trip's asymmetry, so a
   sample with a smaller round trip is strictly a better sample. Where the
   handshake already makes several exchanges — one per remote worker, one per
   retry — keep the offset from the one with the lowest measured round trip and
   discard the rest. It costs a comparison and it removes the tail-latency
   sample that would otherwise set the offset for the whole connection.
3. **Where the message is one-way, stamp the sender's own clock into it.** A
   deadline that travels with the reading of the clock that produced it can be
   rebased by any receiver holding an offset, without a round trip of its own.
   This is what makes the correction workable between a coordinator and the
   workers it fans out to, which is a process boundary people forget is one:
   same deployment, same release, same instant of intent — different clock
   origins.
4. **Store the offset with the peer, not globally.** It is a property of a
   pair of processes. One global correction is meaningless the moment a second
   peer exists.
5. **Apply at the comparison site only.** Every place a foreign deadline is
   compared converts first: *local now* against *foreign deadline − offset*.
   Wrap this in one named function per peer so it cannot be forgotten at a new
   call site.
6. **Make the unit and the domain visible in the type or the name.** A field
   called `deadline` is a trap; `peer_monotonic_deadline` is not. The number
   travels, so it carries what it means and how it was produced
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
   otherwise the next author compares it directly and the bug is reintroduced
   at a site nobody reviewed for clocks.
7. **Add a safety margin that covers the estimate's error**, not just the
   transit. The margin is derived: half the observed round-trip asymmetry plus
   one renewal interval, written down beside the constant.
8. **Re-estimate on reconnect, and only on reconnect.** A monotonic clock does
   not drift meaningfully over a lease's lifetime, and a re-estimate that runs
   continuously is a background dependency that can itself fail. A new
   connection is a new offset because a restarted peer has a new origin.

## Decision rules

- **When a timestamp crosses a process boundary, name its clock domain in the
  same breath.** If nobody can say which clock produced it, do not compare it.
- **When a peer restarts, discard its offset.** A monotonic origin usually
  resets at process start, so a stale offset after a reconnect is worse than
  none: it is a confident wrong answer.
- **When the estimate's error approaches the margin, the protocol is wrong for
  the deployment** — a lease of a few milliseconds across a wide-area link
  cannot be made safe by better estimation. Lengthen the lease or move the
  decision to one side.
- **When both sides could compute the same decision, put it on the side that
  owns the resource.** The holder's clock decides expiry; the claimant's belief
  is a prediction. One authoritative clock per decision beats two corrected
  ones.

## Failure signatures

- Early expiries that cluster on particular peer pairs and never reproduce
  locally, because co-located processes happen to have close origins.
- A deadline in the far future or the deep past when inspected on the receiving
  side — a raw foreign reading, uncorrected.
- Behaviour that changes after a host reboot or a container migration, with no
  deployment attached.
- An offset that is estimated once at start-up and never invalidated, so a peer
  restart silently poisons every subsequent comparison.

## When not to use this

- **When the protocol can carry durations instead**, carry durations. The
  correction is unnecessary complexity if nothing absolute has to cross.
- **When the two parties are in one process**, one monotonic origin is shared
  and the comparison is already valid — but say so explicitly, because that
  assumption is invalidated the day the component is split across processes,
  which is the direction these systems always move.
