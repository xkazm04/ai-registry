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
  - visual-cadence
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
cannot be written in one sentence is two figures, or none. Titles that state the message
are recalled more often than generic ones, and that is also the risk: readers recall a
slanted title's message even when the chart disagrees, and a caption naming a feature the
chart does not make prominent is overridden by the chart. So the stated message must be
the feature the figure makes most visible, and a reading the data defends. See
one-message-per-figure.

**Text inside a figure is labels.** Short noun phrases, numbers with units, two to six
words per node. Anything longer belongs in the caption or the paragraph beside it. The same
guide reports Tufte's ban on decoration that tells the viewer nothing new, and qualifies it
in the next breath: what is chartjunk in one figure can be justified in another. A
sentence inside a box is the textual form of that decoration. The word budget is a working
convention, not a measured threshold; a direct label beside its mark is the part with a
measurement behind it. See label-length-figure-text.

**Comparisons are designed tables.** When the material is several items compared on
several attributes, a table is the figure. Designed means more than a grid: a published set
of table guidelines puts the header apart from the body, uses subtle dividers instead of
heavy gridlines, right-aligns numbers, left-aligns text, chooses an appropriate precision,
removes repeated units, highlights the outliers and groups related rows with white space.
A heat-shaded cell or a for/against tag can carry a judgment the eye reads before the
number. A table is the figure when the reader needs exact values or the attributes are
mixed and qualitative; when the message is a pattern across many numeric cells, a graph
can be both smaller and clearer. See designed-comparison-tables.

**Captions carry the evidence.** Every figure and table caption ends with the source
numbers its values come from, and a figure that is an illustration rather than data says so
([every number has a source and a date](../../_laws.md#every-number-has-a-source-and-a-date)).
See captions-name-their-sources.

**A figure has a text alternative.** Not every reader sees the image: a screen reader, a
failed load, a feed that strips images, a platform that must render a table as a picture.
The accessibility success criterion requires a text alternative serving the equivalent
purpose. Its informative documents add the rest: a complex image needs a two-part
alternative, a short one and a long description, and for a chart the data is provided as
a table where possible and practical. What the alternative says is not the caption's
message. Blind readers in a published study ranked the statistics and the trends as the
most useful content, and most did not want the author's interpretation there. So the
short alternative names the chart type and topic and gives the key fact in neutral words,
and the interpretation stays in the caption and the prose. See
text-alternative-for-figures.

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

Both thresholds, three paragraphs here and two in visual-cadence, are working conventions
from one review. No study sets either. The evidence underneath them is that relevant
pictures with words beat words alone for learners, and that the gain shrinks for readers
who already know the material, whom redundant text beside the figure costs. That is why
the visual replaces prose rather than joining it.

**When the platform renders no figure.** Some publishing surfaces render headings, lists
and inline emphasis and nothing else: no image, no table, no code block. The structure
does not go back into paragraphs. A comparison becomes a parallel list, one item per
option, the same attributes in the same order with the same short labels; a sequence
becomes a numbered list. If the team owns the renderer and already has a table component
elsewhere, the fix is the renderer, not the prose.

## Distinctions that matter

- **Figure versus illustration.** A data figure plots measured or cited values; an
  illustration shows how something works with invented values. Both are legitimate; only
  the caption tells them apart, so it must.
- **Table versus list.** A list has one attribute per item; a table has several. Three
  bullets that each carry a name, a number and a verdict are a table.
- **Figure versus screenshot.** A screenshot of a tool's output is evidence, but rarely a
  figure: it carries the tool's chrome and none of the message. Redraw the part that
  matters.
- **Caption versus text alternative.** The caption is read with the figure and carries the
  author's message. The alternative replaces the figure and carries what it shows: type,
  topic, the key values and trend, in neutral words.
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
- **A message the figure does not show.** A caption that states a point the drawing
  leaves faint is overridden by what the drawing makes prominent; a title that slants the
  data is believed over the data. Redraw until the message is the most visible feature,
  or change the message.
- **A rule taken from folklore.** "Never a pie" is not what the measurements say: for a
  share of a whole, a pie was as accurate as a simple bar and more accurate than a divided
  one. The measured weakness is comparing parts across items.

## Sources this subject rests on

- Nicolas P. Rougier, Michael Droettboom, Philip E. Bourne, "Ten Simple Rules for Better
  Figures", PLOS Computational Biology, 2014-09-11,
  https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003833
- Jonathan A. Schwabish, "Ten Guidelines for Better Tables", Journal of Benefit-Cost
  Analysis 11(2), 2020, https://doi.org/10.1017/bca.2020.11 (guideline titles read via a
  2020 practitioner summary, https://themockup.blog/posts/2020-09-04-10-table-rules-in-r/,
  on 2026-10-05; the paper itself was not opened).
  The paper is closed access; its abstract (read 2026-10-10) bounds the table: useful for
  exact values, "not the best solution" for a lot of data or a compact space.
- W3C, Understanding WCAG 2.2, Success Criterion 1.1.1 Non-text Content,
  https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html (short and long
  alternatives; the bar-chart example's data table). W3C WAI Images Tutorial, Complex
  images, https://www.w3.org/WAI/tutorials/images/complex/ ("a two-part text alternative
  is required"). Both read 2026-10-10.
- Alan Lundgard, Arvind Satyanarayan, "Accessible Visualization via Natural Language
  Descriptions: A Four-Level Model of Semantic Content", IEEE TVCG 28(1), 2022,
  doi:10.1109/TVCG.2021.3114770 (arXiv 2110.04406). Crescentia Jung et al., "Communicating
  Visualizations without Visuals", IEEE TVCG 28(1), 2022, doi:10.1109/TVCG.2021.3114846
  (arXiv 2108.03657).
- Dae Hyun Kim, Vidya Setlur, Maneesh Agrawala, "Towards Understanding How Readers
  Integrate Charts and Captions", CHI 2021, doi:10.1145/3411764.3445443. Ha-Kyung Kong,
  Zhicheng Liu, Karrie Karahalios, "Frames and Slants in Titles of Visualizations on
  Controversial Topics", CHI 2018, doi:10.1145/3173574.3174012, and "Trust and Recall of
  Information across Varying Degrees of Title-Visualization Misalignment", CHI 2019,
  doi:10.1145/3290605.3300576. Michelle A. Borkin et al., "Beyond Memorability", IEEE TVCG
  22(1), 2016, doi:10.1109/TVCG.2015.2467732.
- Scott Bateman et al., "Useful Junk?", CHI 2010, doi:10.1145/1753326.1753716 (twenty
  participants, untimed viewing). Günter Daniel Rey, "A review of research and a
  meta-analysis of the seductive detail effect", Educational Research Review 7(3), 2012,
  doi:10.1016/j.edurev.2012.05.003 (abstract only; effect sizes not read).
- Chase Stokes et al., "Striking a Balance: Reader Takeaways and Preferences when
  Integrating Text and Charts", IEEE TVCG 29(1), 2023, doi:10.1109/TVCG.2022.3209383
  (arXiv 2208.01780).
- Brian Simkin, Reid Hastie, "An Information-Processing Analysis of Graph Perception",
  JASA 82(398), 1987, doi:10.1080/01621459.1987.10478448. William S. Cleveland, Robert
  McGill, "Graphical Perception", JASA 79(387), 1984, doi:10.1080/01621459.1984.10478080.
- Iris Vessey, "Cognitive Fit", Decision Sciences 22(2), 1991,
  doi:10.1111/j.1540-5915.1991.tb00344.x. Joachim Meyer, David Shinar, David Leiser,
  "Multiple Factors that Determine Performance with Tables and Graphs", Human Factors
  39(2), 1997, doi:10.1518/001872097778543921.
- R. Milroy, E. C. Poulton, "Labelling Graphs for Improved Reading Speed", Ergonomics
  21(1), 1978, doi:10.1080/00140137808931693.
- Slava Kalyuga, Paul Chandler, John Sweller, "Levels of Expertise and Instructional
  Design", Human Factors 40(1), 1998, doi:10.1518/001872098779480587. Richard E. Mayer,
  multimedia, coherence and spatial-contiguity principles as summarized in his chapter
  "Research-Based Principles for Designing Multimedia Instruction" (Society for the
  Teaching of Psychology, In Their Own Words).
- A writing contest's owner review (2026-10-05): "Large amount of pure text blocks" and
  figures "overflowing with text".
