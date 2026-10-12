---
layer: application
type: application
subject: civic-source-adapters
technique: entity-name-normalization
stack: node
status: forged
verified_on: 2026-10-10
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Node: four name folds over one Czech civic corpus, made one

The politicas repo folds Czech names at ingest into `*_norm` columns, because
its embedded engine (PGlite) ships no `unaccent` extension. The stack is Node
24, witnessed by the CI pin in `.github/workflows/ci.yml` (`node-version: 24`).

## What the tree did

The canonical fold is `asciiFold` in
`packages/czech-civic-data/src/normalize.ts`. Its header states the
technique's middle commitment almost word for word: fold at ingest, persist,
index the folded column, never fold at query time. Ingest sources import it
through `lib/ingest/normalize.ts`, and the money review already removed a
second scheme on 2026-08-12 (`foldKey` in `features/money/reviewTypes.ts`
says why: the NFD variant let đ, ø, ß, æ and œ through).

Three more folds still lived beside it:

- `fold` in `features/graph/graphLoader.ts`, the graph explorer's search.
  It used NFD plus mark stripping and trimmed but did not collapse spaces.
  Its comment called it the only place diacritics are folded.
- `foldLower` in `lib/analysis/money-feed.ts`, the roster name bridge.
- `foldCzech` in `features/budget/mirrorData.ts`, the municipality picker.
  It also did not collapse spaces.

`asciiFold` itself was a table only. Its comment justified that by saying
ď, ť and ľ do not decompose. They do; ł, đ and ø do not. A table alone keeps
the combining mark of a decomposed input, so "Nováková" arriving as base
letters plus U+0301 folded to a non-ASCII key. The project's own context
model calls a non-ASCII `name_norm` a folding defect.

## The paired test

The seam was chosen to falsify the technique's sharpest claim: two folds
that agree on 99% of inputs disagree on precisely the rare letters. No live
store was on the machine. The population is every name-like field in the
committed case payloads under `docs/data-analysis/**/payloads/`: 450 files,
1,252 distinct names, 853 of them with diacritics. Arm A ran the folds as
they were. Arm B ran one fold: lowercase, NFD, strip combining marks, then
the table, with whitespace collapsed and trimmed.

| Measure | Arm A | Arm B |
| --- | --- | --- |
| Names on which the two shipped folds disagree, letters | 0 | - |
| Names on which they disagree, whitespace | 13 | 0 |
| Graph search misses, name typed in single-spaced ASCII | 13 | 0 |
| Decomposed input folds to a key different from its composed twin | 853 of 853 | 0 |
| Persisted keys changed (floor) | - | 0 of 1,252 |
| Names A found that B loses (floor) | - | 0 |
| Token queries that lose a hit (floor) | - | 0 of 2,347 |

Positive controls ran on both sides: a stroke-letter name that arm A misses
and arm B finds, and a decomposed name that is defective under A and clean
under B.

**The rare-letter claim did not hold here.** The population has no stroke
letter at all, so the letter tables never disagreed. The folds disagreed in
the step around the table. Publisher company names carry doubled spaces
("AGEL  a.s.", "obec  Horní Němčice"), which one fold collapsed and the
other kept, so a reader typing the name normally missed it. The technique
still predicted the failure class, a second fold disagreeing with the first,
but on this corpus the disagreement lived in whitespace, not in letters.

**The decomposed-input half is insurance, not repair.** None of the stored
payload strings is decomposed today. The case-loop PDF readers already
NFC-normalize their text before matching (`scripts/case-loops/law/tiskText.ts`). The guard costs nothing on this corpus (0 keys move,
so no re-fold migration is owed), and it closes the gap for the next source
that emits decomposed text.

## What shipped

All three folds now delegate to `asciiFold`, and `asciiFold` strips
combining marks before its table lookup. A new test pins composed and
decomposed equivalence. Pushed to politicas `master` as `6420218` (the code),
`0f2ab80` (the applied row) and `d87a37b` (a comment correction). The
consumer's local master was 45 ahead and 6 behind its origin, so the three
commits were cherry-picked onto origin's tip and pushed alone. The pre-push
gate passed there: `tsc --noEmit` with 0 errors and the full vitest suite
with 4,102 tests in 372 files.

Two folds were left on purpose. `krajSlug` builds a URL slug, which is a
different contract from a name key. The hybrid benchmark's
`scripts/hybrid-bench/join.ts` keeps its frozen deterministic baseline so
earlier rows stay comparable.

## The third commitment, already built

The roster bridge already treats a folded match as a candidate.
`bridgePerson` in `lib/analysis/money-feed.ts` requires both a folded name
match and an exact birth-date match, and refuses when more than one roster
person fits. The tree implemented this commitment before anyone tested it.

## What this realization cannot do

- The measurement ran on committed case payloads, not on the live graph
  labels. Those labels come from the same publishers, but they were not
  read.
- The fold has no version stamp. A future table change still needs a
  re-fold of every `*_norm` column, and nothing records which scheme wrote
  a row.
- Unsupported characters are kept as-is rather than reported, so a letter
  outside the table and outside NFD still yields a non-ASCII key silently.
