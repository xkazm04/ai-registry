---
layer: technique
type: technique
subject: evidence-and-sources
technique: numbered-in-page-citations
status: forged
laws: [every-number-has-a-source-and-a-date]
shared_with: []
use_when: [building the sources list of a technical article, adding citations to figures and tables, checking that every number in a draft is traceable]
---

# Numbered in-page citations

The concern: sources kept only in a research log, or listed at the end without being tied
to the claims, do not work for the reader. They cannot tell which source supports which
number, and the list proves only that research happened. **Cite with numbers inline, link
each number to an entry in a sources list at the end of the article, show title, publisher,
date and a working link in each entry, and name the source numbers in every figure and table
caption.**
([every number has a source and a date](../../../_laws.md#every-number-has-a-source-and-a-date))

## The entry

Each sources-list entry carries, in a fixed order:

1. **Number**, matching the inline citation.
2. **Title**, as the source titles itself.
3. **Publisher or author.**
4. **Date**: the page's own date if it has one; otherwise "undated, read on" and the read
   date. A measurement entry carries the date it ran.
5. **Link**, clickable, to the specific page (a paper's abstract page, a pricing page's
   section), never to a site's front page; a DOI where one exists.
6. **Snapshot**, for a web page: an archived copy taken when the page was read. Reference
   rot is the normal fate of a cited URL (38% of pages that existed in 2013 were gone a
   decade later; one science article in five cites a web resource that has rotted), and an
   archive is not a fallback anyone else has made: across a million scholarly references, a
   representative snapshot existed for about 30%.

## Procedure

1. **Number in order of first citation.** The reader meets [1] before [2].
2. **Cite at the claim, not at the paragraph.** A number in the text carries its citation
   immediately after it. Several numbers from one source may share one citation at the end
   of the sentence.
3. **Cite in captions.** Every figure and table caption ends with its source numbers. A
   figure that combines a measurement and a published price cites both.
4. **Open every link before publication**, and confirm the page still says what is cited.
   A link that resolves to an unrelated page is worse than no link. Loading is not the test:
   where a scholarly web reference's snapshot from the citing date could be compared with
   the live page, the content had drifted for over 75% of them, and a meta-analysis of
   quotation accuracy in medical research articles found one citation in seven did not say
   what it was cited for, most of those seriously. Re-read the sentence the claim rests on.
5. **Map claims to sources in the research log**: one line per claim or figure, naming the
   source and the experiment. This is the audit trail that keeps the page and the log in
   step after edits.
6. **Check mechanically** that every inline number has an entry, every entry is cited at
   least once, and every caption names at least one source.

## Decision rules

- **Name the load-bearing source in the sentence.** Readers rarely open a citation: about
  one encyclopedia page view in 300 led to a reference click, and clicks were more common on
  shorter, weaker pages. Citing sources raises persuasion and credibility a little even
  unopened. So the number and the list are for the reader who audits, and the sentence
  carries, for the claims the post rests on, who said it and when ("the provider's
  published terms, read in October"), so that a reader who never clicks can weigh it.
- **When a source is used for one trivial fact, cite it anyway.** Selective citation
  invites the reader to wonder which uncited facts were guessed.
- **When a page is behind a login or returns an error, say so in the log**, cite a public
  page that states the same fact if one exists, and do not cite a page that was not read.
- **Inline citation style is house style**; the presence of the citation is not. Bracketed
  numbers, superscripts or linked footnote markers all work if they are consistent (see the
  `voice-and-register` subject's house-style technique).
- **On a platform that cannot render footnote links, keep the numbers and the list.** The
  reader can still match a number to an entry by eye; dropping citations because the links
  do not render loses the evidence. Where the renderer cannot produce a link at all, the
  in-sentence attribution above is the citation most readers get, and the list gives the
  URL as plain text.

## When not to use it

Short opinion pieces with no numbers, where a few inline links suffice; and documentation,
whose sources are the system itself.
