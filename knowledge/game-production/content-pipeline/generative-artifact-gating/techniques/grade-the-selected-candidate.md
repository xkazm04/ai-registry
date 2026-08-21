---
layer: technique
type: technique
subject: generative-artifact-gating
technique: grade-the-selected-candidate
status: forged
laws: [a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass, no-gate-self-certifies]
use_when: [a check validates a selection index instead of the chosen asset, wiring the grading half of a generative step, a verdict must name what it judged]
---

# Grade the selected candidate

## The concern

A selection is a pointer. Validating a pointer — it is present, it is a non-negative
number, it parses — tells you nothing about what it points at, and a gate that stops there
grades the act of choosing rather than the thing chosen. This technique is the mechanical
repair: **dereference, then judge the object, and bind the verdict to it.**

## The procedure

1. **Read the selection.** If absent, defer as not measured. Do not treat a default or a
   sentinel as a selection; a sentinel that is a valid-looking value is the trap this whole
   technique exists to close.
2. **Resolve it against the kept set.** Look the pointer up in the generation history. If
   it resolves to nothing — past the end, or naming an entry that was discarded — **fail**.
   That is corruption of the record, not a missing asset, and it is more urgent than one.
3. **Cross-check the back-reference.** The resolved candidate carries its own idea of which
   position it occupies. If the candidate's position disagrees with the field that selected
   it, **fail**. Disagreement means something reordered or rewrote the history without
   updating the pointer, and every verdict already bound to this artifact is suspect.
4. **Classify the candidate's origin.** Generated, or deterministic stand-in. A stand-in
   defers; a generated asset proceeds to grading.
5. **Grade the resolved object** against the criteria for its class, at the lowest rung its
   evidence actually supports.
6. **Name the object in the verdict.** The verdict text carries the identity of the
   candidate it judged, so a reader can go and look at the same thing. A verdict that names
   only the step is not re-checkable.

## Decision rules

- **When the pointer resolves and the back-reference agrees, grade the object; when either
  fails, fail the step** — because an internally inconsistent artifact cannot support any
  verdict at all, and reporting a quality score over it would be a lie with a number
  attached.
- **When the selection is absent, defer; when it is present but resolves to a stand-in,
  defer with a different reason.** These are different remedies — make a selection versus
  run a generator — and a single deferral message that covers both sends people to the
  wrong work.
- **Never let the producer's own success flag substitute for resolution.** A generator
  reporting that it completed is an input, recorded and labelled as self-reported; the
  verdict comes from a separate reader that resolves the pointer and looks at the object.
- **Bind the verdict to a fingerprint of what was graded.** When the candidate changes, the
  verdict becomes evidence about the past. Report it as stale rather than deleting it —
  a visible gap is survivable, and "unjudged since the last change" must never read as
  "judged and passed".

## Choosing the pass tier

A resolved generated asset should pass at the **lowest** tier its evidence supports, not
the highest one that is arguable. Resolution proves that a generator ran and that the
record is coherent; it does not prove the asset is good. Passing a resolved candidate at a
low tier, with the tier named, is a truthful statement that composes correctly with a
later, stronger judgment. Passing it high because the machinery worked is how a gate that
was built to catch missing work ends up certifying quality it never examined.

## When not to use it

- **Where selection is not the shape of the step.** Some generative steps produce exactly
  one output with no candidate set; there is no pointer to dereference and the technique
  collapses into grading the output directly. Do not invent a one-element candidate list to
  make the shape fit.
- **Where the candidate cannot be fetched at gate time.** If the history is remote and
  resolution would cost a paid call, do not skip the step — move it. Resolve at write time
  and store the resolved identity alongside the pointer, so the gate reads a fact rather
  than a reference it cannot follow.
- **As a quality rubric.** This is an integrity check on a selection. What makes the asset
  good, and how it is scored against work that shipped, belongs to the rubric that owns
  that class of deliverable.
