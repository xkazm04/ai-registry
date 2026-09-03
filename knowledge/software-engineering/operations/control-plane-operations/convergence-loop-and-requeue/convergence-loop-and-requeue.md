---
layer: golden-path
type: golden-path
subject: convergence-loop-and-requeue
status: forged
use_when: [building a loop that drives observed reality toward a declared record, a trigger stream that loses events must still converge, bursts of triggers for one key are doing N times the work for one outcome, deciding what a failed convergence pass does next, shutting down a converger that holds no durable queue]
techniques:
  - told-that-not-why
  - keyed-queue-with-earliest-wins
  - per-key-exclusion-under-a-global-cap
  - error-policy-as-a-separate-function
  - drain-a-derived-queue
---

# Convergence loops and requeue

A convergence loop takes one key at a time, reads the whole declared state for
that key, reads the whole observed state for that key, and makes the second
look like the first. Then it decides when to look again. That is the entire
shape, and every property worth having follows from one refusal at the centre
of it: **the loop is told *that* a key needs attention, never *why*.** The
trigger — the record's own change, a dependent's change mapped back to it, a
timer, an operator's bulk sweep, a retry after a failure — collapses into a
bare key before the loop sees it, and the reason is kept for tracing and for
nothing else.

That refusal looks like lost information and is actually the whole safety
argument. A loop that could branch on the reason would have correctness that
depends on delivery: a dropped notification becomes a branch never taken, and
the system is wrong rather than late. A loop that cannot branch on the reason
has correctness that depends only on being *run*, at some point, after the
change — so a lost trigger costs latency and nothing else, and every mechanism
below is free to treat delivery as an optimisation. This is the same doctrine
the wider corpus states one level up, in
[realtime-events](../../../client-architecture/realtime-events/realtime-events.md):
push is an optimisation over refetch, never the source of truth. Here it is
applied to work rather than to reads, and it acquires a second half: because
notification is only an optimisation, the loop needs a source of eventual
truth that is not the notification stream, and the only honest one is
**re-running the key on a period whether or not anything told it to**.

## What this subject owns, and what it borrows

This subject owns the loop and the queue in front of it: the level-triggered
pass, the requeue decision that says when the key is next looked at, the
deduplicating keyed queue that turns a burst of triggers into one pass, the
composition of per-key exclusion with a global concurrency cap, the error
policy as a function *separate* from the pass, and the drain. The boundaries
against its neighbours are sharp, and drawing them wrong is how a converger
grows a second, worse copy of somebody else's discipline.

[concurrency-guards](../../../backend-platform/work-execution/concurrency-guards/concurrency-guards.md)
owns exclusion itself — what makes two invocations the same operation, the
keyed in-flight set, the acquire and release doors, and the rule that a
duplicate is a duplicate because the design says so. This subject does not
re-derive any of that; it *composes* it. What is new here is that exclusion
stops being a gate a caller passes and becomes a property of a queue: the same
key is deduplicated while it waits, held rather than run while its twin is in
flight, and released the instant that twin finishes — one mechanism doing at
queue time what a guard does at call time, with no reconciler ever asked to
remember to take a lock. Read there for what a key is; read here for what a
queue does with a second arrival for a key it already holds.

[job-coordination](../../../backend-platform/work-execution/job-coordination/job-coordination.md)
and
[delivery-guarantees](../../../backend-platform/work-execution/delivery-guarantees/delivery-guarantees.md)
own durable work: the record that outlives its executor, the atomic claim, the
renewed lease, the dead-letter lane, the promise that survives a crash. This
subject owns none of it, and the reason is the sharpest boundary in the
territory. **Every queue here is in-memory, and that is a design decision
rather than an omission.** A converger's queue holds no information that
cannot be recomputed: each entry is "look at this key again", and a restart
recovers the complete set by re-reading every declared record and enqueueing
all of them. The queue is derived state, so losing it costs one full pass, not
one lost promise. A durable queue faces a force this loop never faces — that
the work item *is* the only record of the intent — and every mechanism it
grows to survive that force (the claim, the lease, the ledger, the reaper) is
machinery a converger would be paying for nothing. The test for which side of
this line a system is on: if the queue were emptied right now, could the
system reconstruct it from state it already holds? Yes means this subject; no
means theirs.

[retry-backoff](../../../backend-platform/resilience/retry-backoff/retry-backoff.md)
owns failure classification and the mathematics of delay — the four classes,
jitter as herd control, the retry budget that bounds amplification, the five
terminal states. This subject owns exactly one thing retry does not: the
**shape of the seam**. A convergence pass returns its error rather than
handling it, and a separate policy function turns that error into a next-look
decision. Everything the policy decides *with* — is this transient, does the
dependency state its own recovery time, has this key failed enough to stop
attempting — is borrowed from there and never restated here.

[fleet-orchestration](../../../llm-agent/orchestration/fleet-orchestration/fleet-orchestration.md)
already states this subject's central doctrine at the scale of a session
registry: signals first, sweeper second, with the sweeper filling exactly the
gaps signals leave. A convergence loop is that pattern collapsed into one
component — the trigger stream is tier one, the periodic requeue is tier two —
and the collapse is what makes it easy to lose. When both tiers write to one
queue and the queue erases the difference, nobody notices that tier two has
been switched off until the first missed notification, months later.

Two sibling subjects hold the halves this one deliberately does not.
Contracts written *on the record* that let independent writers converge on it
safely — the marker that blocks deletion until a dependent confirms cleanup,
the ownership edge, per-field write ownership, the gate that inspects a write
before it lands — belong to
[declarative-resource-lifecycle](../declarative-resource-lifecycle/declarative-resource-lifecycle.md).
The replica the loop reads from, its cursor, its forced full re-read after a
desync, and the completeness barrier that must open before the first pass runs,
belong to
[watch-cache-and-resync](../watch-cache-and-resync/watch-cache-and-resync.md).
This subject assumes both: it assumes a record it
can read the whole of, and it assumes a local view that is complete before it
starts. And it inherits from both the stance that makes the new subcategory
coherent — **concurrent writers are assumed and made safe, not resolved by
electing one.** Single-active election is
[concurrency-guards](../../../backend-platform/work-execution/concurrency-guards/concurrency-guards.md)'
ground, and a converger that needs it has usually mistaken a non-idempotent
pass for a coordination problem.

## The pass is idempotent and full-state, or nothing else works

Because the pass cannot know why it was woken, it must be correct when woken
for no reason at all. That is a stronger requirement than "does not crash on a
second run": the pass reads current declared state and current observed state
*at the moment it runs*, computes the difference, and applies it. It does not
consume a delta, does not assume the previous pass finished, and does not
assume it is the first pass since the change. Run it twice against an
unchanged world and it must converge once and then do nothing — which is also
the cheapest test the discipline has, and the one that catches the failure
before production does.

The naive reading is that this is a purity rule about side effects. It is not;
it is an economy. Full-state passes are what let every other mechanism here be
lossy on purpose. Deduplication may collapse ten triggers into one pass
because the tenth pass would have read the same world as the first.
Coalescing may throw away every arrival but the earliest. Drain may discard the
whole queue. Each of those is a discard of information, and each is safe only
because the information was never load-bearing —
[told-that-not-why](./techniques/told-that-not-why.md) holds the construction
that keeps it that way, including the one configuration that quietly repeals
it.

## Requeue is the loop's only clock

A pass ends by saying when the key should be looked at next, and there are
exactly two honest answers. **Look again after a stated interval** is the
default and the safe one: it is the periodic sweep, per key, expressed as the
pass's own return value rather than as a global timer, so the cadence can
differ per key and per outcome — a key that just converged asks for a long
interval, a key waiting on something external asks for a short one. **Wait for
a change** is the optimisation: it says this key needs no clock, only a
trigger. It is correct exactly when the trigger stream is complete, and the
trigger stream is never complete, which is why choosing it is a decision to
record rather than a default to inherit
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud) — the safety
net that is off by configuration protects the examples and not the
installations).

Two rules keep requeue from becoming a second scheduler. First, **the interval
is measured from the pass's completion, not from its start** — measuring from
the start means a pass slower than its own interval requeues itself into the
past and the loop spins on one key. Second, **a requeue is a request, not a
reservation**: it enters the same queue as every trigger and is subject to the
same deduplication, so a key that is triggered externally before its interval
elapses runs once, early, and not twice. The moment requeue gets a private
path to the executor, the queue's guarantees stop being guarantees.

## One slot per key, and the earliest time wins

The queue's unit is a key, not an event. A key that is already waiting does
not get a second entry; the existing entry is *moved* to whichever of the two
times is earlier. This is the property the wider corpus does not otherwise
hold — exclusion is modelled at the worker, and capacity is modelled at the
door, but nothing models what a queue owes a second arrival for a key it is
already holding — and getting it right is worth stating as a rule: **coalesce
at the queue, not at the worker.** A burst of triggers that all mean *converge
this key* costs one pass; an urgent arrival for a key scheduled an hour out
pulls that pass forward rather than adding one; and a key whose twin is
currently running is parked rather than started, then released the moment the
twin finishes. The parked entry is not a queue position — a second arrival for
an already-parked key is dropped entirely, because the pass it is waiting for
has not started yet and will read its changes anyway.

Two refinements earn their place and one hazard comes with them. A **trailing
debounce** — a delay *added* to the entry's expiry, and re-added on each
arrival — turns a key that is churning into one pass after the churn stops,
which is the difference between a converger that follows a rapid phase
transition and one that reconciles every intermediate state. Its hazard is
exact and must be written where the knob is: a debounce longer than the key's
inter-arrival time postpones the pass *forever*, so a value tuned against a
calm object hides updates entirely on a busy one. And every scheduled time is
**clamped to a derived ceiling** before it reaches the timer, because a caller
that asks for an absurd interval — an overflowed arithmetic, a
misconfiguration, a "never" expressed as a large number — must be corrected at
the door rather than crashing the queue
([limits-are-derived](../../../_laws.md#limits-are-derived)). The mechanism,
its ordering rules and the failure each one prevents are
[keyed-queue-with-earliest-wins](./techniques/keyed-queue-with-earliest-wins.md).

## Two limits, and they are genuinely independent

A converger carries two capacity numbers that are constantly confused for each
other. **Per-key exclusion** says one pass per key at a time, always, and it
is not a tuning parameter — turning it off means a key racing itself, which is
the one failure a full-state pass cannot survive, because two passes both read
the world before either writes it. **The global cap** says how many passes run
at once across all keys, and it is purely an economy: it bounds the load the
converger puts on whatever it reads and writes, and it is the number an
operator moves. A design that expresses exclusion by setting the global cap to
one has bought serialisation of everything to get exclusion of one thing, and
will find it under load; a design that expresses capacity by relying on keys
rarely colliding has no exclusion at all on the day they do. Holding both, and
reporting the three populations they produce — waiting, parked-behind-a-twin,
running — as three separate numbers rather than one depth
([count-carries-predicate](../../../_laws.md#count-carries-predicate)) is
[per-key-exclusion-under-a-global-cap](./techniques/per-key-exclusion-under-a-global-cap.md).

## The error policy is not the reconciler

The pass returns its error; it does not decide what to do about it. A separate
function receives the record, the typed error and the shared context, and
returns the same next-look decision a successful pass returns. Folding the two
together is the default mistake, and it fails in three ways at once: the retry
cadence becomes untestable without executing the side effects, every early
return inside the pass grows its own ad-hoc delay, and the pass's error stops
being a value the caller can classify because it was consumed where it was
raised ([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).
Split them and the retry policy is a pure function over a typed error — the
cheapest thing in the system to test, and the natural place for the borrowed
classification, the borrowed backoff and the borrowed budget to land. The seam,
what belongs on each side of it, and why the policy must be allowed to give up
are [error-policy-as-a-separate-function](./techniques/error-policy-as-a-separate-function.md).

## Drain, when the queue is worth nothing

Shutdown for a converger is unlike shutdown for a queue that holds promises.
[admission-queue](../../../backend-platform/work-execution/admission-queue/admission-queue.md)'s
drain must dispose of every waiting entry — finish, park or revoke — because
each entry is a commitment somebody is owed. Here the entries are derived, and
the correct disposition for all of them is to **abandon them**: the successor
re-reads every record and re-enqueues the world. What drain must protect is
not the queue but the *in-flight passes*, each of which may be halfway through
a sequence of external effects. So drain closes the trigger door first, lets
running passes finish under a bounded deadline, and offers a second, explicit
signal for the operator who has decided that waiting longer is worse than
stopping — with the honesty that an aborted pass is not a rolled-back pass.
The full shape, including the requeue that has nowhere to go during drain and
the test that tells you whether your queue is really derived, is
[drain-a-derived-queue](./techniques/drain-a-derived-queue.md).

## What "done" looks like for this subject

A convergence loop meets the bar when: the pass takes a key and reads the
world, and no code path anywhere consults why it was woken; running the pass
twice against an unchanged world is a test that exists and passes; every key
has a stated next-look interval and the keys that opted out of one are a short,
deliberate, reviewed list; a burst of triggers for one key produces one pass
and an urgent trigger for a distant key pulls it forward; a key never runs
concurrently with itself and the global cap is a number an operator can change
without touching that property; the queue reports waiting, parked and running
as three numbers; the error policy is a separate function with its own tests
and no side effects; and shutdown finishes what is running, abandons what is
waiting, and can say which of the two happened to any given key.

## The techniques

- [told-that-not-why](./techniques/told-that-not-why.md) — the reason erased
  from the queue key, the idempotent full-state pass it forces, and the
  periodic requeue that makes delivery an optimisation.
- [keyed-queue-with-earliest-wins](./techniques/keyed-queue-with-earliest-wins.md)
  — one slot per key, earliest-time-wins on re-arrival, parking behind an
  in-flight twin, trailing debounce, and the clamped deadline.
- [per-key-exclusion-under-a-global-cap](./techniques/per-key-exclusion-under-a-global-cap.md)
  — the two independent limits, why neither substitutes for the other, and the
  three populations a converger must count separately.
- [error-policy-as-a-separate-function](./techniques/error-policy-as-a-separate-function.md)
  — the pass returns its error, a pure policy decides the next look, and what
  each side of the seam is allowed to know.
- [drain-a-derived-queue](./techniques/drain-a-derived-queue.md) — close the
  door, finish in flight, abandon the rest, and the derived-queue test that
  says whether abandoning is safe.
