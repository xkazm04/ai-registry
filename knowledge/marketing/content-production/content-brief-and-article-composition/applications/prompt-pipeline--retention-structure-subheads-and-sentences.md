---
layer: application
type: application
subject: content-brief-and-article-composition
technique: retention-structure-subheads-and-sentences
stack: prompt-pipeline
status: forged
verified_on: 2026-09-09
verified_against: prompt-pipeline@2026.09.06
---

# Retention structure in a command-driven SEO agent: a spec that labels its footing, and a checker that counts what the spec cannot

The open SEO agent (seven commands, reference specs, small Python checkers; commit
`a47c1ecd57016568cc791d24af9d809768d8d5ab`, 2026-09-06) realises this technique in two
layers that the technique says must both exist: a reference spec the writing command
reads before drafting, and a mechanical layout gate the page must pass before the owner
sees it. The structural fact the tree proves is the one the technique's last decision
rule states - the instructions and the check cover different things, and only the
check is enforced.

## The spec: every rule tagged by footing

`references/blog-post-retention.md` is the retention spec. Line 7 states the labelling
contract the bundle's convention law demands: *"Every rule below is tagged [E]
evidence-backed or [C] practitioner convention. Never present a [C] rule as fact."* The
rules the technique tabulates land with their tags:

- Lines 13-26 carry the reading numbers - 20-28% of words read, 4.4 seconds per extra
  100 words, median scroll ~50%, 55% of pageviews under 15 seconds, the +124% compound
  rewrite - all `[E]`.
- Line 60: *"Subhead every 150-300 words. [E for the pattern, C for the interval]"* -
  the exact split the technique's table makes.
- Line 69: *"Sentences average 14-17 words. Past 25 is a rewrite. [E]"* with the
  comprehension curve at lines 70.
- Line 72: paragraphs of one idea, two to four lines, tagged `[C, derived from E]`.
- Line 79: bold one or two phrases, `[E for effect, C for the count]`.
- Line 94-95: the loop-closing rule carries the correction the technique repeats - the
  unfinished-things-are-memorable claim *"did not survive meta-analysis"*, the
  resumption effect did.
- Lines 200-208 are the seven-question test run on every draft, starting with *"Read
  only the subheads. Do they tell the whole story?"*

`.claude/commands/blog-post.md:8` makes the spec a required read (*"the 41 retention
rules - subhead every 150-300 words, answer in the first 40-50 words"*) and line 46
sets *"hero + one visual per ~350 words"* - the visual interval the checker below
enforces as a constant.

## The checker: layout, because sections were not enough

`code/check_page_rhythm.py` exists because of an incident its docstring records (lines
7-10): a design-token check policed tokens, a copy check policed copy, *"Nothing
policed the LAYOUT, which is how a service page shipped with zero images, zero forms
and eight text cards in a row, and a blog post shipped at 9,600 pixels of unbroken
paragraphs. Both had every required section."* Line 12: *"Instructions get skipped.
This does not."* That is the technique's first decision rule as a lived lesson.

The constants at lines 26-30 are the technique's convention rows made executable:

| Constant | Value | Technique row |
| --- | --- | --- |
| `MAX_TEXT_RUN` | 2 | No more than two text-only blocks in a row |
| `MAX_SENTENCES` | 4 | Paragraphs of two to four sentences |
| `WORDS_PER_VISUAL` | 350 | Something to look at within ~350 words |
| `TOC_MINUTES` | 6 | Table of contents past a six-minute read |

Line 33 defines what counts as visual - `<img`, `<svg`, `<video`, `<iframe`, `<table`,
`<form`, `<ol`, `<figure` - with the comment *"A bordered div of grey text is not one of
them"*, and `longest_text_run` (lines 80-98) walks the rendered HTML rather than
component names for exactly that reason. `gap_without_visual` (101-104) measures the
longest word stretch between visuals; `long_paragraphs` (107-113) counts paragraphs over
four sentences. `check` (116-151) fails a page with no photographs at all, a text run
over the cap, a gap over 350 words, any long paragraph, or a blog post over six minutes
with no "on this page" block. The command runs it as a gate (`blog-post.md:52-56`):
*"the gate decides when you're done, not you"*.

## What the tree proves, and where it stops

**Confirmed:** the two-layer shape - a spec for the writer, a counter for the page -
and the explicit footing labels. The checker's four constants are the technique's
conventions, and the spec says they are conventions.

**Deviation, and the structural fact:** the checker does not measure sentence length
or subhead interval. `MAX_SENTENCES` counts sentences per paragraph; nothing computes
words per sentence, and nothing counts words between headings. The spec's two most
quoted rules - 14-17 words per sentence at line 69 and a subhead every 150-300 words
at line 60 - are therefore instructions of the kind line 12 says get skipped. A page
of 24-word sentences under 500-word sections passes `check_page_rhythm.py` as long as
it has a picture every 350 words and no paragraph over four sentences. The technique's
third procedure step - measure sentence and paragraph length mechanically - is
half-realised here.

**Deviation on scope:** the gate is route-level against a running dev server (line
24, `BASE = "http://localhost:3000"`), so it cannot run on a draft before rendering,
and the service-page rule at lines 145-149 mixes a conversion assertion (*"no form - a
money page with no lead capture is not a money page"*) and a proof-tone assertion
(*"a section apologises for having no proof"*) into a rhythm checker. Both are right
rules; both belong to other subjects' gates.

**Upward lesson taken into the technique:** the definition of "visual" by rendered
content rather than by component name (line 33 and lines 80-86). The technique's
fourth procedure step is that comment generalised.
