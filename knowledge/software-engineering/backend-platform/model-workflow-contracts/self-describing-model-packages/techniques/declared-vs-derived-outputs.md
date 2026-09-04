---
layer: technique
type: technique
subject: self-describing-model-packages
technique: declared-vs-derived-outputs
status: forged
laws: [derivation-names-recomputation, unknown-is-not-a-value]
shared_with: []
use_when: [writing the output section of a model's metadata when a post-processing step follows the network, deciding whether a consumer receives logits or labels, reviewing a package whose declared output does not match what its pipeline returns]
---

# Declared outputs and derived outputs

A network emits a tensor. A pipeline wraps the network and emits something
else: an argmax over the channel axis, a thresholded mask, a
connected-component-filtered mask, a resampled volume in the input's
original geometry, a probability rescaled to a calibrated range. Both are
"the output", and a consumer handed a metadata block that describes one of
them has no way to know which — until it computes a metric against the
wrong one and gets a number that is confidently meaningless.

The rule: **whenever the pipeline changes the meaning of an output, describe
the derived output separately from the raw one, and say which step derived
it.** The raw output is what the network returns; the derived output is what
the package returns; and a consumer picks the description that matches the
interface it is calling.

## What "changes the meaning" means

Not every post-processing step earns a separate declaration. A step that
changes **type, shape, or semantics** does; a step that changes only
representation does not. Concretely:

- an argmax turns a channels-of-probabilities tensor into a single-channel
  label map — the channel count changed, the element type changed, and the
  value range changed from continuous to a small integer set: derived;
- a threshold turns a probability into a binary mask — value semantics
  changed: derived;
- a resampling back to input geometry changes the spatial shape and the
  correspondence to the input — derived;
- a cast from one floating-point width to another changes representation
  only — not derived, note it in the raw declaration.

The tell is whether a consumer's downstream code would behave differently.
If a metric written against one would be wrong against the other, they are
two outputs.

## The shape of the declaration

The raw output declaration carries the same fields as an input: type,
format, channel count, an element type, a value range, a channel map that
names what each channel means, and a spatial shape written in the same
symbolic grammar as the inputs so that the output's relation to the input
is visible — the same variable, or a divided one.

The derived output declaration carries the same fields, with the values the
pipeline produces, plus **a name for what derived it** — the post-processing
step or chain, as it is named in the package's configuration. That name is
what makes the derived value honest: a stored derived value with no stated
recomputation is a discrepancy waiting for an arbiter
(`../../../../_laws.md#derivation-names-recomputation`). A consumer that
receives a label map and reads "derived by the inference post-processing
chain" can find that chain in the package and reproduce the derivation; one
that receives a label map with no lineage has a number it cannot audit.

## The failure this prevents

A consumer calls the network directly — say, from a serving runtime that
loads the compiled form and skips the package's own pipeline — and reads the
package's output declaration, which was written for the pipeline's output.
It expects a single-channel label map and receives a multi-channel
probability tensor. If it is lucky, the shape mismatch raises. If it is not,
it slices the first channel and proceeds, and the first channel is the
background probability.

The reverse is as common: the consumer runs the whole pipeline and reads a
declaration written for the raw output, and its metric for a probability
tensor is fed a label map of integers.

Both are the same defect: one declaration standing in for two outputs. Both
are prevented by declaring both and naming the interface each belongs to.

## Decision rules

- **When the package ships a post-processing chain, declare its output.**
  The presence of the chain is the trigger; do not wait for a consumer to
  ask.
- **When the package ships no post-processing, do not declare a derived
  output** — and do not fabricate one so that the field is present. An
  absent derived-output section means "the package returns the raw output",
  and a consumer must read absence as that, never as "unspecified"
  (`../../../../_laws.md#unknown-is-not-a-value`).
- **When the derived output's shape depends on the input's** — a resampling
  back to the input geometry — write its spatial shape in terms of the
  input's variables, so the coupling is visible.
- **When two consumers need two different derived forms**, ship two
  post-processing chains and declare both outputs, each naming its chain.
  One declaration with a comment saying "or the other" is neither.

## When not to use this

Do not split a declaration for a step that only re-encodes — a cast, a
layout permutation, a move between devices. The consumer's downstream code
does not change, and the second declaration is a copy of the first with one
field different, which is one more thing to drift. The split is for meaning,
not for mechanics.
