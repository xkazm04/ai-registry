---
layer: application
type: application
subject: concept-scene-parity
technique: refine-or-pivot-with-every-round-kept
stack: python
status: forged
verified_on: 2026-10-29
---

# A three-verdict asset gate that separates fixing the execution from changing the plan

blender-unity-game-studio (public, github.com/phytrisha/blender-unity-game-studio) is an agent studio that
builds game assets through Blender Python stage scripts and gates every stage with a separate critic. Its
witness is the cloned tree at commit `d36f7c6`, read on 2026-10-29 (the tree's README states it was verified on Blender 5.1.2; no Python version is pinned, so no `verified_against` is claimed). This is a source-tree application: the
realization lives in the source, not in a managed project.

## The rule the tree states

.claude/docs/director-gates/ad-asset.md:23 "> reference or the budget — change the brief, the route or the tool]. If an input this gate needs is missing or"
.claude/skills/produce-asset/SKILL.md:110 "   the stage's sheets — never the builder's report. REVISE → one fix round with the builder on the critic's findings"
.claude/skills/produce-asset/SKILL.md:121 "re-run them in order. Never patch downstream around an upstream change."

## How it realizes the technique

The critic returns one of three verdicts, plus NOT ASSESSED:
- **APPROVE:** the stage meets its definition of done.
- **REVISE:** the refine verdict. It gets exactly one fix round on the critic's high-confidence findings, and
  then goes to the user.
- **REJECT:** the pivot verdict. "The approach cannot reach the reference or the budget", so the next step
  changes the brief, the route or the tool, and goes straight to the user.

The refine loop is bounded by construction, and a capped approach cannot be polished indefinitely. Stages
lock in order, and unlocking an earlier stage re-runs every later one. Every change is a re-runnable script,
so every stage's state can be rebuilt.

## What it cannot do

The tree has no current-best record across rounds. A REVISE round overwrites the stage's working file, and
the fixed-view review renders are what make rounds comparable, not a pointer to the best one. The critic has
no numeric pass threshold for APPROVE beyond the stage's own numeric checks. The decision to pivot is the
critic's judgement on one round, not a rule over repeated findings.
