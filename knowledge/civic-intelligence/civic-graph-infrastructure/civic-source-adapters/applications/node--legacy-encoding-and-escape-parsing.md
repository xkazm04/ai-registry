---
layer: application
type: application
subject: civic-source-adapters
technique: legacy-encoding-and-escape-parsing
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Node: parsing a legacy parliamentary UNL dump

The politicas repo ingests the Czech Chamber of Deputies' bulk exports — Informix
"UNLOAD" dumps published at psp.cz — through
`packages/czech-civic-data/src/unl.ts`, a ~150-line module that is the reference
realization of this technique.

## The publisher's grammar, implemented verbatim

The file header (`unl.ts:1-15`) transcribes the publisher's own format description:
one row per line, pipe-separated with a trailing pipe, empty column = SQL NULL,
backslash escapes, windows-1250 bytes. It then states why naive splitting is fatal:
vote titles like `"Zákon o ... § 12 | 2. čtení"` contain literal pipes, so
`line.split("|")` silently shifts every later column of that row.

`parseUnlLine` (`unl.ts:28-53`) walks the line character by character: `\|` is a
literal pipe, `\\` a backslash, `\n`/`\r`/`\t` control characters, and any other
escaped character passes through verbatim because the publisher documents no closed
set — permissive but lossless. Empty columns push `null`, not `""` (the SQL NULL
convention preserved at line 43). The trailing terminator column is dropped, but a
non-empty remainder is kept in case a producer ever omits the terminator.

`parseUnl` (`unl.ts:62-69`) encodes the order-of-operations rule: values can contain
*escaped* newlines, so the body is split on physical newlines first and unescaped
per line — "never the other way round" (comment at `unl.ts:58-60`).

## Fatal decoding

`decodeUnl` (`unl.ts:76-78`) is one line with a doctrine attached:

```ts
new TextDecoder("windows-1250", { fatal: true }).decode(bytes)
```

The comment states the reasoning exactly as the technique does: `fatal: true` makes
an unmappable byte (corrupted download, wrong source encoding, an off-by-one in zip
extraction) throw instead of substituting U+FFFD, because "this module's whole
discipline is 'missing beats wrong,' and a silently mangled name/title is exactly
the 'wrong' case."

## Whole-value coercion and semantic range checks

- `colInt` (`unl.ts:90-97`) requires the full trimmed value to match `/^-?\d+$/`
  before `parseInt`, because prefix-parsing "would otherwise silently accept
  '123abc' or a mis-escaped '45|' as 123/45, coercing a malformed field into a
  plausible-looking but wrong id."
- `czDateToIso` (`unl.ts:104-113`) parses the national `DD.MM.YYYY` format and
  range-checks month/day after the regex — null for malformed input "rather than
  guessing — a wrong date on a civic-accountability record is worse than a missing
  one."
- `czDateHourToIso` (`unl.ts:120-133`) applies the same ranges to the publisher's
  `datetime(year to hour)` shape, with the comment naming the trap: a regex-shaped
  but semantically invalid value (month 13, hour 27) "must not be emitted as a
  syntactically-ISO but meaningless timestamp." The zone-free source is pinned to
  UTC with the justification recorded: consumers work at day resolution.
- `col` (`unl.ts:81-84`) returns null past the row's end — "short rows happen."

## The counter-example that proves per-source parsers

The same repo's election-registry adapter (`lib/ingest/sources/volby.ts:15-22`)
faces a superficially similar format — semicolon-delimited, windows-1250 — and
deliberately does **not** reuse the UNL parser: that file is RFC4180-style quoted
CSV where `""` escapes a quote, a different grammar. The header records the live
verification that a naive `split(";")` breaks there too: one MP's own free-text
occupation field contains a literal semicolon. Two legacy formats, two small exact
parsers — not one "flexible" one.
