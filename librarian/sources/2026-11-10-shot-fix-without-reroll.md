---
source: batch
kind: batch
url: "youtube:9-Gv7NoHHio, youtube:HJteqahyEKM"
title: "Shot fix without re-roll, /shift batch of 2 videos from 2 channels"
author: "2 channels: AIQUEST; The AI Brief"
words: 2755
extracted: 19
accepted: 0
declined: 0
leads: 3
already_covered: 11
untriaged: 3
currency: 1
dispatched: 0
applied: 0
shipped: 0
run_id: shift-shot-fix-without-reroll
siblings: 1
fetches: 0
---

# Shot fix without re-roll, mined under /shift, 2026-11-10

Plan `plan-20261109-152922`, cluster `shot-fix-without-reroll`, board run
`shift-shot-fix-without-reroll`. The question: how do you fix or lift a shot you almost like without
rolling it again, on which local route, and when does the fix go on the clip rather than the prompt?
Two videos, read from cached captions only, nothing on screen watched. A = AIQUEST (a sponsored demo
of a hosted canvas, 1,416 words). B = The AI Brief (a creator demoing his own local two-pass H3 graph,
1,339 words). No fetch, no GPU, no download. Phase 7.7: gate=skipped.

**Expected yield, stated first:** catches in `video-assembly` and `review-iteration-loops`, one or two
leads, nothing to remake. That held.

**Voices:** two channels, no sign either relays the other. They converge only on draft-then-refine,
which `resolution-as-stage-property` already owns, so the convergence lands nothing. **B's row 1 is a
second voice on an existing lead** (the 2026-11-06 tiled-sampler note, row 2), recorded there and not
opened again here. A does not make a third voice for it: its "480p draft, upscale the keeper" is a
pixel-side promotion on a hosted tool, not a latent refine, and it never shows the upscale.

**Admission:** the +3 bar governed 2 scored rows (B1 at 2/2/1, A10 at 1/2/1), and neither clears it.
`auto=0/2/0 fp=0`: neither miner accepted anything.

## What landed

Nothing in `knowledge/`. This note, its ledger lines, and a second-voice line on the 2026-11-06 lead.
No project was touched; gravitone was read only.

## Source A: the hosted canvas demo (`youtube:9-Gv7NoHHio`)

Second-hand practitioner review, sponsored (affiliate link and plan offer [00:08:06]-[00:08:32]). The
demo half shows 3D blockout, depth extraction, character sheets, a 480p draft and a full-clip edit. The
operating half is nearly absent: at [00:01:05] the creator promises "the timing adjustment I still
needed to make", and it never appears. In the proudest segment [00:07:03]-[00:08:06] the full-clip edit
swaps setting and prop while keeping the fight; the creator concedes it is not a local edit and checks
nothing else that moved (identity, footwork timing, framing).

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| A1 | Edit the clip, keep its motion | [00:06:38]-[00:08:06] | Already covered | `motion-plate-library` § The binding pass; `partial-regeneration-seams` § Kept material is referenced |
| A2 | Masked edit for a targeted change (named, not shown) | [00:06:38]-[00:07:03] | Already covered | `partial-regeneration-seams` § The edit pass is itself lossy, composite when the tooling allows |
| A3 | Draft at 480p, upscale the keeper | [00:04:30]-[00:04:55], [00:06:13] | Already covered | `resolution-as-stage-property`. Its test, whether a draft's verdict survives promotion, gets no evidence: the upscale is never shown |
| A4 | Agent-built 3D blockout as the motion guide | [00:01:56]-[00:04:55] | Already covered | `motion-plate-library` § The plate. The operator closed R12 and R13 on 2026-11-08 |
| A5 | Timed sections in one long prompt | [00:02:22]-[00:02:48] | Already covered | `generated-shot-sourcing` § the beat floor. The unshown timing fix is what the beat floor predicts; an unshown fix is not evidence |
| A6 | Depth from an existing clip drives new characters | [00:04:55]-[00:06:38] | Already covered | `motion-plate-library` § The plate, live footage source |
| A7 | One-click character sheet for more views | [00:05:47] | Already covered | `approved-reference-sheet` |
| A8 | Link each reference to its part of the prompt | [00:03:39]-[00:04:04] | Already covered | `reference-role-map` |
| A9 | Look preset instead of lighting prose | [00:04:04]-[00:04:30] | Untriaged | A vendor UI convenience. Nearest rule: `style-block-restated-every-call`. Not checked whether a preset counts as a restatement |
| A10 | Leave camera controls off when the guide sets the camera | [00:04:30] | Untriaged, 1/2/1 | Plausible, n=1, untested: it shows that double-specifying was avoided, not what happens if it is not |
| A11 | Local clip-edit route at a rough stage | [00:08:06] | Lead | Below |

Not extracted: prices, credits, plan offer, model names and versions; "output length follows the
motion reference's length" (one host's behaviour). The opening chase and the fight use a third-party
character and a third-party fight clip; nothing is to be remade from them.

## Source B: a two-pass local H3 graph (`youtube:HJteqahyEKM`)

A showcase half (00:00 to 05:28): four "standard against secret workflow" side-by-sides, every one
judged by the creator, with nothing shown to match seeds, prompts or step budgets. An operating half
(05:28 to 09:10): a settings walkthrough of his own graph, a first pass on the ref2v 4-step turbo LoRA
at about 0.5 scale ("not a universal number"), then a latent upscale feeding a second pass to "recover
additional detail", with a detail LoRA at 0.5 and a people-realism LoRA at 1.0. No times, seeds or
measurements. The second pass refines the first pass's latent, so layout and motion carry over, but it
runs always-on: **no step reviews the draft before the refine is paid for, and nothing fixes a chosen
clip.**

| # | Candidate | Anchor | Outcome | Prior art and reason |
| --- | --- | --- | --- | --- |
| B1 | Latent-upscale refine is a third promotion route, between a pixel upscale and a fresh re-sample | [00:07:38]-[00:08:57] | Untriaged, 2/2/1 | `resolution-as-stage-property` § Promotion, not regeneration names only the two ends. Strip test survives: *a latent refine keeps the draft's composition and motion and re-samples texture, so a draft review holds for layout and motion and not for faces and fine surface.* G: boundary 1 +1 convergence; R: the H3-specific behaviour rests on prose. Second voice on the 2026-11-06 lead, row 2 |
| B2 | Counter motion softness with a detail adapter at half strength | [00:06:19]-[00:06:46] | Lead | Prose only. Return when a kept H3 line is flagged soft at delivery |
| B3 | Fix waxy skin in the model with an adapter, not only in post | [00:06:46]-[00:07:11] | Lead | The corpus answer is grain in post (`default-look-attractor` step 6). The operator has praised the current look, so this is not the live gap. Return if plastic skin is flagged on a kept line; post grain is the cheaper first arm |
| B4 | A creator's side-by-side as a verdict | [00:01:05], [00:02:23], [00:03:13], [00:04:11] | Already covered | `trial-matrix-design`; the operator's blind pick is the verdict |
| B5 | A reference sheet locks identity | [00:02:48] | Already covered | `reference-admitted-late` |
| B6 | First-pass scale is a VRAM knob | [00:08:04] | Already covered | `resolution-as-stage-property`, the draft rung |
| B7 | The graph's parts: a merged H3 checkpoint, two LoRAs, a 3D latent upscaler | [00:05:28]-[00:08:57] | Currency, ledger only | One more public H3 workflow ships a two-pass graph. None of the four parts is on disk; no download proposed |
| B8 | Local open weights match hosted realism (cold open) | [00:00:08] | Nothing | Marketing, no comparison shown |

Not extracted: the "physics engine" label, the influencer-clip test (no mechanism, and synthetic people
presented as real gives the fleet no use), the calls to action, and the free-workflow framing (nobody
read the workflow file's terms).

## What the lander's read found

The lander re-read the gravitone seam (read only, at `407f0aec`) and the machine's model folders. No
web fetch.

- **The seam is real, and it has no fix step.** gravitone's Production walks `hero -> rough -> proven`.
  A `rough` take renders one H3 clip per board beat (at most five), every clip on the take's one seed,
  then cuts them into one rough video. Takes are appended and never replaced, and each new take gets a
  new seed. So a rough take whose motion is right and whose look is wrong has exactly one route today:
  a new take, which re-rolls every beat, or a `hero` take of that beat's panel, which re-rolls that
  beat at the next seed. Nothing edits or re-conditions a clip that already rendered.
- **No local video-edit model is on disk.** The video models present are H3 fl2va and ref2va (int8),
  their 8-step and 4-step turbo LoRAs, the LTX 2.5 distilled transformer with its own x2 latent
  upscaler, and the H3 Fun ControlNet union patch. The plan's statement holds.
- **The nearest local route is a re-sample, not an edit.** A geometry estimator that yields depth is on
  disk, and depth-controlled ref2va has run on this machine (2026-11-08 previs note). So a kept rough
  clip's own depth could drive a ref2va re-render with new references: the binding pass of
  `motion-plate-library`, aimed at our own take instead of a blockout. It re-samples everything the
  plate does not pin, which is exactly what `partial-regeneration-seams` says to diff. Untested here.
  The operator's R12 and R13 closes were about previs from a blockout, not about fixing a kept take.
- **The 2026-11-06 lead's blocker has narrowed.** That note's return condition was a ComfyUI upgrade. A
  side-by-side ComfyUI 0.44.2 install now exists beside the production one (backlog row
  `shift-ph3-keyframes-1`, 2026-11-09) and carries `MiniMaxH3LatentUpscaleWithModel`. What is still
  missing is the H3 3D latent upscaler model: the latent-upscale folder holds only LTX's.
- **A does not add a voice to B1**, as stated above. Dedupe is by channel, and the draft-then-refine
  ladder is already corpus content.

## Leads

- **A11. Local clip edit at the rough stage: change setting and prop, keep the motion.** The rule is
  owned (`motion-plate-library` binding pass; `partial-regeneration-seams` composite). The missing piece
  is a local route at the seam above. **Return when** a local video-edit or restyle model is on disk (a
  download is the operator's call, at night), **or** the operator flags a kept rough take whose motion is
  right and whose look is wrong, at which point the depth-plate re-sample above is the first arm to try
  against a new take. **It would decide** whether gravitone's `rough` stage gets a fix step before a
  re-roll is priced. **The test must measure what the source skipped:** diff what the edit was not asked
  to change (identity, timing per beat, framing) against the kept clip.
- **B2** and **B3** as in the table, each with its return condition.
- **2026-11-06 tiled-sampler row 2** (not a new lead): now two voices, neither measured. Return when the
  H3 3D latent upscaler is on disk; ComfyUI 0.44 is no longer the blocker. The proof's shape, if banked
  then: arm A the kept rough take re-rendered at delivery size on the same seed and conditioning; arm B
  the same take, latent upscale x2 plus one refine step, stock ref2va and turbo LoRA only; read wall time
  and whether a draft review of layout and motion still holds after the refine. `render.use`: gravitone
  Production rough-to-final promotion.

## For the cluster question

Draft then refine is owned. Neither source answers "fix the shot you almost like": A's edit is hosted
and unchecked, B's refine is always-on and fixes no chosen clip. On this machine the fix goes on the
prompt today, because the seam has no clip-level step and no edit model exists. Both leads above name
what would change that.

## Replication

No banked row. A's finished work is previs (closed by the operator on 2026-11-08), a depth-driven fight
from a third-party clip, and a hosted clip edit with no local model to remake it. B's is generated
dialogue close-ups judged by their maker, and remaking it needs four missing parts. No `render.use`
survives for either.

## Not landed

No bundle changed. Two single voices demoing hosted or self-judged work authorize nothing, and the one
boundary row (B1) is held at 0 against the +3 bar until the 11-06 proof runs.
