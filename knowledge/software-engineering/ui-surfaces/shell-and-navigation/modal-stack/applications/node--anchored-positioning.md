---
layer: application
type: application
subject: modal-stack
technique: anchored-positioning
stack: node
verified_on: 2026-08-23
---

# Anchored positioning in Floating UI's framework-agnostic core (Node)

How `@floating-ui/core` and `@floating-ui/dom` — the engine under Radix,
Headless UI and much of the React popover ecosystem — realize the
anchored-positioning technique. Citations are against `@floating-ui/core` 1.8.0
and `@floating-ui/dom` 1.8.0, `floating-ui/floating-ui` commit `0eb8c98`
(2026-08-09). This reconciles an external tree, not the consumer repo the
sibling applications cite, so the pin lives in prose, not `verified_against`.

## 1. Position as a pipeline over a re-derivable base

`computePosition` never stores a coordinate. It measures anchor and overlay
(`computePosition.ts:37`), derives a base `{x, y}` from rects and placement
alone (`:38`), then folds an ordered middleware array over that base, each
middleware receiving the *current* `x`/`y` (`:44-76`). A base reconstructible
from measurement at any instant is what lets re-running the whole fold be the
library's only recomputation strategy.

Collision goes through one primitive, `detectOverflow`
(`detectOverflow.ts:49-126`): per-side pixel overflow against a declared
boundary defaulting to `clippingAncestors`, not the viewport (`:56`), scale-
corrected for CSS zoom and transformed offset parents (`:100-106`) — the
ancestors that usually falsify placement math are inside the default.

## 2. The reset contract is two contracts, and one is not idempotent

A middleware returning `reset` sets `i = -1` and replays **the entire array
from index 0** (`computePosition.ts:78-97`). Two shapes exist:

- `reset: {placement}` / `{rects}` — base coordinates are re-derived before the
  replay (`:93`), so mutators re-apply to a fresh base and land once. `flip`
  (`flip.ts:161-169`) and `size` (`size.ts:120-126`) use this.
- bare `reset: true` — line 81 gates re-derivation on `typeof reset ===
  'object'`, so the replay runs **on top of already-mutated coordinates**.
  `arrow` uses this (`arrow.ts:113`).

Running it settles it: with `[offsetLike, resetter]` against a stub platform,
`reset: {placement: 'top'}` yielded one net `+10` (`x = 20`) and bare
`reset: true` yielded two (`x = 30`) — the mutator ran twice either way, but
only the object form re-derived the base underneath it.

**The deviation:** that obligation is discharged by two hand-placed guards
naming the sole bare-reset emitter by field — `offset` returns `{}` when
placement is unchanged and `middlewareData.arrow.alignmentOffset` is set
(`offset.ts:94-99`), and `flip` bails on the same signal (`flip.ts:90-92`). So
idempotency under reset is not a pipeline property but two special cases, and a
third-party mutator placed alongside `arrow` inherits the double-application
with nothing to warn it.

The reset budget is silent too. `MAX_RESET_COUNT = 50` (`computePosition.ts:11`)
stops the replay, and the loop falls out returning whatever coordinates it holds
— no throw, no flag in `middlewareData`. A middleware that always resets fires
exactly 51 times (one pass plus 50 resets) and returns a normal result: a cyclic
pair ships a *wrong* position, not an error.

## 3. The middleware set: declared fallbacks, in an order the engine never validates

- **Flip** walks `[initialPlacement, ...fallbacks]` (`flip.ts:118`), resetting
  to the next candidate whenever the current overflows (`:140-169`). When
  nothing fits, `fallbackStrategy` chooses `'bestFit'` — least total overflow
  across candidates (`:182-210`) — or `'initialPlacement'` (`:211-213`): a
  resolved decision, not a fall-through.
- **Shift** clamps into the boundary (`clampCoord`, `shift.ts:70-75`, applied
  `:77-83`); `limitShift` (`shift.ts:142-218`) is "still touching the anchor"
  made explicit — main-axis limits derive from `rects.reference` (`:176-183`),
  so shifting stops at the anchor's edges rather than detaching to stay onscreen.
- **Size** is resize-of-last-resort: it hands the consumer `availableWidth` /
  `availableHeight`, then **re-measures after the consumer's `apply`** and resets
  if dimensions changed (`size.ts:118-126`) — "measure the real size, never an
  assumed constant" enforced rather than trusted.
- **Arrow** derives its offset from `centerToReference` — the anchor's centre,
  not the overlay's (`arrow.ts:72`) — clamps it inside the overlay's bounds
  (`:86`), and reports the residual as `centerOffset` (`:110`), so an arrow
  pointing at nothing is detectable. When the anchor is too small for clamping
  to preserve the sightline it goes further, shifting **the floating element
  itself** by `alignmentOffset` (`:92-107`) and resetting so `shift` can act
  (`:113`): where the technique says the arrow aligns to the anchor, the
  stronger rule is that when it cannot, the overlay moves rather than the arrow
  lying.

## 4. `autoUpdate` is the schedule — and it deliberately never dismisses

`autoUpdate` (`packages/dom/src/autoUpdate.ts:165-264`) enumerates exactly the
movers the technique names, each an opt-out flag:

- **Ancestor scroll / resize** — listeners on the overflow ancestors of *both*
  reference and floating (`:181-192`); that list includes the window and
  `visualViewport` and traverses iframes (`packages/utils/src/dom.ts:203-217`).
- **Either element resizing** — one `ResizeObserver` over both, with a
  deliberate unobserve / next-frame re-observe of the floating element to break
  the feedback loop `size()` would otherwise create (`:203-219`).
- **Anchor relocated by layout shift** — an `IntersectionObserver` whose
  `rootMargin` is fitted to the anchor's rect and rebuilt on every move
  (`observeMove`, `:46-155`); a fully clipped anchor reports ratio 0 and is
  polled at 1 s rather than spun (`:111-117`).
- **Transform animation** — `animationFrame`, **off by default** (`:177`): the
  deliberate non-tracking. A compositor transform moves the anchor without
  firing scroll, resize, or intersection, so the per-frame rect comparison
  (`frameLoop`, `:237-246`) is opt-in, not charged to everyone.

What it does not do is choose. The technique's fork — track or dismiss on
ancestor scroll — is resolved as *always track*; nothing in `packages/dom/src`
closes anything, and a grep of that tree for `dismiss` or for `.style.` writes
returns nothing (it measures, it never mutates). "Anchor scrolled out of view"
is served only as data, by the opt-in `hide` middleware reporting
`referenceHidden` / `escaped` (`hide.ts:45-71`) — correct scoping for an engine,
and where the unpicked third state becomes reachable: mount `autoUpdate`, omit
`hide`, and the overlay faithfully tracks an off-screen anchor.

## Reconciliation summary

Confirmed: position as a re-derivable computation over measured rects, never
stored; collision against real clipping ancestors by default; flip → shift →
size as declared, ordered fallbacks with a resolved "nothing fits" branch;
measured rather than assumed overlay size, re-verified after mutation; arrow
aligned to the anchor with the residual reported; a complete named schedule for
every mover. Deviation: reset idempotency is two `arrow`-specific guards rather
than a pipeline property, and the 50-reset ceiling returns a wrong position
silently. Not present by scope: atomic commit of position and visibility,
layer-root rendering, submenu chains, pointer-intent regions — all in the
framework bindings, because core and dom compute coordinates and write no DOM.
