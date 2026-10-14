---
layer: application
type: application
subject: profit-on-ad-spend-economics
technique: break-even-roas-is-inverse-margin
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
---

# One reciprocal primitive, three consumers, and one rendering gap

The Czech-market adtech workspace at commit `7baeb12a81598f68ebbafb6fe1323dd40fd867dd`
(2026-10-14) derives break-even in exactly one place and reads it everywhere else. This
application counts that claim rather than asserting it, then records the one place the
technique's rendering rule is not met.

## Measured: one derivation, zero typed copies

Over `src/` (TypeScript and TSX, tests excluded):

| Question | Count | Where |
|---|---|---|
| Sites that compute a reciprocal of a margin | 1 | `src/lib/profit/core.ts:69-71`, `marginPct > 0 ? 1 / marginPct : Infinity` |
| Sites that compute the loaded variant | 1 | `core.ts:83-93`, `loadedCost / (adCost * marginPct)`, `Infinity` when margin or ad cost is not positive |
| Callers of the gross primitive | 3 | per-row `profit/compute.ts:40`, tenant `cost-model/compute.ts:80`, loaded rows `profit/overhead.ts:52` (loaded form) |
| Hand-typed numeric break-even constants | 0 | a search for break-even identifiers assigned a literal finds none |
| Reciprocals taken of something that is not a margin | 2 | `triage.ts:156` (`1 / pno`, the agreed portfolio target) and `cost-model/compute.ts:92` (`1 / loadedRoas`, the loaded cost share) - both derived, neither a second break-even |

The pure functions are pinned: `test-unit/profit-core.test.mjs` asserts
`breakEvenRoas(0) === Infinity`, `breakEvenRoas(-0.1) === Infinity` and the loaded
guards; 23 tests across the core, cost-model and triage-goal files passed at this
commit.

## The decision rules, each located

- **Target and break-even stay separate.** `triageGoals` (`triage.ts:154-156`) builds
  `targetRoas = 1 / pnoGoal` from the agreed portfolio goal and carries the margin
  break-even as a second, optional field. The "below break-even" severity fires only
  when that field is present and finite (`triage.ts:141-148`, `220-229`); a tenant with
  no cost model never gets it, and the comment says the margin-blind path stays
  unchanged. This is the "show both, labelled, never substitute" rule as a data shape.
- **No margin, no break-even.** `sanitizeCostModel` (`cost-model/compute.ts:109`)
  rejects a margin outside `(0, 1]` and returns null so the route answers 400; it does
  not clamp. The campaigns page passes `null` when no cost model exists
  (`reach/kampane/page.tsx:42`).
- **Infinite maps to absent.** `deriveBreakEven` (`cost-model/compute.ts:86-92`) drops
  the loaded fields when the loaded value is not finite, and cites the JSON null
  hazard in its comment; `core.ts:66-68` states it as a caller obligation. The loaded
  figure is also omitted when overhead and fulfilment are both zero, so it never shows
  as a duplicate of the gross one.
- **Gross and loaded are different surfaces.** The campaigns table and cost-model
  strip show the period-independent gross figure with the loaded one appended and
  labelled (`CostModelEditor.tsx:149-156`, `CampaignsClient.tsx:426-437`); the
  per-channel profit panel carries the window-dependent adjusted figure in its own
  column (`OverheadPanel.tsx:141`).

## Where it stops short

1. **"Never breaks even" renders as a dash.** `core.ts:69-71` returns `Infinity` for a
   zero-margin channel, and the shared formatter turns every non-finite number into
   the same placeholder (`format.ts:246-247`, `Number.isFinite(n) ? ... : DASH`).
   `ChannelsTable.tsx:81` therefore prints the same dash for a channel that can never
   break even as for a figure that is simply unavailable. The technique asks for the
   first to be said in words. The margin input is a free number box (0-100 percent),
   so the state is reachable by typing 0. The fix is a per-surface label, not a change
   to the formatter, because the dash is correct for the unavailable case; it was not
   made here because it needs new copy in both locales and the effect is cosmetic.
2. **The margin control clamps.** `useProfitState.ts:349-352` clamps a typed margin to
   `[0, 100]` before storing it, where the technique rejects an out-of-range margin at
   the boundary. Because the control is bounded (`max={100}`) the clamp only absorbs
   typing noise and never reaches the persisted cost model, which is validated
   separately; it is a deviation in form, not in effect.
3. **A fallback margin feeds the per-channel break-even.** Already recorded against the
   neighbouring technique (`profitable-means-net-profit-nonnegative`): a channel
   missing from the margin table is judged at the fallback, so its break-even is a
   derived number from an assumed input. The tenant-level path does not have this
   problem, because it requires a persisted margin.

## What the tree shows about the standard

The strongest evidence is negative: a repository with five surfaces that print a
break-even carries one derivation and no typed copy, and the one near-miss (the
portfolio target) is built as a distinct field. The standard's rule is cheap to follow
when the primitive is exported with its degenerate case already defined, and the
tree's remaining gap is in the last step, the words on the screen, not the arithmetic.
