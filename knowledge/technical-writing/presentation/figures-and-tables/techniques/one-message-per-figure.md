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
   a flow; a share of one whole with a few parts is a pie or a single bar; a comparison of
   parts across several items is bars on a common baseline again; a path through a system
   is nodes and arrows. The pie is not banned by the measurements: for a proportion of the
   whole, readers judged a pie as accurately as a simple bar and more accurately than a
   divided bar (Simkin and Hastie, 1987). Position on a common scale wins every comparison
   across items (Cleveland and McGill, 1984). How many slices is too many is judgment;
   no study found here varies it.
3. **Remove everything that does not serve the message.** Gridlines that no reader uses to
   read a value, a legend that could be direct labels, decoration, a third dimension. The
   figure guide reports Tufte's ban on decoration that tells the viewer nothing new, and
   adds that what is chartjunk in one figure can be justified in another
   ([figures abstract, prose explains](../../../_laws.md#figures-abstract-prose-explains)).
   The measured line runs between decoration that encodes the data and decoration that
   does not. Embellished charts whose imagery carried the trend were read no less
   accurately and remembered better weeks later (Bateman et al., 2010; twenty people,
   untimed). Interesting but irrelevant material lowers learners' retention and transfer
   (a seductive-details meta-analysis, Rey 2012: small to medium effects). In an article read for
   understanding, cut decoration that encodes nothing; a pictogram that is the data may
   stay.
4. **Make the message the most visually prominent element.** The bar that carries the
   point is the one highlighted; the rest are context in a muted tone.
5. **Write the caption**: the message first, then how to read the figure (what a mark
   means, what the axis is), then what cannot be drawn (a caveat, a definition), then the
   source numbers.

## Decision rules

- **When the figure needs a paragraph in the body to explain how to read it, the figure is
  wrong.** Simplify the form until the caption can do that job.
- **The stated message must be the figure's most prominent feature.** When a caption
  names a feature the chart leaves faint, readers report the prominent feature as the
  takeaway instead (Kim, Setlur and Agrawala, 2021). Make the message the most visible
  mark, or change the message to the one the drawing shows.
- **The message is a reading the data defends, not a slant.** A title's message is
  recalled more often than the chart's even when the two disagree (Kong et al., 2018 and
  2019). That makes a message title a strong tool and a misleading one at the same cost;
  check it against the data, including the part the figure leaves out.
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
