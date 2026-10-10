---
layer: technique
type: technique
subject: figures-and-tables
technique: label-length-figure-text
status: forged
laws: [figures-abstract-prose-explains]
shared_with: []
use_when: [drawing a diagram or flow figure for an article, reviewing a figure that contains sentences, redrawing a text-heavy diagram]
---

# Label-length figure text

The concern: the most common defect in article diagrams is not ugliness but text: boxes
holding sentences, arrows labelled with clauses, call-outs that are paragraphs. Such a
figure is harder to read than the paragraph it replaced, because the reader now has to find
the reading order as well as read the words. **Text inside a figure is labels and short
annotations; everything longer goes to the caption or the prose.**
([figures abstract, prose explains](../../../_laws.md#figures-abstract-prose-explains))

## The budget

| Element | Budget |
|---|---|
| Node or box label | Two to six words, a noun phrase |
| Arrow label | One to three words, a verb or a quantity |
| Axis title | A noun and its unit |
| Data label | The number and its unit |
| Annotation | One short phrase pointing at one mark |

These are working limits, not measured thresholds; their purpose is to make "this is a
sentence" a visible violation. No study found sets a word count per label. The budget is
per element, not a cap on how many annotations a figure carries: readers in one study
preferred the charts with the most text annotations over sparser charts and over text
alone (Stokes et al., 2022, a preference measure). Relevant annotation pointing at marks
is not the defect; a paragraph in a box is.

## Procedure

1. **Count the words in each text element.** Anything over the budget is either cut to a
   noun phrase or moved out.
2. **Move explanation to the caption.** What a node does, why an arrow exists, what a
   colour means: the caption's second and third sentences.
3. **Move argument to the prose.** If a box contains a "because", the reasoning belongs in
   the paragraph beside the figure.
4. **Check at the narrow viewport.** Text that fits at a wide width wraps or shrinks below
   readability on a phone; a figure that needs its labels shortened for the phone needed
   them shortened anyway.
5. **Prefer direct labels to legends.** A label beside the line it names costs fewer words
   and no eye travel. This is the measured part of the subject: direct labelling gave
   reliably quicker readings than a key, without loss of accuracy (Milroy and Poulton,
   1978).

## Decision rules

- **When cutting the text to labels loses the meaning, the figure was carrying prose.**
  Return that material to a paragraph and redraw the figure around what is visual.
- **When the figure has more text than shapes, it is a table or a paragraph.** Decide
  which and convert it.
- **Code in a figure is a code block.** A box containing code should be a highlighted code
  block in the text, which the reader can copy.
- **Numbers inside the figure must match the text and the sources.** A figure label is a
  citation target like any other number.

## When not to use it

Annotated screenshots for a how-to, where the annotation is the instruction and a sentence
may be necessary; even there, one sentence per call-out.
