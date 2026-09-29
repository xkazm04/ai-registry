---
layer: application
type: application
subject: degrade-never-block-a-candidate
technique: declare-degraded-grounding-rather-than-lowering-confidence-silently
stack: process
status: forged
verified_on: 2026-09-29
applied: simulation
ab_verdict: better
---

# One formula, two kinds of missing — the Python match scorer

KP's matcher (`pipeline/jobfit/matching.py`) is a good place to see this technique,
because it gets it right in three places and wrong in one, all within a few hundred
lines. Each case asks the same question: when an input could not be seen, does the
number fall, or does a flag say so?

## Where a missing input becomes a flag

- **Salary and location.** When the candidate set no expectation or the posting states
  no pay, the eligibility check returns `EligibilityFlag(key="salary", state="unknown",
  detail="no expectation set")` (`matching.py:493`; further salary cases `:506`, `:514`,
  the posting case `:521`; location `:553`, `:562`). "Unknown" is a third state, not a
  failed check.
- **A candidate whose intake did not normalise.** The automated scoring pass skips
  them instead of scoring a stub low: `entries.filter((e) => e.matchScore == null &&
  !e.intakeDegraded && …)` (`app/_lib/automation-pass.ts:296-298`). The board shows a
  degraded-intake banner with a "mark captured" action; the candidate stays unscored,
  not low-ranked.
- **The job's own silence.** An ad that names no language requirement does not count
  as full credit, and it does not count as zero either: `_NEUTRAL_LANGUAGE_COVERAGE =
  0.5` is imputed so "an absent language signal neither gifts nor penalizes"
  (`matching.py:776-781`, `:863`).

## Where a missing input becomes a lower number

The same line imputes neutral for the job and scores zero for the candidate:

```python
lang_cov = _language_coverage(candidate, job) if job.languages else _NEUTRAL_LANGUAGE_COVERAGE
return round(0.5 * lang_cov + 0.5 * overlap, 4)
```

`_language_coverage` (`matching.py:867-871`) returns `covered / len(job.languages)`. The
candidate's list comes straight from extraction, `languages=_string_list(payload.get(
"languages"))` (`pipeline/jobfit/pipeline.py:688`). When the reader extracted no
languages and the ad names one, coverage is 0.0 and `personal` loses up to half its
value. The formula cannot tell "the CV states no language" from "we did not read one",
and nearly every CV holds at least one. This is the observed-only partial sum the
technique's step 3 now names: a slot for the missing input, filled with zero.

## The simulation (2026-09-29)

A = step 3 as it stood ("computed over the evidence that arrived"; "when evidence is
present and weak, score"). B = the conditioned step 3 (a missing input is dropped from
the denominator or imputed neutral and said so, never scored as absent; an empty
extraction counts as missing unless the reader can tell "states none" from "could not
read").

| Real case | A | B | What the code does |
| --- | --- | --- | --- |
| Salary/location unknown (`matching.py:493`) | approves | approves | flags, no score change |
| Degraded intake (`automation-pass.ts:297`) | approves | approves | leaves unscored |
| Empty extracted languages vs a stated requirement (`matching.py:863-871`) | approves: the evidence that arrived held no language | flags: an empty extraction is missing, and the job side's own neutral imputation shows the asymmetry | scores 0.0 coverage |

B's verdict matches the code's actual behaviour and consequence in 3 of 3 cases; A's
misses the one case that lowers a number. Better, by simulation. The KP defect is not
fixed here. Imputing neutral for an empty candidate list changes `personal` for every
such candidate and every stored snapshot, which is a scoring-model change for KP to
make with its own recalibration. Return: when KP next changes `score_personal`.

## Deviations from the standard

- **Empty-extraction languages score zero** (above).
- **No flag for the language gap.** Even where coverage is legitimately low, nothing on
  the result says whether the candidate's languages were read or absent.
