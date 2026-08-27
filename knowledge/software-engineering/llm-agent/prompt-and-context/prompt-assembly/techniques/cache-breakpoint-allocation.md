---
layer: technique
type: technique
subject: prompt-assembly
technique: cache-breakpoint-allocation
status: forged
laws: [derivation-names-recomputation, count-carries-predicate]
shared_with: []
use_when: [allocating a fixed number of cache cut points across prompt layers, a cheap-looking prompt edit multiplied the bill, deciding whether a computed value may sit in a cached block]
---

# Cache breakpoint allocation

[layered-composition](./layered-composition.md) orders the layers by
volatility and stops one step short of the decision that order exists to
enable: **where the cached region is actually cut.** Its rule — everything
upstream of the first volatile byte is cacheable — describes a single
implicit boundary, which is the right model only for a provider that infers
one. Providers that let the caller *declare* cut points give a small, fixed
number of them, single digits, and the budget spans the whole request:
tool declarations, the system layers, and the message history draw from the
same allowance. The cut points are therefore a scarce global resource, not
a property any one section owns — and nothing in the layer table allocates
them.

The arithmetic is the whole technique. A prompt has more volatility tiers
than the provider has cut points, routinely, so tiers must be merged into
blocks. Two rules settle every merge:

> **Spend a cut point only at a cadence boundary. Merge adjacent layers
> that change on the same cadence.**

Merging same-cadence layers is free: they invalidate together whether or
not a boundary separates them, so the boundary buys nothing and costs a
slot that a real cadence change elsewhere needs. Splitting them is the
common waste, and it is committed for reasons that feel like tidiness —
one block per concern, one block per owner, one block per section of the
layer table. The gradient's own *Changes* column is the allocation map:
read down it, and cut where the value changes, not where the topic does.
A standing knowledge index that is as constant as the identity layer
belongs in the identity layer's block; a profile and an organisational
context that both turn over per session belong in one block together.

Each block carries its own declared lifetime, and the second allocation is
matching that lifetime to the tier's cadence — long for the standing
layers, short for the session-scoped ones. A block whose declared lifetime
is shorter than its content's cadence pays to rewrite text that never
changed; longer, and it holds a stale prefix that the next call invalidates
anyway. Providers also set a floor below which a block is not cached at
all, so a cut point spent on a short block buys nothing and still consumes
the slot.

## Variability within the lifetime, not literal versus computed

The house rule most systems write down is *no dynamic content in a cached
block*. It is a good slogan and the wrong discriminator, and the gap shows
up as soon as the same team implements the thing: the rule bans values that
are computed once at process start and never read again — a resolved
timezone, an account identity, a feature-flag snapshot — which are exactly
as stable as a constant for the entire life of the block, while saying
nothing about a hand-authored string that some caller rewrites per request.
One shape it forbids is free; the other it permits is the actual defect.

The question a block admits content on is narrower and mechanical:

> **Can this value change before this block expires?**

A value read once per process cannot, and excluding it costs either a cut
point or a longer volatile tail, for nothing. A value read per request can,
and no amount of its being hand-authored saves it. State the rule that way
in the assembler and each layer's admission becomes checkable rather than
stylistic — which is what [derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)
asks of any stored derived thing: a cached block is a derivation, and
allocating it is the act of naming what recomputes it. Every block should
be able to answer *which inputs invalidate me*; a block whose answer is
"several things, on different cadences" is a merge that should not have
happened.

## Blast radius runs downstream

A cut point bounds a prefix, so an edit inside block K invalidates K and
every block after it — the cost of a layer is its position multiplied by
its cadence, never its size. This inverts the intuition that big layers are
the expensive ones. A large standing layer at the head is cheap because it
is written once and read at the cache rate forever; a small volatile value
accidentally placed above it is catastrophic, because it re-bills
everything downstream on every call. When a prompt edit shows up as a
multiplied bill rather than a marginal one, the first thing to check is not
what was added but *where* — a value that moved above a cut point is the
signature.

Ordering and allocation are therefore not independent, and ordering is
first. A cut point can only be placed where the gradient already put a
boundary; if two layers are interleaved out of cadence order, no allocation
rescues them and the fix is upstream in composition.

## Audit the allocation

For each declared cut point, name the tier it bounds and the cadence that
invalidates it. A cut point nobody can attribute to a cadence change is a
merge waiting to happen, and reclaiming it is usually how a system finds
the slot it needed for the tool block. The audit belongs with the
assembler's other cross-cutting checks, for the same reason the budget does
— it is the only place the whole artifact, and therefore the whole
allowance, is visible.

Treat a reported hit rate as a claim needing its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
A system advertising a high steady-state hit rate is usually measuring
turns after the first few in one long conversation, which is the most
favourable population available: it excludes every cold start, every
session that ended before the prefix paid for itself, and every fan-out
call that shares no prefix at all. The number that governs the bill is the
hit rate across all calls, cold ones included, and the two differ by enough
to reverse a decision about whether a layer is worth caching.
