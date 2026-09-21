---
layer: application
type: application
subject: grounded-answer-scoring
technique: bidirectional-claim-matching
stack: python
status: forged
verified_on: 2026-09-15
verified_against: python@3.12
source: vibrantlabsai/ragas
---

# Python: ragas checks both directions, then mixes their counts

The `ragas` evaluation library at commit
`298b68274234c060deacab3cf5fb52aa3a20e885` (2026-02-24), read in a shallow
clone. The package version is derived from git tags and the clone carries
none, so the commit is the only witness. The executed check below ran under
Python 3.12.1, with `fbeta_score` loaded verbatim from
`src/ragas/metrics/utils.py:1-22`.

## Both directions: confirmed

`FactualCorrectness` decomposes the response and verifies its claims against
the reference, and, unless the mode is precision, decomposes the reference
and verifies its claims against the response
(`src/ragas/metrics/_factual_correctness.py:265-280`; rewrite
`collections/factual_correctness/metric.py:137-147`). The helper's parameter
names read backwards (`decompose_and_verify_claims(self, reference,
response)` decomposes its second argument and verifies against its first,
`:298-304`), but the two calls are wired correctly. Both directions share
the decomposer settings, as the technique requires.

**Confirmed:** a precision-only mode skips the reverse decomposition
(`:269-276`) and substitutes an empty array. It is not disclosed on the
result: the score is returned as a bare rounded float (`:296`).

**Confirmed:** the weighting is declared, as `beta` with a type check that
refuses a non-float (`:193`, `:220-223`), and the mode is a declared literal
(`:192`). Neither rides the returned value.

## The combination: counts from two claim sets in one fraction

The counts are assembled as:

```python
tp = sum(reference_response)       # answer claims supported by the reference
fp = sum(~reference_response)      # answer claims not supported
fn = sum(~response_reference)      # REFERENCE claims not supported by the answer
```

(`_factual_correctness.py:282-287`; rewrite `metric.py:150-155`.) Recall is
then `tp / (tp + fn)` (`:292`, and inside `fbeta_score`, `utils.py:7-10`).
Its numerator counts answer claims and part of its denominator counts
reference claims, so recall tracks how finely the answer was cut. The
supported reference claims, the correct recall numerator, are computed and
never used.

Executed with the tree's own `fbeta_score`: an answer cut into ten claims,
all supported, against a two-claim reference of which the answer covers
one (so `tp = 10`, `fp = 0`, `fn = 1`):

| | recall | F1 |
|---|---|---|
| tree's counts | 0.91 | 0.95 |
| each fraction within its own claim set | 0.50 | 0.67 |

The same answer cut into two claims would score recall 0.67. A system that
writes longer, more decomposable answers earns recall it did not cover.
**Deviation**, and an upward lesson folded into the technique's first
decision rule. The rewrite reproduces it deliberately, with the comment
"Compute TP, FP, FN exactly like legacy" (`metric.py:149`).

## Empty sides

With zero answer claims, precision mode returns `0 / (0 + 0 + 1e-8)`, which
executes to 0.0 (`_factual_correctness.py:290`); `fbeta_score` returns 0.0
when both precision and recall are zero (`utils.py:12-13`), so an empty
answer and a fully wrong answer are the same number. The rewrite turns an
empty claim list or an empty verdict list into an empty array before the
same arithmetic (`metric.py:190-195`). **Deviation:** unscored is recorded as
zero.
