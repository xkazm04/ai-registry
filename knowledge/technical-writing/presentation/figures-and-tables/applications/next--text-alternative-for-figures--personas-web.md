---
layer: application
type: application
subject: figures-and-tables
technique: text-alternative-for-figures
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# One fixed alternative for every social card, guide images that describe, and a fallback that hides omissions

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".

## What the site carries

The blog posts carry no image in the body. Each post has one image, the generated social
card, which draws the post's title and description (the description is cut at 117
characters: src/lib/og.tsx:110 "subtitle.length > 120"). The blog's card route exports one
fixed alternative, `Personas Blog`, for all ten posts; the site's other eight card routes do
the same with their own fixed names. (The route path holds a bracketed segment, so it is
named here rather than anchored; read by hand.)

The guide has two markdown images and a diagram component. The images' alternatives
describe what the picture shows, for example
src/data/guide/content/getting-started.ts:155 "Agent orchestration overview: trigger fires".
The diagram component labels itself with its nodes joined by "to". The guide's image
renderer fills a missing alternative with a fixed word:
src/components/guide/guide-markdown/parseInline.tsx:30 "alt={match[1] ||".

## Simulation

Mode `simulation`. Policy A is the technique as it stood before 2026-10-10: the short
alternative is the figure's message, not its appearance, and carries the same message as
the caption. Policy B: the alternative states what the figure shows in neutral words (type,
topic, key values and trend), the interpretation stays in the caption; an image of text
takes that text; a generic fallback is not an alternative.

- **The social card.** The image is the post's title and description. A asks for "the
  message" and gives no rule for an image whose content is text, so a fixed site name
  passes as a short label. B: the alternative is the text the card shows, generated from
  the same post fields that draw it, so each card's alternative differs.
- **The guide's orchestration image** (the getting-started image above). Its alternative
  narrates the flow the image shows. A reads that as appearance and would rewrite it into a
  conclusion about the product; B keeps it, because the sequence of steps is the content a
  reader who cannot see the image needs, and the conclusion is the surrounding prose's job.
  This is the case where the old rule would have made the page worse for that reader, by
  the preferences the blind readers in the subject's cited study reported.
- **The fallback** (the image renderer above). An image written without an alternative is
  announced as an illustration and passes every check that looks for a non-empty
  attribute. A has no rule for it. B flags it.

On all three B either fixes the alternative or keeps a good one A would have rewritten.
Judgment on the code and the text; no screen-reader user was tested.

**Falsifier:** a screen-reader session in which the fixed card name and the per-post text
serve a listener equally, which would mean the card is decorative in practice and an empty
alternative is right. Nothing was changed in the project: its map does not join this
bundle, and the components are the owner's.
