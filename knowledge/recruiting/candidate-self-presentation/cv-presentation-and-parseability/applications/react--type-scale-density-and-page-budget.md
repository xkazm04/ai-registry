---
layer: application
type: application
subject: cv-presentation-and-parseability
technique: type-scale-density-and-page-budget
stack: react
status: forged
verified_on: 2026-10-31
verified_against: react@19.3
applied: code
ab_verdict: not-better
proof: ab-paired
---

# The designed CV sheet: every density rule held but the measure, and the measure cost a page

Pinned at `kp@e2a1b2e0b`. One React component renders the document model into seven
templates over one stylesheet, and a pure module turns the printed length into a page
verdict. The version witness is the same React 19 line the sibling applications cite.
The seam was chosen to falsify the claim that the sheet already conforms: the stylesheet
states the technique's rules in its own comments, and the one rule nothing in the tree
measured was line length.

## What conforms

- **Body type at 10-11 pt, four levels only.** The base scale sets the body at 10.5 pt
  (app/features/jobseeker/cv/cv.css:158 "--cv-body: 10.5pt;") and each template re-tunes the four sizes
  without adding a fifth; the round trip reads four levels on every template.
- **Leading in range.** The sheet sets 1.38 (app/features/jobseeker/cv/cv.css:168 "line-height: 1.38;"),
  and templates 1.32-1.34.
- **Margins above the print floor.** The default template pads 16 mm at the sides
  (app/features/jobseeker/cv/cv.css:644 "padding: 0 16mm var(--cv-pad);"), the narrowest page edge 14 mm
  (app/features/jobseeker/cv/cv.css:142 "--cv-pad: 14mm;").
- **Secondary text in ink, never small grey.** Muted text resolves to a dark slate
  (app/globals.css:56 "--color-cv-muted: #5a6572;"), and dates print at body size in ink.
- **Page two behaves.** An entry head never leaves its first bullet
  (app/features/jobseeker/cv/cv.css:289 "break-after: avoid;"), the running head repeats the name at body
  size (app/features/jobseeker/cv/cv.css:1041 "--cv-running-size: 10pt;"), and a last page under a third is
  reported as spill (app/features/jobseeker/cv/cvPageBudget.ts:18 "export const CV_SPARSE_LAST_PAGE = 1 / 3;").

## The measured gap, and why it did not ship

A new instrument renders the five reference CVs (short, long, career change, Czech, two
pages) in every template in headless Chromium, in the faces the PDF prints in, and counts
characters on every line of a bullet, summary or objective except its last.

**A and B.** A: the stylesheet as it stands. B: running text capped at 36 em, the entry
head left at full width.

| | One-flow templates, full-line median | Full lines over 90 | Columned templates |
| --- | --- | --- | --- |
| A | 103-113 characters | 100% | 73-84, unchanged by B |
| B, 36 em | 81 (max 87) | 0% | |

Target: full lines over 90 characters. It moved from all of them to none.

Floor: the round trip's page counts and verdicts unchanged. **It fell.** The fourteen-year
reference CV, which filled one page exactly under A, went to a second page 4-8% full in
three of the five one-flow templates, the default among them. A 38 em and a 40 em cap
(where 9% and 40% of lines stay over 90) spill it the same way. The two-page reference
moved the other way, its last page from 13% to 21-32% full, still under a third. Type
sizes, reading order and every extraction check were identical across arms.

Verdict `not-better`: the measure is a trade against the page, not a free fix, and a
stylesheet change would have silently turned an owner's one-page document into a spill.
The stylesheet is unchanged. The instrument shipped as a report-only dev tool beside the
round trip, so the template owner decides the measure with both numbers in front of them.
The technique's sentence that a single column with 15-20 mm margins "lands in range" was
corrected from this measurement.

## What this cannot say

- **Whether readers read the narrower measure faster on a CV.** The 55-90 range is general
  reading research; no CV reader was measured here.
- **Real documents.** Five synthetic references, 6-24 full lines per template; a single
  fourteen-year document carries the floor break. Return condition: replay stored profiles
  through both arms and count documents that gain a sparse page.
- **Whether a content trim would close it.** The page-budget rule says trim the oldest role
  when a spill appears; the arm did not combine the cap with the designer's one-line
  compaction. That pairing is the next arm.
- **One stack.** The fleet has one recruiting project, so this subject's single-stack point
  does not move.
