---
layer: application
type: application
subject: medium-format-fidelity
technique: two-viewport-verification
stack: process
status: forged
verified_on: 2026-10-05
---

# Process: four renders and a scroll probe on a contest article

Witness: the two-round writing contest described in the `article-structure` application
(round two judged on 2026-10-05). The deliverable was one self-contained HTML page per
article. Entry files are local run output; this records what the winning page and its log
show, read on 2026-10-05.

## The finding

The owner's round-one review named "Not used syntax highlighting for code blocks" across the
field. The host's amendment: highlight every code block with a colour theme that reads in
light and dark, inline and with no network dependency.

## What the winning page does

- **Reading column**: the main column has a maximum width of 728 px with 24 px side padding;
  body paragraphs are set at 20 px with a line height of 1.6, which puts a typical line in
  the 60 to 75 character range on a serif face.
- **Both schemes**: colours are role tokens defined for light and dark; the page follows the
  system preference by default and a toggle remembered in the browser overrides it. The
  figures are HTML and CSS constructions (token chips, bars, flows, tinted tables) styled
  with the same tokens, so they switch with the page.
- **Highlighted code**: both code blocks are highlighted by a small inline highlighter with
  six token classes and a colour per class in each scheme, no network fetch.
- **Narrow-width containment**: tables and code blocks scroll inside their own containers;
  the page does not.

## The check, as logged

The run's experiment log records the rendering check as one of its eight experiments:
headless browser screenshots at 1440 px in light and dark, and inside a 390 px frame, plus a
probe confirming that only code blocks scroll horizontally. It is the method of
two-viewport-verification with one recorded approximation: the narrow check used a 390 px
frame inside a wide window rather than a device emulation, which the technique's decision
rules require a run to say.

## What this witness does and does not show

It shows the four-render check and the scroll probe fit inside a drafting agent's run at
negligible cost. It does not show the page surviving a publishing platform: the contest
deliverable was the authored page, and its translation to a platform package (see
`process--target-platform-capability-map.md` beside this file) was not part of the contest.
