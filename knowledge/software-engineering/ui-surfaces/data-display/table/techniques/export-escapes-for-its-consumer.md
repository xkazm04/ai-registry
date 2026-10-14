---
layer: technique
type: technique
subject: table
technique: export-escapes-for-its-consumer
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [a table exports its rows to CSV and some cells come from users or other systems, a cell starting with an equals sign or a plus opens as a formula in a spreadsheet, a CSV encoder is copied into several export routes, nullable or date values export as the wrong text, deciding which cells a formula guard must leave alone]
---

# Export escapes for its consumer

An export has two consumers with two grammars. A **parser** reads the file as
delimited text and needs quoting. A **spreadsheet application** reads each cell as
a possible formula and needs a guard against evaluation. The first is what CSV
encoders do and the second is what they usually forget, because the file is valid
CSV either way. When any cell can hold text a user or another system supplied, a
cell that begins `=`, `+`, `-` or `@` is a formula the recipient's spreadsheet
may evaluate on open, with function calls and references to other cells or to
the network available to it.

Which rows are exported is a separate decision and already settled elsewhere in
this subject: the file is built from the applied predicate, not from the controls
that were entered but not applied (see [filtering](./filtering.md)). This
technique is about the cells.

## Two layers, in a fixed order

1. **The spreadsheet layer.** A text cell that starts with a formula trigger gets
   a leading single quote so the application opens it as text. The trigger set
   is the ASCII `=`, `+`, `-`, `@`, plus tab and the two line-break characters, plus the full-width
   forms of the four symbols, which some applications fold to the ASCII ones.
2. **The parser layer.** Then apply the CSV rules to the result: quote a field
   that contains the delimiter, a quote or a line break, and double inner quotes.
   Guard first, quote second; the other order quotes the trigger character away
   from the front of the cell and the guard then has nothing to see.

The published guidance on this attack says the same two things and one more that
belongs in the table's documentation: **there is no strategy that is safe for all
spreadsheet applications and all downstream consumers**. A quote or escape can be
dropped when the file is saved and reopened, and the alternative prefix (a tab)
changes the stored data. The guard is an export-time mitigation, and the file's
recipient is told that.

## The exemption is by shape, and the shape is decided per column

A guard that prefixes every trigger-leading cell damages data that merely looks
like a trigger. A signed number (`-40`, `+3.5`) is data and must arrive as a number.
Test that against the typed value when the column is numeric, and against a strict
numeric pattern when the cell is already text. The second case is where the
second exemption lives: a **formatted phone number** (`+1 870 555 8230`) starts
with a plus, is not a pure number, and is exactly the kind of value a contact
table is full of. A guard that exempts only pure numbers rewrites every
formatted phone in the export. Measured on a contact table with 800 seeded rows,
25 phone cells were written in the spaced form and a number-only guard altered
all 25 (3.1% of rows), while a guard that also exempted the phone shape (a plus,
a digit, then only digits and phone punctuation) altered none and still
neutralised every hostile cell in a set of six. A cell of digits and punctuation has no function name or
reference to reach out with; the exemption is safe because of what the pattern
cannot contain, not because the column is labelled "phone". Keep the exemption
patterns anchored at both ends and as narrow as the data requires.

## Serialise typed values explicitly

Encoders that fall back to a generic serialiser for non-string values produce
text no consumer wanted. Measured on one such encoder: a null exported as the
four letters `null`, a timestamp as a JSON string wrapped in quotes and then
quoted again (three quote characters at each end), an object as escaped JSON.
Decide per type before encoding: null and undefined are empty cells, dates are
one stated format (ISO 8601 in UTC unless the column says otherwise), booleans
are the words the audience reads, and objects are either flattened into columns
or refused at export time with a named error.

## One encoder, imported by every route

The failure that costs most is drift. When each export route carries its own
encoder, the guard gets added to some and not others, and the one that misses it
is found later than the rest. Write the cell encoder once, test it once with the
hostile set, and make every export import it. A second copy is a defect even when
it is currently identical. Add a test that fails if a route writes CSV without
going through the shared encoder.

## Verify with the hostile set and the ordinary set together

Two assertions per encoder: every cell in a hostile list (a formula with a
function call, a bare `@`, a leading tab, a full-width equals, a plus followed by
text) comes out guarded; and an ordinary row, including signed numbers and
formatted phones, comes out byte-identical to the unguarded encoding. The first
catches a missing guard, the second catches a guard that eats data. Neither
alone is the test.

## Anti-patterns

- Quoting only, on cells from users.
- The guard applied after the CSV quoting.
- Exempting every cell that begins with a plus or minus, or none of them.
- A generic serialiser for dates and nulls.
- Copies of the encoder in several routes.
