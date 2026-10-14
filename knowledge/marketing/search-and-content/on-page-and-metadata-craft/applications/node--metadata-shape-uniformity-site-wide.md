---
layer: application
type: application
subject: on-page-and-metadata-craft
technique: metadata-shape-uniformity-site-wide
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
---

# A brief generator that validates one description at a time

The Czech-first adtech marketing workspace (commit
`4a56f69200fa339236a57ca8d9a77bda825b73be`, 2026-10-14; the engines field pins node
24.x, which is the witness for the stack) turns a model-written SEO brief into an article
draft request. The description enters that path as a bare string and leaves it capped,
never compared with its title or with any other brief.

## Where the shape would enter

- `src/lib/ai/validation.ts:538` "const metaDescription = str(o.metaDescription);" - the
  draft request takes the description as an unchecked string.
- `src/lib/ai/validation.ts:558` "metaDescription: metaDescription.slice(0, 400)," - the
  only rule applied is a length cap. No comparison with `titleTag`, none across briefs.

The generator makes one brief per call, so a bulk-shaped defect has no single place
where it is visible: the same property the technique rests on, found in a tree built
without it.

## The experiment, and what it could and could not show

The only recorded brief is `test-llm/samples/brief.json:3` "Zjistěte, jak správně skladovat ořechy". Run through the four comparisons it is clean: the
description does not open with the title ("Jak skladovat ořechy: tipy ..."), is not the
title, and carries no brand suffix. One brief cannot show a site-level shape, so the
count and share rules were not exercised.

The seam was chosen because it could falsify the technique's closer check: the stock
closer list is English, and the tree writes Czech descriptions. The finding the seam
returned is a boundary, now in the technique's decision rules: in an inflected language
the closer list does not run, and the title echo is fragile too, because the description
restates the keyword phrase in a different case and mid-sentence rather than as an
opening clause. Only the duplicate and brand-suffix comparisons transfer unchanged.

## What this realization cannot do

It cannot say whether the generator produces a shared shape. That needs a batch of stored
generated briefs from one account (about ten or more), which the tree does not keep.
Verdict `unmeasurable`; the instrument that would make it measurable is a stored batch
of generated briefs plus the four comparisons with a Czech closer list built from seen
output.
