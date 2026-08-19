---
layer: technique
type: technique
subject: civic-source-adapters
technique: legacy-encoding-and-escape-parsing
status: forged
laws: [disclose-never-repair, missing-is-not-zero]
shared_with: []
use_when: [parsing a delimited legacy bulk export, decoding non-UTF-8 payloads, coercing raw columns to typed values]
---

# Legacy encoding and escape parsing

Government bulk exports are dumps of databases procured long before UTF-8 and CSV
conventions settled: single-byte codepages, home-grown delimiter formats with their
own escape rules, dates in the national civil format, nullness expressed as an empty
column. The technique is to implement the publisher's *actual* grammar — usually
documented, however tersely, on the publisher's own site — and to make every layer of
the parse refuse to guess. The enemy is not unparseable input; it is input that
parses *wrong* and keeps flowing.

## Find and implement the real grammar

Before writing a parser, find the publisher's format description. Legacy export
formats almost always have one: which byte separates columns, how a literal separator
inside a value is escaped, what an empty column means, what terminates a row, what
the byte encoding is. Implement that description, not a lookalike:

- **Never split on the delimiter when an escape rule exists.** If a literal
  delimiter inside a value is written as an escape sequence, a naive split shifts
  every later column of any row whose free-text field contains one — and free-text
  titles in legislative and contract data *do* contain them. This is not
  hypothetical caution; it is the single most common corruption in delimited civic
  data. Walk the line character by character, honoring the escape.
- **Handle undocumented escapes permissively but losslessly.** When the publisher
  does not document a closed escape set, pass an unknown escaped character through
  verbatim rather than rejecting the row — passing it through loses nothing, while
  rejection throws away a whole record over a cosmetic ambiguity.
- **Order of operations matters when escapes encode newlines.** If a value can
  contain an escaped newline, split the file on physical newlines *first* and
  unescape per line — never unescape first, which manufactures phantom row breaks.
- **Preserve the null convention.** If an empty column means SQL NULL, emit null,
  not the empty string. Downstream, "" and null diverge: one joins and aggregates,
  the other is honestly absent, and [missing is not zero](../../_laws.md#missing-is-not-zero)
  requires keeping them distinct from the very first parse.
- **Tolerate short rows explicitly.** Column accessors return null for a missing
  index instead of throwing or — worse — reading past the end into undefined
  behavior. Short rows happen in decades-old export pipelines.

## Decode fatally

Legacy payloads arrive in single-byte codepages. Decode with the decoder in fatal
mode: an unmappable byte throws instead of being silently replaced with U+FFFD.
The lenient default feels robust and is the opposite — a corrupted download, a wrong
assumed codepage, or an off-by-one in archive extraction each produce a payload that
decodes "successfully" with mangled characters scattered through names and titles.
A mangled name is the worst possible outcome for this data: it looks valid, it
defeats entity matching for exactly that person, and nobody is alerted. A thrown
decode error, by contrast, stops one ingest run and names its cause. When a decode
fails, the fix is to diagnose the payload, never to switch the decoder to lenient —
that converts a detected fault into a permanent silent one, which is repair, and
[repair is forbidden](../../_laws.md#disclose-never-repair).

## Coerce whole values, validate behind syntax

Raw columns become typed values through coercers that refuse plausible garbage:

- **Integers: full-match only.** Prefix-parsing integer routines accept `"123abc"`
  as 123, which means a mis-escaped or shifted field coerces into a *valid-looking
  wrong identifier* — the exact failure escape-aware splitting exists to prevent,
  reintroduced one layer up. Require the entire trimmed value to match a digit
  pattern; otherwise null.
- **Dates: parse the national format, then range-check.** A pattern match is
  syntax; month 13 and day 32 are semantics. A regex-shaped but impossible value
  must yield null, never a syntactically-standard but meaningless timestamp that
  downstream date arithmetic will happily consume.
- **Timestamps without zones: decide once, document once.** When the source carries
  no timezone, pick the interpretation, write down why (usually: all consumers work
  at day resolution), and apply it in one place.
- **Null over guess, always.** Every coercer returns null for malformed input. The
  rejection is countable — an ingest run can and should report how many values each
  coercer refused, so a systemic format change surfaces as a spike instead of a
  slow silent thinning of the data.

## When not to use this

When the publisher offers a modern structured feed (JSON with a schema, a
standards-based API) alongside the legacy dump, prefer it and let this technique
cover only the gap — typically historical depth the modern feed lacks. And do not
generalize one publisher's grammar to another's superficially similar format: a
semicolon-delimited quoted-field export and a pipe-delimited backslash-escaped one
differ in exactly the corner cases that corrupt rows, so each source gets its own
small parser matched to its documented rules rather than a shared "flexible" one.
