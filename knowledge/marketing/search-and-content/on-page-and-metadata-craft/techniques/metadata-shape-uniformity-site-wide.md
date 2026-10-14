---
layer: technique
type: technique
subject: on-page-and-metadata-craft
technique: metadata-shape-uniformity-site-wide
status: forged
laws: [label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [auditing the descriptions of a site whose metadata was generated in bulk, checking a model-written batch of titles and descriptions before they ship, deciding whether unique description strings are enough, judging a sitewide description problem from a sample]
---

# Metadata shape uniformity, measured site-wide

A description can be a unique string and still be the same description. A bulk job
(a spreadsheet column piped through a template, a model asked for "a description for
each of these titles") emits one *shape* across every page: the title restated as the
opening clause, then a stock closing call to action. Every string differs, a duplicate
check passes, and the site still carries the pattern the engine's own guidance warns
about: its snippet documentation says identical **or similar** descriptions on every page
are not helpful when individual pages appear in results. The unit of that problem is
the site, not the page, so the check is a site measurement.

## The four comparisons

All four are string comparisons on a normalised pair (lowercase, punctuation dropped,
whitespace collapsed). No model, no guess about who wrote it.

1. **Templated** (high): the description opens with the title and ends in a stock
   closer ("try it free now", "get started", "learn more now").
2. **Echo** (medium): it opens with the title but adds real information after it.
3. **Duplicate** (medium): description and title are the same string.
4. **Brand-suffix leak** (low): the title's brand suffix ("... | Brand") was
   concatenated into the description body, a generation artefact no one wrote.

Rules that keep it honest:

- **Compare only titles long enough to be evidence.** A short title ("Word Counter")
  can legitimately open a sentence about itself. Set a floor of roughly 25 normalised
  characters and compare at most the first 60, so a title truncated in the description
  still matches.
- **A closer counts only at the very end of what remains after the echo is removed.**
  A page that genuinely ends on a call to action it wrote for itself, without echoing
  the title, is never flagged.
- **Grow the closer list only from phrases seen in real generated output**, never from
  intuition, because every guessed phrase is a false positive on someone's honest copy.

## Site level: a count and a share

One templated page is an oversight; three of three hundred is not a pattern. Flag the
site only when both hold: an absolute floor (three templated pages) and a share of the
sampled pages (about a tenth for medium, about three tenths for high). Report the
shared closers with their counts ("try it free now: 26") because the repeated phrase is
the evidence a person can verify in a minute.

## Decision rules

- When descriptions are generated in bulk, run the site measure on the whole batch
  before shipping, because the defect is invisible one page at a time.
- When the result is "unique strings, shared shape", rewrite the closing clause per page
  (a call to action written for this page) rather than reaching for new unique
  strings, because the shape is the defect.
- When the sample is small (under about ten pages), report the pages, not a ratio,
  because a share of a handful is a fraction pretending to be a rate.
- When the site's language is not the language the closer list was written in, say the
  closer check did not run and rely on the echo, duplicate and brand-leak comparisons,
  which do not depend on a word list.

## Conventions, labelled

The engine's snippet documentation supports the principle (descriptions should describe
the specific page; identical or similar ones across a site are not helpful). The four
comparisons, the 25-character title floor, the three-page floor and the 10 and 30
percent shares are one practitioner tool's heuristics: it states for itself that it
claims no ranking or spam update targeted this pattern, and so should a report built on
it. The measure is advisory and `heuristic` is the right label for its output.

## When NOT to use

- A single page, or a site of a few pages: there is no shape to measure; read them.
- Descriptions an editor wrote by hand: a shared house style is a voice, and the check
  would flag it. Use it on batches whose provenance is a template or a model.
- As a substitute for reading the page's snippet in the results; see
  `title-and-meta-pixel-budget` for the rendering side and the results page as verdict.
