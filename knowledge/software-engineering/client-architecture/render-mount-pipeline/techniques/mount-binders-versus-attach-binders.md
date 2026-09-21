---
layer: technique
type: technique
subject: render-mount-pipeline
technique: mount-binders-versus-attach-binders
status: forged
laws: [derivation-names-recomputation, limits-are-derived, creation-names-reaper]
shared_with: []
use_when: [a new blueprint rebinds content whose inputs did not change, listeners stay installed on hosts detached from the window, attaching a host re-pays expensive content binding, deciding what runs when a mounted unit is updated rather than replaced]
---

# Mount binders versus attach binders

A mounted render unit fills its host content through **binders**: small objects
that each apply one concern — the text, the image source, the background, a
click listener, a subscription to a live animated value — and each know how to
undo it. Two questions decide whether updates are cheap and whether detached
hosts are clean, and neither is answered by memoizing the render.

## Two clocks

Binding concerns live on two different clocks, and a unit declares each binder
on the clock it belongs to.

**Mount binders** apply the content itself. They run when the unit is mounted
into content and are undone when it is unmounted. They are typically expensive —
text shaping, image decode requests, building paint state — and they **survive
detachment**: a host detached from the window but still mounted keeps its
content bound, so reattaching costs nothing.

**Attach binders** install what must not outlive attachment: event listeners,
subscriptions to live values, registration with something outside the host.
They run when the host attaches and are undone when it detaches, so a detached
host holds no listener and no subscription. They are typically cheap.

Collapsing the clocks fails in one of two directions. Put listeners on the mount
clock and a host detached for minutes — a screen pushed behind another, a pooled
section held for back navigation — keeps delivering events and keeps the
subscriptions it captured alive. Put content on the attach clock and every
reattachment re-pays the most expensive binding the unit has.

Every bind has its undo, and each binder may hand the undo the state its bind
produced (a request handle, a registration token), so the undo releases exactly
what the bind created rather than guessing
([creation-names-reaper](../../../_laws.md#creation-names-reaper)). Undo runs in
the reverse order of bind, because a later binder may depend on state an earlier
one established.

## Each binder names its own recomputation

When a new blueprint arrives with a unit whose identity matches a mounted one,
the mount layer does not remount it. It first asks the cheapest question: is it
the very same unit, with equivalent layout data? If so, no binder runs at all —
only bounds are applied, because the same content can move. Otherwise every
binder answers **should-update** given its previous input, its new input, and the
previous and new layout data, and the answer is per binder
([derivation-names-recomputation](../../../_laws.md#derivation-names-recomputation)).

The update then proceeds in a fixed order, which exists so that no binder ever
observes another half-updated:

1. If the host is attached, undo the attach binders whose inputs changed.
2. Undo the mount binders whose inputs changed, in reverse order.
3. Re-apply those mount binders, in order.
4. Re-apply the changed attach binders.
5. Apply bounds, whether or not anything was rebound.

A binder present in the old unit and absent from the new one is undone; one new
to the new unit is applied. A unit whose binders all decline costs a comparison
per binder and a bounds update.

## Fixed binders and keyed binders

Most units of a type always carry the same binders in the same order — a text
unit always binds text, then colour, then paint. Declare these as **fixed
binders**: compared by position, with no lookup, and the set of those needing
update recorded in a bitmask. The bitmask is why fixed binders are capped, and the
cap is not a taste: it is the bit width of the mask
([limits-are-derived](../../../_laws.md#limits-are-derived)), and the derivation
belongs beside the constant so a change to the mask type changes the cap with it.

Binders added optionally — accessibility, a feature's own concern — are **keyed**
by binder type, at most one per type per unit, and a later declaration of the
same type replaces the earlier in place. Keying is what lets the update match a
binder across two units whose optional lists were assembled in different orders.

## Why this is a mechanism, not a memoization boundary

Memoization answers whether to re-run a pure function. Binders operate on
retained, mutable host content: they decide which side effects to undo and
redo, in what order, on which clock, and the undo of each needs what its bind
returned. Memoization has no notion of undo, of order, or of two lifetimes, and
treating binding as "render, but memoized" produces exactly the listener leak
and the reattach cost this technique exists to remove.

## Decision rules

- Declare content binding on the mount clock and listeners and live
  subscriptions on the attach clock.
- Pair every bind with an undo that receives the bind's own state; undo in
  reverse order.
- Skip all binders when the unit is identical and layout data equivalent;
  always apply bounds.
- Let every binder answer should-update from its own inputs; update in the fixed
  order.
- Use fixed binders for a type's invariant set, capped at the mask width with the
  derivation written; key optional binders by type.

## How to test for the property

- Detach a mounted host and assert zero listeners and zero live subscriptions
  remain on it; reattach and assert no mount binder ran.
- Push a blueprint that changes only a unit's text: exactly the text binder
  undoes and re-applies; every other binder records zero calls.
- Push a blueprint where the unit moved but nothing else changed: no binder runs
  and bounds are applied.
- Record the call order during an update and assert attach-undo, mount-undo
  (reversed), mount-apply, attach-apply.
- Declare one more fixed binder than the cap and assert construction fails with
  the cap in the message.
