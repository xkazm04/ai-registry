---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: fill-is-a-count-and-close-is-the-act-it-triggers
stack: process
status: forged
verified_on: 2026-09-29
refresh_by: 2026-12-29
---

# How three applicant-tracking products count seats, read from their own help pages

The technique's claim that a requisition is N seats and that closure follows the
last one is a claim about how the field models it. This page records what was read,
because the technique's upper layer is not allowed to name a product. Every page below
was fetched on 2026-09-29 through a summarising fetch tool, so the wording is
**paraphrase of a summary, not verbatim page text**; the meaning was cross-read
against a second page where one existed. Re-read before quoting.

| Product | What its documentation says about seats and fill | Page (date shown on it) |
| --- | --- | --- |
| Ashby | A role is one job with as many *openings* as there are hires ("if you are hiring three candidates for the same job, you create one job with three openings"). | `docs.ashbyhq.com/creating-and-opening-jobs` (no date shown) |
| Greenhouse | A job is closed automatically after its *last* opening is closed. For an evergreen role, hiring against the last opening offers the option to keep the job open. Time to hire is measured from each opening's own open date, and marking a hire prompts a new opening with a fresh start. | `support.greenhouse.io/hc/en-us/articles/4407711400475` (2026-03-02) and `.../360000891392` (2026-09-09) |
| Workday | Multiple positions can hang off one requisition, and the requisition is not indicated as filled until *all* its positions are. A separate integration page describes a requisition as a container for one or more positions and says the linked job closes once all positions are filled or closed. | `doc.workday.com/.../recruiting-for-administrators/job-requisitions.html` (updated 2026-07-10) and Greenhouse's HRIS-link page (2023-05-10) |
| Lever | Reported, **from search summaries only and not quotable**, to auto-close on at least one hired opportunity, with a warning against using it where one job has several intended headcounts. | help-centre pages returned an error to the fetch tool |

## What it does and does not establish

- **Convergence.** Three products read from their own pages model the seat separately
  from the role, and the fourth is reported to offer an auto-close that *does not*
  and to warn against using it for multi-seat roles. Together with the kp code
  (`node--fill-is-a-count-and-close-is-the-act-it-triggers.md`) and a blind
  training-data lane that recalled per-opening status on one of them, this is what
  earned the technique.
- **Not established.** Nothing read documents a compare-and-swap, a concurrency
  rule, or a derived-not-stored *filled*. Those clauses rest on kp's code and its
  incident comments alone; treat them as one project's discipline, not an industry
  practice. Whether any of the products compares a hire count to a target at all, as
  opposed to closing openings by hand, was not settled by the pages read.
- **Evergreen.** The one product page that addresses it treats a standing pool as a
  role the recruiter *chooses* to keep open at the last hire, which is the technique's
  "make that a recorded choice with an owner".
