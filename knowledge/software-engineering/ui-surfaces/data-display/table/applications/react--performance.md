---
layer: application
type: application
subject: table
technique: performance
stack: react
verified_on: 2026-09-21
verified_against: react@19
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
  renders it. A repo-wide search for `<LazyLoadTrigger` returns three hits,
  all inside `/** */` example comments (`LazyLoadTrigger.tsx:53`,
  `src/components/patterns/virtualization/index.ts:33`,
  `src/components/patterns/virtualization/useLazyLoad.ts:23`); the only live
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
returned true. That branch is gone. What ships today has zero tiers: one
unconditional render path, for every item count.

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
`src/app/features/Match/sub_MatchCollections/components/VirtualizedCollectionGrid.tsx:86-91`
is still the only `useVirtualizer` on a rendered path: rows chunked from a
flattened, sorted item list, `estimateSize: () => rowHeight + 8`,
`overscan: 3`, `measureElement` for real heights. Its consumer still renders
it unconditionally (`SimpleCollectionPanel.tsx:219-226`) — no threshold, no
predicate, rung 4 for a four-item list as readily as a thousand-item one.
Two features of one app still answer "when do we window?" independently: one
used to have a config nobody consulted for the small case and no question
asked for the large case; now the small case has no config-driven answer at
all, and the large case still has no question asked.

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

Four symptoms, in the order they become detectable, and all four are present
here: two exported functions sharing one name with different defaults; a
predicate with no call site; a hook a README keeps describing after its file
is gone; and a document quoting integration code that names a file and a hook
that have never coexisted in the tracked tree. The first is a lint-able
condition, the second is a dead-export sweep, the third is a doc check
against `git ls-files`, and the fourth is what a reader trusts when the first
three go unchecked.

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
