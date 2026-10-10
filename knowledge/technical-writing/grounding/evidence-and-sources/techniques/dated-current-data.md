---
layer: technique
type: technique
subject: evidence-and-sources
technique: dated-current-data
status: forged
laws: [current-data-or-labelled-history, every-number-has-a-source-and-a-date]
shared_with: []
use_when: [choosing which systems and figures a technical comparison uses, refreshing a draft whose data has aged, reviewing tables for stale generations]
---

# Dated current data

The concern: in a field that moves by product generation, the most rigorous paper on a
topic is often about systems nobody uses any more, and a post that builds its tables on
that paper is rigorous about the past. Readers in the field notice in the first table. **Compare
the systems a reader can use today, measured or read at a stated date; admit older systems
only as labelled history.**
([current data or labelled history](../../../_laws.md#current-data-or-labelled-history))

## Procedure

1. **List the current set before researching.** Which systems would a practitioner choose
   between this month? Name them by their current versions. This list, not the literature,
   defines the comparison's columns.
2. **Find the data for each, at the source.** Vendor pricing pages, published files,
   standards at their current revision. Record the page's own date if it has one and the
   date it was read in all cases
   ([every number has a source and a date](../../../_laws.md#every-number-has-a-source-and-a-date)).
3. **Measure where nothing is published.** If a current system's behaviour is not published
   but its artefacts are (a tokenizer file, a model card, a public endpoint), measure it and
   cite the measurement (see own-measurement-disclosure).
4. **Say what could not be measured.** A current system whose internals are unpublished is
   named as unmeasured, with the reason, rather than silently dropped or replaced by a proxy
   presented as the real thing. If a proxy is used, the source that justifies it is cited.
5. **Admit history deliberately.** An older system appears only where the change itself is
   the point (a regression, a shrinking gap), as a visually de-emphasized column or one
   sentence, labelled as history.
6. **Re-read every dated source on the day of final edit.** Prices and versions move during
   drafting; the opening's numbers go stale first.

## Decision rules

- **When the only published study uses old systems, use it for the mechanism, not for the
  numbers.** The mechanism usually survives a generation; the magnitudes do not. Re-measure
  the magnitudes on current systems or say they are from the older generation.
- **When a current figure contradicts an older paper, report both and the date of each.**
  The disagreement is information: the effect is changing, and the direction matters.
- **When a page has no date, the read date is the only date.** Say "undated page, read on"
  rather than inventing a publication date.
- **A post's date dates its numbers only until someone edits them.** When a figure changes
  after publication (corrected, re-measured or removed), the post shows an updated date or
  the changed figure carries its own. A publication date that stays put through edits to the
  numbers tells the reader the wrong age.
- **A version name is part of the number.** "A tokenizer" is not a source; the named
  vocabulary at its version is.

## When not to use it

Historical posts, whose subject is how something changed; there older generations are the
content, and the rule inverts: each one is dated, and the present is the labelled
contrast.
