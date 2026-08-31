---
layer: technique
type: technique
subject: dependency-declaration
technique: progressive-resolution
status: forged
laws: [creation-names-reaper, unknown-is-not-a-value, failure-not-empty-success]
shared_with: []
use_when: [a generated dependency map must be rebuilt whenever anything changes, deciding whether to resolve the whole graph up front or on traversal, transitive entries outnumber declared ones by an order of magnitude, a resolution map has gone stale without anyone noticing]
---

# Progressive resolution

The scalability invariant has two answers, and choosing between them is a choice
about **when you find out that an edge is wrong**.

**Enumeration** computes the full transitive closure before anything runs and
records it. **Progressive resolution** consults each unit's own declarations when
that unit is reached, so the graph composes through traversal and no complete
picture is ever assembled.

Both are legitimate. The failure this technique exists to prevent is not picking
the wrong one — it is enumerating a graph that cannot be enumerated, and then
treating the result as complete.

## The property that decides it: is the graph closed?

> A graph is **closed** when one party knows every participant at declaration
> time. It is **open** when participants can be contributed by people who do not
> know about each other, at a depth nobody bounded.

Closed graphs make enumeration honest. The closure is computable, the artifact is
correct when written, and anything missing from it is genuinely an error.

Open graphs do not. An enumeration over an open graph is a **snapshot presented
as a specification** — correct for the participants known when it ran, silently
wrong for anything contributed afterwards, and offering no way to tell the two
apart by looking. The defect is not the staleness; it is that the artifact's shape
makes no claim about its own completeness, so every reader assumes it is total.

The test is not the graph's size. A thousand-entry closed graph enumerates
perfectly. A three-entry open one does not, because the fourth entry is the
problem.

## What enumeration buys, and the reaper it owes

Enumeration front-loads discovery, and that is a genuine and underrated benefit:
conflicts, missing entries and version incompatibilities surface **at build time,
in one place, before anything ships**, rather than at the moment a rare path is
first walked. For a closed graph this is usually the right trade, and "resolve it
all up front and fail loudly" is a good default wherever it is available.

What the artifact owes in return is a stated lifecycle
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). A generated
closure is a derived file that looks exactly like source: plausible, readable,
committed, and read by the runtime. Nothing about it announces when it stopped
being true. So it must carry, in the artifact itself rather than in a wiki:

- **What regenerates it**, as a runnable command.
- **What invalidates it** — which declaration changes make it wrong.
- **A check that it is current**, run by the same gate that runs the tests. A
  regeneration that produces a diff is a failure, not a fix-up. This is the only
  one of the three that actually holds the line; the other two are documentation.

Without that check the artifact degrades in the worst available direction: it
keeps resolving, mostly correctly, and the one entry that has drifted is
indistinguishable from the ones that have not.

## What progressive resolution buys, and what it defers

Progressive resolution scales because **no participant needs global knowledge.**
A unit declares only its direct requirements; when something reaches that unit,
those declarations are consulted, and their own requirements are consulted in
turn. Adding a unit is a local act with no rebuild, which is exactly the
associativity property that
[declaration-invariants](./declaration-invariants.md) tests for under
composability.

The cost is that discovery is deferred to traversal. A bad edge on a rarely-taken
path is discovered rarely — possibly in production, possibly by a user. Three
disciplines contain that, and they are not optional in this mode:

- **Resolution failure is loud and specific.** It names the unresolved reference,
  the unit that asked for it, and the scope that failed to resolve it. A generic
  failure at this layer is nearly undebuggable, because the referrer is the one
  piece of context the resolution layer has and the stack trace does not
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **An unresolvable name refuses; it does not fall back.** Silently resolving to
  a default, to a global, or to a same-named thing in another scope converts a
  missing declaration into a wrong one
  ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
- **The graph is walkable on demand.** Progressive resolution declines to build
  the closure eagerly; it must not make the closure *unobtainable*. A command that
  walks and prints it is what preserves the auditability enumeration gets for
  free, and it is what supply-chain review needs to exist at all.

## The hybrid, which is usually the answer

The two are not exclusive, and most mature mechanisms end up combining them along
one boundary:

> **Resolve progressively; enumerate as a cache.** Declarations stay local and
> compose on traversal, and a generated closure is treated as an *optimisation and
> an audit artifact* rather than as the source of truth.

The distinction is what happens when the cache and the declarations disagree. If
the cache wins, this is enumeration with extra steps and every hazard above
applies. If the declarations win and the cache is verified against them, the
mechanism keeps progressive composition and buys back front-loaded discovery: the
verification step is where a bad edge surfaces at build time.

That ordering is the whole design. **The declarations are the specification; the
closure is a derivation of them** — which is the standard shape for any derived
artifact and the reason the check in the enumeration section is the load-bearing
part rather than the regeneration command.

## Where this does not apply

A mechanism whose participants are all authored by one team, shipped together,
and versioned as a unit has a closed graph and no third-party extension story. It
should enumerate, and the discipline it owes is the currency check, not this
technique's traversal machinery. Reaching for progressive resolution there buys
flexibility nobody needs and pays for it in exactly the debuggability that a small
team relies on.
