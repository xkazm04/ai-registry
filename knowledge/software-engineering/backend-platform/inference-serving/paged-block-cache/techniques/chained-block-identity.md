---
layer: technique
type: technique
subject: paged-block-cache
technique: chained-block-identity
status: forged
laws: [identity-survives-reuse, derivation-names-recomputation]
shared_with: []
use_when: [designing the key for a prefix cache, deciding what besides contents belongs in a cache key, a cache serves derived state that looks right but answers a different question, choosing between content-addressing and positional keys]
---

# Chained block identity

A block holds derived state produced by a computation that had already read
everything before it. Its key must therefore name that history, or the key is
naming the wrong thing.

The construction is one line:

```
key(0) = H(root, contents(0), extras)
key(i) = H(key(i-1), contents(i))
```

`root` is a constant (or a partition label — see
[salt-as-a-cache-partition](./salt-as-a-cache-partition.md)), `contents(i)` is
the exact ordered run of elements in block *i*, and `extras` are the inputs
described below. Every key transitively covers the entire prefix ending at its
block, which is the property the whole cache is built on: a dictionary probe on
`key(i)` answers *"has this precise prefix, in this exact order, from the very
beginning, been computed before?"* — not "does something similar exist".

This is [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)
applied to a value whose identity is positional. An offset is not identity: the
same elements appear at different offsets in different inputs and carry
different derived state. A per-request sequence number is not identity either —
it is unique to a request that will end, and the point of the cache is reuse by
requests that never met.

## The forward walk, and why you may not skip

Lookup is not a search. It is a walk:

1. Compute `key(0)`; probe.
2. On a hit, take the cached block, compute `key(1)` from it; probe.
3. Repeat until a probe misses. **Stop there.**

The stopping rule is structural, not an optimization. Past the first miss no
subsequent key is computable, because computing `key(i)` requires `key(i-1)`,
which is only defined by the chain — not by anything in the current input. A
cache built this way therefore serves *prefixes* and only prefixes. It can
never recover a shared middle segment when the beginnings differ, and telling
callers otherwise is the most common overclaim about this design. If shared
middles are the traffic you actually have, this is the wrong cache.

A second consequence lands on eviction: because the walk cannot skip, a missing
block makes every descendant of it unreachable forever. That is why release
order frees children before parents
([release-order-is-the-eviction-policy](./release-order-is-the-eviction-policy.md)).

## What else belongs in the key

The key names a *derived* value, so it obeys
[derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation):
everything that changes how the derived state was computed is an input to the
key, or the cache will serve state computed one way to a caller expecting
another. Enumerate the derivation's parameters explicitly and put them in the
first block's `extras`, where a single mix propagates to every descendant:

- **The identity and version of the computation itself** — which producer, which
  version of it, which configuration flags alter the output. A producer upgrade
  that changes derived state and not the key is a silent corruption whose blast
  radius is the entire cache.
- **Any numeric-representation choice** that changes bytes without changing
  semantics, when consumers of the cache assume a representation.
- **Auxiliary inputs the elements do not carry** — side inputs, adapters,
  modifiers attached to a request that shape what each element produces.
- **The block size**, if the pool can ever be reconfigured while entries
  survive. Two blocks over the same elements at different sizes are different
  objects.

The test for each candidate is the same: *if this differed and the elements did
not, would the derived state differ?* If yes, it is a key input. If no, keeping
it out preserves sharing, and preserving sharing is the point.

There are two kinds of extra and they attach at different places, which is the
distinction most implementations get wrong on the first pass:

- **Global parameters** — the producer's identity and version, the
  representation choice, the block size, a partition label. These describe the
  whole computation, so they go into the *root* mix only. The chain propagates
  them for free, and repeating them per block costs hashing on the hot path for
  no additional discrimination.
- **Range-local extras** — anything that identifies content occupying *this*
  block's element range but not carried by the elements themselves. The
  canonical case is a placeholder run: the elements are identical filler and the
  thing they stand for is attached out of band, so a key over elements alone
  makes two different payloads indistinguishable. Such an extra must be mixed
  into every block whose range the payload spans, not just the first.

The test that separates them: *does this input vary along the sequence?* If it
does, it is range-local and must be mixed where it applies. If it is constant
for the request, it is global and belongs at the root.

**A caller-supplied identity is a claim, not a derivation.** Where an out-of-band
payload is expensive to hash — a large binary — the tempting optimization is to
let the caller supply an identifier for it and key on that instead of on its
bytes. This is a real and worthwhile optimization and it changes the security
model completely: identity is now asserted by a party who may not own the
content, so two callers who assert the same identifier for different payloads
get each other's derived state. Accept caller-supplied identity only where every
caller shares a trust boundary, require the identifiers to be unguessable, and
partition the cache as well (see
[salt-as-a-cache-partition](./salt-as-a-cache-partition.md)) wherever they do
not.

## Collisions are a correctness question, not a performance one

A content-derived key that collides does not degrade the cache; it serves the
wrong prefix's derived state as though it were yours, and nothing downstream
can tell. Three postures, in increasing cost:

- **Wide digest, no verification.** Accept the collision probability as
  negligible against the number of live blocks. Legitimate, but state the
  number: the birthday bound over the *maximum simultaneously cached blocks*,
  not over lifetime insertions, and re-derive it when the pool grows.
- **Verify on hit.** Store the block's elements alongside its derived state and
  compare them on every hit. Removes the risk, costs memory and a comparison per
  hit. The right default when the elements are small relative to the derived
  state — which, in this class of cache, they usually are.
- **Randomizing the root.** The chain gives you one place to inject
  unpredictability: the root value every key descends from. Randomize it
  per process and an adversary can no longer search offline for a colliding
  block and place it at a key a victim will look up.

Those three are not a ladder to climb; the third is conditional on the first,
and getting the condition backwards costs real capability. **Randomize the root
only when the digest is not collision-resistant.** A cryptographic digest's
collision resistance does not depend on a secret root, so keeping the root a
fixed constant is safe *and* buys something valuable: independent processes
computing identical keys for identical content, which is what lets a prefix
cache be shared across processes, nodes and restarts with no coordination at
all. A random root throws that away for nothing. A non-cryptographic digest —
chosen for speed — has no such guarantee, so there the per-process random root
is the mitigation that makes it usable, and cross-process sharing is the price.

The two mechanisms must not be conflated: the root's randomness defends against
*collision search*, and the partition salt defends against *inference from
sharing*. They are different attacks and one does not substitute for the other.

Two further inputs to the choice, both easy to discover too late:

- **Serialization is part of the digest.** If key inputs are serialized by a
  language- or version-specific mechanism, identical content produces different
  keys across versions and across implementations, and cross-process sharing
  silently stops working — with no error, only a hit rate that fell. A cache
  meant to be shared beyond one process needs a canonical, cross-language
  serialization, and that is a design-time choice because changing it
  invalidates everything.
- **A collision in a shared cache is a disclosure, not just a bug.** Where
  tenants share a pool, a collision hands one tenant another's derived state.
  That reframes a speed-versus-safety hash choice: the fast digest's cost is not
  measured only in wrong answers.

Choose deliberately and write down which one you chose. The failure signature
of an unconsidered choice is a corruption report nobody can reproduce.

## Decision rules

- Chain the key over the parent key; never hash block contents alone.
- Mix request-constant derivation parameters into the first block only, and
  enumerate them at the definition site; mix range-local extras into every block
  they span.
- Randomize the root only if the digest is not collision-resistant; otherwise
  keep it fixed so independent processes can share the cache.
- Stop the lookup walk at the first miss; do not attempt suffix or middle
  matching, and do not claim it.
- If contents are attacker-controlled and the cache crosses a trust boundary,
  key the hash — or verify on hit.
- Version the key procedure itself. A change to what goes into the mix
  invalidates the whole cache once, explicitly, rather than producing a
  population of entries built under two rules.

## When not to use this

- **Unordered inputs.** A set, a bag of attributes, an object graph — there is
  no "before", so there is nothing to chain and an ordinary content-addressed
  cache is correct and simpler.
- **Non-monotone derivation.** If the derived state for element *n* depends on
  elements after *n*, no prefix is stable and the entire premise fails. Check
  this first; it is a property of the computation, not a tuning choice.
- **Inputs that rarely share beginnings.** The chain is free to build and
  useless without prefix overlap. Measure the overlap distribution in real
  traffic before building the machinery; a hit rate that comes entirely from
  one long common preamble is better served by pinning that one prefix.
