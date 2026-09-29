---
layer: application
type: application
subject: pipeline-stage-modelling
technique: screening-gate-index
stack: spec
status: forged
verified_on: 2026-09-29
refresh_by: 2027-03-28
source: us-29cfr1607@2026-09-29
---

# Who is in the denominator of a step-level selection rate

The gate technique makes "advanced past screening" computable on any board. It
leaves open which people the rate is *over*, and says only that a rate computed over
the still-active rows drops the people the filter removed. Two regimes define the
denominator; a web lane read them on 2026-09-29.

**How the evidence was read.** The federal text was read as extracted text from the
Cornell Legal Information Institute (the official e-CFR page redirected), and the
agency's questions and answers from eeoc.gov. New York City's rule was **not**
reached in its final form: the DCWP page returned a 403 and a mirror was unreadable,
so the only rule text read verbatim is the September 2022 *proposed* rule. The
final rule's wording below is search-derived and is a lead. This page does not say
what the final rule requires.

## The federal selection-procedures guidelines (29 CFR 1607)

- §1607.16, read: "Selection rate: The proportion of applicants or candidates who
  are hired, promoted, or otherwise selected."
- §1607.4C, read: "If the information called for by sections 4A and B above shows
  that the total selection process for a job has an adverse impact, the individual
  components of the selection process should be evaluated for adverse impact."
  Step-level rates are a diagnostic under the total, not the primary test.
- §1607.4D, read: a rate "less than four-fifths (4/5) (or eighty percent) of the
  rate for the group with the highest rate will generally be regarded ... as
  evidence of adverse impact".
- Questions and answers, no. 15, read: "The precise definition of the term
  'applicant' depends upon the user's recruitment and selection procedures." And:
  "A person who voluntarily withdraws formally or informally at any stage of the
  selection process is no longer an applicant or candidate."

Two consequences for the gate's denominator. A candidate **rejected** at screening
was assessed and not selected, so they stay in the denominator: the technique's
"a rate over the still-active rows has dropped exactly the people the filter
removed" is right for them. A candidate who **withdrew** is treated differently by
the regime: from the moment of a voluntary withdrawal they are no longer an
applicant or candidate at any later step. So closure cannot be one bucket in the
data. A board that folds withdrawn into rejected overstates the non-selected at
every step after the withdrawal; one that folds rejected into withdrawn understates
them. The outcome must keep the two apart, and the rate must say which population it
used. The same page found the shipped systems split the same way (see the
[vocabulary application](./spec--stage-role-vocabulary-not-stage-names.md)):
SmartRecruiters (REJECTED and WITHDRAWN as separate statuses) and Ashby ("Rejected
by Candidate" among its outcomes) keep the two apart.

## New York City Local Law 144, as far as it was read

The proposed rule (DCWP notice of hearing, September 2022, read) defines "Selection
Rate" as "the rate at which individuals in a category are either selected to move
forward in the hiring process or assigned a classification by an AEDT", "Screen" as
"to make a determination about whether someone should be selected or advanced in
the hiring or promotion process", and "Candidate for Employment" as "a person who
has applied for a specific employment position by submitting the necessary
information and/or items in the format required by the employer or employment
agency". "Selected to move forward" is the event the gate technique measures, and
the definitions do not tie it to a stage name or a position, which is the point of
deriving it. The final rule reportedly replaces the proposed average-score ratio
with a "scoring rate" (the share above the median) and gives the denominator as the
individuals in the category who applied or were considered (search-derived, not
read). Check the final text before relying on either.

## Two things the gate technique should not claim

- No text read fixes how a tool vendor defines a *step*. The federal guidelines and
  the city rule speak of a selection procedure or a screen; neither says "the stage
  named screening" or "the first interview", so a role-derived gate is a defensible
  operationalisation and not a statutory one.
- An automated screening or evaluating step falls in the EU AI Act's high-risk list
  as written (Annex III, 4(a), read: "recruitment or selection of natural persons,
  in particular to place targeted job advertisements, to analyse and filter job
  applications, and to evaluate candidates"). That gives the `screening` and
  `scoring` roles a regulatory meaning beyond the funnel, which is a reason for the
  role to be explicit and for the automation permission to be a table over it.
