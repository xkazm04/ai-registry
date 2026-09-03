---
layer: technique
type: technique
subject: tiling-texture-acceptance
technique: derive-only-what-the-source-encodes
status: forged
laws: [unmeasured-is-not-a-pass, refuse-rather-than-destroy, no-gate-self-certifies]
shared_with: []
use_when: [turning one generated artifact into a set of derived channels, a pipeline emits every material channel at equal confidence, deciding whether to guess a value or refuse it, labelling what a downstream consumer may trust]
---

# Derive only what the source encodes

## The concern

Given one colour image and a demand for a full material, a pipeline can produce every
channel a renderer asks for. The files will all exist, all have the right dimensions, all
sit in the same folder, and all look equally authoritative. Their epistemic status will
range from *is the measurement* to *pure fabrication*, and nothing in the output records
which is which.

This is not a texturing problem with a texturing fix. It is the general rule for any
process that expands one artifact into several: **a derived output inherits the
uncertainty of its derivation, and a pipeline that hides that inheritance is lying about
most of what it emits.**

## The three-way split

Every candidate output falls into exactly one of three buckets, and the classification is
made once, per channel, by someone who understands what the source actually contains.

- **Derived faithfully** — the source genuinely encodes the quantity and a stated
  operator recovers it. Surface direction from luminance is here, with its own caveats.
  Label: derived, naming the operator.
- **Derived as a declared heuristic** — the source does not encode the quantity, but a
  stated convention maps something it does encode onto a usable value. Reflectivity
  inferred from brightness and local contrast is here: it is a convention, it is often
  close enough, and it is not a measurement. Label: heuristic, naming the rule, so that
  anyone who disagrees with the convention knows exactly what to replace.
- **Refused** — the source does not encode the quantity, no convention is defensible, and
  a wrong value is expensive. Whether a surface is metal is here: it is a binary physical
  fact that changes how the surface responds to all light, brightness does not predict it,
  and a plausible mid-grey guess sends someone debugging their lighting. Label: absent,
  with a reason.

The reason to force every channel into one of these three is that the middle bucket is
where honesty is usually lost. A heuristic emitted without its label is indistinguishable
from a measurement, and it is the bucket most things fall into.

## Procedure

1. **Enumerate what the consumer asks for**, before deciding what you can supply. The
   list is set by the renderer, not by what happens to be easy.
2. **For each entry, ask what the source physically contains** that bears on it. Not what
   correlates with it in a training set — what the pixels are evidence of.
3. **Assign a bucket** and write the justification in one sentence. If the sentence needs
   a "probably" and a "usually" and an "in most cases", it is a heuristic, not a
   derivation.
4. **Emit a label with every output**, machine-readable, travelling with the artifact
   rather than in a document beside it. A label in a wiki is not attached to anything.
5. **Emit refusals as refusals** — a named absence with a reason, not a placeholder file,
   not a neutral constant, not a black image. The absence must be loud enough that a
   consumer notices before a renderer does.
6. **Record the producer's own confidence separately from any verification.** A generator
   that reports its output as good has made a claim, not delivered a verdict; if the
   channel is later checked by something else, that check is the authority and the
   producer's claim is an input to it.

## Decision rules

- **When a plausible wrong value costs more than an absent one, refuse.** That is the
  whole test, and it is asymmetric by design: a missing channel is found in minutes by
  the person wiring the material; a wrong one is found in days by someone debugging
  something else entirely.
- **When a heuristic is unavoidable, name the rule in the label** rather than only the
  bucket. "Derived by convention" is barely better than nothing; "dark regions assumed to
  be recessed and therefore rougher" tells a reader precisely when to distrust it.
- **Give a heuristic its own escape hatch, and record which way it was set.** The moment
  the rule is written down, its counter-cases become obvious — the convention that dark
  means rough is exactly inverted for a chalky, bright, matte surface — so expose the
  inversion as a stated option rather than leaving a whole material family
  systematically wrong. A heuristic with a switch is honest; a heuristic with a switch
  whose position is not recorded with the output is back to being unlabelled.
- **When a downstream system needs a value for a refused channel, it supplies one and
  owns it.** The refusal moves the authorship, it does not dissolve it. What must not
  happen is the derivation quietly supplying the number so that nobody has to decide.
- **When the same quantity could be derived two ways, pick one and record which.** Two
  derivations of the same channel with no recorded provenance is worse than either alone,
  because the disagreement becomes invisible.
- **Never let the absence of a check render as a pass.** A channel nobody verified and a
  channel verified as good are different states and must be different values in whatever
  the pipeline reports.

## When NOT to use it

- **When the source genuinely carries the full material.** A scanned or authored material
  set arrives with its channels measured; re-deriving them from one of them throws away
  information and replaces a measurement with a guess.
- **When a learned model is doing the estimation rather than an operator.** The bucketing
  still applies but the labels change: a model trained to predict a channel from an image
  produces an *estimate with a confidence*, which is a fourth status, and it should be
  labelled as an estimate from a named model rather than as a faithful derivation. It is
  emphatically not a measurement, and the fact that it is often right does not promote it.
- **As a reason not to ship.** The technique demands labelling, not perfectionism. A
  labelled heuristic is a shippable, useful artifact — the unlabelled one is the defect.
