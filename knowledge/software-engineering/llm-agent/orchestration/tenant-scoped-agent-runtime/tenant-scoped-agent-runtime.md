---
layer: golden-path
type: golden-path
subject: tenant-scoped-agent-runtime
status: forged
use_when: [one long-lived agent process must serve several isolated configurations, a credential read in a shared process could return the wrong owner's value, a cache keyed on the tenant still serves the previous tenant's code, deciding whether tenancy belongs in the process environment or in a task-local scope, writing down what a multi-tenant runtime deliberately still shares]
techniques:
  - task-local-tenant-scope
  - fail-direction-follows-deployment-mode
  - tenant-keyed-cache-evicts-loaded-code
  - resolve-handles-at-call-time
  - stamp-ownership-before-the-router
  - written-inventory-of-what-stays-global
---

# Tenant-scoped agent runtime

An agent process is usually built for one owner. It reads one home
directory, holds one set of credentials, keeps one session store, loads one
set of extensions, and every one of those facts is written where a process
keeps facts: the process environment, a module-level singleton, a handle
bound in a constructor. Then somebody asks the same binary to serve a
second configuration — a second workspace, a second bot, a second team's
keys — and the honest answer is to run a second process. That answer stops
being honest at about the fourth one, when the memory, the connection
count and the deploy story all argue for collapsing them, and the process
becomes a **multiplexer**: one event loop, one listener, one lock, serving
several configurations that must never observe each other.

This subject owns that collapse. A **tenant** here is a configuration —
a home, a credential set, a store, an extension roster — and deliberately
not a person and not a session. The load-bearing idea is one sentence:
**the tenant is a task-local scope, never an ambient one.** The process
environment is a single slot shared by every thread; anything written
there is written for everybody, including every child process spawned with
a copy of it. So a per-turn identity cannot live there, and the alternative
is not a bigger environment but a different kind of variable — one whose
value belongs to the unit of work rather than to the process, is installed
at the boundary where that unit begins, and unwinds when it ends. Every
resolver in the runtime — home paths, credentials, stores, registries,
extension caches — then reads the tenant from that scope instead of from
the process, and cross-tenant leakage stops being a rule people remember
and becomes a thing the resolvers cannot express.

## Where this subject starts and stops

The nearest neighbour is
[agent-runtime-assembly](../../runtime-and-io/agent-runtime-assembly/agent-runtime-assembly.md),
and the boundary has to be stated in both directions because the two
subjects touch at every seam. That subject owns how the code around **one**
model call is assembled: which hooks wrap the call and in what order, who
may load code into the process and how a bad contribution fails, what the
loop may hold about work a store owns, and how the durable record is
written. All of that is correct for a single tenant and stays there. This
subject owns only what a **second** tenant adds — that the assembly must
now happen more than once in one process, that two assemblies must not
share the state each captured, and that every resolver the assembly
consults must answer for the tenant whose turn is running. The rule a
reader uses: if the question would still exist with exactly one
configuration, it is the neighbour's. If it appears only because a second
configuration is being served from the same process, it is here. Concretely,
[operator-tier-code-loading](../../runtime-and-io/agent-runtime-assembly/techniques/operator-tier-code-loading.md)
owns which tier may name code and how a contributed hook fails in
isolation; this subject cites it and adds only the eviction rule a second
tenant's same-named extension makes necessary.
[bounded-projection-of-external-work](../../runtime-and-io/agent-runtime-assembly/techniques/bounded-projection-of-external-work.md)
already observes, in one line, that work leaving the loop leaves the
request's credentials behind — this subject is the general form of that
observation.

The placement of this subject in `orchestration` rather than beside its
nearest neighbour was **forced**: the neighbouring grouping stood at its
browsing cap when this subject was written, and an eleventh entry would
have triggered a subdivision that moved every sibling and rewrote every
link into them. The reader should treat the grouping as an accident of
capacity and the boundary paragraph above as the real answer to "which of
these two do I want".

Above the process,
[fleet-orchestration](../fleet-orchestration/fleet-orchestration.md) owns
what sessions exist, how they are dispatched, and what they collectively
produced. A tenant is not a session: one tenant runs many sessions, and the
fleet registry is indifferent to which configuration served them. Beside
it, [session-continuation](../session-continuation/session-continuation.md)
owns who may decide one session's loop is over; nothing in that decision
changes because a second tenant exists, which is exactly why it is not
here.

Two subjects in other categories own the halves this one deliberately
refuses. [credential-vault](../../../security/identity-and-access/credential-vault/credential-vault.md)
owns where a secret lives, how it is sealed, refreshed and retired; this
subject owns only how a running process decides **which** tenant's secret
a given unit of work may read, and it inherits the vault's cardinal rule
rather than restating it.
[identity-bearing-keys](../../../security/identity-and-access/authorization/techniques/identity-bearing-keys.md)
is the same instinct applied one layer down — compose the owner into the
storage address so a cross-owner reference cannot be written — and this
subject is its in-process twin: compose the owner into the *resolver* so a
cross-tenant read cannot be performed. The durable record's own lifecycle
belongs to [embedded-db](../../../backend-platform/data-layer/embedded-db/embedded-db.md);
what this subject adds is that a multiplexer opens one such store per
tenant and must therefore satisfy that subject's inventory obligation
several times over.

And the line that must not blur: **isolating configurations is not
authenticating users.** A tenant is a configuration, not a person. The
runtime trusts its transport and its routing table to say which
configuration an event belongs to; request-level identity and per-user
authorization sit above this layer and belong to authorization. A design
that markets tenant scoping as a security boundary for end users has
promised something it never built.

## The environment is a slot, and a slot cannot hold a scope

The naive implementation is to union every tenant's configuration into the
process environment and let the existing resolvers keep working. It is
attractive precisely because nothing has to change: every call site that
reads a credential by name keeps reading it by name. It is also wrong in
two directions at once. Within the process, one slot per name means the
last writer wins and every concurrent unit of work reads whatever the last
writer put there — which, under interleaving, is the other tenant.
Outside the process, every child spawned with a copy of the environment
inherits the union, so a tool that shells out hands one tenant's keys to a
subprocess running another tenant's work. There is no version of this that
is safe under concurrency, and the failure is silent: the wrong credential
authenticates, the wrong home is read, the run completes.

The replacement is a **context-local variable** — a value bound to the
current unit of work, snapshotted when that unit spawns children, and
restored when it ends. Its properties are what make the subject possible:
concurrent units of work each see their own value; a child unit inherits a
copy at the moment it is created; and a change made inside a copy does not
travel back to the parent. That last property is the one that makes
unwinding reliable rather than disciplined, and it is also the one that
surprises people, because it means a scope installed deep inside a worker
is invisible to the code that spawned it. [task-local-tenant-scope](./techniques/task-local-tenant-scope.md)
owns the installation, the seams that must be wrapped, the explicit hand-off
into worker pools that do not propagate on their own, and the rule that
process-level work runs under the default tenant's scope on purpose rather
than under none.

## A scope miss is a decision, and its direction depends on the deployment

Once every credential read goes through one resolver, that resolver needs
an answer for the case where the name is not in the active scope — and the
answer is not universal. In a deployment serving one tenant, the scope is
an **overlay**: a miss falls through to the process environment, because
single-tenant deployments legitimately inject credentials from a service
manager or a secret-manager wrapper and there is no second tenant to leak
from. In a deployment serving several, the scope is **authoritative**: a
miss returns the declared absence and never consults the process, because
the process may hold another tenant's value; and a read with *no scope at
all* raises, so an unmigrated call site fails loudly at its own line
instead of quietly borrowing a neighbour's credential.

Getting this backwards is not a theoretical risk. Applying the
authoritative rule unconditionally breaks every single-tenant deployment
whose credentials were never in a configuration file — and it breaks them
asymmetrically, because the scheduled-job path installs a scope around
every run while the interactive path does not, so background work
authenticates with a placeholder and fails while foreground work keeps
succeeding. That signature — one lane of traffic failing authentication
while another lane is fine — is the diagnostic fingerprint of a scope that
became a blindfold. [fail-direction-follows-deployment-mode](./techniques/fail-direction-follows-deployment-mode.md)
owns the two modes, the small allowlist of names that genuinely describe
the process rather than a tenant, and the discipline that the fix for an
unscoped read is to wrap the call path rather than widen the allowlist.

## A cache keyed on the tenant still has to evict what its entry captured

The first correct instinct after installing the scope is to key the
process's caches on the resolved tenant, and it is necessary and
insufficient. It is necessary because a single-slot cache is invisible to a
task-local switch: a guard that asks "did the process-level setting change"
sees nothing, and the singleton keeps serving the first tenant's object to
everybody else. It is insufficient because the cached object is rarely the
only state involved. Loaded extension code lives in a **module cache** keyed
by name, not by tenant, and rebuilding a registry replaces only the entry
point it imports. A second tenant's same-named extension then re-executes
its top level while its own nested imports resolve, from the module cache,
to the *previous* tenant's already-loaded modules — and to whatever
module-level state those captured. The rule is to evict the entry point
**and every name nested beneath it**, on reload and on tenant switch alike,
and to drop the whole keyed cache between isolated tests so a leak cannot
hide behind ordering. [tenant-keyed-cache-evicts-loaded-code](./techniques/tenant-keyed-cache-evicts-loaded-code.md)
owns both floors.

## Handles resolve at call time, and ownership is stamped before the router

Two smaller rules follow, and both are about *when* a fact is bound.

A shared store object that binds a handle in its constructor pins the first
tenant that built it. The alternative that works is to bind nothing at
construction and resolve the tenant's store on every operation through the
active scope, caching one handle per resolved address. The rejected
alternative — one store instance per tenant — is legitimate and is the
right choice whenever every construction site knows the tenant; it fails
here only because the pre-routing paths do not.
[resolve-handles-at-call-time](./techniques/resolve-handles-at-call-time.md)
states the discriminator.

And some code runs before the routing decision exists at all. Ingress
handling begins before the inbound event carries a tenant stamp, so
anything the ingress does first — batching, lane tracking, a busy guard —
has no tenant to read and defaults to the wrong one, which in practice
means every tenant's traffic collides in the default tenant's lane. The
fix is to stamp ownership on the ingress surface at **configuration time**,
before any event can arrive, and to resolve in a fixed order: the event's
own stamp, then the ingress owner, then the store resolver.
[stamp-ownership-before-the-router](./techniques/stamp-ownership-before-the-router.md)
owns the order and the per-tenant namespacing of every per-lane structure.

## The honest half is a written inventory

No process gets fully scoped, and the ones that claim to are the ones that
have not looked. A listener, a lock, a discovery pass that races to
register first, a registry of built-in capabilities — each is genuinely
shared, and each is a real constraint on what the isolation claim means.
The defect is not that they exist; it is that they are usually unwritten,
so an adopter reads "tenants are isolated" and believes something stronger
than what shipped. The standard is a maintained table naming every surface
that is **not** tenant-scoped, what that costs, and where the gap is
tracked, published beside the isolation claim and updated in the same
change that scopes one of its rows.
[written-inventory-of-what-stays-global](./techniques/written-inventory-of-what-stays-global.md)
owns the table, the hybrid overlay pattern for registries that are
half-scoped, and the enumerated fail directions at the boundary.

## Invariants

- **The tenant lives in a task-local scope. Nothing writes it to the
  process environment, ever** — not once, not at startup, not "just for
  this call".
- **Every seam where tenant-owned code runs is wrapped**, and the scope
  unwinds on the way out whether the unit succeeded or failed.
- **Propagation into a worker pool is explicit and tested**, not assumed
  from the runtime's documented semantics.
- **The resolver's behaviour on a scope miss is derived from the
  deployment mode**, and a read with no scope under isolation raises rather
  than falling back.
- **A cache keyed on the tenant also evicts the loaded code its entry
  captured**, including everything nested under the entry point.
- **No handle to tenant-owned storage is bound at construction time** in an
  object shared across tenants.
- **Ownership is stamped before the first event can arrive**, and every
  per-lane structure is namespaced by tenant.
- **What stays global is written down**, with its cost, beside the
  isolation claim.
- **A tenant is a configuration, not a person.** This layer isolates; it
  does not authenticate.

## The techniques

- [task-local-tenant-scope](./techniques/task-local-tenant-scope.md) — the
  tenant as a context-local value, the seams that must be wrapped, explicit
  propagation into worker pools, deterministic unwinding, and the
  default-tenant rule for process-level work.
- [fail-direction-follows-deployment-mode](./techniques/fail-direction-follows-deployment-mode.md)
  — overlay when nothing can leak, authoritative when something can; the
  unscoped read that raises; the tight global allowlist and why widening it
  is never the fix.
- [tenant-keyed-cache-evicts-loaded-code](./techniques/tenant-keyed-cache-evicts-loaded-code.md)
  — keying on the resolved tenant, evicting the entry point and everything
  nested under it, and dropping the whole cache between isolated runs.
- [resolve-handles-at-call-time](./techniques/resolve-handles-at-call-time.md)
  — bind nothing at construction, resolve through the active scope, cache
  one handle per resolved address, and the discriminator against
  one-instance-per-tenant.
- [stamp-ownership-before-the-router](./techniques/stamp-ownership-before-the-router.md)
  — ownership installed at configuration time for code that runs before
  routing, the fixed resolution order, and per-tenant lane keys.
- [written-inventory-of-what-stays-global](./techniques/written-inventory-of-what-stays-global.md)
  — the maintained table of unscoped surfaces, the hybrid overlay for
  half-scoped registries, and the enumerated fail directions.
