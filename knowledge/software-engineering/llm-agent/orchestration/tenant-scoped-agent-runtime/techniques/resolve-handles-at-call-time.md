---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: resolve-handles-at-call-time
status: forged
stage: multi-service
laws: [one-validation-door, identity-survives-reuse]
shared_with: []
use_when: [a shared store object serves several tenants, a handle bound in a constructor pins the first tenant that built it, deciding between one store instance per tenant and one resolving store, a lookup returns the root tenant's rows on a multiplexed runtime]
---

# Resolve handles at call time

A store object is normally built once and holds its handle: the connection,
the file, the client. That is correct and cheap when the process serves one
owner, and it is the single most common way a runtime silently pins itself
to the first tenant that touched it. The handle was resolved at
**construction time**, from whatever the scope said then, and every later
operation — from every other tenant — uses it.

This technique states the alternative: **a shared store binds no handle at
construction; every operation resolves the tenant's address through the
active scope and caches one handle per resolved address.**

## Why construction time is the wrong moment

Construction happens once, early, usually during startup, usually on a path
that has no tenant because no event has arrived. The scope, by design, is
installed at the boundary where a unit of work begins — which is later.
Whatever the constructor reads is therefore either the process default or
the first tenant to get there, and neither is a fact about the operation
that will run in ten minutes.

The failure is not loud. A lookup runs, the store answers, and the answer is
the wrong tenant's rows — usually the root or default tenant's, because that
is what the process resolves to when nothing is installed. Operations that
*read* return a plausible empty result or somebody else's history;
operations that *write* land in the wrong store, where the owning tenant's
own reads will never find them. Both look like working software.

## The shape

Move the resolution to the operation. Each call:

1. resolves the tenant's storage **address** through the active scope,
   using the same single resolver every other subsystem uses
   ([one-validation-door](../../../../_laws.md#one-validation-door)) — not a
   local re-derivation of the path, which is the addressing hole the
   corpus's identity-bearing-keys technique names one layer down;
2. looks that address up in a **handle cache keyed by resolved address**;
3. constructs the handle on a miss, stores it, and returns it.

Three properties make this work rather than merely function.

**One handle per address, not per call.** The cache is what keeps the cost
at one resolution plus a map lookup, and it also keeps the handle's
*identity* stable per tenant — callers that compare handles, or stash one
for the duration of an operation, keep working
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse):
the handle's identity is the resolved address, which survives the object
being shared and the tenant being re-entered).

**Two tenants never share a handle.** That is the whole isolation claim, and
it follows from the key being the resolved address rather than the object
that owns the cache.

**Construction failure is bounded, not repeated.** A store that cannot be
opened must not turn every subsequent call into a fresh open attempt. The
failing address enters a bounded backoff: one caller retries after the
deadline while concurrent callers continue to see the unavailable result.
And there is a legitimate variant that raises instead of degrading —
construction-time priming, where the caller *wants* the failure — so the
resolver takes an explicit argument for that, rather than every caller
guessing.

## The rejected alternative is legitimate, and the discriminator is precise

**One store instance per tenant** is a real design and often the better one.
It is simpler, it needs no handle cache, and the isolation is structural
rather than resolved. It is what a well-factored runtime does whenever it
can.

It requires one thing: **a construction site that knows the tenant.** That
is available whenever stores are built per tenant during a tenant's own
startup — a pairing store, a per-tenant queue, anything constructed inside
the loop that enumerates served tenants. Where it is available, use it.

It is not available for objects that must exist **before routing**, or that
are held by surfaces which are process-wide by construction: the session
store an ingress adapter is handed at configuration time, a store reached
from a status endpoint that serves every tenant, a store consulted by code
that runs before the event has a tenant stamp. Those objects have exactly
one instance because the thing holding them has exactly one instance, and
call-time resolution is what makes that single instance correct.

So the discriminator, stated as a rule: **if every construction site knows
its tenant, construct per tenant; if any construction site runs before the
tenant is known, resolve at call time.** A runtime usually has both, and
that is not inconsistency — it is the two shapes applied where each is
right.

## The idempotence that makes the shared object safe

A shared, call-time-resolving store must hold **no tenant-derived state
outside the handle cache**. A cached row count, a memoised configuration
value, a "current" identifier stashed on the object during one operation —
each reintroduces the pin the technique removed, and each is easier to add
than to notice. The object's own fields describe the *class* of store; every
field that describes *a* store lives behind the address key.

The test is mechanical and worth writing: run two operations under two
different scopes against the same object instance, interleaved, and assert
each lands in its own store. A test that runs them sequentially passes
against an object that caches the last tenant it saw.

## Decision rules

- Bind no handle in the constructor of a store object that more than one
  tenant will use.
- Resolve the storage address on every operation, through the shared
  resolver, never by re-deriving the path locally.
- Cache one handle per resolved address; keep handle identity stable per
  tenant so callers may compare and stash it.
- Bound construction failure with a backoff per address; offer an explicit
  raise-on-error mode for priming callers instead of making every caller
  choose.
- Keep no tenant-derived state on the shared object outside the handle
  cache.
- Prefer one instance per tenant wherever every construction site knows the
  tenant; use call-time resolution exactly where one does not.
- Test with two interleaved scopes against one instance, not two sequential
  ones.

## When not to use it

Where the tenant is available at construction, this technique is overhead
with a subtle failure mode of its own: a handle cache that nothing ever
evicts is an unbounded accumulator of open handles, one per tenant the
process has ever served, and it needs a reaper the per-instance design
does not. And where a store's cost is trivial — an in-memory map, a file
opened per operation anyway — resolving the address per call and skipping
the cache entirely is simpler than either.
