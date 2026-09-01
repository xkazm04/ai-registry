---
subject: llm-forensic-gating
domain: civic-intelligence
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# llm-forensic-gating

First touch: [[2026-08-31-awesome-agentic-patterns]], intake of a curated agentic
pattern catalogue whose real yield was its own citation-verification artifacts.
`hallucinated-reference-sweep` gained two sections and a `use_when` case.

## What the gap actually was

Not a missing opinion — a **missing half of a compound object**. The technique swept
prose for reference-shaped strings and checked each against a known set, which
settles whether a reference *exists*. The source shipped a measurement saying that
is the clean half: 413 identifiers checked, zero fabricated. The dirty half is the
attributes riding on those same identifiers — 617 venue-and-year claims, 277
verified, 36 fabricated — and the dominant shape is a real, resolving identifier
wearing a prestige venue and a year predating the document's own existence.

The technique could not see it because membership is a property of the identifier
alone, and it had explicitly bounded itself at "not a truth check on prose", which
denied one class too many: between "the reference exists" and "a bare fabricated
fact" sits a resolving reference with an invented standing. That is the enumeration
question from Phase 6 paying out — the file declared its own completeness and the
denial was slightly too wide.

The cheap corrective is intrinsic. Where an identifier encodes its issuance date, a
claimed earlier year is impossible rather than suspicious, and the citation refutes
itself from two of its own fields with no lookup.

## What the apply step actually showed

The A/B split, and the split is the useful part. Against generated research prose
citing preprints the check found 24 real contradictions and produced **zero** against
the hand-written half of the same repository — a clean discriminator. Against the
connected civic project's legislative corpus it collapsed: 114 flags, all but one
correct prose, because a statute's nearby years are *process* dates (submitted,
read, signed) and a bill submitted one year and enacted the next makes "earlier
year, later identifier" the normal case.

So the technique holds and its instrument does not transfer. That condition is now
written into the technique itself, along with the class the domain genuinely has and
the arithmetic cannot reach: **a real identifier standing where a different real
identifier was meant** — one digit apart, both genuine, membership passes. The
project's own analysts had already found one by hand and recorded it.

## Still open

- The connected project's gate is membership-only at its statute check and has no
  attribute comparison at all. The lookup that would catch a swapped-but-real
  reference (compare the citation's attributes against the register entry the
  identifier resolves to) is unbuilt and is the one lookup worth spending here.
- `plausible-date` in the same tree bounds each date globally (1993..today) and
  refuses to repair — the law arrived independently. Nothing joins a date to another
  field of the same record, which is where this whole class lives.
