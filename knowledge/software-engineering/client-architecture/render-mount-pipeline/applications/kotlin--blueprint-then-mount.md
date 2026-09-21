---
layer: application
type: application
subject: render-mount-pipeline
technique: blueprint-then-mount
stack: kotlin
status: forged
verified_on: 2026-09-14
verified_against: kotlin@1.9.22
---

# Layout output and host-view promotion in Litho

Witness: `facebook/litho` at commit `55e28e58930a53133620fd32406ec8c3a9116c0c`
(2025-07-21, the tree's last commit), read from a local clone. The version
witness is `gradle.properties:36` (`KOTLIN_VERSION=1.9.22`); the promotion logic
cited below is Kotlin in `litho-core`. Litho is a declarative UI runtime for
Android that lays out off the main thread with Yoga and mounts the result into
`LithoView`, a `ViewGroup`.

## Layout is a pure function; mount consumes a flat list

`docs/asynchronous-layout.md:65` states the precondition: "A `Component` is an
immutable object that contains all the inputs for the layout function … If they
weren't, we would lose the property of having layout as a 'pure function'."
`docs/architecture-overview.md:30-32` gives the three layout stages —
`createTree` resolves components into `InternalNode`s, `measureTree` defers to
Yoga, and `collectResults` gathers "a lightweight representation of elements
that need mounting and throw[s] away the `InternalNode` tree." Mount
(`:39-41`) then works from the `LayoutOutput` list and a visible `Rect`, and
`:47-48` describes mount diffing by comparing mounted content with the content
to mount. That is the technique's blueprint, collect-then-discard included.

`RenderUnit.kt:25-36` (in `litho-rendercore`) is the unit type: it declares a
`ContentAllocator`, binders, a stable `id` (`:97-98`), and the comment "RenderUnits
should be immutable!"

## Containers vanish and leaves draw

`docs/view-flattening.md:10-15`: the layout tree "is just a blueprint of your UI
with no direct coupling with Android views"; Litho "can completely skip
containers after layout calculation because they are not used in the mount
step", and "most of the core widgets … such as Text and Image, mount drawables,
not views." `:21` names the un-flatten triggers in prose: "touch event handling,
accessibility, or confining invalidations."

## The promotion predicate is derived from declarations

The real predicate is `LithoNode.needsHostView` at
`litho-core/.../LithoNode.kt:1099-1130`, not `CommonProps.kt:156-164` alone. In
order: a component that already mounts a `View` needs no wrapper (`:1100-1103`);
an explicit force (`isForceViewWrapping`, `:1104-1107`); "View content (e.g.
Accessibility content, Focus change listener, shadow, view tag etc)"
(`:1108-1112`); common dynamic props that must be applied to a host view
(`:1113-1115`, detail at `:1193-1202`); a transition key (`:1116-1118`, `:1204-1205`);
and gesture-exclusion zones or custom binders (`:1123-1129`). The view-attribute
list at `:1132-1170` is the technique's capability vocabulary almost verbatim:
focus-change handler, touch handlers, view id and tags, shadow elevation and
colours, outline provider, clip-to-outline, clip-children, focusable, clickable,
keyboard-navigation cluster, tooltip, transition name.

The liveness refinement is in the tree: `:1137-1138` counts touch handlers only
when `enabledState != NodeInfo.ENABLED_SET_FALSE`, so a disabled handler does
not promote.

The explicit escape hatch is `CommonProps.wrapInView()` at `CommonProps.kt:156-158`;
`shouldWrapInView()` at `:160-164` ORs it with the scale, alpha and rotation keys,
so animated transforms promote without the author asking. The predicate is
consumed where outputs are collected, e.g. `LithoNodeUtils.kt:91,96,112,131`.

## Where the tree falls short

**A second copy of the predicate.** `LithoNode.hasViewOutput` at `:1179-1191` is
a hand-written approximation for debugging tools that, per its own comment,
"does not consider accessibility also does not consider root component, but this
approximation is good enough for debugging purposes." It omits gesture-exclusion
zones and custom binders too. A debug overlay built on it disagrees with mount
on exactly those nodes — the one-authority rule the technique states. Calling
`needsHostView` with a debug flag, or labelling the overlay approximate at the
point of display, would close it.
