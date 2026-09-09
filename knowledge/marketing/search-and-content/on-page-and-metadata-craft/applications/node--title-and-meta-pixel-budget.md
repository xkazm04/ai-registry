---
layer: application
type: application
subject: on-page-and-metadata-craft
technique: title-and-meta-pixel-budget
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# A brief scorer that measures the title in pixels and the description in characters

The Czech-first adtech marketing workspace (commit
`2893314930546ed3a314a19a155bcf2f8841a0ea`, 2026-09-08; engines pin node 24) generates
an SEO brief with a model and then scores it with a pure function and a results-page
preview. The preview is the honest instrument the technique describes - a width
estimate in the results page's font, truncated the way the engine truncates - and the
scorecard beside it is the dishonest one, a character count wearing an authority label.
The tree proves the structural fact the technique rests on: a pixel budget can be
computed from a per-character table without a browser, and it disagrees with the
character count exactly where the technique says it will.

## The width estimator

- `src/lib/content/seo-score.ts:20-27` - the header comment states the mechanism: the
  engine renders titles at "roughly ~20px" and meta lines at "~14px"; the table is "an
  APPROXIMATION ... but it is far closer to reality than counting characters, which is
  the whole point: it correctly flags that wide glyphs (W, M, ž, m) eat the title
  budget faster than narrow ones (i, l, í, .)".
- `:31-52` - the advance-width table in em units: narrow `i j l` at 0.22, `m` at 0.83,
  `W` at 0.94, digits uniform at 0.56, uppercase 0.61-0.94. `:56` - the fallback
  average 0.55 em.
- `:58-67` - the upward lesson the draft took: `charEm` maps any accented glyph not in
  the table to its NFD base letter before falling back, with the reason in the comment -
  "otherwise every uppercase Czech title would be systematically under-measured". A
  per-character average that ignores the base glyph is biased against exactly the
  titles most likely to clip.
- `:72-80` - the constants: `SERP_TITLE_PX = 20`, `SERP_META_PX = 14`, desktop title
  budget 600 px, mobile 360 px, with the comment that the mobile layout "uses the same
  title size but a much narrower column, so the width budget - not the font - is what
  changes".
- `:84-88` - `estimateWidthPx` sums the table and scales by font size; the doc comment
  promises monotonicity ("appending any character never shrinks the result").
- `:96-118` - `truncateToPixels` reserves the ellipsis width, accumulates characters
  until the next one would overflow, strips the trailing space, and returns the clipped
  string plus a `truncated` flag - the engine's own clipping rule, and the preview the
  technique says to show instead of a count.

## The preview call site

`src/components/ai/ContentBriefGenerator.tsx:271-279` renders a desktop/mobile toggle,
picks `SERP_MAX_PX.desktopTitle` or `.mobileTitle` for the title, and derives the meta
budget as `titleMaxPx * 2` (1200 px desktop, 720 px mobile) before truncating both. The
meta budget is a derived convention, not a measurement - practitioners put the desktop
description column nearer 920 px - so the preview is generous on the description and
honest on the title. Both budgets are labelled approximate in the source and unlabelled
in the UI.

## The scorecard beside it: characters under an authority label

- `src/lib/ai-types.ts:311-313` - `SEO_LIMITS`: title 60, description 155.
- `src/lib/ai/tools/brief.ts:24` - the model is told the caps in characters with the
  technique's own hedge, "raději mírně pod limitem" (rather slightly under the limit).
- `seo-score.ts:202-203, 296-318` - `META_MIN = 120`, `META_MAX = 155`; the description
  is graded by `.trim().length`, over is "bad" ("Google will clip it"), under is "warn",
  and the chip sits in a group the type at `:141` calls "E-E-A-T trust hints".
- `:319-350` - the other two chips in that group are the FAQ count (2 or more "supports
  structured data and E-E-A-T") and the keyword-set size (5 or more).

The structural fact: the same module holds a pixel estimator and a character grader,
and the grader never calls the estimator. A 155-character Czech description of wide
glyphs is "ok" on the chip and clipped in the preview two components away. And the
"E-E-A-T" label on the group measures meta length, FAQ count and keyword count - none
of which the rater guidelines' experience-and-trust rubric is about - so the chip group
is a convention presented as documented behaviour, which is the failure the bundle
index names first.

## Deviations

- The description is not graded by width anywhere; the technique's rule ("prefer a
  width estimate wherever text is graded by a machine") is met for the title preview
  only.
- The meta chip grades a short description as a warning, which agrees with the
  technique, but grades a long one as "bad ... will clip" without saying the engine
  more often rewrites than clips a long description.
- The chip group's label should name what it measures. A rename is a one-line fix; the
  application records the mislabel because it is the exact folklore pattern the domain
  reproduces.
