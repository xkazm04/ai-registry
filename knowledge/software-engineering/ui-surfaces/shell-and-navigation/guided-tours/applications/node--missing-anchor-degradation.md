---
layer: application
type: application
subject: guided-tours
technique: missing-anchor-degradation
stack: node
status: forged
verified_on: 2026-09-02
---

# Missing-anchor degradation in Driver.js — a global re-center by default, a per-step skip on request, and a wait that keeps the last step on screen

How the framework-agnostic tour engine `driver.js` realizes the
[missing-anchor-degradation](../techniques/missing-anchor-degradation.md)
technique. Read in the `kamranahmedse/driver.js` monorepo at commit `010fb13`
(2026-07-18), package `driver.js` 1.8.0, `packages/driver/src/`; citations
resolved against that tree on 2026-09-02. This reconciles an external tree,
not the consumer repo the sibling applications cite, so the pin lives in
prose, not `verified_against`.

## The default is the technique's category error, and it is honest about it

A step names its anchor as a selector, an element, or a locator function
(`driver.ts:16`). When resolution fails, `highlight()` mounts a zero-size
`driver-dummy-element` fixed at the viewport centre and highlights *that*
(`highlight.ts:8-39`); `resolveStepPosition` then centres the popover "like
a modal" whenever the anchor is the dummy (`step.ts:126-130`). That is the
technique's **re-center** policy applied globally: every missing anchor
becomes a centred card, including the "here is the export button" step the
technique says must not survive without its button.

The opposite policy is an opt-in. `skipMissingElement` (default `false`,
`context.ts:38-40,99`) is readable at the step or the config level
(`step.ts:13-20`), so the per-step declaration the technique demands is
available — but nothing in the engine asks for it, and a tour that sets
neither has chosen global re-center by omission. Steps with no `element` at
all are "intentional centered steps and never skipped" (`context.ts:39`),
which is the right reading of the technique's explanatory-step exemption.

## Bounded patience is a mutation watch with a deadline

`waitForElement` (default `0`, off; `context.ts:42-46`) is the technique's
bounded patience in its field form. `drive()` checks the anchor before
anything else; if it is missing and a wait is configured, it installs a
`MutationObserver` over the whole document (`childList`, `subtree`,
`attributes`) that re-resolves the anchor on every change, races it against a
`setTimeout`, and re-enters `drive()` with `hasWaitedForElement` set when
either settles (`driver.ts:240-290`). The comment states the property the
technique wants and does not name: "the current step stays highlighted while
waiting; a timeout falls through to the usual missing-element handling"
(`driver.ts:284-285`) — the user never sees a dimmed void, and the deadline
expiring lands in exactly the same skip-or-centre decision as an anchor that
was never going to appear. A pending wait is cancelled by any newer
`drive()`, by `setSteps`, and by `destroy` (`driver.ts:230-238,267,352,388`),
so a user who skips ahead during the wait cannot be yanked back when the
anchor finally mounts.

## The skip cascade ends the tour going forward — and stalls going backward

When a step is skipped, `drive()` walks one step in the direction of travel
and, if it runs off the end going forward, destroys the tour
(`driver.ts:292-303`) — the technique's "a tour that degrades to nothing
ends". Backward is asymmetric: running off the front does nothing
(`:298-299`), leaving the tour parked on the current step with a Previous
button that visibly does nothing. `findReachableIndex` (`step.ts:27-37`)
resolves reachability against the live DOM on every first/last decision so
the Done button and the tour's real end agree, a fix the header credits to
issue #616 — an instance of the technique's warning that a skip changes the
tour's shape and every affordance that depends on it.

## Degradation is silent unless the integration listens for it

The technique's "degradation records itself" is not implemented by the
engine, and the two policies are unequally observable:

- **Skip fires nothing.** A skipped step never reaches `highlight()`, so
  none of `onHighlightStarted`, `onHighlighted`, `onDeselected` run for it
  (`driver.ts:292-303`, `highlight.ts:72-84`). A tour that skipped four of
  nine steps emits the same hook sequence as a five-step tour.
- **Re-center is detectable by an absent argument.** Every hook receives
  `undefined` as its element when the highlighted thing is the dummy
  (`highlight.ts:79,83,121`; `driver.ts:341,364-371`), so `element ===
  undefined` on a step that *declared* an `element` is the re-center
  signal. It has to be read out; nothing emits it as a named event.

The degradation ledger therefore lives in the caller: diff `steps` against
the indices `onHighlighted` reported, and test the hook argument. This is
the technique's "the save without the signal" as a default, softened only by
the argument shape.

## The never-strand invariant, and where it holds

The dimming, the popover, and the close control never depend on the anchor:
the popover renders against the dummy exactly as against a real element
(`step.ts:198-202`), Escape and the close button both route to `destroy()`
when `allowClose` is true (`driver.ts:56-62,224-225`, default true at
`context.ts:92`), and clicking the dim itself closes the tour under the
default `overlayClickBehavior: "close"` (`driver.ts:64-70`, `context.ts:94`).
Teardown removes the dummy, the overlay, every listener and body class, and
refocuses the element that held focus before the step (`driver.ts:330-377`).
A first step with a missing anchor and `skipMissingElement` on walks forward
like any other (`driver.ts:292-303`); with it off, the first step centres.
Neither path parks the user under a dead overlay — the stranding form the
technique's first-step note warns of does not occur here.

The invariant is weaker in one place: with `allowClose: false`, both Escape
and the close button are inert (`driver.ts:57-59`), and if the remaining
steps are also missing, forward walking is the only way out. The engine
leaves that combination to the author.

## Where the tree falls short of the standard (kept, not hidden)

- **No per-step *re-center* opt-in.** Re-center is the global default and
  skip the opt-in; a tour that wants skip globally cannot then mark one
  conceptual step "centre me instead", except by giving that step no
  `element` — which also loses its highlight.
- **Backward skip-to-nothing stalls** rather than cancelling, per above.
- **The wait cannot see what the step itself creates.** The check runs
  before `onHighlightStarted` (`driver.ts:286-290` precedes `:310`), so an
  anchor rendered by the step's own hook is invisible to `waitForElement`.
- **No degradation event.** Skips are silent; re-centres are an argument
  shape. Telemetry is entirely the integrator's.
