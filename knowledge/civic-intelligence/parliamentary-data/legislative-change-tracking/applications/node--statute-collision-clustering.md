---
layer: application
type: application
subject: legislative-change-tracking
technique: statute-collision-clustering
stack: node
status: forged
verified_on: 2026-08-30
verified_against: node@24
---

# Collision clustering over a national print register (Node)

The politicas repo runs the technique over the Czech Chamber of Deputies'
print register (psp.cz bulk dumps + cached bill PDFs), with the shared
primitives extracted to `scripts/case-loops/law/collision-core.ts` after two
batch scripts were caught carrying byte-copied private versions of the same
logic — the one-definition rule applied to analysis scripts, not just product
code (header, `collision-core.ts:1-13`).

## Operative slicing and the NFC lesson

`readCachedBillText` (`collision-core.ts:22-28`) concatenates every cached
text for a print and applies `normalize("NFC")` at the single read point —
batch-008's measured finding was that `pdftotext` emits the same diacritic in
two Unicode forms *within one document*, silently breaking regex literals.
`operativeSlice` (`:34-40`) cuts from the first `ČÁST PRVNÍ` / `Čl. I` marker
to the `Důvodová zpráva` (explanatory memo) heading, so memo citations of
unrelated law never enter the §-set; "platné znění" companion docs carry no
memo and are used whole with the same defensive trim.

## Per-statute partitioning of omnibus bills

`partitionParagraphsByStatute` (`:62-93`) splits operative text on `Čl. N`
article boundaries and attributes each block to the first statute citation in
its top 800 characters — the citation regex is imported from the ingest
adapter (`LAW_CITATION` in `lib/ingest/sources/psp-legislation.ts:42`), not
restated. Blocks with no citation bucket under `"unknown"` rather than being
guessed. This is the batch-004 fix for the tisk-248 false-positive class: an
omnibus bill concatenates all its amended statutes, and a flat same-§ check
"collided" §s belonging to different bundled statutes.

## Instruction-vs-citation discrimination

`instructionFormsFor` / `amendsParagraph` (`:109-136`) encode the Czech
novelization grammar as four anchored regex families ("V § N…", "§ N zní:/se
zrušuje", "Za § N se vkládá…", "§ N se odstavce…"). The clause anchor `A`
(`:118`) includes `Čl.` as an opener because `pdftotext -layout` renders an
article label and its first instruction on one line — without it, every
single-article amendment read as citation-only, and that one gap produced all
3 false drops in the first validation run. Every incidental pair hand-read in
batch-009 was the predicted class: tisk 228's "§ 15"/"§ 18" are article
numbers of its *own* new act; tisk 124/67 merely cite a § a sibling amends.
`targetedOdstavce` (`:141-151`) recovers paragraph-level targeting, including
"odst. 1 a 3" / "1 až 4" ranges, to separate same-provision clashes from
edits that merely share a § number.

## Confirmations and admitted gaps

Confirmed against the standard: single imported citation pattern with the
treaty-series negative lookahead (`Sb.(?!\s*m\.\s*s\.)`, proven on three
false edges — tisk 63→64/2017 among them, the Paris Agreement, not a law);
collisions ship as a review backlog for the driver to hand-read, never as
published conflict findings. Admitted deviation: the corpus is a cache
(`.data/law-collision-cache`), so sweep counts are floors over the prints
with readable text — and the ingest side's title-only extraction admits an
omnibus undercount in the law-amends analysis docs, with the e-Sbírka
structured amendment graph (SPARQL, dataset 007) named as the reconciliation
source rather than a replacement.
