---
layer: application
type: application
subject: page-load-pipeline
technique: layout-stability-by-reservation
stack: next
status: forged
verified_on: 2026-09-24
verified_against: next@16.3.3
---

# Placeholders that match the loaded geometry, and one that says when not to split

Tree: ascent, read at `5eea0543` (2026-09-23) with a clean working tree; nothing was modified.
Version witness: `package-lock.json` resolves `node_modules/next` to 16.3.3 (lockfile, not the
`^16.3.3` range in `package.json`). The seam is the client-only dynamic imports on the marketing
decks: the Remotion diagrams on `/about` and the recharts trajectory on the home page. Each one
loads a heavy runtime in its own chunk and has to hold its slot still while that chunk streams in.

## A reservation that includes the chrome under the box

The `/about` deck splits two diagrams that pull in the video runtime, and states the
reservation rule where the split is declared:
`src/components/about/AboutLanding.tsx:26 "already holds a sized aspect-video placeholder until its Player mounts"`.
The loading fallback is a box of the same ratio,
`src/components/about/AboutLanding.tsx:31 "aspect-video w-full"`, matching the stage's own
pre-mount box at `src/components/about/RemotionStage.tsx:101 "aspect-video w-full"`.

The technique warns about chrome under the box, and this tree hit that case. The loaded stage
always paints a legend and replay row beneath the player,
`src/components/about/RemotionStage.tsx:106 "mt-3 flex items-center justify-between gap-3"`. A
fallback that reserved only the box would have left the column to grow by that row when the
chunk resolved. The fallback reserves it explicitly:
`src/components/about/AboutLanding.tsx:34 "the SAME ~24px row here so the column doesn't grow taller"`
and `src/components/about/AboutLanding.tsx:36 "mt-3 h-6"`.

## One placeholder for two not-yet states

The home page's trajectory chart has the two-state problem the technique describes. The slot is
empty while the recharts chunk loads, and empty again while the loaded chart waits to scroll into
view before it animates. The two states used to draw different placeholders. They now share one
module, and its header records the incident:
`src/components/landing/prototypes/index/TrajectoryPlaceholder.tsx:1 "Rendered in TWO places that"`
... `src/components/landing/prototypes/index/TrajectoryPlaceholder.tsx:4 "Single-sourced here so both are pixel-identical."`
The dynamic import uses it as its fallback,
`src/components/landing/prototypes/index/IndexLevels.tsx:22 "loading: () => <TrajectoryPlaceholder />,"`,
and the chart renders it at rest. The placeholder also lives in a module that does not import
the chart library, so referencing it does not pull the chunk it stands in for back into the
first load.

## The upward lesson: a split has a reservation cost

The sibling deck `/about-org` declines to split and gives the reason in the terms the technique
now uses. Its diagrams are dependency-free, so nothing is
`src/components/about-org/AboutOrgLanding.tsx:28 "enough to be worth a dynamic() split and its loading-placeholder CLS budget."`
A split is paid for in a placeholder that has to be kept exact. When the module is light, not
splitting is the stable choice. That rule went into
[script-cost-is-main-thread-time](../techniques/script-cost-is-main-thread-time.md).

## Where it falls short of the technique

- **The ratios are restated, not derived.** The fallback's `aspect-video` is a hand-written 16:9.
  The composition's size lives separately at
  `src/components/about/compositionShared.tsx:27 "export const W = 960;"` and
  `src/components/about/compositionShared.tsx:28 "export const H = 540;"`. They agree today. If
  `H` changes, the reservation keeps the old ratio and nothing fails. The chart's 360-pixel height
  has the same problem: it is written in both the placeholder and the chart container.
- **The chrome reservation is approximate and varies by mode.** The row the fallback reserves at
  24 px contains a replay button that is hidden under reduced motion,
  `src/components/about/RemotionStage.tsx:111 "{!reduced && ("`, so the loaded row can be shorter
  than its reservation in that mode. The fallback comment also points at
  `src/components/about/AboutLanding.tsx:33 "(RemotionStage.tsx:90)"`, but the row now sits at
  line 106. That line reference in the comment has already drifted.

## What this realization cannot do or prove

- This was read, not measured. No layout-shift figure was recorded, and the claim that the swaps
  are stable rests on matching class names, not on a rendered comparison at real viewport widths.
- The player's loaded height depends on the player sizing itself from the composition's ratio.
  That is inferred from the 960 by 540 constants and was not observed.
- The decks here use scroll-snap, full-viewport sections. A shift inside an off-screen section
  mostly does not reach the reader, so these reservations protect less on this layout than the
  same code would on a free-scrolling long page.
