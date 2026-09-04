---
layer: technique
type: technique
subject: accessibility
technique: hidden-but-mounted-inertness
status: forged
laws: [one-validation-door, gate-sees-target]
shared_with: []
use_when: [choosing between unmounting a subtree and hiding it, keyboard focus lands on controls that are not on screen, a screen reader reads a panel the user cannot see, deciding how a faded or off-screen subtree is hidden]
---

# Hidden-but-mounted inertness

Interfaces keep hidden things mounted for good reasons: a panel that must
not lose its scroll position, form state, or in-flight request when the
user steps away and back; a subtree that has to be painted to be
measured; content that must be present in order to transition out. The
decision to keep it mounted is sound. What goes wrong is the *hiding*,
because hiding is treated as one act — "make it not show" — when the
platform provides two independent channels, and the mechanism a designer
reaches for is chosen for how it animates.

## Hiding is two channels

Every hide either does or does not close the **visual channel** (paint,
layout, pointer target) and either does or does not close the
**accessibility channel** (the node in the accessibility tree, and the
tab stop in the sequential focus order). Sorted by what they actually
close:

- **Removal from the document** closes everything — and discards the
  state that was the reason to stay mounted.
- **Taking the subtree out of the layout, or marking it not visible**
  closes both channels: nothing paints, nothing occupies space or takes a
  tab stop, and no node enters the tree. These are the hides that need
  no second act.
- **Fading to zero opacity, translating off-screen, clipping to nothing,
  collapsing to zero size, or painting something over it** closes *only*
  the visual channel. The subtree keeps its tree node, its tab stops, its
  find-in-page matches, and its pointer targets. It is fully present to
  everyone not using their eyes to decide what is there.
- **Disabling pointer events** closes only the pointer channel — the one
  channel the affected user is not using. It repairs a stray click; it
  repairs nothing for keyboard or non-visual operation. Its useful
  inverse: a transparent wrapper that *does* still capture clicks is a
  dead band over whatever it covers, and this is the fix for that.
- **Marking a subtree hidden from assistive technology** closes the tree
  channel and *not* the focus channel. On its own it produces the worst
  outcome available: a tab stop that reads as silence — focus lands
  somewhere the reader will not describe and the eye cannot find.
- **Marking a subtree inert** closes focus, activation, the tree, text
  selection, and find-in-page together, for the whole subtree.

The trap is structural rather than careless. A subtree that must
transition out has to keep painting while it moves, so the hide *must*
be the visual-only kind; the mechanism is selected by the animation
requirement, and the accessibility channel is then closed by whoever
happened to think of it. Nobody thinks of it, because the developer
shipping the change experiences only the channel that closed.

## The rule

**Every keep-mounted hide closes both channels, from the same
condition.** Not two expressions that happen to agree today — one
condition, both consequences derived from it. Two independently written
conditions on the same subtree is
[one-validation-door](../../../../_laws.md#one-validation-door) violated at
the smallest possible scale, and it fails the same way: the next edit
touches the class that controls the fade and not the attribute that
controls the tree, and the two channels drift apart with nothing visibly
wrong.

The mechanism, in order of preference:

1. **If the state need not survive, unmount.** The cheapest hide is the
   one that removes the question.
2. **If the state must survive but nothing needs to animate or be
   measured, use a hide that closes both channels by itself.** One
   declaration, no second act, nothing to keep in sync — the whole
   defect class does not exist for this subtree.
3. **If the subtree must stay painted, close the other channel
   explicitly at its root, for exactly the interval it is off screen.**
   Inertness is the single attribute that does this completely; a
   hidden-from-assistive-technology marking alone is insufficient and
   must be paired with removing every tab stop underneath it.

Two timing rules make step 3 correct. The attribute flips **with the
state, not at the end of the transition** — a panel is gone the moment
the user believes it is gone, and an outbound animation is not a window
during which its controls are still legitimately operable. And on the
way in, the subtree becomes operable **before** focus is moved into it;
moving focus into a still-inert subtree fails silently, leaving focus
where it was while the interface claims to have opened.

Place the boundary at the **outermost node of the hidden subtree**.
Inertness is inherited and cannot be revoked from inside: a descendant
cannot opt back in, so a boundary sprinkled across inner nodes both
misses siblings and creates unrevivable pockets. One condition, one
node, one attribute.

## Failure modes

- **The invisible detour.** The keyboard user tabs off the last visible
  control and into a mounted, unseen panel; focus vanishes from the
  screen for as many stops as that panel holds. This is
  indistinguishable from focus being lost, which is why it is usually
  reported as "focus disappears" and misdiagnosed.
- **The silent tab stop.** The tree channel was closed and the focus
  channel was not. Focus lands and the reader says nothing at all —
  strictly worse than the invisible detour, which at least announces
  something.
- **Duplicate names across mounted panels.** Several panels mounted at
  once means several controls with the same accessible name in the
  tree. Voice control cannot resolve which one to activate, and a
  reader's element list shows each control as many times as there are
  panels — a defect with no visual symptom whatsoever.
- **Hiding used where disablement was meant.** An inert subtree
  communicates *nothing*; a control that is temporarily unavailable owes
  the user the reason, which is honest disablement
  ([primitive-level-a11y](./primitive-level-a11y.md)), not silence.
- **Announcements from a hidden subtree.** A kept-mounted panel that
  still runs its own status updates speaks about a surface the user is
  not on; the channel-closing rule covers announcing regions too
  ([live-region-architecture](./live-region-architecture.md)).

## Verification sees the tree, not the class

The check that a panel "is hidden" almost always reads the thing that
produced the visual hide — a style, a class, a state flag — which is the
proxy, not the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)); it passes
exactly in the case the defect exists, because the visual channel
closing is precisely what is true and insufficient. The check that sees
the target does one of two things: walk the tab order with the subtree in
its hidden state and assert **zero stops inside it**, or read the
computed accessibility tree and assert the subtree contributes **no
node**. Both are cheap and both are scripted alongside the rest of the
verification stack ([a11y-verification](./a11y-verification.md)).

The same rule applied *across* surfaces rather than within one — the
whole background of a layered overlay made inert while the overlay is
open — is owned by
[focus-and-scroll-containment](../../../shell-and-navigation/modal-stack/techniques/focus-and-scroll-containment.md).
This technique is the in-surface case: siblings inside one screen, where
nothing about the layout suggests anything is being hidden at all.
