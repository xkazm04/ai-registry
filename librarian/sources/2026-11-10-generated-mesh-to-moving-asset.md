---
source: batch
kind: batch
url: "youtube:CgslUZIAl4s, youtube:mbBNQXuJ6_I, youtube:Sm-qbwf8W6U"
title: "Generated mesh to moving asset, /shift batch of 3 videos from 2 channels"
author: "2 channels: Stefan 3D AI (two videos, one voice); AdvancedSkeleton"
words: 6477
extracted: 38
accepted: 1
declined: 0
leads: 6
already_covered: 14
untriaged: 12
currency: 3
dispatched: 0
applied: 1
shipped: 0
run_id: shift-generated-mesh-to-moving-asset
siblings: 1
fetches: 3
---

# Generated mesh to moving asset, mined under /shift, 2026-11-10

Plan `plan-20261109-152922`, cluster `generated-mesh-to-moving-asset`, board run
`shift-generated-mesh-to-moving-asset`. The question: how does a generated mesh become a game-ready
asset that moves, and which steps can be skipped? The decision under it: bake high to low or derive
maps from colour, and where the motion comes from. Three videos, read from cached captions only.
Nothing on screen was watched. Miners spent 3 web reads (one search, the project page, the upstream
README), all on the third video. No GPU, no render, no Blender run, no download. pof was read only,
at local `ccbe02ae` and at the remote tip `8f69f22c0`. Every file cited below is byte-identical
between the two. Phase 7.7: gate=skipped.

- **C** = `youtube:CgslUZIAl4s`, "From Idea to Game in ONE Day with AI - Fastest Character Workflow"
  (2,436 words). A sponsored practitioner build walkthrough: a stylised RTS unit, high-to-low bake
  dropped, maps derived from the colour atlas.
- **B** = `youtube:mbBNQXuJ6_I`, "You Can Now Make Hyper-Realistic 3D With AI - Full Workflow"
  (2,942 words). A sponsored build walkthrough by the same creator: a hyper-real creature, colour and
  normal baked from the generator-textured high poly, property maps derived.
- **M** = `youtube:Sm-qbwf8W6U`, "MotionBricks" (1,099 words). A rigging-tool vendor demos its own
  button that wraps a third-party learned motion in-betweener inside a DCC.

**Expected yield, stated first:** catches against a mature `mesh-finishing-for-engine-readiness`, one
boundary on bake against derive, and a currency signal plus a lead on in-betweening. The catches held.
The boundary stayed the operator's. The landing came from the seam read, not from a video.

**Voices.** C and B are one channel, already in twelve earlier notes, so they are **one voice** and
lift no earlier row of their own. M's channel appears in no earlier note. It is the cluster's second
voice and touches only the motion half, where C's motion row (generated video as a keying reference)
does not overlap it. **No row in this cluster has two voices.**

## What landed

- **Correction** to `game-production/.../mesh-finishing-for-engine-readiness/techniques/texture-pass-must-consume-the-bake.md`,
  § When the round trip does not exist at all. The paragraph said generator-textured and bench-baked
  are disjoint product lines: "an asset either comes back coloured from the generator and never
  receives a bake ... Nothing crosses." Now it says that nothing the bench has finished can go back to
  the texturer, but colour reaches the bench's mesh one way. The generator colours the dense source,
  and the high-to-low bake carries colour and relief together from that one surface. Bake albedo only,
  with lighting excluded. What that road cannot do is re-colour after the bake. The commissioning-time
  routing key and the commitment it makes are unchanged.
- **Application** `node--texture-pass-must-consume-the-bake` re-verified (`verified_on: 2026-11-10`,
  `node@26` from the `@types/node` pin the doc names as its witness). A correction paragraph carries
  six `path:line "quote"` anchors into pof's bench, 6 of 6 held by `check-anchors.mjs`. Its false
  sentence, "it never produces both from one asset", is replaced. The `not-better` verdict and the
  return condition stand: the texturer still takes only its own task ids, re-read in
  `tripo-skins.ts`.
- **Currency** in [2026-09-15-motionbricks-cpp-realtime-animation](2026-09-15-motionbricks-cpp-realtime-animation.md):
  its `rescan_when` fired (human checkpoint and interaction primitives shipped, date fallback reached).
  So did its lead 1, and pof's impact-map reconsider trigger fired on the same event. The note gained a
  "Rescan clauses decided" section. pof's re-adjudication is pof's write.

### Why the correction cleared the bar

The evidence is pof's tree, and B only originated the row. B's miner read pof and scored it
3/2/1: GAIN 2 (inverts a stated rule) +1 (refutes the corpus), RISK 0 (tree opened) +2 (rewrite).
The lander re-ran the rewrite test as the gate states it: *do the file's existing sentences stay
true?* Every sentence that is true stays true. The one sentence replaced was already false in the
tree it was first written from: the bench's `diffuse` bake is the albedo pass, and it ran in pof's
own recorded blind A/B. Narrowing a sentence that the tree contradicts makes no standing truth
false, so the +2 does not apply. **Re-scored 3/0/1, accept.** V2 passes on code read in a connected
tree, plus training-data convergence: texture the dense or scanned source, retopologise, then
transfer albedo and normal is long-standing practice. **Phase 6b considered:** the home is
render-bound, but this row changes no generator instruction and no acceptance rule. It corrects
which tool's output can reach which stage, and that is observable only in code. The operator has
already looked at this route's output in pof's own blind pair over a 1024 diffuse bake. **The operator
may read this as a rewrite and revert.** The wording sits in one paragraph and in one application.

## Triage

`G/R/C` per Phase 5, accept at G-R >= 3 and G >= C. Leads and currency rows ran under the
corroboration table. The miners' reports hold full anchors. Rows here are kept to the ones with an
outcome other than "covered".

| # | Row | Shape | Read | G/R/C | Decision |
|---|---|---|---|---|---|
| B-M1 | Generator-coloured dense source, and the bench bake carries the colour across | correction | real gap | 3/0/1 (miner 3/2/1) | **accept**, landed above |
| C-C1 | Bake or derive is decided by the closest screen size the asset is ever seen at, not only by the kind of detail | amendment | partial | 2/4/2 | **untriaged, the operator's.** It rewrites `luminance-heightfield-normal-derivation`'s "the provenance, not the fidelity, is what decides". The creator draws his own line across C and B (derive for a far-camera stylised unit, bake for a hyper-real close-up). That is one voice drawing a boundary, not convergence. pof's monsters-bake route stands |
| C-C2 | Deriving maps from an unwrapped atlas is not deriving from a tile: island borders are edges, so wrap-around sampling writes relief along every seam | technique (stage) | real gap | 2/1/2 | **untriaged.** Homes: `tiling-texture-acceptance` derive techniques (both assume a tile, "Sample with wrap-around at every edge") and the `mesh-finishing-for-engine-readiness` hand-off. No fleet tree derives from a mesh atlas today, so there is no live defect |
| C-C12 | Correct agent animation with a demonstrated pose, not a description | technique | thin | - | untriaged, same voice as 09-30 row 7 |
| C-C13 | Render a VFX concept as a small timed visual before building | technique | partial | - | untriaged, same voice as 09-30 row 1 |
| B-M2 | An estimated property map is wrong per semantic region (roughness on the eyes) | amendment | likely catch | 1/2/1 | untriaged |
| B-M5 | Per-part face targets (about 1M dense, about 3K reduced) | currency numbers | dated | - | untriaged, numbers banked |
| B-M6 | Joints concentrate the defects of retopology, texture and bake | amendment | thin | 1/2/1 | untriaged |
| B-M10 | Fine hair as one card scattered on the same UV | technique | thin | - | untriaged |
| M-M2 | A join between two motions is accepted on velocity continuity at the seam, not on poses meeting | technique | real gap | 3/0/2 (miner 3/1/2) | **cleared the score; held by the render clause** (below) |
| M-M3 | Fill a gap from both neighbours where they came from different producers, rather than splice | amendment | partial | 2/1/1 | untriaged. It folds into M-M2's join-route list if M-M2 lands |
| M-M5 | Keep the generated fill on its own layer so a re-roll never edits a source clip | technique | likely catch in part | - | untriaged for the non-destructive half |
| M-M6 | A generated layer may land in another control space (FK against IK) and add a second seam | amendment | thin | 1/2/1 | untriaged |

Covered (14): C3, C4, C5, C6, C7, C8, C10, C11; B-M4, B-M9, B-M11, B-M13, plus B-M7 and B-M12 as
same-voice re-sightings of the 11-10 S4 and 11-06 S1 leads with no lift. C9 re-sights the 09-20
assembling-agent lead (human 12 minutes against the agent's one to two hours) with no lift.
**Currency (3):** M-M1 (below); B-M14 and B-M15 (a generator ranking on organic subjects, an
agent-driven bake taking about 2.5 minutes), ledger only. **Nothing:** C15, M-M8.

`auto=1/7/0`, `fp=0`. Eight rows were scored. B-M1 was accepted on the lander's re-score, not by a
miner. M-M2 was the one miner accept, and it did not die at this read. It cleared at 3/0/2 and is
held by Phase 6b.

### M-M2: why it holds and does not land

The rule is real in pof's tree. `src/lib/motion-gate/loopClosure.ts` grades velocity as its own axis
("Poses can match exactly while the clip still stutters, so this is a separate axis"), with pass and
warn bands of 15 and 50 mm. pof's fix-path spec measured both endpoint pins closing the pose to
0.0001 mm while the seam velocity jump stayed at 29.28 mm. One velocity-matched frame halved it to
15.73 mm. The fetched README conditions the in-betweener on four context poses, not one. pof's
`pof_npz_concat.py` joins combo clips with only root XZ re-anchored and no seam check. Re-scored:
GAIN 2 (new technique, `motion-quality-gating` is outside `librarian-scan`'s top 15) +1 convergence
(pof's measuring run and this vendor's demo reached it apart), RISK 0 (the lander opened
`loopClosure.ts` and the spec). It clears.

**But its home accepts animation, and the row changes how a clip is accepted.** The 2026-11-06 run
held a foot-contact measure in this same subject on exactly that clause
([2026-11-06-generated-asset-to-rig-route](2026-11-06-generated-asset-to-rig-route.md)). This run
does the same. The owed verdict is sighted: does a join that passes on pose and fails on velocity read
as a hitch? **No held row is banked:** no clip exists to run it on. No ARDY `.npz` is on this machine,
whether in the pof tree or the user data folders, and no ARDY checkout is installed. pof records ARDY
generation on another machine's desktop card, about 15 GB of VRAM, with a gated text encoder. A CPU row with no input would sit in the bank
unrunnable. Working wording, for when it lands: (1) accept a join, whether a loop seam, a clip-to-clip
splice or a generated in-between, on the velocity jump across it, graded apart from pose distance;
(2) a pose pin makes poses meet and leaves velocity free, so carry velocity with context frames;
(3) join routes in order: one continuation from the producer (`self-conditioned-supply`), a fill
conditioned on both neighbours (M-M3), then a splice with the seam measured; (4) a linear crossfade
is the null arm.

## Leads (6, each with its return condition)

1. **Bake against derive at pof's gameplay camera distance** (C's remake). Arms on one original
   generated creature: the bench bake (current route), a luminance derive over the atlas with
   island-bounded sampling, and image-model maps from the same atlas. Stills at gameplay distance and
   one close-up, with the bake arm as the positive control. `render.use`: pof monster map route.
   **Banked as a lead and not as a held row:** `notBefore` takes a time, and this row waits on an
   answer. *Return when* the operator says whether pof monsters are ever seen close. If they are
   always close, drop it. If they never are, bank it as a held GPU row against TRELLIS.
2. **An image model estimating property maps needs a legible atlas** (B-M3, one sentence). *Return
   when* the operator wants roughness on monsters (pof's bench bakes it today; the inverted-luminance
   heuristic and a hosted estimate are the arms), or a second voice shows region-aware estimation on an
   atlas working or failing.
3. **View-projected texture repair** (B-M8): inpaint a region from a chosen view, then project it back
   into the map. *Return when* a hero close-up shows a colour miss the bake carried, or an open tool for
   it is on disk.
4. **A timeline-imposed gap against the in-betweener's own duration** (M-M7). The model picks 0.6 to
   1.9 s per generation, and the integration lets the user pick the gap. *Return when* a join method
   is measured (lead 5).
5. **Seam metric at every join pof's concatenation makes** (M-M2's application). Run the existing
   velocity-jump measure at each join in a `pof_npz_concat.py` output, graded against the clip's
   within-clip p95, and journal it beside `POF_SECTION_STARTS`. Before: 0 joins measured. CPU only.
   `render.use`: pof combo join method for `characters::Combat Anim` montages, and M-M2's sighted
   verdict. About 20 minutes of CPU once clips exist. *Return when* two ARDY clips of one character
   are on this machine's disk, or the ARDY machine runs the measure. The 09-15 note's splice incident
   (bones at 78 m) is the first join to read.
6. **Learned in-betweener as a third join arm** (M's remake): hard join, ARDY regeneration with both
   ends pinned plus a velocity-matched frame, and the in-betweener on its human checkpoint
   retargeted through pof's existing SOMA-to-Mixamo hop. *Return when* a runtime check shows the
   upstream ONNX or TensorRT path runs on Windows ARM64 (upstream is tested on x86-64 only), and the
   operator clears a night download of the weights. Licences: Apache-2.0 code, open-model-agreement
   weights, evaluation-only sample motions (none used).

## Currency

**M-M1:** the in-betweening model's full release is public, with a human (SOMA) checkpoint beside
the robot one, an Inbetweener demo and proxy-keyframe smart primitives. It runs on TensorRT and was
tested on x86-64 only. The project page gives no release date. Primaries fetched by the miner: the
project page and the upstream README. pof already holds a SOMA-to-Mixamo retargeter in its
skin-tokens toolchain, so the retarget gap the 09-15 note named is one untested hop.

## Against the operator's routes

Weapons TRELLIS, monsters bake, props parametric: **unchanged.** B agrees with monsters-bake and
shows pof's bench already does the transfer. C's derive route applies to a far-camera stylised unit,
and pof has given no camera evidence that would move a monster onto it (lead 1). Motion:
video-to-motion stays closed (11-08). An in-betweener conditions on clips pof already makes, so that
closure does not cover it. Nothing here reopens either verdict.

## Applied (Phase 7.5)

One row owed, for the correction. The seam is pof's mesh-finish bench, and it was chosen to falsify:
if the bench could not bake colour from a generator-textured source, the original sentence stood. It
can, and it already runs the corrected route, including the albedo-only pass. Verdict `COVERED` at a
code read. No arm was run and nothing in pof changes. The probe that the technique's central step
needs is still unrunnable here, because the texturer takes only its own task ids.

## Not extracted

C's game segment and B's offline macro render (showcase, nothing about the asset route). Product names
for the agent and the image model (dated and garbled in captions). Every bake or map claim from M (the
video has none). The vendor's sample character and mocap clips (not ours, not used). C's description
promises "the real cost" of a character, and the captions give only timings: 12 minutes assembly, a
few hours to a textured model, about two hours of agent animation.
