---
layer: application
type: application
subject: voice-and-register
technique: impersonal-results-reporting
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A pronoun search on a product blog: eight hits, two of them the author's voice

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The blog is ten posts held as Markdown strings in one data file, src/data/blog.ts, and
rendered by the site's own parser. The guide is a set of topic files under
`src/data/guide/content/`.

## What the search returns

A case-insensitive whole-word search for I, my, me, we, our and us over the blog file
returns 8 hits.

- **Prompts the reader is meant to type (5).** The tutorials quote instructions for an
  agent in the reader's voice, src/data/blog.ts:298 "Check my inbox for new emails",
  src/data/blog.ts:319 "direct requests from my manager", src/data/blog.ts:320 "Match my tone",
  and src/data/blog.ts:483 "the URL I provide" (two hits on that line). Rewriting these
  breaks the tutorial: the reader pastes them.
- **A code comment (1).** src/data/blog.ts:593 "(i.e. at build time" hits on the "i".
- **Author narration (1).** src/data/blog.ts:133 "(we'll walk through creating one)".
- **The organization as author (1).** src/data/blog.ts:220 "three workflows we've seen Personas users build".
  The pronoun is a house decision. The defect is that the observation has no source.

Over the guide the same search returns 37 hits, and one is the organization speaking
(templates "designed and tested by us"). The rest are quoted text, example prompts in a
comparison block, and bold UI labels such as "get to know me". Country "US" and the name
"Me" occur nowhere in the copy, so the classic false positive did not appear here.

The register on this site is reader address: "you" and "your" appear 152 times in the blog's
3,740 words of post prose.

## Control

The two author claims cut from the blog on 2026-09-14 are caught by both procedures below:
"In our testing, self-healing reduced manual intervention" and "We believe the best
architecture", at lines 105 and 601 of the file at `7c05f339`, the parent of the commit that
began the cuts. Both were cut as unsupported claims, not under any person rule.

## Simulation

Policy A is the technique before 2026-10-10: every case-insensitive whole-word hit is a
finding; rewrite each so the topic is the subject. Policy B strips quoted text, typed
prompts, UI labels, code and comments; matches capital "I" case-sensitively; and classifies
each remaining hit as narration, organization, reader-inclusive or quoted before rewriting.

- **Blog.** A raises 8 findings and 6 are false. Followed literally, it rewrites five
  prompts a reader is told to paste. B raises 2. It rewrites line 133 ("creating one is
  covered in step 2") and sends line 220 to the evidence check: source the 30-minute claim
  or cut it.
- **Guide.** A raises 37; B raises 1, an organization "we" the house may keep.
- **The 2026-09-14 cuts.** Same verdict: both procedures flag both sentences.

B finds the same real defects with a fraction of the noise, and routes one to the right
subject. This is judgment on the read text; nothing was changed on the site.

**Falsifier:** a corpus where stripping quoted prompts removes real narration, such as an
author's own words set in italics as a quotation. The project's map does not join this
bundle, so the seam was not applied.
