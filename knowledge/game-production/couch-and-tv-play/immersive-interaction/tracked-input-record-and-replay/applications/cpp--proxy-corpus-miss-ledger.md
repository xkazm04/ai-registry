---
layer: application
type: application
subject: tracked-input-record-and-replay
technique: proxy-corpus-miss-ledger
stack: cpp
status: draft
verified_on: 2026-10-22
verified_against: cpp@20
applied: experiment
ab_verdict: better
proof: structural-only
---

# A stand-in corpus whose "mouse" label names a channel, not a hand

Source tree: `mage-arena-vr` on `master` at `9ebdf43` (the root of every path below), read
in a detached checkout. The stack is C++ in an Unreal Engine 5.8 project, as in this
subject's other applications. The `cpp@20` witness is the same one those applications cite.
Node scripts generate the clips. This run landed `9ebdf43` in the project: a proxy ledger,
three relabelled cells in the submission draft, and one link from the clip schema.

**No tracked hand and no human mouse stroke made any figure counted here.** All 113
committed clips carry `"source":"synthetic"`. The 90 mouse clips are gitignored, and they
come from the same generator as the corpus.

## The seam

The project already had a labelling rule. Its plan requires every October gate figure to be
labelled as coming from mouse input or synthetic clips:
`docs/PROJECT-PLAN.md:512` "labelled mouse or synthetic, never hands".
The clip schema's `source` field has three values: `synthetic`, `recorded`, `mouse`.

The mouse clips are written by the corpus generator:
`apps/vr/tools/clipgen/mousepaths.mjs:1` "Mouse-drawn sigil clips. Same loader as the hand clips; source is"
and `apps/vr/tools/clipgen/mousepaths.mjs:23` "const built = buildVariedClip(action, stroke, 'normal', seed, 'mouse', true, 'mouse');".
So a figure labelled "mouse" passes the plan's rule and is still a figure on the generator's
own distribution.

## Arm A and arm B

- **Arm A (the plan's rule as practised):** label October figures "mouse" or "synthetic",
  somewhere near the figure.
- **Arm B (this technique):** the label names what produced the input and sits in the
  number's own cell or sentence. A miss ledger records where real hands contradicted the
  stand-in. Each rule states which of its claims wait for the device.

The instrument was a line inventory over the project's figure-bearing documents: the README,
the plan, the clip schema, four research reports, three KPI files and the submission draft.
It kept lines with a measured ratio or percentage about a hand rule and dropped gate targets
and pending rows. That left 31 figure statements.

| Count | A | B |
| --- | --- | --- |
| Basis in the number's own cell or sentence | 0 of 31 | 3 of 31 |
| Basis in the same row | 3 | 3 |
| Wording that names the wrong basis | 4 | 3, all in dated reports, listed in the ledger |
| Rules with their device-waiting claims stated | 2 (pending rows) | 6 |
| Miss-ledger rows | none, and nothing said so | 0, stated as never checked |

The four wrong-basis wordings were "recorded corpus" in the live submission draft and in one
dated evaluation, and "mouse 87/90" twice in the feasibility report. The draft was fixed:
`docs/submission/HAND-INTERACTION.md:80` "Sigil accuracy on the generated corpus".
The dated reports were left as written and are labelled from the ledger, for example
`docs/research/STATE-EVAL-2026-10-20.md:48` "A recorded corpus figure is". The feasibility
report carries 25 of the 31 figures and never says its clips are generated.

**Target:** basis in the number's own field, 0 -> 3 on the outward-facing table. Device-waiting
claims stated per rule, 2 -> 6.
**Floor:** no figure, threshold, test, clip or gate verdict changed; the change is docs only.
Held.

**Chosen to falsify.** A plan that already requires a mouse-or-synthetic label might make
this technique's first rule redundant. Had every figure carried a true label, the verdict
would have been `not-better`. It did not hold, and the way it failed is the finding: the
vocabulary labelled the channel, so an accurate-looking label hid a generator figure. The
technique's rule survived, with a boundary added (below).

## What the tree shows about the technique

- **A label can be accurate about the channel and wrong about the basis.** "Mouse" and
  "recorded" are what each figure's input pretends to come from. The question the label
  must answer is what produced it. The technique gained that boundary from this run.
- **The ledger's first state is empty, and saying so is the content.**
  `docs/PROXY-LEDGER.md:62` "Empty: the stand-ins have never been checked against real hands."
  The misses the project already knew about were found by review or by model-against-model
  runs: a ward hand that settles, a hand that enters tracking already raised, zigzag overshoot
  on a modelled stream, pinch and thumb coupled by construction. They are listed beside the
  ledger, not in it, because no real hand was involved.
- **Rule constants were tuned entirely on stand-ins.** Both sigil stroke bounds were read
  from generated clips and modelled streams:
  `apps/vr/Game/Source/MageArenaVR/Gestures/SigilStrokeBuilder.h:56` "static constexpr double InnerTailRatio = 0.53;".
  Nothing in the source comment says so. The ledger's section 4 makes this the retirement
  condition for that rule.
- **The project's model-miss ratchet deletes rows when a fix lands.** The rows live on only
  in a comment, which is the behaviour this technique forbids for a proxy ledger. It is
  right for a test ratchet, whose job is to fail on a stale row. The two lists answer
  different questions and both are kept.

## What this realization cannot do

It labels and counts. It cannot say how wrong a generated figure is, because no recorded
clip exists to compare with. The first ledger row needs the owner's mouse draws for the
D-G2 gate, or the V2 recordings (5 to 8 November 2026). Until then every figure in the
inventory stays unchecked.
