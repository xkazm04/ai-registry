---
layer: technique
type: technique
subject: engine-integration-safety
technique: single-instance-lease-and-drain
status: forged
laws: [refuse-rather-than-destroy, one-authority-per-quantity, unmeasured-is-not-a-pass]
shared_with: []
use_when: [two automated paths can drive the same application at once, designing a batch that needs exclusive access, a concurrent run produced garbage results]
---

# Single-instance lease and drain

The concern: serialising every path that can drive a non-reentrant application, through one
registry that all of them contend on, and finishing a batch by draining what is in flight
rather than cancelling it.

Non-reentrancy is a property of the callee: a workspace lock, a single-instance mutex, an
on-disk cache with one assumed writer. The tool cannot remove it and must not race it. The
observable symptom of racing is not a clean error — it is two runs producing results that
are each subtly wrong, or one run attributing the other's interference to itself.

## Procedure

**1. Enumerate every path that can reach the application, then make them share one
registry.** A request handler, a background worker, a scheduled sweep, an interactive
control, a direct call from a tool. Route-versus-route mutual exclusion is the easy half
and the insufficient half; the background worker is the one that gets forgotten, and it is
the one running while nobody is watching.

**2. Key the lease by the scope actually touched, and define conflict as containment, not
equality.** A whole-workspace lease covers every member lease inside it, in both
directions, because the wide run touches the narrow one's rows and boots the same single
application. Two narrow leases over disjoint scopes may proceed concurrently only if they
genuinely cannot both need the application at once. Write containment as an explicit
function; deriving it ad hoc at each call site is how the worker ends up with a different
rule from the handler.

**3. Acquire a batch's leases all-or-nothing, up front.** Take every key the batch needs
before starting any of them; if any is held, take none, and refuse the whole batch naming
the specific conflicting scope. Partial acquisition is the worst of both designs — it
deadlocks against a symmetric caller and leaves half the batch stranded when it refuses.

**4. Release in a guaranteed-cleanup block, on every path.** A thrown exception that
strands a lease converts a transient failure into a permanent outage that only a restart
clears. This is the single most common lease defect in practice.

**5. Make the held lease readable, not just enforceable.** Expose current holders — scope
and acquisition time — through a status read, and surface it in whatever interface people
trigger runs from. A visible "busy" state turns a surprise refusal into an expected wait,
and it is the difference between a guard people trust and a guard people work around.

**6. Refuse an overlap with a scope-naming message and let the caller retry.** The refusal
names which scope holds the lease and since when. A client may retry once after a short
backoff; it may not escalate, and it certainly may not clear the holder.

**7. Drain, do not cancel.** When a batch ends — normally or by shutdown — let in-flight
items finish, and *count* what you drained: how many completed, how many were still queued,
how many were abandoned. A run that cancels its remainder and reports "complete" has
recorded a number whose basis is silently different from the one before it. Under
`unmeasured-is-not-a-pass`, abandoned items are unmeasured, not passed.

## Decision rules

- If the resource is non-reentrant, every path takes a lease — including the one you are
  certain runs alone. The one that "runs alone" is the background worker.
- If a lease is already held, refuse or queue. Never force, never break a lease on age
  alone: a long-held lease usually means slow legitimate work, and a stale-lease reclaim
  needs positive evidence that the holder is dead, not a timestamp.
- If the lease registry lives in one process and another process can also reach the
  application, the registry is a lie. Either move it to shared state both can read, or add
  an application-level guard the second process will hit.
- If a batch spans N scopes, that is N keys taken atomically, not N sequential
  acquisitions.
- If a refusal is not overridable, say so in the message and mean it. A lease conflict is
  precisely the class of guard a human cannot safely wave through, because the harm is a
  data race rather than a risk they are accepting on their own behalf.
- If two subsystems both need this, they import one lease module; they do not each keep a
  local map. Two registries answering "is it busy" is worse than one and worse than none.

## When not to use this

**Reentrant callees** need no lease and are slowed by one; verify reentrancy rather than
assuming it, but do not add ceremony where the callee genuinely supports concurrency.

**Cross-machine coordination** is a different problem. An in-process registry is correct
and sufficient for one host; the moment two hosts can drive the same workspace, you need a
lease with an owner identity, an expiry, and a liveness check — and its stale-reclaim rule
becomes the hardest part of the design rather than an afterthought.

Where a produced-content batch takes this same lease over the same application, that batch
is a *consumer* of this technique. Its acceptance semantics — what a drained item's verdict
means for the content — belong to the content pipeline's own subject, not here.
