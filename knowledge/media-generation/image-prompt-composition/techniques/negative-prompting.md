---
layer: technique
type: technique
subject: image-prompt-composition
technique: negative-prompting
status: forged
laws: [checkability-routes-the-pixel, style-is-restated-not-remembered]
shared_with: []
use_when:
  - a recurring defect keeps appearing across generations
  - adapting one prompt contract to vendors with and without negative-prompt support
---

# Negative prompting

## The concern

A negative prompt is not a wish list of everything ugly. It is the
**enforcement channel for the project's standing exclusions** — the things
the positive prompt bans in prose, restated in the form the sampler acts on.
On guidance-based models the mechanism is literal: the sampler amplifies the
difference between the positive and negative conditionings, steering each
step away from the negative's direction. That mechanism has consequences the
naive copy-paste negative ignores: its strength scales with the guidance
setting, an overweight negative distorts the positive it was meant to
protect, and on some vendors the channel does not exist at all and the
exclusions must live elsewhere.

## Procedure

1. **Derive the negative from the project's contract, not from folklore.**
   Every entry answers "which failure of *this* project does this prevent?"
   A composited-plate project's negative has three families:
   - **the architectural ban** — text, letters, numbers, words, typography,
     labels, captions, watermark, signature, logo (the vector layer's
     territory, doubly enforced here and in the positive no-text clause);
   - **the style's opposites** — for a flat vector look: photorealistic,
     photograph, 3D render, gradient, glow, bevel, drop shadow, noise
     texture (each one a specific way the look has been seen to break);
   - **the composition's enemies** — clutter, busy background, tiny
     details, ornate (the block-size discipline, stated negatively).
2. **Keep it one line and stable.** The negative is part of the restated
   style contract: authored once with the style block, sent verbatim on
   every call, never improvised per image. A per-image negative is a smell
   — it usually means a subject problem being patched at the wrong layer.
3. **Weld it into the compiler with a per-vendor adapter.** Vendors that
   accept a negative parameter get it as one; vendors that do not get the
   same exclusions folded into a positive-prompt exclusion clause ("no
   gradients, no shading, no photographic texture…"). The contract is
   vendor-neutral; only the delivery differs.
4. **Tune against guidance, not by adding words.** If the negative is being
   ignored, raise the guidance scale a step before lengthening the list —
   its effect scales with guidance, and below the low end of the scale it
   barely acts. If a heavy negative is making outputs stiff or degraded,
   lower guidance a step or cut entries; do not fight distortion with more
   negation.
5. **Retire entries that stop earning their place.** Newer model families
   need far less negation — long boilerplate negatives on them constrain
   more than they correct. When migrating models, re-derive the negative
   from observed defects on the new model, starting near-empty.

## Decision rules

- **When a defect appears once, ignore it; when it recurs across seeds and
  subjects, add its name to the negative** — one term, then re-observe.
  The negative grows by evidence, entry by entry, like a regression suite.
- **When the defect concentrates on one subject, it is not a negative-prompt
  problem** — it is a text-magnet or checkability problem in the action
  block; fix the noun (shape-language-over-nouns), because the negative
  channel cannot reliably beat an invitation the positive prompt extended.
- **When something must never appear, do not rely on the negative alone.**
  The negative biases; it does not guarantee. Unconditional bans (text on a
  plate) are enforced three times — positive clause, negative prompt, and a
  grading step that fails the output — because each layer leaks a little.
- **When the accent colour bleeds where it is banned**, the fix is the
  positive role sentence ("used only on… and nowhere else"), not a negative
  entry naming the colour — negating a colour you also require confuses
  the guidance in both directions.

## When not to use it

Do not use the negative to express composition ("no second arrow") —
element-level structure belongs to the positive prompt's countable language;
the negative operates on qualities and categories, not on layout. Do not
carry a negative between projects with different styles: a flat-vector
project's "no gradient" would sabotage a soft-lit painterly one. And on
models with no negative channel, do not simulate one with paragraphs of
positive-prompt negation — one tight exclusion clause is the ceiling of what
prose negation can do, and budget spent past it is wasted.
