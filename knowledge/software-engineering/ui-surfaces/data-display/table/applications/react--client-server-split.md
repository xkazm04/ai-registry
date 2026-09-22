---
layer: application
type: application
subject: table
technique: client-server-split
stack: react
verified_on: 2026-09-21
verified_against: react@19.2.6
---

# UnifiedTable — how this repo's React side realizes the table standard

The canonical table primitive is `UnifiedTable<T>` at
`src/features/shared/components/display/UnifiedTable.tsx` (its `@catalog` header,
`:1-26`, is the component's own statement of the contract). It implements the
**all-client regime** of the client–server split: callers hand it the loaded
dataset and it owns sorting, per-column dropdown filters, inline search,
windowing, grouping, keyboard nav, and the entire cold-load choreography.
`DataGrid` (`display/DataGrid.tsx`) is the page-based sibling — reach for it only
when you need `pageSize` pagination or row selection with bulk actions, which
`UnifiedTable` deliberately lacks (see `docs/concepts/golden-paths/tables.md`
for the full capability matrix and adoption census).

## The props contract

```tsx
<UnifiedTable
  columns={columns}          // TableColumn<T>[] — the column model (:68-97)
  data={rows}
  getRowKey={(r) => r.id}    // row identity — REQUIRED, must be stable
  isLoading={isFetching}     // the real in-flight flag, nothing else
  rowHeight={44}             // >0 opts into the virtual list
  emptyTitle={t.section.no_rows_yet}   // ALWAYS translated + surface-specific
  emptyDescription={t.section.no_rows_hint}
  tableId="overview-activity"          // unlocks column resize + sort persistence
  scrollRestoreKey={`${route}|${personaId}|${filter}`}
/>
```

- **Column model first-class**: `TableColumn<T>` declares `key`, `label`,
  `width` (a CSS grid track), `render`, `sortable`/`sortFn`, `filterOptions`,
  `searchable`, `align`. Define columns in a sibling `useXColumns()` hook and
  translate every `label`.
- **Row identity**: `getRowKey` feeds the element key in *all* render paths —
  plain, virtualized (`:679`), and grouped (`:835`) — and the reveal tracker's
  id-guard (`useRowRevealEntrance`, `:239-257`). Pass a database id; never an
  index.
- **Sort**: internal `(sortKey, sortDir)` state, read from `localStorage`
  under `table-sort:<tableId>` on mount (`readPersistedSort`, `:45-62`) and
  written back on every change (`:497-504`); the persisted value wins over
  `defaultSortKey` when seeding initial state (`:492-494`). The default
  comparator is string-`localeCompare` (`:526-530`) — pass a typed `sortFn`
  for numeric, date, or ranked-enum columns.

## Ghost-under-chrome, row reveal, empty-state rules

The body is a four-state machine of loading-pattern v2
(`docs/design/overview-loading.md`, the five laws), roughly `:616-647`. It was
a strict *three*-state machine (no failure branch) until 2026-09-20, when the
error branch below landed — see "Known shortfalls":

1. `isLoading && data.length === 0` → `TableGhostRows` (`:288-315`): eight
   geometry-matched rows under the *always-rendered* column header, entering
   via `animate-fade-in` behind a staggered `≥120ms` `animation-delay` — the
   delay is the anti-flash; no `animate-pulse`, ever.
2. `error && data.length === 0` → a failure banner (`:622-625`, `ErrorBanner
   variant="panel"`) — "I couldn't look," not "there is nothing."
3. `!isLoading && !error && data.length === 0` → the settled empty state
   (`:626-641`). Empty never flashes before the first fetch resolves because
   the ghost branch wins while in flight, and a *failed* fetch renders the
   failure banner instead of this branch.
4. `data.length > 0` → rows, rippling in once via the id-guarded cascade.
   `resolveRowReveal` (`:266-276`) couples the cascade to `isLoading`, so the
   single flag buys ghost → ripple; `rowReveal={false}` opts out,
   `rowReveal={{ resetKey }}` re-ripples on a context switch. The entered-id
   set lives in `useRevealTracker`
   (`src/hooks/utility/interaction/useProgressiveReveal.ts:184-199`), a
   ref-backed Set that survives virtualized unmount/remount. A failed
   *refresh* that still holds rows keeps them mounted and adds an inline
   banner above them (`:644-647`) rather than falling back to any of the
   above three branches — a fifth, additive state, not a replacement of
   "rows."

**The whole recipe for a list/table surface is `isLoading` + `data`.** No local
`*GhostRows`, no `*Skeleton`, no `RevealItem` wrapper, no `isLoading={false}`
in front of the primitive — `overview-loading.md` documents call sites that
did exactly that citing a stale version of its own recipe. The
counter-example on file is `ByomAuditLog.tsx` (hand-rolled `role="table"` divs
plus its own virtualizer): the primitive, retyped.

## Where the split sits today — and its edge

Only **sort** is client-side work the primitive actually does: `sortedData`
is a `useMemo` over `data` (`:518-533`, `[data, sortKey, sortDir, columns]`).
**Filter and search are not** — `TableColumn` carries `filterValue` /
`onFilterChange` / `searchValue` / `onSearchChange` (`:80-92`), and
`ColumnHeader` reads and renders them (`:346-349`, `:401-403`, `:421-429`),
but every one of those is controlled chrome: the value is drawn from props
and every change is forwarded straight to the caller's handler. Nothing in
`UnifiedTable` or `GroupedTableBody` ever narrows `data`/`sortedData` by
`filterValue` or `searchValue` — grep the file and the only reads of those
two fields outside `ColumnHeader` are zero. `UnifiedTable` renders the filter
dropdown and the search input; it does not run either one.

That means "applied" has no single owner. A caller that wires
`onFilterChange={setFilter}` (real call sites: `ActivityTab.tsx`,
`DirectorCoachingTab.tsx`, `ReasoningTrace.tsx`) must itself filter the array
it hands to `data` — in a `useMemo` upstream of the table, in a store
selector, wherever. `UnifiedTable` only proves the control was clicked; it
never proves the predicate ran. A caller that renders `filterOptions` /
`searchable` on a column and forgets to filter `data` upstream ships a
control that changes color (`isFiltered`/`isSearched`, `:348-349`) and does
nothing else — the drift shows up one call site down, not in the primitive.

Sort itself is genuinely the clean all-client regime: correct for the app's
local-first, modest-cardinality surfaces, and the one piece of "the split"
`UnifiedTable` actually closes over.

The edge to respect: `onEndReached` (`:176-186`) wires **server-side
windowing** (load-older pages) into a table whose sort remains client-side.
Used together with `sortable` columns, that is the forbidden split — the
client reorders the loaded window while the header claims to reorder the
set. When a surface needs server windowing, either make its columns
non-sortable, mirror the server's order in the default sort and leave it
fixed, or lift sorting to the request (which `UnifiedTable` cannot express
today — sort state has no controlled `sortKey`/`onSort` props; see the gap
list in `docs/concepts/golden-paths/tables.md` §"structural gaps"). The
`onEndReached` hook itself follows the standard: pass `undefined` to detach
while a page is in flight, and it self-fires when the first window doesn't
fill the viewport.

## Known shortfalls against the standard (kept, not hidden)

- **No error state — CLOSED 2026-09-20**: the body used to have no failure
  branch, so a failed fetch that settled with zero rows rendered the *empty*
  state, telling callers "there is nothing" when the truth was "I couldn't
  look." That's fixed: `error`/`onRetry` props (`:117-128`) feed a fourth
  body branch — `error && data.length === 0` paints a panel `ErrorBanner`
  under the still-mounted column header (`:622-625`), and `error &&
  data.length > 0` keeps the rows and adds an inline banner above them
  (`:644-647`) rather than blanking a successful earlier load. Covered by
  `__tests__/UnifiedTableFailure.test.tsx`. Callers that were catching
  failures upstream and rendering their own failure surface to work around
  the gap can now delete that workaround and pass `error` straight through.
- **Untranslated fallback**: omitting `emptyTitle` falls back to the generic
  `shared.grid_no_data` — a last resort, not a default worth shipping.
- **Default comparator is stringly**: numeric and date columns sort wrong
  until a `sortFn` is supplied, and the default sort applies `reverse()` to a
  stable sort for `desc`, inverting tie order instead of tiebreaking on
  identity (`:526-532`).
- **Filter and search are unapplied chrome**: `UnifiedTable` renders the
  dropdown filter and the inline search box and forwards their changes to
  the caller (`:80-92`, `:346-429`), but never filters or searches `data`
  itself — see "Where the split sits today" above. A column that declares
  `filterOptions`/`searchable` without an upstream filter on `data` renders a
  fully functional-looking control that does nothing.
