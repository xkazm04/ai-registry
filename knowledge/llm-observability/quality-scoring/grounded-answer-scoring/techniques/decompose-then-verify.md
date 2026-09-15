---
layer: technique
type: technique
subject: grounded-answer-scoring
technique: decompose-then-verify
status: forged
laws: [nullable-never-zero, the-judge-is-both-untrusted-and-under-test]
shared_with: []
use_when: [scoring whether an answer is supported by the passages it was given, a grounding verdict must say which sentence failed, an answer quotes its sources verbatim]
---

# Decompose, then verify

The concern: when an answer's support by evidence is the property being
scored, a verdict on the answer as a whole is the wrong unit. It hides which
claim failed, it cannot give partial credit, and it lets one fluent true
paragraph carry one invented sentence past a reader who skims for the gist.
The unit is the claim. Score each claim separately and never the answer as
a whole.

## The procedure

1. **Decompose.** A model cuts the answer into standalone claims: each one a
   single assertion that can be checked with no other part of the answer in
   view. The decomposer receives the answer and nothing that lets it judge
   which claims matter; it owes coverage, not selection.
2. **Verify.** A verifier receives the evidence and the claim list and
   returns, for each claim, a binary verdict (the evidence entails the claim,
   or it does not) and a one-sentence reason. "Not mentioned" is unsupported,
   exactly like "contradicted"; the question is entailment, not plausibility.
3. **Score.** Supported claims over claims issued. The per-claim verdict
   list, with reasons, is stored beside the fraction and is the audit
   artifact; the fraction is its summary.

The atomic-fact study that introduced per-fact scoring found long-form
generations routinely mix supported and unsupported facts, and that an
automated estimator built this way (retrieval plus a strong model as the
verifier) reproduced the human-annotated score with an error rate under two
percent. That agreement is the license for
the procedure; it was measured on one domain and transfers only through the
calibration subject's own measurement.

## Decision rules

- **Standalone is the decomposer's obligation.** A claim that says "it was
  released that year" cannot be verified alone. Pronouns, ellipses and
  references to earlier sentences are resolved when the claim is written,
  not left for the verifier to guess, because a verifier that guesses the
  referent is verifying a claim nobody made.
- **Binary per claim, never graded.** A graded per-claim verdict
  reintroduces the anchor problem at a smaller scale. Partial support is
  expressed by cutting finer, not by a half point.
- **An answer with zero extractable claims is unscored.** Not 1.0 (nothing
  was unsupported) and not 0.0 (nothing was supported). A refusal, a
  greeting, a clarifying question: record a null with a reason, count it
  beside every aggregate, and route it to the relevance or refusal checks
  that can say something about it, per
  [nullable-never-zero](../../../_laws.md#nullable-never-zero). The same
  rule covers every empty denominator in this subject.
- **Fence what the decomposer and the verifier read.** Both models read
  candidate text, which is attacker-influenced by construction; the
  contract subject's
  [nonce-fenced-candidate-isolation](../../judge-contract-design/techniques/nonce-fenced-candidate-isolation.md)
  applies to the claim list as well as to the answer, since a claim is
  candidate text rewritten by a model, per
  [the-judge-is-both-untrusted-and-under-test](../../../_laws.md#the-judge-is-both-untrusted-and-under-test).
- **Verify against the evidence the system actually used.** The passages
  handed to the generator, in the form it saw them. Verifying against a
  cleaner or larger corpus measures a different system.
- **A joined evidence block is fine for the score and useless for
  diagnosis.** Concatenating the passages answers "is this claim supported
  by what it had"; it cannot say by which passage. When that matters, the
  attribution technique is the instrument.

## The judge-free special case: verbatim quotations

Text the answer presents as a direct quotation carries a stronger claim than
a paraphrase: these exact words appear in the sources. That claim is
mechanically decidable. Extract the quoted spans, normalize both sides, and
check each span by substring match against each source, with no model at
all. It belongs in the contract as a mechanical kind, and it is exact where
the judged path is sampled.

The normalization boundary is where it goes wrong. Pairing quotation marks
by a character class that includes the apostrophe cannot parse ordinary
English: the apostrophe in a possessive opens a false span that swallows the
real quotation. Pair opening and closing marks as pairs (straight double
with straight double, curly open with curly close), treat the single mark as
a quotation delimiter only with word-boundary context, and fold curly and
straight forms to one before matching. Match against each source
separately, because a span found only in the join of two passages was
quoted from neither. And an answer with no quotations is unscored on this
check, not perfect and not failed.

## When not to use it

When the answer is a single short fact, a mechanical comparison or one
verdict is the whole decomposition and the pipeline adds only cost. When
the property is not support by evidence (tone, helpfulness, format), there
is nothing to decompose into entailment checks. And when no evidence was
supplied, support is undefined: correctness against a reference is the
bidirectional technique, and truth with neither evidence nor reference is a
judge reading against a rubric.
