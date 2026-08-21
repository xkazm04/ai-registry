---
layer: application
type: application
subject: pre-publish-fillability-forecast
technique: counterfactual-gate-loosening
stack: process
status: forged
verified_on: 2026-08-20
---

# The gate the loosening lever operates on

`ko_filter` in `pipeline/jobfit/matching.py:294` is the hard-gate filter that
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

- **Education** (`matching.py:337`): "skip when the candidate's level is
  unknown — uncertainty". The comparison only runs when `cand_edu is not None`.
- **Language** (`:343`): "lenient: skip when the candidate lists none" — the
  whole loop is guarded by `if candidate.languages`.
- **Unclassified archetype** (`:317`): "FAIL CLOSED: never auto-KO on seniority
  a candidate we cannot classify", with scoring falling back to neutral
  weights. A candidate the profiler could not label is not gated out of senior
  roles on a floor the system cannot justify for an unknown class.
- **Language outside the modelled alias set** (`:280`): an unmodelled language
  degrades to a bare literal substring match rather than silent mishandling,
  "deliberate and honest", pinned by
  `test_whole_token_classification.UnmodelledLanguageFallsBackToSubstringTest`.

Every one of these is inherited unchanged by the counterfactual, because the
counterfactual *is* this function. A language gate's `+N` therefore counts
people who list languages and lack the required one — never people whose
language field is empty.

## The phantom-gate incident

`matching.py:344` carries the sharpest lesson in the file, and it is the origin
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

`winnability.py:76` iterates `dict.fromkeys(job.languages)` — de-duplicated,
order preserved — building one variant per required language with that language
removed, then one variant with `min_education` set to `"none"` at `:82`. Each
is a `model_copy`; the stored job is never touched. The comment at `:71` states
the attribution claim precisely:

> "A positive delta means the gate is the *sole* blocker for that many people
> (dropping it can only restore candidates KO'd by it alone)."

Rows are sorted by `eligibleDelta` descending (`:88`), and the panel renders
each as an independent `+N` badge with no cumulative column — the
deltas-never-sum rule honoured in presentation, though nothing in the interface
copy says so explicitly.

## Deviations

- The `if delta > 0` guard at `:79`/`:85` suppresses zero-cost gates entirely,
  so a recruiter cannot distinguish "this gate is free" from "this gate was
  never considered".
- Only two gate kinds are levered. `seniority`, `work_mode` and `early_career`
  are enforced by `ko_filter` but absent from the counterfactual set, so their
  cost is unmeasured despite being computable by the same three lines.
