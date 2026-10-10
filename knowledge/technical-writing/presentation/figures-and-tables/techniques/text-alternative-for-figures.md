---
layer: technique
type: technique
subject: figures-and-tables
technique: text-alternative-for-figures
status: forged
laws: [check-the-page-where-it-is-read]
shared_with: []
use_when: [publishing figures or images of tables, preparing an article for a platform that strips or rasterizes content, reviewing alt text]
---

# Text alternative for figures

The concern: a figure that only works for a sighted reader on a wide screen with images
loaded fails for everyone else: a screen-reader user, a reader whose feed strips images, a
reader on a slow connection, and every reader of a platform that forces a table to be
published as a picture. **Give every figure a text alternative that serves the same purpose:
a short alternative for the image, and for a chart, diagram or table image a longer
description with the data available. The alternative says what the figure shows, in
neutral words; the author's interpretation stays in the caption.**

## What accessibility guidance requires

The success criterion itself says one thing: all non-text content presented to the user
has a text alternative serving the equivalent purpose. The rest comes from W3C's
informative documents. The Images Tutorial says a complex image needs "a two-part text
alternative", a short one and a long description. The criterion's Understanding page shows
a bar chart whose short label names the figure and whose long description gives the chart
type, a summary of the data and trends, and "where possible and practical, the actual data
is provided in a table". Cite each for what it says.

## What readers of alternatives ask for

Two studies with blind and low-vision readers, read 2026-10-10:
- Ranking four levels of description (construction; statistics; perceived trends;
  context and interpretation), blind readers found the statistics and the trends most
  useful, and 63% (n = 19) were emphatic that a description should not contain the
  author's interpretation or editorializing. Sighted readers preferred the
  interpretation. Chart type and axes alone were "almost useless", but useful alongside
  the rest (Lundgard and Satyanarayan, 2022).
- 11 of 22 participants said naming the chart type helps, especially at the start; the
  resulting guideline opens the alternative with the chart type, keeps the tone
  objective, and asks for a data table (Jung et al., 2022).

## Procedure

1. **Short alternative**: the chart type, the topic, and the key fact in neutral words.
   "Bar chart" alone is not an alternative, and neither is the author's conclusion. "Bar
   chart of tokens per word for twelve languages on two vocabularies; Hindi takes nearly
   four times as many on one as on the other" is. The conclusion the writer draws from it ("the cheapest
   vocabulary differs by language") belongs to the caption.
2. **Long description, for data figures and table images**: the key values in a sentence or
   two, or the full data as a text table beside or below the image, or linked from the
   caption.
3. **For an image of a table**, the text alternative carries the table's content: on a
   platform without native tables, the rasterized table is otherwise invisible to search,
   copy and assistive technology.
4. **Check the alternative where it is read**: with images off, and in the target platform's
   own rendering, which may drop or truncate alternative text
   ([check the page where it is read](../../../_laws.md#check-the-page-where-it-is-read)).

## Decision rules

- **The alternative and the caption do different jobs.** The caption is read with the
  figure and states the author's message; the alternative replaces the figure and states
  what it shows, so a reader who cannot see it can draw the conclusion, or a different
  one. Copying the caption into the alternative gives that reader the interpretation
  without the evidence.
- **An image of text takes that text as its alternative.** A social card or banner that
  shows a title and a description has those words as its alternative, not a fixed site
  name shared by every page; when the image is generated from data, generate the
  alternative from the same data.
- **A generic fallback is not an alternative.** A renderer that fills a missing
  alternative with a word such as "Illustration" hides the omission from every check;
  fail the build, or render the image as decorative and flag it.
- **Decorative images get an empty alternative**, so a screen reader skips them; better,
  remove them.
- **Code is never an image.** A code block keeps its text; a screenshot of code has no
  usable alternative.
- **House rules apply to alternatives.** Voice, number formatting and dated sources hold in
  alternative text too; it is written last and checked least.

## When not to use it

There is no technical article for which this does not apply; the only judgment is how long
the description must be.
