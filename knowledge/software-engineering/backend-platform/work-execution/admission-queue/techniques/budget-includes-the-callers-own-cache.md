---
layer: technique
type: technique
subject: admission-queue
technique: budget-includes-the-callers-own-cache
status: forged
laws: [gate-sees-target, count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [a resource-denominated gate refuses work on a machine that is visibly idle, the platform reports zero free capacity while the process is doing nothing, admission recovered only after a restart, choosing which free-capacity figure a bound is measured against, a pooling allocator or connection pool sits between the process and the resource]
---

# The budget includes the caller's own cache

[resource-denominated-bounds](./resource-denominated-bounds.md) settles the
unit a bound is spelled in and the charge each item pays. It leaves one term
unexamined, and it is the term that produces the ugliest failure: **the
remaining figure the gate divides into.** Charging every item its true cost is
worth nothing if the denominator is read from the wrong observer.

The bug appears wherever a **pooling allocator** sits between the process and
the resource — a caching memory allocator, a connection pool, a buffer arena,
a slab. The pool acquires from the platform in large grants, hands out pieces
internally, and on release keeps the grant rather than returning it, because
re-acquiring is the expensive part. That is the pool doing its job. The
consequence is that the platform's free-capacity figure and the process's free
capacity stop being the same number, and diverge by exactly the amount the
pool is holding but not using.

So the platform reports zero free. The process asks the platform, believes it,
and refuses work — while sitting on a large reserved-but-unused pool that is
the only capacity the work would actually have drawn from. The system reads as
saturated on a machine doing nothing. It does not self-correct, because the
pool has no reason to release and nothing is asking it to; the only repair a
frustrated operator finds is a restart, which is why this arrives in the ticket
as "it works again after a bounce."

## Ask the observer whose answer would have changed the decision

The figure the gate needs is not "what is free" but **"what is free to me"**,
and the two differ by the pool. This is
[gate-sees-target](../../../../_laws.md#gate-sees-target) applied to a
denominator: the platform's reading is a proxy, and it diverges from the target
precisely in the loaded case the gate exists for.

```
effective_free = platform_free + pool_reserved_but_unused
```

Both terms are required and each is wrong alone. The platform term alone is the
bug above. The pool term alone misses capacity the process has not yet claimed
at all, which on a cold start is nearly everything.

**Then clamp by the pool's own ceiling, or the fix over-reports.** Where the
pool is configured with a budget of its own — a fraction of the resource, an
absolute cap, a per-process quota — that budget, not the platform's total, is
the process's real horizon:

```
effective_free = min(effective_free, pool_budget − pool_in_use)
```

Omitting the clamp trades a gate that refuses work it could do for a gate that
admits work it cannot, which is the worse direction: the first wastes capacity
and the second fails the admitted item after accepting responsibility for it.
The two corrections are one change and shipping half of it is a regression with
a different symptom.

## Rules that keep the reading honest

- **Name the observer in the number.** "Free: 4.2 GB (process-effective; 0.0
  device-free + 4.2 allocator-reserved)" is diagnosable;
  "free: 4.2 GB" invites the next reader to compare it against a platform tool
  that will disagree, and conclude the gate is broken. The predicate travels
  with the figure
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
- **One function owns the reading, and admission never calls the platform
  directly.** The moment two call sites compute remaining capacity, one of them
  is the naive version, and it is whichever one was written before this bug was
  understood. Route every reader through the corrected accessor and let the
  platform call exist in exactly one place.
- **The correction is per-resource, and its absence is not a fallback.** A pool
  that exposes no reserved-but-unused figure cannot be corrected for, and the
  honest response is to say the reading is platform-level and therefore
  pessimistic under load — not to substitute an estimate of what the pool is
  probably holding. An imputed pool figure re-creates the guess this technique
  removed
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
- **Test the loaded case, not the idle one.** Idle, every version of this
  arithmetic agrees, which is why the bug ships. The regression test that
  matters constructs the state the naive reading gets wrong: platform-free at
  zero, pool holding a large unused reserve, and a non-trivial amount actually
  in use — and asserts a non-zero result. Pair it with the both-terms-non-zero
  case, which is what catches a clamp that was omitted or applied twice.
- **A pool that can be asked to release is a shed lever, not a reason to skip
  this.** Where the pool exposes a trim or drain call, returning the reserve to
  the platform is a legitimate response to real pressure — but it is a
  *remediation* the gate may choose after reading the correct figure, and
  trimming on every admission check gives back the reuse the pool existed to
  provide.

## Where the figure stops being worth correcting

The correction earns its complexity when the pool's holdings are large relative
to the bound and long-lived relative to the admission interval. Both conditions
hold for the case above and for a connection pool sized against a peak. Neither
holds for a short-lived buffer recycled within a request, where the reserve is
small, brief, and inside the measurement noise — there the platform figure is
the honest one, and adding a term that is almost always zero buys a second
thing to get wrong.
