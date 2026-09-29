---
layer: application
type: application
subject: pipeline-stage-modelling
technique: stage-role-vocabulary-not-stage-names
stack: spec
status: forged
verified_on: 2026-09-29
refresh_by: 2026-12-29
source: shipped-ats-docs@2026-09-29
---

# How five shipped applicant-tracking systems type, retire and roll up their stages

The vocabulary technique asks a product to give every stage a role from a small
closed set and to key every rule on the role. This page is the counter-evidence
lane: what the vendors that already ship editable pipelines actually expose.
Vendor documentation moves, so this page carries a three-month clock.

**How the evidence was read.** A web lane fetched the pages on 2026-09-29. The
fetch tool summarises a page before it returns it, so a quotation is verbatim only
where it is marked as read; anything from a search result is marked *search-derived*
and is a lead, not a citation. Not reached: Ashby's full API `type` enum (the
schema page shows only `"Active"`), Lever's pipeline-customization pages (a style
error and a 403), and any vendor's documentation of removing a stage in Ashby or
SmartRecruiters. Teamtailor, Workday and Recruitee were not run.

## What the vendors expose

| System | What types a stage | Read |
| --- | --- | --- |
| Workable | a closed `kind` on each stage, with several named stages allowed per kind | `kind` "The type of the stage. Possible values are `sourced`, `applied`, `shortlisted`, `assessment`, `phone-screen`, `interview`, `offer` & `hired`" (`workable.readme.io/reference/stages`). No `custom` kind; rejection is not a kind. |
| Ashby | a coarse stage type, and a separate user-defined grouping for reporting | types "Lead, Application Review, Active, Archived, or Hired" (`docs.ashbyhq.com/understanding-and-reporting-on-interview-stage-transitions`); groups "bucket your interview stages into a common set of stages for reporting" (`docs.ashbyhq.com/what-is-a-grouped-interview-plan`) |
| Greenhouse | no closed type on the stage object; a closed set of "milestones" above it | stage fields `id, name, active, priority, schedulable, default_interviewers, estimated_duration` (`docs.greenhouse.io/harvest.html`); milestones "allow you to maintain flexibility while also offering more streamlined reporting" (Greenhouse blog, *the milestones approach*) |
| SmartRecruiters | a fixed primary status with a per-customer sub-status | NEW, IN-REVIEW, INTERVIEW, OFFER, HIRE, REJECTED, WITHDRAWN, LEAD, TRANSFERRED (`developers.smartrecruiters.com/docs/get-candidate-application-status`); "you can't rename standard hiring steps" is search-derived |
| Lever | stages as `{id, text}`, three milestones above them | search-derived only |

Three ways the shipped shape differs from the technique, none of which refutes
it:

- **Every one of them has a closed role and none of them has fewer than one.** The
  claim survives. But the closed sets are coarse: Ashby five types, Greenhouse five
  milestones, Lever three. The technique's seven roles plus an escape hatch are
  finer than any of them, which costs a consumer a decision per role
  (the technique's own price) and buys the homework and scoring distinctions no
  vendor's reporting spine carries.
- **A team's extra stages sit *under* a role, not beside the roles.** Workable and
  SmartRecruiters let a team add "HR interview" and "Final interview" as two stages
  of the `interview` kind. That is the technique's own shape (any number of stages
  per role) and not its `custom` escape hatch, which none of the five has. The
  escape hatch is this registry's design choice; the evidence for it is the
  technique's argument, not a vendor's practice.
- **Terminal is not one thing across them.** Workable has `hired` only. Ashby has
  `Archived` and `Hired` as *stage types*. SmartRecruiters has HIRE, REJECTED,
  WITHDRAWN and TRANSFERRED as statuses. Greenhouse keeps an application status of
  `active`, `rejected`, `hired` or `converted` beside the stage. So both closure
  shapes the golden path describes are shipped by name, and a fifth reading appears:
  a transfer to another job, which is neither hired nor rejected.

## A shared spine above the teams is the norm

The golden path says comparability is a role problem and warns against mapping
everyone onto a canonical funnel. Read against the vendors, that needs a
distinction the page did not draw. All three that report across pipelines put a
small shared spine above each team's own stages: Greenhouse milestones ("While your
stages may vary across jobs, milestones are standardized touchpoints common to all
jobs", read), Ashby's grouped plan ("Because the grouped interview plan defines
your company's reporting structure, stability at this layer is essential", read,
and it recommends three to six groups), and Lever's milestones (search-derived).
The technique's role vocabulary *is* that spine. What fails is the other thing:
comparing by position. Greenhouse's own practitioner guidance asks for "consistency
in your job stage names, and order your stages in a generally consistent manner
across jobs", which is the position-normalisation the golden path refuses, done by
convention because the product cannot do it by role.

## One stage, several interviews

Vendors allow it: Greenhouse's interview plan holds several interviews in a stage
(search-derived), and candidate self-scheduling there works only on single-interview
stages (search-derived). The only source found that argues the consequence is a
practitioner article (Greenhouse best practices, on LinkedIn, search-summarised, not
fetched): a "Pre-Onsite" stage holding recruiter, hiring-manager and team calls
hides the pass-through between them, so it recommends three stages, and it accepts
an onsite of several interviews "as long as they all happen regardless of feedback
from any one of them". The practitioner boundary is a decision point, not an
activity. No source quantifies the effect on dwell or conversion.

## Removing a stage

- **Workable** (read): "Choose a stage to move candidates to. This will preserve
  any items that are in progress with candidates." The deleted stage disappears
  from reporting and its activity metrics "will be moved to the stage selected".
  That is a human-chosen destination, and it rewrites the history: the reports no
  longer show the stage existed. It is the counter-example to "history keeps
  resolving".
- **Greenhouse** (read): "We don't recommend deleting or merging job stages since
  this can create inaccurate reports." The v3 API marks stages `active` or not, so
  retired stages appear to be kept (an inference; no delete endpoint was found).
- **Lever** deactivates rather than deletes, and requires references in surveys and
  automations to be removed first (search-derived).
- **Ashby, SmartRecruiters**: nothing found.

## What this page did not find

No vendor page read recommends an authored description or exit criterion per stage,
and none of the stage objects above has a description field. The blogs that say
stages need entry and exit criteria are vendor marketing; no study was found. The
technique for a sentence of meaning rests on its own argument.
