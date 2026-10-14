---
layer: technique
type: technique
subject: table
technique: one-door-for-range-writes
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [an editable table lets users paste, fill-drag, cut or clear a block of cells, a validator or audit hook is attached to the cell editor and bulk input still gets bad values in, pasted text lands in a numeric or date column as a string, a paste skips read-only cells without telling anyone, deciding what an edit event should carry for undo]
---

# One door for range writes

An editable table has more write paths than the editor. The cell editor commits
one value. A paste commits a block. A fill handle commits a block copied from a
block. Clear and cut commit a block of empties. Four gestures, one store, and the
natural implementation gives the editor an event with a validator hung on it and
gives the others a second event with a different payload shape. The validator
then guards the one path a user takes least when they are moving real volume.

This is the [one validation door](../../../../_laws.md#one-validation-door) law
applied to a grid: the writers of the dataset are enumerable, and the guarantees
(type, permission, bounds, audit, undo) belong to the door, not to each writer.

## Enumerate the writers before attaching anything

List every code path that reaches the store's write call. A table that offers
editing, clipboard and fill has at least these, and a pipeline of imports, cell
renderers with inline controls and programmatic setters adds more. If the
count is more than one, the work is to make it one. Do this by grep on the write
call, not by recalling the features.

## The door takes a set of triples

Make the single-cell edit a block of one. The door accepts a set of
`(record identity, column, value)` triples and nothing else, and every gesture
translates into that shape before it calls the door. Then, in this order:

1. **Resolve position to identity.** Gestures speak in screen coordinates. A
   sort, a filter or a grouping decides which record sits at which row, so
   resolve once, at the door, against the current view, and keep the identity
   from there on.
2. **Coerce by column type.** Clipboard text is text. A numeric, date or
   boolean column parses at the door and a value that fails to parse is rejected
   with a reason, not stored as the string the user pasted. A grid that stores
   the raw string has a numeric column that sorts lexically after its first
   paste.
3. **Apply permission per cell.** Read-only columns and read-only rows are
   decided per target cell, because a block can straddle them.
4. **Clip to bounds.** A paste can run off the last row or the last column.
5. **Capture the old values, then write.** The door is the only place that can
   record what was there. A write that mutates the source row in place with no
   capture leaves undo, audit and "changed since load" nothing to read.
6. **Return what happened, not what was asked.** The result carries written,
   skipped-as-read-only, rejected-as-invalid and clipped counts, and the
   selection afterwards covers the cells that changed, not the rectangle that was
   requested.

The last item is where most tables lie. A paste that silently skips read-only
cells and then highlights the whole pasted rectangle shows the user cells as
updated that were not. Counts that exclude the skipped cells and an inline note
("3 cells skipped: read-only") cost one line and remove the discovery that
happens a week later.

## Single value over a block is a mode

Pasting one value onto a multi-cell selection can mean "paste at the anchor cell"
or "fill the selection". Spreadsheet users expect the second; a table that
defaults to the first looks broken to them and the reverse surprises the rest. Pick
one, say which, and make it a stated option rather than an accident of the
parser. Strip the trailing empty row that spreadsheet copies append before
deciding a clipboard holds a single value.

## Verify the door by feeding each writer

For each enumerated writer, drive one invalid value through it: a non-numeric
string into a numeric column, a value into a read-only cell, a block that runs
past the end. The same rejection must come out of all of them. A test that
covers only the editor proves the door is open on the other three sides.

## Anti-patterns

- Validation registered on the editor's commit event only.
- Two events for one store, with different payload shapes, so a hook written for
  one cannot be reused on the other.
- Storing pasted text without coercion.
- A result that reports the requested range instead of the written one.
- Writes that mutate in place with no old-value capture.
