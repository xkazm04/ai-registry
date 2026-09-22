---
layer: technique
type: technique
subject: motion
technique: one-shot-guarding
status: forged
laws:
  - identity-survives-reuse
shared_with: []
use_when: [entrance animation replays on poll or tab return, choosing what keys an entrance seen-set, deciding when a seen-set may legitimately reset]
---

# One-shot guarding

Entrance motion has a contract: it plays on an item's **first appearance
before this user, in this surface, ever** — and never again. Every
violation of that contract is the same bug wearing different clothes: the
poll that makes a dashboard ripple every thirty seconds, the tab return
that replays the welcome, the scroll-back that re-animates rows the user
read a minute ago, the resort that shimmers the whole table. The user's
translation is not "polished"; it is "the product forgot it already showed
me this."

The *semantics* — which load-cycle edge may trigger a cascade at all, what
counts as a legitimate reset policy — are owned by the async-surface
doctrine's arrival-choreography technique and are taken here as given. This
technique owns the **mechanics**: the guard that makes those semantics hold
under re-render, windowing, reuse, and restart.

## Why the bug class exists

Entrance replays ship because entrance gets coupled to an **implementation
event** — mounting, data delivery, render — that fires for dozens of
reasons unrelated to first arrival. Mount fires on scroll-back under
windowed rendering, on tab return, on a parent's remount. Data delivery
fires on every poll. Render fires on anything. No implementation event
means "first time"; only a guard can mean that. So the mechanic is never
"animate on mount, carefully"; it is "consult a memory of what has already
entered, always."

## The guard: a surface-scoped seen-set, keyed by identity

The load-bearing decisions are *what keys the memory* and *where it lives*:

- **Keyed by stable identity** — the identifier minted by the system of
  record — per
  [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse).
  Position keys replay on whoever moves into the slot after a resort.
  Content-hash keys replay on edit. Index keys replay on insertion above.
  Only minted identity survives the operations lists actually undergo.
- **Scoped to the surface, not the item.** Guard state stored in the item's
  own component dies with the item — and items die constantly: windowed
  rendering unmounts them on scroll, navigation unmounts the subtree. The
  seen-set must outlive every item it remembers, so it lives with the
  surface (or higher, if the surface itself unmounts on navigation and
  return visits must stay quiet — the same lifetime reasoning as retained
  content caches).
- **Written by the entrance itself.** The mark lands when an identity's
  entrance plays (or is skipped as already-seen) — not on mount, which
  would mark items that never visibly entered. In practice the critical
  property is the *scope* of the set; the exact write instant matters less
  than that the set survives the item.
- **Consulted synchronously, before first paint of the item.** A guard
  checked after render produces a one-frame flash of the animated start
  state — the item blinks in at its pre-entrance opacity, then snaps. The
  check must decide the item's very first frame: enter animated, or appear
  settled.

## Reset is a policy, applied in one place

A seen-set that only grows eventually suppresses legitimate entrances —
a surface pointed at a genuinely different dataset *should* welcome the new
content. What clears the set is a **policy decision made once**, not an
accident of component lifetimes:

- **Context change resets.** The surface now asks a categorically different
  question — different entity, different scope — so the set resets and the
  new answer may enter. The reset key is the *question's* identity (the
  entity, the scope), compared explicitly.
- **Refresh never resets.** Poll, refetch, revalidation, pagination
  re-delivering known identities: the set persists, no replay. This single
  rule kills the majority of the bug class.
- **Whatever the policy, it is written once.** The reset condition lives
  beside the seen-set, as one comparison — never distributed across call
  sites each deciding whether "their" change was contextual. Two surfaces
  with different accidental reset behavior is how a product feels
  inconsistent without anyone being able to say why.

## Genuinely new items in a settled surface

After first arrival, a live surface may receive individually new
identities — a feed item, a background insert. The guard already handles
this correctly with no extra machinery: the identity is absent from the
seen-set, so it alone enters animated while its settled neighbors hold
still. This is the payoff for keying by identity rather than by load
cycle: "first appearance" is decided per item, and the full-surface cascade
versus the single-item entrance fall out of the same mechanism.

## Two shapes that carry the contract without a growing set

The seen-set is the general mechanism, and a surface that windows its rows,
polls, and resorts needs all of it. Two narrower shapes satisfy the same
contract with less machinery, and both are worth recognizing, because a reviewer
who knows only the general mechanism reads them as missing guards.

**The structural reset.** Where a subtree can mount for exactly one reason — it
is assembled ahead of time, it does not refetch beneath itself, it is not
windowed, and the only navigation that reaches it replaces it — then keying that
subtree on the *question's* identity makes mount and first arrival the same
event. The entrance replays on a context change because the subtree is genuinely
new, and it cannot replay on a refresh because no refresh reaches it. The reset
policy has not been skipped; it has been collapsed into the key, which is the one
place it could drift to and the one place a reviewer will look.

What makes this legitimate is a *precondition*, not a preference, and the
precondition is the thing to write down beside the key: **mount has exactly one
cause.** The day the panel gains a poll, a windowed list, or an enclosing
navigation that remounts it, the same key becomes a replay engine, and nothing
about the change announces it — the edit that breaks the contract is in a
different file from the key that carried it. A structural reset with its
precondition unstated is a guard that will be removed by someone who never knew
it was one.

**The short-lived arrived-set.** The memory can also be inverted. Instead of
recording everything that has entered and defaulting to *animate*, record what
just *changed* and default to *settled*: compare the previous snapshot with the
current one, derive the identities that arrived or were rewritten, mark those,
and clear the mark after a fixed window. The set is bounded by the size of one
change rather than by the life of the surface, a re-render for any other reason
finds nothing marked and plays nothing, and "already seen" needs no storage
because it is the resting state.

Two conditions keep it honest. **The first snapshot is history, whatever its
age** — a surface opened onto work that has already happened must not animate it
as if it had just arrived, so only a snapshot that *replaces* one is a change.
And the window is a real limit: a change that lands while the mark is clearing,
or an update the surface receives without re-deriving a delta, shows nothing at
all. That is the trade — the growing set can always answer *has this been seen*,
and the arrived-set can only answer *did this just change*, which is a different
and smaller question that happens to be the one an entrance needs.

## Testing the contract

Entrance replay is a defect almost no automated suite catches, because
suites rarely assert *absence* of animation. The contract is cheap to test
at the guard layer, though: the seen-set is pure state. Feed it a delivery,
a re-delivery, a resort, a scroll-simulating unmount/remount, and a context
change; assert which identities are entitled to enter after each. Testing
the guard rather than the pixels is what makes one-shot a *verified*
property instead of a hope.
