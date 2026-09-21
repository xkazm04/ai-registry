---
layer: application
type: application
subject: render-mount-pipeline
technique: recycle-by-content-type
stack: kotlin
status: forged
verified_on: 2026-09-14
verified_against: kotlin@1.9.22
---

# MountContentPools in RenderCore

Witness: `facebook/litho` at commit `55e28e58930a53133620fd32406ec8c3a9116c0c`,
read from a local clone; version witness `gradle.properties:36`
(`KOTLIN_VERSION=1.9.22`). The pools are the Kotlin `object MountContentPools`
in `litho-rendercore/src/main/java/com/facebook/rendercore/MountItemsPool.kt`
(the file name predates the rename); allocators are `ContentAllocator.kt` beside
it.

## Why content type, and the precondition

`docs/recycling.mdx:17-20` names the item-type problem: with many view types
"there is a bigger chance that the view coming in the viewport … is a view that
the RecyclerView is displaying for the first time", allocated "in the same 16ms
slot in which RecyclerView also has to bind, measure and layout." `:32-34` gives
the precondition: "by the time we need to put a new View of the RecyclerView on
screen, we already know what the content of that item will be and exactly its
position … This is not possible with traditional Android Views since the layout
computation operates on the complete view tree." `:41`: "you can recycle any
piece of text in your list for any other piece of text."

## The key

`ContentAllocator.getPoolKey()` returns `javaClass` by default
(`ContentAllocator.kt:39-41`); pools are looked up by that key per context
(`MountItemsPool.kt:235-247`). `RenderUnit.kt:25-30`: content "will be
automatically recycled by RenderCore based on their concrete type."

## Scoped to the creating context

Pools live in `mountContentPoolsByContext` (`:58`). On first use for a context,
the root context (activity, application or service, `:285-294`) is checked
against `destroyedRootContexts` and **no pool is returned** if it is already
destroyed (`:225-228`); otherwise a lifecycle observer or activity callback is
registered (`:229`, `:296-317`). `onContextDestroyed` clears the context's pools
and any wrapper contexts of it, then records it as destroyed (`:328-353`).
Narrower scopes: `PoolScope.LifecycleAware` releases on its lifecycle's destroy,
and `PoolScope.ManuallyManaged` on an explicit call (`:575-604`).

## Bounded, with a discard path

The default size is `DEFAULT_MAX_PREALLOCATION = 3` per allocator
(`ContentAllocator.kt:60`, `:93`), overridable per allocator. `recycle`
(`MountItemsPool.kt:124-161`) calls `onContentDiscarded` when there is no pool
(`:143-147`) and when `pool.release` returns false (`:154-160`). A pool's
`clear()` dispatches the same hook for every pooled item
(`:550-564`, wired at `:243-244`).

## Preallocation and opting out

`prefillMountContentPool` stops at the first rejected release
(`:182-206`, the `break` at `:201-203`); `DefaultContentPool.maybePreallocateContent`
allocates only while `currentPoolSize < maxPoolSize` (`:537-544`). A content type
opts out through its `poolingPolicy`: `canAcquireContent` (`:92`) and
`canReleaseContent` (`:136`). `isPoolingDisabled` switches pooling off globally
"for debugging, testing, and other use cases" (`:77-78`, checked at `:218`).

## Where the tree falls short

**Listener stripping is off by default.** `recycle` removes host listeners only
`if (RenderCoreConfig.removeComponentHostListeners)` (`:130-134`), and
`RenderCoreConfig.kt:48-49` declares it `false`. Beside it sits a debug-time
`MountItemPoolsReleaseValidator`, enabled by `enableItemsReleaseValidation`
(`:438-454`) and invoked on release (`:149-152`), which "verifies if the content
is released with listeners to the pool." A validator for the leak with the fix
behind a default-off switch is the technique's absent-guard case exactly.
**The bound has no derivation.** `3` is one constant for every content type, with
nothing beside it saying what churn it was sized against.
