---
layer: application
type: application
subject: pre-publish-fillability-forecast
technique: counterfactual-gate-loosening
stack: process
status: forged
verified_on: 2026-09-29
---

# The gate the loosening lever operates on

`ko_filter` in `pipeline/jobfit/matching.py` is the hard-gate filter that
`winnability.py`'s eligibility counterfactual re-runs. Reading it is the only
way to know what a `+8 eligible` delta actually means, because the filter's
treatment of missing and phantom inputs is what the delta inherits.

```python
def ko_filter(candidate: MatchCandidate, job: Job) -> tuple[bool, list[KoReason]]:
    """Hard gates. Returns (passed, structured reasons-it-failed)."""
```

Failures are categorised at birth with a stable `key` — `early_career`,
`seniority`, `education`, `language`, `work_mode` — "so rollups group by
category directly instead of re-parsing English prose". That closed key set is
what makes a per-gate attribution possible at all downstream.

## Four gates, four different uncertainty stances

The technique's rule that unknown inputs must not fail a gate is implemented
here four separate times, each with its own reason:

- **Education** (`education_gate`): only a *measured* shortfall knocks out —
  `education_gate(candidate.education_level, job.min_education) == "below"`. An
  unknown level, and a school named with no stated degree, are "uncertain" and
  widen the confidence band instead of evicting (the second case was added in
  `0f7ce4993`, after this application was first written; the rule it refines is
  the same).
- **Language**: "lenient: skip when the candidate lists none" — the whole loop
  is guarded by `if candidate.languages`. A language KO that depended on the
  *order* of the candidate's list was fixed by padding the blob at both ends
  (`50cf602ab`), so the gate now answers the same for `Czech, EN` and `EN, Czech`.
- **Unclassified archetype**: "FAIL CLOSED: never auto-KO on seniority a
  candidate we cannot classify", with scoring falling back to neutral weights. A
  candidate the profiler could not label is not gated out of senior roles on a
  floor the system cannot justify for an unknown class.
- **Language outside the modelled alias set**: an unmodelled language degrades
  to a bare literal substring match rather than silent mishandling, "deliberate
  and honest", pinned by
  `test_whole_token_classification.UnmodelledLanguageFallsBackToSubstringTest`
  (twelve curated buckets today).

Every one of these is inherited unchanged by the counterfactual, because the
counterfactual *is* this function. A language gate's `+N` therefore counts
people who list languages and lack the required one — never people whose
language field is empty.

## The phantom-gate incident

The work-mode branch of `ko_filter` carries the sharpest lesson in the file, and it is the origin
of the golden path's rule that a requirement nobody wrote is not a requirement:

> "A work_mode normalize_job stamped from DEFAULT_POLICY (recorded in
> `job.defaulted_fields`) is a PHANTOM the ad never asserted; like campaign.py's
> `_job_facts` and the salary coach it is treated as absent and must NEVER act
> as a hard gate. Otherwise a blind ad that stated no mode silently KO's every
> remote-only candidate on an assumed 'onsite', removing them from the survivor
> pool before they are ever scored."

The guard is a three-part condition — the candidate expressed a preference,
*and* the job has a work mode, *and* `"work_mode" not in job.defaulted_fields`.
The load-bearing part is the third: the requisition model carries a
`defaulted_fields` record, which is what makes "the advertisement never said
this" a checkable fact rather than an unrecoverable one. A forecast built on a
job model without that record cannot implement the rule at all.

The failure it prevents is exactly the one that makes a fillability forecast
worse than useless: the pool is emptied before scoring, and the coach then
attributes the emptiness to whichever real gate ranks first.

## What the lever actually enumerates

`assess_winnability` iterates `dict.fromkeys(job.languages)` — de-duplicated,
order preserved — building one variant per required language with that language
removed, then one variant with `min_education` set to `"none"`. Each
is a `model_copy`; the stored job is never touched. The comment above the loop states
the attribution claim precisely:

> "A positive delta means the gate is the *sole* blocker for that many people
> (dropping it can only restore candidates KO'd by it alone)."

Rows are sorted by `eligibleDelta` descending, and the panel renders each as
its own ledger row with a share and no cumulative column — the
deltas-never-sum rule honoured in presentation, though nothing in the interface
copy says so explicitly.

## The masked-gate case, witnessed and closed

The comment above the loop is exact about what a delta means — sole blocker —
and that exactness is the hole. Run against the real `assess_winnability` on
2026-09-29 (three pools, one job requiring German and a bachelor's degree):

- Every excluded candidate failing both gates: `eligible 0`, `looseGates []`. The
  coach had no lever to show on the pool the two gates jointly empty.
- One candidate failing only language, one only education, three failing both:
  deltas of 1 and 1; removing both gates restores 5. The sum of deltas (2) is
  below the joint effect (5), the reverse of the technique's earlier
  "the sum exceeds the effect of removing both".

The change (kp `d790fdf67`) adds one pass with every levered language and the
education floor removed and returns it as `jointLoosen {eligibleDelta,
soleBlockerSum, gates}` only when it exceeds the sum of the singles; three new
tests pin the empty-table pool, the understated sum, and the absence of the row
when the gates block disjoint people. The wire type carries the optional field;
the ledger does not render it yet (see deviations).

## Deviations

- **Zero-delta gates are dropped, twice.** The `if delta > 0` guard in
  `assess_winnability` appends a gate only when it recovers someone, and
  `derivePatterns` in the ledger drops any row with `eligibleDelta <= 0` again
  ("a pattern that costs nobody is not a finding"). The technique now reads a
  zero as one of four things, only one of which is "costs nothing"; a dropped
  row makes them indistinguishable, and the joint row is the only place a masked
  gate surfaces.
- **The joint row has no surface yet.** `jointLoosen` reaches the payload and the
  type but no ledger row; a recruiter looking at the panel still sees an empty
  table for the fully-masked pool. Unapplied at the UI level.
- **Only two gate kinds are levered.** `seniority`, `work_mode` and
  `early_career` are enforced by `ko_filter` but absent from the counterfactual
  set, so their cost is unmeasured despite being computable by the same three
  lines. With the joint pass this also means a pool emptied by a seniority
  floor and a language gate shows only the language half.
- **No small-pool suppression.** The coach's only short-circuit is `poolSize === 0`;
  a pool of three reports "+2 eligible, 67%" as readily as a pool of three
  hundred, though the golden path asks for an insufficient-pool verdict.
