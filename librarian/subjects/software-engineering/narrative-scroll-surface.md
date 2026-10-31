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

## Architecture review - 2026-10-31

First architecture review, against `5a1c8dbf6`. The 2026-09-26 golden-path flip
(scroll-into-view motion is self-starting) is confirmed by the WCAG 2.2
Understanding text. Two clarify items were found: an arithmetic slip in the kp
scroll application and an unstated transform-origin assumption in the peak
derivation.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/narrative-scroll-surface",
  "date": "2026-10-31",
  "baseline": "5a1c8dbf6",
  "digest": "sha256-b2:e93abcf9f70a6c36",
  "disposition": "clarify",
  "coverage": "All 12 documents read in full (golden path, 6 techniques, 5 applications). Four web primary sources re-read; kp application anchors spot-checked read-only at their pinned commits; other consumer evidence not re-executed.",
  "trigger": "Pending architecture review (no prior record).",
  "benefit": "Explanatory pages stay consumable by readers who never decide how to read them, and by readers who never scroll.",
  "failure_if_ignored": "Band stacks, decorative art on claims, clock-timed motion, dot indexes, and reveals that blank the served, printed or reduced-motion page while every check passes at scroll zero.",
  "boundary": "Published explanatory pages for a reader without a task; documents go to long-form-reading-surface, deferred sections to lazy-section-addressability, motion vocabulary to motion.",
  "counterexamples": [
    "A set of parallel features drawn on a spine reads an invented order as rank.",
    "A loop started by scrolling into view is self-starting under WCAG 2.2.2 and owes a pause even though the reader caused it.",
    "A toggling reveal looks like a latch in code but is re-hidden by the time a walk-and-return harness captures.",
    "An element scaled from its far edge puts all its growth into the gutter, so the half-width divisor overstates the safe peak.",
    "A last frame with no time axis shows only that a process finished."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html",
      "result": "Read 2026-10-31. Normative text: moving content that \"starts automatically\", \"lasts more than five seconds\" and \"is presented in parallel with other content\" needs \"a mechanism for the user to pause, stop, or hide it\"; automatic start includes \"an indirect interaction\" \"(such as focusing/hovering over an element, or scrolling an element into view)\". Supports the golden path's flipped exemption, the five-second entrance threshold and the loop-owes-a-stop rule."
    },
    {
      "url": "https://motion.dev/docs/react-accessibility",
      "result": "Read 2026-10-31. reducedMotion=\"user\" will \"automatically disable transform and layout animations\" while \"preserving the animation of other values like opacity and backgroundColor\". Supports scroll-bound-progression's \"a library switch is not the collapse\" and the next application's finding."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
      "result": "Read 2026-10-31. \"the animation on the box will tone down to the dissolve animation, which is a more muted animation that is not a vestibular motion trigger.\" Supports the claim that platform guidance treats a dissolve as muted, so the presence collapse is stricter on purpose."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline",
      "result": "Read 2026-10-31. Banner: \"Limited availability. This feature is not Baseline because it does not work in some of the most widely-used browsers.\" Confirms the note's open lead that a stylesheet view() surface needs an @supports guard; the Firefox flag detail was not re-read."
    },
    {
      "source": "kp at the application's pinned commits (read-only)",
      "result": "StepRow at 3394deb2 matches the quoted envelope, artScale comment and dot window [0.34, 0.5]; at bbaa5d1b1 line 83 is the useScroll offset, line 98 the opacity ramp, and framer-motion is ^13.4.0. SectionRail at 3394deb2: the quoted \"five inactive entries\" and \"six back-presses\" comments are verbatim; the source itself disagrees with its own \"SAME five destinations\", so the application quotes faithfully."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated A/B counts (ascent, personas-web) and remaining kp line anchors were not re-executed or exhaustively re-resolved. No verified_on moved."
    }
  ],
  "documents": {
    "narrative-scroll-surface.md": {
      "disposition": "keep",
      "reason": "Six seams and the accessibility posture are internally consistent with the techniques; the flipped stop-control exemption matches WCAG 2.2.2 as quoted (scroll-into-view is indirect interaction; five-second threshold)."
    },
    "techniques/sequence-as-spine.md": {
      "disposition": "keep",
      "reason": "Set-vs-sequence test, derived numbering with a two-condition exception, identity separate from number, and a computed spine path are coherent; no unstable external claim."
    },
    "techniques/illustration-carries-the-claim.md": {
      "disposition": "keep",
      "reason": "Litmus, swap and caption tests, subtractive fidelity and the absolute-size block lift are design arguments that state their decay cost and recomputation path; no source-dependent claim."
    },
    "techniques/scroll-bound-progression.md": {
      "disposition": "clarify",
      "reason": "The derived peak bound (gutter divided by half the element width) silently assumes centre-origin scaling; with origin at the far edge all growth goes toward the gutter. State the assumption. Library reduced-mode and dissolve claims confirmed against Motion and MDN."
    },
    "techniques/no-orientation-tax.md": {
      "disposition": "keep",
      "reason": "Readout-first index, legibility at rest, reserved band, replace-not-push history (four jumps = five back-presses checks out), focus on landing; consistent with the reading-surface offset-budget seam."
    },
    "techniques/reveal-without-loss.md": {
      "disposition": "keep",
      "reason": "Appearance-not-presence, five never-scrolling readers, per-mechanism capture remedy (latch / scroll-bound / toggling) and the print route are internally consistent and match the next application's measured counts."
    },
    "techniques/motion-carries-the-mechanism.md": {
      "disposition": "keep",
      "reason": "Timing-as-claim litmus, spatial time axis, beat list as single source and ordered degraded forms are coherent; the loop-owes-a-stop rule matches WCAG 2.2.2."
    },
    "applications/react--scroll-bound-progression.md": {
      "disposition": "clarify",
      "reason": "Arithmetic: the dot window [0.34, 0.5] is 0.16 of a 0.5 approach, i.e. the last third of the approach (a sixth of total travel), not \"the last sixth of the approach\". Confirmed against the pinned source."
    },
    "applications/next--reveal-without-loss.md": {
      "disposition": "reverify",
      "reason": "Quoted Motion, MDN and WCAG sources re-read and accurate; the dev-server A/B counts and the ascent anchors were not re-executed, and the app notes no production build was measured."
    },
    "applications/react--no-orientation-tax.md": {
      "disposition": "keep",
      "reason": "Spot-checked quotes at 3394deb2 are verbatim; the 1171/55/135 px clearance arithmetic for a centred 771 px line against a 200 px band checks out. The five-vs-six entry tension is in the quoted source, not the application."
    },
    "applications/react--sequence-as-spine.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (eight stations, four consumers, two-condition exception met); its line anchors and the locale test were not re-resolved this run."
    },
    "applications/react--motion-carries-the-mechanism.md": {
      "disposition": "reverify",
      "reason": "Clear before/after/floor arms and stated limits; personas-web tree and its dev-mode measurements were not reopened."
    }
  }
}
```

### Applied - 2026-10-31

Both clarify items applied minimally in the documents' own voice. Re-recorded
against the new digest; the three `reverify` applications keep that
disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/narrative-scroll-surface",
  "date": "2026-10-31",
  "baseline": "5a1c8dbf6",
  "digest": "sha256-b2:a7d84bd1991c2242",
  "disposition": "keep",
  "coverage": "All 12 documents read in full (golden path, 6 techniques, 5 applications). Four web primary sources re-read; kp application anchors spot-checked read-only at their pinned commits; other consumer evidence not re-executed.",
  "trigger": "Pending architecture review (no prior record).",
  "benefit": "Explanatory pages stay consumable by readers who never decide how to read them, and by readers who never scroll.",
  "failure_if_ignored": "Band stacks, decorative art on claims, clock-timed motion, dot indexes, and reveals that blank the served, printed or reduced-motion page while every check passes at scroll zero.",
  "boundary": "Published explanatory pages for a reader without a task; documents go to long-form-reading-surface, deferred sections to lazy-section-addressability, motion vocabulary to motion.",
  "counterexamples": [
    "A set of parallel features drawn on a spine reads an invented order as rank.",
    "A loop started by scrolling into view is self-starting under WCAG 2.2.2 and owes a pause even though the reader caused it.",
    "A toggling reveal looks like a latch in code but is re-hidden by the time a walk-and-return harness captures.",
    "An element scaled from its far edge puts all its growth into the gutter, so the half-width divisor overstates the safe peak.",
    "A last frame with no time axis shows only that a process finished."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html",
      "result": "Read 2026-10-31. Normative text: moving content that \"starts automatically\", \"lasts more than five seconds\" and \"is presented in parallel with other content\" needs \"a mechanism for the user to pause, stop, or hide it\"; automatic start includes \"an indirect interaction\" \"(such as focusing/hovering over an element, or scrolling an element into view)\". Supports the golden path's flipped exemption, the five-second entrance threshold and the loop-owes-a-stop rule."
    },
    {
      "url": "https://motion.dev/docs/react-accessibility",
      "result": "Read 2026-10-31. reducedMotion=\"user\" will \"automatically disable transform and layout animations\" while \"preserving the animation of other values like opacity and backgroundColor\". Supports scroll-bound-progression's \"a library switch is not the collapse\" and the next application's finding."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
      "result": "Read 2026-10-31. \"the animation on the box will tone down to the dissolve animation, which is a more muted animation that is not a vestibular motion trigger.\" Supports the claim that platform guidance treats a dissolve as muted, so the presence collapse is stricter on purpose."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline",
      "result": "Read 2026-10-31. Banner: \"Limited availability. This feature is not Baseline because it does not work in some of the most widely-used browsers.\" Confirms the note's open lead that a stylesheet view() surface needs an @supports guard; the Firefox flag detail was not re-read."
    },
    {
      "source": "kp at the application's pinned commits (read-only)",
      "result": "StepRow at 3394deb2 matches the quoted envelope, artScale comment and dot window [0.34, 0.5]; at bbaa5d1b1 line 83 is the useScroll offset, line 98 the opacity ramp, and framer-motion is ^13.4.0. SectionRail at 3394deb2: the quoted \"five inactive entries\" and \"six back-presses\" comments are verbatim; the source itself disagrees with its own \"SAME five destinations\", so the application quotes faithfully."
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated A/B counts (ascent, personas-web) and remaining kp line anchors were not re-executed or exhaustively re-resolved. No verified_on moved."
    }
  ],
  "documents": {
    "narrative-scroll-surface.md": {
      "disposition": "keep",
      "reason": "Six seams and the accessibility posture are internally consistent with the techniques; the flipped stop-control exemption matches WCAG 2.2.2 as quoted (scroll-into-view is indirect interaction; five-second threshold)."
    },
    "techniques/sequence-as-spine.md": {
      "disposition": "keep",
      "reason": "Set-vs-sequence test, derived numbering with a two-condition exception, identity separate from number, and a computed spine path are coherent; no unstable external claim."
    },
    "techniques/illustration-carries-the-claim.md": {
      "disposition": "keep",
      "reason": "Litmus, swap and caption tests, subtractive fidelity and the absolute-size block lift are design arguments that state their decay cost and recomputation path; no source-dependent claim."
    },
    "techniques/scroll-bound-progression.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the derived peak-overshoot rule now states that gutter divided by half-width assumes centre-origin scaling, and that edge-origin scaling toward the gutter divides by the whole width. Clock and library-reduced-mode claims match Mozilla and Motion sources."
    },
    "techniques/no-orientation-tax.md": {
      "disposition": "keep",
      "reason": "Readout-first index, legibility at rest, reserved band, replace-not-push history (four jumps = five back-presses checks out), focus on landing; consistent with the reading-surface offset-budget seam."
    },
    "techniques/reveal-without-loss.md": {
      "disposition": "keep",
      "reason": "Appearance-not-presence, five never-scrolling readers, per-mechanism capture remedy (latch / scroll-bound / toggling) and the print route are internally consistent and match the next application's measured counts."
    },
    "techniques/motion-carries-the-mechanism.md": {
      "disposition": "keep",
      "reason": "Timing-as-claim litmus, spatial time axis, beat list as single source and ordered degraded forms are coherent; the loop-owes-a-stop rule matches WCAG 2.2.2."
    },
    "applications/react--scroll-bound-progression.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the dot window [0.34, 0.5] is now described as the last third of the approach (the last sixth of the station's travel), not the last sixth of the approach; re-read at the pinned commit. verified_on left at 2026-09-08 because the other anchors were not all re-resolved."
    },
    "applications/next--reveal-without-loss.md": {
      "disposition": "reverify",
      "reason": "Quoted Motion, MDN and WCAG sources re-read and accurate; the dev-server A/B counts and the ascent anchors were not re-executed, and the app notes no production build was measured."
    },
    "applications/react--no-orientation-tax.md": {
      "disposition": "keep",
      "reason": "Spot-checked quotes at 3394deb2 are verbatim; the 1171/55/135 px clearance arithmetic for a centred 771 px line against a 200 px band checks out. The five-vs-six entry tension is in the quoted source, not the application."
    },
    "applications/react--sequence-as-spine.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (eight stations, four consumers, two-condition exception met); its line anchors and the locale test were not re-resolved this run."
    },
    "applications/react--motion-carries-the-mechanism.md": {
      "disposition": "reverify",
      "reason": "Clear before/after/floor arms and stated limits; personas-web tree and its dev-mode measurements were not reopened."
    }
  }
}
```
