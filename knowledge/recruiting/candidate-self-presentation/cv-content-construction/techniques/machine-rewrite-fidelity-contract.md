---
layer: technique
type: technique
subject: cv-content-construction
technique: machine-rewrite-fidelity-contract
status: forged
laws: [say-only-what-the-record-holds, every-decision-names-its-actor, a-verdict-is-bound-to-what-it-judged]
shared_with: []
use_when: [a language model rewrites, polishes or tailors CV text, designing the validation step after a model CV rewrite, deciding what an automated CV improvement may apply without the owner]
---

# Machine rewrite fidelity contract

A language model asked to improve a CV improves it the way it improves any text: it
smooths, generalises, strengthens and completes. Three of those four are fabrication when
the text is a record of someone's working life. A controlled evaluation of multi-stage
model pipelines over synthetic CVs (180 runs, 2026) found unsupported claims in 97% of
unguarded rewrites - inflated roles, upgraded metrics, invented credentials, and skills
lifted from the job advertisement the rewrite was tailoring toward. Prompt guardrails
cut the density by most but still left fabrications in half the outputs; only a human
checkpoint removed the invented identities, and even it left item-level fabrications
in most outputs. The lesson is architectural:
**an instruction not to invent is a soft control; the contract is enforced after the
model, against the source, and closed by the owner.**

## The contract

1. **The unit is a line-level proposal, not a new document.** The model returns pairs:
   the exact source span it rewrites, the proposed replacement, and a one-line reason. A
   whole regenerated document is not accepted as output, because a document cannot be
   verified cheaply and a pair can.
2. **The source span must exist verbatim.** A proposal whose "before" is not in the
   source is dropped. (This checks the model is rewriting the candidate's words and not
   its own.)
3. **The replacement must not introduce facts.** Checked deterministically against the
   source span *and the rest of the record*:
   - no number, percentage, currency amount or date that does not occur in the record;
   - no proper noun, product, tool, employer, institution or certification name that does
     not occur in the record;
   - no title or seniority word that raises the held title;
   - no skill term drawn from the target posting that the record does not contain.
   A proposal that fails is dropped or downgraded to a question for the owner ("this
   suggestion needs a number - do you have one?"). It is never applied.
4. **The owner accepts each change.** Proposals render as a diff; nothing reaches the
   document until the person whose name is on it accepts that line. Acceptance is
   recorded with the proposal and the model version that produced it, because [every
   decision names its actor](../../../_laws.md#every-decision-names-its-actor) - and on a
   CV, the actor who answers for a line in an interview is the owner.
5. **Accepted changes flow into the one document.** A polished text that lives beside,
   rather than inside, the document that is printed and sent is a second source of truth;
   the owner accepts improvements that never reach the page, or the page drifts from what
   they approved.
6. **A proposal is bound to the text it judged.** When the source line changes, pending
   proposals against it are invalidated, not re-anchored by fuzzy match; [a verdict is
   bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged).

## Voice and homogenisation

Generated prose converges on the same verbs, adjectives and summary shapes, and
experiments on assisted writing find individual outputs rated better and the set more
alike. On a CV, sameness costs the candidate the one thing the document is for. The
rewrite brief therefore:

- keeps the owner's specific nouns, domain terms and numbers verbatim, and fixes only
  their spelling and casing;
- bans the self-descriptor list ("results-driven", "passionate", "dynamic",
  "spearheaded", "leveraged", "synergy") in outputs, checked deterministically;
- prefers the smallest edit that fixes the problem - an error, an unclear sentence, a
  buried outcome - over a rewrite in the model's register;
- rejects a replacement that is less specific than the source (a named system becoming
  "key systems"), measurable as fewer proper nouns and numbers than the span it replaces.

## Decision rules

- **When the model returns a full document, diff it against the source and treat it as a
  set of proposals** - or reject it; never adopt it wholesale.
- **When a proposal needs a fact, emit the question, not the sentence.** The owner's
  answer becomes a fact in the record, stamped as owner-supplied; the next rewrite may
  use it.
- **When the same model family that rewrote the CV also scores it, disclose that and
  prefer an independent scorer.** Screening models measurably prefer their own family's
  text; a product that both writes and scores is a party to that bias.
- **When no model is available, the deterministic half still runs**: spelling, casing,
  cliché removal, outcome-missing flags and ordering are rule work and never wait on a
  model.
- **Never claim the result will beat a screening system or pass as human-written.**
  The first rests on a myth about automated rejection; the second is unmeasurable, and
  detectors misfire worst on the non-native writers such tools help most.

## When not to use this

Pure surface correction - spelling, grammar, casing - by a non-generative checker is the
one form of automated help with a measured hiring benefit and no content risk; it can be
applied with a change list rather than line-by-line acceptance. The full contract applies
the moment a model may choose words the owner did not write.
