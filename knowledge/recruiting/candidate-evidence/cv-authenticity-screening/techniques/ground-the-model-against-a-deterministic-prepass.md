---
layer: technique
type: technique
subject: cv-authenticity-screening
technique: ground-the-model-against-a-deterministic-prepass
status: forged
laws: [a-predictor-cannot-grade-its-own-labels, inference-must-look-like-inference, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [designing the order of an analysis pipeline, a model reading is the only reading a system has, deciding how to detect a compromised or drifting analysis]
---

# Ground the model against a deterministic pre-pass

A model reading a career document produces an output that is internally
consistent whatever produced it. A genuinely strong candidate, a hallucinated
reading, and a successfully injected document all yield the same artifact: a
confident, well-formed, plausibly-justified assessment. Nothing about the output
distinguishes them, because there is nothing for it to disagree with.

The fix is not a better prompt. It is a **second, independent reading that cannot
be talked to** — a deterministic pass over the same text, run *before* the model,
whose findings the model's output is then checked against.

## What the pre-pass is

A mechanical, explainable, non-inferential pass that establishes what the
document literally contains, with respect to the requirements the role actually
stated:

- for each stated requirement, whether its terms (and their known synonyms and
  normalised forms) appear in the document at all;
- how many times, and where — with the surrounding fragment kept as a quotable
  evidence span;
- what the document's dated structure is, as read by the parser;
- nothing else. The pre-pass has no opinion about seniority, fit, adjacency or
  potential. Those are the model's job, and the pre-pass would be bad at them.

Three properties make it useful, and all three come from what it lacks:

- **It is deterministic.** Same text, same rules, same output — so a difference
  between two runs means the text or the rules changed, never that the weather
  changed.
- **It cannot be instructed.** A term-matching pass does not read imperative
  sentences as imperatives. An injected document scores exactly as well against
  it as an honest one with the same words, which is the whole point.
- **It is explainable to a candidate and to a court.** Every finding reduces to
  "this string appears at this position", which survives being questioned in a
  way a model's narrative does not.

## Why the order is load-bearing

Run the pre-pass **before** the model, not after. Three reasons, in increasing
order of importance:

1. Its output is useful *to* the model — a grounded list of what is present, with
   quotes, reduces the model's freedom to invent evidence.
2. A pass computed afterwards is under pressure to agree; a pass computed
   beforehand is a fixed record the later reading is measured against.
3. Running it first means the system still has a usable reading when the model is
   unavailable. A degraded run continues on the deterministic path with its
   provenance honestly downgraded rather than blocking the pipeline, per
   [a candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
   A deterministic reading labelled as such is a legitimate artifact; a frozen
   degraded verdict presented as authoritative is not.

## The cross-check

After the model returns and its output passes schema validation, compare the two
readings. The comparison is not "did the model get the same answer" — it should
not, they are answering different questions — but **is the model's assessment
supported by what the document demonstrably contains**:

- **Re-score against detected requirements only.** Recompute using the pre-pass's
  evidence, and see what the assessment would have been if only demonstrable
  presence counted.
- **Surface the unproven bucket, not a second number.** The output of the
  cross-check is a *list of claims the document does not support*, not a rival
  headline score. Two competing scores on one screen is an unresolvable question
  for the reviewer and an unanswerable one for the candidate.
- **Divergence sets a review flag, not a penalty.** A model assessment far above
  what the text supports means one of: an injected document, a hallucinated
  reading, a genuine adjacency the pre-pass could not see, or a synonym gap in
  the term lists. Three of those four are not the candidate's fault. The flag
  says *reconcile this*, and a human does.
- **The gap is the metric worth tracking.** Aggregate divergence over time is the
  honest health signal for the analysis stage — drift, a prompt regression, or a
  wave of manipulated documents all show up here first.

This is the domain's rule that
[a predictor cannot grade its own labels](../../../_laws.md#a-predictor-cannot-grade-its-own-labels)
applied at the level of a single analysis: the model's confidence is evidence
about the model, and the only thing that can contradict it is a reading the model
did not produce.

## State the detection floor

Every grounding gate has a shape it catches and a shape it does not, and the
honest ones say which. A gate written as *a near-perfect headline over a pre-pass
that corroborated nothing at all* is deliberately narrow: it fires on the
signature an injection produces — maximum score, sub-scores pinned at their
maxima, no gaps, over text the deterministic pass found nothing in — and it stays
quiet on real candidates, because a genuinely strong document lights up at least
one deterministic signal.

What it cannot see is **subtle inflation**: a legitimate assessment nudged from
one band to a higher one. Nothing in a single run distinguishes that from a
generous reading. Write the limit into the gate's own documentation, so nobody
downstream mistakes a quiet gate for a verified score, and so the two screens are
understood as orthogonal — the grounding gate catches the *effect* on an
implausible score, the attempt-detection screen catches the *cause* in the text,
and each fires in cases the other misses.

## What the pre-pass is not allowed to become

- **It is not a scorer.** Term presence is a terrible measure of capability;
  promoting the pre-pass to a decision instrument rebuilds the keyword filter the
  whole domain is trying to escape.
- **It is not a veto.** The model finding real, adjacent, well-argued experience
  the pre-pass's vocabulary missed is the *normal* case, not an error. The
  cross-check surfaces the divergence for a human; it never overrides the
  richer reading.
- **It is not a measurement of the person.** Its output renders as evidence
  spans, in the grammar of quotation, per
  [inference must look like inference](../../../_laws.md#inference-must-look-like-inference)
  — the pre-pass is the one component here that is *not* inference, and its
  presentation should make that visible.

## When not to use this

- **When the role's requirements are not stated in checkable terms.** A pre-pass
  needs a vocabulary to look for; against a posting written entirely in
  aspiration, it finds nothing and its silence means nothing.
- **When the document is too damaged to read mechanically.** Then the pre-pass's
  finding is *could not determine*, and the cross-check is skipped rather than
  run against an empty baseline — an empty baseline makes every model reading
  look unsupported.
- **For qualities that are genuinely not lexical.** Judgment, ownership,
  trajectory and communication leave no reliable term footprint; expecting the
  pre-pass to ground an assessment of them will produce divergence flags on every
  strong candidate.
