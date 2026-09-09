---
layer: technique
type: technique
subject: on-page-and-metadata-craft
technique: mechanical-layer-only-never-the-copy
status: forged
laws: [a-gate-before-money-and-copy, never-invent-proof]
shared_with: []
use_when: [running an audit or fix pass on a page the owner wrote, scoping what an automated on-page fixer may edit, deciding whether a thin page or a heavy asset may be removed]
---

# Mechanical layer only, never the copy

An audit or fix pass may change the layer the engine reads and may not change the words
a person wrote. The boundary is drawn by an enumerated list on each side, a one-question
test before every edit, a count reported after every pass, and an approval gate for
anything that would remove something from the page.

## The two lists

**May change:** the title tag; the meta description; alt text; a heading's *tag* where
the structure is wrong (an H3 that should be an H2 - the tag, never the words inside
it); the canonical; the anchors of internal links; image formats, compression, file
names and dimensions; how assets load (defer, preload, lazy-load, self-hosting a font,
inlining critical style rules); the slug, with its redirect; the structured-data graph;
the share-preview tags; and things that are genuinely broken - dead links, missing tags,
a duplicated block, a referenced file that returns nothing. Inserting a missing keyword
into an existing heading or the opening paragraph is allowed only where the sentence
already has a place for it.

**May not change:** any body sentence, for any reason - not flow, not clarity, not
readability, not keyword density. Not the stories, jokes, asides, opinions or turns of
phrase. Not the order of an argument. Not the design tokens (a contrast fail that needs
a brand colour change is a recommendation, not a fix). Never because it reads better the
fixer's way.

The reason is asymmetric value. The mechanical layer is fungible - any competent pass
produces the same title width and the same canonical. The copy is the one thing on the
page a competitor cannot copy and a model cannot regenerate: the specific numbers, the
named jobs, the voice the rater guidelines reward as first-hand experience. A pass that
rewrites it returns a better score on a page that has lost its asset.

## The test, the count, and the routing

Before every edit: *mechanical problem, or me writing?* If the second, stop. A page that
genuinely needs new or rewritten content is not this pass's job; it goes in the report
and routes to the writing workflow, where the voice files are loaded and the owner
approves the draft.

When a sentence truly must change - a keyword genuinely has to appear in a heading that
lacks it - make the smallest insertion, keep every other word, and show the before and
after so the owner can veto. Never reword silently.

After every pass, report the count of body sentences altered. Zero is the expected
answer, and a report without the count is a report that hides the answer. Confirm the
voice survived by quoting one untouched paragraph.

## Deletion is a recommendation, never a fix

Nothing is removed from the page or the site by the pass: no image, video, embed,
section, paragraph, page, plugin or script - not a thin page, not an orphan, not a
four-megabyte hero image, not a post with no traffic. Each has a fix that is not
removal: convert and compress the image; lazy-load the video behind a poster; defer the
script (the "useless" one is often the booking widget); improve, canonicalise or
consolidate the thin page; link to the orphan. Changing *how* an asset loads is not a
deletion and is in scope; treating it as one is how a speed pass ends with a flat score.

Where removal is genuinely right, it goes in the report as a recommendation - what it
is, why, what it costs to keep, what happens on removal including the redirect - grouped
at the end under a heading that says it needs approval, and the pass waits for a yes.
Consolidations and redirect merges are deletions and take the same gate. A deleted
address loses its links and its rankings permanently, which is why the gate exists.

## Decision rules

- When a check can only pass by rewriting a sentence, waive the check with the reason
  and route the page to writing, because a passed check is worth less than the sentence.
- When an automated fixer is given write access to a page, give it the may-change list
  as its schema and no field for body blocks, because an instruction not to touch the
  copy is not enforcement and a schema that cannot carry the copy is.
- When a fix would change the design system rather than the page, list it as an optional
  recommendation with the exact words to approve it, because the copy rule applies to
  design too.
- When the pass finishes, print three separated lists - waiting on the owner, optional
  recommendations, waived with reasons - because anything waiting on a person that hides
  mid-report is a fix that never happens.

## Conventions, labelled

The two lists are doctrine of this bundle, derived from the law that gates money and
copy; the engine publishes no such boundary. "Zero altered sentences" as the expected
count is a convention that makes the boundary auditable. The claim that copy is the
rater-rewarded asset rests on the published rater guidelines' treatment of first-hand
experience and originality.

## When NOT to use

- A writing workflow, where the draft is the product and the owner approves it: the rule
  scopes audits and fix passes, not authorship.
- A page the owner has explicitly handed over for rewriting, with the request recorded
  on the item: that is an owner decision, and it still ships as a draft for approval.
- Generated boilerplate the owner never wrote and never approved, such as a templated
  city page's filler; that is a doorway question under
  `local-page-doorway-prevention`, and even there the fix is rewrite-by-approval, not
  silent edit.
