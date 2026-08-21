---
layer: technique
type: technique
subject: small-sample-honesty-in-hiring-analytics
technique: insufficient-sample-is-not-a-pass
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, a-verdict-is-bound-to-what-it-judged]
use_when: [a fairness or compliance check cannot run, summarizing check results, a gate skipped a cohort]
shared_with: []
---

# Insufficient sample is not a pass

A check that could not run and a check that ran and found nothing must never
produce the same output. This is the sharpest edge in the subject because it is
the one with a legal surface: a screening-fairness summary that counts a skipped
group among its passes is not merely inaccurate, it is an artifact asserting
that a group was examined when it was not.

The failure is structural rather than careless. Checks are usually written to
return a finding, and "no finding" is the natural empty return. A cohort too
small to assess produces no finding. The summary counts findings. Nothing in
the code is wrong, and the output is a lie.

## The three verdicts a gated check emits

- **Assessed, no concern.** The cohort cleared the floor, the test ran, the
  result is within tolerance. This is a positive claim, and it is
  [bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged):
  it applies to that cohort, that window, that definition, and expires when any
  of them changes.
- **Assessed, concern found.** Ran, and the result is outside tolerance.
- **Too small to assess.** Did not run. Names the cohort, its size and the
  floor it failed to reach. Carries no implication about the underlying
  question in either direction.

Three verdicts, three storage values, three renderings, three follow-ups. Two
is always wrong, and the collapse is always the same one: the third folds into
the first, because that is the direction that makes the dashboard look calm.

## Procedure

1. **Make the refusal a value of the verdict type**, not the absence of a
   verdict. If the check returns an optional finding, the *empty* case is
   ambiguous by construction; return an explicit outcome instead.
2. **Record the floor and the actual count on the refusal.** "Group of 7,
   minimum 30." This is what makes the refusal auditable later and what lets
   someone answer *when will we know*.
3. **Forbid the aggregator from summing across verdict types.** A summary
   reports assessed-clean, concerns, and not-assessed as three separate counts.
   Any single number claiming to summarize "checks passed" is wrong unless the
   not-assessed count is zero.
4. **Decide the operational consequence of a refusal explicitly.** It is a
   product decision, not a default: usually *proceed with human review*, never
   *proceed silently*, and never *block the candidate*.
5. **Surface the not-assessed population as a backlog**, not as noise. It is
   the list of questions the organization currently cannot answer about itself,
   which is a genuinely useful artifact and is invisible in every two-state
   design.

## Decision rules

- When a check is skipped for size, the resulting record says *not assessed*
  and no downstream reader may infer compliance from it. If a report needs a
  single overall status, the presence of any not-assessed cohort caps that
  status below "clear".
- When a check cannot run and the consequence for a person would be adverse,
  it fails toward them — hold for review, not reject
  ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
  A positive-only predicate that merely selects encouraging copy may treat
  unknown as false; a predicate guarding an adverse outcome may not.
- When a group is chronically too small to assess, that is itself a finding
  worth escalating — a group so small it can never be checked is a
  representation fact about the pipeline, and the honest response is to widen
  the window or pool the periods, both of which must be stated.
- When aggregating across cohorts to reach a floor, say what was pooled. A
  ratio computed over pooled periods is a different claim from the same ratio
  in any one period, and pooling can mask a reversal.
- When a refusal is stored, store the floor as it was at the time. A floor
  changed later must not silently re-interpret historical refusals as passes.
- When a check is not run for a reason other than size — not configured, data
  unavailable, upstream failure — that is a fourth state, not this one. Do not
  reuse the small-sample refusal to swallow an outage; a degraded run has its
  own honest label.

## Beyond fairness: the same shape everywhere

The pattern generalizes and is worth recognizing outside compliance, because
elsewhere it is less obviously wrong and therefore more common:

- An unrun authenticity or plagiarism check is not a clean one.
- A competency the interview never reached is not a met competency; it is
  unassessed, and folding it into the score coerces silence into evidence
  ([absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
- A reference that was never returned is not a neutral reference.
- A model that returned nothing because it timed out has not endorsed the
  candidate.

In each case the honest default understates rather than flatters, and the
unassessed condition is a type rather than a magic value.

## When not to use this

Do not stretch this into refusing to act at all. A hiring process has to run,
and "too small to assess" is compatible with proceeding — under human judgment,
with the gap recorded. The technique governs what may be *claimed* about the
check, not whether the pipeline moves; a process that stalls on the
organization's own measurement limits has traded one harm for another.

Do not use it as an excuse to skip a check that could have run. The floor is a
property of the cohort, not a switch; if the assessment is feasible, run it.
