---
layer: golden-path
type: golden-path
subject: figures-and-tables
status: forged
use_when: [deciding which parts of a technical article become figures or tables, designing or reviewing an article figure, writing captions, turning a text-heavy draft into a visual one]
techniques:
  - one-message-per-figure
  - label-length-figure-text
  - designed-comparison-tables
  - captions-name-their-sources
  - text-alternative-for-figures
---

# Figures and tables

A technical article carries two kinds of material. Some of it is reasoning: why a mechanism
behaves as it does, what follows, where it stops. Some of it is structure: a comparison
across systems, a sequence of steps, a set of numbers, a path through components. Prose is
the right vehicle for the first and a poor one for the second; a figure or a table is the
reverse. The craft of this subject is sorting the two and making each vehicle do only its
own job ([figures abstract, prose explains](../../_laws.md#figures-abstract-prose-explains)).

Drafts fail in both directions, and the two failures were named in the same review. **Pure
text blocks**: three or four paragraphs walking through where a cost is collected, which a
table would show at a glance. **Figures overflowing with text**: boxes holding whole
sentences, arrows labelled with clauses, a diagram that is a paragraph with borders. The
first wastes the reader's attention on structure; the second wastes the figure. A reviewer's
words for the second are worth keeping: images "should abstract concept and visualize
graphically, for text dominant information we have paragraphs".

## What a principal practitioner holds true

**Every figure has one message, and the caption states it first.** A guide to better
scientific figures lists "identify your message" and "message trumps beauty" among its ten
rules, and defines the caption's job: it "explains how to read the figure and provides
additional precision for what cannot be graphically represented". A figure whose message
cannot be written in one sentence is two figures, or none. See one-message-per-figure.

**Text inside a figure is labels.** Short noun phrases, numbers with units, two to six
words per node. Anything longer belongs in the caption or the paragraph beside it. The same
guide bans decoration that tells the viewer nothing new; a sentence inside a box is the
textual form of that decoration. See label-length-figure-text.

**Comparisons are designed tables.** When the material is several items compared on
several attributes, a table is the figure. Designed means more than a grid: a published set
of table guidelines puts the header apart from the body, uses subtle dividers instead of
heavy gridlines, right-aligns numbers, left-aligns text, chooses an appropriate precision,
removes repeated units, highlights the outliers and groups related rows with white space.
A heat-shaded cell or a for/against tag can carry a judgment the eye reads before the
number. See designed-comparison-tables.

**Captions carry the evidence.** Every figure and table caption ends with the source
numbers its values come from, and a figure that is an illustration rather than data says so
([every number has a source and a date](../../_laws.md#every-number-has-a-source-and-a-date)).
See captions-name-their-sources.

**A figure has a text alternative.** Not every reader sees the image: a screen reader, a
failed load, a feed that strips images, a platform that must render a table as a picture.
Accessibility guidance requires a text alternative serving the same purpose, and for a
chart or diagram a short label plus a longer description, with the data available as a
table where feasible. See text-alternative-for-figures.

## When material becomes visual

The working rule from the contest that produced this subject: **wherever three or more
paragraphs carry a mechanism, a comparison, a sequence or a set of numbers, they become a
figure or a designed table.** Applied to one article it turned a four-paragraph passage on
collection points into a table, a quality-evidence discussion into a for/against/limit
table, and a vocabulary-building explanation into a flow figure with a ladder of positions.
What stays in prose is the reasoning that connects them.

The reverse rule matters as much: **text-dominant material stays in paragraphs.** An
argument, a qualification, a story, a position: putting these into a figure produces the
overflowing diagram. Fewer, cleaner figures beat many crowded ones.

## Distinctions that matter

- **Figure versus illustration.** A data figure plots measured or cited values; an
  illustration shows how something works with invented values. Both are legitimate; only
  the caption tells them apart, so it must.
- **Table versus list.** A list has one attribute per item; a table has several. Three
  bullets that each carry a name, a number and a verdict are a table.
- **Figure versus screenshot.** A screenshot of a tool's output is evidence, but rarely a
  figure: it carries the tool's chrome and none of the message. Redraw the part that
  matters.
- **Interactive versus static.** An interactive viewer can let an expert explore, but the
  article must make its point in a static figure first: many reading surfaces do not run
  scripts, and a reader skimming does not stop to interact.

## Failure modes of the naive reading

- **Figure count as a goal.** Many figures that each carry little; the remedy is fewer
  figures with one message each.
- **Default chart styling.** Library defaults are tuned for nobody; the figure guide's
  "do not trust the defaults" applies to colour, font size and gridlines.
- **Colour as the only channel.** A distinction carried only by hue fails for colour-blind
  readers and in one of the two colour schemes; pair it with position, label or pattern.
- **Captions that name the figure** ("Figure 3: Token counts") instead of stating its
  message ("Figure 3: The cheapest vocabulary is a different one for each language").

## Sources this subject rests on

- Nicolas P. Rougier, Michael Droettboom, Philip E. Bourne, "Ten Simple Rules for Better
  Figures", PLOS Computational Biology, 2014-09-11,
  https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003833
- Jonathan A. Schwabish, "Ten Guidelines for Better Tables", Journal of Benefit-Cost
  Analysis 11(2), 2020, https://doi.org/10.1017/bca.2020.11 (guideline titles read via a
  2020 practitioner summary, https://themockup.blog/posts/2020-09-04-10-table-rules-in-r/,
  on 2026-10-05; the paper itself was not opened).
- W3C, Understanding WCAG 2.2, Success Criterion 1.1.1 Non-text Content,
  https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html
- A writing contest's owner review (2026-10-05): "Large amount of pure text blocks" and
  figures "overflowing with text".
