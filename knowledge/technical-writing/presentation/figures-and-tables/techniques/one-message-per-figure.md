---
layer: technique
type: technique
subject: figures-and-tables
technique: one-message-per-figure
status: forged
laws: [figures-abstract-prose-explains]
shared_with: []
use_when: [planning the figures of a technical article, writing a figure's caption, reviewing a figure that tries to show everything]
---

# One message per figure

The concern: a figure drawn to "show the data" shows whatever the reader happens to look at
first. A figure drawn to make one point shows that point and lets the data support it.
**Decide the single message before drawing; state it as the caption's first sentence; draw
only what makes that message visible.**

## Procedure

1. **Write the message as a sentence before drawing**: "The same word takes one token on
   one vocabulary and eight on another." If it cannot be written as one sentence, the
   figure is two figures or a table.
2. **Choose the form from the message, not from the data.** A comparison of magnitudes is
   bars on a common baseline; a change over versions is a slope or a ladder; a sequence is
   a flow; a composition is a stacked unit, never a pie with many slices; a path through a
   system is nodes and arrows.
3. **Remove everything that does not serve the message.** Gridlines that no reader uses to
   read a value, a legend that could be direct labels, decoration, a third dimension. The
   figure guide's phrase is that any decoration that tells the viewer nothing new must go
   ([figures abstract, prose explains](../../../_laws.md#figures-abstract-prose-explains)).
4. **Make the message the most visually prominent element.** The bar that carries the
   point is the one highlighted; the rest are context in a muted tone.
5. **Write the caption**: the message first, then how to read the figure (what a mark
   means, what the axis is), then what cannot be drawn (a caveat, a definition), then the
   source numbers.

## Decision rules

- **When the figure needs a paragraph in the body to explain how to read it, the figure is
  wrong.** Simplify the form until the caption can do that job.
- **When two messages compete, split the figure.** Two small figures with one message each
  are read; one large figure with two is studied, if at all.
- **When the message is a single number, it is not a figure.** Put the number in a sentence
  at the stress position.
- **Do not adapt one figure to every medium unchanged.** A figure designed for a wide
  screen loses its labels at a narrow width; the figure guide's "adapt the figure to the
  support medium" applies to the reading column and the phone (see the
  `medium-format-fidelity` subject).

## When not to use it

Exploratory dashboards and interactive viewers, whose job is to let the reader find their
own message. An article may include one as a supplement, after the static figure has made
the point.
