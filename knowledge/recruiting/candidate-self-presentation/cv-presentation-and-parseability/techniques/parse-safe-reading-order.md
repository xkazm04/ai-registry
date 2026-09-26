---
layer: technique
type: technique
subject: cv-presentation-and-parseability
technique: parse-safe-reading-order
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [choosing between a single-column and a two-column CV template, placing contact details, skills or icons in a CV layout, a CV template is reported to parse badly]
---

# Parse-safe reading order

A fixed-layout document stores positioned glyphs, not sentences. Every system that reads
it - an applicant-tracking parser, a text extractor feeding a model, a screen reader -
reconstructs an order, and different systems reconstruct different orders from the same
page. Some follow the document's internal content order, some sort by position, some run
a learned column detector. The writer cannot know which the reader uses. The only layout
that yields the same text for all of them is one whose visual order and internal order are
the same and unambiguous.

What happens when they differ is not rejection - automated systems document failed parses
as causes of manual entry or thin profiles, not of automatic refusal - but it is quietly
worse: a thin or scrambled profile is searched, matched and summarised as if it were the
candidate. On the reading side, that is the failure [absence of evidence is not
evidence](../../../_laws.md#absence-of-evidence-is-not-evidence) exists to stop; on the
writing side it can simply be prevented.

## The rules

1. **One column for everything that carries identity, time or work.** Name, contact,
   headline, every role's title, employer, dates and bullets, and education sit in a single
   flow. This is the default for every template.
2. **A second column only for low-stakes, self-contained lists** - skills, languages,
   interests - and only if the round-trip test (below) shows the column extracted as one
   contiguous block after the main flow, or cleanly before it, and never interleaved with
   it. A leading parser vendor reported roughly one column CV in ten still rendering badly
   *after* a dedicated column detector; independent extractor tests show structure falling
   sharply on two columns and, in one template, a narrow sidebar losing the name.
3. **Nothing load-bearing in headers, footers, text boxes, tables, or images.** Vendor
   documentation names all of these as failure causes, contact details in a header or
   footer specifically. A page header repeating the name is fine *in addition to* the name
   in the flow.
4. **No text as graphics.** The name drawn as a vector, a heading as an image, skill levels
   as shapes, a QR code instead of a link: none survive extraction.
5. **Icons decorate, words label.** A glyph beside a phone number is fine; a glyph instead
   of the word or the recognisable pattern ("+420 ...", "name@domain") loses the label. Links
   are written out as readable text, not hidden behind an icon.
6. **No letter-spaced or character-positioned text** for headings or names; many extractors
   return it as separated letters, which breaks heading recognition.
7. **Conventional headings, real heading structure.** Section titles in the document's
   language, as headings in the document structure, so both parsers and assistive
   technology find the sections.
8. **Internal order equals visual order.** When a layout engine places blocks with a grid,
   the source order of the blocks must still be the reading order: header, summary,
   experience, education, and then any side list. Moving a block visually to the left does
   not move it in the text stream of every extractor - positional extractors will read it
   first, content-order extractors last. Only the round-trip test shows which you got.

## Decision rules

- **When a template's round-trip extraction interleaves columns or loses a field, the
  template is broken**, whatever it looks like. Fix the layout, not the extractor
  expectation.
- **When a design needs two columns for density, prefer a single column with a denser
  skills block** (a two- or three-column list *inside* one flow section, extracted as a
  contiguous run) over a page-level sidebar.
- **When unsure whether a downstream system copes with a layout, choose the one that
  does not need it to.** The candidate bears the cost of a failed parse and never sees
  it; [uncertainty resolves toward the
  candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).
- **When the owner insists on a designed layout, ship the plain version beside it** -
  the designed one for a human who asked for it, the single-flow one for any upload.

## The round-trip test

Render the document to its export format; extract its text with at least two extractors
that use different strategies (content order and positional order); then check:
the name is the first or second line; each role's title, employer and dates appear
together and in order; no line mixes text from two columns; every bullet appears exactly
once; nothing present in the source model is missing. This is the same measurement the
export technique runs on every export; here it is the acceptance test for a template.

## When not to use this

A document that will only ever be read by a person - handed over at an interview, attached
to a portfolio - may take design liberties. Most documents do not stay that way: the
moment it is uploaded, the rules apply.
