---
source: https://github.com/facebook/litho
commit: 55e28e58930a53133620fd32406ec8c3a9116c0c
run_id: intake-litho
date: 2026-09-14
status: DISPATCHED (forge worker, same session, run intake-litho)
bundle: software-engineering
home: client-architecture/render-mount-pipeline
---

# XL spec - a render and mount pipeline the product owns (from a declarative UI runtime), 2026-09-14

Source: `https://github.com/facebook/litho`, swept at commit `55e28e58` (2025-07-21, the
tree's last commit). Class: first-party system repository, design-deep. Clone for this
run: `C:/t/intake-litho` (deleted at Phase 9; a later wave re-clones at the pinned commit
and every anchor below is stable against it).

## Why this is XL and not a set of techniques

The design record in `librarian/sources/2026-09-14-litho.md` holds ten decisions from one
system - a retained UI runtime that resolves a component tree, lays it out off the frame
thread, and mounts a flat list of render units into host objects. **Four have no subject
in this bundle modelling their forces** (D2 preemptible shared computation, D3 blueprint
then mount, D5 mount references across features, D7 recycle by content type) and **five
share one home-if-new** (D2, D3, D4, D5, D7). Both routing clauses fire on the same
cluster, so the subject exists by construction (Phase 4 XL trigger), not by preference.

The neighbours each own a slice and each says, in its own words, that it stops short:

- `ui-surfaces/data-display/table/techniques/performance.md` - rung 4 windows **rows**
  with overscan and names what windowing takes away; it has no model for which of
  several features gets to keep an element mounted, and no granularity below the row.
- `ui-surfaces/data-display/canvas-graph/techniques/render-budget.md` - culling to the
  world rectangle and mounting in waves under a frame budget; per-surface, no mount layer.
- `ui-surfaces/shell-and-navigation/chat-transcript/techniques/immutable-model-cached-layout.md`
  - freezes the model and keys a per-view layout cache; its own boundary says a
  layout-managed toolkit inverts the second half and "the platform's own reconciliation
  be the cache". This subject is what sits under that sentence when the product IS the
  toolkit.
- `backend-platform/work-execution/concurrency-guards/techniques/single-flight-primitives.md`
  and `client-architecture/client-fetch-cache/techniques/in-flight-dedup.md` - dedupe
  and join. Neither has a waiter that cannot afford to wait (D2).
- `ui-surfaces/feedback-and-style/accessibility/techniques/hidden-but-mounted-inertness.md`
  - how a mounted-but-hidden subtree is made inert. Not who decides mountedness.

## The subject

**Placement:** `software-engineering` / category `client-architecture` (flat, 8 subjects,
cap 10 - `taxonomy.json` read 2026-09-14; appending makes 9). Path
`knowledge/software-engineering/client-architecture/render-mount-pipeline/`. Append the
slug to the category's `subjects` list; do not reorder. Slug is a proposal - override it
with a reason if the golden path finds a better name.

**Stated job (draft for the golden path's opening):** applies whenever **code, not the
platform, decides which elements exist** - a virtualized list or grid, a canvas or
terminal renderer, a native UI runtime, an editor's display list. It owns the pipeline
from an immutable description to mounted host objects: what the layout phase emits, when
a node earns a host object, who may keep an element mounted, how mount work is bounded
per frame, and how host objects are reused. It does **not** own what a surface shows
(the `ui-surfaces` subjects), the data a view fetches (`client-fetch-cache`), or state
ownership (`client-state`).

## Proposed techniques, each with the decision rule it must carry

1. **`blueprint-then-mount`** (D1 + D3). Layout emits an immutable, flat list of render
   units with resolved bounds and no reference to host objects; mount is a separate pass
   that only places them. Containers that merely arrange vanish at mount. **A node is
   promoted to its own host object only when it declares a host-only capability** - a hit
   target, an accessibility node, an invalidation or clip boundary, a transform/alpha
   layer - and the promotion is derived from declared capabilities, never a hand-set flag
   the author must remember. Anchors: `docs/architecture-overview.md:29-33` (create,
   measure, collect-then-discard), `docs/view-flattening.md:13-21`,
   `litho-core/src/main/java/com/facebook/litho/CommonProps.kt:156-161` (the wrap
   predicate), `docs/asynchronous-layout.md:65-67` (layout as a pure function is what
   lets it leave the frame thread). Rejects: laying out the host tree itself, which
   binds layout to the thread that owns host objects.

2. **`mount-references-across-features`** (D5). Mountedness is a **reference count per
   render unit**. Each feature that has an opinion - the visibility window, a running
   transition, focus, a gesture in flight - acquires and releases its own references; an
   item is mounted iff its count is at least one; a feature may release only references
   it acquired and cannot see anyone else's. When a new layout arrives, references held
   for units no longer in the tree are released before mounting. **Forces:** features
   disagree about whether an off-screen element must exist (a transition needs its
   leaving element; the window wants it gone), and a single boolean owned by one of them
   silently breaks the others. Anchors: `docs/mountextensions.md:19-28,79-80`,
   `litho-rendercore/src/main/java/com/facebook/rendercore/MountDelegate.kt:39,66-69`
   (counting is enabled only if some feature can prevent mount),
   `litho-rendercore-incremental-mount/.../IncrementalMountExtension.java:398-413`
   (release for removed items), `:442-464` (acquire rule: intersects, root, excluded, or
   a host still holding children). Rejects: the monolithic mount state the doc says was
   being dismantled (`mountextensions.md:6-11`).

3. **`edge-sorted-incremental-mount`** (D4, D6 folded in). Mount and unmount at **leaf
   granularity**, not item granularity - an element leaves even when its container is
   still partly visible (`docs/deep-dive/incremental-mount.md:10-14`). Keep two index
   lists sorted by leading edge and by trailing edge; seed two cursors by binary search;
   each scroll step advances the cursors across only the elements whose edges crossed,
   so work is proportional to change, not to tree size (`IncrementalMountExtension.java:
   494-608, 630-691`). Any movement on the cross axis re-initializes from scratch
   (`:268-276`). Nested hosts inside a mounted unit must be told the parent's visible
   bounds changed even when nothing of theirs was newly mounted (`:600-609`). A per-unit
   exclusion opts a unit out entirely (`ExcludeFromIncrementalMountBinder.java`). Gap
   premount - acquire the next elements past each edge in idle time before the next
   frame deadline minus a buffer, then stop - is a section here, not a technique
   (`IncrementalMountGapWorker.kt:46-109`); its boundary with `render-budget`'s mount
   waves must be stated. **Note the interaction the tree carries:** when gap premount is
   on, the window stops releasing (`:461, 514, 582`) - premount trades memory for frame
   time and the technique must say so.

4. **`recycle-by-content-type`** (D7). Pool host objects **by the leaf content type**
   (a text drawable, an image view), not by the composite item type a list declares;
   any text can recycle into any other text, so a surface with many item types stops
   allocating on the first appearance of each (`docs/recycling.mdx:17-42`). Pools are
   scoped to the lifetime of the context that created them and destroyed with it;
   a pool is bounded and a rejected release calls a discard hook; listeners are stripped
   before release; preallocation fills a pool off the critical path
   (`litho-rendercore/src/main/java/com/facebook/rendercore/MountItemsPool.kt:86-206`).
   The layout-before-mount split is the precondition - a host tree cannot recycle below
   the item because it has already instantiated everything before positions are known.

5. **`mount-binders-versus-attach-binders`** (D8). A render unit's binding is split into
   **mount binders** (bind content; expensive; survive detach) and **attach binders**
   (listeners, dynamic values; cheap; run on attach/detach), and every binder answers
   should-update against the previous unit and layout data, so an update re-runs only
   the binders whose inputs moved and a unit whose binders all decline is not remounted
   (`RenderUnit.kt:31-44,58-62`; `docs/architecture-overview.md:47-48` mount diffing).
   Fixed binders sit in a fixed order per unit type, capped (`RenderUnit.kt:77-79`).

6. **`preempt-and-continue-shared-computation`** (D2). Equivalent layout computations
   are deduplicated into one shared future with a waiter count, released when the
   count reaches zero (`litho-core/src/main/java/com/facebook/litho/TreeFuture.kt:
   532-594`). **A deadline-bound waiter (the frame thread) never blocks on work started
   elsewhere**: it marks the running computation interrupted, the running thread returns
   a partial result, and the frame thread continues from that partial result
   (`:285-293, 370-403`). A background synchronous waiter must pin the future
   non-interruptible before joining, or it waits on a result that will never come
   (`:140-166`). While the frame thread does wait, the running thread's priority is
   raised and restored only if nobody else changed it meanwhile (`:294-369`). A released
   future answers with a named reason, never a bare null (`:431-436, 497-502`). The
   capability shipped hard enough that the opt-out was deleted
   (`CHANGELOG.md:74`). **Boundary:** `single-flight-primitives` lists five second-caller
   policies; this is a sixth that list does not carry, and the golden path should say
   that in prose. Do **not** edit that file - the run banked the amendment as untriaged
   (it would rewrite a standing sentence).

## Boundaries the subject must NOT absorb

- Row-level windowing economics, pagination-first, and what windowing breaks - `table/performance`.
- Canvas culling, zoom level of detail, wave mounting of a first frame - `canvas-graph/render-budget`.
- Frozen message models and per-view layout caches - `chat-transcript/immutable-model-cached-layout`.
- How hidden content is made inert - `accessibility/hidden-but-mounted-inertness`.
- Fetch-ahead by viewport proximity (the source's "working ranges") - `client-fetch-cache/prefetch-and-defer`.
- Generic dedupe/join semantics - `concurrency-guards/single-flight-primitives`, `client-fetch-cache/in-flight-dedup`.

## Web budget (primaries, max 3)

- The React Native new-architecture page on view flattening (independent convergence on
  D3, including the un-flatten triggers) - reactnative.dev.
- A retained rendering pipeline document from a second framework (Flutter's rendering
  pipeline or an equivalent) for D1/D4 convergence.
- Only if needed: the TanStack Virtual `rangeExtractor` documentation, the userland
  acquire hook a web virtualizer exposes for D5 - it is the fleet's actual seam
  (personas, goat).

Proper nouns stay out of the upper layers: the framework, its company, its widgets, the
host OS view classes, and the virtualizer library are all application-only vocabulary.

## Open questions the drafter decides

1. Is D1 its own technique or the golden path's spine? (Recommendation: spine; keep six
   techniques only if `blueprint-then-mount` carries the promotion rule, else five.)
2. Does `preempt-and-continue-shared-computation` belong here or in `concurrency-guards`?
   Decide from the stage: it was forced by a frame deadline. Argue it either way.
3. Is `mount-binders-versus-attach-binders` a mechanism or a boundary of memoization?
   If a boundary, fold it into `blueprint-then-mount` and say why.

## Overrides

(Filled in by the director after review.)
