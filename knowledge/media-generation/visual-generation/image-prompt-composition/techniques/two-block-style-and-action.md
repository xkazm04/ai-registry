---
layer: technique
type: technique
subject: image-prompt-composition
technique: two-block-style-and-action
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when:
  - generating more than one image for the same project
  - a batch of outputs no longer looks like one project
---

# Two-block style and action

## The concern

A single generated image has one author: the prompt. A *set* of images has
two authors — the prompt and the model's per-call improvisation — and unless
the prompt structure separates what is constant from what varies, the model
improvises the constant half too. The result is the first failure every
practitioner reports: generate shot by shot from free prose, and each shot
invents its own look.

The technique: split every prompt into two blocks with **different
lifetimes**.

| Block | Lifetime | Holds |
| --- | --- | --- |
| **Style** | the whole project | rendering technique, palette with roles, finish, line quality, element vocabulary, background treatment |
| **Action** | one image | what happens in this frame: composition, elements, spatial relations, reserved space |

The style block is authored once, ratified, and never retyped. The action
block is written fresh per image. A prompt is the concatenation of the two —
style first — plus the project's standing constraint clause.

## Procedure

1. **Author the style block once, as its own artifact.** Not inside any
   image's prompt — in the project's configuration, where every call reads
   it. Write it technically, not evocatively: named colours with roles,
   named finish ("matte, hairline strokes of even weight"), explicit bans
   ("no gradients, no shading, no photographic texture"). Roughly 100–250
   words; beyond that it crowds the action block's share of attention.
2. **Ratify it by generating.** A style block is proven by a reference image
   the owner approves, not by reading well. The block plus its approved
   reference together are the locked style; the block is the part machines
   restate, the reference is the part humans compare against.
3. **Compile, don't concatenate by hand.** Route every generation through
   one function that takes (style block, action) and emits the full prompt.
   Call sites that assemble prompts themselves are call sites that will
   eventually skip the style half.
4. **Restate the style block in full on every call — even when a reference
   image is attached.** This is the load-bearing rule and the one with a
   measured failure behind it: attaching the approved reference alone lets
   the look transform mid-batch. Text and image carry the style together;
   the image alone does not. Provide no short form, and no opt-out.
5. **Restate at every hop.** If a picked still moves on to another
   generation stage (variation, upscale, motion), the style block travels
   with it. A downstream prompt is not self-contained; it inherits.

## Decision rules

- **When a project needs more than one image, split immediately** — before
  the first generation, because the style block doubles as the record of
  what the look *is*, and reverse-engineering it from outputs later is
  guesswork.
- **When outputs drift despite an attached reference, the diagnosis is a
  missing or shortened text block**, not a bad reference. Restore the full
  restatement before touching anything else.
- **When the user wants a different look, change the style block and
  regenerate the reference** — never patch the look inside individual
  action blocks, which forks the project into per-image styles again.
- **When onboarding a found look** (a screenshot, an old frame), have a
  vision model read it back *as a style block* — colours, type of finish,
  element vocabulary — then let a human edit the words. This turns a
  one-off look into an editable, reusable theme; the image alone is not
  reusable because it cannot be partially edited.

## The truth test

Swap any action block under a different project's style block. If the output
follows the style block it was compiled with, the separation is real. If
traces of the old project's look survive — because look-words leaked into
the action blocks — the split is cosmetic and the drift will return.

## When not to use it

A genuine one-off — a single image, no siblings, no future edits — can be a
single free-prose prompt; the two-block structure buys nothing when nothing
recurs. But the moment a second related image is requested, the cost of
retrofitting the split exceeds the cost of having started with it, so treat
"one-off" as a claim to be suspicious of.
