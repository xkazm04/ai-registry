---
layer: application
type: application
subject: lazy-section-addressability
technique: scroll-to-hydrate-then-retry
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# Scroll to hydrate, then retry — React/Next.js implementation (Personas guided tour and scroll map)

How `personas-web` implements
[scroll-to-hydrate-then-retry](../techniques/scroll-to-hydrate-then-retry.md)
for its two late-resolving consumers — the guided tour's spotlight and the
page-level section tracker — and the four places it falls short.

## The step declares both targets

`src/lib/tour-script.ts:76-85` splits the step's pointer in two, which is what
makes the protocol expressible at all:

- `scrollTarget` — "an always-present section wrapper id, so the scroll fires
  even before lazy section content hydrates".
- `spotlightTarget` — a `[data-tour-diagram="…"]` anchor that "may appear only
  after lazy hydration; the spotlight polls until it exists".

The module header (`tour-script.ts:1-9`) states the sequence in one line: the
scroll fires against the wrapper, "the spotlight then polls until the diagram
itself mounts". Every step's spotlight points at an animated diagram rather
than a heading, so the fine target is always inside the lazily-mounted
subtree — the protocol is not an edge case here, it is the normal path.

## The protocol

`src/hooks/useTourScroll.ts:22-42` is the whole implementation, and it is
short enough to read as the technique's pseudocode:

```ts
const center = () => {
  const spot = document.querySelector<HTMLElement>(spotlightTarget);
  if (spot) { spot.scrollIntoView({ behavior, block: "center" }); return true; }
  if (scrollTarget) {
    document.querySelector<HTMLElement>(scrollTarget)
      ?.scrollIntoView({ behavior, block: "center" });
  }
  return false;
};

if (center()) return;
let tries = 0;
const id = window.setInterval(() => {
  tries += 1;
  if (center() || tries > 12) window.clearInterval(id);
}, 200);
return () => window.clearInterval(id);
```

Fine target first; wrapper as the fallback landing, which is also what causes
the mount; then a bounded retry of 12 attempts at 200ms — a 2.4-second
ceiling. Three of the technique's refinements are present: resolution goes
back to the selector on every attempt rather than caching an element
(`useTourScroll.ts:23`, and again per frame at `TourSpotlight.tsx:92`), the
interval is cleared on success as well as exhaustion, and motion posture
honours the reader (`useTourScroll.ts:20`:
`prefersReducedMotion ? "auto" : "smooth"`).

The budget is achievable because `LazyMount`'s default `rootMargin` is
`800px 0px` (`src/components/LazyMount.tsx:21`) — roughly a viewport of lead,
so the section usually begins mounting before the scroll finishes and the
retry is a formality rather than a wait.

`src/components/tour/TourSpotlight.tsx:49-70` runs the same
resolve-and-re-resolve idea for the `data-tour-active` marker: apply once,
then re-apply on a 200ms interval, moving the attribute when the element is
replaced (`removeAttribute` on the old node before setting the new one) — the
"the target may be re-created" clause implemented literally.

## The other direction: late registration for the tracker

`src/contexts/SectionObserverContext.tsx:119-178` is the tracker half, and its
comment names the defect exactly: several landing sections "are lazy-loaded on
the client so their IDs aren't in the DOM when this provider mounts. A
one-shot `getElementById` sweep misses them, breaking the scroll-map for those
dots."

The implementation is the registration protocol the technique describes:
sweep once (`tryRegister()`), then watch `document.body` with a
`MutationObserver` for arrivals, disconnecting the moment `pending` empties.
Both disciplines are present:

- **The watch is capped** at 30 seconds
  (`SectionObserverContext.tsx:159-168`), with the reason stated: a
  "missing/never-hydrating ID" would otherwise "keep the observer attached
  forever, firing on every dynamic mutation in the app".
- **Give-up names the unresolved entries** in development
  (`:162-167`), which is the runtime coverage guard the sibling technique
  asks for — sharper than a first-paint check, because it reports addresses
  whose content never arrived at all in a whole session.

`page.tsx:78-81` records the matching cost lesson: a second
`SectionObserverProvider` over the same ids "only duplicated the
Intersection- and MutationObserver over `document.body`'s whole subtree", so
`PageShell` mounts exactly one for the vocabulary it derives from
`scrollMapItems` (`src/components/PageShell.tsx:22-25`).

## Where the repo falls short

**The retry is not cancelled by the reader.** `useTourScroll`'s only reaper is
the effect cleanup — a step change, or the tour ending. A reader who scrolls
away during the 2.4-second window is re-centred on every failed tick, because
`center()` re-scrolls the wrapper each attempt (`useTourScroll.ts:28-32`) and
succeeds into another `scrollIntoView` at the end. That is up to twelve
viewport yanks against a reader who has deliberately gone elsewhere: the
technique's named worst felt bug. Both fixes are small — scroll the wrapper on
the first attempt only, and abort on a user-initiated scroll.

**There is no shared budget.** `12` and `200` are literals inside the tour
hook. The scroll map has no retry at all: `ScrollMap.tsx:29-34` resolves once,
falls back to the wrapper, and stops — correct as far as it goes, but it means
the page has two different cold-load behaviours for the same address space,
with nothing linking them.

**One poll is unbounded.** The `data-tour-active` interval
(`TourSpotlight.tsx:65`) runs every 200ms for the entire life of a step. It
names its reaper (`clearInterval` plus attribute removal on cleanup) so it is
not a leak, but nothing distinguishes "still waiting for a lazy target" from
"this selector will never resolve", and the loop cannot tell the difference
either.

**Exhaustion leaves no trace.** At `tries > 12` the interval is cleared and
nothing is recorded — no counter, no degradation event, no development
warning. A slow-connection cohort losing the spotlight on a given step is
invisible, which is the quiet failure the technique names. The tracker's
30-second give-up path is the only place in the tree that reports a
non-arrival, and it does so only in development.
