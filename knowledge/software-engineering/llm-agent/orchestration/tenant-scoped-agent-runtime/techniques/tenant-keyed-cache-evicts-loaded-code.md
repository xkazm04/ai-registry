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

# Tenant-keyed cache evicts the code it loaded

A long-lived process caches expensive things: a registry of discovered
extensions, a resolved capability roster, a manager object that owns loaded
contributions. Each cache was built when the process served one tenant, and
each is a single slot. Keying it on the resolved tenant is the obvious
correction and it is only the **first floor** of the fix. The second floor
is that the cached object was never the only state involved — the code it
loaded lives in a cache the runtime owns, keyed by name and indifferent to
tenancy, and rebuilding the registry does not touch it.

Both floors have to be crossed. A design that stops after the first has a
correctly keyed cache serving objects that resolve, internally, to the
previous tenant's already-loaded code.

## Floor one: a single slot is invisible to a task-local switch

The naive guard on a process-wide singleton asks whether the
process-level setting changed since the object was built, and rebuilds if
it did. Under this subject's scope that guard is blind by construction: the
tenant switched in a task-local variable, the process-level setting never
moved, and the guard sees nothing. The singleton keeps serving the first
tenant's object to every other tenant, quietly, for the life of the
process — including to tenants whose extension code captured a storage path
at registration time and is now writing into a stranger's directory.

The correction is to key the cache on the **resolved** tenant — the value
the resolver returns after consulting the scope, normalised so that two
spellings of the same address are one key — so that both the task-local
path and the process-level path are covered by one mechanism rather than by
two checks that must agree. Re-entering a tenant seen before then reuses its
cached object, which is the performance the cache existed for, and a switch
gets its own.

The key is the recomputation contract
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
a cached registry whose key does not name the input it was derived from is
a value nobody can invalidate correctly, because nobody can say what it was
derived *for*.

## Floor two: replacing the entry point does not replace what it imported

This is the failure that survives a correct keying, and it is worth stating
precisely because the reasoning is not obvious.

Loaded contributions are imported under a name — an entry point, and
beneath it whatever that entry point imports. The runtime's module cache
maps **names to loaded modules**, and a repeated import of a name already in
that cache returns the cached module without re-executing anything. Nested
names are cached as their own entries and are bound as attributes of the
parent, so the cache holds both the entry point and each thing beneath it,
independently.

Now two tenants install an extension under the same slug. A fresh registry
is built for the second tenant and re-imports the entry point — but the
entry point's own relative imports resolve, from the module cache, to the
**first tenant's** already-loaded nested modules, along with every piece of
module-level state those captured when they first executed. The second
tenant's code is half its own and half its neighbour's, with no error at
any point. The registry is correct; the objects inside it are not.

There is a second-order version of the same trap. Removing a name from the
module cache does not destroy the module object when something still holds a
reference to it, and a later import of that name produces a *different*
module object than the one still referenced. So a partial eviction can leave
two live copies of the same module — one reachable through the cache, one
through a stale reference — with independent module-level state.

So the rule is: **evict the entry point and every name nested beneath it,
before re-importing** — matching on the entry point's name and on that name
followed by the nesting separator, so no descendant survives. Do it in both
places that discard a load: the reload path within one tenant, and the
switch path between tenants. And drop the reference to the discarded object
in the same operation, so no stale copy stays reachable
([creation-names-reaper](../../../../_laws.md#creation-names-reaper): the
loader that put those names in the cache is what takes them out).

## The whole cache is dropped between isolated runs

Test isolation deserves its own sentence because it is where this defect
hides longest. A suite that resets only the single-slot pointer leaves the
keyed cache and the module cache populated, so a contribution loaded by one
test serves the next — and the leak presents as an order-dependent failure
that disappears when the failing test is run alone. The isolation fixture
therefore drops the **entire** keyed cache and purges every loaded
contribution's names from the module cache between runs, not just the
pointer.

Two consequences follow. Host-owned registrations that deliberately survive
a routine unload — persistent registries the runtime, not a tenant, owns —
must be cleared explicitly by that reset, because "survives an unload" and
"survives a clean slate" are different contracts and only the first one is
what the unload path implements. And the regression coverage must exercise
the **task-local** switch, not only the process-level one: a test that
switches tenants by changing the process setting passes against the
single-slot guard this technique exists to replace.

## Compatibility with an existing injection point

Where an older single-slot name is still monkeypatched by existing callers
— test code, embedders — the migration keeps that name as a thin "last
object returned" pointer rather than deleting it. When it references an
object the keyed cache has never seen, that is an explicit injection: adopt
it into the cache under the currently resolved tenant rather than discarding
it. This is a compatibility shim with a real cost — it is a second writer to
the cache — and it earns its place only while callers outside the module
still exist. It is named here so it is adopted deliberately and retired
deliberately, rather than becoming the design.

## Decision rules

- Key every process-wide cache that captures tenant state on the resolved
  tenant, normalised, so the task-local and process-level paths are covered
  by one mechanism.
- Never guard a cache by asking whether a process-level setting changed; a
  task-local switch does not move it.
- On every load, reload and tenant switch, evict the contribution's entry
  point **and every name nested beneath it** from the module cache before
  re-importing.
- Drop the reference to a discarded object in the same operation that
  evicts its names, so no second live copy remains reachable.
- Between isolated runs, drop the whole keyed cache and purge every
  contribution's names; clear host-owned persistent registries explicitly.
- Write the regression against the task-local switch, and include a case
  where two tenants use the same contribution name with a nested import.
- Keep a legacy injection pointer only while external callers use it, and
  adopt an injected object into the keyed cache rather than discarding it.

## When not to use it

A runtime whose contributions are all loaded once at startup and never
reloaded, in a process that serves one tenant, needs neither floor — the
module cache holding one copy of everything is exactly right. A runtime
that isolates tenants by process rather than by scope needs neither either;
the operating system's address spaces do this work perfectly and for free.
The technique is specifically the price of putting two tenants' loaded code
in one address space, and if the extension surface is small enough that
per-tenant processes are affordable, that is the better trade.
