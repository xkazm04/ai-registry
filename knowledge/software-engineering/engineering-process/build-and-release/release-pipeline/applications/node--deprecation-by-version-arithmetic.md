---
layer: application
type: application
subject: release-pipeline
technique: deprecation-by-version-arithmetic
stack: node
verified_on: 2026-09-02
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Twenty-four deprecation tags, a version that never moves, and two symbols nobody calls

A single-owner web application carries its deprecations as doc-comment tags:
"deprecated, prefer X instead". The tree was read on 2026-09-02, and a
harness walked every tag through both policies without changing product
code.

## What the tree holds

| Measure | Value |
| --- | --- |
| Live deprecation tags in source | 24 |
| Tags ever added over the history | 48 |
| Tags removed over the history | 24 |
| Manifest version | one value, unchanged since 2025-05-30 |
| Oldest live tag | 2026-01-11 |
| Live tags whose deprecated module has zero remaining importers | 2 (deprecated 2026-01-18 and 2026-03-19) |
| Live tags with the most remaining references | 12 and 11 |

Half of every deprecation ever declared has been removed, so the tag is not
a no-op here; the project does retire what it deprecates. But every tag
names a successor and none names an end, so which half of the 24 live tags
is due, and which is still carrying callers, is a question nobody can answer
from the tag alone.

## The two arms

**A, as shipped:** a tag with a successor and no clock. The measurable is
the number of deprecations the tooling reports as past their promised end.
Under A that number is zero by construction, on every day, forever: no tag
carries a promised end.

**B, the technique with the operand the project actually advances.** The
manifest version has never moved, so version arithmetic has no operand
here; the honest operands are a date and a caller count. Under B each tag
carries a since date and a removal condition of "zero importers, or ninety
days", and a per-change gate scans importers. Run against the tree as it
stands, B reports two symbols past their end — the two modules with no
importers, deprecated seven and five months ago — and reports the other
twenty-two as inside their window with the caller count each still carries.

Two arms, one input, one predicate: A reports 0 of 24 due, B reports 2 of
24 due and 22 of 24 with a stated runway. The verdict is better, and the
finding carried into the technique is the operand rule: **a version that
does not move is not a clock, and the technique's comparison must be
against whatever the project genuinely advances.**

## What the structure says

The project's own history is the corroboration the source could not give.
Twenty-four removals happened without any mechanism forcing them, so the
team pays the deletion cost willingly; what it lacks is the list. The two
zero-importer modules are the cheapest deletions in the tree — no caller to
migrate, only a file to remove — and they have survived five to seven months
because nothing enumerates them. B's first pre-release list would have been
exactly those two.

## What this realization cannot do

It judges deprecations by importer count, which sees static imports and not
dynamic lookups, string-keyed registries or storage-format compatibility
shims — and two of the live tags say explicitly that they are kept for
stored-data compatibility, which no importer scan can retire. Those need a
date operand and a migration, not a caller count. The harness was a script
over the tree; nothing in the product enforces the window yet, and the row
in the applied ledger names that as the next change.
