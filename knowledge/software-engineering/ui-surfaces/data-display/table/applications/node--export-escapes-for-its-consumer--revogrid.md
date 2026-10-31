---
layer: application
type: application
subject: table
technique: export-escapes-for-its-consumer
stack: node
status: forged
verified_on: 2026-10-31
---

# A grid CSV exporter with the parser layer only, and a generic serialiser for the rest

Read in the `revolist/revogrid` tree (package version 4.28.4, commit
`8b606d6d15e24841aa6cd343cf4aa0e4b0739957`), a web-component data grid. No runtime
is pinned, so no `verified_against`. Citations opened 2026-10-14.

**the parser layer is there.** `src/plugins/export/csv.ts:92 "const toEscape = [CARRIAGE_RETURN, DOUBLE_QT, LINE_FEED, columnDelimiter];"`
quotes a field containing the delimiter, a quote or a break and doubles inner
quotes; a byte-order mark is on by default.

**the spreadsheet layer is absent.** No cell is tested for a formula-leading
character. A cell value of `=1+1` leaves the encoder as `=1+1`. The grid exports
whatever its host application supplied as cell data, which for most deployments
includes user-entered text.

**the serialiser for non-strings.** `src/plugins/export/csv.ts:90 "JSON.stringify(value, bigIntReplacer)"` handles anything that is not a string.
**Replay of that function** over typed values: null exports as `null` (the four
letters); a date exports as `"""2026-01-02T00:00:00.000Z"""`; an object as
`"{""a"":1}"`; undefined and the empty string as an empty cell. Only the last
was probably intended.

**the row source is right.** The export reads the grid's visible source per
partition (`src/plugins/export/export.plugin.ts:162 "this.revogrid.getVisibleSource(t)"`), so a filtered or trimmed grid exports what
the user sees, and a before-export event can cancel the file.

**where the fix goes.** The formatter is behind a `beforeexport` event, so a host
can pre-escape the data today; there is no option on the formatter, so every host
must remember to. The technique's one-encoder rule says the guard belongs in the
formatter.
