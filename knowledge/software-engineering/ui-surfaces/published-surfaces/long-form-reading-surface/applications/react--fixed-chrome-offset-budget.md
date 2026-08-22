---
layer: application
type: application
subject: long-form-reading-surface
technique: fixed-chrome-offset-budget
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# One module for every offset under the fixed navbar

`src/components/guide/guide-chrome.ts` is the guide's offset budget. Its
docblock (`:1`) carries the measurement, the incident, and the diagram, in that
order.

## The measurement, stated with its derivation

```
 * The marketing `Navbar` is `position: fixed` and its height is derived from
 * its content, not from a fixed class: `nav` contributes `py-4` (32px) and the
 * row inside it is a 44px tap-target on mobile / a 54px nav row from `lg` up.
 * Measured against the production build: **76px below `lg`, 86px from `lg`**.
```

`NAVBAR_HEIGHT_PX = { base: 76, lg: 86 }` (`:27`) is exported as the stated
source of truth for every class below it. The comment is doing the work the
technique asks for: the number is a measurement of rendered chrome, and the
next person can re-derive it from the three inputs named rather than trusting
it.

## The incident

```
 * Three elements pin themselves under that navbar — `ReadingProgress`,
 * `MobileTopicTOC` and the `GuideSidebar` drawer trigger. They used to each
 * hardcode `60px`, which put them *behind* the navbar and on top of each
 * other.
```

Three local guesses, all close, all wrong in the same direction — the exact
failure the technique exists to prevent.

## The band diagram

```
 *   0 ┌──────────────── Navbar (76 / 86) ────────────────┐
 *  76 ├── reading progress (2px) ────────────────────────┤
 *  78 ├── mobile TOC bar (44px) + sidebar trigger lane ──┤
 * 122 └── page content / TOC panel scrim ────────────────┘
```

Every constant below it reads as an entry in that picture: `CHROME_TOP_PROGRESS`
(`:42`, `top-[76px] lg:top-[86px]`), `CHROME_TOP_MOBILE_BAR` (`:45`,
`top-[78px]` = 76 + 2), `CHROME_TOP_MOBILE_BELOW` (`:48`, `top-[122px]` =
78 + 44), `CHROME_PAD_TOPIC` (`:57`, `pt-12 lg:pt-0` = 122 − 76). The arithmetic
is written into the comments, so a wrong constant is visible without measuring
anything.

## The literal-string constraint

```
 * The values are literal Tailwind classes rather than numbers because Tailwind
 * only compiles utilities it can see as complete strings in the source.
```

The utility-class compiler scans source for complete class strings, so
`top-[${offset}px]` compiles to nothing. The module absorbs the constraint —
literal strings, with the numeric measurement exported beside them for anything
that needs arithmetic — rather than letting each call site conclude that
"sharing is impossible anyway" and write its own literal.

## The two-dimensional cases

`MobileTopicTOC.tsx:65` records the paint order in the band it shares:
"`z-30` keeps the reading-progress bar (`z-40`) painting above this bar; the
sidebar trigger shares this band and sits in the `CHROME_TRIGGER_LANE`."
`CHROME_TRIGGER_LANE` (`:54`, `pl-16`) is the horizontal half of the same
budget — the reserved lane that keeps the TOC bar's own content from rendering
underneath the sidebar trigger sharing its strip.

## The scrolling-ancestor incident

`src/app/guide/layout.tsx:27` is the constraint written where the container is,
in a comment whose only job is to stop the next person re-adding one line:

```
  No `overflow-y-auto` here: `<main>` has no constrained height, so an
  overflow value only made it the nearest scrollport without ever
  scrolling — which silently disabled every `position: sticky` inside
  it (the desktop on-this-page TOC). The window is the scroll
  container.
```

The desktop panel that depends on it is `TopicView.tsx:238` — a `sticky` wrapper
using `CHROME_TOC_STICKY` (`:60`, `top-[102px]`, documented as navbar 86 plus
16px of breathing room) — and it is `hidden lg:block` (`:237`), which is the
breakpoint decision the technique asks to keep with the offsets.

## Deviations

- **Two offsets in the band are still local literals.** The anchored heading's
  clearance is `scroll-mt-24` (96px) hardcoded in every heading class in
  `HeadingAnchor.tsx:6`–`:9`, and the reading band's top inset is the `-96px` in
  `useActiveHeading.ts:19`. Their *equality* is the load-bearing property — it is
  why jumping to a heading lands it exactly at the band's top edge and makes it
  the active entry with no special case — and neither of them derives from
  `guide-chrome.ts`. Two hardcoded 96s in two files, agreeing by luck, is the
  pre-incident state of the other three elements.
- **The desktop panel has no height bound.** `TopicView.tsx:238` pins the panel
  but sets neither a max height nor internal scrolling, so on a topic with many
  level-2 and level-3 headings the tail of the panel runs past the bottom of the
  viewport and is unreachable. `CHROME_SIDEBAR_STICKY` (`:39`) shows the correct
  shape for a pinned column — `top-[86px] h-[calc(100dvh-86px)]` — and the
  on-this-page panel does not use it.
