---
layer: application
type: application
subject: table
technique: performance
stack: react
verified_on: 2026-08-24
verified_against: react@19
---

# Performance — a runtime-selected rung ladder in `goat`, and the ladder that got built three times

`goat` is a Next.js 16 / React 19 ranking app whose collection lists run from
twenty items to a thousand-plus. Its contribution to this technique is a real
one: it treats the ladder's rung as a **runtime** decision keyed on the live
item count rather than a design-time choice, with every threshold in one named
config and two pure predicates as the only decision sites.

Its second contribution is the more transplantable of the two, and it is a
negative: the ladder is implemented three times, with disagreeing thresholds,
and its top rung has no call site at all. That failure is what a config-driven
ladder actually fails as, and it is worth more to a reader than the config
object is.

## The decision, as designed

`src/app/features/Collection/constants/lazyLoadConfig.ts:8-63` is the whole
policy in one object: `VIRTUALIZATION_THRESHOLD: 100`, `LAZY_LOAD_PAGE_SIZE: 20`,
`PREFETCH_COUNT: 10`, `INTERSECTION_ROOT_MARGIN: '200px'`,
`INTERSECTION_THRESHOLD: 0.1`, a `VIRTUAL_LIST` block (`ITEM_HEIGHT: 120`,
`OVERSCAN_COUNT: 5`, `MIN_BATCH_SIZE: 10`) and `SCROLL_DEBOUNCE_MS: 150`. Two
pure predicates read it: `shouldUseVirtualization(itemCount)` (`:68-70`) and
`shouldUseLazyLoading(itemCount)` (`:75-77`). Rung 1's machinery is complete —
`hooks/useCollectionLazyLoad.ts:106-108` takes its page size and prefetch count
from the config, `components/LazyLoadTrigger.tsx:64-69` takes the observer's
root margin and threshold from it.

That is the good idea: the rung a surface sits on is a function of the data it
was handed this render, not a decision frozen when the component was written.

## Rung 0 and rung 4's costs, built and unused

`src/lib/virtual/` is 2,183 lines across six modules and it pays, on paper,
exactly what the technique says rung 4 costs.

`PerformanceMonitor.tsx:25-46` defines the measurement the technique's rung 0
asks for and most implementations skip: `fps`, `avgFps`, `minFps`, `maxFps`,
`frameTime`, `renderCount`, live `domNodes` (counted at `:211-213` with a
`querySelectorAll('*')` over the monitored subtree) and `jankFrames`,
incremented per frame over 16 ms at `:200`. Its verdict thresholds are declared
rather than eyeballed (`:65-70`: poor under 30 fps, fair under 50, poor frame
time over 33 ms, high DOM nodes over 100).

`ScrollPositionManager.ts` is the "scroll anchoring and restoration become your
code's problem" clause, implemented: a `sessionStorage`-backed record of offset,
timestamp, `firstVisibleIndex` and item count at save time (`:10-19`, read at
`:91`, written at `:108`) with a default 30-minute max age enforced on restore
(`:210-218`), so a stale position is skipped rather than applied to a list that
has since changed. `VirtualCollectionList.tsx:233-242` is the windowed list
itself, overscan defaulted to 5.

**None of it is referenced.** A grep for `VirtualCollectionList`,
`ScrollPositionManager`, `PerformanceMonitor`, `InfiniteLoader`, `SkeletonLoader`
or the path `lib/virtual` across the entire tree returns only the library's own
files. The rung-0 harness that would have measured whether rung 4 was needed,
and the rung-4 cost payments that would have made it safe, are both dead code.

## The counter-finding: a two-rung ladder wearing three implementations

**The top rung is never selected.** `CollectionPanel.tsx:15` imports
`shouldUseLazyLoading` and nothing else; the strategy choice is
`useLazyLoading = shouldUseLazyLoading(filteredItems.length)` (`:80-83`), and
`displayItems` is either the lazy slice or the whole array (`:92-99`), with the
observer trigger rendered at `:310-319`. There is no virtualization branch.
`shouldUseVirtualization` has no call site anywhere in the app — the only
reference outside its own module is a barrel re-export at
`src/app/features/Collection/index.ts:47`. The three-tier ladder is a two-tier
ladder in shipped code.

**The vocabulary has two owners that disagree.**
`src/components/patterns/virtualization/useLazyLoad.ts:261-266` exports a
second function also named `shouldUseLazyLoading`, defaulting its threshold to
50, alongside a second `shouldUseVirtualization` at `:271-276`. The config
module's version reuses `LAZY_LOAD_PAGE_SIZE` (20) as the threshold
(`lazyLoadConfig.ts:76`). Two modules, one name, thresholds 20 and 50 — and
because neither is wrong on its face, the disagreement is invisible until
somebody tunes one of them.

**The documentation describes the version that was never wired.**
`docs/lazy-loading-implementation.md:18-22` presents the three-strategy table as
fact ("< 20 items", "20-100 items", "> 100 items"). `:100-140` quotes the
integration as if it were the code: a `useVirtualization` memo, an
`itemsToRender` that branches on it, and a `<VirtualizedCollectionList />`
imported from `components/VirtualizedCollectionList.tsx` — a file that is not in
that directory. `:186-198` then reports before-and-after numbers for the path
that does not run: "~50 DOM nodes total", "Memory: Reduced by 60-80%", "Smooth
60fps". No predicate produced them, no monitor recorded them, and the monitor
that could have is in the unreferenced library above.

**And the one live virtualization made the opposite decision.**
`src/app/features/Match/sub_MatchCollections/components/VirtualizedCollectionGrid.tsx:68-73`
is the only `useVirtualizer` on a rendered path: rows chunked from a flattened,
sorted item list, `estimateSize: () => rowHeight + 8`, `overscan: 3`,
`measureElement` for real heights. Its consumer renders it unconditionally
(`SimpleCollectionPanel.tsx:181-188`) — no threshold, no predicate, rung 4 for
a four-item list as readily as a thousand-item one. Two features of one app
answered "when do we window?" independently, one with a config nobody consults
and one with no question asked.

## Reading the negative

The lesson is not "their thresholds were wrong". It is that in a config-driven
ladder, the **decision site is the only load-bearing part**, and it is the
cheapest part to leave out — the config, the predicates, the windowed list and
the measurement harness can all be written, reviewed and merged while the two
lines that consult them are quietly never added. Everything else looks like
progress.

Three symptoms, in the order they become detectable, and all three are here:
two exported functions with one name and different defaults; a predicate with
no call site; a document quoting integration code that does not compile against
the tree. The first is a lint-able condition, the second is a dead-export
sweep, and the third is what a reader trusts when the first two go unchecked.

The rule worth transplanting out of this: **put the rung selection where it
cannot be skipped.** A list component that reads its own item count and picks
its own strategy has one decision site that every caller passes through; a
config module plus predicates that each container must remember to consult has
as many decision sites as there are containers, and a ladder whose rungs are
opt-in converges on the bottom rung. If the predicates must live apart from the
component, the container that ignores them should not compile — an unread
export is the same failure as an unread config.

## One rung-3 detail worth flagging

`VirtualizedCollectionGrid.tsx:116` keys each windowed row `row-${virtualRow.index}`
while the items inside it are keyed by identity (`:129`,
`key={flatItem.item.id}`). The index key is survivable only while the row
wrapper holds no state of its own — but the rows are chunks of a list whose
order changes when the consensus sort is toggled (`:48-64`), so the day a row
gains an expansion, an entrance animation or a measured height cache, it will
inherit the previous occupant's. Recycling is reuse, and the row wrapper is the
one element in this component that positional keying still reaches.
