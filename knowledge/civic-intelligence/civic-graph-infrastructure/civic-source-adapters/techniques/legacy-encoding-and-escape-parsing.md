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
- **Do not invent meanings for undocumented escapes.** Preserve the raw token
  including its escape marker and quarantine the affected field or row until
  its meaning is established. Dropping the marker is a transformation, not
  lossless preservation. An open escape set does not prove every escape means
  its following character. Record missing terminators and dangling escapes too.
- **Order of operations matters when escapes encode newlines.** If a value can
  contain an escaped newline, split the file on physical newlines *first* and
  unescape per line — never unescape first, which manufactures phantom row breaks.
- **Preserve the null convention.** If an empty column means SQL NULL, emit null,
  not the empty string. Downstream, "" and null diverge: one joins and aggregates,
  the other is honestly absent, and [missing is not zero](../../../_laws.md#missing-is-not-zero)
  requires keeping them distinct from the very first parse.
- **Validate required width before extracting columns.** A missing required
  column is malformed input, not the publisher's empty-column null. A tolerant
  accessor may return null for a documented optional trailing field, provided
  the result retains why the value is missing. Do not let it conceal truncation.

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
[repair is forbidden](../../../_laws.md#disclose-never-repair).

Fatal mode detects decoder errors, not the wrong encoding in general. Bytes
from another encoding can all be valid in the selected codepage and produce
mojibake without throwing. Verify the declared encoding and transport/archive
integrity, and check representative names against known source text. Successful
decoding alone does not establish that the characters are correct.

## Coerce whole values, validate behind syntax

Raw columns become typed values through coercers that refuse plausible garbage:

- **Integers: full-match only.** Prefix-parsing integer routines accept `"123abc"`
  as 123, which means a mis-escaped or shifted field coerces into a *valid-looking
  wrong identifier* — the exact failure escape-aware splitting exists to prevent,
  reintroduced one layer up. Require the entire trimmed value to match a digit
  pattern; otherwise null with a rejection reason. Also enforce exact numeric
  representability and field range. Keep identifiers as strings where needed;
  a full digit match does not prevent rounding or loss of leading zeros.
- **Dates: parse the national format, then range-check.** A pattern match is
  syntax; month 13 and day 32 are semantics. A regex-shaped but impossible value
  must yield null, never a syntactically-standard but meaningless timestamp that
  downstream date arithmetic will happily consume. Validate day against the
  actual month and leap year, and match the whole token; rejecting day 32 still
  admits impossible dates such as the thirty-first day of the second month.
- **Timestamps without zones: decide once, document once.** When the source carries
  no timezone, preserve it as a civil date/time unless a source-backed zone
  interpretation is available. Day-level use does not justify inventing an
  absolute instant. State any assumption and handle ambiguous clock transitions.
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
