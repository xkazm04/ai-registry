---
name: candidate-to-requisition-match-assessment
version: 0.1.0
status: seed
domain: general_professional
path: general_professional/decisions
---

# Candidate to requisition match assessment

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Agreement between a profile and a requisition's words is the easiest thing to
find and the hardest thing to distinguish from a match, so the shortlist that results is
one everybody can defend and nobody would hire from. Two things make the wrong answer
confident. The requisition is usually a wish list nobody has separated into what the
work cannot proceed without and what was inherited from the last posting, and the facts
that actually end conversations, when someone can start, what they need to be paid,
where they may legally work, are the ones nobody establishes until late. Submissions
then read well and die on the first call, and a requester who has been through that
three times stops reading the fourth.

**Input.** The requisition as written plus whatever the requester has said about it that
never reached the text, the candidate's own account of their work, whatever can be
checked independently of that account, their stated availability and compensation
expectation with the date they stated it, and what earlier submissions against this
requisition were rejected for.

**Core action.** Decide which of the requisition's stated requirements the work
genuinely cannot proceed without, judge whether the candidate has evidence of having
done that work rather than of having been near it, and settle the constraints that can
end a conversation before a submission spends a requester's attention. When the same
requirement rejects candidate after candidate, the finding is about the requisition and
it is owed to the person who wrote it.

**Output.** A submission where each candidate carries, per binding requirement, the
specific work that evidences it and the constraints already settled and dated; a decline
that tells the person what fell short and, where one exists, what would change the
answer; and a record against the requisition of what was screened out and on which
requirement, so a requisition that cannot be filled becomes visible as a requisition
problem rather than accumulating as a sourcing shortfall.

## Activities

1. Separate what the work cannot proceed without from what was inherited from the last
posting *(observe)*
2. Read the candidate's account and whatever can be checked independently of it
*(observe)*
3. Settle availability, compensation expectation and where the work may legally be
performed *(act)*
4. Judge evidence of having done the work against evidence of having been near it
*(decide)*
5. Rule submittable, not yet, or a better fit elsewhere, and say against which
requirement *(decide)*
6. Tell a declined candidate what fell short, once, in terms they can act on *(deliver)*
7. Write the rejection reasons back against the requisition so an unfillable one becomes
visible *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every submitted candidate is submitted against named requirements, carrying the work
that evidences each one.**

- For each requirement the requisition genuinely binds on, the submission names the
  specific work that evidences it rather than the phrase that matched.
- A requirement the record only implies is submitted as implied and named as the thing
  to test in interview, instead of being counted as met.
- A candidate who is strong across the inherited wish list and unevidenced on the one
  thing the work cannot proceed without is not submitted, however well the profile
  reads.
- A first assessment against a new requisition has no rejection history to reason from,
  and says so, rather than treating an empty history as evidence that the requirement
  list is already calibrated.

**Nothing that could end the process in the first five minutes is left to be discovered
at offer stage.**

- Start date, compensation expectation and where the work may legally be performed are
  established with the candidate before a submission, and recorded as the candidate
  stated them and when, not as an assumption carried forward.
- A candidate whose expectation sits outside the requisition's range is not submitted in
  the hope the range moves; either the range is reopened with the requester first, or
  the mismatch is the stated decline reason.
- A constraint recorded months ago is confirmed again before it is relied on, because
  the submission rests on it being true today.
- A constraint the candidate cannot yet answer is submitted as open rather than
  estimated on their behalf.

**A no leaves the candidate better informed and the requisition better understood,
instead of leaving silence.**

- A declined candidate is told what fell short in terms they can act on, and told once,
  rather than left in a silence they reasonably read as still being considered.
- A decline names the requirement it was made against, so it can be revisited when the
  requisition changes or another opening matches.
- Rejection reasons concentrating on one requirement across many candidates are reported
  to the requester as a finding about the requisition, not absorbed as a shortfall in
  sourcing.
- A candidate redirected to a different opening is redirected with the reason and their
  consent, never resubmitted wherever a keyword matches, which is what teaches a
  requester to distrust every submission from this source.

## Guidance

A requisition is a wish list until somebody separates what the work cannot proceed
without from what was copied off the last posting, and everything after that is judged
against whichever list you took. Then look for evidence of doing rather than proximity:
a tool named on a profile only proves somebody was in the room. Settle the money, the
start date and where the work may be performed before spending a requester's attention.
And when the same requirement rejects everyone, the requisition is the finding.

## Where this is worth adopting

- A requisition whose must-have list was copied from the last one filled, where the
  first four submissions all die on a requirement the requester cannot justify when
  finally asked about it.
- A requester who has stopped opening submissions from this source, because the last
  three read well and ended on the first screening call over rate.
- A role with a hard start date, where the strongest candidate on paper cannot begin for
  two months and nobody established that until the offer was being drafted.
- A pipeline where one candidate is submitted to three openings because their profile
  matches words in all of them, and every submission after that is read with suspicion.
- A high-volume requisition where declining well is most of the work, since the people
  declined this month are the pool the next requisition will be sourced from.

## Connector types

`crm`, `database`, `documentation`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. The work exists when a candidate meets an open requisition, and both sides of
that pairing decay. An availability or a rate is true on the day it was stated, and a
shortlist assembled on a schedule is assembled against constraints that have already
moved. A batched pass also loses the moment a decline is worth anything to the person
receiving it, which is soon after they were considered rather than at the end of a
cycle.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which requirements this requester treats as genuinely binding, learned from what they
  have actually rejected on rather than from the requisition text, because the text is
  where the wish list lives.
- What counts as evidence in this field, since a licensed or regulated area accepts a
  credential where another accepts a description of work, and neither standard transfers
  to the other.
- The compensation range the requester will genuinely move on, because holding a
  candidate back against a ceiling that was never real costs a hire, and submitting
  against a ceiling that was real costs the relationship.
- How declines are delivered here and by whom, given that a decline this work writes and
  nobody sends is worse than none, and the candidate has no way to tell the two apart.

## Dependencies

None.
