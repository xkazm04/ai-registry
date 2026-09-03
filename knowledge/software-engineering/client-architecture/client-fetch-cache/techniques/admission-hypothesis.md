---
layer: technique
type: technique
subject: client-fetch-cache
technique: admission-hypothesis
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [constructing a cache and deciding what belongs in it, a cache is full of entries nobody reads twice, choosing an eviction rule, one TTL is applied across key families with very different volatility]
---

# Admission hypothesis

The golden path names four declared policies. Key, Lifetime and Eviction all
presuppose the entry is already in the cache; this technique owns the one that
puts it there, and the reason it is the policy most often missing is that its
default is invisible. Nothing declines. Everything fetched is stored, and the
first mechanism that removes anything is a size cap reaping under pressure — at
which point the cache is deciding what to keep by memory accident rather than
by anyone's design.

**An admission policy is a stated bet about why this entry will be read again.**
There are only a few bets available, and naming which one you are making is the
whole technique:

- **Recency of access** — it was read recently, so it will be read again. The
  most common bet, and the one least often stated, because it is what
  least-recently-used eviction already assumes.
- **Recency of creation** — it was made recently. Frequently the stronger
  signal, and routinely overlooked: newly created rows churn and are re-read
  while a workflow is live; old rows go quiet and stay quiet. Age since
  *creation* and age since *last access* are different clocks, and most caches
  only ever look at the second.
- **Proximity** — something near it was read, so warm its neighbours. The bet
  behind prefetching a list's items, a route's queries, a page's siblings.
- **Co-writing in time** — it was written alongside something being read now.
  The bet behind grouping by write cadence, and the one that holds trivially in
  append-ordered stores where natural order equals write order.

A cache that admits everything has made all four bets at once, which is the
same as having no reason to expect reuse from any of them.

All four are bets about *time or adjacency*, and all four assume the key is an
identity — so a hit is a proof that the entry belongs to the request. Where the
key is a **resemblance** rather than an identity, a fifth bet becomes available
and that assumption goes with it: the entry will be read again by a different
utterance of the same request. It is the only bet under which a hit can be
wrong rather than merely old, and it changes eviction, measurement and the
collision audit together. It has its own technique —
[similarity-keyed-admission](./similarity-keyed-admission.md) — and the rule
below about free-text populations is scoped to identity keys, where an
unretyped question really is unreusable. Under a resemblance key, that
population is the bet.

## Why the bet has to be written down

Stating it is not bookkeeping; it is what makes the other three policies
checkable.

- **Eviction is a bet you already made.** Least-recently-used is recency of
  access, chosen as a default in almost every cache and argued in almost none.
  If the admission bet is recency of *creation*, then eviction by last access is
  evicting on a different axis from the one that predicted the reuse, and the
  mismatch is invisible until someone measures a hit rate.
- **One lifetime across a key family assumes volatility is constant within it.**
  It commonly is not: volatility decays with the entry's own age since creation,
  so a single duration under-caches the old and stable entries and over-caches
  the new and churning ones. The creation timestamp is usually already on the
  wire.
- **An entry admitted under no hypothesis should not be admitted.** A one-off —
  a mutation's response, a report nobody opens twice, a search keyed on
  free text the user will never retype — costs eviction pressure against
  entries that will be read again, and contributes to every invalidation sweep
  that walks the store. Admit it with a zero eviction time, or do not admit it.

## The bet decays, and nothing tells you

An admission rule names something about the world — a route, a screen, a
workflow — and the world moves while the rule stays. A prefetch table keyed on
routes that were renamed is not a slow cache; it is a cache warming nothing at
all, and it fails silently because a prefetch that never fires looks exactly
like a prefetch that was not needed. **A stated admission rule owes a check that
it can still fire**: the routes it names still exist, the keys it warms are
still the keys the screen requests. That check is cheap — it is a test over the
rule table and the route surface — and without it the table rots at the rate the
product changes.

## Measure whether the bet paid, not whether it fired

Two different numbers, and the weaker one is the one usually available.
*Reachability* asks whether an admission rule can fire at all. *Conversion* asks
whether the entry it admitted was read before it was evicted. A cache with a
prefetch counter that records admissions and never records the subsequent read
can report a large number that means nothing. Count the admitted entries that
were subsequently served from cache, and carry the predicate
([count-carries-predicate](../../../_laws.md#count-carries-predicate)) — an
admission count and a hit count are not comparable unless both name the same
population.

## Decision rules

- Name the admission bet at the cache's construction site, from the four above
  or an explicit *none*.
- `none` implies a zero eviction time. Do not let unreusable entries occupy a
  store that reuses.
- Do not key a cached entry on an unbounded free-text population unless the bet
  is stated and the eviction time is short — or unless the key is a resemblance
  and the bet is paraphrase recurrence, which is a different technique.
- Check that eviction's axis matches admission's. LRU under a
  creation-recency bet is a mismatch to argue, not a default to inherit.
- Where volatility decays with age, derive the lifetime from the entry's
  creation stamp rather than applying one duration to the family.
- Test that every stated admission rule can still fire against the current
  surface, and treat a rule that cannot as a failure rather than a no-op.

## What this technique does not own

The identity of an entry, its canonical serialization and its collision audit
are [cache-key-discipline](./cache-key-discipline.md). When an entry stops being
believable, and when it is removed for memory rather than for belief, are the
golden path's Lifetime and Eviction policies. *When* a warming fetch runs — the
priority order against blocking reads, idle deferral, debouncing, cancellation —
belongs to the prefetch technique; this one owns only whether the entry should
be in the cache at all.
