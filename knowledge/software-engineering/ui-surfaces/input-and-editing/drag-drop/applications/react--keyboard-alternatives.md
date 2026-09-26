---
layer: application
type: application
subject: drag-drop
technique: keyboard-alternatives
stack: react
verified_on: 2026-09-26
verified_against: react@19.2
---

# goat's dnd-kit boards: the keyboard path is announced and never wired

goat ranks things by dragging them: tier lists, a match grid, collections and
a studio. Unlike the native-HTML5 tree the other two `react` applications
describe, it drags through a library, `@dnd-kit/core` 6.3.1 with
`@dnd-kit/sortable` 10.0.0, read at `4d33ac2`. A library is the usual way a
team gets a keyboard path for free. This tree shows how that goes wrong: the
library's accessibility half ships, and its input half is left out.

## What the library puts on every item

`useDraggable` / `useSortable` hand back `attributes` and `listeners`. The
`attributes` (`node_modules/@dnd-kit/core/dist/core.esm.js:3433-3438`) are
`role="button"`, `tabIndex: 0`, `aria-roledescription` ("draggable"),
`aria-describedby` pointing at a hidden instruction node the `DndContext`
renders, and `aria-pressed: true` *while the item is held*. The pressed state
is how the library says "grabbed" without the deprecated grab attributes, and
it is the shape the technique now recommends.

The `listeners` come only from the **sensors registered on the context**. The
keyboard entry point is `KeyboardSensor` (with `sortableKeyboardCoordinates`
for sortable lists). Without it, no key does anything to a focused item.

## What the tree registers

All four `DndContext`s register pointer input only:

- `features/Match/sub_MatchGrid/SimpleMatchGrid.tsx:365-378`: `PointerSensor`
  and `TouchSensor`;
- `features/Studio/components/StudioItemsView.tsx:43`,
  `features/Collections/components/CollectionView.tsx:276`,
  `features/Awards/AwardList.tsx:115`: `PointerSensor`.

There is no `KeyboardSensor` anywhere under `src/`. Yet six item sites spread
the library `attributes` onto the dragged node
(`Match/sub_MatchGrid/components/TierRow.tsx:107`,
`lib/tiers/TierRow.tsx:206`, `Studio/components/StudioItemCard.tsx:148`,
`Match/sub_MatchCollections/components/MobileBacklogPanel.tsx:55`,
`Collection/components/ConfigurableCollectionItem.tsx:504,530`). Every one of
those items is a tab stop that announces itself as a draggable button and then
ignores every key.

The match grid goes a step further. `SimpleMatchGrid.tsx:112-156` writes its
own announcements and instructions ("To pick up a draggable item, press Space or
Enter. Use arrow keys to move..."), under a comment citing the WCAG status-message
criterion. The instructions describe a keyboard grammar that nothing
implements. The technique names this exact case, the grip that announces
itself but cannot be operated, and ranks it **worse than no semantics**. The
user is told the control exists and spends effort finding out it does not.

## Why adding the sensor is not the whole fix

The match grid resolves drops with `collisionDetection={pointerWithin}`
(`SimpleMatchGrid.tsx:504`). That strategy returns no collisions when there are
no pointer coordinates (`core.esm.js:479-480`). The coordinates come from the
activating event (`:2916`, `:2977`), and a keyboard event carries no client
position (`@dnd-kit/utilities` `getEventCoordinates` returns `null`). So on this
surface a registered `KeyboardSensor` would pick an item up and never find a
target. The keyboard path needs a
rect-based strategy (the two list surfaces already use `closestCenter`), or a
strategy that switches on the active sensor.

The general reading of the technique holds here: "one operation, two inputs"
is a design decision the collision layer has to serve too, not a sensor you
append at the end.

## What the witness is

This is a source reading of the tree and the installed library, not a
screen-reader pass. Nothing in `e2e/` drives a drag from the keyboard.
Whether any of these surfaces offers a non-drag, single-pointer route (a
move-to control, click-to-place) was not established here, and the
dragging-movements criterion asks for that separately from the keyboard.
