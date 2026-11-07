---
source: batch
kind: batch
url: "youtube:i4lCE-_Uem0"
title: "Stock animation source, /shift batch of 1 video from 1 channel"
author: "1 channel: askNK"
words: 5422
extracted: 9
accepted: 0
declined: 0
leads: 1
already_covered: 2
untriaged: 5
currency: 1
dispatched: 0
applied: 0
shipped: 0
run_id: stock-animation-source-1108
siblings: 3
fetches: 4
---

# Stock animation source, mined under /shift, 2026-11-08

Plan `plan-20261107-120659`, cluster `stock-animation-source`, board run
`2026-11-07-intake-shift-plan-20261107-120659-stock-animati-22188`. One video: a second-hand
practitioner tour of a free browser clip library and retargeter (askNK, 2026-10-14, 24 min, full
transcript read by the miner). Phase 7.7: gate=skipped.

**Expected yield, stated first:** one lead, one currency row and one replica candidate, with no
upper-layer landing. The tour follows the happy path, states no operating constraints and shows no
finished scene, so the vendor pages are the extraction. That held.

**Voices:** one. K = askNK. A single-channel cluster has no convergence, so no row gains the +1.

**Admission:** the +3 accept bar holds for this shift. /intake Phase 5 Step 4 raised it after three
false positives across runs, and today's scorecard rows carry fp=1, 1, 1, 2 and 4. The lead and the
currency row ran under the corroboration table. The two boundary amendments (rows 3 and 4) were scored
under Phase 5 and land nowhere near the bar, at -1 and 0. Both are also render-bound (their home accepts
animation), so neither could land before a verdict however it scored. `auto=0/2/0 fp=0`: the miner
accepted nothing, so nothing could die at this read.

## What landed

Nothing in `knowledge/`. This note, its ledger lines, and one held replica row,
`shift-replica-r9-warden-stock-motion`. No project was touched.

## Corrections to the plan

The cluster's plan entry carried three errors. The lander confirmed each one against the tree or the
vendor page.

- **The tool is named nowhere in the corpus.** The plan says the generated-asset-to-rig-route note
  "named [the tool] only as an absent lead". A case-insensitive grep of `knowledge/`, `librarian/`,
  `.claude/` and `docs/` finds no mention of the tool or of the clip library behind it. It appears only
  in the shift's own plan, input and queue files.
- **The Warden needs the UE4 preset, not UE5.** The plan's proof says "rig.py's UE5 mannequin chains".
  R4's own `rig_warden.py` names 23 bones in UE4 mannequin form: `root, pelvis, spine_01..03, neck_01,
  head`, then clavicle, upperarm, lowerarm and hand per side, and thigh, calf, foot and ball per side.
  It has no fingers and no twist bones. UE5's mannequin carries five spine bones and two neck bones, so
  a UE5-named source misses the Warden on spine and neck by name. One oddity: R4's rig gate prints
  "binds 10/10 required chain endpoints to ue5-mannequin (derived)". That is a check of chain endpoints,
  which the two conventions share. It is not a naming match.
- **"250+" is the reviewer's number, not the vendor's.** The tool's own pages give no count. The help
  page shows a filtered "12 of 85" as an example. The library page says "120+ Animations", and its free
  tier is "60-70% of my pack". No page fetched states 250.

One more, about the dispatch: R4's `pofmetrics2.py` computes mesh metrics (watertight, winding,
extents) on a GLB. It is not a motion instrument. R4's motion measures (floor, loop closure, sole slip)
sit inline in `walk.py` lines 207-252, after the code that authors the walk. **No R4 script measures
skirt tearing.** R4 judged that by eye and lists it under `failed`. The held row therefore lifts the
measurement block out of `walk.py` into a measure-only script, and defines a tear measure that also runs
on R4's own walk.

## What the promotion read found

Miner fetches: the tool's home page, its help page and the library page. The lander re-fetched the
library page.

| Claim | Primary text | Status |
|---|---|---|
| All the clips are CC0 [00:01:48] | Tool tooltip: "The animations here are in the public domain (CC0): use them anywhere, commercially, with no attribution required." Library page: "Free to use in personal, educational and commercial projects. (CC0 License)", linked to the CC0 1.0 deed | **Confirmed for the library clips.** The tool's help page adds "hover an animation to see who made it", so the author of each clip is checked. The tool itself carries MIT notices for its dependencies. No terms page was found |
| Where the clips come from | Tool: "Those by Quaternius are from the free versions of his Universal Animation Library packs" | **The tool is a front end over a CC0 pack that can be downloaded directly.** So the replica doesn't depend on a beta browser tool |
| Export with a UE skeleton [00:02:07], [00:18:50] | Help: "Format: GLB or FBX"; presets "Default, Unreal Engine 5 (Manny or Quinn), Unreal Engine 4, Reallusion, or Mixamo"; "In place" removes travel | Confirmed. Unused by the row: a headless runner can't drive a browser tool, so it retargets the direct download in Blender |
| Runs locally [00:00:08] | Privacy: "The tools run on your computer: nothing you make is uploaded." "Share" keeps the scene's settings on the vendor's server | Confirmed, with Share as the exception |
| No account needed | Neither page mentions an account. The library page offers "Download here" and "Download on Itch.io", with Patreon as optional support. It says nothing either way about sign-in | **Unverified.** The held row checks it first and stops as a lead if it fails |
| Free tier holds an idle, a walk and a one-handed attack | Library page lists categories only: "Locomotion in 8 directions, jog, sprint, push, crawling, swimming, sitting, death animations and more", plus combat, gun and emotes. Formats OBJ, FBX, glTF for the free tier | **Unverified.** No clip names are listed. The held row checks this first too |
| The library rig fits the Warden | "a universal humanoid rig, which is compatible with Unreal Engine, Godot and Unity, ready for retargeting". Bone naming is not stated | **Unverified.** The row builds its own map from the downloaded names and stops on an unmapped required bone |

## Triage

All rows are voice K. G/R/C are the lander's scores. The miner's score is in brackets where it differs.

| # | Claim | Anchor | Shape, rule | Read | G/R/C | Outcome | Return condition or reason |
|---|---|---|---|---|---|---|---|
| 1 | A free browser and desktop tool retargets CC0 humanoid clips and exports GLB or FBX on UE4, UE5, Mixamo or Reallusion skeletons, locally | [00:01:48], [00:18:50] | lead, corroboration table | real gap (as a route) | n/a | **lead** | Returns with R9's verdict. A kept verdict makes the library a named acquire route for PoF's humanoids |
| 2 | The clip count is unstated, the clips come from one pack, and they are CC0 | description, tooltip | currency, corroboration table | - | n/a | **currency, no repo file** | Dated 2026-11-08 here. No corpus file tracks stock clip libraries, so nothing was re-dated. It binds the replica's acquisition record (row 8) |
| 3 | Check a public-domain captured library before generating idle, locomotion or generic strikes for a human-proportioned body | strip of [00:01:48] | boundary amendment to `motion-source-route-by-action-class`, Phase 5 | partial | 1/2/1 [1/1/1] | **untriaged** (-1 < 3; also render-bound) | The lander opened the file. Its "When not to use it" already says "When the project already has captured or hand-authored motion for the action". The missing boundary is that a free licensed library counts as having it. That rests on a derived reading and on no measurement, so RISK is 2. Re-enter after R9's verdict: a kept verdict is the local measurement this row lacks |
| 4 | Moving a clip from a T-pose or library rig onto a generated A-pose rig must compensate each bone's rest orientation | not in the source; derived from the Warden's rest | boundary amendment to `rig-preset-and-bone-remap-binding`, Phase 5 | partial | 1/1/1 [1/2/1] | **untriaged** (0 < 3; render-bound) | Rest pose confirmed from R4's `rig.json`: shoulder z 1.491, elbow 1.289, wrist 1.055, about 65 degrees below horizontal. The technique covers names, totality and export, and says nothing about rest orientation. `canonical-pose-rule` says "a retarget maps between skeletons that share" a rest pose. That is a reason, not a rule a different rest would make false, so it scores no refutation. R9 runs a naive local copy beside the rest-compensated transfer as a diagnostic. That is the proof this row needs |
| 5 | Layer clips by body-region mask, with a per-layer weight | [00:09:25]-[00:10:40] | technique, Phase 5 | likely catch | 1/2/2 | **untriaged** | V2 met only by training data, and standard engine practice. No seam: PoF has no engine project now |
| 6 | Derive eight-direction locomotion procedurally from one cycle | [00:20:58], [00:22:16] | lead-shaped | thin | n/a | **untriaged** | No primary on how it's done. The library itself ships "Locomotion in 8 directions" captured (lander re-fetch), which weakens the need |
| 7 | Landmark-placed auto-rig | [00:05:35]-[00:07:43] | technique | likely catch | n/a | **catch** | The binding contract is `rig-preset-and-bone-remap-binding`. R4 already fits bones to the figure from vertex slices and binds by proxy heat. Placing landmarks is a front end to that contract |
| 8 | An acquired clip needs an acquisition record | follows from row 2 | technique | catch | n/a | **catch** | The lander opened `acquired-is-not-generated`. It says to declare source, reference and licence "exactly as the source stated it at the moment of acquisition", and never to default the licence. That binds R9's provenance step |
| 9 | Prefer GLB to FBX on import | [00:03:51] | technique | thin | 0/2/1 | **untriaged** | One reviewer's import trouble, no primary. `export-proven-by-read-back` covers the discipline |

Every upper-layer row fails the bar. None is declined, and every one is banked with its anchors.

## Leads

- **CC0 capture library as the first motion route for PoF's human-proportioned roster** (row 1).
  Return condition: R9's verdict. If it is kept, re-enter rows 3 and 4 with its numbers, at Phase 5.
  Video-to-motion (R6) would then narrow to bespoke attacks and bodies a human prior can't serve.

## Held rows

One `kind: replica` row, `shift-replica-r9-warden-stock-motion`, `device: "cpu"`, banked in
`librarian/harvest/backlog.jsonl`.

- **What it makes:** R4's Warden playing a CC0 idle, walk and one-handed attack from the free tier of
  the library, retargeted headless in Blender 5.2.2 with rest compensation. Y_Bot plays the same three
  clips as the control: a professional T-pose mesh through the same retarget, so a defect seen only on
  the Warden belongs to the generated mesh, its weights or its A-pose. Where the archive holds the
  library's own skinned mesh, the clips also play on it with no retarget, as the clip's own baseline.
  R4's procedural `Walk_Loop` stands beside the stock walk, as the incumbent.
- **Use:** PoF's rig route. It ends at the lynx-bench/pof3d verdict page, since PoF's UE project is gone.
- **First, it verifies the two open claims:** that the download needs no account, and that the free
  tier holds an idle, a walk and a one-handed attack. If either fails it stops as a lead and spends
  nothing more.
- **Measures:** R4's floor, loop-closure and slip code from `walk.py`, lifted into a measure-only script
  with stance found from contact rather than from the authored phase. It adds a defined edge-stretch
  measure for the skirt, run on R4's walk too, and the striking hand's peak speed.
- **Renders:** Cycles on the CPU, as R4 did. R4's `result.json` records that EEVEE uses the card, so a
  `device: "cpu"` row may not use EEVEE. The dispatch assumed EEVEE runs without the GPU queue, and on
  that point the lander's read differs.
- **Cost:** about 30-45 min of retarget and measurement, and about 40 min of Cycles CPU. R4 rendered
  about 180 frames in about 7 min across six processes. The clips are fetched at run time, and the
  library page puts them at a few MB.

What R9 decides that R6 doesn't: R6 asks whether motion recovered from locally generated video is usable
at all, on Y_Bot and PoF's monster. R9 asks the prior question for the human-proportioned roster: whether
a free capture library already covers the basics on a generated hero. It is also the first test of a
library or T-pose source landing on a generated, steep-A-pose, 23-bone rig with a skinned skirt. It says
nothing about monsters or about motion from video.

## Phase 7.5, 8 and 9

- **7.5:** nothing landed in the upper layers, so no applied row is owed. The replica's project is `pof`
  (resolved by `loadFleet`). Its result stops at the verdict page. bp, Personas and gravitone have no
  humanoid to animate.
- **8:** no project change. No seam was proposed for code, because PoF has no engine tree to receive
  clips.
- **Proposals, not landed:** none at law, direction, XL or taxonomy level.
