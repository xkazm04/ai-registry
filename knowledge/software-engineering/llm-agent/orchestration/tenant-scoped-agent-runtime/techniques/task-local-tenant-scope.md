---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: task-local-tenant-scope
status: forged
stage: multi-service
laws: [one-validation-door, creation-names-reaper]
shared_with: []
use_when: [one process must serve several configurations concurrently, a per-turn identity is about to be written to the process environment, a worker thread reads the wrong owner's home directory, choosing where the tenant fact lives in a shared runtime]
---

# Task-local tenant scope

A runtime that serves one owner keeps that owner's identity where a process
keeps facts: the process environment. It works because there is one owner,
and it keeps working right up until there are two — at which point the
environment is revealed for what it always was, a **single slot shared by
every thread and inherited by every child**. This technique replaces it with
a scope that belongs to the unit of work: installed at the boundary where a
tenant's turn begins, visible to everything that turn calls, invisible to
every other turn running at the same time, and unwound when the turn ends.

## Why the environment cannot be made to work

Two failures, and neither is fixable by discipline.

**Inside the process**, a name has one value. Two concurrent turns writing
the same name are a race whose winner is whoever wrote last, and the loser
does not get an error — it gets the other tenant's value and completes
successfully. Serializing turns to avoid the race gives up the concurrency
the multiplexer existed for.

**Outside the process**, the environment is the default inheritance
channel. Anything that spawns a child with a copy of the process
environment hands the union of every tenant's configuration to a process
doing one tenant's work. The agent runtimes that most need this technique
are exactly the ones that shell out constantly — tool calls, subprocess
servers, scheduled scripts — so the blast radius of the union is the whole
tool surface.

The union is also seductive because it requires no call-site changes, which
is precisely its danger: the design that is cheapest to adopt is the one
that leaks by construction.

## The scope, and the door it is read through

The tenant is installed as a **context-local variable**: a value bound to
the current unit of work, whose reads and writes are private to that unit,
which a newly spawned child unit inherits as a snapshot, and which a change
inside that child does not propagate back out of. Installing returns a
token; the token restores the previous value.

Two variables, not one, and the order matters. The first carries the
tenant's **home** — the root from which configuration, stores, memory,
skills and extension discovery are all derived. The second carries the
tenant's **credentials**. The credential scope is *built under* the home
scope, because building it means resolving the tenant's configuration, and
resolving that requires the home to already be pointing at the tenant. A
composition that installs credentials first reads the previous tenant's
configuration to decide what the next tenant's credentials are.

Both are read through **one resolver each**
([one-validation-door](../../../../_laws.md#one-validation-door)): every
path in the system resolves the home by calling the home resolver and the
credential by calling the credential resolver, and the resolver consults the
scope *before* it consults the process. That ordering is the whole
migration: hundreds of call sites keep their shape and change their
meaning, because the function they already call now answers for the active
tenant. A call site that reads the process directly is not a style
violation; it is an isolation hole, and it is found by searching for direct
reads rather than by review.

One deliberate exception exists and must be named rather than discovered: a
small number of assets belong to the **machine or the process**, not to a
tenant — a launch-time root, a host-owned asset directory — and those need
a second resolver that explicitly ignores the scope. Two resolvers that
differ only in whether they consult the override, sharing one
implementation underneath so they cannot drift, is the correct shape. One
resolver with a boolean argument is not: the argument gets defaulted, and
the default is wrong for half the callers.

## Every seam where tenant-owned code runs is wrapped

The scope is only as good as its coverage, and coverage is not a matter of
wrapping "the turn". Enumerate the seams; the list is longer than it looks
and each omission is a silent cross-tenant read:

- **Ingress startup, connect, and reconnect** — a connector authenticating
  with the tenant's own credential, including on every reconnect, not only
  the first connect.
- **The inbound handler**, before any tenant-owned code sees the event.
- **Inbound preprocessing** — anything that rewrites, enriches or
  classifies a message before the turn proper.
- **The turn itself**, including the worker it runs on.
- **Background and scheduled work** for that tenant, which runs under no
  request at all and therefore has nothing ambient to inherit.
- **Out-of-band resolution paths** — model selection, session lookup,
  status surfaces — which read the tenant's configuration without being
  part of a turn.

And the case that looks like an exception and is not: **process-level work
runs under the default tenant's scope, on purpose.** A configuration reload
that serves the whole process still has to resolve a home and still may
need a credential; running it unscoped means running it against whatever the
process happens to hold, which under isolation is either wrong or an error.
Choosing the default tenant explicitly is a decision someone can read;
leaving it unscoped is the same decision made silently.

## Propagation into workers is explicit, and it is tested

The propagation guarantee is not uniform across concurrency primitives, and
assuming it is produces the subject's most confusing bug.

A unit of work spawned by the runtime's own event-loop scheduler typically
inherits a snapshot of its parent's context automatically. A
**raw thread does not**: it starts with a fresh context, its resolver falls
back to the process, and the work lands under the wrong tenant with no error
anywhere. A **worker pool** is the trap in between, because whether it
copies the submitting context is a property of the *runtime version* rather
than of the pool's contract — a standard pool that propagates in a recent
release does not propagate in the releases before it, and a deployment
pinned below that line gets workers with an empty context. The observed
consequence was not a leak but a silent degradation: the credential
resolver correctly failed closed in the worker, and the caller's broad
exception handler downgraded that to a lossy fallback nobody was told
about.

So the rule is: **at every hand-off to a pool or a thread, copy the current
context explicitly and run the callable inside the copy** — and do it
unconditionally, in the pool wrapper rather than at each call site, so that
on a runtime which already propagates the extra copy is a harmless no-op
and on one that does not it is the fix. Do not rely on the primitive's
documented behaviour, because the version you ship on may not be the
version the documentation describes. Prove it with two tests worth more
than any amount of review — one asserting a bare thread *loses* the scope,
kept as documentation of the hazard, and one asserting the runtime's own
bridge *keeps* it.

## Unwinding is deterministic, and creation names it

Every installation is paired with a restore on the way out, in the failure
path as well as the success path
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). The
natural expression is a scoped block that installs on entry and restores in
an unconditional exit clause; a bare install with a matching restore at the
end of the function is the version that leaks on the first early return.

Nesting must restore to the *previous* value rather than to absent, which is
why the token returned by the installation is the thing that restores it —
a scope that resets to "none" turns an inner block's exit into an outer
block's leak. And because a change made inside a copied context does not
travel back, a scope installed inside a worker unwinds with the worker
whether or not anyone remembered to reset it; that is a safety net, not a
substitute for the exit clause.

## Decision rules

- Put the tenant in a context-local variable. Never write it to the process
  environment — not at startup, not per turn, not temporarily.
- Install home first, then build the credential scope under it, then
  install that.
- Give each a single resolver that consults the scope before the process,
  and route every call site through it; a direct process read is an
  isolation hole, found by search.
- Provide a separate, explicitly named resolver for machine-level assets
  that must not follow the scope, sharing one implementation underneath.
- Wrap every seam where tenant-owned code runs: ingress startup, connect
  and reconnect, inbound handling, preprocessing, background and scheduled
  work, out-of-band resolution, and the turn.
- Run process-level work under the default tenant's scope deliberately,
  never unscoped.
- Copy the context explicitly at every hand-off to a thread or pool, and
  test both the hazard and the bridge.
- Pair every install with a token-based restore in an unconditional exit
  clause.

## When not to use it

A process that will only ever serve one configuration should not pay for
this. The scope adds a resolver hop to every credential and path read, an
enumeration of seams that has to stay current as seams are added, and a
class of bug — the unwrapped seam — that simply does not exist when the
process environment is the answer. The technique starts to pay when a
second configuration must be served from the same process, and it becomes
non-negotiable the moment two tenants' turns can interleave. Below that,
one process per configuration is the cheaper and stronger isolation, and
choosing it is not a failure to adopt the standard.
