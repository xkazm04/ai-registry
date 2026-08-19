---
layer: technique
type: technique
subject: platform-format-adaptation
technique: one-anchor-per-clip
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when: [compressing a multi-part topic into a short clip, reviewing a short script for idea count, deciding whether a short can teach a scale or taxonomy]
---

# One anchor per clip

A short clip carries **one idea, demonstrated on one anchor** — a single
concrete object or metaphor, established within the first two seconds and
never replaced. The anchor is the viewer's mental workbench: every subsequent
beat operates on it, and because it never changes, the viewer's model
compounds instead of resetting. Introducing a second metaphor mid-clip is the
most expensive mistake the format offers — the viewer must rebuild their model
from scratch with no runtime to spare, and most simply leave instead.

## One idea is not one fact

The rule is stricter than "one topic" but looser than "one fact", and the
distinction is where naive compression goes wrong. A short can teach five
complexity classes, five pricing tiers, five failure modes — *if* they are
five rungs on one ladder, played out on the same anchor, each rung linked to
the last by *but* or *therefore* rather than laid side by side. The canonical
shape:

```
one concrete object            ← THE ANCHOR, on screen at 0:01
  do the trivial thing to it       (cheapest case)
  BUT ask a harder question        (the previous answer fails)
  BUT ask a harder one still       (and again)
  BUT the absurd extreme           (often the joke — and it teaches the top of the scale)
  BUT the clever variant           (the twist that reframes the ladder)
```

That is one idea — *the cost/behavior varies with the question you ask* —
demonstrated five times on one object. Each rung defeats the previous rung, so
the ladder is a causal chain, not a list; the "but" linkage is what separates
a taught scale from an enumerated one. The test for whether your five things
are one idea: can every rung be performed on the same anchor? If rung three
needs a new object, you have two ideas, and one of them is a different clip.

## Procedure

1. **Name the idea in one sentence** before writing a beat. If the sentence
   contains "and", split it into two clips.
2. **Choose the anchor**: a concrete, viewer-familiar object on which every
   beat of the idea can be physically or visually performed. Concrete beats
   abstract — an object the viewer can picture being manipulated outlives any
   diagram of the concept.
3. **Establish it within two seconds** — ideally inside or immediately after
   the hook, so the hook and the anchor are one move, not two spends.
4. **Audit every beat against it.** A beat that cannot be staged on the anchor
   is either cut, rewritten onto the anchor, or evidence the clip has two
   ideas.
5. **Let the last beat buy memorability.** In the shortest container there is
   no room for a closing re-description; the final rung is often a joke — but
   the joke still runs on the anchor and still carries information (the absurd
   extreme teaches the top of the scale). A closing beat spent on pure comedy
   with zero payload is a beat the format could not afford.

## Tooling consequence

Where a script tool exists, the anchor is a **single named field, and the tool
refuses a second one**. The refusal matters more than the field: the moment a
second-metaphor slot exists it will be used, because a second metaphor always
feels like generosity to the author ("another way to see it!") and is always a
tax on the viewer. Same logic as banning the announced-fact hook — a craft
rule that survives only as advice loses to the surface that contradicts it.

## When not to use

Long-form work legitimately runs multiple anchors — a chapter each — with
transitions that formally retire one workbench before opening the next; the
per-clip rule applies to each derived short cut from such a piece, not to the
parent. And when a comparison *is* the idea (X vs Y), the pair is the anchor:
both objects on the table at second one, every beat touching both. What
remains banned is the mid-clip *replacement* — an anchor the viewer invested
in, silently swapped for a fresh one.
