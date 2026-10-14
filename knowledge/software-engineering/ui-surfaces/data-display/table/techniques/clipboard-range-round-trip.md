---
layer: technique
type: technique
subject: table
technique: clipboard-range-round-trip
status: forged
laws: []
shared_with: []
use_when: [copying a range of cells out of a table and pasting it back changes the number of rows or cells, a cell value containing a tab or a line break breaks a paste, deciding what formats a table puts on the clipboard, a page with more than one table reacts to one paste, a pasted spreadsheet block carries a trailing blank row]
---

# Clipboard range round trip

Copy and paste are a pair of functions, and the pair has one acceptance test: a
range copied out of the table and pasted into the same place gives back the same
range. Tables that treat the two halves as separate features fail it the first
time a value contains the delimiter.

## Measure the round trip, not each half

Take a block with the awkward values in it: a cell with a tab, a cell with a line
break, a cell with a double quote, an empty cell, a cell with leading spaces.
Copy it, parse the clipboard text with the table's own paste parser, and compare
cells to cells. The count that matters is cells in against cells out. A table that
joins cells with a tab and rows with a newline and splits on the same characters
turns four rows and eight cells with two awkward values into five rows and ten
cells: two values silently split, the row count off by one, every cell after the
first split shifted one column right in the destination.

## The format is the spreadsheet convention

The destination of most copies is a spreadsheet and the source of most pastes is
one. Their tabular text convention is tab-separated fields, newline-separated
rows, and **a field containing a tab, a line break or a quote is wrapped in double
quotes with inner quotes doubled**. Copy writes that, paste reads that, and a
paste parser is a small state machine over quotes rather than two `split` calls.
It must also accept the unquoted common case, since most sources are
simple, and tolerate both line-break styles.

Put two flavours on the clipboard when the table can: plain text in the form above,
and an HTML table for rich targets. On paste, prefer the HTML table when present
and fall back to text when no table element is found. Reading cell text out of
parsed HTML by layout-dependent properties makes hidden elements and line breaks
vary by environment; prefer text content and say what happens to line breaks.

## What gets copied: stored value or shown value

Pick one deliberately and say it in the table's documentation. Copying the stored
value round-trips; copying the shown value ("$1,200.00", "3 days ago") reads well
in a document and does not paste back into a typed column. If both are wanted,
the shown value belongs to an explicit "copy as displayed" action.

## Paste belongs to the focused table

Clipboard events fire on the document. A table that listens there must decide
ownership itself: apply the paste only when this table is the one the user is in,
decided from the event's target or the table's own focus state, re-read at paste
time. A page with two tables, or a table beside a text field, otherwise has one
paste reach every listener. A paste that arrives while a cell is being edited
belongs to the editor, not to the range.

## After parsing, the write goes through the door

The parsed block is not applied by the clipboard code. It is translated to cell
targets and handed to the [single write door](./one-door-for-range-writes.md),
where type, permission and bounds are decided. The clipboard layer owns
format; the door owns meaning.

## Anti-patterns

- Joining with the delimiter and splitting on it, with no quoting.
- Testing copy and paste in separate cases and never together.
- Parsing the clipboard with layout-dependent text properties.
- A document-level listener with no ownership check.
- Putting formatted display text on the clipboard as the only flavour.
