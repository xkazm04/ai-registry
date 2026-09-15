---
layer: application
type: application
subject: grounded-answer-scoring
technique: the-decomposer-is-inside-the-instrument
stack: python
status: forged
verified_on: 2026-09-15
source: vibrantlabsai/ragas
---

# Python: ragas ships the omission leak as its default exemplar, and trusts the verifier's count

The `ragas` evaluation library at commit
`298b68274234c060deacab3cf5fb52aa3a20e885` (2026-02-24), read in a shallow
clone. The package version is derived from git tags and the clone carries
none, so the commit is the only witness; no `verified_against` is stated
because nothing on this page was executed. Legacy classes live under
`src/ragas/metrics/_*.py`, rewrites under `src/ragas/metrics/collections/`.

The tree is the best available illustration of this technique because it
exposes the decomposer's settings as knobs, and every knob it exposes is a
place the technique's rules apply.

## Coverage: the default drops the false attributes

The factual-correctness metric's decomposition examples are keyed by
atomicity and coverage (`src/ragas/metrics/_factual_correctness.py:40-44`).
The shared input is "Charles Babbage was a French mathematician, philosopher,
and food critic." (`:48-50`). The low-atomicity, low-coverage output is
"Charles Babbage was a mathematician and philosopher." (`:54-61`); the
high-coverage outputs keep "French" and "food critic" (`:62-71`, `:83-95`).
Babbage was English and was not a food critic, so the two attributes the
low-coverage cut sheds are exactly the two false ones. And low/low is the
default for both knobs, legacy (`:194-195`) and rewrite
(`collections/factual_correctness/metric.py:80-81`). Run at its defaults, the
metric teaches its decomposer to omit the clauses a precision score most
needs to see. **Deviation:** coverage is presented as a verbosity setting.

## Granularity lives in the exemplars, not the instruction

The decomposition instruction says only "Follow the level of atomicity and
coverage as shown in the examples" (`_factual_correctness.py:157-160`). The
knob is realized by choosing which example set is loaded
(`:202-218`). **Confirmed:** the exemplar set is the contract component, and
the tree's own design says so. Three places it is changed without a trace:

- **Legacy mismatch empties the exemplars.** `__post_init__` clears the
  example list (`:208`) and refills it only on an exact key match; with no
  match it logs a warning and runs with no examples at all (`:215-218`),
  which leaves granularity to the model's default.
- **Rewrite mismatch falls back silently.** `to_string` looks up the
  requested pair and falls back to the low/low set with no warning
  (`collections/factual_correctness/util.py:162-174`, fallback at `:167`).
- **Translation rewrites the exemplars by model call.** `adapt` translates
  every example set through an LLM (`util.py:176-215`). A translated metric
  runs a different instrument under the same name.

None of the three stamps the exemplar set, the atomicity or the coverage on
the `MetricResult` (`metric.py:165` returns the rounded value only).

## Denominator integrity: not held

Faithfulness divides by `len(answers.statements)`, the number of verdict
objects the verifier returned (`src/ragas/metrics/_faithfulness.py:184-189`;
rewrite `collections/faithfulness/metric.py:153-159`), never by the number of
statements issued at `:208-209`. Each verdict echoes a `statement` string
(`_faithfulness.py:59`), but nothing matches the echoes to the issued
claims, so a verifier that returns three verdicts for five claims, or
rewrites a claim before judging it, is scored on what it returned. The same
holds for factual correctness (`_factual_correctness.py:244-250`; rewrite
`metric.py:194-197`). **Deviation.**

## The decomposer is not measured, and shares the verifier's model

No decomposition-quality check exists in the tree: a case-insensitive
search for decomposition quality over `src`, `docs` and `tests` returns 0
lines (positive control: the same search for `atomicity` matches
`_factual_correctness.py:41-44`). The decomposer and the verifier are the
same `self.llm` (`_faithfulness.py:158-161` for verdicts, `:174-178` for
statements), so a calibration run
against human verdicts measures their errors together and cannot separate
them. **Deviation:** the technique's separate row is absent, and the
shared model makes it more necessary, because correlated errors between
cutter and checker (dropping the claim it would also have misjudged) do not
show as verdict disagreement.

The statement generator also receives the question
(`_faithfulness.py:25-27`, `:171-173`), which the technique advises against
because it lets the decomposer select rather than cover.
