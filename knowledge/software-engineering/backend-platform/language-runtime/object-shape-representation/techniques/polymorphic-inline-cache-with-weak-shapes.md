---
layer: technique
type: technique
subject: object-shape-representation
technique: polymorphic-inline-cache-with-weak-shapes
status: forged
laws: [derivation-names-recomputation, identity-survives-reuse]
shared_with: []
use_when: [a named-property access instruction should skip the property-table lookup when it sees a shape it has seen before, deciding how many shapes a site remembers before it gives up caching, deciding during a prototype-chain walk whether the access that just resolved may be cached at all, a cache must not keep dead shapes alive]
---

# Polymorphic inline cache with weak shapes

Shared shapes make it possible for one object to teach the engine about
another; the inline cache is where the lesson is stored. The cache belongs to
the **access site** - one named-property read or write instruction in one
code block - and holds the shapes that site has seen with the slot each
resolved to. On execution the receiver's shape pointer is compared against the
entries, and a match reads the slot without consulting the property table.
This technique owns the cache's shape: who allocates it, what it may key on,
how many entries it holds before it stops trying, how it holds its shapes,
and the rule that decides during the lookup itself whether the result is
cacheable.

## One cache per site, minted by the compiler

The cache is an index the **compiler** assigns when it emits the access
instruction, into a per-code-block table the interpreter fills. A site
allocated by the compiler is stable for the code block's life and costs
nothing until the first execution; a cache keyed on the property name and
shared across sites is the design to refuse, because two sites reading the
same name from different populations of objects would evict each other and
a cache keyed on name alone cannot tell them apart. The unit of locality is
the site: a method that reads `x` from one kind of object is monomorphic
there even if every other site in the program reads `x` from ten kinds.

The instruction carries the index as an operand and the cache carries the
property name, so a hit is one indexed load and a miss needs nothing else to
perform the full lookup.

## Compare by address, hold weakly

Two rules about the entries follow from what a shared shape is. An entry
matches when the receiver's shape pointer **equals the entry's by address**,
never by structural comparison: address equality is the whole reason shapes
are shared, and a comparison that walked two property tables to confirm what
the pointer already says would give back the saving the cache exists for.
When a weak transition was lost and remade so that two structurally equal
shapes have different addresses, the cache misses and refills, and that is
correct; it is not a defect to fix with a deeper compare.

The entry holds its shape **weakly**. A code block outlives most of the
objects it ran over, and a strong reference from every site to every shape it
saw is the transition-tree leak reintroduced one instruction at a time. A
weak entry whose shape has been collected simply never matches again - the
upgrade fails, the compare is skipped - and the scan that meets it removes it
on the spot, so a dead entry costs one failed upgrade and then nothing, and
its slot is free for the next fill. An engine whose collector cannot express
a weak handle must instead clear every cache on collection, which is correct
and costs a full refill of every hot site after every collection; the weak
entry is the cheaper design wherever it is available.

## Capacity is small, and past it the site stops trying

A site holds a handful of entries - **four** is the figure most designs
converge on - and the number is derived from the compare: a hit is a linear
scan of the entries, and past four compares the scan approaches the cost of
the hash probe it was avoiding. A site that has seen more shapes than it
holds is **megamorphic**, and the rule is that it latches: it records the fact,
drops the entries it held so they pin nothing, stops filling, and performs the
full lookup on every execution from then on.
The alternative - evicting the oldest entry and refilling forever - is a site
that pays the fill cost on every execution and the compare cost on top, which
is slower than no cache. The latch is the design's honesty: a site whose
receivers do not share layouts is not one the cache can help, and the cache
should say so once rather than fail to help on every execution.

The latch is per site; the shapes it saw remain cacheable at every other site.

## Cacheability is decided during the lookup that would fill the cache

The question "may this access be cached" cannot be answered before the
lookup, because the answer depends on where the property was found. The rule
is that the property-resolution walk carries a **cacheability flag** that it
sets as it goes, and the fill reads the flag when the walk returns:

- Found on the receiver: cacheable. One shape to compare, one slot to read.
- Found on the **immediate prototype**: cacheable, with two identities to
  validate - the receiver's shape (which fixes *which object* the prototype
  is, because the prototype is a transition from the root) and the
  prototype's own shape, which fixes the slot inside that object. The entry
  records the prototype's shape alongside the receiver's, and a hit checks
  both. The half that gets dropped is the second: a hit that validates the
  receiver's shape and then indexes the prototype's storage by the cached
  slot has assumed the prototype's layout never moved, and a property
  deleted from the prototype in the meantime shifts every slot after it.
  The receiver's shape says nothing about the prototype's table; only the
  prototype's shape does.
- Found **deeper** than the immediate prototype: not cacheable. Every link in
  the chain is a shape that must be validated on every hit, and the entry
  would grow with the chain while the compare would approach the walk it
  replaces. Say no rather than build a variable-length entry. The flag is set
  by the walk itself: the first step onto a prototype marks the slot as
  found-on-prototype, and a second step marks it not cacheable, so the rule
  costs no branch in the walk.
- For a **store**, found on a holder that is not the receiver: not cacheable,
  because a write creates or updates the property on the receiver, not on
  the holder where the lookup found the descriptor, and a cached (shape,
  slot) for the holder would write into the wrong object. A read through the
  same path is cacheable; the asymmetry is the specification's, not the
  cache's.
- The walk passed through an object whose lookup is **intercepted by guest
  code** - a proxy or an accessor that runs arbitrary code to answer: never
  cacheable, and the walk must clear the flag the moment it touches such an
  object, not when it finishes. Guest code that answered one way answers any
  way it likes next time, and no shape describes it.

A **primitive receiver** is not a reason to refuse. The naive path wraps the
primitive in a temporary object to walk its prototype chain and then has
nothing durable to cache against; the better path resolves the primitive's
prototype object directly, without allocating the wrapper, and caches on that
object's shape like any other receiver. A string's length is the one property
worth special-casing before the cache is consulted, because it is not in any
table.

A design that decided cacheability before the walk - "this is a plain object,
so cache it" - caches accesses that resolve through a proxy three prototypes
up, and the bug it produces is the worst kind: a stale answer that appears
only when the prototype chain has been modified between two executions.

## The cache is derived, and the lookup is its recomputation

Nothing in the cache is authoritative; the property table reached through
the shape is. Every site must be able to fall back to the lookup at any time
- on a miss, a dead entry, the latch, a cache cleared by a collection - and
the recomputation is the same walk that filled the entry, which is what lets
the cache be dropped without a second code path
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Invalidation is never an event the cache listens for: a shape that mutated in
a way any cache could see was reminted with a new identity, and the pointer
compare misses ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).
A cache that needed a subscription to shape changes has a second source of
truth about layout, and the two will disagree.

## Decision rules

- Mint one cache per access site at compile time and carry its index in the
  instruction; never key a cache on the property name across sites.
- Compare a receiver's shape against an entry by address only; when a lost
  and remade shape misses, refill, because a structural compare gives back the
  saving.
- Hold every cached shape weakly; a dead entry never matches and is
  overwritten by the next fill.
- Hold at most a small fixed number of entries per site, and past it latch
  the site megamorphic and perform the full lookup thereafter; never evict
  and refill.
- Decide cacheability inside the resolution walk: receiver yes, immediate
  prototype yes with the prototype's shape recorded and checked on every hit,
  deeper no, a store whose holder is not the receiver no, any interception by
  guest code never - and clear the flag at the moment of interception, not at
  the end of the walk.
- Resolve a primitive receiver's prototype without allocating a wrapper and
  cache on the prototype's shape; refuse to cache only what no shape
  describes.
- Fall back to the full lookup on every miss of every kind through the same
  code path that fills the cache.

## When not to use it

An interpreter with no shared shapes has nothing for a site to compare, and
a cache keyed on per-object tables is a hash-table lookup wearing a cache's
clothes. A tree-walking interpreter with no persistent instruction stream has
no site to attach the cache to; the technique assumes a compiled code block
whose instructions have stable identities across executions.
