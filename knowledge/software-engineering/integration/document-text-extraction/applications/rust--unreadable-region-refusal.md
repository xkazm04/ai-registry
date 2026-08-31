---
layer: application
type: application
subject: document-text-extraction
technique: unreadable-region-refusal
stack: rust
verified_on: 2026-08-31
verified_against: rust@1.96
applied: code
ab_verdict: better
proof: ab-paired
---

# A count where the join needed a list

A desktop knowledge-base ingest reads the text layer of paginated documents
one page at a time, so that every chunk carries the page it came from and an
answer can cite a page instead of gesturing at the document. Pages that come
back with no text are almost certainly scanned images; the ingest counted them
into a column, admitted the document, and warned about the total.

The same binary also ships a recognition command, behind a vision model, that
takes a file and returns text.

## The structural fact: two halves that cannot be joined

The two capabilities compose perfectly on paper and could not be joined in
code, for a reason nobody designed. The extractor recorded **how many** pages
had no text layer and discarded **which**, at the moment it knew — the loop
that classified each page incremented a counter and continued. The recognition
command takes a document. So the system could say "four pages are scanned" and
had no way to say which four, which meant:

- The recognition path could only ever be handed the **whole file**, paying
  for every page that already had a perfectly good text layer.
- A reader given an answer citing page six could not learn whether six was one
  of the unreadable pages, because the warning was a total.

This is the count/list distinction the technique turns on, in its most literal
form: the locus existed for one loop iteration and was thrown away, and every
downstream capability that needed it was written around its absence.

A second, softer instance sits beside it. The extractor's guard that refuses a
document fires only when **every** page is unreadable — its doc comment says
so, and names the failure it was built for: a fully scanned document ingesting
"successfully" as an empty document. The partial case was never its target, and
partial documents are admitted as indexed. That is a defensible disposition for
a knowledge base and this application does not change it (see the disposition
rule in the golden path: the caller owns disposition, the extractor owns the
verdict). It is only defensible, though, once the verdict names regions — which
is what was missing.

## What was changed, and the paired comparison

**Measurable:** of the regions the extractor identified as unreadable, how
many can be named to a caller and routed to the recognition path.

Both arms are the same twelve-page input — pages 2, 5, 6 and 7 with no text
layer, the rest with a paragraph — run through the same instrument, the
project's own test target for the chunker crate.

| | A (before) | B (after) |
| --- | --- | --- |
| unreadable regions detected | 4 | 4 |
| regions **nameable** to a caller | 0 of 4 | 4 of 4 |
| routable to the recognition path | 0 of 4 | 4 of 4 |
| what the reader's digest says | `4 page(s) are scanned images` | `pages 2, 5-7 of 12 are scanned images` |
| readable pages still indexed | yes | yes |
| chunker tests | 8 passed | 12 passed |

The change is small because the information was already there and being
dropped: the page-classification loop was lifted out of the file-reading
function into a pure function over already-extracted page texts, which returns
the region list beside the chunks. That refactor is itself part of the result —
the classification is now testable without a document fixture, which is why the
arms above could be compared at all.

Three supporting facts, all verified by running the target:

- The region list survives as ascending page numbers and is rendered for
  prose-only surfaces as collapsed ranges (`2, 5-7, 12`). Both surfaces that
  report it — a one-line warning in a generated context digest and a one-line
  ingest error — show text and nothing else, so the identity has to reach the
  sentence or it is not reported. A two-hundred-page scan must not print two
  hundred numbers.
- A whitespace-only page lands in the region list rather than becoming a
  low-confidence chunk of nothing.
- The fully-scanned case is unchanged in behavior and now lists every page,
  which is what the existing refusal message can name.

Persistence needed no schema change: the ranges ride an existing nullable
metadata column on the document record that the ingest was not writing, and
which the project's export and import already carry.

## What this realization cannot do

- **The recognition path is not yet scoped to the regions.** The list now
  exists and reaches the record; nothing calls the recognition command with it.
  The technique's standard is that a refusal carrying region identities should
  have the expensive path scoped to those regions, and this tree has taken the
  first of the two steps. The saving is therefore *available*, not *realized*,
  and this application should not be read as evidence that it was.
- **Documents ingested before the change carry a count and no list**, and the
  digest falls back to the old sentence for them. There is no backfill: the
  page identity was never recorded, so it cannot be recovered without
  re-reading every source file.
- **The band between "no text" and "a full page of text" is unchanged.** A page
  holding a caption-sized scrap is scored down with a confidence float and kept
  — it is not in the region list, and by the yield-bands technique's rule a
  float is the wrong instrument for a consumer that must decide whether to
  re-acquire a region. That is a second finding this tree exhibits and this
  change does not address.
