---
layer: technique
type: technique
subject: medium-format-fidelity
technique: light-and-dark-rendering
status: forged
laws: [check-the-page-where-it-is-read]
shared_with: []
use_when: [defining an article page's colours, drawing figures that must work on light and dark backgrounds, choosing a code highlighting theme, reviewing a page in a dark system scheme]
---

# Light and dark rendering

The concern: a page designed and checked in one colour scheme is read by a large share of its
audience in the other. Figures with fixed dark strokes vanish, tints meant to highlight a
cell turn muddy, highlighted code becomes unreadable, and the page that looked finished
fails for those readers. **Define every colour as a named token with a value for each
scheme, honour the reader's system preference by default, draw figures from the same
tokens, and check both schemes.**

## Procedure

1. **Name the colours by role**: background, text, muted text, rule, accent, and each data
   series or tint by meaning (better, worse, history). Give every name a light and a dark
   value.
2. **Default to the reader's system preference**, with an explicit toggle if the page
   offers one, and make the toggle win over the preference.
3. **Draw figures from the tokens.** Inline vector figures reference the role colours, so
   they switch with the page. Raster figures (where the platform requires images) are
   produced on a background that works in both schemes, or the platform's scheme handling
   is checked.
4. **Keep data colours meaningful in both schemes.** "Worse" stays warm and "better" stays
   cool in both palettes; never rely on automatic inversion, which flips hue.
5. **Check contrast in both schemes**: at least 4.5:1 for body text and 3:1 for large text,
   per accessibility guidance; check figure labels and table tints too, not only body text.
6. **Look at the page in both schemes, at both viewports**
   ([check the page where it is read](../../../_laws.md#check-the-page-where-it-is-read)).
   Automated contrast checks miss a figure label drawn on a tint.

## Decision rules

- **When a colour must carry meaning, give it a second channel**: a label, a pattern, a
  position. Colour alone fails colour-blind readers and degrades across schemes.
- **When the platform controls the scheme and its images do not switch**, prefer
  mid-luminance backgrounds for images, or white-backed images with a visible border, over
  transparent images whose strokes assume one background.
- **Code highlighting has its own pair of themes** (see highlighted-code-blocks); a single
  theme chosen for one scheme is the most common dark-mode defect in technical posts.

## When not to use it

Pages delivered only as print or as a fixed-format document, which have one scheme by
nature. Even then, figures reused on the web inherit this problem.
