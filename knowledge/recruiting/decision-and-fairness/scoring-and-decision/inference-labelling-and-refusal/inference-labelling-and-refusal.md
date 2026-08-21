---
layer: golden-path
type: golden-path
subject: inference-labelling-and-refusal
status: forged
use_when: [a model produces a statement about a person, designing a prompt that reads candidate evidence, deciding how a machine verdict renders to a recruiter, a model run degrades or falls back]
techniques:
  - enumerate-the-evidence-budget
  - forbidden-inference-rules-in-the-prompt
  - could-not-determine-is-not-no-concern
  - self-reported-confidence-is-not-a-measurement
  - render-off-taxonomy-verdicts-raw
  - declare-degraded-provenance-never-launder-it
---

# Inference labelling and refusal

Every automated hiring system eventually puts a sentence about a human being on a
screen, and a person who has thirty seconds and forty candidates reads it. That
sentence was produced by a machine that pattern-matched over a partial record. The
recruiter will act on it as if it were a finding. The entire distance between those
two facts is this subject.

Inference labelling and refusal is the discipline of making a model's output
*legible as what it is*: which evidence it stood on, which conclusions it was
forbidden to reach, what its silence means, how much weight its own hedging
deserves, and whether the run that produced it was the real one or a fallback. It
is the cross-cutting epistemics of a hiring system — every other subject that
reads a document, watches a work profile, scores a fit, or writes a rejection line
inherits its rules from here.

The naive reading is that this is a copywriting problem: prefix the output with
"AI-generated" and you are done. That disclaimer is worth almost nothing. It tells
the reader the *producer* was a machine; it says nothing about the *epistemic
status of the specific claim*, which is the only thing that changes what they
should do next. A labelled guess still reads as a finding if it is rendered in the
grammar of findings.

## The four questions every machine statement about a person must answer

A statement is properly labelled when a reader can answer all four without asking
anyone:

1. **What did you look at?** Not "the candidate's profile" — the enumerated,
   bounded list of inputs that were actually placed in front of the model. A reader
   who believes more was inspected than was inspected will over-trust every
   sentence that follows.
2. **What were you not allowed to conclude?** The refusals are part of the output's
   meaning. A review that could not assess a thing must be distinguishable from a
   review that assessed it and found it fine.
3. **What does your silence mean?** Absence has at least three readings — *checked
   and clear*, *could not determine*, *never in scope* — and collapsing them is the
   most common and most consequential failure in the domain.
4. **How was this produced, and was it the real thing?** A degraded run, a
   deterministic fallback, a cached verdict from a stale rubric: each is a different
   grade of claim and each must carry its grade forward.

A system that answers all four can be wrong without misleading. A system that
answers none is not wrong occasionally — it is structurally misleading even when
its content is accurate, because the reader has no way to price it.

## Guess and measurement are different grammars

The load-bearing distinction is not true versus false. It is *measured* versus
*inferred*. A measured quantity has an outcome behind it: a stage transition that
happened, a work sample that was scored against a rubric, a proportion computed
over a real cohort with a real denominator. An inferred quantity has a model's
pattern-match behind it and nothing else.

The two must never share a visual or linguistic grammar. Inferred quantities do
not get the tone bands, the meters, or the declarative verb forms reserved for
measurement; they get hedged verbs, an explicit producer, and a visible basis —
see [inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)
and [a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis).

The sharpest corollary, and the one teams resist hardest: **a model's own
confidence number is not a measurement.** It is a token the model emitted about
itself. No outcome, no holdout, no base rate stands behind it. Rendering it in the
same band grammar as a validated score does not communicate calibration — it
manufactures the appearance of calibration out of nothing. That is
[self-reported-confidence-is-not-a-measurement](./techniques/self-reported-confidence-is-not-a-measurement.md),
and it is the technique most likely to be argued with and most costly to lose.

## Refusal is a design surface, not a safety afterthought

Refusal in this domain is not content moderation. It is the enumeration, in
advance, of the specific conclusions that this particular evidence cannot support
about this particular person — and the enforcement of that list in the instructions
that generate the text, not only in a filter afterwards.

The categories that recur:

- **Inferences beyond the evidence budget** — if only titles and metadata were
  supplied, the output may not characterise craft, architecture or quality.
- **Inferences about protected or proxy attributes** — age, health, family status,
  national origin and their close proxies. The refusal is not "do not be biased";
  it is "do not conclude, mention, or reason from these", as an enumerated list.
  Where a screen is deliberately blind it extends to *reconstructing* what was
  redacted from surrounding context.
- **Inferences from the shape of the artefact** — polish, formatting, fluency,
  photo quality. Each predicts access to professional help far better than it
  predicts job performance.
- **Coverage claims** — "no concerns found" is a claim about the world; the model
  is entitled only to a claim about its inputs.
- **Instruction-following from the evidence itself** — a candidate's document is
  data, never instruction. The general defence belongs to the engineering
  neighbours; what belongs here is the hiring consequence: a system that obeys a
  document has let one candidate rewrite the rubric for everyone.

Refusals stated in the instructions *and* enforced structurally survive; refusals
stated only in the instructions are style suggestions with a good success rate.
The instruction shapes what the model generates; the structure decides what the
reader is allowed to see.

## Absence has three states, and the middle one is the whole subject

The single failure this subject exists to prevent, stated plainly: a system that
looked at ten things, found nothing wrong among those ten, and printed **"no
concerns"** — full stop, unqualified, unscoped. The reader now believes a general
claim that nobody made. Then a fixed checklist quietly becomes the definition of
"everything", and the day someone adds an eleventh item, every historical "no
concerns" silently changes meaning.

The three states, kept distinct end to end — in the model's output shape, in
storage, and on the screen:

| State | Means | Renders as |
| --- | --- | --- |
| **Clear** | in scope, evidence sufficient, nothing adverse found | an affirmative finding, scoped to what was checked |
| **Could not determine** | in scope, evidence insufficient or unreadable | an explicit unknown that invites a human step |
| **Out of scope** | never assessed; the evidence budget excluded it | named as unassessed, never as clear |

Collapsing *could not determine* into *clear* flatters the candidate and hides
risk. Collapsing it into *adverse* penalises a person for the system's blindness.
Both are wrong, and the standard picks neither: it keeps the third state and makes
it visible. This is
[absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
in its most operational form, and it is the reason
[could-not-determine-is-not-no-concern](./techniques/could-not-determine-is-not-no-concern.md)
is a technique rather than a sentence in a style guide.

## A closed vocabulary, and what to do when the model leaves it

Verdicts about people should come from a small, closed set, because a closed set is
the only thing a downstream rule, a filter, a fairness metric, or a translation
layer can be written against. But models drift: a set of five verdicts will
eventually be answered with a sixth.

The instinct is to coerce the stray value to a safe default everywhere. That is
right at *logic* boundaries — a decision must never be taken on a token nobody
defined, and the safe default is the one that does not harm the candidate. It is
wrong at the *display* boundary. Coercing everywhere means the drift is silently
absorbed; nobody ever learns that the model has started answering in a vocabulary
the system does not know, and the taxonomy quietly stops describing reality.

The rule: **coerce at logic boundaries, render raw at display boundaries.** The
unknown token is shown to a human, visibly marked as unrecognised, so that drift
surfaces to the one party who can decide whether the taxonomy should grow. A
system that hides its own drift is choosing a slow, invisible failure over a fast,
visible one. See
[render-off-taxonomy-verdicts-raw](./techniques/render-off-taxonomy-verdicts-raw.md).

## Degradation is declared, never laundered

Any system with a model in it will sometimes run without one: an outage, a quota,
a timeout, a response that failed validation, a grounding post-check that stripped
a claim the evidence did not support. What happens next decides whether the system
is honest.

The candidate's process must continue — that is
[a-candidates-process-never-stalls-on-your-constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
But continuing on a deterministic fallback and *presenting the result in the same
clothes as the real thing* is the laundering failure. Two rules follow, and they
are not optional:

- **Tag every verdict with its source at the moment it is produced** — authoritative
  model output, repaired output, deterministic fallback, human override. The tag
  travels with the verdict for its whole life.
- **Only an authoritative verdict may be frozen.** A degraded result must never be
  cached, memoised, or promoted into the record as though it were the real one; a
  cached fallback is a temporary outage converted into a permanent, invisible lie
  about a person.

The same rule governs partial degradation. When a grounding check removes an
unsupported claim, the surviving answer is not the model's answer any more — it is
a coerced one, and it must say so rather than pose as model output.

## Where this subject stops

This is the cross-cutting layer; three siblings own the specific surfaces and this
document deliberately does not duplicate them.

- **Behavioural readings of a career** — the detectors that turn a document into
  soft signals, and the discipline that a document yields *hypotheses carrying a
  suggested probe*, never verdicts — belong to the soft-signal subject. This
  subject supplies the labelling and refusal rules those hypotheses are dressed in.
- **Reading a public work profile** — what may be fetched and at what depth —
  belongs to the public-work-evidence subject. This subject supplies the obligation
  to enumerate the budget; that subject decides what the budget contains.
- **Score display grammar** — bands, meters, ordering, the recruiter-facing
  presentation of a numeric fit — belongs to the score-presentation subject. This
  subject separates inferred from measured; that subject shapes the measured half.

Two neighbouring domains also matter. Provider routing, telemetry, cost and caching
mechanics are general engineering practice and are not re-derived here — only the
hiring consequences of a degraded or cached run are. Prompt-injection defence as a
security discipline likewise sits with the engineering neighbours; what stays here
is the hiring judgment that a candidate's own document must never alter how they,
or anyone else, are assessed.

## Failure modes this standard exists to prevent

- **The unscoped all-clear** — a bounded check rendered as a general absence of
  concern, silently redefined whenever the checklist changes.
- **Confidence theatre** — a model's self-report shown in measurement grammar.
- **Implied depth** — output that reads as though the substance was inspected when
  only labels and metadata were supplied.
- **The laundered fallback** — a deterministic or repaired result presented, and
  worse cached, as an authoritative verdict.
- **Silent taxonomy drift** — off-vocabulary verdicts coerced everywhere, so the
  system's model of the world diverges from the model's behaviour, uninformed.
- **The doubled finding** — overlapping labels fanning one observation into
  several, so a single gap reads as a pattern of gaps.
- **Reasoning from the artefact** — polish and fluency read as competence, which
  is a proxy for access to help.

## The techniques

- [enumerate-the-evidence-budget](./techniques/enumerate-the-evidence-budget.md) —
  declare, from the same source that builds the request, exactly what was looked
  at, so the documented scope cannot drift from the real one.
- [forbidden-inference-rules-in-the-prompt](./techniques/forbidden-inference-rules-in-the-prompt.md)
  — the enumerated conclusions this evidence may not support, written into the
  instructions and mirrored structurally.
- [could-not-determine-is-not-no-concern](./techniques/could-not-determine-is-not-no-concern.md)
  — three-state absence, kept distinct from output shape through to screen.
- [self-reported-confidence-is-not-a-measurement](./techniques/self-reported-confidence-is-not-a-measurement.md)
  — what a model's confidence scalar is evidence about, and the grammar it forfeits.
- [render-off-taxonomy-verdicts-raw](./techniques/render-off-taxonomy-verdicts-raw.md)
  — coerce at logic boundaries, render raw at display boundaries, so drift surfaces.
- [declare-degraded-provenance-never-launder-it](./techniques/declare-degraded-provenance-never-launder-it.md)
  — source-tagged verdicts, and the rule that only the authoritative grade may be
  frozen.
</content>
</invoke>
