---
layer: technique
type: technique
subject: recruiter-anchored-model-evaluation
technique: unverifiable-is-not-fabricated
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, inference-must-look-like-inference]
shared_with: []
use_when: [writing the grounding rule in a judge prompt, a rubric is penalising claims merely absent from the supplied excerpt, model rankings reward the models that say the least]
---

# Unverifiable is not fabricated

A claim that lies outside the supplied evidence excerpt is **unverifiable**. It
is not a fabrication. Only a **direct contradiction** of the supplied evidence
is a grounding failure, and only contradictions carry a penalty.

Write the rule into the judge prompt in those words. It is one of the few
single sentences in an evaluation that changes a ranking.

## Why the naive rule misranks models

The evidence excerpt is not the world. It is a slice — truncated by a context
budget, selected by a retrieval step, parsed by something that may have dropped
a page. A claim absent from it can be:

- false, and invented;
- true, and present in the part of the document the excerpt did not carry;
- true, and general knowledge about a technology, a certification, a market or
  an industry that the model legitimately holds.

Treating all three as fabrication punishes a model for the excerpt's
truncation and for knowing things
([absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
The bias it introduces is not random: it rewards models that hedge, restate the
input and add nothing, and penalises models that read further into the document
or connect a stated skill to its obvious implication. A team optimising against
that rubric will select, deliberately and with data, for the blandest model in
the matrix.

The faithfulness literature has long drawn the same line: a claim that
contradicts the source and a claim the source neither supports nor denies are
different categories with different costs. Collapsing them is a rubric bug, not
a strictness setting.

## The three-label scheme

Every extracted claim gets exactly one label:

- **Supported** — the excerpt carries it. Positive contribution.
- **Contradicted** — the excerpt says otherwise. Penalty, and a verbatim quote
  of the contradicting line is mandatory.
- **Unverifiable** — the excerpt neither carries nor denies it. **Neutral to
  the grounding score, and counted.**

The count is the part teams drop, and it is where the value is. Grounding score
tells you whether the model lies; the unverifiable count tells you how far it is
reaching beyond its evidence. A model with a clean grounding score and a large
unverifiable count is not safe — it is unaudited. Report both.

Reserve a fourth outcome for the pipeline, not the judge: if the unverifiable
rate is high across all models on one use case, the retrieval or parsing step is
starving the generator, and no rubric change will fix it.

## The consequence for the artifact, not just the score

The evaluation must not punish an artifact for *saying* that something is
uncertain. An artifact that marks a claim as not established by the record is
doing the right thing, and a rubric that reads hedging as weak writing teaches
the pipeline to state everything flatly — which is the failure this whole
subject exists to prevent
([inference-must-look-like-inference](../../_laws.md#inference-must-look-like-inference)).
Score an appropriately marked uncertainty as neutral at worst, and score an
unmarked inference stated as fact as a specificity-and-labelling defect. The
grammar for expressing uncertainty — what phrasing is permitted, what verdicts
are off-taxonomy, when to refuse — belongs to the neighbouring labelling and
refusal practice; this technique only guarantees the evaluation does not fight
it.

Where an unverifiable claim would work against the candidate if a reader took it
as established, the reader-facing rule is stricter than the scoring rule: it
does not go in front of the recruiter unmarked
([uncertainty-resolves-toward-the-candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).

## Decision rules

- **When a claim is neither carried nor denied by the excerpt, label it
  unverifiable and move on.** Do not let the judge reason about plausibility;
  plausibility is where the judge's own priors leak into the score.
- **When a contradiction is claimed without a quote, treat the row as
  unscored** and re-run it. Unquoted contradictions are the most common judge
  error in this dimension.
- **When the unverifiable count rises after a prompt change, read it as an
  effect of the change**, not as noise. Prompts that ask for richer narrative
  reliably increase reach beyond evidence.
- **When two models tie on grounding, break the tie on unverifiable count in
  favour of the lower.** Same measured honesty, less unaudited surface.
- **When a claim is unverifiable *and* adverse to the candidate, escalate it out
  of the graded scale.** An unsupported negative reaching a recruiter is a
  different class of harm from an unsupported positive, and averaging them
  inside one dimension conceals it.
- **When the excerpt is empty or degraded, no grounding score may be
  computed at all.** Everything is unverifiable by construction, and a
  well-formed artifact built on nothing will otherwise score respectably.

## When not to use it

Do not apply the neutrality rule to fields that are, by contract, extractions
from the record — a parsed employment date, a stated certification, a supplied
compensation band. There, absent from the record means it must not appear, and
an unsupported value is a defect no matter how plausible.

Do not use it to excuse a model that reaches beyond evidence habitually. The
rule says unverifiable is not a lie; it does not say it is free. That is what
the count is for.
