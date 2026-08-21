---
layer: technique
type: technique
subject: hypothesis-not-verdict-soft-signals
technique: claim-versus-evidence-overclaim-detection
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence, inference-must-look-like-inference]
shared_with: []
use_when: [a document lists many capabilities and describes few outcomes, designing a deterministic detector over parsed career data, choosing which capability a work sample should test]
---

# Claim-versus-evidence overclaim detection

The most informative deterministic reading available from a career document is not
what it claims — it is the **ratio between what it claims and what it evidences**.
A document that asserts thirty capabilities and describes four outcomes has a
different shape from one that asserts six and describes eleven, and that shape is
countable, reproducible, and free of any judgment about the person.

It is also the signal most easily corrupted into an accusation. "Overclaim" names
a property of a document, not a character trait, and the moment it is rendered as
dishonesty it has crossed the line this subject exists to hold. Documents are
written to conventions: some industries list every tool ever touched, some
cultures consider quantifying your own results boastful, and a person coached to
"use keywords" is following advice, not lying.

## The three deterministic readings

Compute all three from parsed career data, with no model in the loop:

- **Claim density.** Distinct capabilities asserted, against described roles or
  described outcomes. High density is *range or inflation*, and the document alone
  cannot say which.
- **Evidence attachment.** For each asserted capability, whether any described
  role, outcome or artifact mentions it at all. A capability that appears only in
  a list and never in a description is *unevidenced within this document* — which
  is a statement about the document and never about the skill.
- **Concreteness of stated outcomes.** Whether described achievements carry any
  quantity, scale, scope or artifact. "Improved reliability" and "cut failed jobs
  from 12% to 3% across four teams" are different shapes. Vagueness is a
  hypothesis about presentation, not about delivery.

Each is arithmetic over structured fields. That matters: it can be pinned by a
test, reproduced years later from the same input, and explained to a candidate in
one sentence — none of which is true of a model's impression that someone "seems
to exaggerate".

## Procedure

1. **Count over normalised capabilities, not raw strings.** Three spellings of one
   capability inflate density and invent an overclaim that is not there;
   normalisation belongs to the adjacency sibling and this detector consumes it.
2. **Attach the sample to every ratio.** A density computed over two roles is not a
   finding, it is noise —
   [a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)
   sets a floor below which the detector emits nothing rather than emitting weakly.
3. **Treat unparsed as unknown, never as absent.** A document whose descriptions
   failed to parse has no evidence attachment *observable*, which is a different
   state from having none. Defaulting the unreadable to "unevidenced" manufactures
   overclaims out of formatting
   ([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
4. **Scope the finding to the role's own requirements.** An unevidenced capability
   nobody asked for is trivia; an unevidenced capability that is a core
   requirement is the one question worth an exercise. Rank by relevance, then cut.
5. **Name the specific capabilities.** "Overclaiming" is unusable; "three of the
   four core capabilities are listed but not described in any role" is a probe
   waiting to be asked, and it tells a work-sample chooser exactly what to test.
6. **Emit at most one overclaim signal per document.** The detector can find
   fifteen unevidenced items; fifteen rows is a dossier, one row naming the top
   two or three is a checklist item.
7. **Pin the thresholds in tests, and record them with the signal.** A ratio
   without its threshold cannot be argued with, and a threshold that moves silently
   re-means every historical signal.

## Decision rules

- **When density is high and attachment is also high, emit the strength, not the
  risk.** Many claims, all evidenced, is range — and the detector that can only
  fire adverse over this property is the one that turns breadth into suspicion.
- **When concreteness is low across the entire document, prefer a work sample over
  a conversation.** No amount of asking resolves "did they actually deliver";
  twenty minutes of doing resolves it, and this is the clearest case in the subject
  where a hypothesis maps to a targeted test.
- **When an unevidenced capability is peripheral to the role, drop it silently.**
  Every dropped triviality buys attention for the one that matters.
- **When the document is short by convention — a one-page format, an
  early-career record, a translated summary — suppress the detector or widen the
  threshold.** Format length is not evidence about a person, and firing on it
  penalises exactly the candidates with the least coaching.
- **When the finding would render as a claim about honesty, rewrite or delete.**
  "Listed but not described in any role" is the licensed vocabulary. "Exaggerates",
  "inflated", "padding" and "keyword stuffing" are not, at any confidence.

## When not to use it

- **As an authenticity check.** Whether the claims are *true* — fabricated
  employers, impossible overlaps, generated text — belongs to the
  authenticity-screening sibling. This detector assumes the document is honest and
  reads only its balance.
- **On documents from a pipeline that rewrites them.** Where a system has parsed,
  summarised or reformatted the original, density and concreteness measure the
  transformation as much as the person. Read the original or do not read it at all.
- **On early-career records.** A student or first-role candidate has few outcomes
  to describe by definition; the ratio is structurally adverse and says nothing.
  Potential assessment for that population is a different subject's job.
- **Where the output would feed a score.** Overclaim signals route to a probe or an
  exercise. A density ratio subtracted from a fit score is a verdict computed from
  a formatting habit
  ([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)).
