---
layer: technique
type: technique
subject: cross-instance-cache-lease
technique: renewal-beats-a-tuned-timeout
status: forged
laws: [limits-are-derived, creation-names-reaper]
shared_with: []
use_when: [choosing how long to hold a result for a peer that will collect it, a retention timeout is being tuned in either direction, two failure modes disagree about one parameter]
stage: multi-service
---

# Renewal beats a tuned timeout

Replace the retention timeout with **a short grant plus renewal while the
claimant still wants it**. The short grant covers the case where the claimant
is dead; the renewal covers the case where it is merely slow. The result has no
value that has to be traded between the two cases, which is the point — not
that it is faster, but that it removes the parameter that could be set wrong.

## The setup this technique answers

A holder finishes an expensive result that a remote claimant will pull. It must
decide how long to keep it. Two failures bound the choice from opposite sides:

| the claimant is | a long retention gives | a short retention gives |
|---|---|---|
| dead | gigabytes reserved for nobody; every co-resident request runs against a smaller working set and gets slower, with no error emitted | correct, prompt release |
| queued behind a surge | correct, the pull lands | the result is dropped before collection and the expensive work is redone — under exactly the load that made it slow |

Pick a number and one column is wrong. Lowering it does not resolve the
tension, it moves along it: the classic incident is a team that halves the
timeout to stop the memory stranding, ships it, and discovers a recompute storm
at peak — then doubles it back and re-discovers the stranding. Two round trips
through the same parameter is the diagnostic that the parameter is the wrong
control surface.

## The procedure

1. **Grant at request admission**, not at completion. The lease exists from the
   moment the claimant is known, so a claimant that dies before the result even
   exists is already covered by the same mechanism.
2. **Size the initial grant from the dead case only.** It is the answer to "how
   long may a crashed claimant strand this?" — seconds, not minutes. It is
   explicitly *not* an estimate of how long collection takes, and nobody should
   ever raise it because a slow claimant timed out; that is the renewal's job
   and raising the grant is the relapse.
3. **Derive the renewal interval from the grant, and write the derivation
   beside it** — [limits-are-derived](../../../../_laws.md#limits-are-derived).
   Renew at a small fraction of the grant — a quarter to a half — so that
   several lost, late or deferred renewals in a row still cannot expire the
   lease. A worked default: renew every sixth of the initial grant and extend
   by two thirds of it, which gives four attempts inside every extension and a
   steady-state deadline that sits comfortably ahead of the sweep. Derive the
   extension from the grant too; three numbers with the ratios recorded beat
   three independently tuned constants, which drift apart the first time
   somebody adjusts one. It is also what makes a best-effort renewal send
   acceptable: a dropped renewal is one of four, not the only one.
4. **Renew while intent persists**, from the point given in
   [renew-from-arrival-not-from-work](renew-from-arrival-not-from-work.md), and
   stop renewing the instant the claimant no longer wants the result —
   completion, cancellation, client disconnect, or the claimant's own failure.
   The stop is what makes the mechanism prompt; a renewal loop nobody ends is a
   long timeout with extra machinery.
5. **Name the reaper at the grant site**
   ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). Every
   grant is written with the two things that will end it: collection, and
   expiry sweep. If the sweep is a periodic scan, its period is part of the
   worst-case retention and belongs in the same derivation as the grant.
6. **Batch renewals per peer per step.** All items owed to one peer renew in
   one message. Without this, fine-grained leasing produces a message per item
   per interval and the team's next move is to coarsen the lease, which
   reintroduces coupled failure.
7. **Reclaim at the deadline plus a margin**, not at the deadline. The margin
   covers one renewal in flight. Both sides err toward keeping the resource.

## Decision rules

- **When the two failure modes disagree about a parameter, stop tuning it and
  find the discriminating signal.** Here the signal is *is the claimant alive
  and still intending to collect*. This generalizes past retention: any time a
  knob is being moved back and forth by two incidents, the knob is standing in
  for a fact the system could measure instead.
- **When there is no cheap liveness signal, keep the fixed timeout** and call
  it a cache policy rather than a lease. Renewal without a party that can
  renew is theatre.
- **When the grant is under discussion, ask which case it is being sized for.**
  If the answer is "so slow pulls succeed", the renewal path is broken and the
  grant is being used to hide it.
- **When a claimant is starving rather than dead, let it keep renewing.** The
  lease must be unbounded in that direction or it has re-imported the problem.
  A cap on total renewals is a retention timeout by another name; if starvation
  needs a policy, that policy belongs in admission or scheduling, where the
  starvation is, and it should refuse the request explicitly rather than
  silently dropping its result.
- **When the resource can be mutated after reclaim, add a generation number**
  minted per grant and checked at the point of effect. A lease alone cannot
  stop a stalled claimant from acting on a stale belief.

## Failure signatures

- Two changes to the same constant in opposite directions within a quarter.
- Memory held on machines whose claimants have provably exited.
- Recompute cost that rises superlinearly with load — the queueing window
  crossing the grant.
- An initial grant that has crept up to minutes: the renewal path is dead and
  the grant is carrying it.
- A renewal loop that outlives its request, keeping a resource alive forever
  because no exit path clears it.

## When not to use this

- **When the next access is externally timed** — a client that may or may not
  come back, a human reopening a session — nobody can renew on behalf of an
  intention nobody has formed. Keep the fixed timeout.
- **When the held resource is cheap.** The machinery is justified by the cost
  of the resource and the cost of recomputation. If reproducing it is
  comparable to holding it, drop it immediately and recompute; there is no
  lease worth writing.
- **When collection is bounded and short by construction** — a handoff inside
  one process, or one whose maximum queue delay is provably below the safe
  grant — a timeout is honest and simpler. This technique buys tolerance of an
  *unbounded* wait; if the wait is bounded, there is nothing to buy.
