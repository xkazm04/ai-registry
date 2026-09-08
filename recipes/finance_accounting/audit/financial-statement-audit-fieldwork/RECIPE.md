---
name: financial-statement-audit-fieldwork
version: 0.1.0
status: seed
domain: finance_accounting
path: finance_accounting/audit
---

# Financial statement audit fieldwork and evidence

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Fieldwork that finishes on time with every workpaper signed is the ordinary
way an unmodified opinion gets issued over a misstatement. Effort went where the balance
was large rather than where the entity could plausibly be wrong; samples were drawn from
listings the entity produced and therefore tested the listing; a control was tested for
precise operation without anyone asking which assertion it addressed; and the estimate
that carried the real risk was accepted on management's explanation because no external
document could confirm it. The file reads as complete, the conclusion is documented, and
nothing in it would have found the problem.

**Input.** The entity's business, its processes and how they could produce a
misstatement including one that is deliberate, the account balances and disclosures with
their relevant assertions, materiality and performance materiality, prior period
findings and the audit differences that went uncorrected, the controls the entity claims
to operate, and the evidence obtained or still outstanding for each area.

**Core action.** Judge which assertions in each material area carry genuine risk of
misstatement given how this entity could actually be wrong, and design procedures whose
result would change the conclusion rather than confirm it. Then decide when the evidence
obtained is sufficient and appropriate to conclude, which is a judgment about the risk
that remains and not a report that the program has been completed.

**Output.** A file per area in which a reviewer, and later someone who was never on the
engagement, can follow the risk identified to the procedure chosen to the evidence
obtained to the conclusion reached, without the summary being the only thing that
connects them. Exceptions are dispositioned with a judgment on whether they are isolated
or indicative and what they project across the population. An area where nothing was
found records what was tested and what would have had to be found for the conclusion to
differ, so a low risk assessment is one a reviewer can disagree with rather than a
blank.

## Activities

1. Understand how this entity's processes could produce a misstatement *(observe)*
2. Judge which assertions carry real risk and set the materiality governing them
*(decide)*
3. Decide the nature, timing and extent of procedures whose result would change the
conclusion *(decide)*
4. Obtain evidence, going outside the entity's own reporting where the risk demands it
*(act)*
5. Disposition each exception as isolated or indicative and project what it implies
*(decide)*
6. Document the area so a reviewer reaches the conclusion from the evidence itself
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Work is concentrated where this entity could actually be materially wrong, not where
the numbers are largest or the evidence is easiest.**

- Each area's procedures are traceable to a specific assertion and a specific way this
  entity could be wrong about it, so a procedure that addresses no identified risk is
  visible as effort with no purpose.
- A program carried forward from the prior year is treated as a hypothesis to be
  re-tested, not as a risk assessment, and the file records what changed in the entity
  that would alter it.
- An area assessed as low risk records what made it low, so a reviewer can disagree with
  the assessment rather than only with the amount of work that followed from it.
- Where a control is tested, the file states which assertion the control addresses,
  since a control that operates flawlessly and addresses a different assertion provides
  no assurance over the risk that was identified.

**The evidence supporting each conclusion is capable of contradicting it.**

- A population is tested for completeness before a sample drawn from it carries any
  conclusion, because a selection from an entity produced listing tests the listing and
  not the balance.
- A management explanation is corroborated against something outside management before
  it closes a matter, and an uncorroborated explanation leaves the item open rather than
  resolved.
- The extent of testing follows from the assessed risk and the assurance obtained
  elsewhere, and a sample size taken from habit rather than from that reasoning is
  identified as such.
- Where evidence could not be obtained, the file records a scope limitation and its
  effect on the conclusion, instead of substituting a weaker procedure and concluding as
  though the original had been performed.

**What was found is evaluated for what it says about the population, not netted down to
whatever remains immaterial.**

- Every misstatement above the clearly trivial threshold is accumulated even when it is
  individually immaterial, so a pattern of small errors can aggregate into a total that
  changes the conclusion.
- An exception is only called isolated when its cause has been established and that
  cause is shown not to apply elsewhere in the population, since isolated by assertion
  is a description of the sample rather than of the population.
- A misstatement identified is evaluated for what it indicates about controls and about
  fraud risk, and that evaluation is recorded separately from its monetary size.
- A first year engagement records that opening balances and comparatives carry their own
  risk rather than accepting them because the prior period was audited by someone else.

**The engagement identifies and reports misstatements; it does not correct them.**

- Proposed adjustments are recorded as passed to management for their decision, and the
  file distinguishes what management recorded from what it declined to record.
- A schedule of uncorrected misstatements exists and is evaluated in aggregate,
  including items management declined on the grounds that each was individually small.
- The file contains no work product that amounts to preparing the entity's accounting
  records or its estimates, and a request that would have crossed that line is recorded
  as declined with the reason.

## Guidance

Sufficient is a judgment about the risk that remains, not a count of completed
procedures. Ask what would have to be true for this balance to be materially wrong, and
whether anything planned would find it; a program inherited from last year answers a
risk assessment made about a different year. Evidence the entity produced from a
population the entity defined tests the listing rather than the balance. Independence is
practical here: identify the misstatement, accumulate it, and leave the correcting entry
to management.

## Where this is worth adopting

- A first year engagement where the previous file is unavailable or unconvincing, so
  opening balances and the entity's own account of its controls are the two things most
  likely to be accepted without testing.
- An entity whose revenue recognition depends on judgments about contract terms, where
  the balance ties perfectly to the entity's own system and the risk lives entirely in
  whether the system was told the right thing.
- An audit largely performed remotely, where every document arrives because someone at
  the entity chose to send it and the completeness of each population is therefore the
  first question rather than a formality.
- A group audit relying on work performed by another team or component auditor, where
  sufficiency has to be judged over evidence nobody on the engagement obtained directly.
- A late stage engagement running against a reporting deadline, when the pressure is to
  accept the evidence already gathered and the useful question is which areas that would
  leave under supported.

## Connector types

`documentation`, `spreadsheet`, `storage`, `finance`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`self_paced`. Fieldwork advances as evidence arrives and as each piece changes what
still needs to be done, which no clock and no single event can anticipate. An exception
found in one area reopens the risk assessment in another, and a population that turns
out to be incomplete invalidates work already performed. Scheduling the work in fixed
slices tends to convert the sufficiency judgment into a completion check against the
calendar, which is the specific failure this craft exists to prevent.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The reporting framework and auditing standards this engagement is performed under,
  because what counts as sufficient, what must be documented and what independence
  permits are all defined there and differ between regimes.
- How this entity's processes and systems actually work rather than how they are
  described, since the risk assessment is a claim about the specific ways this entity
  could be wrong and a generic one directs effort to the wrong areas.
- The materiality and performance materiality set for this engagement and the reasoning
  behind them, given that every threshold in the work descends from them.
- Prior period findings and the uncorrected misstatements carried forward, because a
  recurring exception is evidence about the control environment that a fresh look at
  this year alone will not produce.
- Who reviews the file and what that reviewer needs to see to reach the conclusion
  independently, since the file's purpose is to convince a person who was not there
  rather than to record that the work happened.

## Dependencies

None.
