---
layer: technique
type: technique
subject: companion-runtime
technique: action-catalog-single-source
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation, one-validation-door]
shared_with: []
use_when: [a companion is gaining the ability to act and not only talk, the model emits an action kind nothing executes, a model-composed surface has no way back to a good state]
---

# One source for the action catalog

The moment a companion can do something, it has a vocabulary of things it may
do — and that vocabulary is a closed set with five natural consumers. The prompt
that teaches the model what it may emit. The validator that checks what came
back. The executor that performs it. The capability document a person reads to
learn what the companion can do. The surface that renders the result. Written
independently, they drift; the only question is which pair diverges first.

## The failure is asymmetry, and it is never a crash

Every symptom of a duplicated catalog is a mismatch between two of the five, and
each looks like a different bug to whoever meets it:

- The prompt teaches a kind the validator rejects. The model is blamed for
  hallucinating a capability it was taught by the system's own instructions.
- The validator accepts a kind no executor performs. The action validates,
  persists, and silently does nothing.
- The executor requires a field the prompt never mentions, so the field is
  absent, so the executor fails on input the validator called valid.
- The document lists kinds retired two releases ago, so the most authoritative
  description of the companion's abilities is the least accurate one.
- One surface renders a kind and another does not, so the same action looks
  broken depending on where the person is standing.

None of these produces an error at the point of divergence — the divergence is
between two files that never call each other. This is the
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
law's most expensive costume, because the vocabulary here is what a fallible
model is being taught, and a teaching error is indistinguishable from a model
error at the surface.

## One declaration, four derivations

The catalog is a single table of kinds, each row carrying what all five consumers
need: the kind's identifier, its payload shape, whether it reads or mutates,
what approval it requires, a one-line description in the register a person reads,
and the executor it binds to. Everything else is generated from it or checked
against it:

- **The teaching text** is rendered from the table — the identifiers, their
  payload shapes and their descriptions — so a kind cannot exist in the prompt
  without existing in the catalog, and a new kind reaches the prompt by being
  added once.
- **The validator** iterates the table rather than restating it. Unknown kind:
  rejected by construction. Known kind: its payload checked against the shape the
  same row declares.
- **The executor binding** is exhaustive over the table. A kind with no executor
  must be a compile-time or startup-time failure, not a runtime shrug — this is
  the single highest-value property in the technique, because it converts the
  most common asymmetry into an error nobody can ship past.
- **The capability document** is generated. A hand-written one is a copy, and it
  is the copy nobody updates because it has no tests.

A generated artifact states how it is regenerated, and the check that it is
current runs where changes are gated
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Generation without that check is a copy with extra steps.

## Validation is symmetric or it is theatre

Two directions must agree, and systems routinely implement one. **Nothing enters
the system that the catalog does not describe** — the validator is the one door
between model output and any effect
([one-validation-door](../../../../_laws.md#one-validation-door)). And **nothing
the catalog describes is unimplemented** — every kind reachable by the prompt has
an executor, and that is asserted mechanically rather than believed.

Where a payload references anything that exists in the store — a target, a
destination, a piece of content — the reference is resolved against the store
before the action is bound, not after it is approved. A model-supplied identifier
is a guess until something looks it up, and an unresolvable one drops the
proposal rather than executing against whatever the identifier happens to hit.

## Reads may proceed; mutations are proposed

The catalog carries the read/mutate distinction per kind because that is where
the distinction is actually known. A read the companion performs to answer a
question can proceed within whatever autonomy it has been granted. A mutation —
changing settings, sending something, deleting, spending — is a **proposal**: the
runtime binds it to a validated envelope and hands that envelope to the approval
gate, which owns the disclosure, the decision, the record and the resumption.
The property this technique guarantees for that gate is that the envelope it
displays and the envelope the executor runs are **the same object**, not two
renderings of one intent — otherwise the disclosure a person approved and the
action performed are related only by convention.

## Anything a model can compose, a person can reset

The catalog's most consequential extension is the class of action that lets a
model arrange a surface — a layout, a set of panels, a view assembled to suit a
moment. It is a genuinely good capability and it fails in a specific way: the
model produces a state that is valid, persisted, and worse than what was there,
and the person has no way back. They did not choose the previous arrangement and
cannot describe it, so "just ask it to change back" is not a path.

Two rules, and they are cheap next to the feature they protect. **A reset to a
known-good default is one action, always reachable, and never itself
model-composed.** And **the composition is a proposal like any other mutation**
until the product has evidence that the model's arrangements are reliably wanted.
A generative surface with no floor under it is the one place where an action
catalog's mistakes are both invisible to validation and permanent to the person
living with them.

## When not to do this

A companion with two or three actions that will not grow does not need a
generated catalog; a single table read by the validator and the executor is
already the whole technique, and the prompt can name them by hand. The cost
arrives with the fourth kind, or with the first kind added by somebody who did
not write the first three — which is the same moment, one release later.
