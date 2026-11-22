---
source: batch
kind: batch
url: "youtube:wuH3UNajxXI, youtube:QESOBknNeu8, youtube:Mmw-ls6nc6M, youtube:zd88y8oQxPE, youtube:NViEiNQfRIM, youtube:JXxsK_mCc7s"
urls:
  - https://www.youtube.com/watch?v=wuH3UNajxXI
  - https://www.youtube.com/watch?v=QESOBknNeu8
  - https://www.youtube.com/watch?v=Mmw-ls6nc6M
  - https://www.youtube.com/watch?v=zd88y8oQxPE
  - https://www.youtube.com/watch?v=NViEiNQfRIM
  - https://www.youtube.com/watch?v=JXxsK_mCc7s
title: "Composing and continuity, operator batch of 6 videos from 6 channels"
author: "6 channels: Fox Fur Essence Films (F), Sirio (S), Andy Lo (A), Creating with Conor (C), Skai Generated (K), Noble Goose (N)"
words: 35740
extracted: 22
accepted: 0
declined: 0
leads: 5
already_covered: 9
untriaged: 6
currency: 2
dispatched: 0
applied: 1
shipped: 0
held: 0
run_id: intake-composing-1122
siblings: 0
fetches: 0
rescan_when: the operator has judged the Glass v5 single-take render; or a chain of three or more overlap continuations is rendered locally; or 8 weeks elapse (2027-01-17)
---

# Composing and continuity, mined 2026-11-22

Operator batch, run `intake-composing-1122`, 0 siblings. The question the operator set: our local H3
chains show a visible gap at every join (the room morphs, the motion stops), and nobody here knows how
finished films are composed out of clips. Find what the six videos change for the Glass reality take
(spice-c29) and later productions. The operator added mid-run: consider building scenes in 3D, and read
what the music-clip skill already tried.

Classes and expected yield, said before the table: one first-party workshop (F, 21,278 words, a live
session on local H3), one first-party build walkthrough with a hosted model (S, 8,436), three sponsored
second-hand comparisons or tool tours (A 1,117, C 2,516, K 2,161) and one finished short with no method
in it (N, 232 words of dialogue; thin by the instrument, mined by measuring its cuts). Expected: catches
against a mature subject, a few leads, no new subject. The value was expected in the apply step, and
that is where it fell.

Rules the rows ran under: upper-layer rows scored at the +3 bar (Phase 5 v2.21); leads and currency
under the corroboration table. Every upper-layer row here is render-bound, so none lands without a
rendered pair (Phase 6b). No web fetch was spent: the corroboration was this registry's own files and
two trees (gravitone's renderer and the music-clip skill, and the ComfyUI H3 node source at `63be2f9`).

## The finding that outranks the table

The Glass failure was already written down twice, and the production route ignored both.

- `generated-shot-sourcing` § The moving reference: "frame-chained scenes read as a series of restarts",
  because a frame anchor carries geometry and identity and resets pacing to zero. § A clip pinned at
  both ends: "It idles and then snaps."
- gravitone `.claude/skills/music-clip/SKILL.md` § Fast sections (Stay Here v5, 2026-11-01): "A
  different framing for the end frame causes an inner cut, even in the same place ... Draw the end
  keyframe at the start frame's distance, or leave it out."

The Glass take (2026-11-20/21) chained first-last-frame clips on a last frame, with end frames at a
different framing. Four spans dissolved, and the surviving cut stalls at each join. The seam is in the
renderer: gravitone `lib/imaging/video/comfyH3.ts` exposes only first and last frame at a fixed 124
frames. The local node already offers more, read in `comfy_extras/nodes_minimax_h3.py`:

- `length` up to 362 frames (15.1 s) inside the trained range.
- `MiniMaxH3AddGuide`: a still, or a clip of 5, 22, 39 ... frames, pinned at any frame. That is the
  workshop's overlap continuation.
- `MiniMaxH3ReferenceToVideo`: reference pictures and reference clips of 2 to 15 s.

Two earlier local runs already used them: R11 (two 362-frame ref2va takes, 2026-11-08) and Unlatched
film 5 (ref2va with AddGuide seed frames and a depth control from 3D joints, 311 frames a take,
paused 2026-11-07 on handled objects, slow identity drift and 25-minute retakes).

## What the 3D route is, from our own record

The operator asked whether building the scene in Blender or Unreal, or turning generated pictures into
a 3D world, is a way out. What the registry and the fleet already hold:

- **A 3D scene is a typed camera and blocking input, not a picture source.** `motion-plate-library`,
  law `typed-input-owns-its-channel`; operator decision 2026-10-21 (depth-controlled previs is the
  camera route). The render gives where the camera is, where the bodies stand and when the cuts fall.
  The look still comes from the video model and its references.
- **What it has fixed here:** the room held through six takes in Unlatched film 5 with an empty-room
  reference; a depth-shaded capsule body kept whole arms and a real 360-degree spin where a skeleton
  did not.
- **What it has not fixed here:** objects a character handles, slow face and hair drift across takes,
  the retake cost. R13 (agent-blocked previs, 2026-11-08): "structure solid, visual quality
  underwhelming".
- **Picture to 3D world** (notes 2026-09-04 worldlabs-atlas, 2026-09-07 rodin-worldgen): the world is
  a splat field built from one picture or panorama. It is static and only ever seen: no characters, no
  physics, light baked in, detail falling away from the source view. It serves as a background plate
  with an exact camera, or as the depth source for a control pass. Nothing local generates one today;
  the local mesh generator makes objects, not rooms.
- **Where 3D answers the Glass failures directly:** the mirrored room between two drawn keyframes
  (every keyframe drawn over one blockout shares its geometry), and the crane over the sofa that H3
  could not perform unguided (a depth control clip carries the move).

## Triage

Voices: F workshop, S 3D control, A cost test, C model comparison, K coded shorts, N the finished short.
G/R/C per Phase 5; a render-bound row cannot land before its pair, whatever it scores.

| # | Voice | Candidate | Anchor | Outcome | G/R/C | Why |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | F | A seamless take continues from a span of overlap frames, never from one last frame | [00:20:06]-[00:20:32], [00:34:50]-[00:35:16] | Already covered; **applied** | catch | § The moving reference, continuity carry. Applied below on Glass |
| 2 | F | Each continuation degrades because the overlap frames outnumber the references; pin a full-quality keyframe as the last frame of every second extension | [00:56:35]-[00:58:18] | Lead | 2/2/2 | Corpus says re-supply what scrolled out; the end-pin reset is new. Return: a local chain of three extensions, with and without the reset |
| 3 | F | Never grade a clip that a later clip continues from: the grade compounds down the chain | [00:32:43]-[00:33:08] | Untriaged | 1/2/1 | Boundary on § The anchor imports its maker's texture ("the import is also the lever"). Source prose only |
| 4 | F | A timed beat at the head of a continuation is ignored; force the audio with leading silence | [01:33:54]-[01:34:45], [02:02:56]-[02:04:14] | Lead | n/a | One model, one session. Return: a local continuation with dialogue |
| 5 | F | Block a 12 s generation into three cuts, render it three times, cut from the best of each | [01:05:25]-[01:06:17] | Untriaged | 1/2/1 | In-clip cuts and the beat floor are covered; picking per cut across takes is not |
| 6 | F | A generated frame of a place becomes the reference for every later angle of it; low resolution is fine | [00:46:24]-[00:48:37] | Already covered | catch | § pinned bank; § angle library |
| 7 | F | Across a cut, the previous shot's last frame is a blocking reference, not a first frame | [00:20:06]-[00:21:23] | Untriaged | 1/2/1 | "Prefer references over frame anchors" covers the rule, not this use |
| 8 | F | Test a hard prompt at low resolution before the full render | [01:01:30]-[01:01:55] | Already covered | catch | `resolution-as-stage-property`; draft mode closed by the operator |
| 9 | F | A turbo adapter at full strength cooks skin; realism wants more steps and less adapter | [00:03:54]-[00:04:19], [00:09:07]-[00:10:23] | Lead | n/a | Our routes run 4 and 6 steps on pruned int8 weights. Return: a steps and adapter-strength pair on one Glass shot |
| 10 | F | Half the work is finishing: room tone, a warm grade, glow, hand shake | [00:25:17]-[00:27:01], [01:23:26]-[01:25:38] | Already covered | catch | 2026-11-05 finishing pairs came back ties; Front Row Job shipped with a dub and bed |
| 11 | F | A bad seam cannot be hidden by blur, zoom and retime; regenerate | [01:46:35]-[02:02:56] | Already covered | catch | § Clip caps: a seam nobody chose |
| 12 | S | A reference clip carries the camera and the body motion alike; replace figures with limbless pills that mark place, facing and path | [00:15:52]-[00:19:19] | Untriaged, convergence | 3/1/2 | Second voice on 2026-11-19 row S1/D2, and film 5's capsule body agrees. Scores +2. Render-bound: owed a pair |
| 13 | S | A layout still is copied down to its scenery; strip it to outlines and put the place in words | [00:28:23]-[00:30:54] | Untriaged | 2/2/1 | Boundary on `storyboard-grid-conditioning`. Hosted model only |
| 14 | S | A reference clip lands every cut on its frame; a frame sheet drifts half a second | [00:34:00]-[00:35:19] | Untriaged | 2/2/1 | One hosted model, nine cuts, one scene |
| 15 | S | An empty plate gives the most natural bodies and loses their placement | [00:14:11]-[00:15:27] | Untriaged | 1/2/1 | Other half of row 12 |
| 16 | S | Have the agent describe the built scene in words and send only the words | [00:35:19]-[00:36:12] | Lead | n/a | Unmeasured by the source |
| 17 | A | Real cost is list price times tries, counted per model | [00:03:00] | Already covered | catch | law `cost-per-usable-output` |
| 18 | A | Upscaling sharpens and cannot fix a face or lips; render small only on a model that gets those right | [00:04:43] | Already covered | catch | operator route: low resolution then x2 |
| 19 | K | Check three single frames against the keyframes before the full render | [00:06:21] | Already covered | catch | `verify-cheapest-artifact-first` |
| 20 | K | Hand the builder the keyframes as the answer key and have it measure them | [00:03:47]-[00:04:38] | Already covered | catch | `reference-shows-only-invariants`, style measured not named |
| 21 | N | A finished six-minute generated short is cut fast: 154 shots, mean 2.4 s, median 1.7 s, 88 under 2 s | measured, scene threshold 0.30 at 360p | Currency | n/a | A statement about one film. Twelve shots run over 5 s; two of those are titles |
| 22 | C | In a hosted comparison H3 gave the glossiest picture of three | [00:03:06] | Currency | n/a | Sponsored, one prompt each |

Auto: 0 accepted, 6 untriaged, 0 escalated. Row 12 is the nearest to the bar and is held for its render.

## Applied: Glass reality take, one generation (render mode)

- **Seam:** gravitone `foundry-out/.../spice/2026_10_23_4_c_29/oner/` and `lib/imaging/video/comfyH3.ts`
  (first and last frame only, 124 frames).
- **A:** the v4 take, three first-last-frame clips chained on real last frames (14.4 s).
- **B:** `run-v5.py`, one ref2va generation of 362 frames at 704x1280, the opening frame pinned at
  frame 0 by `MiniMaxH3AddGuide`, the cat and the room as reference pictures, timed beats in the prompt,
  camera fixed at the glass.
- **Target:** no stall and no morph anywhere in the take. **Floor:** the cat and the room stay the same
  from the first frame to the last, and the take still ends on the raised paw.
- **Chosen to falsify:** a 15 s generation could lose the action order or the cat. If it does, the
  single-take answer is wrong for this scene and cuts are the route.
- **Rendered 2026-11-22:** seed 7201, 1312 s on the GPU (A's three clips took about 1520 s). One seed.
- **Director's pre-read, opinion only:** B carries all six beats in order and the cat never stops. The
  model placed one five-frame dissolve at frames 108 to 113 (4.5 s), where it moved closer to the sofa;
  the last 10.3 s are one unbroken move. The camera did not hold at the glass as briefed, and the
  background behind the counter differs between the opening and the end. In the cut the dissolve is
  replaced by a hard cut. So: joins that stall 2 -> 0, in-clip dissolves 0 -> 1.
- **Verdict:** owed by the operator, on the review page (A and B takes, both full cuts). Until then the
  row reads `unmeasurable`: the instrument is the operator's sighted pick.

## Leads

- Row 2, the quality reset. Row 4, forced audio at a continuation head. Row 9, steps against adapter
  strength. Row 16, words from the built scene.
- **A geometry-true keyframe set.** Draw every keyframe of a scene over one 3D blockout so two angles
  cannot disagree about the room. Return: the next scene with more than one camera position.

## Directions not proposed

None written. The renderer change (frame count, guides and references in `comfyH3.ts`) is coverage, and
waits for the operator's verdict on B before it is made.
