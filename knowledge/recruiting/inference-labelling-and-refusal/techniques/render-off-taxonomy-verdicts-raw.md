---
layer: technique
type: technique
subject: inference-labelling-and-refusal
technique: render-off-taxonomy-verdicts-raw
status: forged
laws: [uncertainty-resolves-toward-the-candidate, meaning-does-not-live-in-a-label, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [a model answers outside a closed verdict vocabulary, deciding where to coerce an unknown value, a taxonomy stops matching reality]
---

# Render off-taxonomy verdicts raw

Verdicts about people belong to a closed vocabulary. A small fixed set — advance,
hold, reject-recommended, insufficient-evidence, or whatever the domain requires —
is the only thing that downstream rules, fairness metrics, translations and audit
queries can be written against. Free-text verdicts cannot be governed, counted, or
defended.

Closed vocabularies meet an open-ended producer. A model given five permitted
values will eventually return a sixth: a synonym, a hedge, a capitalisation
variant, a new value it invented because the case did not fit. This technique is
about what happens in that moment — and the answer is different at different
boundaries.

## The two boundaries

**Logic boundaries** are places where the value causes something: a routing rule, a
filter, a metric bucket, a permission, a state transition. Here an unrecognised
value must be coerced to a safe fallback, and the safe fallback is the one that
does not harm the candidate — hold, never advance and never reject
([uncertainty-resolves-toward-the-candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).
A decision taken on a token nobody defined is an adverse outcome produced by a
typo, and where the outcome is adverse it must park at a human gate rather than
execute
([no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated)).

**Display boundaries** are places where a human reads the value. Here the
unrecognised value is rendered **raw** — shown as it arrived, visibly marked as
unrecognised, in a neutral style that carries none of the taxonomy's semantics.

The asymmetry is the whole point. Coercing at both boundaries is the tempting,
tidy design, and it is wrong: it converts every instance of drift into a silent
"hold" that looks exactly like a legitimate hold. Nobody ever learns that the model
has begun answering in a vocabulary the system does not know. The taxonomy stops
describing reality and no signal is emitted, because the safety mechanism consumed
the evidence. A system that hides its own drift has chosen a slow invisible failure
over a fast visible one.

## Procedure

1. **Define the vocabulary once, in one place, with a declared safe fallback.**
   Every consumer resolves against that definition; no consumer keeps its own copy
   of the permitted list. Make the mapping from vocabulary to presentation
   *exhaustive by construction*, so that adding or removing a verdict breaks every
   surface that has not been updated. A taxonomy change that can ship without
   touching the display layer will ship without touching the display layer.
2. **Validate at the ingest edge, and keep the raw value.** Parse into the closed
   type for logic, and retain the original string alongside it. The raw value is
   the only evidence of what actually happened, and once discarded it cannot be
   recovered from the coerced one.
3. **Coerce at every logic boundary, always toward the candidate.** Make the
   coercion explicit and total — a default branch that cannot be forgotten — rather
   than relying on each call site to remember.
4. **Render raw at every display boundary.** Show the unknown token with a marker
   that reads as unrecognised, and never with a colour, icon or word borrowed from
   a valid verdict. The reader must be able to tell "the system does not know what
   this means" from "the system says hold".
5. **Count and surface drift.** An unrecognised verdict is an event worth
   recording. A rate that moves is the earliest available signal that a model, a
   prompt, or the world changed.
6. **Feed drift back into the taxonomy deliberately.** Recurrent off-vocabulary
   values are a proposal to extend the set — reviewed by a human, versioned, with
   old records staying bound to the vocabulary version they were produced under.
7. **Never derive meaning from the string itself.** Do not fuzzy-match an unknown
   verdict onto a known one, do not lowercase-and-hope, do not treat a substring as
   the value. Meaning lives in the declared vocabulary, not in the label
   ([meaning-does-not-live-in-a-label](../../_laws.md#meaning-does-not-live-in-a-label)).

## Decision rules

- **When the unknown value would drive an irreversible action, stop and route to a
  human.** Coercion is for continuing safely, not for deciding.
- **When a value differs only in case or whitespace, normalise — that is parsing,
  not guessing.** Anything requiring semantic judgment is drift and must surface.
- **When a display is machine-consumed downstream (an export, a report someone will
  aggregate), treat it as a logic boundary.** "Raw" is for human eyes; a raw value
  in a spreadsheet becomes a category in someone's count.
- **When drift is high, fix the producer, not the taxonomy.** A vocabulary that
  grows to absorb every stray answer is no longer closed and has lost the property
  that justified it.
- **When the surface is candidate-facing, do not render raw.** A candidate must
  never be shown an unrecognised internal token about themselves; show the honest
  in-progress state and surface the raw value on the internal review surface
  instead.

## When not to use it

- **Where there is no human at the display boundary.** A fully automated path has no
  reader to surface drift to; there, coerce and log, and make the log something a
  person actually reviews.
- **Where the raw value could contain content that should not be displayed.** A
  model may return a sentence rather than a token, and that sentence may carry
  material the surface refuses — the redacted identity of a blind screen, a
  protected attribute, a prompt-injection payload from the candidate's own
  document. Render raw values as inert, length-bounded, escaped text, and where that
  is not sufficient, replace the body with a marker that drift occurred and keep the
  content in the audit record only.
- **Where the vocabulary is genuinely open by design** — free-form recruiter notes,
  for example. This technique protects closed sets; applying its ceremony to an
  open field adds noise without adding governance.
</content>
