---
layer: technique
type: technique
subject: grounded-marketing-generation
technique: deterministic-clamp-vs-model-reprompt
status: forged
laws: [a-gate-before-money-and-copy, not-measured-is-not-zero]
shared_with: []
use_when: [deciding how a validator violation on model output is repaired, designing the self-repair loop of a generation wrapper, reading generation telemetry that reports repaired or clamped output]
---

# Deterministic clamp versus model re-prompt

A validator on structured model output produces violations of two natures. Some the
normalizer that runs anyway fixes for free and deterministically: a headline over its
character limit, a list over its count, whitespace, casing, a stray ellipsis. Others
only a model can fix: a required field missing, an arm returned without a headline, two
arms that open identically, an answer in the wrong language, an entity the validator
can recognise as invented. The technique is to partition the violation list by that
nature *before* deciding to re-prompt, and to re-prompt only when at least one
violation genuinely needs the model.

## Why the partition matters

Re-prompting for a length overrun buys a second full model call - double the latency,
double the spend - to produce what the clamp would have produced anyway; and when the
second call fails, the code falls back to that same clamp, silently, so the marketer
paid for nothing and the telemetry recorded a success. Conversely, clamping a missing
field - padding it, or dropping it so the output still parses - hides a defect the
model needed to see, and a set of ads with three headlines instead of eight ships as
if complete. One error wastes money; the other wastes the marketer's trust.

## Procedure

1. **Give clampable violations one shape.** Every "this field is too long" violation in
   the product is phrased by one helper in one sentence form. That is the only way a
   later step can recognise the class without guessing.
2. **Match the shape exactly, and nothing looser.** The classifier that says "the clamp
   fixes this" is anchored at both ends of the sentence and matches nothing else. A
   free-text violation that merely mentions a limit ("missing the variant for channel
   X") must never be mistaken for a clampable overrun, because the expensive failure
   here is skipping a repair the model genuinely needed. Narrow beats clever.
3. **Partition.** Split the validator's list into clampable and needs-model.
4. **Re-prompt only when needs-model is non-empty, exactly once.** The repair note
   carries the *full* violation list, including the clampable ones: the call is already
   paid for, telling the model about the limits too is free, and it keeps the repaired
   output identical to what a full repair would have produced.
5. **Re-check the repaired parse once.** The repair gets one shot; if the model came
   back wrong again (still the wrong language, still a missing field), report it rather
   than shipping quietly or burning a third call.
6. **Normalize after the loop, never inside the try.** A bug in the product's own
   normalizer is an application error; catching it as a provider failure records
   phantom success and falls through to the next provider - another real, paid call.
7. **Tell the truth in telemetry.** Report combined usage of both calls, not the
   latest; mark the output as repaired; record the violations resolved by the clamp
   *instead of* a re-prompt only when no re-prompt fired; classify a parse that
   succeeded but is truncated or degenerate as corrupt, distinct from success, so it
   neither reads as healthy in the durable log nor renders as clean on screen.

## Decision rules

- When a violation can be repaired by the same code path that would run on a clean
  output, it is clampable; when repairing it requires knowing what the model *meant*,
  it needs the model.
- When the language check fails, route it as an ordinary violation into the same one
  re-prompt rather than a path of its own, so the golden prompt and schema are
  untouched and the fix is one seam.
- When the repair throws, keep the first result and let the normalizer clamp; never
  return nothing and never retry beyond the bounded attempts.
- When the normalizer clamps, cut on a word boundary and add an ellipsis only when a
  cut happened, so the reported length is the fitted length and a live character-count
  badge is never red for copy that will actually export.
- When a demo or degraded output is served because every provider failed, mark it as
  demo in the same meta the client reads, so a fallback is never mistaken for a
  measured generation ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).
- When a cheaper tier is under consideration, know that the fast tier's characteristic
  failure is the constraint violation the clamp then truncates mid-word - a repair
  that reads as success in telemetry and as broken copy to the marketer. The re-prompt
  budget does not make a tier safe.

## What is convention here

One re-prompt, and three bounded attempts on a recoverable provider error, are
practitioner convention sized from observed failure rates in one product (an
unparseable response roughly one call in seven under model variance, where two
attempts made a fourteen-tool proving run a coin flip). Another product measures its
own rates and sizes its own bounds; the shape - bounded, partitioned, reported - is
the technique, the counts are not.

## When not to use this

Do not partition when the output has no deterministic normalizer at all (a free-text
article draft with no schema): there every violation needs the model, and the
technique reduces to "one re-prompt with the full list, then report". Do not clamp a
violation of substance because a regex could - a duplicate headline can be
deduplicated by code, but the resulting set has one fewer angle, which is the defect
the validator exists to catch; send it back. Do not let the partition become a second
gate before publication: it decides how an output is *repaired*, and the
publishable-as-is gate still runs on the result
([a gate before money and copy](../../../_laws.md#a-gate-before-money-and-copy)).
