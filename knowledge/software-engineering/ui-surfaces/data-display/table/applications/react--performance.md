---
layer: application
type: application
subject: table
technique: performance
stack: react
verified_on: 2026-09-23
verified_against: react@19
applied: code
ab_verdict: better
proof: ab-paired
---

# Performance — a rung ladder in `goat` that collapsed to zero rungs, and what survived the collapse

`goat` is a Next.js 16 / React 19 ranking app whose collection lists run from
twenty items to a thousand-plus. This technique's earlier reading of `goat`
called it a runtime-selected rung ladder: the rung a surface sits on was a
function of the live item count, picked by two pure predicates reading one
config. That is no longer true of this repo. `CollectionPanel.tsx` does not
select a rung anymore — it does not select anything.
`src/app/features/Collection/components/CollectionPanel.tsx:95` reads, in
full: `const displayItems = filteredItems;`. No predicate is imported, no
threshold is checked, no branch exists. Twenty items and twenty thousand take
the same path.

And no user takes it. Re-read on 2026-09-23 at `goat` HEAD `b892a49`, the
panel has no render site: a `git grep` for `CollectionPanel` across tracked
source (excluding `SimpleCollectionPanel`) finds only the component's own file,
an error-boundary comment, a design-token comment and a barrel re-export
(`src/app/features/Collection/index.ts:9`) that nothing imports. Its last JSX
render site in tracked source was removed on 2025-11-23 (`abd9eb7`, from a
mobile match container). The lazy-load call was added on 2025-11-07
(`1c93d64`) and removed on 2026-03-15 (`78153fb`) — so the branch was
reachable for at most sixteen days, and its removal was an edit to a file
nobody had rendered for four months. The collection surface users actually
see is `SimpleCollectionPanel` → `VirtualizedCollectionGrid` (below).

What is transplantable now is the negative this repo has become, and it is
stronger than the version first written up here: a config-driven, two-rung
ladder didn't just leave its top rung unselected — it lost its remaining rung
too, while every piece that used to make the ladder look complete (the
config, the two predicates, the trigger component, a hook's own README
description) kept existing around the gap. Deleting a decision site turned
out to be the cheapest, least visible edit available, and this tree shows
what it looks like after that edit lands.

## What the rung-1 machinery lost

Three things this application used to cite as rung-1 machinery are gone or
orphaned:

- **The decision site.** `CollectionPanel.tsx`'s import list (`:1-18`) has no
  reference to `shouldUseLazyLoading`, `shouldUseVirtualization`, or
  `./constants/lazyLoadConfig`. There is no `useLazyLoading` variable, no
  threshold comparison, no lazy-loaded slice — `displayItems` is the
  unconditional `filteredItems` at `:95`, full stop.
- **The hook.** `hooks/useCollectionLazyLoad.ts` is not in `git ls-files`; it
  is gone from the tree. It survives only as prose describing a file that no
  longer exists: `src/app/features/Collection/README.md:23` still lists it in
  a directory-tree comment (`useCollectionLazyLoad.ts      # Lazy loading
  pagination`), `:135` still names it as the medium-collection strategy
  (`Medium: useCollectionLazyLoad → LazyLoadTrigger`), and `:151` still
  describes its initialization (`useCollectionLazyLoad initializes with
  pageSize=20`). The README was never touched when the hook was deleted.
- **The render site.** `components/LazyLoadTrigger.tsx` still exists and
  still reads the config's intersection-observer settings
  (`rootMargin = LAZY_LOAD_CONFIG.INTERSECTION_ROOT_MARGIN` at `:65`,
  `threshold: LAZY_LOAD_CONFIG.INTERSECTION_THRESHOLD` at `:70`), but nothing
  renders it. A repo-wide search for `<LazyLoadTrigger` returns three source
  hits, all inside `/** */` example comments (`LazyLoadTrigger.tsx:53`,
  `src/components/patterns/virtualization/index.ts:33`,
  `src/components/patterns/virtualization/useLazyLoad.ts:23`), plus two
  Markdown documents quoting it; the only live
  reference anywhere is a barrel re-export,
  `export { LazyLoadTrigger } from './components/LazyLoadTrigger';`, at
  `src/app/features/Collection/index.ts:15`.

The config and its two predicates are exactly where they were.
`src/app/features/Collection/constants/lazyLoadConfig.ts:8-63` is the same
object (`VIRTUALIZATION_THRESHOLD: 100`, `LAZY_LOAD_PAGE_SIZE: 20`,
`PREFETCH_COUNT: 10`, `INTERSECTION_ROOT_MARGIN: '200px'`,
`INTERSECTION_THRESHOLD: 0.1`, a `VIRTUAL_LIST` block with `ITEM_HEIGHT: 120`,
`OVERSCAN_COUNT: 5`, `MIN_BATCH_SIZE: 10`, and `SCROLL_DEBOUNCE_MS: 150`), and
`shouldUseVirtualization(itemCount)` (`:68-70`) and
`shouldUseLazyLoading(itemCount)` (`:75-77`) are still two pure,
individually testable predicates that do what their names say. A `git grep`
for `shouldUseLazyLoading` across tracked files now returns exactly three
lines: the definition, a barrel re-export
(`src/app/features/Collection/index.ts:45`), and an unrelated second
definition in another module (below). **None of the three is a call.**
Neither predicate has a single call site left in the app —
`shouldUseVirtualization` didn't have one when this application was last
checked either, but `shouldUseLazyLoading` did, and that call site is what
got removed.

## Rung 0 and rung 4's costs, built and unused

`src/lib/virtual/` is 2,118 lines across six modules (`InfiniteLoader.tsx`,
`PerformanceMonitor.tsx`, `ScrollPositionManager.ts`, `SkeletonLoader.tsx`,
`VirtualCollectionList.tsx`, `index.ts`) and it pays, on paper, exactly what
the technique says rung 4 costs.

`PerformanceMonitor.tsx:25-47` defines the measurement the technique's rung 0
asks for and most implementations skip: `fps`, `avgFps`, `minFps`, `maxFps`,
`frameTime`, `renderCount`, live `domNodes` (counted at `:211-213` with a
`querySelectorAll('*')` over the monitored subtree) and `jankFrames`,
incremented per frame over 16.67 ms at `:200`. Its verdict thresholds are
declared rather than eyeballed (`:65-70`: poor under 30 fps, fair under 50,
poor frame time over 33 ms, high DOM nodes over 100).

`ScrollPositionManager.ts` is the "scroll anchoring and restoration become
your code's problem" clause, implemented: a `sessionStorage`-backed record of
offset, timestamp, `firstVisibleIndex` and item count at save time (`:10-19`,
read at `:91`, written at `:108`) with a default 30-minute max age enforced on
restore (`:210-218`), so a stale position is skipped rather than applied to a
list that has since changed. `VirtualCollectionList.tsx:232-241` is the
windowed list itself, overscan defaulted to 5.

**None of it is referenced.** A `git grep` for `VirtualCollectionList`,
`ScrollPositionManager`, `PerformanceMonitor`, `InfiniteLoader`,
`SkeletonLoader`, or the path `lib/virtual` across the tracked tree returns
only the library's own files. The rung-0 harness that would have measured
whether rung 4 was needed, and the rung-4 cost payments that would have made
it safe, are both dead code — unchanged since this application was last
checked.

## The counter-finding: from a two-rung ladder to a zero-rung one

This is the part of the finding that got stronger. The version of `goat`
first cited here had a two-tier ladder in shipped code — no virtualization
branch, but a working lazy-load branch: `CollectionPanel.tsx` imported
`shouldUseLazyLoading`, called it, and rendered `LazyLoadTrigger` when it
returned true. That branch is gone. What remains in the file has zero tiers:
one unconditional render path, for every item count — in a component that,
as above, ships to nobody.

**The documentation still describes an integration that never shipped, and
some of what it describes has since stopped existing at all.**
`docs/lazy-loading-implementation.md:18-22` presents the three-strategy table
as fact ("< 20 items", "20-100 items", "> 100 items"). `:100-140` quotes an
"Integration in CollectionPanel" as if it were the code: a `useVirtualization`
memo, a call to `useCollectionLazyLoad`, an `itemsToRender` that branches on
both, and a `<VirtualizedCollectionList />` imported from
`components/VirtualizedCollectionList.tsx` — a file that has never been in
`git ls-files` in that directory. Two of the symbols this block treats as
current — `useCollectionLazyLoad` and `VirtualizedCollectionList` — are not
merely unwired now; one of them no longer exists anywhere in the tree.
`:195-201` reports before-and-after numbers for the path that does not run:
"~50 DOM nodes total", "Memory: Reduced by 60-80%", "Smooth 60fps". No
predicate produced them, no monitor recorded them, and the monitor that could
have is the unreferenced `PerformanceMonitor.tsx` above. The doc did not
drift when the code did — it was already describing code that had never
shipped, and the code has since drifted further away from the doc without
the doc moving at all.

**The vocabulary still has two owners that disagree, and one of them is now
completely unconsulted.**
`src/components/patterns/virtualization/useLazyLoad.ts:262-267` exports a
second function also named `shouldUseLazyLoading`, defaulting its threshold to
50, alongside a second `shouldUseVirtualization` at `:272-277`. The config
module's version still reuses `LAZY_LOAD_PAGE_SIZE` (20) as its threshold
(`lazyLoadConfig.ts:76`). Two modules, one name, thresholds 20 and 50 — and
now neither module's `shouldUseLazyLoading` has a caller anywhere in the
shipped panel, so the disagreement is not just invisible, it is moot: tuning
either one changes nothing a user will see.

**And the one live virtualization still makes the opposite decision, at
different line numbers than before.**
`src/app/features/Match/sub_MatchCollections/components/VirtualizedCollectionGrid.tsx:86-92`
is still the only `useVirtualizer` on a rendered path: rows chunked from a
flattened, sorted item list, `estimateSize: () => rowHeight + 8`,
`overscan: 3`, `measureElement` for real heights. Its consumer still renders
it unconditionally (`SimpleCollectionPanel.tsx:219-226`) — no threshold, no
predicate, rung 4 for a four-item list as readily as a thousand-item one.
Only one of the two features that used to answer "when do we window?" is
still mounted, and it is the one that never asked: rung 4 on every list, with
no count threshold in front of it. (Whether the groups it receives are
bounded upstream was not traced for this reading; the grid itself windows
whatever it is handed.)

## Reading the negative

The lesson is stronger than it was, not different. It already read: in a
config-driven ladder, the decision site is the only load-bearing part, and it
is the cheapest part to leave out. What happened here since is the
demonstration of exactly that. The decision site — an import and a call, two
lines — is precisely what disappeared when `CollectionPanel.tsx` was reworked,
while the config, the two predicates, the trigger component, the six-module
measurement library, and even a hook's description in a README all survived
the same change untouched. Deleting a decision site produces no compile
error and no broken import; it produces a smaller diff than deleting any of
the machinery it used to call, which is exactly why it is what got left out.

The 2026-09-23 reading adds the step before that one, and it is the larger
finding: the surface lost its render site first (2025-11-23) and its decision
site second (2026-03-15), and nothing in between noticed, because an
unmounted component still compiles, still type-checks, still takes polish
commits, and still reads like a shipped surface to anyone auditing it. This
document's earlier versions graded it as one; so did three consumer leads
filed on 2026-09-20, which cited its rung-3 hoist and its memo comparator as
evidence about a surface that "mounts every row" — it mounts none.

Five symptoms, in the order they become detectable, and all five are present
here: two exported functions sharing one name with different defaults; a
predicate with no call site; a hook a README keeps describing after its file
is gone; a document quoting integration code that names a file and a hook
that have never coexisted in the tracked tree; and a component whose only
references are its own barrel and some prose. The first is a lint-able
condition, the second and fifth are dead-export sweeps, the third is a doc
check against `git ls-files`, and the fourth is what a reader trusts when the
others go unchecked. For an auditor the fifth comes first: **establish that
a surface has a render site before grading which rung it is on.**

The rule worth transplanting out of this: **put the rung selection where it
cannot be skipped, and where it cannot be quietly deleted either.** A list
component that reads its own item count and picks its own strategy has one
decision site that every caller passes through and that any change to the
component has to touch on purpose. A config module plus predicates that a
container calls has a decision site a refactor can remove by accident,
because removing it looks like simplification — fewer branches, a shorter
render function, a smaller diff, a change that reviews clean. If the
predicates must live apart from the component, the container that stops
calling them should not compile. An unread export is the same failure as an
unread config, and a deleted call site is the same failure wearing a green
build.

## One rung-3 detail worth flagging

`VirtualizedCollectionGrid.tsx:134` keys each windowed row
`row-${virtualRow.index}` while the items inside it are keyed by identity
(`:147`, `key={flatItem.item.id}`). The index key is survivable only while
the row wrapper holds no state of its own — but the rows are chunks of a list
whose order changes when the consensus sort is toggled (`:65-80`), so the day
a row gains an expansion, an entrance animation or a measured height cache, it
will inherit the previous occupant's. Recycling is reuse, and the row wrapper
is the one element in this component that positional keying still reaches.

The cards inside those rows show the prop-level half of the same invariant,
and on the live path. `ConfigurableCollectionItem` is a `memo` (`:197`) with a
hand-written comparator (`src/app/features/Collection/components/ConfigurableCollectionItem.tsx:662-685`)
that compares `index` (`:673`) and `onClick` among twenty props. The grid
passes `index={flatItem.globalIndex}` and
`onClick={onItemClick ? () => handleItemClick(flatItem.item) : undefined}`
(`VirtualizedCollectionGrid.tsx:153-156`). Both fail the technique's test.
The index is a position, so every card after an insertion or a consensus
resort compares unequal — and on this path it buys nothing, because the
match view's config turns off both consumers of it (`MATCH_VIEW_CONFIG`,
`:138-143`: `showRankBadge: false`, `showKeyboardHandles: false`, which gate
the rank-badge animation index at `:576` and the stagger delay at `:603`).
The callback is the stronger defeater: both live callers pass an
`onItemClick` (`SimpleMatchGrid.tsx:591`, `AwardList.tsx:438`), so the inline
closure is a new function on every grid render and the comparator returns
false for every mounted card every time. The memo is present; it does not
hold.

## Applied: one stable handler, and the two upstream handlers that undid it

The change, at `goat` `9e34aaf` on 2026-09-23, did what the technique says.
The card's `onClick` now takes the item (`(item) => void`), and the grid hands
every card the one `handleItemClick` that already existed as a `useCallback`
(`VirtualizedCollectionGrid.tsx:156`). The widened type is
backward-compatible, because a `() => void` is still assignable. The card
never calls the prop anyway. It reads only whether the prop is set, for its
aria label. The click itself lands on the wrapper `div`, which the comparator
never sees.

**The seam was picked because it could falsify the rule.** The rule says
"hand rows one stable callback". The question was whether a stable callback at
the row's call site is enough when the handler it wraps comes from further up.
It was not enough. Both live callers defeated it:

- `AwardList.tsx:438` passed `onItemClick={(item) => setSelectedItem(item)}`,
  so every render of the award list built a new handler. `handleItemClick`
  depends on that handler, so it was rebuilt too, and every card re-rendered.
- `SimpleMatchGrid.tsx`'s `handleCollectionItemClick` depended on
  `[mobileSelectedItem, ...]`. So it changed identity on every selection, and
  selecting one card re-rendered all of them.

So the shipped change fixed both. The award list passes the state setter,
which is stable by React's guarantee. The match grid reads the selection at
click time through `useGridStore.getState()` and depends only on the setter.

The instrument was a jsdom harness kept outside the tree. `goat` has no unit
runner and no DOM library. The harness mounts the real grid, so the real card
and its hand-written comparator run. It counts one kind of render: a card that
was already mounted, rendered again with a new props object, which means the
comparator returned false. Renders driven by the card's own state are
excluded. The parent is a replica, and its upstream handler takes each live
caller's shape. The input was fixed: 60 items in 2 groups, 6 columns, and 30
cards mounted. Each arm ran 3 times, and all 3 runs gave the same numbers.

| Scenario | A, tree as it was | B, as shipped |
| --- | --- | --- |
| 5 parent renders that change no card | 150 | 0 |
| 5 parent renders, fresh but equal item objects each render | 150 | 0 |
| select one card | 30 | 1 |
| scroll down one row (30 cards stay mounted) | 66 | 0 |
| move the selection, selection-dependent upstream handler | 30 | 30 |
| 5 parent renders, inline upstream handler | 150 | 150 |

The first four rows are the target. The last two are the falsifier: they are
the upstream shapes the two callers had before this change. In the last two
rows, B's grid-level fix alone buys nothing.

The floor held in both arms:

- Clicking three card wrappers delivered those three items, in order.
- Every mounted card kept its clickable aria label.
- The one card whose selection changed still re-rendered.
- `tsc --noEmit` reported no error in any touched file. The same run reported
  39 errors in 15 files that this change did not touch.

ESLint could not run, because the config imports `eslint-plugin-storybook`,
which is not installed.

What this adds to the technique: a stable callback has to be stable all the
way to where the handler is first created. A `useCallback` at the row's call
site takes the identity of every handler it closes over. So an inline arrow,
or a closure over the current selection, two components up, makes the
call-site fix decoration again, just as the inline closure did at the row.
The fresh-items row shows the reverse. Both callers rebuild their groups
inline on every render (`backlogGroupsToItemCategories(groups)`), but this
did not defeat the memo. The comparator checks the item's fields, not its
identity.

What the change does not do:

- The positional `index` prop is still passed. On this path a resort moves
  most cards into a different row wrapper, and the wrappers are keyed
  `row-${index}`, so those cards remount whatever `index` does. Dropping
  `index` without fixing the row key would buy little. This was not measured.
- The harness's parent is a replica, not `AwardList` or `SimpleMatchGrid`
  mounted with their stores.
- jsdom has no layout, so the virtualizer's measurements were stubbed.
