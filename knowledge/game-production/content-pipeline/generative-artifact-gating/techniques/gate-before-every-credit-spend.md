---
layer: technique
type: technique
subject: generative-artifact-gating
technique: gate-before-every-credit-spend
status: forged
laws: [no-gate-self-certifies, structural-proof-is-never-sufficient]
use_when: [placing verification in a multi-stage paid pipeline, a defect was discovered three paid stages downstream, deciding whether to skip a gate for speed]
---

# Gate before every credit spend

## The concern

In a pipeline where each stage costs money and each stage transforms the previous stage's
output, defects do not merely survive — they **amplify**. A downstream model reproduces
and magnifies whatever it is fed: a flaw in the source is not smoothed by the next
transform, it is elaborated into the next representation, where it is harder to see and
much harder to remove. No later stage repairs a bad input. The gate therefore belongs on
the **input** to each paid stage, not on its output.

## The economic argument

State it as arithmetic, because it settles the argument that gates cost time.

Let each stage cost *c* and let a defect present at the input of a stage survive it. A
defect caught before stage one costs one regeneration of the source. The same defect caught
after stage three has been paid for three times — *3c* spent producing derived output that
was faithful to a bad input — and the correction cost is not *3c* but *3c* plus the
discarding of two stages of downstream work plus the human time that reviewed them. The
cheapest possible placement of a gate is **immediately before the first paid stage**,
because that is the only point at which the loss on rejection is zero.

The consequence people resist: the gate that feels most wasteful — the one on the very
first, cheapest input, before anything expensive has happened — is the highest-value gate
in the line. It is the only one whose rejections cost nothing.

## Placement rules

- **Before every step that spends, there is a gate, and it examines the input.** No paid
  transform runs on unverified material. This is a structural property of the pipeline, not
  a checklist item someone remembers.
- **Verify at the fidelity the next stage will consume.** A defect that is invisible at
  thumbnail scale and ruinous at close range must be gated at close range. Inspect close,
  at scale, under the conditions where the defect would actually show — a gate that looks
  at less than the next stage sees is a gate that passes what the next stage will choke on.
- **The producing stage does not pass itself.** A generator reporting success is an input
  to the verdict; the verdict comes from a separate reader looking at real output. Under
  automation, report verified and asserted as two distinct numbers and count only the
  verified one.
- **Structural validity is never the gate.** That the artifact exists, parses and has its
  fields set says nothing about whether it looks right. The gate before a paid stage always
  has a perceptual or behavioural rung, because nothing below those rungs implies them.
- **A refusal is a result.** A gate that cannot obtain the evidence it needs reports a
  stated precondition failure and stops the spend. It does not wave the artifact through on
  the grounds that blocking would be disruptive.

## Sizing the gate

Gates cost time, and a gate more expensive than the stage it guards is a bad trade. Size it
against the stage behind it: the gate on a cheap first stage can be a fast structural plus
perceptual check; the gate before an expensive multi-minute paid transform earns a full
review, because the alternative is paying for the transform to find out. Where the gate is
automated, the mutation probe applies — a gate nobody has proven sensitive to its own input
is not a gate, and an insensitive gate in front of a paid stage is worse than no gate,
because it licenses the spend.

## When not to use it

- **Free, instant, reversible stages.** If a stage costs nothing and its output can be
  discarded without loss, gate after it instead and use the output itself as the evidence.
  The rule is about irreversible expenditure, not about ceremony.
- **Exploration.** During deliberate wide exploration — many cheap variants to find a
  direction — a per-attempt gate defeats the purpose. Gate the *transition* out of
  exploration into the production line, once, hard.
- **As a substitute for input quality.** A gate rejects bad inputs; it does not make good
  ones. A line whose gate rejects most of what reaches it has an upstream problem that more
  gating will not fix.
