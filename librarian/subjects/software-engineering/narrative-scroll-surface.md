---
domain: software-engineering
subject: narrative-scroll-surface
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
---

# narrative-scroll-surface

First touch recorded here: [[2026-09-24-how-modern-browsers-work]] (intake, a
second-hand browser-internals explainer plus an operator dispatch on
model-authored explainer animations). 5 -> 6 techniques, 3 -> 4 applications.

Second touch: `/deepen` run dp-nss-0926 (2026-09-26), a Curator dispatch on
"single stack (react)". 4 -> 5 applications, 2 stacks. 0 new techniques,
2 techniques conditioned, 1 golden-path rule flipped.

## State

Depth rung **L3**. Both of this run's technique conditions rest on an A/B in
a real tree, not on the literature.

- **Second stack: `next`.** The whole fleet is React. The server-rendered half
  is where `reveal-without-loss` actually happens, and that technique had no
  application. New `next--reveal-without-loss` (ascent `/about`, applied
  `code`, `better`, ab-paired).
- **reveal-without-loss.** (1) A third mechanism, the *toggling* reveal. The
  property that picks the capture remedy is whether the resolved state
  survives leaving the viewport, not continuous versus discrete. (2) Print
  matches no motion preference and needs its own route. (3) A served-frame fix
  proven on the wrapper is not a check of the page.
- **scroll-bound-progression.** (1) Smoothing is owed where progress is
  sampled in script. Which clock a station runs on is read off the page's
  animation list, because a station the library documents as native-eligible
  ran 0 scroll timelines. (2) A library's reduced switch keeps opacity
  animating, so it is not the collapse. The collapse is a presence rule and is
  authored.
- **Golden path, accessibility posture (flipped).** The stop-control
  exemption covers position-bound motion only. Motion triggered by scrolling
  into view is self-starting (WCAG 2.2 Understanding 2.2.2), and a loop so
  started owes a visible pause.
- `react--scroll-bound-progression` (kp) gained a dated section with the
  clock reading. Its `verified_on` was deliberately left at 2026-09-08,
  because its other line references were not re-resolved.

## Counter-evidence, claim by claim

| Claim | Verdict | Where it landed |
| --- | --- | --- |
| Reveal never mounts; served HTML carries the argument | confirmed | unchanged |
| Dots are a progress readout, not navigation | confirmed (carousel evidence only; no side-dot study found) | unchanged |
| Scroll-bound beats timed | conditioned (holds while scroll physics are untouched; no comparative study exists, it is a design argument) | not landed; the page already says so in effect |
| Reader-driven motion is exempt from pause | conditioned | golden path, flipped |
| Reduced motion collapses every gesture | conditioned (stricter than platform guidance, on purpose) | scroll-bound-progression |
| Spring smoothing is required | the lane said refuted; the tree said conditioned | scroll-bound-progression |

The training-data lane converged independently on the print override and on
"print shows blank wherever the reader never scrolled". That plus the ascent
A/B is the two-lane convergence the print condition rests on.

## Impact

Registry-map regeneration at `d247154a`: **1 stale verdict**, personas
(1 context, the `not-applicable` one), which goes to its `/conform --stale`
queue. Unjudged pairs: goat 8, kp 7, personas 6, personas-web 10, pof 2,
systedo-case 1, ascent 1, athena-everywhere 1. Maps are committed in all 12
joined repos on their active branches and pushed in none.

## Owed to projects (not done here)

- **kp**: the landing trust-art loops start in view, repeat forever, and have
  no visible pause. The flipped rule says they owe one. For `/conform`.
- **kp**: the about stations' opacity ramp is the one unsmoothed track on a
  script clock.
- **ascent**: commit `8d1e5113` (the print rule and the served heatmap) sits on
  a local master that is 100 commits ahead of origin. It was not pushed,
  because pushing would publish the owner's 99 other commits.

## Boundary stated earlier (2026-09-24)

- `illustration-carries-the-claim` asks whether a *picture* changes if the claim
  is false. `motion-carries-the-mechanism` asks the same of *time*. They are
  twins and do not overlap.
- `scroll-bound-progression` owns *when* motion plays. The new technique owns
  *what its timing asserts*. A mechanism explainer can be scroll-bound, and then
  the scroll offset is its `t`.
- `motion` (the vocabulary subject) declines choreography. Its
  `content-bearing-degradation` now points here for gestures where no single
  frame explains.

## Evidence the 2026-09-24 technique rests on

Five art-style skins over one seven-beat storyboard, four of them authored by
separate model workers from one contract: 0 missing roles, 0 page errors. Three
of four workers reported the same contract defect (a size and a box stated, no
characters-per-width budget). The technique carries that as a condition, not a
number.

## Open leads

- A page-load resource-discovery subject (escalated XL, see the source note).
  This subject's explainer example teaches it, and nothing in the corpus owns it.
- **Why the library's native scroll path did not engage** on a documented
  eligible offset. Return when a project needs a station on the compositor, or
  when a production build can be probed with the same animation-list
  instrument.
- **A stylesheet scroll-driven (`view()`) application.** Not Baseline as of
  2026-09 (Firefox stable ships it behind a flag), so a surface built on it
  needs an `@supports` guard whose fallback is the resolved state. Return when
  a fleet page adopts it.
- **Scrollytelling comprehension evidence.** Two papers (ECCE 2023, Computers
  & Graphics 2023) sat behind 403s. Return if a claim here ever leans on
  engagement or comprehension numbers.
