---
layer: technique
type: technique
subject: bulk-adverse-action-governance
technique: unscored-excluded-never-coerced
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds]
shared_with: []
use_when: [ranking a cohort where some members have no score, writing a bulk cutoff over partially scored data, deciding what an adverse record may state about an unmeasured candidate]
---

# Unscored excluded, never coerced

## The concern

Every ranked bulk action reads a score field that is sometimes empty — a parse failure, a
degraded run, an application that arrived after scoring, a candidate whose evidence the
pipeline could not process. The line of code that handles it is usually a default-to-zero
written to satisfy a type checker, and it is one of the most damaging expressions in a
hiring system.

Follow what that default does. The empty score becomes a genuine-looking zero. The zero is
a real number, so it ranks — at the very bottom, worse than everyone actually measured.
It passes the "below the floor" test, because zero is below every floor. It falls inside
the bottom slice, because it defines the bottom. And then the rejection seals, with a
sealed reason stating a match of zero: a claim about a person that no measurement
supports, written into an immutable record, in a system whose whole obligation is to
[say only what the record holds](../../../../_laws.md#say-only-what-the-record-holds).

The population this hits is not random. Unparseable evidence correlates with unusual
career shapes, non-standard document formats, foreign credentials, and languages the
pipeline handles worst — so a defaulting expression written for type-safety becomes a
systematic adverse action against the least standard applicants, and it is invisible in
every disparity report because it looks like a legitimate low score.

## The rule

An unscored entry is **excluded from the ranked cohort entirely** — it does not
participate in the ranking, it cannot occupy a slice position, it is not eligible for the
adverse action — and it is **returned as an explicit unscored outcome** so the preview
names it. Missing is a state, not a value
([absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence)).

Exclusion alone is not enough. Silently dropping the unscored is the second failure mode:
the wave runs, the count comes back lower than expected, nobody knows those people exist,
and they sit in the pipeline unprocessed until the requisition closes. The unscored must
surface *by name* with a reason that reads as an instruction — score these — rather than
as an outcome.

## The procedure

1. **Type the absence.** The score field's empty state must be distinguishable at the
   type level from a legitimate low score, and it must stay distinguishable all the way to
   the record. If the transport flattens it, the flattening is the bug.
2. **Partition before ranking.** Split the pool into scored and unscored first. Rank only
   the scored. The window size, the floor, and the tie logic all apply to the scored
   partition, so a pool of forty with ten unscored takes its bottom slice of thirty.
3. **Emit the unscored as a spared outcome carrying its own reason code**, drawn from the
   same closed reason vocabulary the rest of the wave uses. It is a *kept* candidate with
   a distinct explanation, not a filtered-out row.
4. **Show them on the preview in their own group**, above or beside the rejected groups —
   a reviewer who cannot see them cannot act on them.
5. **Never write an adverse record for them**, and never write a numeric score into any
   record for them. An adverse action on an unmeasured person is the archetype of
   [uncertainty resolving the wrong way](../../../../_laws.md#uncertainty-resolves-toward-the-candidate).

## Decision rules

- **When a score is missing, exclude — regardless of why.** Do not distinguish "not yet
  scored" from "scoring failed" in the *eligibility* decision; distinguish them only in
  the reason text the reviewer reads. A failure-versus-pending branch invites a rule that
  treats one of them as actionable.
- **When a score is present but the run that produced it was degraded, treat it as
  present and flag it** — degradation is a quality caveat, not an absence, and it belongs
  next to the number. Whether a degraded run should have produced a number at all is a
  question for the scoring seam, not for the bulk cutoff.
- **When the unscored fraction of a pool exceeds a small share, refuse to run the wave
  at all.** A cohort that is a third unmeasured is not a cohort you can take a bottom
  slice of; the ranking is over a biased subset and the slice inherits the bias.
- **When someone proposes a neutral default instead of zero** — the cohort mean, a
  midpoint, a configured placeholder — refuse. A neutral default is indistinguishable
  from a measured value of the same magnitude, which is the same defect with better
  manners; it merely moves who it flatters.
- **When a downstream consumer needs a number**, give it the absence and let it decide.
  Coercion at the boundary is how the zero got in the first time.

## Detection in an existing system

The defect hides well, so look for it structurally rather than by symptom: search the
decision path for null-coalescing into a numeric literal, for aggregate functions that
skip nulls silently while a count does not, and for any place a nullable score crosses
into a non-nullable type. Then check the sealed records — an adverse reason quoting the
minimum possible value at a rate far above the rest of the distribution is the fingerprint,
and the count of such records is the size of the incident.

## When not to use it

- **Not for favourable or informational surfaces.** A dashboard may show unmeasured as a
  neutral placeholder, and a "you might also like" ordering may drop them. The rule is
  scoped to consequential adverse selection.
- **Not as a reason to block the pipeline.** Excluding the unscored must not stall the
  people involved; the wave proceeds on the scored partition and the unscored are queued
  for scoring with a deadline — a candidate's process may never stall on your
  measurement debt.
