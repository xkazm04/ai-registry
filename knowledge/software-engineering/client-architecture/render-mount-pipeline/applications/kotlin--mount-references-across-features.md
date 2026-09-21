---
layer: application
type: application
subject: render-mount-pipeline
technique: mount-references-across-features
stack: kotlin
status: forged
verified_on: 2026-09-14
verified_against: kotlin@1.9.22
---

# Mount references in RenderCore's MountDelegate

Witness: `facebook/litho` at commit `55e28e58930a53133620fd32406ec8c3a9116c0c`,
read from a local clone; version witness `gradle.properties:36`
(`KOTLIN_VERSION=1.9.22`). The counter and ownership sets are Kotlin in
`litho-rendercore`; the visibility window's acquire rule is the Java
`IncrementalMountExtension` in `litho-rendercore-incremental-mount`, cited here
because it is the principal client of the counter.

## The design record

`docs/mountextensions.md:6-11` records the motive: features such as animations,
incremental mount and visibility events were "built into the core of the
framework, without the possibility of turning them off", and are being extracted
into independent extensions. `:25-28` is the technique in one paragraph:
"Acquiring a mount reference means that the extension wants the item to be
mounted … the Animations Extension could acquire mount reference for items that
are not visible on screen if their parent host is animating. An extension can
only release mount references for items it previously acquired and it has no
information about whether other extensions have acquired an item." `:80`:
"When the total is positive … the item is mounted. If the total count reaches 0
… it will be unmounted."

## The counter

`litho-rendercore/.../MountDelegate.kt:39` holds `referenceCountMap`
(`LongSparseArray<Int>` keyed by render-unit id). Counting is enabled only when a
registered extension `is InformsMountCallback && canPreventMount()`
(`:66-69`, again at `:84-87`, recomputed on unregister at `:221-232`). With it
off, `maybeLockForMount` returns `true` for every node (`:395-398`) and
`incrementExtensionRefCount`/`decrementExtensionRefCount` return early
(`:502-505`, `:513-516`) — no veto, no bookkeeping. `hasAcquiredRef` is
`refCount > 0` (`:421-424`). `releaseAndUnmountRef` notifies unmount only on the
transition from locked to unlocked (`:484-490`).

## Ownership per feature, loud misuse

`litho-rendercore/.../extensions/ExtensionState.kt` keeps each extension's own
`layoutOutputMountRefs`. A duplicate acquire fails with
`check(!alreadyOwnedRef) { "Cannot acquire the same reference more than once." }`
(`:52-54`); releasing an unowned reference fails with
`check(ownedRef) { "Trying to release a reference that wasn't acquired." }`
(`:62-64`); `ownsReference` is the per-feature view (`:72`);
`releaseAllAcquiredReferences` releases only that feature's set (`:45-50`). The
shared counter adds its own guard: "Trying to decrement reference count for an
item you don't own." (`MountDelegate.kt:517-520`).

## Reapers

On a new layout, `IncrementalMountExtension.beforeMount` calls
`releaseAcquiredReferencesForRemovedItems` first (`IncrementalMountExtension.java:121`),
which releases every owned reference whose id is absent from the new input
(`:398-413`). On host unmount, `onUnmount` calls
`extensionState.releaseAllAcquiredReferences()` (`:367-373`), and
`MountDelegate.releaseAllAcquiredReferences` clears the map (`:492-500`).

## The window's acquire rule

`maybeAcquireReference` at `IncrementalMountExtension.java:442-464`:

```java
final boolean isMountable =
    isMountedHostWithChildContent(content)
        || Rect.intersects(localVisibleRect, incrementalMountOutput.getBounds())
        || isRootItem(id)
        || incrementalMountOutput.excludeFromIncrementalMount();
```

`isMountedHostWithChildContent` (`:703-705`) is `content instanceof Host &&
getMountItemCount() > 0` — the host-still-holding-children clause.
`initIncrementalMount` processes outputs from the last index backwards when
`RenderCoreConfig.processFromLeafNode` is set (`:424-431`), with the comment
"Unmount components from leaf node if necessary, then we might be able to release
Host because all children has been unmounted."

## Where the tree falls short

**Leaf-first order is a flag, off by default.** `RenderCoreConfig.kt:42-43`
declares `processFromLeafNode = false`. With it off, a reinitialising pass visits
a host before its children, sees children still mounted, keeps the host, and only
releases it on a later pass — one extra pass of a host mounted over nothing.
Harmless for correctness because of the host clause, but it is the ordering the
technique states, left as an opt-in.
