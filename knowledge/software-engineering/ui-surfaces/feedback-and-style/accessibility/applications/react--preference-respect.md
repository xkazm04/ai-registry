---
layer: application
type: application
subject: accessibility
technique: preference-respect
stack: react
status: forged
verified_on: 2026-08-29
verified_against: react@19
---

# The composite reduced-motion signal: an attribute on the root, observed

*Verified against the project tree at `c2a3c5fa1`.*

The technique states the composite signal abstractly: a product may layer its
**own** setting over the platform's, feeding the same single signal, "so no
consumer knows or cares which source won." This tree implements that sentence
as a concrete two-part mechanism — the in-app toggle is *projected onto the
document root as an attribute*, and the single reader ORs a `MutationObserver`
on that attribute with the platform media query. It is worth citing because
the projection is what makes the second source observable at all, and because
the tree also measures what happens to every consumer that skipped the reader.

## The projection

`src/stores/themeStore.ts:197-204` is the whole write side:

```ts
function applyReduceMotion(reduceMotion: boolean) {
  const el = document.documentElement;
  if (reduceMotion) {
    el.setAttribute('data-motion', 'reduce');
  } else {
    el.removeAttribute('data-motion');
  }
}
```

It runs from the setter (`:347-351`, which also mirrors the value into store
state and emits an appearance event) and again on rehydrate (`:382`), beside
identical projections for contrast, dim and density. The preference therefore
exists in two representations that cannot disagree: a store field for React,
and a root attribute for everything that is not React.

That second representation is not decoration. It is what lets the **style
layer** honor the in-app preference with no JavaScript at all —
`src/styles/globals.css:5189-5196` keys the universal duration collapse off
`html[data-motion="reduce"]`, and the block above it (`:5181-5188`) states why
the collapse is to `0.01ms` rather than `none`: it "preserves the FINAL state
of state-driven CSS (so toggled classNames still apply the intended styles)
while eliminating the motion path". That is the technique's replace-never-
remove rule, implemented at the token level.

## The composite reader

`src/hooks/utility/interaction/useMotion.ts` is the single boundary. The
platform half is a module-level media query list (`:5-7`). The in-app half is
read off the root (`appReduceMotion`, `:22-27`). The OR is one line:

```ts
function getSnapshot() { return appReduceMotion() || (MQ?.matches ?? false); }
```

(`:49`). Liveness is what makes the pair work, and the two sources need
different instruments: the media query has an event, the attribute does not.
`subscribe` (`:29-47`) registers both — `MQ.addEventListener('change', cb)` at
`:30`, and a `MutationObserver` on `document.documentElement` scoped by
`attributeFilter: [MOTION_ATTR]` (`:37-40`) — and tears both down together
(`:43-46`). The scoping is deliberate and annotated at `:32-33`: "Attribute-
filtered and scoped to the one element that carries it, so this observes
exactly the toggle and nothing else in the tree." A `MutationObserver` is a
firehose by default; an unfiltered one on the root would fire on every
attribute write the app makes.

The two are then handed to `useSyncExternalStore` (`useReducedMotion`,
`:56-58`), so React resubscribes and re-renders on either signal through one
subscription, and every consumer sees a boolean with no source attached.

The file's own header (`:9-19`) is the failure report that produced the
mechanism, and it names the exact shape the technique warns about:

> There are two: the OS media query above, and the in-app Appearance toggle,
> which `themeStore` projects onto the document as `<html data-motion="reduce">`.
> `globals.css` honours both — but CSS can only reach CSS. Every framer-motion
> entrance, stagger and spring gated on this hook kept running at full speed
> for a user who had turned Reduce Motion on in the app's own settings, so the
> setting silently covered the CSS half of the app's animation and not the
> JavaScript half.

That is the tenth-screen failure with a new axis: not nine screens honoring
and one missing, but *one whole rendering technology* honoring and the other
not, for the same declared preference.

## Derivation, not re-detection — and the lint that says so

Two hooks derive from the single signal rather than re-reading it: `useMotion`
(`:101-107`) returns a config object, `useMotionVariants` (`:209-215`) is the
pure transform applied to animation variants. The module is imported by 50
files, so the derived signal — not the platform query — is the ordinary way to
ask the question here.

The tree also carries a mechanical guard, which is the part most products lack:
`eslint-rules/enforce-reduced-motion-fallback.cjs` flags a *repeating*
animation in a file that references none of the seven sanctioned fallback
tokens (`FALLBACK_TOKENS`, `:28-36`). Its header (`:1-26`) explains the
targeting: the global wrapper already handles one-shot transform animations,
so the rule aims at the residue — "a looping animation on a non-transform
property (opacity pulses, color cycles, dash marches) — those keep cycling
regardless of `prefers-reduced-motion` and are the real vestibular hazard".
The rule targets the gap the global gate leaves rather than every animation,
which is why it can be enforced rather than suppressed everywhere.

## The engine that samples per tick

`src/lib/utils/rafAnimationEngine.ts` is the same preference read at a
different rung, and it is worth citing beside the composite because it shows
what subscription does not cover. `prefersReducedMotion()` (`:66-76`) is
called **inside the animation loop**, before any physics runs (`tick` at
`:78`, gate at `:92`), and the docblock states the defect that moved it there
(`:53-58`): the preference "used to be sampled at target-set time ONLY, which
is the one moment a user who is bothered by the motion has not yet reacted to
it: enabling the preference mid-flight left the current travel running to
completion, and an entry whose target never moved again never re-read it at
all." The cost is stated rather than hidden (`:60-62`): one read per frame,
"only while something is actually animating".

## The structural fact that makes this evidence

The composite is not two checks written next to each other; it is a *shape*
that makes the second source observable. A preference held only in a store is
invisible to CSS and to any non-React code. Projecting it onto the root turns
it into something three different mechanisms can watch — a stylesheet selector,
a `MutationObserver`, and a plain attribute read from a module with no React in
it — and the OR then lives in exactly one function whose subscribers cannot
tell which source fired. The technique's "one signal, every surface derives"
is usually implemented as a context provider, which only serves the framework.
Here the authority is the document itself, which is the only place all three
consumers can reach.

The measurement that proves it is load-bearing: of the runtime reads of
`matchMedia('(prefers-reduced-motion: reduce)')` in non-test source, exactly
one is the sanctioned reader (`useMotion.ts:6`). The other three exist, and
their behavior splits precisely along whether they knew about the projection.

## What this realization cannot do or prove

- **The composite does not hold outside the sanctioned hook, and the tree
  measures the gap.** `rafAnimationEngine.ts:71` reads the media query alone,
  so the per-tick engine — the one place with the *best* liveness story in the
  repo — is deaf to the in-app toggle. `AnimatedCounter.tsx:195-210` defines a
  private `useReducedMotion` reading only the media query, with a comment
  (`:193-194`) explaining that it avoids a library import and not mentioning
  the half it drops. Only `flashSpotlight.ts:63-69` checks `data-motion` first
  (`:64`) before falling back to the query, and it documents why it is exempt
  from the global handling at all (`:53-62`): the CSS override "cannot touch a
  Web Animations API animation", and an explicit smooth-scroll argument
  overrides the stylesheet. So of three ad-hoc readers, one is correct by
  design and two silently drop the in-app source.
- **The style layer's two halves are hand-maintained twins.**
  `globals.css` carries 16 occurrences of `prefers-reduced-motion` and 17 of
  `data-motion="reduce"` — near-parity today, but nothing derives one from the
  other, so parity is a fact about this commit rather than a property. Worse,
  six inline `<style>` blocks inside components key on the media query only
  (four in one lifecycle-icon module, plus a glyph and a celebration
  component), and no selector reaches them from the root attribute. The
  technique's contrast section gets a mechanical floor via token enforcement;
  reduced motion here has none.
- **The library-level gate is not part of the composite.** The application
  wraps its tree in the animation library's own reduced-motion mode
  (`App.tsx:366`), which resolves the platform query internally. Framework
  animations therefore honor the in-app toggle only where an author routed
  through the wrapped hooks; the global wrapper below them does not see it.
- **This document covers one preference of four.** The technique's contract
  spans reduced motion, contrast, forced colors and text scale. Contrast and
  density are projected onto the root by the same store with the same shape,
  but nothing verified here says whether their consumers derive or re-detect,
  and forced-colors and text-scale coverage were not examined at all.
- **No verification state is entered by anything automatic.** The technique
  asks for a forced state a gate or reviewer can enter. The signal is forceable
  in principle — set one attribute — but no test drives the whole product under
  it, and the lint rule checks for the *presence of a token*, not for correct
  behavior under the preference.
