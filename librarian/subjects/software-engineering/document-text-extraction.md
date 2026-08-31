---
subject: document-text-extraction
domain: software-engineering
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# document-text-extraction

First touch, and a birth: [[2026-08-31-anydoc]], intake of a vendor's Rust
document-conversion crate, operator-directed at OCR. Forged in-session from a spec
(`docs/plans/document-text-extraction-spec-2026-08-31.md`) by one dispatched worker under
this session's review. Golden path plus five techniques and one application.

## Why the hole existed

`research-map` returned **no prior art for "ocr", "decompression bomb" or "amplification"**
across 340 subjects in 8 bundles. Three neighbours each stopped at a stated boundary:
`import-normalization` grades loss per *format pair* at mapping-authoring time and
structurally cannot express "page seven of this upload"; `error-handling` assumes the
failure already exists and decides what happens to it; and the recruiting bundle's CV
subject says "never let loss masquerade as absence" about persuasive documents written by
people, with fairness as its failure model.

So the missing thing was not an opinion - it was the **verdict layer** for a converter
whose loss is per-region-of-one-instance and discovered at extraction time.

## The spec was wrong once, and that is the note's point

The spec claimed `structural-amplification-caps` had no prior art.
`import-normalization/import-validation` already owns bounded parsing: byte caps, depth
caps, entity caps, refusals naming the limit, and "write the rationale beside the number".
The worker caught it and drew the line in prose on this side - **that technique bounds the
input, this one bounds the amplification factor** - which is the half that survives. Two
of the spec's three proposed rules for that technique were already covered.

The lesson for the next run over this ground: a `research-map` empty for a *phrase*
("decompression bomb") is not an empty for the *concern*. The concern was covered under
another name one subject away, in the same category. Read the neighbour's techniques, not
just its golden path, before asserting a gap.

## Still open

- **Escalation is not yet region-scoped anywhere observed.** The technique holds the
  stricter standard (scope the expensive path to the refused regions when the refusal
  carries their identities); the source carries the region list and still sends the whole
  document, and so does the applied project. One deviation is a deviation; a second would
  be evidence the standard is wrong.
- **`extraction-yield-bands` is the thinnest of the five** and says so. Its `corrupt`
  band - text that came back present, plentiful and wrong through an unverified character
  mapping - rests on a single observed instance.
