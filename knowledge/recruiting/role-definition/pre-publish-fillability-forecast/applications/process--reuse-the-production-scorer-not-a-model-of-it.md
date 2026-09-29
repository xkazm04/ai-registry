---
layer: application
type: application
subject: pre-publish-fillability-forecast
technique: reuse-the-production-scorer-not-a-model-of-it
stack: process
status: forged
verified_on: 2026-09-29
---

# The coach as a pure re-run of the matching engine

The winnability coach is implemented as a single pure function in the analysis
pipeline — `pipeline/jobfit/winnability.py`, about 160 lines when this application was written and now a little over 200 — whose entire method is
calling the production matching engine repeatedly with a mutated copy of the
job. The module docstring states the doctrine before any
code appears:

> "The assessment is a set of counterfactual re-runs against the live pool, all
> of which reuse the exact production scorers so the coach can never disagree
> with what publishing would actually surface"

and names the three things it reuses rather than models: `ko_filter` and
`score_job` from `matching.py`, the shared candidate pool, and `role_band` from
the taxonomy. There is no second implementation of any of them.

## The reuse is enforced by the function signatures

The two helpers are three lines each and neither contains a rule:

```python
def _eligible(candidates: list[MatchCandidate], job: Job) -> set[int]:
    return {i for i, c in enumerate(candidates) if ko_filter(c, job)[0]}

def _qualified(candidates, job, eligible: set[int], threshold: int) -> set[int]:
    return {i for i in eligible if score_job(candidates[i], job).total >= threshold}
```

Every counterfactual is then produced by
`job.model_copy(update={...})` — a mutated *copy* handed back into the same two
helpers. The technique's first codebase demand (the requisition must be an
argument, not an ambient read) was already satisfied because `ko_filter` and
`score_job` take `job` as a parameter; the coach was buildable at all for that
reason.

The docstring closes with the second and third demands met explicitly: "Pure
(no I/O, no LLM) so the contract is unit-testable and the counterfactuals are
deterministic". The pool arrives as a list argument, which is the snapshot rule
by construction — every counterfactual reads the identical list.

## One baseline pass, read three ways

The baseline scoring carries the lesson as a comment on a fix:

```python
# Score each eligible candidate against the base job ONCE and reuse the result
# for BOTH the qualified count and the missing-skill map below — the two used to
# each run their own full score_job pass over the same (candidate, job) pairs.
base_results = {i: score_job(candidates[i], job) for i in base_elig}
```

`base_results` then feeds `base_qual` and `base_missing`.
This is the technique's rule 5 arrived at from the cost side: two passes over
the same pairs were not only redundant but were two things that could drift.

## The threshold is imported, not chosen

`fit_threshold` defaults to `FIT_PROMISING_THRESHOLD` imported from
`matching.py`, so the "would be recommended" line the
coach counts against is the same tier boundary the recruiter-facing match list
uses. It is a keyword argument, which keeps it fixed across baseline and every
counterfactual within one call — the demotion technique's precondition.

## What the reuse buys, in one number

Because `_eligible` is `ko_filter` and nothing else, the gate delta —
`len(_eligible(candidates, variant)) - len(base_elig)` —
is arithmetic over two runs of the published filter. When the panel promises
"+8 eligible", publishing with that gate removed surfaces those eight, not
approximately eight. No agreement test is needed between coach and pipeline
because there is nothing for the two to disagree about.

## Deviations

- **Zero-delta gates are dropped.** `assess_winnability` appends a gate only
  `if delta > 0`. The standard renders zero-delta rows as findings — a
  gate that costs nothing here is information, and its absence is
  indistinguishable from the gate not existing. Must-have rows, by contrast,
  are appended unconditionally, so the two lever lists are
  inconsistent with each other on this point.
- **No non-negotiable gate class.** The loosenable set is hard-coded to
  languages and the education floor, so work authorization and licensure never
  reach the suggestion surface — safe by omission rather than by
  classification. The moment a third gate kind is added the classification
  question arrives with it.
- **The seniority floor and work mode are gates that are never levered.**
  `ko_filter` enforces both, and neither appears in
  `loose_gates`, so their cost to the pool is invisible in the forecast even
  though both are recomputable exactly the same way.

## The pool the scorers read is capped, and the coach says so

"Reuse the pool" has a boundary the first version of this application did not
name. The route builds the pool with `buildCandidatePool`, which reads at most
the newest 100 profile records and 60 saved analyses; hitting either cap sets
`truncated`, and the route echoes it as `poolTruncated` on the payload
(`{ ...payload, poolTruncated: truncated }`). The panel shows the *candidates
ranking's* own admission sentence for it, read from that namespace rather than
copied, "so the two surfaces must never drift into two different accounts of
the same cap". The route's comment names the failure it prevents: an
unqualified "your JD only reaches 3 people" is a JD edit made for a reason that
is not true. So "the same pool" means the same capped prefix, and the base on
every count is the newest N of what the record holds, not the record.

The same route holds a second boundary that is easy to miss when the grade is
"derived from the role's own requirements": it applies the visibility gate of
the job read before grading (`404`, not `403`, so the endpoint cannot confirm an
id exists), because an unguarded by-id read graded any tenant's role and
handed back another team's private must-haves as coaching ("loosen min_years to
reach +12").

## Since first written

The pair fallback for must-have demotions and the joint-gate pass (kp
`d790fdf67`, `fb942a9af`) both go through the same `_eligible` and `_qualified`
helpers with a mutated copy of the job: no second scorer was introduced to find
them. That is the reuse doctrine holding under a change made to fix a gap in the
lever set, which is the case the technique exists for. One thing to keep an eye
on: the ledger's priority dial (`critical`, `important`, `minor`) is documented
as a *weight* ("how much should this count when the role is scored?") but today
only sorts the ledger; if it is ever fed into scoring, the coach must take it
as an argument of the same scorer, not apply it beside it.
