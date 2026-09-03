---
layer: golden-path
type: golden-path
subject: dependency-declaration
status: forged
use_when: [designing how components declare what they depend on, a plugin or extension cannot state its own requirements, adding one dependency requires editing a file the author does not own, transitive requirements must be enumerated by hand, choosing between a logical name and a direct address for a reference]
techniques:
  - declaration-invariants
  - logical-name-or-address
  - progressive-resolution
  - shortcut-is-not-the-substrate
  - declaration-cost-floor
  - vendored-copy-loses-composition
  - attachment-coherence
  - unsatisfiable-set-empirical-gate
---

# Dependency declaration

Every system with parts has a mechanism by which one part says *I need that
other thing*, and a mechanism by which that statement becomes an actual
reference to an actual artifact. Module imports are the obvious case, but the
same machinery appears wherever composition does: a plugin naming the host
services it requires, a component naming the assets that belong to it, a
container registration naming what it injects, an agent naming the tools it
expects, a service naming the peers it calls.

This subject owns the design of that mechanism — **where the declaration lives,
who is allowed to write it, and how a name becomes a thing.** Not what happens
when the thing turns out to be missing, and not whether the thing can be
trusted; those are neighbours, and the boundaries are stated at the end.

The reason it deserves a subject is that the mechanism is almost never designed.
It accretes. Something needs to reference something else, the shortest path that
works is taken, and the shape that results is discovered years later when
somebody tries to do the one thing it cannot do — usually "let a component ship
its own requirements" — and finds that the answer is a rewrite. A declaration
mechanism is high fan-in infrastructure with the review profile of a config file.

## The three invariants

There is a compact test, and it is worth applying deliberately because each of
its three parts fails differently and produces a different downstream cost.

> **Locality** — the declaration lives with the unit that needs it.
> **Composability** — declarations combine across units without global coordination.
> **Scalability** — the mechanism does not require enumerating every transitive edge.

**Locality** is the one whose violation is most often invisible, because a
mechanism can violate it and still work perfectly for the first team that uses
it. It fails when declarations must live in a surface the depending unit does not
own — a host document, a top-level manifest, an application-level configuration
file. The immediate consequence is small: somebody else writes the line. The
structural consequence is that **a reusable unit cannot state its own
requirements**, so it must either push them onto its consumers or absorb them
into itself, and both of those are worse than declaring them.

The corpus already holds the argument for why this is a defect, on a neighbouring
subject and in more general terms:
[locality-and-leverage](../module-design/techniques/locality-and-leverage.md)
states the operational form as *things that change together live together, and
things that change for different reasons live apart*. A unit's dependency list
changes exactly when the unit changes and for exactly the same reasons. Storing
it anywhere else is that rule's textbook violation — this subject is not minting
a new principle, it is noticing where an existing one is routinely broken by
infrastructure rather than by authors.

**Composability** fails when the declarations of independent units cannot be
merged without somebody who knows about all of them. The tell is a single file
that must be regenerated whenever any participant changes, and the cost is that
composition stops being associative: adding a unit is no longer a local act.

**Scalability** fails when the mechanism demands that every transitive edge be
written down. This is the invariant most often "solved" by tooling, and the
solution is worth examining, because a mechanism that requires a generator to be
usable has not removed the requirement — it has hidden it behind a build step
that is now mandatory.

The three interact in one important way: **a mechanism that fails locality will
usually fail composability too**, because a declaration the unit cannot write is
a declaration somebody else must merge. Scalability is more independent; a
perfectly local, perfectly composable mechanism can still demand full enumeration.
The full test, the diagnostics each failure produces, and how to score a proposed
mechanism are [declaration-invariants](./techniques/declaration-invariants.md).

## A name is a claim about who controls resolution

Underneath every declaration is a choice that looks cosmetic and is not: does the
unit refer to its dependency by a **logical name** that something resolves, or by
a **direct address** that needs no resolution?

Two explanations for preferring logical names are commonly offered and both are
wrong. It is not syntax — there is no meaningful ergonomic difference between a
bare name and a short relative address. It is not immutability either; a local
address can be exactly as stable as a name. The real discriminator is **purview**:
an address means the same thing everywhere, while a logical name resolves
differently depending on who is asking. A name is *controlled by the composing
application*; an address is controlled by whoever the address points at.

That is why logical names win wherever a system must retain the ability to
substitute — to swap an implementation, to pin two consumers to different
versions of the same thing, to redirect a whole class of reference in one place.
And it is why addresses win where substitution is a hazard rather than a feature.
The choice, the two false explanations, and the hybrid where a name is defined as
a *kind* of address are [logical-name-or-address](./techniques/logical-name-or-address.md).

## Resolve on demand, or enumerate up front

The scalability invariant has two answers where a consistent graph exists,
and they are not interchangeable.

**Enumeration** builds the complete graph before anything runs. It is honest,
inspectable, and diffable, and it is viable only when the full set is knowable by
one party at declaration time. Where it is imposed on a mechanism whose graph is
open — arbitrary units, arbitrary depth, contributed by people who do not know
about each other — it produces the failure everyone recognises: a generated file
of thousands of entries that nobody reads, that must be regenerated on any change,
and whose staleness is invisible until something fails to resolve.

**Progressive resolution** walks the graph as it is used: a unit's own
declarations are consulted when that unit is reached, so the graph composes
through the act of traversal rather than being assembled first. It scales because
no participant needs global knowledge — which is the same property that makes
addresses compose, arriving on the naming layer.

The trade is real and it is about *when* you want to find out. Enumeration front-
loads discovery: conflicts and missing entries surface at build time, in one
place, before anything ships. Progressive resolution defers it: the graph is
never wrong, but a bad edge is discovered when that edge is first walked, which
may be in production and may be rare. **Neither is the safe default** — the
question is whether the graph is closed enough for enumeration to be honest.
[progressive-resolution](./techniques/progressive-resolution.md) holds the
decision rule, the hybrid that gets most of both, and the specific dishonesty to
avoid: enumerating an open graph and treating the result as complete.

There is a third case, and it is not a third strategy — it is what is left
when both strategies lose their premise. Where the declared constraint set is
provably **unsatisfiable**, no consistent graph exists to enumerate up front
or to compose through traversal, and the honest answer is to stop asking a
resolver a question that has no answer: disable resolution, install the exact
set, record at every install site which upstream constraint is being
overridden and why, and replace the resolver's verdict with an end-to-end run
of the built artifact as the acceptance evidence. The guarantee is materially
weaker and the whole discipline exists to keep it from also being silent.
[unsatisfiable-set-empirical-gate](./techniques/unsatisfiable-set-empirical-gate.md)
holds the four parts, the exception fields each bypass carries, and the
inverted acceptance statement — the consistency check is expected to fail, and
a green one means the bypass quietly stopped happening.

## The shortcut must not be the only door

A declaration mechanism is usually introduced through one convenient binding — a
block in a particular file format, an annotation in a particular language, an
entry in a particular manifest. That is good practice: shipping the convenient
form first is how a mechanism gets adopted, and refusing to ship until the
general form is designed is how it never ships at all.

The debt is incurred when the convenience becomes the *only* way in. The
capability then inherits every constraint of its binding — its file format, its
lifecycle, its parse timing, its access rules — and those constraints leak into
places that have nothing to do with the original convenience. The symptom is
specific and recognisable: **a context that plainly ought to support the mechanism
cannot, for a reason that is entirely about the binding and not at all about the
mechanism.** A worker, a nested scope, a headless runner, a second document type.

The rule is not "never ship a shortcut". It is that the shortcut must be a
*projection* of a general mechanism rather than the mechanism itself, and that the
general form is what other parts of the system integrate against.
[shortcut-is-not-the-substrate](./techniques/shortcut-is-not-the-substrate.md)
covers how to tell the two apart before the debt is taken, and how to unwind it
after.

## What it costs to add one dependency

The last property is the one users feel, and it is measurable in a way the others
are not: **how much does it cost to add the first dependency to a project that has
none?**

Requiring advanced tooling for advanced needs is entirely correct — optimisation,
strict typing, static analysis and packaging are all specialist concerns that
arrive later in a project's life and later in an author's learning. The defect is
a *foundational* capability whose price of admission is an advanced tool. Reuse is
not an advanced need; it is the second thing anyone does. When declaring one
dependency requires choosing, configuring and operating a build pipeline, the
mechanism has a cliff at the exact point where the most people stand.

The cost has a compounding second half. When the basic path is expensive, systems
route around it: capabilities that should have been dependencies get absorbed into
the platform or the standard library, and the platform starts being designed around
the workaround rather than the other way round.
[declaration-cost-floor](./techniques/declaration-cost-floor.md) makes the cost
countable and names the inversion.

## Bundling is relocation, not avoidance

One escape from all of the above deserves naming because it looks like a solution
and is a trade: shipping a unit as a **self-contained artifact** with its
requirements already folded in.

It genuinely removes the consumer's declaration problem — there is nothing left to
declare. What it removes with it is composition. Two self-contained units that
depend on the same third thing now carry private copies of it, and no amount of
downstream cleverness can deduplicate them, because the shared identity was
destroyed at packaging time. The consumer has not avoided assembling a dependency
graph; they have accepted somebody else's, once per unit.

This is the right call in specific cases — a hard isolation boundary, a consumer
with no mechanism at all — and the wrong default.
[vendored-copy-loses-composition](./techniques/vendored-copy-loses-composition.md)
states when the trade pays.

## Declaring is half of it; attaching is the other half

A declaration says *I need that thing*. Some mechanisms also let a unit say *and
here is how that thing behaves under this interface* — behaviour attached to a
type after the type is defined, by somebody who did not define it. It is the
same composition machinery seen from the other side, and it has a failure the
declaration side does not: two units can each be correct, each attach the same
behaviour to the same type, and the conflict comes into existence only in the
assembly built by whoever needs both — where neither author can fix it.

Composability is therefore not only a property of how declarations merge; it is
a property of who is *allowed* to make an attachment. The constraint that
preserves it is that one end of the attachment must be owned by the party making
it, which is what forces a locally-owned wrapper type and makes the conflict
unwritable rather than merely rare.
[attachment-coherence](./techniques/attachment-coherence.md) owns the rule, the
wrapper's real price, why the widest attachment is the least reversible one, and
the closed-system case where the whole discipline is ceremony.

## Boundaries

- **What happens when a dependency is not there** belongs to
  [optional-dependency-degradation](../../../backend-platform/resilience/optional-dependency-degradation/optional-dependency-degradation.md).
  The test is a question about time: if you are asking *who wrote down that we
  need this, and how did the name resolve*, it is this subject; if you are asking
  *what runs when it is absent*, it is that one. They meet at exactly one point —
  a mechanism with no way to express an optional dependency forces every consumer
  to invent one, which is this subject's defect producing that subject's problem.
- **Whether what resolved can be trusted** — provenance, policy gates, licence
  review, update discipline, vendored-fork tracking — belongs to
  [supply-chain](../../../security/code-provenance/supply-chain/supply-chain.md). Resolution is a
  design question; what arrives through it is a trust question, and conflating
  them produces mechanisms that are secure and unusable, or usable and unpinned.
- **Where module boundaries belong**, and how much a unit should hide behind its
  interface, belong to [module-design](../module-design/module-design.md). That
  subject decides what the units *are*; this one decides how they name each other.
  Its [locality-and-leverage](../module-design/techniques/locality-and-leverage.md)
  supplies the law this subject's locality invariant applies.
- **Producing the artifact** — packaging formats, signing, platform matrices —
  belongs to [packaging](../../build-and-release/packaging/packaging.md), and the
  economics of the build that does it to
  [build-economics](../../build-and-release/build-economics/build-economics.md).
  This subject stops at how the reference is written and resolved.

## What this subject refuses

- **A declaration a reusable unit cannot write about itself.** The single most
  consequential failure, and the one that survives longest undetected because it
  costs the first team nothing.
- **A merged file that must be regenerated whenever any participant changes.**
  That is composability's failure with a generator taped over it.
- **Full transitive enumeration over an open graph**, presented as complete.
- **A convenience binding with no general mechanism beneath it**, once a second
  context has been refused for reasons that are purely about the binding.
- **A build pipeline as the price of the first dependency.**
- **Treating a self-contained artifact as free.** It is a purchase: composition
  and deduplication, sold for setup cost.
- **Choosing names over addresses for stated reasons of syntax or immutability.**
  Both are false, and a mechanism justified by a false reason will be extended in
  the wrong direction.

## The techniques

- [declaration-invariants](./techniques/declaration-invariants.md) — locality,
  composability, scalability: the three-way test, what each failure costs, and how
  to score a mechanism before adopting it.
- [logical-name-or-address](./techniques/logical-name-or-address.md) — purview as
  the real discriminator, the two false explanations, and the hybrid form.
- [progressive-resolution](./techniques/progressive-resolution.md) — resolving on
  traversal versus enumerating up front, and when a closed graph makes enumeration
  honest.
- [shortcut-is-not-the-substrate](./techniques/shortcut-is-not-the-substrate.md) —
  shipping the convenient binding without making it the only door.
- [declaration-cost-floor](./techniques/declaration-cost-floor.md) — the cost of
  the first dependency, and the platform inversion an expensive one causes.
- [vendored-copy-loses-composition](./techniques/vendored-copy-loses-composition.md)
  — what a self-contained artifact actually buys and sells.
- [attachment-coherence](./techniques/attachment-coherence.md) — who may attach
  behaviour to a type they do not own, the ownership rule that makes the
  conflicting pair unwritable, the wrapper as the visible price, and the
  irreversibility of an attachment written for every type meeting a bound.
- [unsatisfiable-set-empirical-gate](./techniques/unsatisfiable-set-empirical-gate.md)
  — what to do when no version set satisfies every declared constraint:
  resolution disabled, the override recorded at each install site, and the
  built artifact's end-to-end run standing in for the resolver's verdict.
