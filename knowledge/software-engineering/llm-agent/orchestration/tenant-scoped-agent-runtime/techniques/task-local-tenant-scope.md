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

That last property covers **rebinding** the variable, not changing what it
points to. A snapshot holds the same objects as its parent, so a credential
mapping mutated inside a worker is mutated for the parent and for every
sibling that copied it — measured: a mapping changed inside a copied context
was visible to the parent, while a rebinding inside the same copy was not.
Install immutable values, or hand out a copy of the value, and test mutation
as well as rebinding.

Two variables, not one, and the order matters. The first carries the
tenant's **home** — the root from which configuration, stores, memory,
skills and extension discovery are all derived. The second carries the
tenant's **credentials**. The credential scope is *built under* the home
scope, because building it means resolving the tenant's configuration, and
resolving that requires the home to already be pointing at the tenant. A
composition that installs credentials first reads the previous tenant's
configuration to decide what the next tenant's credentials are.

The order is a **build** order; it does not have to be an install order. Two
variables installed one after the other have a moment where the home names
one tenant and the credentials another, and an exception between the two
installs, a reset run out of order, or a reset run from a copied context can
leave exactly that pair behind. Where the runtime allows it, compute every
piece first — the credentials under a temporary home binding that is removed
before anything is published — and install home and credentials as **one
immutable value in one variable**, so any reset lands on a state some whole
installation produced and a failure while building leaves nothing installed.
Two separately installed variables stay correct only while nothing
tenant-sensitive runs between the installs and every reset unwinds in strict
reverse order.

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
inherits a snapshot of its parent's context automatically, and a bridge
built to hand one blocking call to a thread on the loop's behalf may copy
it too — read that bridge's own contract, not the scheduler's. A **raw
thread** takes whatever its runtime gives it *at start*, and that is a
setting, not a constant: one runtime starts new threads with an empty
context by default, and with a copy of the starting caller's context on its
builds without a global interpreter lock or when a flag says so. With an
empty start the thread's resolver falls back to the process and the work
lands under the wrong tenant with no error anywhere.

A **worker pool** is the trap in between, and the trap is not the version.
A standard pool hands its workers callables, never contexts, and reuses each
worker for every later submission; no release of the reference runtime
captures the submitting caller's context per submission. What the thread
setting changes is only which wrong answer a reused worker gives. Where
threads start empty, a pooled callable sees no scope. The observed
consequence there was not a leak but a silent degradation: the credential
resolver correctly failed closed in the worker, and the caller's broad
exception handler downgraded that to a lossy fallback nobody was told
about. Where threads inherit at start, a worker keeps the context of the
submission that happened to spawn it, and every later submission from
another tenant runs **under the first tenant's scope** — a cross-tenant
read with no error at all. Measured with a one-worker pool and two tenants
submitting in turn: with an empty start both saw no scope; with inheritance
on, the second tenant saw the first tenant's; with a per-submission copy
each saw its own, under both settings.

So the rule is: **at every hand-off to a pool or a thread, copy the current
context per submission and run the callable inside the copy** — and do it
unconditionally, in the pool wrapper rather than at each call site. The copy
is never a no-op: where threads start empty it supplies the scope, and where
they inherit it replaces a stale one. Passing the scope's value to a thread
as an explicit argument, installed on entry, is the other correct shape and
is indifferent to the setting. Do not rely on the primitive's documented
behaviour or on the setting your development machine happens to run with,
because the build you ship on may start threads differently. Prove it with
a test worth more than any amount of review — two tenants interleaved on one
**reused** worker, the case both failure modes share — and one asserting the
runtime's own bridge *keeps* the scope. A test asserting that a bare thread
*loses* the scope documents the hazard on one build and fails on the other;
pin the setting it assumes, or assert the configured behaviour instead.

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
- Build the credential scope under the tenant's home, then install home and
  credentials together — one immutable value in one variable where the
  runtime allows it; two variables only with nothing tenant-sensitive
  between the installs and strict reverse-order resets.
- Install immutable values; a copied context shares the objects its
  bindings point to.
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
- Copy the context per submission at every hand-off to a thread or pool, or
  pass the scope as an argument installed on entry; never count on the pool
  or the thread-start setting. Test two tenants on one reused worker, and
  the bridge.
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
