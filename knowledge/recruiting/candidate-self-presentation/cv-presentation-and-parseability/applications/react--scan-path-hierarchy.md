---
layer: application
type: application
subject: cv-presentation-and-parseability
technique: scan-path-hierarchy
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19.3
applied: code
ab_verdict: better
---

# The designed CV sheet: entry heads conform, the tailoring pass bolded two phrases in a bullet

Pinned at `kp@ef065465f`. The sheet component and its stylesheet render one document model
into every template, and a separate tailoring pass decides which demanded terms the sheet
bolds inside bullets. The version witness is the same React 19 line the sibling
applications cite. Of the technique's rules, the entry pattern and the type scale were
already met by construction; the bold-inside-bullets rule was met only by the sheet, not
by the pass that feeds it.

## What conforms

- **Title, employer and dates share one line.** The entry head is a flex row with the
  title growing and the dates pushed to the end (app/features/jobseeker/cv/cv.css:322 ".cvsheet .cv-role-head {"
  and app/features/jobseeker/cv/cv.css:334 ".cvsheet .cv-dates {"), so a skimming eye and a title-to-nearest-date
  parser see the interval beside the title.
- **Dates cannot wrap.** The date span is set unbreakable
  (app/features/jobseeker/cv/cv.css:339 "white-space: nowrap;"), which is the failure the hung-date rule warns about
  when a range splits across lines.
- **One pattern for every role.** The head is shared markup, so the pattern cannot vary
  between entries; only a template re-tunes it.
- **The name is the largest type.** It takes the name level of the four-level scale
  (app/features/jobseeker/cv/cv.css:236 "font-size: var(--cv-name);"), and the stylesheet states the four-level rule in its
  own header.
- **The sheet bolds only what the document names.** The renderer's emphasis helper
  documents the technique's rule in its own comment (app/features/jobseeker/cv/cvSheet.ts:22 "export function emphasisRanges(text: string, emphasis: readonly string[] | undefined)").

## The measured gap

The sheet bolds whatever a bullet's `emphasis` list holds, and the tailoring pass capped
that list per role (app/features/jobseeker/cv/cvTailor.ts:301 "export const EMPHASIS_PER_ROLE = 2;") but not per
bullet. Two demanded terms that sat in one bullet were both bolded, so one bullet carried
two bold phrases while sibling bullets carried none: a keyword highlight inside the
body, against "one lead phrase per bullet or none". The seam was chosen to falsify the
claim that the tree already conforms; the entry head, date and scale checks above all
held, and the per-bullet rule did not.

**A and B.** A: the pass as it stood, on a probe role set whose demanded terms
co-occur (Python with LangChain, Python with an LLM term). B: the pass skips a bullet
that already holds a mark (app/features/jobseeker/cv/cvTailor.ts:331 "if (picked[i]!.length) continue;"), so
the second term takes the next bullet that holds it.

| | Emphasised bullets carrying two bold phrases |
| --- | --- |
| A | 2 of 5 |
| B | 0 |

The per-role cap of 2 held in both arms; one probe role lost a mark under B when no second bullet held its term.

Target: bullets carrying more than one bold phrase. Floor: the 20 tailoring and sheet
tests stay green and the per-role cap holds. Both held, so the verdict is `better`.

## What this cannot say

- **Real frequency.** The probe roles were chosen to co-occur; how often real tailored CVs
  double-bold a bullet is unmeasured. Return condition: count double-bold bullets in a
  sample of real tailored output.
- **The regression test guards, it does not reproduce.** Its fixture never held two
  demanded terms in one bullet, so it asserts the invariant rather than recreating the
  failure.
- **Whether a recruiter reads one bold phrase better.** This is a layout rule applied to
  a generator; no reader was measured.
- **Reading order and templates.** The two-column templates and the hung-date gutter in
  the sibling application are untouched by this change.
