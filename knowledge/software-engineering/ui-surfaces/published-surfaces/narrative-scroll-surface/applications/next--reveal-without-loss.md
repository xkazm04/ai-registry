---
layer: application
type: application
subject: narrative-scroll-surface
technique: reveal-without-loss
stack: next
status: forged
verified_on: 2026-09-26
verified_against: next@16.3.3
applied: code
ab_verdict: better
proof: ab-paired
---

# Reveal without loss — a maturity-scanning product's `/about` page, server-rendered

How `ascent` (at `8d1e5113`, Next 16.3.3, React 19.2.4, framer-motion 12.40)
implements [reveal-without-loss](../techniques/reveal-without-loss.md) on its
public `/about` page. The page is one scroll of product sections, and most
blocks sit inside a shared reveal wrapper. This stack gets its own
application because of a server-rendering fact. A client component in the App
Router is still rendered on the server, and whatever state a motion component
starts in is written into the served HTML.

## The served frame: one wrapper already right

The tree had met this defect once and fixed it at the shared wrapper.
`src/components/deck/Reveal.tsx:6-11` records the failure: `initial={{ opacity: 0 }}`
was baked into the server HTML as an inline style, and "any render without
working JS … left EVERY Reveal-wrapped block permanently at `opacity:0`".

The repair is the technique's resting-state rule, done in CSS:

- The hidden entry state exists only in a class, and the component adds that
  class after mount (`Reveal.tsx:48`, `:75`). So the served markup has neither
  the class nor an inline opacity.
- The class hides only under the no-preference media query
  (`src/app/globals.css:684`). A reduced-motion reader is never hidden, not
  even after the class is armed.
- The wrapper's test pins the served frame: `renderToStaticMarkup`, then no
  `opacity: 0` in the output (`Reveal.test.tsx:16-27`).

Measured before this run's change, it holds. With scripts disabled, the page
had 0 hidden wrapper blocks, and under reduced motion also 0 of 15.

## The island the wrapper fix did not reach

The page still served **41 inline `opacity:0` styles**. One is a decorative
scan line that is `aria-hidden`, which is correct. The other 40 are every cell
of the page's fleet heatmap (`src/components/about/FleetGrid.tsx`). The
heatmap is the page's X-ray illustration, so it is evidence, not decoration
([illustration-carries-the-claim](../techniques/illustration-carries-the-claim.md)).
The cells used `initial={{ opacity: 0, scale: 0.4 }}` with an in-view latch.
Measured on the dev server at 1280x800:

| Reader | Cells hidden, before | After |
| --- | --- | --- |
| Scripts disabled | 40 of 40 | 0 of 40 |
| Reduced motion, page top | 40 of 40 | 0 of 40 |
| Print, JS on, never scrolled | 40 of 40 | 0 of 40 |
| Served HTML, inline `opacity:0` on the page | 41 | 1 (the scan line) |

The repair reuses the wrapper's contract inside the island:

- `initial={false}`, so the server renders the animate target.
- A mounted flag from the tree's shared motion hooks (`FleetGrid.tsx:40`), and
  a `resolved` predicate that is true before mount, in view, or under reduced
  motion (`:41`). The served frame and the reduced frame are both the resolved
  heatmap.
- The hidden entry state is applied with a zero-duration transition, so it is
  applied only once the page can see where the reader is.

A test in the same file pins it: 40 cells rendered to static markup, and none
at opacity 0 (`FleetGrid.dom.test.tsx:125-133`). As a positive control, its
matcher flags 40 of 40 cells on the served HTML from before the fix.

**The lesson for this stack.** A wrapper-level fix proves the wrapper is right.
It does not prove the page is. The check that finds the next island is taken
on the served document: fetch the route and count inline `opacity:0` outside
`aria-hidden` subtrees. A component test cannot find it, because it tests the
component that was already fixed
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Print matches no motion preference

Before the change, a reader with scripts on who printed `/about` from the top
got 15 of 15 wrapper blocks and 40 of 40 cells at opacity 0. That rendering
was blank below the hero. Print is a medium, not a preference, so the rule
that protects reduced-motion readers never fires for it.

After the change, a print-medium rule resolves `.js-reveal` and
`[data-reveal]` with `!important` (`globals.css:704-711`). The `!important` is
there to beat the inline values the motion library writes. With the rule, 0 of
15 blocks and 0 of 40 cells are hidden. Floor: on screen at the page top, 15 of
15 blocks and 40 of 40 cells still start hidden and reveal on scroll, the same
as before.

## A toggling reveal is not a latch

The wrapper tracks intersection both ways: `setRevealed(e.isIntersecting)`
(`Reveal.tsx:65`). It has a trigger and a transition, so in code it looks like
a latch. The walk-and-return remedy still buys nothing:

| After a full walk, page returned to the top | Hidden |
| --- | --- |
| Heatmap cells (latching, `once: true`) | 0 of 40 |
| Wrapper blocks (toggling) | 15 of 15 |
| Wrapper blocks, measured at the page bottom | 14 of 15 |

One page carries both mechanisms. The same harness step resolves one and
leaves the other exactly where it started.

## What the library's reduced mode does not do

`src/components/about/AboutLanding.tsx:70` wraps the page in the motion
library's `reducedMotion="user"` mode. The library documents that this mode
disables transform and layout animations "while preserving the animation of
other values like opacity". So the heatmap's opacity entry state survived it,
and the cells stayed hidden until the reduced-motion reader scrolled to them
(40 of 40 at the page top, before the change). The switch was vestibular
safety, and correct as that. It never made the content present.

## The entrance is self-starting, and short enough to owe no pause

The wrapper's fade-up fires when a block scrolls into view. Accessibility
guidance classes that as starting automatically, not as reader-driven. It
takes 0.55 s plus a per-section delay (`globals.css:688-691`), well inside
five seconds, so it owes no pause control. The heatmap's scan line is also
started on arrival and takes 1.4 s, so it owes none either. Neither is exempt
because the reader "caused" it. A loop started the same way would owe a
visible pause.

## What this realization cannot do or prove

- **Dev server only.** Every arm ran against `next dev`. The served-frame
  mechanism is server rendering, which production shares, but no production
  build was measured.
- **Print was measured as computed style under emulated print media**, not as
  a rendered PDF. The count is of elements whose computed opacity is below
  0.5.
- **One viewport, one load per arm.** These are counts of a deterministic
  render, not rates.
- **The toggling wrapper is unchanged.** Whether a front-door block should
  hide again when the reader scrolls past it is a design choice this run did
  not make. The finding is about the instrument: walk-and-return is not a
  capture remedy for it.
- **The heatmap still arms and hides after mount on screen.** If it ever sits
  above the fold, the served-visible cells will flick out and stagger back in.
  On this page it is below the fold.

## Sources (resolved 2026-09-26)

- Motion, *motion component*:
  <https://motion.dev/docs/react-motion-component>. "motion components are
  fully compatible with server-side rendering, meaning the initial state of
  the component will be reflected in the server-generated output."
- Motion, *Accessibility*: <https://motion.dev/docs/react-accessibility>. "By
  setting reducedMotion it to "user", all motion components will
  automatically disable transform and layout animations, while preserving the
  animation of other values like opacity and backgroundColor."
- MDN, *prefers-reduced-motion*:
  <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>.
  "the animation on the box will tone down to the dissolve animation, which is
  a more muted animation that is not a vestibular motion trigger."
- W3C, *Understanding SC 2.2.2 Pause, Stop, Hide* (WCAG 2.2):
  <https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html>. "Moving,
  blinking, scrolling, auto-updating content is considered to start
  automatically either when it starts without direct user activation or
  interaction (such as activating a button), or when it starts as a result of
  an indirect interaction (such as focusing/hovering over an element, or
  scrolling an element into view)."
