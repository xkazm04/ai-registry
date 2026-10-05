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
description with the data available.**

## What accessibility guidance requires

The applicable success criterion requires that all non-text content have a text alternative
serving the equivalent purpose. For a chart or diagram whose content a short phrase cannot
carry, it asks for both a short label and a long description, and recommends providing the
underlying data as a table where feasible.

## Procedure

1. **Short alternative**: the figure's message, not its appearance. "Bar chart" is not an
   alternative; "Hindi takes the fewest tokens on one vocabulary and nearly four times as
   many on another" is.
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

- **The alternative carries the same message as the caption, not a copy of it.** The
  caption is read with the figure; the alternative replaces it.
- **Decorative images get an empty alternative**, so a screen reader skips them; better,
  remove them.
- **Code is never an image.** A code block keeps its text; a screenshot of code has no
  usable alternative.
- **House rules apply to alternatives.** Voice, number formatting and dated sources hold in
  alternative text too; it is written last and checked least.

## When not to use it

There is no technical article for which this does not apply; the only judgment is how long
the description must be.
