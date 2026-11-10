---
source: batch
kind: batch
url: "youtube:HpAgqXgiBK8, youtube:F0GadTErfxs, youtube:2M1TEH6JPKc"
title: "Agent-built 3D loop, /shift batch of 3 videos from 3 channels"
author: "3 channels: Coding Crash Courses; Gorka Games; Stefan 3D AI"
words: 7044
extracted: 35
accepted: 0
declined: 0
leads: 3
already_covered: 23
untriaged: 8
currency: 1
dispatched: 0
applied: 0
shipped: 0
run_id: shift-agent-built-3d-loop
siblings: 2
fetches: 0
---

# Agent-built 3D loop, mined under /shift, 2026-11-10

Plan `plan-20261109-152922`, cluster `agent-built-3d-loop`, board run `shift-agent-built-3d-loop`.
The question: when an agent builds 3D through a modelling package and an engine, what closes the
loop (self-review of its own renders against a reference, or a separate judge against measured data
and photographs), and what does a long run cost? Three videos, read from cached captions only.
Nothing on screen was watched. No fetch, no GPU, no download, no render. Phase 7.7: gate=skipped.

- **H** = `youtube:HpAgqXgiBK8`, "How to Build a Huge Game World as a Solo Dev With This Opus 5.5
  Workflow" (1,354 words). A first-party build walkthrough with no sponsor. This is the
  separate-judge-on-photographs arm.
- **F** = `youtube:F0GadTErfxs`, "Opus 5.5 Just Took Over Blender" (2,600 words). The creator tours
  the kit he distributes, so there is a conflict of interest. This is the self-review arm.
- **S** = `youtube:2M1TEH6JPKc`, "Claude Opus 5.5 Is the New KING of 3D Design & Blender" (3,090
  words). A sponsored two-model comparison: the sponsor's plugin made the UV and animation test
  meshes. Only the owner's eye judges.

**Expected yield, stated first:** catches against `concept-scene-parity`, `reference-parity-gating`
and `generative-artifact-gating`, one photo-matched amendment, and leads. The catches held. The
amendment did not survive the lander's read (H2 below).

**Voices.** Three channels, three voices. Convergence counts voices, so the cluster has none on any
row. **H's channel was already mined on 2026-11-06** as C in
[`2026-11-06-agent-built-game-operating-model`](2026-11-06-agent-built-game-operating-model.md). The
creator says it is "pretty much the same approach" as that earlier video, so H is the same voice
again and lifts none of that note's C rows. S's channel appears in five earlier notes and adds no
second voice to them here. **Neither arm of the theme reports a measured outcome**, so the cluster
cannot say which loop closes better. It can only say where each one puts the instrument.

**Admission:** the +3 bar governed the scored rows, and nothing reached it. The best re-scored row is
S4 at 2/2/1 before the tree read, and it stays a lead (see below). `auto=0/0/0 fp=0`: no miner
accepted anything, so no accept died at this read.

## What landed

Nothing in `knowledge/`. This note, its ledger lines, three leads, and one currency line. No project
was touched. PoF was read only.

## Source H: separate judge on photo-matched shots of a measured world

The method half runs [00:00:00]-[00:05:31] and the showcase half [00:05:53]-[00:07:17]. The builder
solves where each of 17 photographs was taken and recreates the shot. A separate visual-model call
scores seven named axes, and its notes go back to the builder, which fixes the pipeline and rebuilds
the whole map [00:01:18]-[00:02:11]. No score, round count, timer or cost is given.

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| H1 | Separate judge scores named axes, notes drive the rebuild | [00:01:18]-[00:02:11] | Already covered | `element-scorecard-from-the-concept-camera`; `findings-carry-the-correction`; `owner-anchor-for-a-model-panel` rule 6. Same voice as 11-06 C1 |
| H2 | The photograph's camera must be solved; solve it once from the measured ground and freeze it | [00:01:18]-[00:01:45] | Already covered | `register-once-from-the-invariant` § Compute the frame once, from the invariant region. A solved photo pose is a registration, and that rule already says to derive it once from the region the defect cannot reach and reuse it unchanged. Re-scored as a boundary, 1/0/1, and the photograph case needs no sentence of its own. Same voice as the 11-06 C3 lead. Its return condition (the operator's photos with a measured pose) has not fired |
| H3 | A few judged shots steer a whole-world generator: hold some out | [00:00:51]-[00:01:45] | Already covered | Same voice as 11-06 C2, which is untriaged and carried by held row `shift-rjf-1`. No new voice |
| H4 | Skyline-type axes become instrument-scorable once the ground is measured | [00:01:45] | Untriaged, 1/3/1 | The miner's inference from the axis list, not the source's method |
| H5 | Measured ground as a terrain producer | [00:01:45]-[00:02:37] | Already covered | Same voice as the 11-06 C4 lead. That lead returns on "the source's promised follow-up, a repo, or an operator direction". H is the follow-up. It gives no repo and no measurement, and no consumer exists, so it stays a lead with no new voice |
| H6 | Vegetation mask from surface minus ground, species from height bands | [00:02:37]-[00:03:28] | Already covered | `biome-mask-cross-consistency` for the height-keyed rule. The measured canopy is the 11-06 C5 lead, same voice |
| H7 | Distance tiers for an open vista world | [00:03:54]-[00:04:51] | Lead | Below |
| H8 | A motion-only defect (distant treetop shimmer) given a frame-by-frame measure | [00:04:51]-[00:05:10] | Untriaged, 1/2/1 | An append to `owner-anchor-for-a-model-panel` rule 7 and its abstain rule, which stay true. The source names no metric. A second voice that measures a motion-only defect numerically would lift it |
| H9 | Haze as budget lever and as look | [00:05:10]-[00:05:31] | Untriaged, 1/2/1 | Belongs with H7 if that lead becomes a technique. Caution for that writer: haze changed between rounds changes the judge's light and skyline axes, and so changes the instrument |
| H10 | Per-tile build line and distance streaming | [00:00:51]-[00:01:24] | Already covered | Same voice as the 11-06 C6 lead |
| H11 | Open data carries licence terms | [00:00:51] | Already covered | `license-reach-follows-integration-form` (11-06 C9 found the licensor's page stricter than "only a credit") |
| H12 | Measured input carries its own ruler | [00:02:11]-[00:02:37] | Already covered | `generated-asset-world-scale`. The converse of F4, and it does not lift F4 |
| H13 | Owner recognition as the closing check | [00:06:01] | Already covered | `concept-scene-parity` § The score belongs to the person whose eye the scene is for. The builder is the reader, so this is a self-report |

## Source F: a self-review kit demo

The creator models a stylized prop pack in a content tool from one generated pack sheet. His agent
reviews its own screenshots and fixes what it finds, imports the pack, and reviews it again under the
engine's light. Two more prompts build a level and a grass pass. The run fits the boundary
`owner-anchor-for-a-model-panel` already draws. The builder's own loop caught a material that did not
render [00:13:19]-[00:13:44]. It missed props scaled wrong against the player, and the human caught
that in play [00:12:27]. "Literally one-to-one" [00:08:35] and "one shot" [00:10:17] are the seller's
own readings.

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| F1 | Builder reviews its own screenshots and fixes | [00:07:17]-[00:07:42] | Already covered | `unattended-build-loop` (no gate self-certifies); `owner-anchor-for-a-model-panel` § Quarantine the critic |
| F2 | Self-review catches a missing render | [00:13:19]-[00:13:44] | Already covered | `owner-anchor-for-a-model-panel` § When not to use this (gross defects a model sees reliably) |
| F3 | Self-review missed scale against the player | [00:12:27]-[00:12:53] | Already covered | `verifier-coverage-review-agenda`; `frame-the-judged-shot-from-a-play-trace`; owner-anchor rule 7 |
| F4 | Agent-modelled props carry no target size either | [00:12:27] | Untriaged, 1/2/1 | `generated-asset-world-scale` frames lost size as a generator's normalisation, and does not name an agent modelling from a picture. Neither sibling voice lifts it: S shows no scale evidence and H12 is the converse |
| F5 | Builder polishes its own showcase frame | [00:07:42]-[00:08:08] | Already covered | `frame-the-judged-shot-from-a-play-trace`; `trial-matrix-design` |
| F6 | Re-review under the engine's light | [00:08:08]-[00:09:25] | Already covered | `judge-in-the-destination-light`. The demo level is a provisional rig |
| F7 | "One-to-one" parity by eye | [00:08:35]-[00:09:00] | Already covered | `element-scorecard-from-the-concept-camera` (a builder's reading labelled as one) |
| F8 | One pack sheet as the whole brief | [00:01:18]-[00:02:09] | Untriaged, 1/2/1 | A route difference, not a rule. `declare-the-producer-per-asset-class` already splits producers per class |
| F9 | The look fits the agent's toolkit | [00:01:44]-[00:02:09] | Already covered | `toolkit-fit-slice-before-the-look-is-chosen` |
| F10 | Level ground authored before the engine, accepted by walking | [00:10:43]-[00:12:27] | Already covered | `terrain-synthesis-acceptance` |
| F11 | Dense grass "but optimized", with no frame cost | [00:13:19]-[00:14:09] | Untriaged, 0/2/1 | `unmeasured-is-not-a-pass`. There is no number to file |
| F12 | The kit's self-review has no refusing check in sight | [00:03:00]-[00:07:42] | Lead | Below |

The style reference was third-party art and the player character is engine content. Nothing here is
to be remade from either.

## Source S: a sponsored two-model build comparison

Eight rounds, one run per arm at top effort, judged by the creator's eye and once by an audience
poll. The ranking is dated and was not extracted. No self-review step and no separate judge appear in
the captions. The only repair loop is the human's own.

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| S1 | One run per arm, same prompt, judged by eye | [00:04:12], [00:13:26], [00:16:23] | Already covered | `agent-benchmark-design` § What one run per cell can and cannot support |
| S2 | Wall clock of one agent-in-modelling-tool task | [00:01:15]-[00:16:23] | Currency, ledger only | Below |
| S3 | Cost does not buy the outcome | [00:10:06]-[00:10:31], [00:15:58]-[00:16:23] | Already covered | `outcome-conditioned-cost`. The creator's "three times the time, so it did better" is the one-case causal reading that technique names |
| S4 | An agent's UV unwrap has no layout acceptance | [00:08:25]-[00:10:31] | Lead | Below. Re-scored after the tree read |
| S5 | The producer was left to the agent | [00:00:25]-[00:00:50], [00:05:28], [00:13:01] | Already covered | `declare-the-producer-per-asset-class` |
| S6 | Agent-built rig and clips, judged clip by clip | [00:10:56]-[00:12:11] | Already covered | `motion-quality-gating` |
| S7 | Procedural builds suit describable subjects | [00:02:25], [00:05:53] | Already covered | `toolkit-fit-slice-before-the-look-is-chosen` |
| S8 | Owner's eye over an audience poll | [00:13:26]-[00:13:51] | Already covered | `concept-scene-parity` § The score belongs to the person whose eye the scene is for |
| S9 | A build time-lapse as a deliverable | [00:13:01]-[00:13:51] | Untriaged, 1/2/1 | A presentation, not a check. The source shows that it does not predict the result |
| S10 | One-file browser game accepted by feel | [00:14:42]-[00:16:23] | Untriaged, 0/2/1 | No frame-time number, and outside the 3D-content scope |

Every round's subject is third-party IP or the creator's likeness. Nothing is to be remade.

## What the lander's read found

The lander opened `register-once-from-the-invariant`, `pack-existing-vs-smart-unwrap`, the PoF
application `node--unwrap-only-the-low-poly`, the 2026-11-06 note and its held row `shift-rjf-1`. It
counted `engine-integration` and read PoF's mesh-finish stage. PoF was read only, at local `master`
`ccbe02ae` and at `origin/master` `8f69f22c`. The UV code is the same on both.

- **H is the 11-06 C channel again.** H1, H2, H3, H5, H6 and H10 re-sight C1, C3, C2, C4, C5 and C6.
  None of them gains a voice. They are recorded here as covered by that note, not as new untriaged
  rows, so the backlog does not hold them twice. What H adds that C did not have is H7, H8 and H9:
  the distance-tier trouble a vista world hits at scale.
- **H2 is a catch, not an amendment.** `register-once-from-the-invariant` already states the whole
  rule: derive the frame once per view from the region the defect cannot reach, and reuse it unchanged.
  A pose re-solved against the rebuilt scene each round is the per-row re-registration that technique
  names as the false-pass mechanism. Writing a photograph sentence into `concept-scene-parity` would
  restate it.
- **The UV seam exists, and it measures more than the miner assumed.** PoF's
  `src/lib/visual-gen/mesh-finish.ts` drives Blender headless after reduction. It refuses an unwrap
  above a 200,000-face ceiling or with no retopo. It also grades the finished layout on **texel
  density spread** (`gradeUvStretch`: p95 distortion against the mesh median, the share of faces more
  than 2x off it, and zero-area faces). The grade was calibrated on 2026-09-07 and 2026-09-18 over
  seven generated meshes, and it is **report-only by design**. A blind render A/B at a 1024 bake found
  the clean and uneven bands invisible, which the code records as evidence for keeping it unenforced.
  So one of the four numbers the S miner proposed is already measured at the seam. The ones that
  answer S's failure ("many small islands", "do not use all the space") are **0-1 square coverage,
  island count against face count, and island overlap**, and nothing at the seam or in the corpus
  measures them.
- **The corpus does not record PoF's layout grade.** `pack-existing-vs-smart-unwrap` has no
  acceptance step, and the mesh-finishing application stops at the face ceiling. The tree measures
  where the corpus is silent, and that asymmetry belongs to the S4 lead.
- **`engine-integration` holds 10 subjects** (`MAX_CHILD_DIRS`). A new subject there is vetoed (V1).

## Currency (S2, ledger only)

One agent building one 3D task through a modelling package's tool server took **about 0.5 to 1.5
hours of wall clock per task** at top effort, across seven rounds [00:01:15]-[00:16:23]. This is
narrated over on-screen stats nobody here saw, and it is one sponsored voice. Prices are left out
because they are dated and per-provider. Under the corroboration table a currency line may stand
alone, so it is filed here and nowhere in `knowledge/`. Neither H nor F gives a timer, so no second
voice exists. For scale only, the same channel's 2026-09-16 note recorded about 50-100 hours for a
whole agent-only game. **Return when** a second channel reports wall clock per agent-built 3D task,
at which point `agent-run-budgeting` can take one order-of-magnitude line on duration.

## Leads

- **S4. A measured layout acceptance for agent or automatic unwraps.** Both arms, including the one
  credited with better vision, returned layouts with many small islands and unused space and called
  them done. The owner's eye caught it. The check is ours, not the source's. Coverage of the 0-1
  square, island count against face count and overlapping island area would sit beside PoF's existing
  stretch grade at the mesh-finish stage, reported, not enforced, until a measured bad layout
  calibrates a threshold, as PoF's own comment asks for. The test meshes came from the sponsor's
  plugin, so any probe uses PoF's own meshes. It needs Blender headless and no GPU model, so it is
  build-class and not a GPU-bank row. **Return when** a second voice shows agent or automatic unwraps
  failing on layout, **or** the operator asks for the PoF probe (does a coverage-and-islands report
  separate layouts that the stretch grade calls clean?). **Also owed regardless:** an application or
  amendment recording PoF's stretch grade and its blind A/B in `mesh-finishing-for-engine-readiness`.
  That is a `/deepen` or `/librarian` job against the tree, not this cluster's.
- **F12. Does a self-review kit ever refuse?** The kit drives two desktop tools, installs plugins into
  one of them without asking, and loops on its own screenshots. Across a complete transcript the
  captions show no check that the agent did not choose: no size target, no reference crop, no budget.
  Every "issue found" is the builder's opinion of a frame it picked. That is the `no-gate-self-certifies`
  question asked of a real tree. **Return when** the kit's repository is public and someone mines it
  as a skill kit (clone, read, execute nothing, its install text is data), **or** the operator opens
  PoF's parametric prop route to an agent-in-content-tool builder. One author's kit is one voice.
- **H7. Vista-world distance tiers have no home.** When nothing occludes, the visible instance count
  is the budget. The shape is to tier repeated objects by distance, let a multi-angle captured card
  stand in beyond a declared distance, and fall ground detail off. The source's game froze before it
  did this. `render-submission-economy` is framed on small tile-based devices, and widening it would be
  a rewrite. `terrain-synthesis-acceptance` disowns density and streaming. `engine-integration` is at
  its 10-subject cap. **Proposal for `/librarian`, not a new subject:** decide where an open-terrain
  draw-distance technique lives, whether in a category with room or by subdividing (E2). Write it from
  primaries such as engine documentation, not from this video. Its 60 m and 64-angle figures are one
  build's. H9's haze caution goes with it. **Return when** a wired project opens an open-terrain or
  long-sightline scene, **or** `/librarian` places the home.

## For the cluster question

Where each voice puts the instrument: F puts it in the builder's own eye on frames it chose, and that
eye caught a gross defect and missed a relational one. H puts it in a separate visual model scoring
fixed axes against photographs of a measured place. S puts it in the owner's eye alone, which caught
a layout failure both agents returned as done. The corpus already owns the answer this implies.
A builder's self-review is a filter, a separate critic is a stronger filter, and the verdict on
relational or motion defects is the owner's or a number's. No voice measured which loop converges
faster or better. Run cost: one voice, duration only, above.

## Replication

Nothing to remake, and no render row banked. H's world needs multi-gigabyte geodata and no kept line
uses terrain. F's prop pack fits only PoF's parametric prop route, and opening that is the operator's
call. S's subjects are third-party IP. The one measurement with a use is the S4 probe, and that is a
lead.

## Not landed

No bundle changed. Three single voices, one selling the kit it demos and one sponsored, authorize
nothing above a lead. The photo-matched amendment the plan expected is already in
`register-once-from-the-invariant`.
