---
layer: technique
type: technique
subject: render-mount-pipeline
technique: recycle-by-content-type
status: forged
laws: [creation-names-reaper, limits-are-derived, absent-guard-is-loud]
shared_with: []
use_when: [a surface with many item kinds allocates host objects on first appearance of each kind, deciding what a recycling pool is keyed by, recycled content arrives carrying a previous item's listeners, a pool outlives the screen that created it]
---

# Recycle by content type

A list that recycles whole items keeps one pool per item kind. On a screen with
three kinds that is efficient; on a feed with forty it is not, because the
element scrolling into view is often the first of its kind the list has seen,
and allocating it lands in the same frame that must also bind, measure and lay
it out. The pool meanwhile holds items of kinds that will not appear again.

When layout emits a blueprint before anything is instantiated, the pool no
longer has to be keyed by the composite item. **Key it by the leaf content
type** — the text surface, the image surface, the host container — so that any
text recycles into any other text regardless of which item kind it belonged to.
A heterogeneous screen then allocates a handful of content types once and reuses
them indefinitely.

## The precondition, stated so nobody skips it

This works only because positions are known before instantiation. A toolkit that
lays out its host tree directly has instantiated every element of an item before
it knows where any of them goes, so it can only recycle the whole item. Content
recycling is a consequence of blueprint-then-mount, not a pool tuning; bolting a
leaf pool onto a host-tree layout buys fragmentation and no reuse.

## The pool's lifetime is its creator's

Content holds a reference to the context it was created in — the screen, the
window, the activity scope. A pool that outlives that context holds the context
alive through every pooled object in it.

- **Scope pools to the context that created their content**, and destroy the
  pool when the context is destroyed. The reaper is the context's own
  destruction signal, subscribed when the pool is first created for that context
  ([creation-names-reaper](../../../_laws.md#creation-names-reaper)).
- **Remember destroyed contexts.** A release or acquire arriving after
  destruction — a late callback, an unmount racing teardown — must find no pool
  and discard, never lazily create a fresh pool keyed by a dead context.
- **Offer narrower scopes** for pools that should die before their context: one
  bound to a sub-lifecycle, and one released explicitly by its owner.

## Bounded, with a discard path

A pool is a cache of allocations and needs a size
([limits-are-derived](../../../_laws.md#limits-are-derived)). The bound per
content type is the number of instances of that type that can leave the viewport
between two frames on the densest surface that uses it — derived from that
measurement and written beside the number, not a round default chosen once and
inherited by every type.

A release the pool rejects because it is full is not a silent drop. Each content
type may declare a **discard hook**, called for content that will not be pooled
— rejected releases, content released when no pool exists, and every item still
in a pool when the pool is cleared — so content holding native resources,
decoders or subscriptions releases them deterministically instead of whenever
the collector notices.

## Strip before release

Content returned to a pool must carry nothing of the unit it served. All binders
are unbound before release (the binder technique owns their order), and every
listener installed on the host by anything — not only by binders — is removed.
Content released with a click listener attached delivers the next item's click
to the previous item's handler, and holds that handler's captured state alive
while pooled.

The strip belongs in the release path, unconditionally. A strip behind a switch
that defaults off protects the installations that turned it on
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)); a debug-only
validator that detects content released with listeners attached is useful, and
its existence is evidence that the unconditional strip is owed.

## Preallocate off the critical path

Allocation cost does not disappear with pooling; it moves. Move it somewhere
harmless: in idle time before a surface needs it, allocate content into the pool
up to its bound, stopping at the first release the pool rejects. A preallocation
step that does not check the bound fills memory with content the pool will
refuse.

## Opting out

Some content cannot be reset cheaply or safely — a media player with decoder
state, an embedded document surface, anything whose reset is more expensive
than allocation. The content type declares that it can neither be acquired from
nor released to a pool, and the mount layer creates and discards it every time.
A global switch that disables pooling entirely exists for debugging and tests,
where recycled state is a suspect.

## Decision rules

- When a surface has many item kinds, key pools by leaf content type, never by
  item kind.
- Scope every pool to the context that created its content; destroy it with that
  context; discard anything arriving after.
- Bound each pool from a measured churn, and call a discard hook for everything
  that leaves without being pooled.
- Unbind every binder and strip every listener before release, with no switch.
- Preallocate in idle time up to the bound; let a type opt out when reset is
  unsafe.

## How to test for the property

- Scroll a feed with many item kinds after warm-up and count allocations per
  content type: they stay flat as new item kinds appear.
- Destroy a screen and trigger a late release for its content: no pool is
  created and the discard hook runs.
- Fill a pool to its bound and release one more: the discard hook runs once.
- Release content with a listener attached and acquire it for another unit;
  firing the event reaches no handler of the previous unit.
- Preallocate twice the bound and assert the pool holds exactly the bound and
  allocation stopped at the first rejection.
