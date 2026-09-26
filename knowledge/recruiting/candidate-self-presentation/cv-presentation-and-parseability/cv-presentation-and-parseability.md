---
layer: golden-path
type: golden-path
subject: cv-presentation-and-parseability
status: forged
use_when: [designing CV templates or a CV layout engine, choosing between one and two columns on a CV, deciding what personal data a CV shows in a given market, exporting a CV to a file a hiring system will read]
techniques:
  - scan-path-hierarchy
  - parse-safe-reading-order
  - type-scale-density-and-page-budget
  - market-conventions-and-personal-data
  - export-format-and-round-trip-verification
---

# CV presentation and parseability

A CV is read twice before anyone decides anything. A person skims it - quickly on a first
pass, closely only if the first pass succeeds - and a machine turns it into text and
fields that a search index, a matching model and every later reader will see instead of
the page. Presentation is the discipline of serving both readers with one artifact, and
the naive version of it serves neither: it optimises for how the page looks in the
designer's preview, which is the one reading that never happens.

The principle that organises the whole subject is **reading order is content.** A page
has one order the eye follows and one order the extracted text follows. When they agree,
design is free to be as good as its designer. When they disagree, the design has changed
what the document says - a job title lands beside the wrong dates, a skills column is
spliced through a role, the name disappears into a sidebar - and nothing in the preview
shows it.

## What the evidence supports, and what it does not

The popular claims about CV reading are mostly one commercial study and its echoes.

- **The first pass is short and follows a pattern.** A job-board's eye-tracking study
  (30 recruiters, 2012, unpublished method, ending in an advertisement for its own
  rewriting service) reported about six seconds per first-pass decision, most of it on
  six items: name, current title and employer, previous title and employer, the dates
  of both, and education. Its 2018 update (no n published) said 7.4 seconds and blamed
  clutter and columns without comparison data. Independent work finds longer, variable
  times - about 14 seconds of dwell per CV among 40 recruiters (2024), 12 seconds to over
  two minutes among 114 (2023, self-published) - and a peer-reviewed eye-tracking model
  finds time on the experience and education sections among the best predictors of
  advancing a candidate. **The number is weak; the pattern is robust:** titles,
  employers, dates and education are where attention goes first.
- **Layout can cost, content decides.** The one controlled layout experiment found raters
  ranked the same content lower in a "creative" layout than a formal one (90 raters,
  2010, one vacancy). A study of 200 real résumés found interview decisions predicted by
  relevant, recent, continuous experience, then degree, then achievements - formatting
  was not even coded. Good design removes friction; it does not create a candidate.
- **Parsers degrade on layout, and do not reject on it.** Applicant-tracking vendors
  document tables, text boxes, headers and footers, graphics, columns and letter-spaced
  text as causes of failed parses; the consequence is manual data entry or a thin
  profile, not an automatic rejection. A leading parser vendor reported that even after
  a machine-learned column detector, roughly one column CV in ten still rendered badly.
  An independent test of seven open-source extractors (357 runs, 2026, by a vendor that
  sells two-column templates) found words almost always recovered and *structure* lost -
  one extractor fell from 60% to 35% structure on two columns, and a narrow sidebar lost
  the candidate's name.
- **"Most CVs are rejected by software before a human sees them" is a myth** traced to a
  2012 sales claim by a vendor that closed the next year. What automated systems do
  reject on is criteria - knockout questions, credential and gap filters - which is a
  content matter.

The consequence for a builder: a layout choice is a bet on *every* downstream parser the
document will meet, most of which the author will never know about. The safe default is
the layout whose extracted order equals its visual order.

## Hierarchy is what lets a skim succeed

A reader who spends seconds on the first pass needs the six fixation targets in fixed,
predictable places, each entry built from the same pattern so the eye learns it once:
title, employer, dates on one line; bullets beneath; the same order, alignment and
weights in every entry. Hierarchy is made by size steps and weight, not by colour,
boxes or icons, and it is made with few levels - a name, section headings, entry heads,
body - because every extra level is one more thing the skim must decode.

## Density is a budget, not an aesthetic

The page budget is set by seniority and market convention, and the evidence on it is
weaker than the argument about it: a vendor simulation that favoured two-page CVs also
gave its two-page versions nearly twice the words. The defensible rule is that **length
follows relevant content**: one page is right for an early-career document and for a
market that expects it; two is normal for experienced candidates in most of Europe and
common in the US above entry level; the failure modes are a second page carrying three
orphaned lines and a first page compressed to unreadable type to avoid one. Type below
about 10 points to save a page is the wrong trade: cut content instead.

## Personal data is a market decision with a fairness price

Photographs, birth dates, marital status and signatures are expected on the page in some
markets and a liability in others, and correspondence experiments show the channel they
open: attractiveness and headscarf effects on callbacks, penalties for women who include a
photo where it is optional, persistent age discrimination. The rule this subject holds is
minimisation by default with the market's convention offered as an owner choice, stated
with its trade-off - never a default photo, never a birth date added because a template
has a slot for it. The fairness subjects of this bundle govern how a reader must *treat*
such data; this subject governs whether the writer should hand it over at all.

## The export is part of the document

The file that leaves the tool is what every reader gets, and it has properties the
preview does not show: whether it has a text layer, whether fonts are embedded, what order
the text comes out in, whether the name survives extraction, what the file is called. A
builder that never extracts its own output has not seen the document it ships. Round-trip
verification - render, extract, compare against the source model - is the only way to
know that a design change did not silently change what the CV says to a machine.

## What the naive readings get wrong

- **Designing for the preview.** The preview is the one reading that never happens.
- **The sidebar as default.** A tinted column of skills and languages is the most common
  template shape and the most common structure loss; it is acceptable only for low-stakes
  content, and never for name, contact, titles or dates.
- **Icons as labels.** A phone glyph beside a number is fine; a glyph *instead of* a
  heading or a label disappears in extraction and to screen readers.
- **Skill meters as design.** Dots and bars are both a content failure (a guess drawn as
  a measurement) and an extraction failure (they come out as nothing).
- **One template for every market.** A photo-and-birth-date layout sent to a market that
  treats both as discrimination risks - or a bare layout where a signature is still
  expected - is a presentation error, not a content one.
- **"ATS-friendly" as the whole brief.** Parse-safety is a floor. A page that parses
  perfectly and reads as a wall of text has served the machine and failed the person.

## Neighbours

What the words say - accomplishment phrasing, ordering, tailoring, skills evidence, and
the limits on machine rewriting - belongs to the sibling content-construction subject.
How a received document is extracted and repaired belongs to the career-reading subject of
this bundle; this subject is its mirror, producing documents that need no repair. How a
reader must mask or ignore identity signals belongs to the blind-screening and
adverse-impact subjects.

## What a principal practitioner holds true

- Reading order is content; a layout whose extracted order differs from its visual order
  has changed what the document says.
- The first pass reads titles, employers, dates and education; put them where the eye
  lands, in one repeated pattern.
- Hierarchy is size and weight in few steps; colour and ornament are accents, never
  structure.
- Length follows relevant content; the type size does not shrink to meet a page count.
- Personal data is minimised by default and added by the owner where the market expects
  it, with the price stated.
- A builder that has not extracted its own output has not seen the document it ships.
