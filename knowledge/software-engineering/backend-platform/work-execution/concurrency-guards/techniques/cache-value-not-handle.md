---
layer: technique
type: technique
subject: concurrency-guards
technique: cache-value-not-handle
status: forged
laws:
  - unknown-is-not-a-value
  - identity-survives-reuse
  - limits-are-derived
shared_with: []
use_when: [one cancelled request wedges every later caller on a shared in-flight handle, choosing join semantics on a runtime that tears down continuations, a legitimately empty result is refetched on every call, invalidating a coalesced cache while a fetch is still running, a shared mutex deadlocks a whole worker after a client disconnect]
---

# Cache the value, not the handle

The join policy in single-flight-primitives has one unstated assumption, and it
is load-bearing everywhere it holds and fatal everywhere it does not: *the
in-flight attempt eventually settles*. Join subscribes N callers to one running
attempt by handing them all a reference to the same completion handle, and
every one of them is then waiting on the same event. On a runtime that can
abandon a caller mid-wait, that event may never happen — and the guard is not
what breaks.

## The hazard: a handle that settles neither way

Some hosts tear down a request's continuation while leaving the process alive.
The caller disconnects, the host cancels its context, and the code that would
have resumed after the wait simply never runs. If that caller was the owner of
a shared in-flight handle, the handle is now permanently unsettled: it did not
succeed and it did not fail. Every later caller that joins it waits until the
whole execution context is recycled — which, on a host with a wall-clock
ceiling, presents as a long stall and a timeout at that ceiling, at near-zero
utilization, on a service that looks otherwise healthy.

Two properties make this different from the leak this subject already covers,
and mistaking one for the other sends the repair to the wrong place:

- **The lock is fine.** Release-guarantees is about a guard entry acquired and
  never released. Here the guard may release perfectly, or be reclaimed on age
  exactly as designed. What is dead is the **result channel** — the thing the
  joiners are waiting on — and no reclamation of the entry frees them, because
  they are not waiting on the entry.
- **Cleanup handlers do not fire.** The reflex repair is to clear the shared
  handle in a failure or completion handler. Neither handler runs: they are
  continuations of the same abandoned caller. Structural, scope-bound release
  — the answer release-guarantees gives for cancellation — assumes the
  releasing code eventually executes, and on this class of host that assumption
  is exactly what has been withdrawn.

## The mechanism: elect an owner, publish a value, poll

The repair is to stop sharing the thing that can fail to settle. **No caller
ever waits on a handle created by another caller.** What is cached is a
resolved *value*; what is shared is a *reclaimable claim* saying someone is
currently producing it.

- **Read first.** A caller that finds a published value for the current
  generation returns it and touches nothing.
- **Claim, or poll.** On a miss the caller tries to take the claim. The winner
  is the owner and runs the work; every loser polls the published slot on a
  short interval, and gives up with an error after a stated maximum wait rather
  than waiting forever. Polling is the whole point — it is the only wait whose
  termination does not depend on another caller's continuation running.
- **Publish, then release.** The owner writes the value and the generation it
  was fetched at, then drops the claim. Publication is gated on still holding
  the claim: an owner that was reclaimed while slow must not overwrite the
  reclaimer's value, or a third caller sees the claim free, starts a third
  execution, and the coalescing the guard exists for is gone.
- **Anchor the work where the platform allows it.** Where the host offers a way
  to keep work alive past the request that started it, the owner's execution is
  handed to it. Then a cancelled owner's fetch still completes and still
  publishes, and the design *prevents* the poisoning rather than merely
  recovering from it. Where no such facility exists, reclamation is the only
  recovery and the deadline below carries the whole weight.
- **Bound the owner.** The owner's own work carries a timeout, so a genuinely
  stuck fetch fails and releases the claim instead of holding it to the
  reclaim deadline.

## Three rules the mechanism does not survive without

**The reclaim deadline sits strictly above the owner's own timeout.** This is a
limit derived from another limit, and it must be computed from it rather than
picked ([limits-are-derived](../../../../_laws.md#limits-are-derived)): take the
owner timeout and add a headroom margin. Set the deadline below the owner
timeout and a slow-but-live owner is superseded before it can publish; under
steady arrivals the reclaimer is superseded in turn, and the guard converts a
slow dependency into a self-sustaining stampede that never publishes anything.
The owner's timeout is the primary release; reclamation is the backstop for an
owner that will never speak again.

**Store an explicit presence flag, not a null check.** Whether a value has been
fetched is a separate fact from what the value is, and a slot holding "empty"
must be distinguishable from a slot holding "nothing has been fetched"
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). Collapse
them and a legitimately empty result — no rows, no configuration, a
deliberately blank setting — is re-fetched on every single call forever, and
the coalescing cache silently becomes a per-request query on precisely the
inputs that are cheapest to cache and most common in a fresh installation.

**Invalidate by generation bump plus claim release, together.** Invalidation
increments a version, clears the value, and frees the claim. The version is the
value's identity, and every caller captures it at entry
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)): a value
published at the old generation satisfies the callers that captured the old
generation and is ignored by everyone who arrived after the bump. Releasing the
claim in the same step is what stops the new generation from waiting out a
stale owner's deadline before it may begin — and it is safe only because the
two gates already exist: the version gate stops the old owner publishing into
the new generation, and the claim gate stops it displacing the new owner. Bump
without releasing and every invalidation costs a full deadline of latency; release
without the version gate and the previous generation's answer becomes the new
generation's cached value.

## Which runtimes this is for

State the applicability as a property, never as a list of hosts: **any runtime
that may tear down a request's continuation while leaving the process alive.**
That covers request-scoped execution contexts on shared multi-tenant runtimes,
models that give each request its own sandboxed context inside a longer-lived
one, and any host that cancels aggressively on client disconnect. It
does not cover a plain long-lived server process, where an abandoned caller's
handlers still run and ordinary join is correct and cheaper. The test is not
which vendor runs the code; it is whether an abandoned wait can leave a shared
completion handle in a state no handler will ever observe. Where the answer is
yes, this technique is the join policy; where it is no, it is over-engineering
and a plain shared handle is right.

## The same hazard behind a shared lock

The value cache is one instance of a family, and recognizing the family is what
makes the technique portable. Any **shared exclusion primitive whose release is
a continuation** fails the same way on the same hosts. A storage driver that
serializes queries behind an internal mutex — acquire, execute, release —
deadlocks the entire execution context the first time one caller is cancelled
mid-query: the release never runs, and every later acquisition waits forever.
The repair there is not a value cache but the same insight applied one level
down: the driver declares that it supports concurrent connections purely to
stop the library from installing the mutex at all.

That repair is scoped, and the scope is the useful part. It is correct only
where the mutex is protecting **nothing** — independent calls, no transactions,
no read-your-writes obligation. Where the same primitive is guarding a
**consistency token** rather than an execution slot — a session bookmark
advanced per query, whose interleaving would persist a stale position and break
read-your-writes — the serialization is load-bearing and removing it trades a
deadlock for silent data staleness. The decision rule: **ask whether the shared
thing is a lock or a consistency token.** If it is a lock, delete it and let the
calls run concurrently. If it is a token, keep the serialization and replace the
cancellation-vulnerable primitive with one whose ordering does not depend on a
continuation — a single in-flight chain the host itself drives — rather than
removing the ordering.

## Decision rules

- On a host that can abandon continuations, never publish a completion handle
  into shared state. Publish a resolved value behind a reclaimable claim; every
  non-owner polls, with a maximum wait that ends in an error rather than a hang.
- Derive the reclaim deadline as the owner timeout plus headroom, and write the
  derivation beside the constant. A deadline at or below the owner timeout is a
  stampede generator, not a safety net.
- Give the cache a presence flag; never infer "not fetched" from a falsy value.
- Gate publication on still holding the claim, and gate a read's acceptance on
  the generation it captured at entry.
- Invalidate by bumping the generation *and* releasing the claim in one step;
  either alone is a defect with a different signature.
- When a shared lock deadlocks on cancellation, first ask what it protects. A
  lock over independent calls is deleted; a lock over a consistency token is
  kept and its wait mechanism replaced.

## When not to use it

On a runtime whose cleanup handlers always run, this machinery buys nothing and
costs a polling interval of added latency on every cold read plus two extra
pieces of state to keep consistent. Plain join is the right policy there. It is
also the wrong shape for a guard over a durable resource whose establishment
recurs — a connection that drops and returns — where the generation discipline
in single-flight-primitives already applies and the product is state with a
lifetime rather than a value to be published once.
