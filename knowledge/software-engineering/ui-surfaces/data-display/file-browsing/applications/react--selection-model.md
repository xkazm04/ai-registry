---
layer: application
type: application
subject: file-browsing
technique: selection-model
stack: react
verified_on: 2026-09-20
verified_against: react@19
---

# Selection model — the decision table's aiming mechanism

Ascent's worklists (proposals, lessons, the follow-ups ledger) all select
through one component, `src/components/org/shared/DecisionTable.tsx`, whose
arithmetic lives in `src/components/org/followups/followupsModel.ts`. It is
the technique's selection set realized as a shared component, and it carries
one correction the technique did not name until this file supplied it.

## One set of identities, one producer

The owner holds `useState<Set<string>>` — in
`src/features/inflight/proposals/ProposalsWorklist.tsx` line 69 — and passes
it down with `rowId={(r) => r.id}` (line 149). `DecisionTable` never stores
a position: `toggle` (lines 93–98) and `toggleAll` (lines 99–106) both build
a new `Set` of ids and hand it back through `onSelectedChange`. Every
consumer derives from that one set — the row's checked state (line 144), the
bulk bar's count (line 183), the action's target list (line 108, where
`picked` is filtered by the action's own applicability). One producer, many
consumers, exactly as the technique demands of the bulk-action surface.

## Intersection is derived, not stored

The technique asks that selection survive refresh by intersecting with the
new listing. This implementation gets that property for free by never
materializing the intersection: `picked` is recomputed on every render as
`(p.allRows ?? p.rows).filter((r) => p.selected.has(p.rowId(r)))` (line 88).
A selected id whose row has vanished simply stops appearing in `picked`, so
the displayed count is the live count and the action receives the live list.
The raw set may carry ghosts; nothing downstream can see them.
`followupsModel.test.ts` line 173 pins the behaviour from the model side —
`summarizeSelection(rows, new Set(["gone"]))` yields `count: 0`.

The set is also cleared after a successful action — `DecisionTable` line 113
calls `onSelectedChange` with an empty set — and the route data is refetched,
which is the clear-after-fire variant of surviving a refresh: correct here
because every action is terminal for the rows it touched.

## The correction: eligibility stated twice, stated differently

`followupsModel.ts` line 135 exports `isSelectable`, and its doc comment
(lines 129–134) records the defect that produced it verbatim: the rule was
"stated twice and the two statements disagreed: the row checkbox disabled a
closed row while the header's select-all added every SHOWN row, so in the
resolved archive 'select all' filled the bulk bar with rows the user could
not then untick one by one." That is the trap precisely — a set the user can
enter but not leave item by item, because the only control that could remove
an entry is the one that refused to add it.

The fix is structural. `DecisionTable` takes `isSelectable` as one prop
(line 70), resolves it once as `selectable` (line 87), and spends it in
exactly two places: the row checkbox's `disabled` (line 155) and
`shownSelectable`, the list `toggleAll` iterates (line 90). The comment above
line 90 states the invariant — "Select-all covers the SHOWN rows a batch can
act on — the same rule the row checkbox enforces". `allShown` (line 91) is
computed over the same filtered list, so the header checkbox's own checked
state cannot drift from what it would select either.
`followupsModel.test.ts` lines 48–69 pin it, including the archive case that
started it: `archive.filter(isSelectable)` is empty.

## The gap: selection that filtering made invisible

`allRows` (line 62, "Every row a selection may reference, including rows the
current filters hide") is passed by both worklists, so `picked` is computed
over the unfiltered set. Select fourteen items, then narrow a filter chip
until eleven rows remain, and all fourteen stay selected and all fourteen
receive the action. That is the right *behaviour* — the intent was genuine
and discarding it on a chip toggle would be its own surprise — and the count
stays honest, because the number in the bar is the number acted on.

What is missing is the reconciliation the user has to do in their head. The
header checkbox is honestly labelled "Select all shown" (line 132), but the
bulk bar renders only `N selected` (line 183), and the richest summary
available, `summarizeSelection` (line 157), returns count, repo count and
points with no hidden-item term. So the bar says fourteen while the surface
shows eleven tickboxes, and nothing on screen explains the three. The count
carries its predicate in the sense the technique demands; it does not yet
carry the fact that part of the set is out of sight, which is the cheap half
of the same honesty.

## Bulk application, per-item counts

`patchStatuses` (`followupsModel.ts` line 207) is the mutation half: one
write per selected id, a shared queue drained by `concurrency = 4` workers,
each failure caught per item, returning `{ ok, failed }`. One failure does
not abort the rest and the two numbers are reported separately — the
file-mutations contract, at the scale a worklist needs. Its caller then
issues a single refresh rather than one per item.
