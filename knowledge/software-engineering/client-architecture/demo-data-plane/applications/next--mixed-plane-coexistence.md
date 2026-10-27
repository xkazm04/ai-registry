---
layer: application
type: application
subject: demo-data-plane
technique: mixed-plane-coexistence
stack: next
status: forged
verified_on: 2026-10-27
verified_against: next@16
---

# A demo estate beside the person's first real projects (afterlife)

Project `afterlife`, https://github.com/xkazm04/afterlife at main, commit 009c7893 (Next.js
`^16.4.3`, `package.json:39`). The product ships an invented "demo estate" of projects and, beside
it, a real-project flow (Vitals, Projects) that reads only the person's own saved files; a live
data source can also still serve parts of the demo catalogue. Both are mixed-plane situations,
and the tree carries [mixed-plane-coexistence](../techniques/mixed-plane-coexistence.md) through
them.

## Three disclosures

- **Row**: Vitals lists the saved projects first, then the demo ones, each marked
  (`src/app/features/vitals/model/demo/estate.ts:1-3` "the demo projects after them, each marked
  `demo`. A real project always wins its slug"; `shownProjects`, `src/app/features/vitals/model/demo/estate.ts:14-19`).
- **Label**: the status bar's data label names the mix, and unknown is a dash, never demo
  (`src/components/shell/bars/dataLabel.ts:3-14`: "Demo says "illustrative demo data" and nothing
  else ever does", "Null ... is unknown: a dash, never demo", `live data · ${group} · some parts
  still demo, marked`); the Vitals subtitle counts both ("N real projects · M demo",
  `src/app/features/vitals/VitalsListScreen.tsx:62-66`).
- **Strip**: one note under the toolbar of a demo screen
  (`src/components/shell/bars/estate/DemoEstateBanner.tsx:10-23`, "a demo number never sits beside
  a real one unlabelled", rendering "Demo data — illustrative" / "an invented estate, not your
  projects."), with links to the person's real projects and the setting. With no real project
  yet, Vitals says what the rows are: "illustrative demo data: generated for layout, never
  collected" (`src/app/features/vitals/VitalsListScreen.tsx:50`).

## Demo rows do nothing real

`src/app/features/vitals/model/demo/estate.ts:29-37`: "A demo row offers no re-measure: nothing was collected, so there is nothing
Afterlife could measure it against", stripping the `remeasure` action from every demo row; the
loader applies it to demo rows only (`src/app/features/vitals/data/loadVitals.ts:46`).

## The predicate, the declaration, the saved list

The seeded-id predicate is defined beside the source
(`src/server/data/live/seeded.ts:1-3` "the predicate belongs to the data source, so every
Needs-you count and the Needs-you screen agree"), and the live source's count applies it
(`src/server/data/live/liveSource.ts:41`, `getNeedsYouCount: () => data().needsYou.filter((n) =>
!isSeeded(n.id)).length`). The live source declares what is still illustrative
(`src/server/data/types.ts:84-88`, `illustrative`, "Empty in demo mode, where everything is the
demo and the app says so once"; parts `tracks`, `loop`, `cockpit`, `setup` per
`src/server/data/README.md:78-79`). Projects' saved list holds only the machine's own saves
(`src/app/features/start/model/projects/saved.ts:1-4` "the demo estate is invented and never
written there, so the list holds only what this machine's wizard saved (none on a fresh
machine), never a demo project").

## Where the tree sits against the technique

Two deviations, the standard unchanged:

- **The list predicate is applied by loaders.** The live source's `getNeedsYou()` still returns
  the seeded items (`src/server/data/__tests__/parity.test.ts:115` "the items are still read; they
  are only not counted"), and each loader filters with the exported `ownDecisions(ds.mode, ...)`
  (`src/server/data/live/seeded.ts:11-13`; called in `src/app/features/door/data/loadDoorData.ts:26`,
  `src/app/features/fleet/data/loadFleetProject.ts:28`,
  `src/app/features/monitor/data/loadMonitorData.ts:18`). The count lives in the source; the list
  rule is copied per loader.
- **The coexistence setting persists.** The demo estate is a three-way setting kept in a one-year
  cookie (`src/lib/settings/demoEstate.ts:1-3`, `src/lib/settings/demoEstate.ts:48-51`); its default `auto` shows the
  demo only while no real project exists (`src/lib/settings/demoEstate.ts:31-33`), but `on` keeps demo beside real
  indefinitely across sessions. That is tolerable only because every demo row and screen carries
  its own marker — the contract's no-persistence clause satisfied differently, not waived.
