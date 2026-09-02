---
layer: technique
type: technique
subject: job-coordination
technique: lease-renewal
status: forged
laws: [creation-names-reaper, identity-survives-reuse, gate-sees-target]
shared_with: []
use_when: [sizing how long a dead executor may go unnoticed, an executor keeps writing after losing its lease, live jobs keep being taken over while still running]
---

# Lease renewal

A claim answers "who won this job?"; a lease answers the question that
matters an hour later: **"is the winner still alive?"** On short work the
claim's timestamp is enough — anything claimed longer than a few multiples
of normal duration is suspect. On long work that heuristic collapses,
because normal duration *is* hours, and a threshold long enough to tolerate
the slowest legitimate job is long enough to leave a corpse undetected all
afternoon. The lease resolves the dilemma by splitting the two quantities
the timestamp conflated: how long the job runs (unbounded, irrelevant) and
how recently the executor proved it exists (bounded, small, renewed).

## The mechanism

The claim writes holder, timestamp, and a **lease deadline** a short
interval in the future. While the executor works, a renewal loop extends
the deadline on a fixed cadence. If the executor dies, renewals stop, the
deadline passes, and the expired lease is **affirmative evidence of death**
— not a guess about slowness — on which a reaper can act immediately and
confidently.

Two sizing rules carry most of the technique's value:

- **Size the TTL to detection latency, not to job duration.** The single
  most common lease mistake is setting the TTL to "longer than the longest
  job" — which recreates the corpse-undetected-all-afternoon problem the
  lease exists to solve. The TTL is how long a dead executor may go
  unnoticed. Minutes, not hours, regardless of how long the work runs.
- **Renew at a fraction of the TTL — a third is conventional — so that
  missing one or two renewals** (a GC pause, a transient store error, a
  busy loop) **does not forfeit a live executor's lease.** A lease that
  expires on the first missed heartbeat converts every hiccup into a
  spurious takeover.

Renew on a timer, never per unit of work. A renewal loop that runs "after
each item" silently stops renewing inside the one step that takes an hour —
which is exactly the step during which the lease matters.

## Renewal is a two-way channel

The naive renewal is fire-and-forget: bump the deadline, keep working. The
honest renewal **reads its own result**: the renewal write conditions on
"lease still held by me," and a renewal that reports zero rows means the
lease is no longer this executor's — a reaper expired it, an operator
requeued the job, a takeover happened. That result must reach the work loop
and stop it
([gate-sees-target](../../../../_laws.md#gate-sees-target) — the renewal *is* the
executor's gate on its own legitimacy, and a gate whose result nobody reads
gates nothing). An executor that keeps working after losing its lease is a
zombie: its effects interleave with its successor's, and the record's
story stops matching reality.

Because a zombie may be mid-write at the moment of discovery, discovery
alone is not enough — every effectful write is **fenced**. The claim mints
an attempt identity (a generation counter incremented on each re-claim, or
the pair holder-id + claimed-at), every write the executor issues carries
it, and the store rejects writes bearing a stale generation
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse): the
*job's* identity survives re-claiming precisely because each *attempt* gets
its own). Fencing turns the zombie from a corruption source into a no-op
generator. The completion write is fenced like every other — "set completed
where still running and generation matches" — so a slow executor that was
lawfully replaced loses the finish-line race politely.

## Absent is not lost, and a teardown is a held state

The two-way channel above says a renewal reporting zero rows means the
lease is no longer this executor's. That sentence hides two different
facts, and a store that keeps leases *separately* from the work they
govern forces them apart:

- **Lapsed** — the lease key is simply absent. Nobody holds it. The store
  restarted without persistence, evicted the key under memory pressure,
  or the holder's own renewal fell behind the TTL.
- **Lost** — a peer holds it. A reaper expired it and a successor took
  over; an operator requeued; a takeover happened.

Collapsing the two is how a store flush becomes a fleet-wide eviction:
every live holder renews, every renewal finds no key, every holder reads
that as *lost* and drops its work at once — while nothing was wrong with
any of them. So renewal **re-establishes** on lapsed and **stops** on
lost, and an unanswerable store on the renewal path is *unknown* rather
than lost: the holder keeps working and retries, because failing closed
there evicts every live executor the moment the store blinks. That is the
one deliberately fail-open path. Adoption and reaping stay fail-closed —
a store that cannot answer is read as "peer-owned", so an outage never
turns live peers' work into orphans.

The flush has a second face, on the reaper's side: an absent lease looks
exactly like an orphan, and a reaper that adopts on first sight adopts
every live holder's work one renewal tick before each holder republishes.
Require an untracked item to be seen unowned across a **full TTL** before
adoption, with any republish resetting the clock; a live owner republishes
within one renewal interval, which is shorter than the TTL by construction,
and a genuinely dead owner never does. Skip the grace where the store
cannot see peers at all — there it can only delay.

Two more distinctions follow once a lease governs a *resource* rather than
a job. **A lease answers "who reaps this", not "who may use it."** Split
the operation in two: an unconditional *take* on the acquire path, because
a resource keyed deterministically by its owner legitimately lands on a
different instance next turn and a conditional claim would strand it until
the old lease expired; and a conditional *claim* — unowned or already mine
— that gates every adopt and reap path. And give the lease a state: *owned*
versus *being destroyed*. A take is refused against a destroying lease, so
the resource cannot be re-acquired between a destroy path's claim and its
actual stop.

**The destroying state is held, not written.** Written once, it carries the
ordinary TTL and nothing refreshes it — a stop that outlives the TTL lets a
peer take the resource mid-stop, which reopens the window the state exists
to close. Refresh the marker on the renewal cadence for the stop's whole
duration, and make the **final release the heartbeat's own last act**, after
its loop has stopped: a refresh still in flight when the caller releases
would otherwise land after the release and re-mark a resource whose stop
already completed. Keep the TTL finite on purpose — the heartbeat dies with
its process, so a destroyer that crashes mid-stop still frees the resource
one TTL later instead of marking it undestroyable forever.

The condition, from a tree where none of this applied: where the lease is a
column on the same durable row as the work, and every write is
attempt-fenced, a renewal that updates zero rows has one meaning — the
attempt is over — and absent and lost are one fact with nothing to
distinguish. The distinctions above are for a lease store that lives apart
from the resource it governs and can lose or serve state independently of
it.

## Renewal can carry truth, but truth must not gate renewal

The renewal write is a natural bus for cheap liveness metadata — current
step, items processed, a phase marker — one conditioned write carrying both
"I am alive" and "here is where I am." Take the ride, but keep the
dependency one-directional: renewal happens on schedule *whether or not*
there is progress to report. The moment renewal waits on progress
computation, a stall in the work stalls the heartbeat, and the system reads
a live-but-stuck executor as a dead one — the two states the entire
mechanism exists to distinguish.

Clean shutdown completes the loop from the other end: **release the lease
explicitly** rather than letting it lapse, so a successor takes over
immediately instead of waiting out the stale window. The stale window is
the price of *crash* detection; paying it on every orderly restart is
pure waste.

## Renewal must not queue behind the work

The stall the previous section guards against — renewal waiting on progress
computation — has a quieter twin: renewal waiting on the *resources* the
work holds. The renewal is a write, and a write needs a connection, a
transaction slot, a writer lock. If it takes those from the same bounded
pool the work draws on, then under exactly the load the lease exists to
survive, the renewal queues behind the work: the pool is full of long
transactions, the renewal's acquire times out, the executor logs "renewal
failed, will retry", and after a few retries a live executor that was
merely busy is reaped as dead. A storage backend for a secrets server
shipped precisely this — its transaction pool was sized to the connection
pool, so a burst of transactions starved the high-availability lock's own
renewal — and the fix was one line: the transaction limit is the connection
limit minus one, so the lock's heartbeat and non-transactional operations
always have a slot.

The rule is a reservation, and it has an engine-shaped condition:

- **On a pooled multi-writer engine, reserve capacity for the control
  path.** The renewal — and the lock acquisition, and whatever else proves
  liveness — draws from a slot the work cannot take: a dedicated connection,
  or a cap on the work's transactions set one below the pool's size. The
  measurable is the renewal's wait under a saturated pool: with the
  reservation it is bounded by the renewal itself; without it, by the
  longest transaction ahead of it.
- **On a single-writer engine the reservation does not exist, and
  pretending it does makes things worse.** An embedded store with one
  serialized writer queues every write, on every connection, behind the
  write in progress; a dedicated renewal connection gains nothing and
  *loses* something, because it carries a busy-timeout that converts
  "waited behind a long write" into "failed", where the shared writer's
  queue would have waited and succeeded. Measured with a managed project's
  own parameters (busy-timeout 5 s, TTL 120 s, renewal every 40 s): a 6 s
  write held the shared-writer renewal for 6 s and it succeeded; the
  dedicated connection failed at 5.5 s with the engine's lock error. Here
  the bound to state is different — **the longest write transaction in the
  system must be shorter than the TTL minus the renewal cadence** — and it
  is a property of the work, enforced by chunking large writes, not by a
  slot the engine cannot give.

Which engine you are on decides which rule applies, and the tell is whether
two connections can hold write transactions at once. Either way the check
is the same: name the resource the renewal write needs, find who else holds
it under load, and put a number on how long the renewal can wait before the
lease is lost.

## Expiry has an owner and a policy

A lease is a created resource, and it names its reaper at creation
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): some
supervised sweep owns "find expired leases and act." *Act* means issuing a
verdict through the state machine's door, per the job's class — requeue at
recorded position, park for a decision, or fail with reason — which is
[terminal-state-recovery](./terminal-state-recovery.md)'s verdict table
applied mid-flight rather than at boot. What the reaper never does is
delete or silently reset: an expired lease is evidence *about an attempt*,
and the attempt's lineage (attempt count, prior holder, expiry reason)
feeds the retry and escalation decisions downstream.

Where no lease evidence exists at all — bare status flips, anonymous claims
— the reaper is forced into the degraded two-snapshot observation protocol
described in
[stuck-reaping](../../delivery-guarantees/techniques/stuck-reaping.md).
That protocol is the floor for short-lived work; for jobs, treat needing it
as a signal that the claim schema is missing its lease columns.

## Scope: one lease per what?

- **Per job** — the default this technique describes: fine-grained, lets
  jobs fail over independently, costs one renewal stream per live job.
- **Per runner** — a single leadership lease electing which process hosts
  the job machinery at all, with per-job claims hanging under it. Right
  when jobs are cheap and numerous and the real risk is two whole runtimes
  (an old instance surviving an upgrade, a second launch) fighting over the
  queue. The leadership election itself belongs to
  [background-jobs](../../background-jobs/techniques/loop-supervision.md)'
  supervision discipline; choose the scope deliberately and document which
  failure the lease is for — a dead *job* or a dead *host*.
