---
layer: golden-path
type: golden-path
subject: grounded-answer-scoring
status: forged
use_when: [scoring whether an answer is supported by the passages it was given, a holistic grounding dimension cannot say which sentence was invented, comparing an answer against a written reference claim by claim, deciding whether a wrong answer is a retrieval fault or a reading fault]
techniques:
  - decompose-then-verify
  - the-decomposer-is-inside-the-instrument
  - bidirectional-claim-matching
  - per-source-attribution
  - question-blind-relevance
---

# Grounded answer scoring

Grounded answer scoring is the family of procedures that score an answer
against evidence by cutting the answer into small, separately checkable
claims and rendering one narrow verdict per claim. Its home is the answer a
system wrote after being handed passages, a reference, or both: is each
thing it said supported by what it was given, is each thing it should have
said present, and when it went wrong, which passage led it there. The field
calls the first property faithfulness or groundedness; in plain words it is
the share of the answer's claims that the supplied evidence actually
entails.

The discriminator against the contract subject is the whole reason this
subject exists. [A judge contract](../judge-contract-design/judge-contract-design.md)
asks how to score an answer against anchors; this subject asks how to break
the answer into things that can each be checked against evidence, and what
the breaking costs. A contract dimension that reads "1.0 = every claim
supported, 0.5 = some claim unsupported" is holistic by construction: one
judge reads the whole answer and picks a level. This subject replaces that
one dimension with a pipeline of small verdicts, and the pipeline brings a
second model, a denominator, and an error source the holistic reading never
had.

## Why a holistic grounding verdict fails

A single "is this grounded?" verdict fails in three ways that compound.
It hides which claim failed, so the verdict cannot be audited or fixed. It
gives no partial credit, so an answer with one slip among ten supported
statements and an answer that is mostly invented can land on the same
anchor. And it lets fluency carry fabrication: a long, true, well-written
paragraph with one invented sentence reads as grounded to a reader skimming
for the gist, and a model judge is such a reader. The atomic-fact line of
work made the case with measurement: generations mix supported and
unsupported pieces, so a binary judgment of the whole is inadequate, and a
per-fact estimator with retrieval reproduced the human-annotated score
with an error rate under two percent.

The procedure that answers it is small
([decompose-then-verify](./techniques/decompose-then-verify.md)): cut the
answer into standalone claims, give each one a binary supported or
unsupported verdict with a reason against the evidence, and report
supported over total. The per-claim verdict list is the artifact; the
fraction is a summary of it. An answer that yields no checkable claims is
unscored, never perfectly grounded and never perfectly ungrounded, per
[nullable-never-zero](../../_laws.md#nullable-never-zero).

## The cutting is part of the measurement

The naive reading treats decomposition as preprocessing and the verdicts as
the measurement. Both are the measurement. A claim-level score attributes
the whole answer's support to the model that wrote the answer, but its
error can come from the cutter
([the-decomposer-is-inside-the-instrument](./techniques/the-decomposer-is-inside-the-instrument.md)).
A decomposer that drops a clause removes a claim that can never be marked
unsupported, and nothing makes the dropped clause a true one: a
low-coverage cut that keeps the main noun phrase and sheds the trailing
attributes sheds whatever was false in them. A decomposer that adds a
clause the answer never made charges the answer for it. A decomposer
running at a coarser granularity turns four checkable facts into one
compound claim, and the fraction moves with no change to the answer at all.

So the decomposition's settings are contract components, pinned and
versioned with the verdict prompt: its coverage requirement, its
granularity, and the worked examples that in practice carry both. And the
decomposer is a second model inside the instrument, which gives it a
calibration obligation of its own. The calibration subject's
[golden-set agreement](../judge-calibration-and-drift/techniques/golden-set-agreement-measurement.md)
measures whether verdicts agree with humans; it says nothing about whether
the claims those verdicts were rendered on covered the answer. That needs a
separate labeled row.

## Evidence and reference are two different yardsticks

Checking claims against passages the system retrieved measures support:
did the answer say only what its evidence licensed. Checking claims against
a reference answer a person wrote measures correctness: did the answer say
what is true for this question. A system can pass one and fail the other.
An answer can be perfectly supported by a stale passage and wrong; an answer
can be correct from the model's own knowledge and supported by nothing it
was given.

When a reference exists, the check runs in both directions
([bidirectional-claim-matching](./techniques/bidirectional-claim-matching.md)):
answer claims verified against the reference give precision, reference
claims verified against the answer give recall, and a declared weighting
combines them. Either direction alone rewards a known failure. Precision
alone rewards the short, safe answer that says one true thing; recall alone
rewards the padded answer that says everything and some of it wrong. Each
direction's fraction is computed over its own claim set, because the two
decompositions have different sizes and mixing their counts is mixing
denominators.

## Attribution turns a score into a diagnosis

A low support or correctness score says the answer is wrong. It does not
say why, and the fix depends on why. Checking each claim against each
passage separately, rather than against the passages joined together,
splits the wrong claims into three buckets
([per-source-attribution](./techniques/per-source-attribution.md)): claims
a relevant passage led the model into, which is a reading fault; claims an
irrelevant passage led it into, which is a retrieval or ranking fault; and
claims no passage supports at all, which is invention. A score that reports
the first two and silently drops the third is a filtered number that must
say so. The matrix costs claims times passages verdicts, which makes it a
diagnostic run on a sample, not a score computed on every trace.

## Relevance is scored with the question withheld

Whether the answer addresses the question is a different property from
whether it is grounded, and a judge that reads both question and answer is
easy to persuade: an answer that echoes the question's words reads as on
topic. The procedure that designs this out
([question-blind-relevance](./techniques/question-blind-relevance.md)) shows
a model only the answer, asks it to write the questions this answer would be
answering, and compares those to the real question with a non-model
similarity instrument; an evasive answer is scored zero by a separate,
explicit flag. It is the mirror image of the contract subject's
reference-guided grading, which withholds the candidate while the judge
derives a reference. What the judge is not shown is the bias being designed
out. The result is a prioritizer, not a verdict: similarity is not a
calibrated scale, and a correct answer to a differently phrased question
scores low.

## Judged passage usefulness belongs to ranking, with one caveat

A related pipeline asks a judge whether each retrieved passage was useful
toward the answer and folds the verdicts into a rank-weighted average
precision. The ranking metric is not this subject's: rank-sensitive
precision and recall over labeled relevance are owned by retrieval
evaluation on the builder side, which curates the query set and the labels.
What this subject adds is the one thing that changes when a judge produces
the labels instead of a person. The labels inherit the judge's error and
its calibration obligation, and a variant that judges usefulness toward the
system's own answer rather than toward a reference is circular: a passage
that misled the answer was, by that definition, useful. Judged usefulness
against a reference is a lead on ranking quality; judged usefulness against
the answer measures agreement between the answer and its passages, which is
the support score again with a rank weighting.

## Boundaries with the neighbours

This subject owns the procedure that replaces a holistic grounding or
correctness dimension with a pipeline of per-claim verdicts, the error that
pipeline adds, and the attribution and relevance procedures built from the
same parts. It does not own the contract object those verdicts live in:
dimensions, weights, anchors, floors, mechanical kinds and the fencing of
candidate text all stay with the contract subject, and a decomposer that
reads candidate text is exactly the reader
[nonce-fenced-candidate-isolation](../judge-contract-design/techniques/nonce-fenced-candidate-isolation.md)
protects. It does not own agreement with humans, trust, drift or the
repeatability floor; its verdicts inherit all of that from the calibration
subject, and its one new obligation is the decomposer's own row. It is where
the [generator-uncertainty subject](../generator-uncertainty-scoring/generator-uncertainty-scoring.md)
sends the truth question that a judge-free score cannot answer: here the
judge reads evidence claim by claim. Sampling, settle windows and the
unscored queue belong to [production trace scoring](../production-trace-scoring/production-trace-scoring.md).
Running scenarios repeatably belongs to the builder-side evaluation harness,
and ranking metrics over labeled relevance belong to builder-side retrieval
evaluation. The rule a reader uses to pick: if the question is how to write
the scoring definition, it is the contract; if it is whether the scorer can
be trusted, it is calibration; if it is how to cut an answer so that each
piece can be checked against evidence, it is here.

## Failure modes of the naive reading

- **The fluent fabrication.** One invented sentence inside a true paragraph,
  passed by a holistic verdict that read for the gist.
- **The perfect score on a partial answer.** The decomposer dropped the false
  clauses, the verifier approved everything that survived, and the fraction
  read 1.0.
- **The shrinking denominator.** The verifier returned fewer verdicts than it
  was given claims, and the score rose.
- **Two granularities, one trend line.** Scores cut at different atomicity
  compared as if the answer had changed.
- **Zero for nothing to check.** An answer with no extractable claims or no
  quotations recorded as 0 in one path and 1 in another.
- **The safe short answer.** Precision alone, rewarding the answer that
  commits to nothing it could get wrong.
- **The misfiled fault.** A wrong answer blamed on the generator when an
  irrelevant passage ranked high led it there, or blamed on retrieval when a
  good passage was misread.
- **The echoing answer.** A relevance judge talked into "on topic" by an
  answer that repeats the question.

## The techniques

- [decompose-then-verify](./techniques/decompose-then-verify.md) - standalone
  claims, one binary verdict with a reason each, supported over total, the
  unscored case, and verbatim quotations as a judge-free special case.
- [the-decomposer-is-inside-the-instrument](./techniques/the-decomposer-is-inside-the-instrument.md)
  - omission and addition by the cutter, denominator integrity, granularity
  as a contract component, and the decomposer's calibration row.
- [bidirectional-claim-matching](./techniques/bidirectional-claim-matching.md)
  - precision and recall against a reference, each over its own claim set,
  combined under a declared weighting.
- [per-source-attribution](./techniques/per-source-attribution.md) - the
  claim-by-passage matrix, the three buckets of a wrong claim, and when the
  cost is worth paying.
- [question-blind-relevance](./techniques/question-blind-relevance.md) -
  reconstructing the question from the answer alone, the explicit evasion
  flag, and why the result is a prioritizer.
