---
layer: technique
type: technique
subject: figures-and-tables
technique: visual-cadence
status: forged
laws: [figures-abstract-prose-explains, depth-by-replacement-not-addition]
shared_with: []
use_when: [reviewing a well-researched draft whose paragraphs have grown chunky, deciding where a figure or table belongs, shortening a section without losing content]
---

# Visual cadence

The concern: a post can be factually excellent and still read as a wall. Research-heavy
paragraphs run long, the writer answers review findings by adding sentences, and the
figures that exist cluster in a few places while whole stretches carry none. The owner's
review of the first full pipeline run put it plainly: the paragraphs "get sometimes too
chunky without visual help". **No more than two consecutive prose paragraphs run without a
visual element, and the visual is bought by shortening the prose it replaces.**

## What counts as a visual element

Anything the eye can use to rest and re-enter: a figure, a designed table, a code block, a
compact diagram strip (a one-line flow with four nodes), an annotated snippet, a callout
box holding one fact and its number. A small visual counts; the rule is a cadence, not a
quota of large figures. A pull-quote or a decorative image does not count: it carries no
information (see label-length-figure-text).

A list counts when it carries structure: a numbered sequence, or parallel items with the
same attributes. A heading does not count; it is navigation, and a run of prose under a
new heading is still a run. Neither does a one-line italic or bold "lead-in" paragraph.

The two-paragraph limit is a working convention from one review, like the label budget;
no study found sets a number of paragraphs between visuals. Treat a run of three as a
prompt to look, not as a defect by itself.

## Two jobs a visual does

1. **Spare mass.** When a paragraph states a comparison, a sequence or a set of numbers,
   draw it and cut the paragraph to the reasoning the drawing cannot hold (the qualification,
   the exception, the "so what"). The post gets shorter, not longer.
2. **Carry the hard part.** In the technically hardest passage, a mechanism with several
   moving parts, a diagram beside the text lets a newcomer follow and lets an expert check
   the reading against the picture. For the expert the diagram helps only when the text it
   repeats is cut: as expertise rose, the best design moved from diagram with integrated
   text to diagram with the text eliminated (Kalyuga, Chandler and Sweller, 1998).

## Procedure

1. Mark the draft's paragraphs P and its visual elements V in order. Find every run of
   three or more consecutive P. That is the finding list; each run names its span.
2. For each run, decide which of the two jobs applies and pick the smallest visual that does
   it: a three-row table, a flow strip, a labelled snippet, a number callout.
3. Write the visual, then cut the paragraph it replaces. A visual added on top of an
   unchanged paragraph repeats it and counts as padding (see
   [depth by replacement, not addition](../../../_laws.md#depth-by-replacement-not-addition)).
4. Re-run step 1. A check can do it: count consecutive prose blocks between visual
   elements in the Markdown source.

## Decision rules

- **Text-dominant information stays in paragraphs.** A visual abstracts a concept into
  shapes and labels; reasoning, qualification and story do not survive that translation
  ([figures abstract, prose explains](../../../_laws.md#figures-abstract-prose-explains)).
  When a run has nothing structural to draw, shorten or split it instead.
- **Every visual still obeys the figure rules:** one message, labels of a few words, a
  caption with source numbers, a text alternative. A small visual is not exempt.
- **A critique round that asks for more material is answered by replacement.** Accepted
  findings are met by changing sentences, not appending them; the cadence is re-checked
  after the round.
- **On a renderer with no figure, table or code block, the cadence is met with structure,
  not decoration.** The smallest visual is a numbered list for a sequence or a parallel
  list for a comparison (see designed-comparison-tables). A run that is reasoning, not
  structure, is shortened or split. A bold label on its own line is not a visual.
- **Do not satisfy the rule with repeats.** The same table drawn three times is a
  different defect; each visual carries its own message.

## When not to use it

Fiction-like narrative sections where an interruption breaks a story the reader is in, and
short posts under about a screen and a half. Even there the opening scene's sequence often
earns a small timeline.
