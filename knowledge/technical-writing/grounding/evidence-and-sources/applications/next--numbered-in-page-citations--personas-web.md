---
layer: application
type: application
subject: evidence-and-sources
technique: numbered-in-page-citations
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A product blog whose renderer cannot link, and whose third-party claims carry no source

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The witness is the ten-post blog the `article-structure` and `depth-and-audience`
applications read: one static data file, rendered by the site's own line parser, written
for a desktop agent product.

## What the ten posts show

Every number in the post bodies was listed and classed (45 rows; step numbers, prompt text
and configuration values left out). None of the 45 is sourced and none carries a date of
its own. No post has a sources section, and the data file contains no URL at all.

| Class | Rows | Sourced | Method or date shown |
|---|---|---|---|
| A claim about the world (an industry habit, a vendor's price or terms) | 11 | 0 | 0 |
| A claim about the product (a measurement or a specification) | 23 | 0 | 0 |
| A worked example (a scenario figure) | 6 | n/a | 1 written as a conditional |
| A derived number | 5 | 0 | 3 show the derivation |

The renderer is the constraint this technique's platform rule was written for, in its
strongest form. It cannot produce a link of any kind:
docs/features/content/blog.md:65 "No links, images, nested lists, tables, code fences".
The only clickable links on an article page are the cross-link cards after the body.

## Simulation

Mode `simulation`. Policy A is the technique as it stood before 2026-10-10: on a platform
that cannot render footnote links, keep the bracketed numbers and the list. Policy B is the
revised rule: where no link can render, the load-bearing source is named in the sentence
(who said it, in what, when), and the numbered list is kept as plain text below.

- **Data-use terms.** src/data/blog.ts:545 "most explicitly retain the right to log inputs and outputs for".
  A appends "[1]" and a list entry whose URL prints as dead text. A reader on the page
  still cannot see whose policy, or of what date. B names the providers and the read date
  in the sentence. The terms are the kind that change, so the date is the claim.
- **Cloud pricing.** src/data/blog.ts:576 "It starts small (a few dollars a month) but scales with usage".
  A gives one bracket for prices from several unnamed vendors. B names the vendor and the
  tier the figure was read from, with its date, or cuts the figure.
- **An industry habit.** src/data/blog.ts:224 "Reviewing each one takes 15-30 minutes."
  Neither policy can source it, because there is no source. Under B the honest move is
  `inference-labelled-as-inference`'s worked-example row: write it as a scenario.

On all three cases B leaves a reader who never clicks with something to weigh. A gives that
reader a number in brackets and a URL they cannot click. This is judgment on the text. No
analytics, no reader test.

## Dates on the page

docs/features/content/blog.md:67 "there's no `dateModified`" and the post data has a
`date` field only. Two copy commits on 2026-09-14 removed unsourced figures from the bodies
without moving any `date`, and four posts carry a `date` earlier than the commit that first
added them. So a post's date says when it was written, not when its numbers were last read.
It cannot stand as the date of a number that `dated-current-data` asks for.

**Falsifier:** a reader test on these posts in which an in-sentence attribution changes
neither trust nor the share of readers who can say where a figure came from. The copy was
not changed: the project's map does not join this bundle, and the posts are the owner's
public copy.
