---
layer: technique
type: technique
subject: legislative-change-tracking
technique: statute-citation-extraction
status: forged
laws: [one-definition-one-import, disclose-never-repair]
shared_with: []
use_when:
  - linking a bill to the statutes it amends
  - parsing legal citations out of free text
---

# Statute citation extraction

Most legislatures never publish a structured bill→statute field; the only link
between a bill and the law it would change is the citation convention embedded
in the bill's official title and body — "no. N/YYYY of the collection", in
whatever national form. This technique turns that free text into edges of the
amendment graph, and its whole difficulty is that the citation shape is shared
by things that are *not* the statute collection.

## Procedure

1. **Write one pattern for the national citation convention** — the number,
   the year, the collection marker, with tolerant whitespace, because titles
   are typed by humans and reformatted by publishing systems. Normalize the
   captured number (strip leading zeros) so "007/1995" and "7/1995" are one
   statute, and dedupe per document: a bill that cites a statute five times
   amends it once.
2. **Enumerate the near-miss collections and exclude them structurally.**
   Every jurisdiction has sibling numbering series that share the citation
   shape — a treaty series, a regulatory or municipal gazette, an
   international-agreement collection — usually distinguished only by a short
   suffix after the collection marker. Encode the exclusion as a negative
   lookahead (or equivalent) inside the one pattern, not as a downstream
   filter someone can forget to apply.
3. **Define the pattern exactly once and import it everywhere.** The same
   citation regex is needed by the ingest adapter, by any full-text analysis
   of bill documents, and by validation scripts. A restated copy will drift —
   and when it drifts, the two consumers will disagree about which edges
   exist, which in this domain means disagreeing about which statute a named
   sponsor is amending.
4. **Extract from the narrowest authoritative text available.** Titles are
   the safest source (the drafting convention requires the amended statute in
   the title); full documents require slicing to the operative text first,
   because explanatory memos cite unrelated law liberally.

## Decision rules

- **When a match's collection suffix is ambiguous, drop the edge and count
  the drop** — a missing edge is an admitted gap; a wrong edge is a
  fabricated claim about what a bill does. Never "repair" an ambiguous
  citation to the more likely collection.
- **When the same number/year appears in two collections, treat shape-match
  as zero evidence.** The exclusion must be proven against real false edges,
  not assumed: harvest cases where the naive pattern linked a bill to a
  treaty or regulation of the same number, and keep those cases as regression
  fixtures next to the pattern.
- **When extraction runs over titles only, say so at the published surface.**
  Title extraction undercounts omnibus bills by construction — a title
  summarizes, and long amendment lists get abbreviated to "and other related
  statutes". The graph is a floor, not a census; present it as one.
- **When a structured amendment graph exists elsewhere** (a legal-information
  system, an official consolidation database with a query endpoint), treat it
  as a second, differently-biased source to reconcile against — not as a
  replacement that retires the extraction. The structured side typically lags
  pending bills; the free-text side undercounts targets. Each covers the
  other's blind spot, and disagreements between them are review queue items,
  not tie-breaks.

## When not to use it

Do not use citation extraction to claim *what kind* of relationship the bill
has with the cited statute. A citation proves pointing, nothing more — the
bill may amend it, repeal it, merely reference it as context, or quote it.
Upgrading a citation to an amendment claim is the job of the instruction
grammar, and skipping that step converts every cross-reference in the corpus
into a false amendment edge. Likewise, do not run the extractor over a bill's
explanatory memo: memos discuss the whole legal landscape, and every statute
they mention would enter the graph as if the bill touched it.
