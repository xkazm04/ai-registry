---
layer: technique
type: technique
subject: table
technique: grid-keyboard-model
status: forged
laws: [identity-survives-reuse]
shared_with: []
use_when: [deciding whether an interactive table is a native table or a grid, one tab stop for a whole data table, arrow keys that must also operate a control inside a cell, a keyboard jump to the last row on a windowed or paged table, focus landing on a cell that holds a button]
---

# Grid keyboard model

A table whose cells are interactive (links, buttons, editable values) has two
honest shapes, and the choice is a keyboard decision before it is a markup one.
A **native table** puts every focusable element in the page tab sequence, so a
page of 50 rows with one link each is 50 tab stops before the next widget. A
**grid** is a composite widget: exactly one element inside it is in the tab
sequence, arrows move focus cell to cell, and the page's tab order stays short.
The price of a grid is that the author owns every key. Pick it when the cells
are interactive or editable and the rows are many; keep the native table when
the cells are read-only text. A grid role does not make a surface tabular, and
a table that never needs cell-level keyboard operation gains nothing from one.

This technique is the keyboard model for the grid shape. The general split
(tab between widgets, arrows within them) is in
[keyboard-navigation-models](../../../feedback-and-style/accessibility/techniques/keyboard-navigation-models.md);
what follows is what a two-dimensional, editable, row-and-column composite adds.

## Traversal is two-dimensional, and stops at the edges

Arrows move one cell; Home and End move to the first and last cell of the row;
the modified Home and End move to the first and last cell of the whole grid;
Page Up and Page Down move by an author-chosen row count. At an edge, **focus
does not move**. The wrap that a one-dimensional list or a layout grid offers
(right arrow off the last cell continues on the next row) is disorienting in a
data grid, especially to assistive-technology users, who lose the sense of
which row they are in. Wrap belongs to a grid that groups homogeneous widgets
and has no row meaning; it does not belong to a grid whose rows are records.

**Every cell takes focus, including cells with nothing to operate.** Screen
readers typically sit in application mode inside a grid and announce only
focusable elements and the content that labels them. A cell that cannot take
focus is skipped silently, and its value is never heard. The one exception is a
header cell that offers no function (no sort, no filter), which need not be
focusable.

## Focus the widget, or focus the cell, never a muddle

What receives focus in response to a navigation key depends on the cell, and
the choice changes what assistive technology says. Focus on a cell that holds a
button announces the button's label but not that a button is present. Two cell
designs behave well; use one of them:

- **One widget that does not need arrow keys** (link, button, toggle, switch,
  checkbox, a single radio): navigation focuses the widget directly.
- **Text or a single graphic:** navigation focuses the cell.

A cell with several widgets, editable content, or a widget that uses arrows
itself (a slider, a radio group, a combobox) is the expensive case and the
next section is its cost.

## Navigation is a mode the cell can suspend

Arrow keys belong to the grid until a cell needs them for something else. The
convention that works is an explicit enter-and-leave pair:

- **Enter, or the edit key, suspends grid navigation** and moves focus into the
  cell's input or onto its first widget. In a single-line text field a second
  press may commit and restore navigation.
- **Escape restores grid navigation**, and when content was being edited it may
  also discard the edit. The edit key a second time restores navigation too.
- While suspended, arrows go to the widget (or step between the widgets inside
  the cell); tab and shift-tab step to the next or previous widget in the grid.

Two rules keep the mode honest. The mode must be visible and re-enterable from
the keyboard alone, since a user stuck inside a slider with no key that returns
to the grid has been trapped. And a grid is easier to build and to use when its
cells do not need arrow keys to operate: prefer a control that does not use
them, or give it an explicit open-and-close step, over a cell that is a nested
composite.

## Jump keys disagree with windowed data

The jump to the last cell of the grid moves to the last row **in the DOM**.
Under windowing, paging, or any on-scroll loading, that is the last row
currently mounted, not the last row of the dataset; the user presses the key and
lands somewhere that is neither the end nor announced as not the end. Either
the grid loads or scrolls to the true end before moving focus, or it states the
partial landing. This is the keyboard face of the cost
[performance](./performance.md) assigns to windowing, and it is the reason the
row count and row position must be declared (see rung 4 there).

Focus position is state and follows the same rule as everything else in a
table: key it by row identity, not index, so a resort, a refresh, or a window
slide does not move focus to whichever row now occupies the slot
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## Selection keys, when the grid selects

If the grid selects, the conventions are: one chord selects the column, another
the row (and, when a checkbox column exists, doubles as a shortcut for its box
when focus is elsewhere), one selects everything, and shift with an arrow
extends the selection by one cell. The selected state is exposed on the cell or
row, and when a whole column is selected every cell in it carries the state.
Selection is distinct from focus and must be drawn distinctly: a selected cell
that looks identical to the focused one hides one of the two facts.

## Anti-patterns worth naming

- A grid role on a surface whose cells are read-only text: all of the key
  ownership, none of the benefit.
- A grid in which some cells cannot take focus, so a screen-reader user in
  application mode never hears them.
- Wrapping at the row edge in a record grid.
- A cell that is itself a nested composite with no explicit way back to grid
  navigation.
- A last-cell key that goes to the last mounted row and says nothing about it.
