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

A facade shared across tenants must not capture one tenant's store in its
constructor and use it for everyone. Resolve an authorized tenant-bound handle
at each operation boundary, or inject an explicitly tenant-bound dependency.
An instance dedicated to one known tenant can bind its handle during construction.

## Resolve once for the operation

Resolve tenant identity and configuration through the shared authority, validate
the storage mapping, then acquire the appropriate handle or pool lease. Capture
it for the whole transaction; a nested context switch must not send later writes
to a different tenant's store. This applies
[one-validation-door](../../../../_laws.md#one-validation-door).

Key tenant-derived handles by all relevant identity, address, configuration and
credential-generation inputs. An address alone does not prove isolation: tenants
can share an endpoint or be misconfigured to share a path. Reject unintended
aliasing or enforce the shared store's tenant authorization contract.

One handle per tenant is not mandatory. A shared connection pool can be correct
when every operation supplies verified tenant identity and session state is reset
before reuse. Conversely, two different handle objects can still access the same
unprotected data. Test data isolation rather than object inequality.

## Lifetime and errors

Single-flight or lock concurrent creation and close a losing duplicate safely.
Use bounded backoff for repeated open failures, with explicit retry after relevant
configuration changes. Required-store failure is unavailable, not an empty result.
Cache limits and a reaper must account for in-flight transactions and tenant removal.

Stable logical identity does not require one object to live forever. Rotation or
eviction may replace a handle while preserving the tenant/resource identity;
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse) concerns that
logical association. Do not let callers retain an expired handle indefinitely.

Keep all tenant-derived memoized state keyed or scoped, including row counts,
current IDs and failure backoff. A singleton facade's unkeyed auxiliary field can
reintroduce the leak even when its main handle cache is correct.

## Choice and tests

Prefer one instance per tenant when ownership is known and that is simpler.
A router can hold a map of tenant instances; a process-wide parent does not force
all its dependencies to be singleton stores. Use call-time resolution where it
helps existing shared entrypoints, and skip caching when open cost is negligible.

Interleave two tenants through the same facade, reuse pooled connections, change
scope during a transaction, rotate credentials, collide addresses and remove a
tenant while work is in flight. Verify both the correct data and resource cleanup.
