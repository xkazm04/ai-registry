---
layer: application
type: application
subject: medium-format-fidelity
technique: reading-column-and-type-scale
stack: next
status: forged
verified_on: 2026-10-10
verified_against: next@16
applied: simulation
ab_verdict: better
---

# A blog column that holds a hundred characters, and a guide column that grows with the screen

Read against the `personas-web` repository at `01eaee60` (origin/master) on 2026-10-10.
Anchors are relative to that tree. The version is witnessed by package.json:48 "^16.3.8".
The witness is the ten-post blog and the guide pages of the `figures-and-tables`
applications.

## What the pages set

- **Blog post.** The article is `mx-auto max-w-3xl`, 48rem or 768 pixels (line 41 of
  src/app/blog/[slug]/BlogArticle.tsx). Body paragraphs are `text-muted leading-relaxed
  my-4` with no size class (line 91 of BlogArticleContent.tsx in the route's
  blog-article folder), so they inherit 16 pixels at a line height of 1.625. The face is
  Geist Sans, src/styles/typography.css:28 "var(--font-geist-sans)". Side padding at a phone is 16
  pixels, src/components/SectionWrapper.tsx:56 "relative px-4 py-20 sm:px-6".
- **Guide topic.** The column is capped at 52rem beside a 288-pixel sidebar. Its width is
  672 pixels at a 1280-pixel window and 832 pixels from about 1440 up (lines 113 and 114
  of src/app/guide/[category]/[topic]/TopicView.tsx). Paragraphs are 16 pixels,
  src/components/guide/guide-markdown/parseBlocks.tsx:179 "text-base text-muted-dark leading-relaxed mb-4".

## The measurement

The blog's 66 prose paragraphs were taken from src/data/blog.ts at this commit. They were
wrapped greedily at each column width, using Geist Regular's advance widths read from the
font file (no kerning). The count is characters per full line; each paragraph's last line
is excluded. The control was glyph widths that differ as they should: i 0.244 em, m 0.877,
W 0.945. Average glyph width was 0.464 em.

| Column | Median | p10 to p90 |
| --- | --- | --- |
| Blog, 768 px | 99 | 95 to 103 |
| Guide at 1280 px, 672 px | 87 | 81 to 91 |
| Guide at 1440 px and up, 832 px | 108 | 103 to 112 |
| Blog at 390 px, 358 px | 44 | 39 to 47 |

The phone width sits inside the range. Every wide column is past it, and the blog is past
the 90 of the most permissive reference.

## Simulation

Policy A is the technique before 2026-10-10. Above about 90 characters at the wide
viewport (then 1440 pixels), narrow the column and do not enlarge the font. Policy B adds
four things:
- raising the body size is allowed where the column is capped in pixels or rem;
- a column that grows with the screen is measured at the widest common screen;
- the 55 to 75 target applies to text read to be understood;
- a width class is not a count.

- **Blog post (99).** A flags it and gives one move: narrow 768 to about 560 pixels at 16
  pixels. B flags it and allows a second move, which also meets the technique's own body
  row (near 20 pixels). The cap is in rem, set by the root rather than the paragraph, so
  20-pixel body text in the same 768 pixels gives about 83 characters, and 640 pixels
  about 69. A's move keeps body text at 16 pixels, below the convention the same technique
  states.
- **Guide at 1280 (87).** A does not flag it: it is under 90, and A's width was 1440. B
  flags it: tutorials are read to be understood, and 87 is past 75.
- **Guide at 1440 and up (108).** Both flag it, A because 1440 is its width and B because
  the column grows. Same verdict.

B gives a different and usable answer on two of three cases, and the same on the third.
This is judgment on measured line lengths; no reader was tested.

**Falsifier:** a reading test on these posts in which the 99-character column is understood
as well as a 65-character one. The pages were not changed: the project's map does not join
this bundle, and the layout is the owner's.
