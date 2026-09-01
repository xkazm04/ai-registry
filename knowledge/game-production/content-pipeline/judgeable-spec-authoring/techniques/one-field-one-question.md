---
layer: technique
type: technique
subject: judgeable-spec-authoring
technique: one-field-one-question
status: forged
laws: [one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a spec keeps contradicting itself about one value, propagating a corrected value reintroduces the contradiction, two numbers named the same thing disagree, several sections of an artifact say incompatible things]
---

# One field, one question

The named concern: **an artifact that keeps contradicting itself about a value because
the value is answering two different questions under one name.**

This is the internal shape of a large share of self-contradiction findings, and it is
worth naming separately because the obvious repair — pick the correct value, propagate it
— is wrong here and silently reintroduces the defect a revision later.

## The distinguishing test

Two contradiction shapes look identical from inside the artifact:

- **A stale copy.** One place was updated and another was not. Propagating the correct
  value fixes it permanently.
- **A conflated field.** Two genuinely different quantities share a name, so *both*
  values are correct — each for its own question. Propagating either one makes some
  sections right and others wrong, forever.

The test: **pick the "wrong" value and ask which question it correctly answers.** If it
answers one, you have a conflation, not a stale copy. If it answers nothing, it is stale.

## The signature

Three or more sections saying incompatible things about one identifier, where each
section is locally reasonable and each has been reviewed before without objection. A
conflated field survives review precisely because every individual use of it is correct.

The worked case: a packaging spec used one identifier for both *which container ships
this asset* and *is it resident before the moment that needs it*. Three sections
disagreed. Naming the second axis dissolved all three at once — and exposed a genuine
shipping defect underneath, because assets that a boundary crossing could need anywhere
had been assigned to a location-specific container.

The same shape recurred twice more in the same catalog: a rate constant versus a clamp
constant, and a cooked size versus a resident size. **Two numbers that keep contradicting
each other are usually two different quantities.**

## The procedure

1. **Name the second axis explicitly.** Give it its own field and its own word. The
   naming is the fix; everything else follows.
2. **State a rule for each axis independently** — what determines it, who owns it, what
   consumes it.
3. **Rewrite every dependent section from the split**, not from the old field. Sections
   written against a conflated field usually each assumed one axis silently; each now has
   to say which.
4. **Recompute any derived property against every input, and let the strongest win.** A
   property derived from the most *interesting* input rather than all of them is the same
   defect in derived form: one asset was marked deferred because its interesting consumer
   was deferred, while an always-loaded consumer also held it. Write the rule down, then
   recompute every row from the rule — three rows were wrong.

## Expect a chain, not a fix

Splitting a conflated field usually reveals that the design underneath was
underspecified, and the first repair often makes a mechanism trivially true or trivially
useless. In one measured case the sequence ran: split the field → a reviewer observed the
mechanism now bought nothing at runtime → change the design to a sliding window → the
next review found the one case the window could not cover → which required an element the
manifest had never listed.

**Each fix's side effect is the next review's finding. Budget three or four passes on a
genuinely conflated field, not one.**

## Decision rules

- **When propagating a corrected value would make some sections wrong, stop — it is a
  conflation.**
- **When one identifier answers two questions, name the second axis rather than choosing
  between them.**
- **When a property is derived, compute it from every input and let the strongest
  win** — and state the rule in the artifact.
- **When a split is applied, rewrite dependents from the split**, not by search-replacing
  the old name.

## When NOT to use this

- **Do not split a field that is genuinely one quantity used in two places.** The
  duplication cure there is ownership (`quantity-ownership-and-the-bindable-row`), not a
  new axis; inventing a second field for one quantity creates the drift it was meant to
  prevent.
- **Do not split to avoid resolving a disagreement.** If two sections disagree about the
  same question, one of them is wrong and someone has to decide. A split used as a
  diplomatic device ships both errors under different names.
