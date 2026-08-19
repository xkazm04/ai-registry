---
layer: technique
type: technique
subject: generated-output-grading
technique: unconditional-fail-criteria
status: forged
laws: [checkability-routes-the-pixel, unmeasured-is-not-pass]
shared_with: []
use_when: [designing a rubric for generated images, deciding why a high-scoring output is still unusable, choosing the first field of a grading schema]
---

# Unconditional fail criteria

Most rubric dimensions trade off: a slightly cluttered composition with perfect
adherence can beat a sparse one that missed the brief. An unconditional fail
criterion is the property that refuses to trade. If it is present, the output
is unusable at any level of quality elsewhere — no score on the remaining
dimensions can buy it back. The technique is to identify these properties
*before* grading, promote them out of the scored rubric into a veto tier, and
make them the first thing every grader checks.

## What earns veto status

A criterion is unconditional only when it follows from the **pipeline
contract**, not from taste. The canonical example in factual visual work:
generated imagery may carry no letters, numbers, or glyph-like marks, because
all captions and figures are drawn deterministically as a separate layer —
that is where checkable content must live. A render that hallucinates its own
text does not merely look worse; it collides with the layer that carries the
actual facts, and no amount of compositional beauty makes the collision
compositable. The test for veto status:

- **Downstream incompatibility.** The property breaks a stage the output must
  pass through (compositing, legal review, platform policy), rather than
  merely lowering appeal. "Would we ship this if everything else were
  perfect?" — if the answer is no, it is a veto; if "maybe", it is a scored
  dimension.
- **Character evidence.** Repeated violation predicts unfitness beyond the
  single output. A generator that cannot keep glyphs out of an image cannot be
  trusted to hold a reserved layer clean anywhere else — the violation is
  diagnostic of the generator, not just the render.
- **Binary detectability.** The property must be checkable as present/absent
  by any grader. A veto that requires judgement to detect will be applied
  inconsistently, and an inconsistent veto is worse than a scored dimension
  because its consequences are absolute.

Keep the veto list short — typically one to three items. Every criterion added
to it removes an output from consideration with no appeal; a long veto list is
usually a scored rubric wearing the wrong clothes.

## Procedure

1. Derive the veto list from the pipeline contract and write it into the
   rubric as its own tier, above the countable checks, explicitly labeled
   "unconditional fail".
2. Make it the **first field** of any machine-grading schema, phrased as a
   plain boolean with a generous definition of violation ("any letters,
   numbers or glyph-like marks anywhere" — not "prominent text"). Erring wide
   is correct: a borderline veto hit costs one render; a missed one costs a
   composite.
3. Short-circuit on veto in the *gate*, but still record the full grade. The
   remaining dimensions are worthless for shipping this output and valuable
   for diagnosing the generator — a veto-failed render with perfect adherence
   tells a different story than one that failed everything.
4. Report veto rates as their own aggregate, per generator and per brief.
   Because the veto defines usability, the economic bottom line — cost per
   usable output — is computed against it, and a generator's veto rate can
   invert an apparent price advantage on its own.

## Decision rules

- When an output violates a veto criterion, it is unusable now, **but the
  verdict about the generator needs more than one sample**: veto-class
  violations are frequently per-generation risks, not per-model constants.
  The same prompt on the same model can violate on one run and not the next.
  Rate, not incident, is the generator-level signal — which is also the
  argument for grading every output rather than sampling.
- When a veto violation concentrates by *brief* rather than by generator or
  style, the brief is inviting it — some subjects are magnets for the
  violation (asking for "an open book" invites writing in it). Rewrite the
  brief to starve the magnet; do not burn renders hoping.
- When a grader cannot reliably detect the veto property, fix detection before
  anything else. An unenforced veto silently converts to "pass", and a gate
  may never report pass for something it did not check.

## When not to use it

Do not promote aesthetic preferences to veto status — "too much gradient" is a
scored dimension however strongly the art direction feels about it, because it
is a matter of degree and degree is what scores are for. And do not use vetoes
where an automated *repair* exists and is cheaper than a re-render: a property
that a deterministic post-process can remove is a fixup step, not a fail.
