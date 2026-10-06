---
layer: golden-path
type: golden-path
subject: medium-format-fidelity
status: forged
use_when: [laying out a technical article for reading, preparing an article for a specific publishing platform, checking an article in both colour schemes and at phone and desktop widths, styling code blocks in a post]
techniques:
  - reading-column-and-type-scale
  - light-and-dark-rendering
  - highlighted-code-blocks
  - two-viewport-verification
  - target-platform-capability-map
---

# Fidelity to the publication medium

An article is written once and read on a surface the author does not control: a phone in a
dark room, a wide monitor in daylight, a feed reader that strips styles, a publishing
platform with its own editor and its own limits. Fidelity to the medium is the craft of
making the article read as intended on every surface it actually reaches, and of knowing,
before publishing, which surfaces those are and what each can render.

The naive version checks the draft in the tool it was written in, at the width of the
author's monitor, in the author's colour scheme, and calls it done. Every defect this
subject exists to prevent is invisible from that seat: a reading column that runs to a
hundred and twenty characters on a wide screen, a figure whose dark labels vanish on a dark
background, a code block with no highlighting or with highlighting that works in only one
scheme, a table that forces the whole page to scroll sideways on a phone, and a carefully
designed table that the target platform cannot render at all
([check the page where it is read](../../_laws.md#check-the-page-where-it-is-read)).

## What a principal practitioner holds true

**The column decides the reading.** Line length is the single largest typographic factor in
long-form reading comfort. A typography reference recommends 45 to 90 characters per line;
accessibility guidance for enhanced visual presentation asks for no more than 80 (40 for
Chinese, Japanese and Korean), line spacing of at least one and a half within paragraphs,
and no full justification. Body type is set large enough that the column, not the font,
limits the line; long-form reading surfaces commonly set body text near 20 pixels with a
line height near 1.6. See reading-column-and-type-scale.

**Both colour schemes are first-class.** Many readers browse with a dark system scheme.
Every colour in the article (text, figure strokes and fills, table tints, code highlighting)
is defined for both schemes and checked in both, with contrast meeting the accessibility
minimum (4.5:1 for body text, 3:1 for large text). A figure drawn with fixed dark strokes is
a figure that disappears for half the audience. See light-and-dark-rendering.

**Code is highlighted, and only code scrolls.** Code blocks get syntax highlighting with a
theme for each colour scheme, preserve whitespace, and scroll horizontally inside their own
box rather than widening the page. See highlighted-code-blocks.

**Two widths, always.** An article is checked at a phone width and a desktop width. 390
pixels and 1440 pixels are a practical pair: the first is a common phone viewport, the
second a common laptop and desktop width. Accessibility guidance on reflow sets the floor:
content readable at 320 pixels without two-dimensional scrolling, with exceptions only for
content that needs two dimensions, such as data tables and diagrams, which then scroll
inside themselves. See two-viewport-verification.

**The platform is part of the medium.** A publishing platform renders a subset of what a
web page can: perhaps two heading levels, no native tables, its own code highlighting with
automatic language detection, captions on images but not on code, a fixed column and type
scale the author cannot change. The article that reaches the platform is a translation of
the authored page, and the translation is designed, not improvised at paste time. See
target-platform-capability-map.

## Distinctions that matter

- **Authored page versus published package.** The authored page can use every capability
  of a web page; the published package is what survives the platform. Both are artefacts,
  and the package is checked in the platform's own preview, not inferred from the page.
- **Responsive versus shrunk.** A figure that scales its whole drawing down to a phone
  width has shrunk its labels below legibility. A responsive figure changes form at the
  narrow width (fewer labels, a vertical layout, a scrollable container).
- **Theme-aware versus inverted.** Automatic inversion of a light figure for a dark scheme
  inverts its data colours too, so a red that meant "worse" becomes cyan. Define both
  palettes deliberately.

## Failure modes of the naive reading

- **Checked only at the author's width.** The phone layout is where most defects live and
  where many readers are.
- **Unhighlighted code.** A reviewer's note on a field of round-one articles was simply "Not
  used syntax highlighting for code blocks".
- **Fixed colours in figures.** Strokes and labels hard-coded for a light background.
- **The page that scrolls sideways.** One wide table or long code line without its own
  scroll container makes the entire article pan on a phone.
- **Assuming the platform renders the page.** A table pasted into an editor without table
  support becomes tab-separated mush; a third heading level becomes bold text.

## What this subject does not own

The reading surface as software (heading anchors, a contents panel, scroll-spy, sticky bar
offsets) belongs to the `software-engineering` bundle's `long-form-reading-surface`
subject. What a figure says and how it is captioned belongs to `figures-and-tables`. This
subject owns whether the article, as typeset and as packaged, survives the surfaces it
reaches.

## Sources this subject rests on

- Matthew Butterick, Practical Typography, "Line length",
  https://practicaltypography.com/line-length.html: 45 to 90 characters.
- W3C, Understanding WCAG 2.2: SC 1.4.8 Visual Presentation
  (https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html), SC 1.4.10 Reflow
  (https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), SC 1.4.3 Contrast (Minimum)
  (https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Rougier, Droettboom and Bourne, "Ten Simple Rules for Better Figures", 2014, rule 3,
  "Adapt the figure to the support medium",
  https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003833
- A writing contest's owner review (2026-10-05): unhighlighted code blocks named as a defect
  across the field.
