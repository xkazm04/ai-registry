---
layer: application
type: application
subject: status-vocabulary
technique: vocabulary-chain-integrity
stack: react
status: forged
verified_on: 2026-09-01
verified_against: react@19
---

# React application — a vocabulary's order as a total map

Measured in the `personas` desktop tree at HEAD `b6dcf28aa` (React 19.2.6,
TypeScript 6.0.3, Node 22 per `.nvmrc`, engines floor `>=20`). This tree is
the ordering-gate specimen: seven independent surfaces hold a closed
vocabulary's *rank* as a total map keyed by the union, and two surfaces
still hold one as an array — and the difference is exactly one `tsc` error.

## The landed form, converged on seven times

```ts
// src/features/teams/sub_mastermind/lib/dimCategories.ts:43-47
/** Worst-first ordering for a status list — the sort the category popover uses
 *  so a red cell opens with its red dimensions at the top. */
export const STATUS_RANK: Record<DimStatus, number> = {
  alert: 0, risk: 1, unknown: 2, partial: 3, absent: 4, solid: 5,
};
```

Union at `src/features/teams/sub_mastermind/lib/types.ts:12`; comparator at
`CategoryPopover.tsx:25-27` and `IslandMenu.tsx:74`
(`STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.label.localeCompare(b.label)`).
The same module keeps the *iteration* order as an array
(`CATEGORY_ORDER: DimCategory[]`, `dimCategories.ts:18`, consumed by a
`flatMap` at `:80`) — a clean in-file statement of the split: array for
walking, map for ranking.

The family, all `Record<Union, number>` with the comparator adjacent:

- `src/features/overview/sub_patterns/libraryModel.ts:139-147` —
  `STATUS_RANK: Record<KnowledgeStatus, number>`, union at
  `src/api/devTools/workspaces.ts:26`, comparator `KnowledgeTree.tsx:167`.
- `src/lib/templates/personaSafetyScanner.ts:417-418` —
  `severityOrder: Record<ScanSeverity, number>` (union at `:15`), the
  canonical severity case, declaration and sort on adjacent lines.
- `src/lib/constants/uiModes.ts:38-43` — `TIER_RANK: Record<Tier, number>`,
  used for `>=` precedence at `:51,56`.
- `src/features/teams/sub_mastermind/lib/types.ts:253` (`BAND_ORDER`),
  `src/features/triggers/sub_studio/routing/layouts/buildEventRows.ts:168`
  (`classOrder`), `KpiListPopover.tsx:28`, and
  `RecipesTableResults.tsx:31-35` (keyed by an indexed-access union).

Introduced net-new as Records, not converted: `fa5f21b5d` (2026-07-26,
*"feat(mastermind): act on a category without zooming in"* — body: *"the
worst-first sort shares STATUS_RANK with the rollup, pinned by a test
asserting the two agree on which status wins a group"*) and `752d426fe`
(2026-07-24). No commit in this tree converts an array ordering to a map;
this is convergent practice, not a documented refactor.

## The counter-specimen, live and unguarded

```ts
// src/features/home/sub_welcome/LanguageSwitcher.tsx:32-42
type ScriptFamily = 'latin' | 'cjk' | 'indic' | 'arabic' | 'cyrillic'; // :5
const SCRIPT_ORDER: ScriptFamily[] = ['latin', 'cjk', 'indic', 'arabic', 'cyrillic'];
…
const scriptDiff = SCRIPT_ORDER.indexOf(a.script) - SCRIPT_ORDER.indexOf(b.script);
```

The array's *entries* are checked against `ScriptFamily`; its *length* is
not. Add `'hebrew'` to the union (or a `{ script: 'hebrew' }` row to
`LANGUAGES` at `:15-30`) and the build stays green — `indexOf` returns
`-1`, and Hebrew sorts ahead of Latin at the top of the switcher. Nothing
references `sortLanguages` or `SCRIPT_ORDER` outside this one file; no test
covers it.

Two nearby forms show what the array actually costs:

- `src/features/vault/sub_dependencies/credentialGraph.ts:153-162` keeps an
  array but pays for it — `linkTypeRank` maps `-1` to
  `LINK_TYPE_PRECEDENCE.length`, and the comment at `:149-151` names the
  hazard (*"Unknown link types are appended after all known ones … keeping
  the comparison total but conservative"*). It buys totality by widening
  the key to `string`: it has no union left to be exhaustive over.
- `src/features/fleet/monitor/MonitorDrawer.tsx:62-65` uses a `Record` and
  still gets nothing, because it is `Record<string, number>` with a `?? 9`
  tail. The container is not what helps; the **union key** is.

The silent-clamp variant recurs: `passportModel.ts:258`,
`passport/passportRows.ts:86` and `passport/improve/levels.ts:87` all wrap
`scale.indexOf(...)` in `Math.max(0, …)`, mapping the unknown member onto
the *first* rank deliberately; `src/lib/analytics/activation.ts:41`
(`ACTIVATION_FUNNEL.indexOf(step) + 1`) reports an unknown step as step 0.

## What actually gates it

`tsc --noEmit`, and nothing else. It runs in `lefthook.yml` pre-push
(`typecheck`) and in `package.json:54`'s `check` script. Omit a member from
`Record<DimStatus, number>` and it fails TS2741 by name; widen `DimStatus`
and every total map over it fails until updated. None of the 21 custom
rules under `eslint-rules/` and no structural test under
`src/__tests__/structural/` checks ordering completeness — and the two unit
tests that do exist (`dimCategories.test.ts:40-52`,
`libraryModel.test.ts:147-153`) enumerate members by hand, so they pin
relative order and would *not* fail on a newly added member. The
exhaustiveness comes entirely from the total map's type.
