---
layer: technique
type: technique
subject: figures-and-tables
technique: captions-name-their-sources
status: forged
laws: [every-number-has-a-source-and-a-date]
shared_with: []
use_when: [writing figure and table captions, checking that every plotted value is traceable, labelling an explanatory illustration]
---

# Captions name their sources

The concern: figures are the part of an article most often copied out of it: screenshotted
into a slide, quoted in a thread, pasted into a design document. A figure whose sources live
only in the body loses them on the first copy. **Every figure and table caption ends with
the source numbers its values come from, and an illustration says it is one.**
([every number has a source and a date](../../../_laws.md#every-number-has-a-source-and-a-date))

## The caption, in order

1. **The message**, one sentence (see one-message-per-figure).
2. **How to read it**: what a mark, a colour or a position means, if not obvious.
3. **What cannot be drawn**: a definition, a caveat, an exclusion.
4. **Sources**: the numbers from the sources list, and for a derived figure, the formula
   ("tokens times the listed output price [1], [13]").

## Procedure

1. For each figure, list every value it shows and the source of each. A value with no
   source is either measured (cite the measurement) or invented (the figure is an
   illustration).
2. Label illustrations in the caption ("Illustration: arrival times are schematic") and
   avoid axis ticks that would let a reader read invented values as measured.
3. Where a figure combines sources (a measured count and a published price), cite all of
   them; the reader should be able to recompute the figure from the citations.
4. Check mechanically that every caption contains at least one source citation or the word
   marking it as an illustration.

## Decision rules

- **When a figure's sources differ by row or bar, put the citations in the figure** next to
  the labels, and the caption says so.
- **When a source date matters to the reading (a price), put the date in the caption too.**
  A copied figure then carries its own currency.
- **An image of a table carries its sources in its caption and its text alternative**, so
  the citation survives on platforms that render the table as a picture.

## When not to use it

Decorative header images, which carry no values; better still, leave them out of a
technical article.
