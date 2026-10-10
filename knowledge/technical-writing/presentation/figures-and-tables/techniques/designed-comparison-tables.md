---
layer: technique
type: technique
subject: figures-and-tables
technique: designed-comparison-tables
status: forged
laws: [figures-abstract-prose-explains]
shared_with: []
use_when: [turning a multi-paragraph comparison into a table, designing a table of measurements or evidence for an article, reviewing a table that is a raw grid]
---

# Designed comparison tables

The concern: comparisons written as prose force the reader to build the table in their head,
and comparisons pasted as a raw grid force them to find the pattern themselves. **When
material compares several items on several attributes, make it a table, and design the
table so the comparison is visible before any cell is read.**
([figures abstract, prose explains](../../../_laws.md#figures-abstract-prose-explains))

## When a passage becomes a table

- Three or more paragraphs each describing an item on the same attributes.
- A list whose items each carry a name, a number and a verdict.
- Evidence from several studies on one question (see the `evidence-and-sources` subject's
  counter-evidence technique, whose for/against/limit table is a designed table).
- A set of locations, stages or collection points with the same properties.
- Two parallel "strengths" and "trade-offs" lists for two options, whose items pair up
  attribute by attribute: the pairs are rows, the options are columns.

## Table or graph

The guidelines' own abstract bounds the form: a table is useful for showing exact values,
and not the best solution for a lot of data or a compact space (Schwabish, 2020). The
cognitive-fit account says the same in task terms: tables for looking up values, graphs
for seeing relationships (Vessey, 1991). The bound is softer than it sounds; in one
two-experiment study tables were answered faster on every task tested, trends included,
and familiarity with the display mattered (Meyer, Shinar and Leiser, 1997). So: a table
when the reader needs exact values or the attributes are mixed and qualitative, which is
most article comparisons; a graph, or small multiples, when the message is a pattern
across many numeric cells.

## Design rules

From a published set of table guidelines, applied to article tables:

1. **Offset the header from the body**: weight or a rule, not a heavy box.
2. **Subtle dividers, not gridlines.** Horizontal hairlines or zebra shading at most.
3. **Right-align numbers** (and their headers); **left-align text.**
4. **Choose the precision**: as many significant figures as the comparison needs, the same
   in every cell of a column.
5. **Remove repeated units**: put the unit in the header.
6. **Highlight the outliers**: the cell that carries the point gets the emphasis, in weight
   or a tint that works in both colour schemes.
7. **Group related rows with white space** rather than more lines.
8. **Add a visual where the table is large**: a heat tint by value, a small inline bar.

## Procedure

1. Decide the table's message, as for any figure, and order rows and columns to show it:
   sort by the value that matters, not alphabetically.
2. Put the comparison axis the reader cares about in the columns, items in the rows; keep
   the table narrow enough for the reading column, or plan its narrow-viewport form.
3. Caption it like a figure: message, how to read it, source numbers.
4. Keep the prose that introduced the comparison to one or two sentences of interpretation.

## Decision rules

- **When a table needs more than about seven columns, split it or transpose it.** Wide
  tables scroll sideways on a phone and are read by nobody there.
- **When the target platform cannot render tables, keep the table and change its carrier**:
  an image with a full text alternative and the data available, or a code-formatted
  fixed-width block for small tables (see the `medium-format-fidelity` subject). Do not
  dissolve it back into prose.
- **When the platform renders neither an image nor a code block, the carrier is a
  parallel list.** One item per option, its name first in bold, then the same attributes
  in the same order with the same short labels; or one item per attribute when the
  question is which option wins on it. Keep it to about four options and four
  attributes, cutting to the ones that decide the choice. Two lists of strengths and
  trade-offs per option are not this: the reader still pairs the attributes up. If the
  team owns the renderer and has a table component elsewhere, extend the renderer instead.
- **Check that the renderer honours the design.** A table component that left-aligns every
  cell, ignores the alignment markers, or has no slot for a caption cannot carry rule 3
  or a caption with sources, however the table is written. Check one rendered table
  with a numeric column before relying on it.
- **A historical column is visually de-emphasized**: grey text, placed last, labelled as
  history.
- **Heat tints are a second channel, never the only one.** The number stays printed in the
  cell.

## When not to use it

Two items compared on one attribute: that is a sentence. And data meant to be looked up
rather than compared, which belongs in an appendix or a linked file, not in the article's
reading flow.
