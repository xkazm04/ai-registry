---
layer: technique
type: technique
subject: grounded-answer-scoring
technique: question-blind-relevance
status: forged
laws: [the-judge-is-both-untrusted-and-under-test, nullable-never-zero]
shared_with: []
use_when: [scoring whether an answer addresses the question it was asked, a relevance judge rates answers on topic because they echo the question, prioritizing off-topic or evasive answers for review]
---

# Question-blind relevance

The concern: a judge that reads both the question and the answer can be
talked into "relevant" by an answer that repeats the question's words back.
Restating the question, listing its terms, and hedging around them all look
on topic to a reader holding the question, and a model judge is such a
reader. To score whether an answer addresses its question, do not show the
judge the question.

## The procedure

1. Show a model the answer alone and ask it to write the question this
   answer would be answering. Draw several, independently.
2. Ask the same model, in the same call, whether the answer is evasive:
   declines, hedges without committing, or says it does not know.
3. Measure the similarity of each reconstructed question to the real
   question with a non-model instrument (an embedding similarity), and take
   the mean.
4. Report the mean similarity and the evasion flag as two fields. The
   combined relevance score is the similarity, set to zero when the answer
   is flagged evasive.

An answer that echoes the question's words cannot fool this: the
reconstruction sees only what the answer asserts, and an answer that
asserts nothing about the topic reconstructs a question about something
else. The paper that introduced the design measured it against a direct
judge on a small set of fifty source pages, as pairwise agreement with
human preference: the reconstruction agreed with humans on 78% of pairs,
against 52% for a model asked directly to score relevance, under a human
inter-annotator agreement of about 90%. It was reported by the design's own
authors, on one small set, as a ranking result, and it licenses ranking.

## The mirror

The contract subject's
[reference-guided-grading](../../judge-contract-design/techniques/reference-guided-grading.md)
withholds the candidate from the judge while it derives a reference, so the
reference is not pulled toward the candidate's framing. This technique
withholds the question from the judge while it derives a question, so the
reading is not pulled toward the question's framing. What the judge is not
shown is the bias being designed out, and choosing what to withhold is a
design decision each judged dimension should state.

## Decision rules

- **The evasion flag is an explicit, separate field.** Store it beside the
  similarity, never folded silently into it, so a zero caused by evasion is
  distinguishable from a zero caused by an off-topic answer. State the
  voting rule across samples (any flag, a majority, or all), because a
  rule requiring every sample to agree zeroes only unanimous evasion and
  lets a two-in-three evasive answer keep its full similarity. If the
  documented formula omits the multiplier, the documentation describes a
  different metric.
- **No reconstructed question is unscored.** If the model returned no usable
  question in any sample, the similarity is undefined: a null with a
  reason, not a zero that reads as "completely off topic", per
  [nullable-never-zero](../../../_laws.md#nullable-never-zero).
- **Do not read the number as a bounded scale.** Embedding similarity is not
  calibrated to zero-to-one: its floor for unrelated text sits well above
  zero for most embedders, it can go negative, and it moves with the
  embedder. A 0.8 under one embedder and a 0.8 under another are unrelated
  numbers. Pin the embedder as a contract component and compare within it.
- **Expect false lows on correct answers.** An answer that correctly
  addresses a question phrased very differently, or answers the intent
  behind a badly phrased question, reconstructs a question that scores low.
  Use the score to rank answers for review, lowest first, and never as a
  pass floor without calibration on labels from the same task, per
  [the-judge-is-both-untrusted-and-under-test](../../../_laws.md#the-judge-is-both-untrusted-and-under-test).
- **Relevance is not correctness and not support.** A perfectly on-topic
  answer can be invented. Report relevance beside the support and
  correctness scores, never as a proxy for either.

## When not to use it

When the question is short and closed (a yes or no, a lookup), almost any
committal answer reconstructs a similar question and the score saturates;
a mechanical or single-verdict check is cheaper. When the product
legitimately answers adjacent questions (clarifying, redirecting, refusing
on policy), those answers score low by design and belong to a refusal or
policy dimension. And for multi-turn exchanges, the question the answer
addresses may live several turns back; reconstruct against the resolved
request, not the last message.
