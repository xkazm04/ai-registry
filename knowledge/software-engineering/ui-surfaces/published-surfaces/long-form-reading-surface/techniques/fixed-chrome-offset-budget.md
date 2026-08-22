---
layer: technique
type: technique
subject: long-form-reading-surface
technique: fixed-chrome-offset-budget
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [an anchor jump lands with the heading hidden under the header, two pinned bars overlap, a pinned panel stopped pinning after a layout change, choosing where a sticky offset number lives]
---

# The fixed-chrome offset budget

Fixed chrome — a header that stays put, and anything pinned beneath it —
consumes the top of the viewport permanently. Every element that must sit clear
of it needs the same number, and the number is a **measurement of rendered
chrome**, not a design token: it is however tall the header actually renders,
which depends on its padding, its font, its line height, and whether it wraps.
Left to spread, that measurement gets re-guessed at every site that needs it,
each guess is close, and the surface acquires a class of defect that is trivially
visible to a reader and nearly invisible in a diff.

## One module states the budget; every offset derives from it

The rule is the vocabulary rule applied to geometry
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)):
one module holds the chrome measurements and every offset derived from them, and
no pinned element carries its own number. What it exports is not one constant
but a small, named set — the header height, the top offset for a pinned panel,
the scroll-margin an anchored heading needs, the maximum height a pinned panel
may occupy — each named for the role it plays rather than its value, so a reader
of a call site sees *why* the offset is there.

Two properties make the module usable rather than merely central:

- **Each constant names what it measures and how to re-measure it**
  ([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
  A bare number is a fact nobody can verify and therefore nobody will update
  when the header changes; the same number with "the rendered height of the
  fixed header, measured at the default text size" is a claim the next person
  can check in ten seconds. This is the difference between a constant that
  survives a redesign and one that becomes a mystery everyone routes around.
- **A drawn band diagram sits next to the constants.** Vertical stacking is
  spatial, and prose about it is a poor decoder ring. A few lines of drawn
  bands — header, gap, panel top, reading band, fold — let a reader confirm at a
  glance that the numbers describe the layout they are looking at, and make an
  inconsistency between two of them obvious rather than arithmetic.

The uncomfortable practical case is a styling system where offsets are expressed
as pre-composed strings that a build step scans for statically. Such systems
cannot see a value computed at runtime, so the shared constants must remain
literal, complete strings rather than fragments assembled from a number. That is
a real constraint and the module absorbs it: the constants stay literal, the
comment explains why they may not be interpolated, and the alternative — every
call site writing its own literal because "the shared one cannot be computed
anyway" — is exactly the divergence the module exists to prevent.

## What the budget must cover

- **The pinned panel's top.** Where a side panel begins, measured from the
  viewport top, below all fixed chrome.
- **The pinned panel's height.** A panel pinned at the top with no height bound
  runs past the bottom of the viewport, and its last entries become unreachable
  — the contents panel of a long document is exactly the case that overflows.
  The bound is the viewport minus the chrome above it minus a bottom margin, and
  the panel scrolls internally past that.
- **The anchored heading's clearance.** When the browser scrolls a heading into
  view for an anchor link, it aligns the heading to the *viewport* top, which is
  underneath the fixed header. The correction is a per-heading scroll margin
  equal to the chrome height plus a comfortable gap, applied by the renderer, so
  that every anchor jump — from the panel, from a shared link, from the browser's
  own restoration — lands the heading visible with prose beneath it. Doing this
  by intercepting clicks and scrolling manually fixes one entry point and leaves
  the others broken.
- **The reading band's top edge.** The band that defines the current section
  starts below the chrome, for the same reason: a heading hidden behind the
  header is not "where the reader is". This one has a constraint the others do
  not: **it must equal the anchored heading's clearance.** When the two agree, a
  heading the reader jumps to lands exactly at the band's top edge and becomes
  the current section by geometry — the panel highlights the destination without
  anyone writing code to make it. When they disagree by even a little, the jump
  lands just outside the band and the highlight stays on the previous section
  until the reader scrolls, which then gets "fixed" with a special case that
  papers over a two-number inconsistency.
- **The paint order within a band.** Elements that share a horizontal band
  overlap, so the budget owes them a stated stacking order as well as offsets —
  otherwise the pair looks correct until a translucent bar is composited over
  the two-pixel indicator it was supposed to sit beneath.
- **Lanes, where two elements share one band.** When a trigger and a bar occupy
  the same strip, the vertical budget is not enough: the bar's content needs a
  reserved horizontal lane for the trigger, or the two render on top of each
  other at the narrow widths where both matter most. The lane is an offset like
  any other and lives with them.

## The scrolling-ancestor constraint

Pinning is relative to the nearest scrolling ancestor, not to the window. So a
scroll container introduced anywhere between a pinned element and the viewport
silently disables the pinning — not with an error, not with a warning: the
element simply scrolls away with the content, and everything else about the page
looks correct. The change that causes it is usually unrelated and reasonable —
making a layout region scroll independently so a sibling can be held still —
and the symptom appears on a different screen, days later.

Three defenses, in order of strength:

1. **Keep the document's scroll on the document.** A reading surface has one
   scroll axis and it belongs to the page; independent scroll regions on a
   reading route are a strong smell before they are a bug.
2. **Say it where the container is.** The layout element that introduces or
   removes a scroll container carries a comment naming the pinned descendants
   that depend on it. It is the only place a future editor will be standing when
   they break it.
3. **Watch for it in review of layout changes specifically.** No automated check
   catches this cheaply, which is a fact about the constraint, not an excuse:
   name the constraint in the module, and treat "why did the panel stop
   pinning" as a known first suspect rather than a fresh investigation.

## The panel is not always present

The budget also decides *whether* a pinned panel exists at a given width. Below
some width the panel is competing with the prose for the reader's only column,
and the answer is not a narrower panel — it is a different affordance: a
collapsible summary above the article, or nothing at all. State the breakpoint in
the same module as the offsets, because the breakpoint and the offsets are the
same layout decision seen from two angles, and splitting them is how a panel
ends up pinned at a width where it no longer renders.

## When not to reach for this

A page with no fixed chrome has no budget to own: anchors land correctly by
default, and adding scroll margins to compensate for a header that does not
exist pushes every anchor jump to the wrong place. Introduce the module when the
*second* element needs the measurement — the first one is allowed to be local,
and pre-emptively centralizing a single number produces indirection nobody can
justify. What must not happen is a third.
