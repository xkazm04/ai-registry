---
layer: application
type: application
subject: concept-scene-parity
technique: owner-anchor-for-a-model-panel
stack: python
status: forged
verified_on: 2026-10-29
---

# A critic that only ever sees paths, tested with a planted builder claim

blender-unity-game-studio (public, github.com/phytrisha/blender-unity-game-studio) gates each asset stage with
an isolated critic agent. Its witness is the cloned tree at commit `d36f7c6`, read on 2026-10-29. The tree's
README states it was verified on Blender 5.1.2, and no Python version is pinned, so no `verified_against` is
claimed. This is a source-tree application.

## The rule the tree states

.claude/docs/director-gates/ad-asset.md:16 "- **Never** the building agent's report or self-assessment"
studio-tests/agents/specialists/asset-critic.md:38 "**Scenario:** the prompt (wrongly) includes"

## How it realizes the amendment

**Quarantine.** The orchestrator passes the critic only paths:
- the asset's record and brief;
- the reference crops;
- the newest fixed-view render sheets;
- the style sections the brief names.

It never passes the builder's report, the orchestrator's own assessment or the progress narrative. If the
newest sheet is older than the asset file, the orchestrator renders fresh ones first. The critic has read and
run tools, and no write or edit tools.

**Planted-claim test.** The critic's behavioural test cases include a prompt that wrongly reports the builder's
verdict. The expected behaviour is to treat it as no evidence.

## What it cannot do

It has no owner anchor. Nothing in the tree compares the critic's verdicts with the user's on the same
assets, so its leniency is unmeasured. The tuning loop the amendment describes (read the critic's reasoning
where the owner disagreed, then change its instruction) has no instrument here. The user only sees the
critic's verdict at the gate's question. The other half of the amendment, a game pipeline that dropped its
separate verifier, is a different tree (godogen at `40542b6`, in its changelog entry that dropped the external verifier). It is cited in the technique
as the boundary, not realized here.
