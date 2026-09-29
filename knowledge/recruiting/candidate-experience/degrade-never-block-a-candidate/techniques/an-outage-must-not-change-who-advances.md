---
layer: technique
type: technique
subject: degrade-never-block-a-candidate
technique: an-outage-must-not-change-who-advances
status: forged
laws: [no-adverse-outcome-is-solely-automated, uncertainty-resolves-toward-the-candidate, a-candidates-process-never-stalls-on-your-constraints]
use_when: [an incident touched a live pipeline, auditing whether degradation reached a decision, designing which steps may run unattended]
---

# An outage must not change who advances

## The concern

Every other technique in this subject is machinery. This one is the acceptance test,
and it is stated as a property of *cohorts*, not of requests.

An availability incident is normally judged by requests: how many failed, how long,
what the error rate was. In a hiring system that framing misses the harm entirely,
because the failures were absorbed — the fallback ran, nothing errored, the dashboards
recovered. What changed was the *distribution of outcomes for the people processed
inside the window*.

If candidates processed during a degraded period advance at a different rate than
candidates processed outside it, the system has acquired a selection criterion that
nobody wrote, nobody validated, and nobody can defend to the person it disadvantaged.
Worse, it is a criterion made of arrival timing, which is not random with respect to
timezone, shift patterns, caring responsibilities, or which sourcing channel was
pushed that morning. It is a proxy variable that entered the process through the
operations team.

## The property

**For any two comparable candidates, the operational state of the system at the moment
they were processed must not change which of them advances.**

Degradation may change *how a result reads* — plainer, flagged, marked as incomplete.
It may change *when* a human looks. It must not change the outcome.

Three structural commitments make the property hold, and they are the only reliable
ones:

1. **A degraded instrument may not execute an outcome that changes who advances, in
   either direction.** Fallback readings produce holds and reviews. Rejection,
   deprioritisation and auto-close require an authoritative instrument or a human
   ([no-adverse-outcome-is-solely-automated](../../../_laws.md#no-adverse-outcome-is-solely-automated)).
   So does an unattended *advance*. A fallback that can only clear people looks
   harmless per request, but it moves the people inside its window ahead of the
   people outside it. It spends interview capacity on a reading nobody validated,
   and a hire it leads to can close the role on everyone else. Disruption studies
   find effects in both directions: in the 2013 interruptions of an online state
   test, roughly as many examinees were "impacted more favorably" as adversely
   (Sinharay et al., 2015). A fixed-confidence "advance" from a template is the
   usual way this enters a pipeline, and it is the one to test for first.
2. **Degradation is never encoded in a ranking input.** No score discount, no
   confidence haircut, no quiet reordering — see the grounding-declaration technique.
3. **A degraded window is recomputable.** Because the grade, the reason and the
   timestamp are recorded on every result, the affected set is a query rather than an
   archaeology project.

## The procedure

1. **Define the degraded window explicitly**, from the first degraded production to the
   first authoritative one after recovery. Not the outage's status-page duration —
   yours is measured by what your pipeline produced.
2. **Enumerate the affected candidates** by grade and reason, per role and per stage.
   This is why the reason must be queryable rather than logged.
3. **Compare advance rates inside and outside the window** for the same role and the
   same stage. A material gap is an incident finding, whatever the uptime numbers said.
   But the comparison is an alarm, never a clearance, for three measured reasons:
   - *Power.* A window is short and its per-role counts are small. The selection
     guidelines already say that differences "based on small numbers and ... not
     statistically significant" may not show impact, and point to a longer period
     instead (29 CFR 1607.4D). A null at small n is reported as *not evaluable*,
     never as *clean*.
   - *Cancellation.* The studies of Indiana's 2013 online-test interruptions found a
     negligible average effect, while about 5% of examinees were affected in each
     direction. The state's own reviewer still recommended invalidating more than
     1,100 interrupted maths tests and more than 280 English ones, each on the
     student's shortfall against their own predicted score.
   - *Missing people.* One follow-up found "a small negative impact ... on average"
     that vanished "after removing records of the disrupted examinees who were unable
     to complete the test" (Castellano, Sinharay et al., 2023). So the denominator
     counts every candidate who abandoned or never completed inside the window.

   The acceptance test is therefore per candidate. Re-read every degraded-window
   reading on the authoritative instrument and count the decisions that change.
   Split that count by group where the data allows.
4. **Recompute before anyone acts.** Candidates still in flight are re-run on the
   authoritative instrument before a reviewer sees a list that mixes grades. Ranked
   comparison across grades is the mechanism by which the criterion actually bites.
5. **Reopen what was already acted on.** Where a degraded reading contributed to a
   decision already taken, the decision is reviewable and the affected people are
   identifiable. This is the step teams skip; it is the only one that repairs harm
   rather than preventing the next instance.
6. **Record the window in the audit trail of every decision it touched**, so that a
   later question about a specific person has an answer that does not depend on
   someone remembering a Tuesday. The testing standards ask for the same thing at the
   same grain: disruption records kept "so that research studies or case reviews
   based on test records can take it into account", including "disruptions in the
   testing environment that may affect all test takers in the testing session"
   (AERA/APA/NCME *Standards*, 2014, comment to 6.3). An advance that records only
   "system" as its actor, with no engine, has already lost this.
7. **Never sort mixed grades into one list without marking them.** If recomputation is
   not yet possible, the surface separates or marks degraded readings so a reviewer is
   not silently comparing two instruments.

## Decision rules

- **When a degraded reading and an authoritative reading would compete in the same
  ranked view, hold the degraded ones out of the ranking** rather than letting them
  compete at a handicap.
- **When you cannot tell whether an incident changed outcomes, assume it did and
  recompute.** The cost is compute; the alternative is an undetectable, undeclared
  criterion ([uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When the incident is operator-side, the remedy is operator-side.** Extend a
  deadline, re-open a stage, re-run an assessment at your cost — never ask a candidate
  to resubmit to fix your window
  ([a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When incident review is conducted, include the outcome-distribution question as a
  standing item.** Availability metrics alone will certify a clean recovery from an
  event that changed who got called back.
- **When a step cannot satisfy this property under degradation, that step does not run
  unattended.** Some steps have no honest floor; the correct design is a human gate,
  not a weaker automation.
- **When a candidate is held because of degradation, bound the hold.** A hold delays
  the candidate, and delay costs them. Give it a time limit. When the limit expires,
  re-read on the authoritative instrument, never reject by default. Tell the reviewer
  the reading was degraded, so they are not ratifying the fallback's recommendation
  as though the model had made it.

## When not to use it

- **On steps with no bearing on advancement.** Analytics enrichment, internal
  summaries, market context — degradation there is an inconvenience, not a fairness
  event. Applying the full recompute protocol everywhere trains the team to ignore it.
- **Where no automated step contributes to advancement at all.** A fully
  human-decided stage is protected by the human, and this property is satisfied by
  construction.
- **As a substitute for measuring selection fairness generally.** This technique
  detects a criterion introduced by *operational state*. Systematic disparities that
  exist when everything is healthy are a different discipline, owned by the
  adverse-impact subject, and a clean outage comparison says nothing about them.
