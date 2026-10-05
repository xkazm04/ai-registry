---
layer: technique
type: technique
subject: medium-format-fidelity
technique: two-viewport-verification
status: forged
laws: [check-the-page-where-it-is-read]
shared_with: []
use_when: [verifying an article page before publication, automating screenshot checks in an article pipeline, diagnosing a page that scrolls sideways on a phone]
---

# Two-viewport verification

The concern: an article checked only at the author's screen width ships its narrow-width
defects to every phone reader: a page that pans sideways because one table or code line is
too wide, figure labels shrunk below legibility, a content preview that fills three screens.
**Render the finished page at a phone width and a desktop width, in both colour schemes,
and check a short list of properties at each.**
([check the page where it is read](../../../_laws.md#check-the-page-where-it-is-read))

## The two widths

390 and 1440 CSS pixels are a practical pair: a common phone viewport and a common laptop
and desktop width. They are a convention, not a standard; the standard floor is the
accessibility reflow criterion, which asks that content be readable at a width equivalent to
320 CSS pixels without scrolling in two dimensions, except for content that needs a
two-dimensional layout (data tables, diagrams, code), which may scroll within itself.

## What to check at each width

1. **No page-level horizontal scroll.** The document's scroll width equals the viewport
   width. Only figures, tables and code blocks may scroll, inside their own containers.
2. **Figure legibility.** Labels remain readable; a figure that only scaled down is
   redrawn or given its own scroll.
3. **Table fit.** Tables either fit or scroll inside a container that shows it scrolls.
4. **Preview length.** The content preview fits in about one screen at the narrow width.
5. **Line length at the wide width** stays within the reading column's range (see
   reading-column-and-type-scale).
6. **Both colour schemes at both widths**: four renders in all.

## Procedure

1. Automate the renders with a headless browser: four screenshots (two widths times two
   schemes) per article revision, kept with the run's output.
2. Automate the measurable properties: compare the document's scroll width with the
   viewport, list elements wider than the viewport, and confirm each is a scroll container.
3. Look at the screenshots. Overlapping labels, clipped captions and unreadable tints are
   not caught by measurements.
4. Repeat in the target platform's own preview for the packaged version; the authored page
   passing does not mean the package will.

## Decision rules

- **When only an embedded frame is available for the narrow check, say so.** Rendering the
  page inside a 390-pixel frame on a wide window approximates a phone but does not emulate
  its device pixel ratio or touch behaviour; record which method was used.
- **When a wide element must stay wide, make it scroll and say so visually** (a fade or a
  scroll hint), so a phone reader knows there is more.
- **A defect at either width blocks publication.** Neither viewport is the primary one.

## When not to use it

Pages that are never published to the open web (an internal slide, a print-only report);
their check is the medium they do reach.
