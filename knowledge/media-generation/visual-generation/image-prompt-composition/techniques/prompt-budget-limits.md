---
layer: technique
type: technique
subject: image-prompt-composition
technique: prompt-budget-limits
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
use_when:
  - sizing a prompt against a model's real attention window
  - a vendor rejects prompts or silently ignores their second half
---

# Prompt budget limits

## The concern

A prompt has two ceilings, and they fail in opposite ways. The **soft
ceiling** is the text encoder's attention window: caption-trained encoders
attend to roughly the first 77 tokens and *silently drop the rest* — the
call succeeds, the image obeys half the prompt, and nothing tells you which
half. The **hard ceiling** is the vendor's character limit: overrun it and
the call fails with an opaque error after the round-trip. The soft ceiling
wastes renders on images that could never have followed the brief; the hard
ceiling wastes latency and, at scale, money. Both are properties of the
model and vendor, both are knowable in advance, and both are routinely
discovered in production instead — which is the actual defect this
technique removes: **budgets must be encoded where prompts are compiled,
not remembered where they are written.**

## Procedure

1. **Record both ceilings per model in the pipeline's model table**: the
   attention window in tokens (the soft budget) and the vendor's character
   ceiling (the hard budget). Where the vendor documents neither, measure
   the soft one empirically — generate from a prompt whose late half
   contains a distinctive, checkable element and see whether it appears.
2. **Enforce the hard ceiling before the call.** The compiler measures the
   assembled prompt and the interface warns at authoring time — a vendor
   error after the round-trip is a bug in your pipeline, not the vendor's.
3. **Treat the soft ceiling as a design constraint, not a validation.** You
   cannot error on it — long prompts are legitimate on long-window models —
   but the compiler's block order must guarantee that the material inside
   the smallest fleet window is sufficient for an on-style image
   (style-first-token-ordering). The budget decides *what goes where*, not
   just *how much*.
4. **Size the style block to its share.** Around 100–250 words holds a
   complete style contract; past that the style crowds the action block's
   share of attention and outputs go style-rich but subject-vague. When the
   style block alone approaches a target model's whole window, the block is
   overwritten — cut adjectives before cutting role assignments and bans,
   which are the enforceable parts.
5. **Spend the action budget on countable elements, earliest first.** Under
   a tight budget, atmosphere words go first; exact counts, positions and
   reserved-space clauses stay, because they are what the grading rubric
   checks. A budget cut that removes a checkable element must be a
   deliberate scope decision, visible in the rubric, not a silent casualty.

## Decision rules

- **When a model renders the prompt's opening faithfully and ignores the
  rest, diagnose truncation before incompetence**: re-run with only the
  style block plus the first subject element. Faithful → over budget;
  still wrong → the model, and no amount of trimming will fix it.
- **When a fleet mixes window sizes, budget for the smallest window** and
  treat everything beyond it as tiered: required on long-window models,
  forgiven on short ones. Grade accordingly — failing a short-window model
  for missing a token-position-90 instruction measures your budget, not
  the model.
- **When the brief cannot fit the smallest window, split the image**, not
  the sentence. Two ideas competing for one budget is the same defect as
  two ideas competing for one frame; the fix is the same — one idea per
  image.
- **When cost matters, the budget is also economic**: a prompt that
  half-fits produces renders that fail the rubric, and a failed render
  costs the same as a passing one. Price per *usable* output is what a
  blown soft budget silently inflates.

## When not to use it

Do not impose a short-window discipline on a pipeline that verifiably runs
only long-window models — you would be paying in expressiveness for a
constraint you do not have; keep the ordering (it is free) and drop the
77-token austerity. And do not confuse the budget with a style preference
for terseness: under-specified prompts fail differently (the model invents),
and a budget's purpose is to force *prioritisation*, never to make prompts
short for its own sake.
