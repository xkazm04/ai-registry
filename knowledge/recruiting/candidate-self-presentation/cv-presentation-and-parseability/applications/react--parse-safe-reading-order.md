---
layer: application
type: application
subject: cv-presentation-and-parseability
technique: parse-safe-reading-order
stack: react
status: forged
verified_on: 2026-10-31
verified_against: react@19
---

# The designed CV templates: one markup, three layouts, a headless-browser PDF

Pinned at `kp@2d02eb0ea`. One component (`app/features/jobseeker/cv/DesignedCv.tsx`)
renders a CV document model into three templates that differ only in CSS
(`app/features/jobseeker/cv/cv.css`), and a headless browser prints the same page to PDF
(app/_lib/jobseeker/cv-pdf.ts:119 "page.pdf({ preferCSSPageSize: true, printBackground: true })").
The architecture is right - one source model, one markup, the preview is the PDF - and the
authors knew reading order matters. The gap is that the default template bets against the
technique, and nothing measures the bet.

**Re-checked 2026-10-31 at kp@6edf5d7: the verdict below is largely reversed.** The default
is now a single-flow template (app/features/jobseeker/cv/cvQuery.ts:51, `CV_DESIGN_DEFAULT` with `template: "studio"`)
and five of seven templates are single flow; the two columned ones (`sidebar`, `compact`) are
listed last and marked by `CV_SINGLE_FLOW` (cvQuery.ts:27), stated as the result of a measurement.
That measurement is `npm run cv:roundtrip` (`scripts/cv/roundtrip.mjs`): reference CVs in every
template, rendered with the route's own `CV_PDF_OPTIONS`, extracted two ways and checked against
the source model, exiting 1 when the default template fails. It is a dev tool, not a CI gate;
its pure checker is held by `cvRoundTrip.test.ts` in `npm run test:unit`. The DOM-order comment
(DesignedCv.tsx:14-22) now names the round trip and drops positioned text from the sheet. The
type scale is four levels with body 10.5 pt and dates at body size (cv.css:149-158). Skill pips
are gone in favour of the level word (DesignedCv.tsx:188-191). The PDF is tagged
(app/_lib/jobseeker/cv-pdf.ts:31 "tagged: true") and carries the name and "CV" as metadata title
and file name (`cvPdfFileName`, `cvPdfTitle`). Gaps 1, 3, 4, 5, 6 and 8 are closed as written. Gap 2
narrows: the `compact` template is still two-column, but one-page density is now recency
compression inside one flow (one line for an older role, cv.css:149-158 comment), not this template. Gap 7 narrows: bullet
emphasis is one bold term per declared word, and the skills list carries none. Gap 9 narrows: tagging
and title are set; font embedding is reported by the round trip (variable faces print as Type 3),
not asserted. Anchors below whose construct survived were re-numbered; the rest are the
2026-09-26 reading at `2d02eb0ea`.

## What conforms

- **The DOM order was chosen for parsers.** app/features/jobseeker/cv/DesignedCv.tsx:11-12 "text-order parsers (an ATS) read the name, then the work", and
  `cv.css` repeats it in its header comment. Content-order extractors will get the right
  sequence.
- **Contacts are text, icons decorate.** Each contact renders a glyph *and* the readable
  value as a link (app/features/jobseeker/cv/DesignedCv.tsx:143 "<a href={c.href}>{c.value}</a>"); nothing is labelled by icon alone.
- **Headings follow the document's language**, from a per-language table keyed off a
  stable vocabulary (app/features/jobseeker/cv/cvDocument.ts:420 "export const CV_HEADINGS") - not the
  interface locale.
- **No personal-data fields exist.** The document model carries no photo, birth date,
  marital status or signature - minimisation by default, conformant with
  `market-conventions-and-personal-data`.
- **Theme-invariant paper, set in points** (`cv.css` header comment), with a named print
  page so a short CV does not spill an empty second page.

## Measured gaps, ordered by impact

1. **The default is the two-column sidebar.**
   app/features/jobseeker/cv/cvQuery.ts:20 "CV_DESIGN_DEFAULT: CvDesign = { template:" (value sidebar), and the sidebar is a full-height
   68 mm column on the *left* of a 210 mm page (app/features/jobseeker/cv/cv.css:444 "grid-template-columns: 68mm 1fr;", with the side area spanning both rows). DOM order protects content-order
   extractors only; a positional extractor reads the left column - skills, languages,
   education - before the name, and the independent extractor test cited in the subject
   lost a candidate's name to exactly a narrow sidebar. The technique's default is one
   flow; the sidebar belongs behind an explicit choice with the plain version shipped
   beside it.
2. **The "compact" template is also two-column** (app/features/jobseeker/cv/cv.css:533 "grid-template-columns: 1fr 58mm;") and is the one offered for one-page density - the case where the technique
   prefers a denser skills block *inside* one flow.
3. **No template is a single flow.** The one-column "editorial" template hangs dates in a
   left gutter - app/features/jobseeker/cv/cv.css:380 "grid-template-columns: 30mm 1fr;" - with the dates
   spanning rows and allowed to wrap (app/features/jobseeker/cv/cv.css:390 "white-space: normal;"), so a
   positional extractor can split a date range across the title and first bullet lines;
   and it sets skills, languages and education as a three-column grid
   (app/features/jobseeker/cv/cv.css:405 "grid-template-columns: repeat(3, 1fr);"). The scan-path technique allows
   a hung date only when extraction still yields title, employer and dates together, which
   is unmeasured (gap 4).
4. **No round-trip test exists.** No extractor runs against the produced PDF anywhere in
   the tree (no text-extraction dependency or test found); the claim in the DOM-order
   comment is unverified for positional extractors, the name-first check has never run,
   and a template change cannot regress a measured property because none is measured.
5. **Type below the floor.** Base type app/features/jobseeker/cv/cv.css:47 "font-size: 9.6pt;", compact template app/features/jobseeker/cv/cv.css:427 "font-size: 9pt;",
   dates app/features/jobseeker/cv/cv.css:190 "font-size: 8.8pt;" in muted colour, skill tags 8.8 pt.
   The type technique puts body at 10-11 pt and forbids shrinking dates - among the first
   things read - into small, low-contrast text.
6. **Skill pips with visually hidden level text.** Pips render the stated level
   (app/features/jobseeker/cv/DesignedCv.tsx:149 "const n = levelPips(it.level);"); the level word stays in the text layer but is clipped from
   view (app/features/jobseeker/cv/cv.css:281 "clip-path: inset(50%);"). It matches the pips, so it is not smuggling, but the pips
   themselves are a self-rating drawn as measurement and extract as nothing.
7. **Keyword bolding inside bullets and skill lists** (app/features/jobseeker/cv/DesignedCv.tsx:56 "<strong key={i} className=")
   competes with the entry head for the eye; the hierarchy technique keeps bold for heads
   and at most a lead phrase per bullet.
8. **File name without the document kind.** app/api/jobseeker/cv.pdf/route.ts:54 "filename=" names the file from the
   display-name slug alone; "Name-CV" is the convention
   (courtesy, not ranking).
9. **Unverified export properties.** Tagging, metadata title and font embedding are
   whatever the headless browser defaults to; none is asserted.

## What would move the verdict

Ship a true single-flow template - same-line dates, side lists as one-column runs after
the experience - and make it the default (gaps 1-3); add a round-trip test that extracts the
generated PDF with a content-order and a positional extractor over a fixed set of reference
CVs and asserts name-first and title/employer/dates adjacency (gap 4); and lift the body
floor to 10 pt with dates at body size (gap 5). The rest follows from the
content subject's skills and emphasis rules.
