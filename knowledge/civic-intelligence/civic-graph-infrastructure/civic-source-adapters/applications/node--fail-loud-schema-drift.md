---
layer: application
type: application
subject: civic-source-adapters
technique: fail-loud-schema-drift
stack: node
status: forged
verified_on: 2026-10-13
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node: a positional CSV registry parsed with no shape check, then pinned

The politicas repo ingests the Czech election authority's candidate registry
(`lib/ingest/sources/volby.ts`): a semicolon CSV, windows-1250, nineteen
columns, no version and no changelog. The stack is Node 24, witnessed by the
CI pin in `.github/workflows/ci.yml` (`node-version: 24`).

## What the tree did

The sibling adapters for this publisher family already assert shape (the
contract-register client pins its table header). This one did not. The
header was documented in a comment ("verified against the live 2026-07-25
download") and then ignored: `parseCandidates` took `rows.slice(1)`, skipped
any row under 16 cells with the comment "short/blank trailing row", and read
every field by index. `parsePartyLists` did the same for the list registry
and returned `[]` for an empty body.

Seam chosen to falsify the technique: the technique says a positional parser
pointed at a drifted shape still yields numbers. If this parser already
failed visibly on drift, the guard would be redundant. It did not.

## Paired proof

Same seven inputs through both arms (the committed test header and two
rows, mutated): a column inserted before the names, a column dropped, two
columns swapped, an HTML maintenance page, an empty body, the last row cut
mid-download, plus the unmutated file.

| Input | Arm A (as found) | Arm B (pinned header, row-width check) |
| --- | --- | --- |
| unmutated | 2 rows, correct | 2 rows, identical |
| column inserted | 2 rows, name `M Josef`, age null, occupation `54` | throws, labels expected vs actual |
| column dropped | 2 rows, age null, occupation = residence | throws |
| two columns swapped | 2 rows, votes null, `elected` false | throws |
| maintenance page | `[]` | throws |
| empty body | `[]` | throws |
| truncated last row | 1 row, the cut row silently gone | throws "truncated" |

Target: silently wrong or silently short outputs on drift. A: 6 of 6. B: 0 of 6.
Floor: the unmutated input is byte-identical across arms, the two existing
parser tests and the join tests still pass (27/27 in the two volby test
files), and an additive trailing column is still accepted, as the technique's
strictness paragraph requires.

The sharpest arm is the swap: both columns still hold numbers, so nothing
downstream can tell, and the elected flag that the employment-conflict
classifier reads becomes false for everyone.

## What the assertion checks

The labelled prefix the parser reads (17 labels) by exact name, after a
byte-order-mark strip, and a minimum row width equal to that prefix. The
error prints labels and a cell count only, never a row value. Fully blank
rows are still skipped; short non-blank rows now throw.

## What this realization cannot do

- Nothing proves an empty acquisition here: an election registry has no
  documented empty-result marker, so a header-only body returns no
  candidates and is not flagged. The technique's "prove an empty response"
  clause is satisfied only for the missing-table and wrong-page cases.
- The header was not re-fetched from the live source in this run; the pinned
  labels are the ones the adapter's own header comment records as verified.
- Nothing calls the parsers from a scheduled path yet that I could find
  (only the tests import them), so the guard protects the next ingest rather
  than a running one.
