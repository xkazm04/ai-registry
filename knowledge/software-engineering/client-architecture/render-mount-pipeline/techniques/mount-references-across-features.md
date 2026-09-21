---
layer: technique
type: technique
subject: render-mount-pipeline
technique: mount-references-across-features
status: forged
laws: [one-validation-door, creation-names-reaper, absent-guard-is-loud]
shared_with: []
use_when: [a transition, focus retention or a gesture needs an element the visibility window wants unmounted, a single mounted flag keeps being overridden by whichever feature wrote last, a leaving animation pops because its element was recycled mid-flight, deciding how a virtualizer keeps a pinned header or the focused row rendered]
---

# Mount references across features

Whether an element exists is not one feature's decision. The visibility window
wants everything outside the viewport gone. A running transition needs its
leaving element alive until the animation ends, which is by definition after it
has left the viewport. Focus retention needs the focused control to survive
being scrolled away, or keyboard focus falls to the document root. A gesture in
flight needs its target. Each of these is right about its own concern, and each
is wrong if it decides alone.

The structure that lets them all be right is a **reference count per render
unit**. Each feature acquires references for the units it needs mounted and
releases them when it stops needing them. A unit is mounted exactly while its
count is at least one. The mount layer, not the features, performs the mount and
the unmount; a feature can influence what exists and can never create or destroy
a host object itself.

## Ownership is per feature, and misuse is loud

A count alone is not enough, because a count cannot say who holds what. Each
feature keeps the set of unit identities it has acquired, and the count is the
sum across features. Two rules follow and both must fail loudly rather than
clamp:

- **A feature acquires a unit at most once.** A second acquire from the same
  feature is a bookkeeping error in that feature, and absorbing it hides the
  matching release that will be missing later.
- **A feature releases only references it acquired.** Decrementing a count the
  feature does not own lets the window unmount an element the transition is
  still holding — the precise failure the structure exists to prevent — and it
  happens without any visible sign until the animation pops.

Neither rule is a courtesy
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)). A counter that
quietly floors at zero turns a double release into a mounted element that
disappears one frame early, which nobody can attribute. A feature cannot see
another feature's references and does not need to: all mountedness writes go
through one counter whose writers are enumerable
([one-validation-door](../../../_laws.md#one-validation-door)).

## Counting is paid only where someone can veto

If no registered feature is able to prevent a unit from being mounted, every
unit in the blueprint is mounted and no count is kept. The capability to veto is
declared by the feature at registration, and the counting machinery switches on
the moment the first such feature arrives and off when the last one leaves. A
surface with no visibility window pays nothing for this technique.

## Every acquire names its release

References are created in three places and each has a named reaper
([creation-names-reaper](../../../_laws.md#creation-names-reaper)):

- **A new blueprint arrives.** Before anything is mounted against it, each
  feature releases the references it holds for units that no longer exist in
  the new blueprint. Skipping this leaves counts for identities nobody can
  release, because the release path looks units up in the blueprint.
- **The host unmounts entirely.** Each feature releases everything it holds,
  and the mount layer clears its counts.
- **The feature's own condition ends.** The transition finishes, focus moves, the
  gesture lifts. This is the feature's own reaper and the only one it has to
  write; the other two are structural.

## The visibility window's acquire rule

The window is the busiest feature and its rule deserves stating exactly. It
holds a reference for a unit when the unit **intersects the visible region**, or
is the **root** of the host, or is **excluded** from windowing by declaration, or
is a **host that still holds mounted children**. The last clause is the one
implementations miss: a child kept mounted by another feature needs its parent
host mounted to be anywhere at all, and a window that releases the parent tears
the child out from under the transition that held it. When the window
reinitialises from scratch, processing units from the leaves upward lets it see
that a host's children have gone before it decides about the host.

## Boundaries

- **Inertness is not decided here.** Any feature that holds an off-screen or
  leaving element mounted has created a hidden-but-mounted subtree, and the
  obligation to close its focus and accessibility channels is the accessibility
  subject's rule, applied from the same condition that took the reference.
- **Premounting is a feature like any other.** Idle premount acquires references
  ahead of need; its interaction with the window's releases belongs to
  edge-sorted-incremental-mount.
- **The userland form is an index hook.** A list virtualizer that accepts a
  function returning the indices to render can express this technique without
  owning a mount layer: compute the visible range, add each feature's pinned
  indices, return the union. What that form cannot express is per-feature
  ownership, so the loud-misuse rules must be kept by the code that builds the
  union.

## Decision rules

- When more than one feature has an opinion about an element existing, replace
  the flag with a per-unit reference count and per-feature ownership sets.
- Throw on a duplicate acquire and on releasing an unowned reference; never
  clamp.
- Enable counting only while a registered feature can veto mount.
- Release references for removed units before mounting a new blueprint; release
  everything on host unmount.
- The window holds a host that still has mounted children.

## How to test for the property

- Start a leaving transition on a unit, scroll it out of the viewport, and
  assert it stays mounted until the transition releases; then assert it
  unmounts on that frame and not before.
- Release from a feature that never acquired: the call fails.
- Mount a blueprint, mount a second one without one unit, and assert no feature
  still owns a reference for the missing identity.
- Keep a child mounted by a non-window feature, scroll its parent host fully off
  screen, and assert the parent host remains mounted.
- Register only features that cannot veto; assert the count map stays empty
  across a scroll.
