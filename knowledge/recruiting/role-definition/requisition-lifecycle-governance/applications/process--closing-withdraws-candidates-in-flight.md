---
layer: application
type: application
subject: requisition-lifecycle-governance
technique: closing-withdraws-candidates-in-flight
stack: process
status: forged
verified_on: 2026-09-29
refresh_by: 2026-12-29
---

# What the products do with candidates when a requisition closes, and what the law adds

The technique claims that stranding is the default and that the cascade is a position,
not a norm. This page records the evidence, with its quality. Vendor pages were fetched
on 2026-09-29 through a summarising fetch tool and are **paraphrase of a summary**, not
verbatim page text. The Ontario statute was read directly from the government's
consolidated text on the same day; the regulation under it could not be retrieved from
this machine (the page returned only its title), so its terms below are a research
lane's reading and one blind-recall agreement, not a citation.

## Close leaves the candidates where they are

- **Greenhouse** (`support.greenhouse.io/hc/en-us/articles/360025499691-Close-a-job`,
  2026-03-02): closing a job leaves every active candidate active on the closed job and
  suggests the organisation reject them or move them to another job; the close prompts
  only about pending offers. A separate hygiene article, read from search only, tells
  users to filter for active candidates on closed jobs.
- **Ashby** (`docs.ashbyhq.com/when-and-how-do-i-close-out-a-job`, no date shown):
  closing the job and archiving the candidates in its pipeline are two separate
  actions.
- **Workday** (job-requisition page updated 2026-07-10 and a setup page dated
  2026-01-23): a requisition audit report exists to show closed, filled or frozen
  requisitions that still have candidates, and a mass action can disposition candidates
  in bulk. The report's purpose was read from a search summary; the mass-action
  wording is on the fetched setup page.
- **Lever**: candidate archiving is a step after the close (search summary only).

Read together this is convergent on the default (a close is not a cascade) and the
cascade is therefore this registry's position. It also means the stranded pipeline is
what a team gets by doing what the product suggests, which is the strongest reason to
build the cascade into the requisition rather than into a checklist.

## Reopen is three different operations

- **Workday** treats a close as permanent: closing permanently closes the job
  requisition and a closed requisition cannot be reopened or hired into; a new
  requisition takes its place.
- **Greenhouse** reopens through a draft and the organisation's approval workflow
  (`support.greenhouse.io/hc/en-us/articles/360025208872`), reusing the job record
  (that reopening also creates a new opening was read from a search summary only).
- **Oracle** resumes a *suspension* without a second round of approvals
  (`docs.oracle.com/en/cloud/saas/talent-management/faush/suspend-a-job-requisition.html`,
  no version shown); a suspended requisition refuses new offers and refuses a close.
- **Ashby** restores an archived job as a draft.

This is what the golden path's undo-versus-reopen line rests on. The vendor split is
evidence that "reopen" is not one act; the line the standard draws (whether anyone was
shown the ending) is the registry's own and was not found in any product.

## The law: one narrow hook, not a general duty

- **Read from the statute text** (`ontario.ca/laws/statute/00e41`, Employment
  Standards Act, 2000, Part III.1, consolidated to the date read): s. 8.6 says that if
  an employer interviews an applicant for a publicly advertised job posting, the
  employer shall, *within the prescribed time period*, provide the applicant with the
  *prescribed information*; the provision is in force from 1 January 2026. s. 8.7
  requires a job-posting platform to offer a way to report fraudulent postings.
- **Not read, reported by a research lane from O. Reg. 476/24**: the period is 45 days
  after the interview or the last interview, the information is whether a hiring
  decision has been made, and employers under 25 are outside the rules. A blind agent
  recalled the 45 days and the size threshold unprompted.
- **No statute read requires notice when a posting is simply withdrawn.** The Ontario
  duty attaches to interviewed applicants, and a proposed New York bill on ghost
  postings (S8877, reported passed by both houses on 2 June 2026, not reported
  signed) was described by the lane as having no applicant-notification duty. Sending
  the message is good practice; it is a legal duty in this one place.
