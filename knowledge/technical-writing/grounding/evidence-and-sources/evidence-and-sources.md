---
layer: golden-path
type: golden-path
subject: evidence-and-sources
status: forged
use_when: [researching a technical article before drafting, deciding which data a comparison may use, building the sources list and in-page citations, reporting the article's own measurements, reviewing a draft for unsupported or stale numbers]
techniques:
  - dated-current-data
  - counter-evidence-alongside-the-thesis
  - numbered-in-page-citations
  - own-measurement-disclosure
  - inference-labelled-as-inference
---

# Evidence and sources

A technical article is a set of claims a reader may act on: change a budget, re-key a
cache, pick a model, quote a number in their own design document. The craft of evidence is
making every one of those claims checkable from the page itself, true of the world the
reader lives in, and honest about where it stops.

The naive version treats sources as a list at the end, collected after the writing, that
proves the author did research. It fails in four ways a practitioner recognizes at once.
The numbers in the text cannot be traced to any particular entry. The entries are undated,
so a reader cannot tell a current price from one two model generations old. The list holds
only the sources that agree. And the article's own measurements, often its most valuable
content, appear as bare numbers with no method, indistinguishable from a guess.

## What a principal practitioner holds true

**A number is a claim about a source on a date.** Every number in the text, every table
cell and every plotted value traces to one numbered source, and that source shows the date
the page was read or the measurement run
([every number has a source and a date](../../_laws.md#every-number-has-a-source-and-a-date)).
Prices, model versions, benchmark results and vocabulary sizes change on a schedule of
months; a reader who cannot see the date cannot tell whether the number still holds.

**Current means what a reader can use today.** The comparison is between the systems in use
now. In a field that moves by model generation, a table built on last generation's systems
is not evidence about the present, however rigorous it was. Older data earns a line as
history, labelled, and rarely a column
([current data or labelled history](../../_laws.md#current-data-or-labelled-history)).
See dated-current-data.

**The counter-evidence is part of the claim.** Every thesis worth a post has evidence
against it, cases where it does not hold, and questions the evidence does not settle. A
post that presents them beside the thesis, ideally in one designed table with the claim,
the evidence for, the evidence against and the limit, is believed by experts; one that
omits them is discounted by the first expert who remembers the omitted paper
([a claim travels with its counter-evidence](../../_laws.md#a-claim-travels-with-its-counter-evidence)).
A documentation framework for explanatory writing says the same in its own terms:
explanation must consider alternatives and counter-examples. See
counter-evidence-alongside-the-thesis.

**Sources work in the page.** Numbered inline citations link to a sources list at the end;
each entry shows title, publisher, date and a working link; every figure and table caption
names the source numbers it draws on. The research log beside the article may hold more,
but the reader's evidence is in the page. See numbered-in-page-citations.

**The article's own measurement is a source like any other.** It gets a number in the
sources list, is stated impersonally where it first appears, and its commands, versions and
inputs are logged where a reader can repeat it. A measurement that cannot be repeated is an
anecdote with decimals. See own-measurement-disclosure.

**Inference is labelled.** Some of a post's best content is reasoning beyond the evidence:
a cost derived by multiplying a measured count by a published price, a likely explanation
for an observed regression, a consequence the sources imply but do not state. That content
is legitimate and must be labelled as inference, with its inputs cited, so the reader can
weigh it differently from a measurement. Illustrations built to explain a mechanism rather
than report data are labelled as illustrations. See inference-labelled-as-inference.

## Failure modes of the naive reading

- **The orphan number.** A figure in the prose with no citation, often the most quoted
  number in the post.
- **The undated price.** A per-unit price with no date, in a market that reprices quarterly.
- **The stale table.** A carefully sourced comparison of systems the reader can no longer
  buy. Rigorous and irrelevant.
- **The one-sided list.** Twenty sources, all supporting.
- **The decorative citation.** A reference that does not resolve, an identifier pointing at
  an unrelated paper. Field guides to generated text list broken links and invalid
  identifiers among their signs; every citation is opened before publication.
- **The silent measurement.** "Hindi costs 1.6 times as much" with no corpus, tokenizer,
  version or date. True, perhaps, and uncheckable.
- **The disguised inference.** A derived cost presented with the same confidence as a
  measured count.

## The research log and the page

The page carries what the reader needs to check a claim. A research log kept beside the
draft carries what the next author needs to repeat it: each source with the date it was
opened and what it contributed, a claims-to-sources map, the exact commands and versions of
every measurement, the sources opened and not used with the reason, and leads the research
turned up that belong elsewhere. Keeping the log during research rather than after is what
makes the in-page citations cheap: the number and its source were recorded together.

## What this subject does not own

What counts as proof in a marketing claim, and how missing proof is handled in sales copy,
belongs to the `marketing` bundle. Binding a generated visual to a cited fact in a video
belongs to the `media-generation` bundle. This subject owns the technical article's
evidence: currency, counter-evidence, citation mechanics, own measurement and the labelling
of inference.

## Sources this subject rests on

- Diataxis, "Explanation", https://diataxis.fr/explanation/: explanation must consider
  alternatives, counter-examples or multiple approaches.
- "Wikipedia:Signs of AI writing",
  https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing, read 2026-10-05: broken
  external links and invalid identifiers among the signs of unreviewed generated text.
- Julia Evans, "Patterns in confusing explanations", 2021-08-19,
  https://jvns.ca/blog/confusing-explanations/: unsupported statements as a named pattern.
- A writing contest's owner review (2026-10-05) named currency and in-page citation as
  defects: tables built on a previous-generation model's data were "not very relevant
  nowadays", and "not all variants work with sources".
