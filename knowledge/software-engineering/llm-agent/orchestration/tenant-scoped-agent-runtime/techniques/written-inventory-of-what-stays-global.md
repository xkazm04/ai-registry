---
layer: technique
type: technique
subject: tenant-scoped-agent-runtime
technique: written-inventory-of-what-stays-global
status: forged
stage: multi-service
laws: [silent-state-is-ungoverned, absent-guard-is-loud]
shared_with: []
use_when: [publishing an isolation claim for a multi-tenant runtime, a reviewer asks what is actually shared between tenants, deciding whether a partly-scoped registry counts as isolated, enumerating the fail directions at the tenancy boundary]
---

# Written inventory of what stays global

Every multi-tenant runtime built on a shared process has surfaces it has not
scoped and will not scope soon: a discovery pass that registers into a
process-wide table, a listener bound to one port, a lock file, a roster of
built-in capabilities. Their existence is not the defect. The defect is that
they are almost always **unwritten**, so the isolation claim an adopter
reads — "tenants are isolated" — is stronger than the isolation that
shipped, and the difference is discovered by an incident rather than by
reading.

This technique is the honest half of the subject: a maintained table naming
every surface that is *not* tenant-scoped, what that costs, and where the
gap is tracked, published in the same document as the isolation claim. It is
a technique rather than a paragraph because it is the one part of the
subject an adopter would otherwise skip, and skipping it is precisely the
failure.

## Unwritten sharing is ungoverned sharing

A runtime's own belief about what it isolates is internal state, and
internal state shapes decisions whether or not anyone can read it
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
The people who reason from it are not only the runtime's authors: an
operator decides whether two customers may share an install, a reviewer
decides whether the design meets an obligation, a contributor decides
whether a new subsystem needs scoping. All three read the claim. If the
claim has no exceptions attached, all three reason from a model of the
system that does not exist, and none of them will find out until the
model's gap becomes an incident.

Converting it to an artifact is what makes it governable. Once the table
exists, the operator can see that a shared listener means one tenant's
inbound port outage is everybody's; the reviewer can ask whether that is
acceptable rather than whether it is true; and the contributor adding a
registry has a place to declare what it did.

The complementary law is
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) read from
the documentation side: an isolation guarantee that quietly does not apply to
six surfaces is a guard that is absent on those six, and absence has to be
loud. The table is how a *documented* absence becomes loud.

## What the table carries

One row per unscoped surface, and each row answers the same three questions:

- **What the surface is**, in the runtime's own vocabulary, precise enough
  that a reader can find it.
- **What is actually shared**, stated as behaviour rather than as a
  category. "Process-global; the first tenant to build an agent wins the
  discovery slot" is a row. "Not yet scoped" is not — it says nothing about
  what happens.
- **What it costs and where it is tracked**, so the row is a known gap with
  an owner rather than a permanent apology.

The rows that matter most are the ones where the sharing is a **race**
rather than a static fact — first-writer-wins surfaces, where which tenant
gets the shared slot depends on startup ordering. Those are the rows that
produce irreproducible incidents, and naming the race is more useful than
naming the surface.

A row leaves the table only in the change that scopes it. That is the
maintenance rule and it is the one that breaks: the table is written
carefully at design time and then diverges, because scoping a surface feels
like the end of the work and updating the document feels like paperwork. A
table that lists a surface as global after it has been scoped is
mild — a reader over-estimates the sharing. The reverse is severe. Treat
both as bugs in the same class as a stale interface contract, and put the
table where the change that scopes a surface has to touch it.

## The hybrid overlay is a shape, and it deserves its own name

Between "process-global" and "tenant-scoped" there is a third state that
recurs often enough to be named: a registry whose **host-owned entries are
process-global and whose tenant-contributed entries are overlaid per
tenant**, keyed by the resolved tenant. Capability registries usually land
here — the built-in providers are the runtime's and are the same for
everyone, while a tenant's contributed provider must only be visible to that
tenant.

Naming the shape does two things. It stops the table from mislabelling those
registries as unscoped, which under-claims and sends readers looking for a
gap that is half-closed. And it gives the next contributor a pattern to
adopt rather than a choice to make, which is how a half-scoped surface
stays consistent instead of becoming six different half-scopings.

The overlay needs the same key as everything else in the subject — the
resolved tenant, from the one resolver — and the same eviction discipline
when a tenant's contributions are reloaded.

## The fail directions are enumerated, not implied

The same document states what happens at the boundary when something is
wrong, and the answers are deliberately not uniform. A useful enumeration
distinguishes at least four:

- **Fatal at startup** — a malformed isolation configuration, and a
  secondary tenant claiming a surface that only one tenant can own (a bound
  port, a process lock). These cannot be degraded around: a runtime that
  starts with two tenants believing they own the listener has already
  failed, it just has not noticed.
- **Skipped with a warning** — one misconfigured tenant-level ingress. The
  multiplexer serves the other tenants; the failure is attributed and
  visible. Taking every tenant down for one tenant's bad credential is the
  wrong trade in the other direction.
- **Fail-closed** — an unscoped credential read, an event routed to a tenant
  this process does not serve. Both are dropped or raised rather than
  guessed, because the guess is a cross-tenant action.
- **Documented fallback** — a subsystem that does not support isolation at
  all falls back to its built-in single-tenant behaviour, with a warning
  saying so. This is the row most likely to be omitted, because it *works*;
  it belongs in the enumeration precisely because an operator reading the
  isolation claim would not otherwise know that one scheduler is running
  outside it.

Enumerating them in one place is what lets a reviewer check the set for
consistency — that nothing which can act across tenants fails open, and
nothing whose failure is local takes the process down.

## The non-goal is part of the document

Finally, the table's neighbour: a sentence saying what the isolation is
**not**. Isolating configurations is not authenticating users; a tenant is a
configuration, not a person; the runtime trusts its transport and its
routing table to decide which configuration an event belongs to. Without
that sentence, "multi-tenant" is read as a security boundary for end users,
which is a different system with a different threat model, and the gap
between the two is where the worst misuse of this subject lives.

## Decision rules

- Publish a table of every surface that is not tenant-scoped, in the same
  document as the isolation claim.
- Give each row the behaviour, not the category; name the race where the
  sharing is order-dependent.
- Remove a row only in the change that scopes the surface; treat divergence
  as a bug, and place the table where that change must touch it.
- Name the hybrid overlay explicitly for registries whose host entries are
  global and tenant entries are keyed, and key it through the same resolver.
- Enumerate the fail directions — fatal at startup, skipped with a warning,
  fail-closed, documented fallback — and check the set for consistency.
- State the non-goal: this layer isolates configurations, it does not
  authenticate or authorize people.

## When not to use it

A runtime that isolates by process has nothing to inventory — the operating
system's boundary is total, and a table of shared surfaces would be empty.
And a system with exactly one tenant does not need the document, though the
moment a second is contemplated the table is the first artifact to write,
before the first surface is scoped: the inventory is more useful as a plan
than as a confession.
