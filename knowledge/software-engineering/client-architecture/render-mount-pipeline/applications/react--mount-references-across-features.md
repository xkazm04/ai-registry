---
layer: application
type: application
subject: render-mount-pipeline
technique: mount-references-across-features
stack: react
verified_on: 2026-09-14
verified_against: react@19
applied: code
ab_verdict: better
proof: ab-paired
---

# Focus holds its own claim on a virtualized row

Witness: `package.json` declares `react ^19.2.6` and `@tanstack/react-virtual ^3.13.24`
(installed `virtual-core` 3.16.0). The seam is the trace waterfall in
`src/features/agents/sub_executions/detail/inspector/TraceInspector.tsx`, which
virtualizes once a trace passes fifty visible spans and whose rows carry an expand
toggle (`SpanRow.tsx:41-57`). A trace runs to 10,000 spans.

## What decided existence before

One feature: the window. `useVirtualizer` was given a count, a fixed row height and an
overscan of twelve, and the rendered set was exactly the window plus overscan. Nothing
else in the view could ask for a row to exist. The file had already met the consequence
once and resolved it by removing the other feature: the per-row entrance animation is
kept only on the plain path, because recycled rows replay it on every re-entry. A feature
with no claim on mountedness loses to the window, and the only lever the code had was to
delete it.

Focus met the same shape and could not be deleted. A keyboard user tabs to a span's
toggle and scrolls the container with the wheel or PageDown; the row leaves the window,
the element is removed, focus falls to the document body, and the next Tab starts from
the top of the page.

## What changed

Focus is a second reference holder. The rendered set is the virtualizer's own range
UNION the focused row, supplied through its range-extraction hook, so the window's
decision is untouched and one feature adds one index:

- the claim is **keyed by span id, not by index** - a live span event or a collapse
  shifts every index below it, and an index-keyed claim would keep a different row alive;
- the claim is **acquired** on a focus event inside the list and **released** only when
  focus leaves the list (moving between toggles is a focus event on the next row);
- a focused span that leaves the visible set has no index, so the claim **lapses with
  the item** - the removal rule the technique states for units no longer in the tree.

The window never learns that focus exists, and focus never learns the window's size.

## Proof

Measurable: where focus is after a focused row is scrolled past the window and its
overscan, with the created-row bound held. One fixture, three observation points per arm
(a new test, `__tests__/TraceInspectorFocusRetention.test.tsx`):

| | window moved (row 2000 mounted) | rows created | focus after scroll |
| --- | --- | --- | --- |
| A - window alone | yes | < 200 | `body` |
| B - window UNION focused row | yes | < 200 | row 0's toggle |

A release case passes in B: focus moved outside the list, then the scroll unmounts row 0.
Suite 88/88 across the inspector tests, eslint clean, `tsc --noEmit` exit 0. Shipped in
personas `d0709a8f2`.

## Where the seam could have gone the other way

The deck rail in the same product virtualizes too and keeps a keyboard cursor in view by
index, but its keyboard handling is one global listener, so losing DOM focus there costs
the user nothing. A test there would have passed on both arms and taught nothing. The
waterfall was chosen because a web virtualizer's overscan might already have covered
focus, which would have made the technique redundant for this stack; it did not.

## What this realization cannot do

- The retained row sits at its true offset outside the viewport. A screen reader in
  browse mode still loses the rows around it; the list declares no row count or row
  index, and the technique does not supply them.
- Only focus holds a claim. A hovered tooltip, an open context menu or a drag in flight
  inside a row would each need their own, and none is wired.
- The claim is read when the range is recomputed, so a row whose focus left stays mounted
  until the next scroll: bounded at one element, but not released eagerly.
