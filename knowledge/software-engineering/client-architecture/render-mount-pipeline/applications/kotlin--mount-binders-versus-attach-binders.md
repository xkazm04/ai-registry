---
layer: application
type: application
subject: render-mount-pipeline
technique: mount-binders-versus-attach-binders
stack: kotlin
status: forged
verified_on: 2026-09-14
verified_against: kotlin@1.9.22
---

# RenderUnit binders and MountState updates

Witness: `facebook/litho` at commit `55e28e58930a53133620fd32406ec8c3a9116c0c`,
read from a local clone; version witness `gradle.properties:36`
(`KOTLIN_VERSION=1.9.22`). Both files are Kotlin in
`litho-rendercore/src/main/java/com/facebook/rendercore/`: `RenderUnit.kt` and
`MountState.kt`.

## Two clocks

`RenderUnit`'s constructor takes `fixedMountBinders`, `optionalMountBinders` and
`attachBinders` (`RenderUnit.kt:37-44`); the class comment says a unit declares
"how it intends to bind data returning Binders from its mountUnmountFunctions
callback or from the attachDetachFunctions callback" (`:31-32`). Optional mount
binders are for "generic functionality (e.g. accessibility)" (`:115-118`); attach
binders for "generic functionality (e.g. Dynamic Props)" (`:150-153`).

In `MountState`, mount binders run when content is mounted
(`unit.mountBinders(...)` at `MountState.kt:835`) and are undone on unmount
(`:840-848`). Attach binders run in `bindRenderUnitToContent` (`:850-857`) and are
undone in `unbindRenderUnitFromContent` (`:859-866`). `detach()` walks every
bound item and undoes only the attach clock (`:340-365`) — content stays mounted
and bound while the host is detached.

Every bind returns bind data that the matching unbind receives
(`BinderWithContext` at `:705-730`; stored via `bindData.set…` and passed back via
`bindData.remove…` throughout). Unbinding iterates `indices.reversed()`
(`:306`, `:349`, `:415`).

## The identical-unit short circuit and bounds

`updateMountItemIfNeeded` (`MountState.kt:868-929`) calls
`shouldUpdateMountItem`, which is
`currentRenderUnit !== renderUnit || !isEqualOrEquivalentTo(currentLayoutData, newLayoutData)`
(`:931-939`). Only then does it call `updateBinders`; otherwise it binds attach
binders if the item is unbound (`:912-914`). Bounds are applied unconditionally
(`:917-923`), with the comment "the mounted item might have the same size and
content but a different position."

## Per-binder should-update and the update order

`updateBinders` (`RenderUnit.kt:435-662`) is commented step by step: resolve
fixed binders to update (`:455`), diff optional and attach binders (`:470-486`),
"Unbind all attach binders which should update (only if currently attached)"
(`:491-523`), "Unbind all optional and fixed mount binders which should update"
(`:525-578`), "Rebind all fixed and optional mount binders which did update"
(`:580-631`), "Rebind all attach binders which did update" (`:633-661`).
`resolveBindersToUpdate` (`:855-908`) binds binders new to the unit, unbinds
binders absent from it, and memoises each `shouldUpdate` result for the second
loop. `BinderWithContext.shouldUpdate` receives current and new model and layout
data (`:710-715`).

## Fixed and keyed binders

"Fixed mount binders are binders that are always there for a given RenderUnit
type, and they're always in the same order" (`:58-60`). They are compared by index
and recorded in a `Long` bitmask (`resolveFixedMountBindersToUpdate`, `:820-848`,
`or (0x1L shl i)` at `:844`), and construction fails past
`MAX_FIXED_MOUNT_BINDERS_COUNT` (`:76-79`), declared as `64` at `:771`. Optional
and attach binders are keyed by `binder.key` (default `ClassBinderKey(javaClass)`,
`:728-729`); `addBinder` removes an existing binder of the same key and appends
the new one (`:788-814`).

## Where the tree falls short

**The cap's derivation is not written.** `MAX_FIXED_MOUNT_BINDERS_COUNT = 64` at
`:771` carries no comment tying it to the `Long` mask at `:829-844`. Widening or
narrowing the mask type would leave a cap that no longer matches it, and nothing
beside the constant says so. **Keyed replacement moves the binder.** `addBinder`
appends the replacement at the end (`:788-790`) instead of keeping it in place, so
a redeclared optional binder changes its position in bind order.
