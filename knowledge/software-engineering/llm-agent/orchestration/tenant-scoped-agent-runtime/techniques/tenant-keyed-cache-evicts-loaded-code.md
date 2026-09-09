---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: tenant-keyed-cache-evicts-loaded-code
status: forged
stage: multi-service
laws: [creation-names-reaper, derivation-names-recomputation]
shared_with: []
use_when: [a process-wide singleton keeps serving the first tenant that built it, two tenants install extensions under the same name, a tenant switch still reads the previous tenant's state, deciding what a cache keyed on the tenant must evict alongside its entry]
---

# Tenant-keyed caches and loaded code

Keying a registry by tenant prevents one obvious singleton leak, but does not
automatically isolate the modules and resources its entries reference. Treat
registry invalidation and loaded-code lifetime as related, distinct contracts.

## Key the derivation

Include stable tenant identity, relevant configuration/code revision and credential
generation in tenant-derived cache keys. A home path is usable only if the system
enforces its ownership mapping; two tenants configured with the same path do not
become isolated because the string was normalized.
This is [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation).

Coordinate cache creation so concurrent misses cannot publish conflicting objects.
Bound size, retain in-flight references safely, invalidate on rotation/removal and
close owned resources after the final user releases them.

## Module eviction is conditional

Some loaders cache modules by import name. Replacing an entrypoint can leave
nested imports or callbacks holding old tenant state. Removing cache entries
does not destroy those objects or stop their tasks. Evicting global names on every
tenant switch can itself race with another tenant's import or running code.

Prefer shared stateless code with explicit tenant state, tenant/version-qualified
namespaces where the loader supports them, or separate execution boundaries for
incompatible or untrusted extensions. A namespace alone does not isolate native
globals, filesystem access or arbitrary process memory.

For a loader that deliberately supports serial unload/reload, establish quiescence,
dispose subscriptions/tasks, remove all owned module names and references, then
load and publish the new registry. Match package boundaries precisely; a textual
prefix must not remove another package. Follow the actual loader's semantics,
not an assumed portable module-cache API. The lifecycle obligation is
[creation-names-reaper](../../../../_laws.md#creation-names-reaper).

## Test without hiding production leaks

Clean fixtures between isolated tests, but also run two tenants concurrently
without resetting global caches between them. Use the same extension name with
nested imports, switch back to the first tenant, rotate configuration and unload
while another operation holds a reference. Assert correct code and tenant state,
and eventual release of owned resources.

A legacy injection pointer can remain temporarily if required by callers, but
bind injections to an explicit tenant/version. Do not automatically adopt an
unknown global object under whichever tenant happens to resolve next. Record
the compatibility boundary and retirement condition.

Separate processes avoid sharing one language module cache but still have costs
and may share files, credentials or external services. They are an isolation
option, not a claim that every remaining boundary is free or complete.
