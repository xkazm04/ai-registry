---
layer: application
type: application
subject: table
technique: one-door-for-range-writes
stack: node
status: forged
verified_on: 2026-10-14
---

# Two write events, one store: the editor path and the range path in a data grid

Read in the `revolist/revogrid` tree (package version 4.28.4, commit
`8b606d6d15e24841aa6cd343cf4aa0e4b0739957`), a web-component data grid. No runtime
is pinned, so no `verified_against`. Citations opened 2026-10-14.

**the enumeration.** The store is written by two paths with two events and two
payload shapes:

- a single-cell edit: `src/components/revoGrid/revo-grid.tsx:1080 "const { defaultPrevented, detail } = this.beforeedit.emit(e.detail);"`, then
  `src/services/data.provider.ts:128 "model[prop] = val;"`;
- every block write (paste, fill-drag, clear, cut):
  `src/components/revoGrid/revo-grid.tsx:1104 "const { defaultPrevented, detail } = this.beforerangeedit.emit(e.detail);"`,
  then `src/services/data.provider.ts:143 "oldModel[prop] = data[rowIndex][prop];"`.

A hook registered on `beforeedit`, the event the editor documents, never sees a
paste. Both paths end in `afteredit`, so an after-the-fact listener can see both
but cannot reject.

**what the range path does at its door.**

- Read-only cells are skipped per cell, silently:
  `src/components/data/column.service.ts:362 "if (this.isReadOnly(rowIndex, colIndex)) {"`; the applied range returned for
  the selection is the bounding rectangle, skipped cells included.
- The block is clipped to the last row without a report:
  `src/components/data/column.service.ts:331 "const endRow = Math.min("`.
- No type coercion at either path: pasted values are the strings the parser
  produced, and a numeric column receives them as strings.
- Single value over a block is an opt-in mode:
  `src/components/overlay/clipboard.utils.ts:12 "return normalized.length === 1 && normalized[0]?.length === 1"`, after trailing
  empty rows are trimmed.
- Both paths mutate the stored row in place, so the old value exists only if a
  listener captured it from the before-event.

**verdict against the technique.** The tree is the counter-example the technique
describes: two doors, validation reachable on one, no per-write report. It has two
things worth copying: the read-only decision is per cell and checked on both
paths, and the single-value fill is an explicit option with a tested trailing-row
case (`e2e/range.spec.ts`).

**what this realization cannot do.** It cannot answer "did my paste fully land":
the result is an event carrying the data, and the skipped and clipped cells
appear nowhere in it.
