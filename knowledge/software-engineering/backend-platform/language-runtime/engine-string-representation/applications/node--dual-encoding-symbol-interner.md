---
layer: application
type: application
subject: engine-string-representation
technique: dual-encoding-symbol-interner
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A metric-key interner in a database instrument, in a civic-data site

**Witness:** the tree has no `engines` field. Its CI pins `node-version: 24`
(`.github/workflows/ci.yml:36 "node-version: 24"`), and the experiment ran on Node
24.14.0 with type stripping. politicas (`github:xkazm04/politicas`, public, `origin/master`
at `c2042d9c`; the two files read are identical there and at the local `62317aa`) is a
Next.js site over an embedded Postgres store.

No managed project compiles a language, so the technique's home case - identifiers
compared as integers from lexing to code generation, across two encodings - has no seam
in the fleet; a hunt on 2026-10-14 recorded that. This application found the technique's
*other* two rules at work in a tree that is not a compiler: an instrument that wraps every
database statement interns a metric key and stores the integer in a typed-array ring. That
is the same shape the technique governs - a small closed vocabulary, interned once, held as
integers in storage that starts zeroed - and it is the shape on which the fixed prefix and
the unused zero symbol make testable predictions.

## The seam

`lib/db/pglite/instrument.ts` derives a key `<table>/<family>` from each statement and
interns it by arrival order:

- `lib/db/pglite/instrument.ts:252 "const keyIndex = new Map<string, number>();"` and
  `lib/db/pglite/instrument.ts:356 "function internKey(table: string, family: OpFamily): number {"` -
  the first key seen gets index 0, the next gets 1, and four parallel arrays (name,
  family, table, warn budget) are kept aligned by pushing together.
- The vocabulary is closed by construction: table names are parsed from the schema at
  load, and `lib/db/pglite/instrument.ts:298 "const resolveTable = (name: string | null): string =>"`
  collapses any unknown table to one bucket, so the key space is at most
  (19 tables + 2 buckets) x 5 families.
- A statement memo sits in front of the interner,
  `lib/db/pglite/instrument.ts:222 "const MEMO_CAP = 256;"`, keyed on the same 256-character window
  the parser reads.
- The ring is allocated zeroed, `lib/db/pglite/instrument.ts:269 "key: new Int32Array(RING_CAP),"` and
  `lib/db/pglite/instrument.ts:274 "ok: new Uint8Array(RING_CAP),"`, and index 0 is a live key.

## What A and B were

Two copies of the module, run under one harness:

- **A** - the tree as it is.
- **B** - the technique's two rules applied: the closed vocabulary pre-interned at load as
  a fixed prefix in a fixed order, the index computed as `1 + tableId * 5 + familyId`,
  the dynamic map removed, and symbol 0 never minted.

The replay is 300 statements (read, insert, update and delete against every known table,
plus a transaction pair, a schema statement and an unknown table) in a seeded shuffle, so
arrival order is not table order. 300 stays below the ring's 512 slots so that unwritten
slots exist. Durations come from an injected clock.

## What was read

- **Target, steady-state interning cost per statement (memo hit):** A 8.0 and 7.9 ns, B
  7.6 and 8.2 ns over two runs. No difference. On a memo miss B halves the cost (A 732
  and 541 ns, B 366 and 377 ns), but a miss happens at most once per distinct statement
  per process, and the tree issues literal templates.
- **Floor, the snapshot:** byte-identical between arms - 41 keys, sample counts summing
  to 300, every percentile equal.
- **Falsifier, chosen to break the unused-zero rule:** a seeded defect makes the snapshot
  read past the fill mark into slots never written. Under A, the 212 phantom slots
  resolve to index 0, which is whichever key arrived first. `absence/write` goes from
  n 12 to 224, its p50 from 1.5 ms to 0, and it gains 212 failed operations, because an
  unwritten success byte reads as 0. Every row stays plausibly named, so the corruption is
  silent. Under B, all 41 named rows match the unmutated snapshot, and the 212 phantoms
  surface as one row with no name.

## Verdict: not-better, and the structural fact behind it

The fixed prefix did not move its target. The technique's case for the prefix is that a
well-known symbol is the same integer in every context, and that each kind becomes an
integer range. Neither consumer exists here. The indices never leave the module, because
the snapshot emits names. Nothing tests a range, and the family lookup is one array read
either way. The memo already absorbs the interning cost the prefix would save. A fixed
vocabulary is necessary for the prefix, but not sufficient: it also needs a reader that
compares or ranges over the integers.

The unused-zero rule held under the falsifier, and it is the half worth keeping. The tree
does not need it today, because every reader bounds by `filled`
(`lib/db/pglite/instrument.ts:598 "for (let i = 0; i < r.filled; i++) {"`) and the reset clears all four
parallel arrays together. That makes it a disciplined realization of a rule that the
technique would have made structural. No product change was shipped. The return condition
is a reader that does not bound by `filled`, or indices that leave the module (exported,
persisted, compared across processes). At that point, reserve index 0.

## What this realization cannot do

It cannot speak to the technique's home case. It has one encoding, no lexer, no reserved
words and no scopes, so the two-interner alignment and the sentinel go untested. The
costs are microbenchmarks in one process on one machine, valid for comparing the two arms
and for nothing absolute. The containment result rests on a seeded defect, not an
observed one.
