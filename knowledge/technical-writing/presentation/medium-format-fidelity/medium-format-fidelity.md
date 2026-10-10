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

**The column is set for understanding, not for speed.** Line length is the most-studied
layout variable in screen reading. That is a measure of attention, not of effect size: a
review of the research covers it most "due to the larger number of studies related to this
variable", and a later study found large effects of type size. The measures split. Lines
near 95 to 100 characters were read as fast or faster (in one study, only by readers already
reading fast). A medium line near 55 characters gave the highest comprehension in one
study (n = 36) and was the length readers preferred, while another found no comprehension
difference (n = 20). A typography reference recommends 45 to 90 characters per line,
counting spaces. Accessibility guidance for enhanced visual presentation (Level AAA) asks
that the reader can get no more than 80 (40 for Chinese, Japanese and Korean), line spacing
of at least one and a half within paragraphs, and no full justification. It requires a
mechanism, which the browser can provide, not the author's default. An article read to be
understood sets its column toward the moderate end, measured in characters on its own text.
Body type is set large enough that the column, not the font, limits the line; long-form
reading surfaces commonly set body text near 20 pixels with a line height near 1.6. See
reading-column-and-type-scale.

**The reader's scheme is honoured, and every scheme shipped is checked.** About a fifth of
web traffic carries a dark preference (22% in one browser vendor's 2021 case study). That is
a reason to honour the preference, not evidence that dark reads better. In controlled
studies dark text on a light background was read better, for younger and older readers
alike and independent of ambient light, darkness included. So the page follows the reader's
setting and never picks a scheme for them. Every colour in the article (text, figure strokes
and fills, table tints, code highlighting) is defined for every scheme or theme the page
ships and checked in each, with contrast meeting the accessibility minimum (4.5:1 for body
text, 3:1 for large text). A figure drawn with fixed dark strokes disappears for every
reader on a dark scheme. See light-and-dark-rendering.

**Code is text the reader copies, and only code scrolls.** Code blocks are monospaced,
preserve whitespace, copy as text, and scroll horizontally inside their own box rather than
widening the page. Highlighting with a theme for each scheme is a convention readers expect
and prefer, and reviewers notice its absence. It is not a measured comprehension aid: no
effect was found for 390 novices, and a small effect in a ten-person study weakened with
experience. Text the reader is meant to copy, a command or a prompt for a model, is a code
block even when it is plain English. See highlighted-code-blocks.

**Two widths, always.** An article is checked at a phone width and a wide width. 390 pixels
is a common phone viewport, one of the two most common in the United States in 2026. At
the wide end the column matters more than the width: check where the column has reached its
maximum, and at the most common desktop widths (1920, then 1536 CSS pixels) when the column
grows with the viewport. 1440, the width this subject first named, is a minor desktop width.
Accessibility guidance on reflow sets the floor: content readable at 320 pixels without
two-dimensional scrolling, with exceptions only for content that needs two dimensions, such
as data tables and diagrams, which then scroll inside themselves. See
two-viewport-verification.

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
  used syntax highlighting for code blocks". The cost is the reader's expectation, not a
  measured loss of comprehension, and it is real all the same.
- **A prompt set as prose.** Text the reader must copy, set in italics in a paragraph,
  picks up the renderer's markup and typography and has no copy affordance.
- **A scheme picked for the reader.** A brand-dark default or a random first theme
  overrides a preference the reader already stated.
- **A column measured on a sample string.** A width class that looks moderate can hold a
  hundred characters of real text at body size.
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
  https://practicaltypography.com/line-length.html: "45–90 characters, including spaces".
- W3C, Understanding WCAG 2.2: SC 1.4.8 Visual Presentation
  (https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html), SC 1.4.10 Reflow
  (https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), SC 1.4.3 Contrast (Minimum)
  (https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). WCAG 2.2
  (https://www.w3.org/TR/WCAG22/), 1.4.8 Note 1: "Content is not required to use these
  values. The requirement is that a mechanism is available"; re-read 2026-10-10.
- Dyson, M. C. (2004). How physical text layout affects reading from screen. Behaviour and
  Information Technology 23(6), 377-393. doi:10.1080/01449290410001715714.
- Dyson, M. C. and Haselgrove, M. (2001). The influence of reading speed and line length on
  the effectiveness of reading from screen. International Journal of Human-Computer Studies
  54(4), 585-612 (n = 36; 25, 55 and 100 characters per line).
- Shaikh, A. D. (2005). The effects of line length on reading online news. Usability News
  7(2) (n = 20; 95 characters per line read fastest, no comprehension effect).
- Rello, L., Pielot, M. and Marcos, M.-C. (2016). Make It Big! CHI 2016, 3637-3648.
  doi:10.1145/2858036.2858204 (n = 104; line length fixed in the window, so size and
  length are confounded).
- Buchner, A. and Baumgartner, N. (2007). Ergonomics 50(7), 1036-1063; Piepenbrock, C.,
  Mayr, S., Mund, I. and Buchner, A. (2013). Ergonomics 56(7), 1116-1124; Dobres, J.,
  Chahine, N. and Reimer, B. (2017). Applied Ergonomics 60, 68-73: positive polarity
  advantage, independent of ambient light; negative polarity worst under dark ambient light.
- web.dev case study, dark mode at a news publisher,
  https://web.dev/case-studies/terra-dark-mode: "22% of the web traffic" with a dark
  preference (2021).
- Hannebauer, C., Hesenius, M. and Gruhn, V. (2018). Does syntax highlighting help
  programming novices? Empirical Software Engineering 23(5), 2795-2828 (n = 390, "no
  evidence"); Sarkar, A. (2015). The impact of syntax colouring on program comprehension.
  PPIG 2015, 49-58 (n = 10); Beelders, T. and du Plessis, J. L. (2016). Journal of Eye
  Movement Research 9(1).
- StatCounter Global Stats, screen resolution, September 2026,
  https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide: 1920x1080 28.08%,
  1536x864 9.99%, 1366x768 7.95%, 1440x900 2.94%. Screen sizes, not viewports.
- Rougier, Droettboom and Bourne, "Ten Simple Rules for Better Figures", 2014, rule 3,
  "Adapt the figure to the support medium",
  https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1003833
- A writing contest's owner review (2026-10-05): unhighlighted code blocks named as a defect
  across the field.
