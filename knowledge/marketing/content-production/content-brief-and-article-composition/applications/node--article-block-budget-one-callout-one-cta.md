---
layer: application
type: application
subject: content-brief-and-article-composition
technique: article-block-budget-one-callout-one-cta
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# The block budget in a TypeScript content workspace: stated in the prompt, absent from the gate

The Czech-first adtech marketing workspace (commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08; Node 24 per `package.json`
engines and the CI pin) turns an approved brief into an article as a typed `Block[]`
body plus `FaqItem[]`. Its brief prompt and article prompt state this subject's
composition rules almost verbatim. Its validators enforce something else. That gap is
the structural fact this application records.

## The brief: counts in the prompt, ceilings in the normaliser

`src/lib/ai/tools/brief.ts` is the brief tool. The system prompt (lines 20-30) states the
triple placement rule the brief technique names - the primary keyword *"exactly in the
given wording"* once each in the title tag, the meta description and *"the heading of
the FIRST H2 section"* (line 25), no stuffing (lines 25, 29) - and that FAQ items must
be *"real questions users search for"* (line 28). The user prompt asks for the fields
the technique lists: *"5-7 H2 sections with bullets"*, *"4 FAQ"*, *"8 related
keywords"*, *"4 internal-link anchor suggestions"*, a rationale (lines 63-67). Real
keyword rows ride in as `keyword: volume/month, competition` (lines 37-41), and the
brand block carries a *"stay within this catalog and vocabulary, do not invent
another"* instruction (line 47).

`normalizeBriefResult` (lines 112-140) then caps: outline `.slice(0, 8)`, FAQ
`.slice(0, 8)`, keywords `cleanList(…, 12)`, internal links `cleanList(…, 8)`. There is
no floor. `validateBrief` (lines 144-157) flags exactly two things - title tag over 60
and meta description over 155 characters (`SEO_LIMITS`, `src/lib/ai-types.ts:311-314`)
- so a one-section outline with zero FAQ items and no link anchors passes as a valid
brief. The brief technique's fourth decision rule is this file's shape: **counts in the
prompt, a ceiling in the normaliser, no floor anywhere.**

Grounding is honest where it exists. `src/lib/content-engine/grounding.ts:41-55`
(`groundableKeywords`) drops negatives, de-duplicates case-insensitively, ranks by
opportunity and caps at `BRIEF_KEYWORD_LIMIT = 12` (line 23, mirroring the prompt's
own `slice(0, 12)` so *"the chip must not count"* what the model never sees).
`composeBriefBrand` (lines 133-141) appends up to six *"what provably worked in this
account"* pattern lines with the exact caveat the technique requires: *"take them as
guidance for angle and arguments, do not quote them verbatim"* (line 137).

## The article: exactly-one rules asserted, then not counted

`src/lib/ai/tools/article-draft.ts:34-52` is the article system prompt. Line 38: for
EVERY outline section an `h2` block and *"1-2 paragraphs"*. Line 39: an opening
paragraph *"continuing the meta description"*. Line 40: *"exactly one block of type
'callout' … and at the end exactly one block of type 'cta'"*. Line 41: *"AT MOST one
'figure' block"*, with *"DO NOT INVENT a URL or file path"* - the figure carries `alt`
only. Line 51: *"Keep paragraphs short (2-4 sentences). Return at most ~16 blocks in
total."* The user prompt closes with the block order (line 91). Every row of the
technique's budget table is here as an instruction.

`toBlock` (lines 159-208) normalises strictly and drops what is malformed - an empty
paragraph, an empty list, a heading with no text (166, 171, 176), a figure with no
description (200-203) - which is the technique's third procedure step, and it emits the
figure with `src: ""` and `0×0` so the client fills it from the library (197-203). The
`cta` case hard-codes `href: "/cena"` and a default button label (193-194): the model
never chooses the destination, which is the right shape for a call to action a system
owns.

`validateArticleDraft` (lines 271-293) is the gate, and it checks three things:
zero valid blocks (276-278), a figure with neither `alt` nor `text` (282-287), and an
empty FAQ when the brief supplied one (288-290). **It does not count callouts, calls to
action, figures, paragraphs per section, sentences per paragraph or total blocks.** A
draft with four callouts, two calls to action and forty blocks is valid. The downstream
`validateArticle` (`src/lib/article-validate.ts:52-104`) that gates rendering checks
the production shape - a non-empty body (62), figure `src`/`alt`/`width`/`height`
(65-66), heading ids (67), table row arity (68-73), FAQ ≥ 1 *"(FAQPage requires it)"*
(75), unique heading and FAQ ids, resolving anchors (77-102) - and again nothing about
block counts. The composition rules of lines 40-51 are prompt assertions with no gate,
which is the technique's third decision rule stated as a finding.

The readability scorer is a sibling half-measure: `src/lib/content/seo-score.ts`
scores sentence length at `SENTENCE_OK = 18` / `SENTENCE_WARN = 25` (151-152) and
outline points over 40 words (223-225), but over the *brief's* prose - meta, outline
points, FAQ answers (170-175) - never over the article's blocks.

## The one honest backfill

`generateArticleDraft` (lines 326-348) tracks whether the body or the FAQ came back
empty. Fully canned falls to the keyless demo and bills as demo; a partial miss is
backfilled by `neutralArticleBackfill` (301-313), whose comment says why: the demo
copy *"reads as nonsense spliced into a provider-generated draft"* and *"an empty FAQ
is left empty so the panel renders its own empty state rather than a fake … answer"*.
That is the technique's fifth step, and the workspace learned it the hard way - an
upward lesson the technique's wording now carries.

## Two structural gaps the technique predicts

- **The brief's internal-link anchors never reach the article.** `ArticleDraftRequest`
  (`src/lib/ai-types.ts:752-775`) carries title, meta, h1, slug, outline, FAQ,
  keywords, audience, content type and brand - not `internalLinks`. The brief asks for
  four anchors; the draft cannot place them. The mid-body call to action this subject
  treats as the real conversion device has no path from brief to body here; the only
  link the article model emits is the hard-coded closing `cta`.
- **No floor, no count, so the budget is a wish.** A `validate` that counted
  `blocks.filter(b => b.type === "callout").length !== 1` and the same for `cta` would
  be a dozen lines beside the existing checks and would turn lines 40-41 from
  instructions into a gate.
