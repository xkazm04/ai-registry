---
layer: application
type: application
subject: repository-landing-document
technique: caption-carrying-figures
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Captioning a hero pair that named no difference

`github.com/xkazm04/bp` @ `5657a07` opened its README with two real screenshots
on consecutive lines and no visible text attached to either: only the alt text
("General view, dark", "Security lens, light theme"), which a seeing reader never
reads. The pair varies at least four things at once (zoom level, lens, theme,
filter state of the side queue), so a reader had to hunt for the delta, which is
the exact failure the technique names.

## A and B

- **A** (as found): two images, 0 of 2 with a visible caption, the delta unnamed.
- **B**: the comparison idiom, a two-row two-column table with the images in the
  first row and a caption under each in the second. Each caption says what to
  notice: the first, the whole product at site zoom with per-wing health counts
  and the questions queue; the second, the same plan zoomed to one bay under the
  Security lens, with the queue filtered to security. The captions were written
  by reading both screenshots, not from the filenames.
- **Target**: captioned figures, 0 of 2 to 2 of 2. **Floor**: the project's full
  `check` chain, 26 of 26 green before and after (a Markdown-only change).

## What it showed

The figures were already real renders of the project's own app, so the
"what a figure must be" clause held; only the caption clause failed. The two
screenshots do not differ by one thing, so the honest caption names the zoom and
lens rather than a single delta; the technique's "a comparison that cannot name
its delta should be one image" test applied and was resolved by naming two
deliberate axes instead of dropping a panel.

Two sibling READMEs in the same fleet (a single figure with an italic caption
line directly beneath) already follow the single-figure idiom, which is
corroboration that the idiom survives a plain Markdown renderer. The seam was not
chosen to falsify; the technique was never at risk here.

Return: a landing page whose renderer strips tables should confirm the paired
captions still sit under their own images.
