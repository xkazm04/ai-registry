---
layer: golden-path
type: golden-path
subject: paged-block-cache
status: forged
use_when: [designing a cache over prefixes of ordered data, reusing partial computation across requests that never coordinated, choosing an eviction order for a fixed-size block pool, a shared cache spans more than one trust boundary]
techniques:
  - chained-block-identity
  - append-only-tolerates-duplicates
  - release-order-is-the-eviction-policy
  - one-page-size-bought-with-padding
  - salt-as-a-cache-partition
---

# Paged block cache

Some computations are *prefix-monotone*: the work done over the first *n*
elements of an ordered input is identical no matter what follows, and the work
done over the first *n+1* elements strictly extends it. Sequence models,
incremental parsers, rolling checksums, log-structured replay, stream folds
over an append-only journal — all share this shape. Whenever a system computes
prefix-monotone derived state for many inputs that share their beginnings, the
same arithmetic is being redone across requests that have no idea the others
exist, and the cache that recovers it is this subject.

The unit is a **block**: a fixed-size run of consecutive elements, together
with the derived state those elements produced. Blocks are the compromise the
subject is built on. Caching whole inputs is nearly useless — two requests must
be byte-identical to share anything, and the hit rate collapses to the rate of
literal repeats. Caching per element is the other failure: metadata swamps the
payload, and lookup cost scales with input length. A block is large enough
that its bookkeeping is amortized and small enough that partial overlaps are
still found.

The subject is *not* about any one domain's derived state. It is about the
five design surfaces a prefix cache has, and about the fact that the
interesting choices sit on surfaces most cache literature treats as settled:

| Surface | The question | Where the surprise is |
| --- | --- | --- |
| **Identity** | What key names a block? | Contents alone are not enough — position is meaning, so keys chain. |
| **Admission** | What is allowed in? | Trivial here (complete blocks, always) — which is why it is not where the design effort goes. |
| **Release** | What order does the reclaim list take? | This is where the reuse prediction lives, and it costs nothing. |
| **Allocation** | How big is a page, and who shares the pool? | One page size for consumers with different per-element costs, bought with padding. |
| **Partition** | Who may share a hit? | The key is a privacy boundary, because a hit is observable. |

## Position is part of identity

The first and most consequential rule: **a block's key is a function of its
contents *and* of every element before it.** Two blocks holding identical
elements at different offsets are not interchangeable, because the derived
state they carry was produced by a computation that had read everything
earlier. A cache keyed on block contents alone will serve the second and be
silently, catastrophically wrong — not a stale answer, an answer to a
different question.

The mechanism is a chain: each block's key mixes the key of the block before
it with its own contents. That single decision buys three properties that no
other keying scheme gives at once.

- **One lookup is an exact-prefix membership test.** "Has anyone ever computed
  precisely this prefix?" is a dictionary probe, not a search.
- **Reuse is automatic and uncoordinated.** No caller asks for reuse, declares
  a session, or names a sibling request. Two unrelated requests that happen to
  begin the same way find each other's work by arithmetic.
- **Longest-common-prefix is a forward walk with a stopping rule.** Probe block
  0, then 1, then 2, and stop at the first miss. You may not skip ahead: past
  the first miss no key is computable, because the chain's next link needs the
  one that was absent.

[chained-block-identity](./techniques/chained-block-identity.md) owns the key's
construction, including the inputs beyond contents that must be in it and the
collision question a content-derived key always raises.

**Boundary against the nearest neighbour in this corpus.** There is a
well-established practice of digesting a whole standing artifact and comparing
the digest before reuse — a staleness gate. It is a different object and the
discriminating question is short: *how many keys does one request produce, and
who is the counterparty?* A staleness gate produces one key per artifact and
compares it against **its own earlier self**; a match means "nothing changed,
continue". A prefix cache produces one key per block per request and compares
them against **everyone else's work**; a match means "someone already did this
part". The first is an invalidation mechanism whose interesting failure is a
false mismatch; the second is a sharing mechanism whose interesting failure is
a false match. Do not fuse them: a whole-artifact digest cannot answer a
partial-overlap question, and a chained block key cannot tell you that the
artifact behind it was reconfigured — that fact has to be *inside* the key
(see the technique), not compared against it.

## The naive readings, and what each one costs

- **"Just hash the block."** Position-blind keys. Correct-looking, wrong
  answers, and no test catches it until two inputs share a middle segment.
- **"Cache the whole request."** Zero sharing except on literal repeats, which
  is the traffic pattern nobody has.
- **"Cache partial blocks too, we'll fix them up later."** A partial block's
  identity is not final: its key changes as elements arrive. Publishing a key
  that will change is publishing a lie with a deadline. Only complete blocks
  are admitted, which is why the admission policy is a one-liner and the
  interesting invariant lives next to it —
  [append-only-tolerates-duplicates](./techniques/append-only-tolerates-duplicates.md).
- **"Use least-recently-used, everyone does."** Recency is the default bet, not
  a reasoned one. In a prefix cache the structural predictor is *depth*, and it
  is available for free (below).
- **"A hit is always a win."** A hit is also a signal. Latency that depends on
  whether someone else recently submitted the same beginning is an oracle, and
  it has been measured as one —
  [salt-as-a-cache-partition](./techniques/salt-as-a-cache-partition.md).

## Admission is boring; release is where the design is

Most cache design spends itself on admission — should this entry be here, what
is the reuse hypothesis, what lifetime does it get. A prefix cache answers
admission structurally: a block that completed is admitted, always, because the
work is already done and the block already occupies its page. There is nothing
to decide.

That makes it easy to inherit an eviction policy by default. Do not. **The
reclaim list is ordered at release, in an order the releasing party chooses,
and that order is the whole eviction policy.** The general rule, which is what
transfers out of this subject:

> The cheapest moment to rank a freed resource is the moment it is freed, and
> the party doing the freeing knows something the cache does not.

The cache sees accesses. The releasing request sees *structure* — which of its
blocks were deep in a long input and which were the opening ones. In a prefix
cache that structural knowledge has a precise consequence: a block near the end
of an input incorporates the most preceding elements and is therefore the least
likely to be a prefix of anybody else's input, while block 0 incorporates
almost nothing and is the most likely to be shared by everything. So a
releasing request hands its blocks back **in reverse**, deepest first; they
join a queue that the allocator drains from the front, so the deep blocks sit
ahead of the shallow ones and die first. No scan, no scoring pass, no
per-access bookkeeping on the hot path — a prediction encoded as an ordering,
paid for once, at a moment the code was already executing.

The relationship to recency is worth stating exactly, because "release
ordering replaces recency" is the wrong reading. A queue drained from the front
and filled at the back *is* a coarse recency policy: whichever request released
longest ago is nearest eviction. The release ordering is the **tie-break inside
one release**, and that is where the free information sits — recency cannot
order blocks that were all freed in the same instant, and structure can.

The same ordering satisfies a correctness obligation that has nothing to do
with prediction. Because lookup is a forward walk that stops at the first miss,
evicting a block strands every descendant of it: the children remain resident
and are permanently unreachable, since no lookup can ever compute their keys
again. Freeing children before parents is therefore not merely the better bet,
it is the ordering that keeps the cache free of unreachable residue.

[release-order-is-the-eviction-policy](./techniques/release-order-is-the-eviction-policy.md)
owns the ordering, the intrusive list structure that makes a mid-list removal
constant-time when a queued block is hit, and the boundary against the
admission question — those are two different policies and a system needs both,
but a stated admission bet does not choose a release order and a release order
does not decide what enters.

## One pool, one page size, and an honest bill for it

A prefix cache serving heterogeneous consumers meets a structural fork. When
different classes of derived state cost different amounts of memory per
element, one page of fixed byte size holds a different *number of elements* per
class. Block boundaries then stop lining up across classes — and boundaries
must line up, because identity is defined over element ranges and a chain whose
links disagree about where they end is not a chain.

There are two ways out and only one of them scales. A pool per class gives each
its natural page occupancy and buys N free lists, N eviction policies, and
cross-pool starvation with no arbiter: a request blocks for want of a page in
one pool while another pool sits half empty, and nothing in the system is
permitted to rebalance them. The alternative is one pool, one page size, and a
per-block element count taken from the *most expensive* class — so cheaper
classes use part of their page and pad the rest. That is real, permanent waste,
and it is paid twice: once in bytes, and once in *granularity*, because the
usual way to reconcile a very expensive class with a very cheap one is to
enlarge the block until the cheap class's page reaches the expensive one's — and
a larger block quantizes prefix reuse more coarsely. Unification and reuse
granularity are coupled through the same constant, which is why the discipline
is to compute the waste, publish it, and derive the page size from a measured
per-element cost rather than choosing it by feel
([one-page-size-bought-with-padding](./techniques/one-page-size-bought-with-padding.md)).
A unified allocator with a stated waste percentage is a system one person can
reason about; four specialized allocators with no stated waste is four systems
and an unowned interaction.

## The key is a trust boundary

Everything above optimizes for sharing, and sharing across parties is an
information flow. Because a hit is faster than a miss, and because the chain
makes a hit mean *exactly* "this precise prefix was computed recently", a
caller who can time its own requests can test hypotheses about what other
callers submitted. This is not theoretical: the discrimination has been
measured at ROC AUC 0.99 from a prefix only eight elements long. The naive
mitigations are both bad — disabling reuse forfeits the entire optimization,
and per-tenant pools reintroduce the fragmentation the unified pool exists to
avoid.

The good fix falls out of the chain. Mix an optional caller-supplied **salt**
into the *first* block's key. Because every later key descends from that one,
salting block 0 partitions the entire cache along whatever boundary the caller
names, at the cost of one extra input to one hash, and at zero cost when no
salt is supplied. The knob is not on/off, it is **granularity**: a salt per
tenant preserves intra-tenant sharing and eliminates cross-tenant probing; a
salt per session preserves almost nothing. Coarser salt, higher hit rate,
weaker boundary — state which boundary you actually have and salt at exactly
that grain. The salt is also a *secret*, not a label: an adversary who can guess
another partition's salt can craft probes inside it and the oracle is restored,
so it is a long random value and never a tenant name or account identifier. And
treat the control as the optional guard it is: a privacy feature that must be
switched on protects the documentation and not the fleet, so attach the salt at
the boundary that already knows the principal rather than asking every caller to
remember it.

## Failure modes this standard exists to prevent

- **The position-blind key.** Contents-only hashing. Serves confidently wrong
  derived state, and only when inputs share a middle.
- **The partial-block publication.** A key minted before its block is complete,
  changing under readers who already took it.
- **The rewrite race.** Detecting a duplicate on insert and retro-pointing an
  existing reference at the older equal block — a mutation path introduced to
  reclaim a bounded, short-lived duplicate.
- **The stranded subtree.** Eviction in an order that frees a parent while its
  descendants stay resident, occupying pages no lookup can ever reach again.
- **The inherited eviction policy.** Recency adopted as a default in a
  structure that hands you a strictly better predictor for free.
- **The unpriced page.** One page size chosen for a unified allocator with the
  padding waste neither measured nor published, so nobody can say when the
  unification stopped being worth it.
- **Reuse by position colliding with reuse by content.** An allocator that
  recycles a fixed set of slots by offset — a ring over a bounded window, a
  round-robin over a fixed frame — is a second reuse discipline, and it is
  incompatible with this one: a slot whose occupant is chosen by position cannot
  also be named by its content. Where both are wanted, the positional scheme is
  the one that has to give.
- **The silent oracle.** A cache shared across a trust boundary because sharing
  was the point and nobody asked who else is measuring the latency.
- **The salt as a switch.** A partition control shipped off by default, offered
  as an option, and therefore absent everywhere it mattered.

## The techniques

- [chained-block-identity](./techniques/chained-block-identity.md) — the key is
  a function of the parent key and this block's contents, plus everything that
  changes how the derived state was produced; the forward walk and its stopping
  rule; collisions and what a content-addressed key owes.
- [append-only-tolerates-duplicates](./techniques/append-only-tolerates-duplicates.md)
  — only complete blocks are admitted, the per-request reference table never
  rewrites, and a bounded transient duplicate is cheaper than a mutation path.
- [release-order-is-the-eviction-policy](./techniques/release-order-is-the-eviction-policy.md)
  — rank a freed resource at the moment it is freed; deepest first; the
  intrusive free list; where this stops beating recency.
- [one-page-size-bought-with-padding](./techniques/one-page-size-bought-with-padding.md)
  — one allocator for consumers with different per-element costs, the smallest
  count wins, the waste is derived and published.
- [salt-as-a-cache-partition](./techniques/salt-as-a-cache-partition.md) — a
  privacy control implemented as an extra key input, granularity as the knob,
  and the hit-rate bill stated honestly.
