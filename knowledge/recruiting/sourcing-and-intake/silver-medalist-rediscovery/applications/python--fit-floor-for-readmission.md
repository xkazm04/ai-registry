---
layer: application
type: application
subject: silver-medalist-rediscovery
technique: fit-floor-for-readmission
stack: python
status: forged
verified_on: 2026-10-21
verified_against: python@3.12
applied: code
ab_verdict: better
---

# A third caller that typed its own floor (Python)

A hiring product scores candidates against jobs in a Python engine and runs its
rediscovery sweep in TypeScript. Read at kp `d60e934e9`, Python 3.12 per the CI
workflow. The same question, "is this person at least a promising fit for this role",
is asked on both sides of the language boundary, and the product had done most of
what the technique asks.

## What was already one expression

`pipeline/jobfit/matching.py:81-92` owns the band: `FIT_STRONG_THRESHOLD = 70`,
`FIT_PROMISING_THRESHOLD = 55`, and `fit_tier_for`, which admits at or above each
floor. The TypeScript side re-declares the two numbers in `app/_lib/fit-thresholds.ts`
so a client component can read them without spawning Python. The rediscovery
admission gate reads that file (`app/_lib/rediscover.ts:28`, `:200`,
`Math.round(total) >= SCORE_FLOOR`), and so does the Candidates "Pool fit" filter
(`app/features/library/jobs/jobsRecruiterCandidatesLogic.ts:158`). The cross-language
copy is not hand-kept: `pipeline/jobfit/tests/test_fit_threshold_sync.py` reads the
TypeScript literals, binds them to the Python constants in both directions, and
probes `fit_tier_for` at both boundaries. That covers the drift the technique
predicts between a sweep and a pool view.

## The caller it did not cover

Rematch is rediscovery in the other direction: given a candidate who is rejected or
idle on one role, find the best other open role. `rematch_candidate`
(`pipeline/jobfit/automation.py`) ranked the alternatives and then refused the best
one when

```python
scored[0][0] <= POLICY["rematch_floor"]   # POLICY["rematch_floor"] = 55
```

That is two forks of the shared predicate, and the sync test could see neither:

- **The value was a free literal.** The sync test enumerates names matching
  `FIT_*_THRESHOLD`. A policy dict entry that types `55` is not one of them, so a
  tuned band would have moved the scorer, the badge and the sweep while rematch
  stayed at 55.
- **The comparator was strict.** Every other caller admits at the floor. At a total of
  exactly 55, `fit_tier_for` said "promising", the TypeScript sweep admitted, and
  rematch answered "no alternative above the 55 floor".

The boundary was measured with a probe that held everything fixed except the total
(`score_job` patched to return the real result with `total` replaced):

| total | `fit_tier_for` | TS rediscovery gate | Python rematch, before |
|---|---|---|---|
| 54 | partial | refuses | refuses |
| 55 | promising | admits | **refuses** |
| 56 | promising | admits | admits |

## The change, and the verdict

Landed as kp `53678ce01`. `POLICY["rematch_floor"]` now reads
`matching.FIT_PROMISING_THRESHOLD`, the test is `<`, so a total at the floor is
admitted, and the eval harness's fairness check
(`pipeline/jobfit/eval/automation_eval.py`) moves with it. Two `RematchTest` cases
pin it. One binds the policy entry to the band constant. The other drives a total of
`floor - 1` and `floor` through `rematch_candidate` and asserts that the result
matches `fit_tier_for(total) != "partial"`. The boundary case fails on the old code
(control red at total=55) and passes on the new one. The full Python suite (3,634
tests) passes on the landed tree.

Mode `code`, verdict `better`, on the technique's own criterion: one predicate, the
same answer at its boundary from every caller. This does not show that admitting at
55 produces better rematches. Rematch closes the candidate's current entry, so the
owner could reasonably want it stricter than the sweep. The technique's answer to
that holds here: express the stricter rematch bar as a named level on the shared
predicate, not as a literal one point higher. A different comparator is the same as
a different number, with no name on it.

The history explains the fork without justifying it. The commit that introduced
rematch (`db4e23cb8`, 2026-05-29) carried a spec that wrote the floor as
`ranked[0].total > 55  # >55 floor: avoid junk alternatives`. The shared
`FIT_PROMISING_THRESHOLD` arrived three days later (`764ef5810`) and nobody
re-pointed rematch at it. The spec file is no longer in the tree. Its stated reason,
keeping junk alternatives out, is what the promising floor itself is for. Nothing
argues that rematch should be one point stricter than the band. Would falsify: a
product decision that rematch is meant to be stricter than the sweep. In that case
the fix is a named level, not a revert to the literal.

## What is still forked

The deterministic screening fallback in the same module bands `m.total` against the
literals `70` and `55` (`automation.py`, the `deterministic()` builder and the
early-career `forced_hold` gate). Screening is not rediscovery, and this pass did not
change it. It is the same shape: a correct number that no gate binds.
