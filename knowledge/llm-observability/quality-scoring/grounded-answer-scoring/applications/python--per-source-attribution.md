---
layer: application
type: application
subject: grounded-answer-scoring
technique: per-source-attribution
stack: python
status: forged
verified_on: 2026-09-15
verified_against: python@3.12
source: vibrantlabsai/ragas
---

# Python: ragas builds the claim-by-passage matrix and reports two of the three buckets

The `ragas` evaluation library at commit
`298b68274234c060deacab3cf5fb52aa3a20e885` (2026-02-24), read in a shallow
clone. The package version is derived from git tags and the clone carries
none, so the commit is the only witness. The executed checks below ran under
Python 3.12.1 and numpy 2.5.2, with `_compute_score` loaded verbatim from
`src/ragas/metrics/_noise_sensitivity.py:87-111` and fed synthetic matrices.

## The matrix: confirmed

`NoiseSensitivity` requires the question, the response, a reference and the
retrieved passages (`_noise_sensitivity.py:35-44`) and raises when any is
missing (`:125-143`). It decomposes the reference and the response
(`:145-150`), then for each passage verifies both claim lists against that
passage alone (`:154-163`), giving a reference-claims-by-passages and a
response-claims-by-passages matrix (`:166-167`). Response claims are checked
against the reference for correctness (`:168-173`). The rewrite is a
line-for-line port (`collections/noise_sensitivity/metric.py:141-185`,
`:209-234`).

The scoring (`:87-111`):

- a passage is relevant if it supports any reference claim, `np.max(...,
  axis=0)` (`:91-93`);
- a response claim is "relevant-faithful" if some relevant passage supports
  it (`:94-96`);
- in `irrelevant` mode, a claim supported by an irrelevant passage is kept
  only if no relevant passage supports it, `irrelevant_faithful &=
  ~relevant_faithful` (`:100-106`). **Confirmed:** precedence to the
  relevant passage, as the technique requires.

Verifier calls are batched per passage with the full claim list, so the call
count is two per passage plus one (`:154-173`). **Confirmed.**

## The third bucket is never reported

Each mode returns the mean over all response claims of "incorrect and
supported by a passage of that kind" (`:108`, `:111`). An incorrect claim no
passage supports is counted in neither mode. The documentation states the
score as incorrect claims over all claims
(`docs/concepts/metrics/available_metrics/noise_sensitivity.md:9`), which is
the sum of both modes and the invented bucket.

Executed on four response claims over three passages, where passage 0 is
the only relevant one: claim 0 correct and supported by passage 0; claim 1
incorrect, supported by passage 0; claim 2 incorrect, supported by passage 1;
claim 3 incorrect, supported by nothing.

| quantity | value |
|---|---|
| `mode="relevant"` | 0.25 |
| `mode="irrelevant"` | 0.25 |
| documented formula, incorrect over all | 0.75 |
| unreported residual (invented) | 0.25 |

A reader who copies the documented formula gets a different metric from
the one the code computes, and the gap is the bucket that says the
generator invented rather than was misled. **Deviation.**

## Verdict counts are not checked, and one case is silent

The per-passage verdict lists are stacked with `np.array(...).T`
(`:166-167`) with no check that each call returned one verdict per claim.
Two outcomes, executed:

- **Ragged lists raise.** If one passage's call returns a different number
  of verdicts, numpy 2.x refuses the inhomogeneous array with `ValueError`.
  Loud, but a crash rather than a failed verdict.
- **A single verdict broadcasts.** If the response-versus-reference call
  returns one verdict for four claims, `ground_truth2answer` has shape
  `(1, 1)` (`:168-173`) and broadcasts across every claim: the example above
  then scores 0.5 in `relevant` mode, with no error and no warning.

**Deviation:** the technique's rule is to reject the matrix when a call
returns a verdict count different from the claims it was given.

## Cost and scope

Verdicts are (reference claims plus response claims) times passages, plus
one pass against the reference, with calls made sequentially per passage
(`:154-163`, `await` in a loop). Nothing in the tree scopes the metric to a
sample; it has the same single-sample `ascore` entry point as the support
score (`collections/noise_sensitivity/metric.py:104-110`), so a pipeline can
run it on every row. The technique's rule, diagnosis on a sample, is left to
the caller.
