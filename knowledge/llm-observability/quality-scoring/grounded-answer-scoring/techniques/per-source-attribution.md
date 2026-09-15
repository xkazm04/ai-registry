---
layer: technique
type: technique
subject: grounded-answer-scoring
technique: per-source-attribution
status: forged
laws: [estimation-announces-itself]
shared_with: []
use_when: [deciding whether a wrong answer is a retrieval fault or a reading fault, a correctness score dropped and nobody can say which stage caused it, choosing what to fix after a grounded-answer regression]
---

# Per-source attribution

The concern: a correctness score says an answer is wrong; it does not say
why, and the fix depends on why. A system misled by an irrelevant passage
that ranked high needs a retrieval or ranking fix. A system that misread a
relevant passage needs a generation fix. A system that invented a claim no
passage supports needs a grounding instruction or a refusal path. Checking
each claim against the passages joined together cannot tell these apart,
because the join has erased which passage said what. Check each claim
against each passage separately.

## The mechanism

It needs the answer, the retrieved passages, and a reference answer.

1. Decompose the reference and the answer into claims.
2. Build two support matrices: reference claims by passages, and answer
   claims by passages. Each cell is one binary verdict: does this passage
   entail this claim.
3. A passage is **relevant** if it supports at least one reference claim.
   Everything else retrieved is **irrelevant** for this case.
4. Verify each answer claim against the reference. Unsupported answer claims
   are **incorrect**.
5. Assign every incorrect claim to exactly one bucket, in this precedence:
   - **misled by a relevant passage**: some relevant passage supports it;
   - **misled by an irrelevant passage**: no relevant passage supports it,
     some irrelevant passage does;
   - **invented**: no retrieved passage supports it.

Report the three bucket rates over all answer claims, plus the correct
rate. They sum to one, and the sum is the check that nothing fell through.

## What each bucket buys

The bucket names the stage to fix. A high misled-by-irrelevant rate says
the ranking put noise where the generator trusted it; the retrieval side's
floors and ranking are the lever, and a generator change will not move it.
A high misled-by-relevant rate is subtler and usually means the relevant
passage carried something the reference does not (a stale figure, a
superseded policy, a claim true in another context) or that the generator
over-read it; the lever is passage freshness or the generation
instruction. A high invented rate is not a retrieval problem at all; it is
the generator filling gaps from its own weights, and the lever is grounding
discipline or a refusal when evidence is thin.

## Decision rules

- **Precedence goes to the relevant passage.** A claim supported by both a
  relevant and an irrelevant passage is a reading fault: the good evidence
  was in view. Making the buckets mutually exclusive this way is what lets
  them sum.
- **Never report two buckets without the third.** A score counting only
  incorrect claims that some passage supports is a filtered number: it
  silently excludes invented claims and reads lower than the error rate.
  Whichever buckets a report shows, it states the predicate and shows the
  residual, per
  [estimation-announces-itself](../../../_laws.md#estimation-announces-itself).
  A documented formula of "incorrect over all claims" and a computed one of
  "incorrect and passage-supported over all claims" are two metrics under
  one name, and the gap between them is exactly the invented bucket.
- **Relevance here is defined by the reference, and inherits its gaps.** A
  passage carrying a correct detail the reference omitted is labelled
  irrelevant, and claims drawn from it are filed as misled by noise. Review
  a misled-by-irrelevant cluster before retuning retrieval on it.
- **Batch claims per passage, not per cell.** One verifier call per passage
  with the full claim list keeps the call count linear in passages, while
  the verdict count stays claims times passages. Denominator integrity from
  the decomposer technique applies per call: every call returns a verdict
  for every claim it was given, or the matrix is rejected, never reshaped.
- **Spend it on a sample, for diagnosis.** The matrix costs roughly
  (reference claims plus answer claims) times passages verdicts, plus one
  pass against the reference: for ten claims a side over five passages,
  about a hundred verdicts for one case. That is affordable on a
  stratified sample of failing cases after a correctness score drops, and
  on a frozen diagnostic set before and after a retrieval change. It is not
  a per-trace production score.

## When not to use it

Without a reference, "incorrect" has no definition and the matrix cannot be
built; the support score against joined evidence is what remains. With a
single passage there is nothing to attribute between. And where the
correctness score is healthy, the matrix only confirms it at many times the
price; attribution earns its cost when there is a failure to explain.
