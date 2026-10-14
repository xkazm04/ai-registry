---
layer: application
type: application
subject: table
technique: clipboard-range-round-trip
stack: node
status: forged
verified_on: 2026-10-14
---

# Copy joins on tab, paste splits on tab: the round trip breaks on the first awkward value

Read in the `revolist/revogrid` tree (package version 4.28.4, commit
`8b606d6d15e24841aa6cd343cf4aa0e4b0739957`), a web-component data grid. No runtime
is pinned, so no `verified_against`. Citations opened 2026-10-14.

**the pair.**

- Copy: `src/components/clipboard/revogr-clipboard.tsx:204 "return data.map(rgRow => rgRow.join('\t')).join('\n');"`.
- Paste: `src/components/clipboard/revogr-clipboard.tsx:209 "const rows = data.split(/\r\n|\n|\r/);"` and
  `src/components/clipboard/revogr-clipboard.tsx:211 "result.push(rows[y].split('\t'));"`.

Neither side quotes. **Replay of those two functions** over a block of four rows
and eight cells in which one value holds a tab and one holds a line break: copy
then paste gives **five rows and ten cells**, two values split, and the cells
after each split shifted right. Nothing in the e2e suite copies and pastes the
same block; its clipboard cases test copy and paste separately.

**other facts read.** The HTML path takes a table out of the pasted markup and
reads each cell with `innerText`, which depends on layout. The paste, copy and cut
listeners are registered on `document`, so ownership is the grid's own focus
state, tested after the event arrives
(`src/components/overlay/revogr-overlay-selection.tsx:877` onward: it returns
when there is no focus or an edit is open). Hooks exist at each stage (before
paste, before apply, after apply), which makes the fix local: a quoting copy and a
quote-aware parse can be supplied by a consumer today, but the defaults are the
lossy ones.

**what is right.** An edit in progress takes the paste instead of the range, and a
spreadsheet copy's trailing empty row is trimmed before the single-value
decision.
