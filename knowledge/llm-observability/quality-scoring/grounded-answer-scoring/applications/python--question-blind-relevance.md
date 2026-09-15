---
layer: application
type: application
subject: grounded-answer-scoring
technique: question-blind-relevance
stack: python
status: forged
verified_on: 2026-09-15
source: vibrantlabsai/ragas
---

# Python: ragas reconstructs the question from the answer, and zeroes only unanimous evasion

The `ragas` evaluation library at commit
`298b68274234c060deacab3cf5fb52aa3a20e885` (2026-02-24), read in a shallow
clone. The package version is derived from git tags and the clone carries
none, so the commit is the only witness; nothing on this page was executed,
so no `verified_against` is stated. The design comes from the library
authors' 2023 paper on evaluating retrieval-augmented generation
(arXiv:2309.15217), which generates questions "based only on the answer"
and scores their mean cosine similarity to the real question; it reports
78% pairwise agreement with human preference on the 50-page WikiEval set,
against 52% for a model asked to score directly.

## The question is withheld: confirmed

The question-generation prompt's input model has one field, `response`
(`src/ragas/metrics/_answer_relevance.py:31-32`); the instruction asks the
model to "Generate a question for the given answer" and to flag a
noncommittal answer (`:38`). The real question enters only at scoring, as
an embedding (`:117`, `:96-112`). The rewrite keeps the shape
(`collections/answer_relevancy/metric.py:116-124`, `:132-151`).
**Confirmed:** the judge never sees the question it is being compared to.

## Several questions, mean cosine: confirmed

`strictness` sets the number of generated questions, default 3
(`_answer_relevance.py:94`), requested through `generate_multiple(..., n=...)`
(`:142-144`), which for a chat-model wrapper issues `n` copies of the same
prompt (`src/ragas/prompt/pydantic_prompt.py:247`); the rewrite loops
`strictness` separate calls (`metric.py:116-120`). Similarity is the cosine
between each generated question's embedding and the real question's, then
the mean (`_answer_relevance.py:104-112`, `:126-127`; `metric.py:143-154`).

## The evasion flag: present, unanimous, and undocumented

The score is `cosine_sim.mean() * int(not all_noncommittal)`, where
`all_noncommittal = np.all([answer.noncommittal for answer in answers])`
(`_answer_relevance.py:119`, `:127`; rewrite `metric.py:130`, `:154`). Two
consequences the technique names:

- **Only unanimous evasion zeroes the score.** With three samples and two
  flagging the answer noncommittal, `np.all` is false and the answer keeps
  its full similarity. The voting rule is unstated anywhere but the code.
- **The flag is folded, not stored.** The flags are not returned; a zero
  from evasion and a near-zero from an off-topic answer are
  indistinguishable in the result.

The documented formula is the paper's mean cosine with no multiplier
(`docs/concepts/metrics/available_metrics/answer_relevance.md:13-19`), so a
reader reimplementing from the documentation builds a metric with no
evasion handling. **Deviation:** name the multiplier where the formula is
stated.

## Empty and unbounded

- **No usable question.** Legacy returns NaN only when every generated
  question is an empty string (`_answer_relevance.py:120-124`); if some are
  empty and some not, the empty strings are embedded and averaged in. The
  rewrite drops empty questions (`metric.py:122-124`) but returns 0.0 when
  none remain (`:126-127`). Unscored became "completely irrelevant" in the
  rewrite. **Deviation.**
- **Range.** The documentation concedes "the score usually falls between 0
  and 1, it is not guaranteed due to cosine similarity's mathematical range"
  (`answer_relevance.md:26`). **Confirmed as a boundary**, not fixed: no
  clamp, no stamped embedder on the result, so scores from two embedders
  read as one scale.
