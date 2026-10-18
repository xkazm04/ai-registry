---
layer: application
type: application
subject: talking-avatar
technique: motion-route-selection
stack: process
status: forged
verified_on: 2026-10-18
---

# Three routes, one bench, one owner's verdict — a desktop companion's avatar spike

The athena-portable avatar spike (branch `worktree-spark-athena-avatar`, commits
`bd555b58..b3c1643a`, 2026-10-17/18) asked how premium a talking companion could
look and move from ONE generated still, with open tools and its own code on one
desktop RTX 4090. Three tracks ran in parallel against one contract and rendered
the same three lines in the companion's real voice. All figures below are from
that one machine on those two days; n is stated where it matters.

## The procedure as run

- **Fixed inputs, one contract.** One portrait per bench, three lines (`calm`,
  `question`, `long`), 1920x1080, a timeline and a per-frame parameter shape
  shared by every track: `spikes/avatar/CONTRACT.md:8 "Outside the pnpm workspace"`.
  Metrics omit unmeasured keys rather than writing zero:
  `spikes/avatar/CONTRACT.md:97 "**Absent values: omit the key**"`.
- **One accelerator job at a time.** Every CUDA command ran under a lock:
  `spikes/avatar/CONTRACT.md:38 "## The GPU rule"`.
- **Licences first.** The neural track's table found the research-only face
  detector inside an otherwise Apache-2.0 model:
  `spikes/avatar/t2-neural/README.md:138 "InsightFace det_10g / 2d106det (inside Ditto release)"`.
- **Drivability on the real art.** The operator's portraits were not human (a
  fibre-optic owl, B04; an origami crystal bust, D08). Each neural model was
  checked per portrait: `spikes/avatar/t2-neural/README.md:92 "d08 x Ditto (patched)"`
  (box detector accepted it at 0.77, the landmark mesh rejected it and crashed the
  stock run; a neutral eye fallback made the mouth seam move, modestly),
  `spikes/avatar/t2-neural/README.md:93 "d08 x FlashHead Pro 768"` (look kept,
  mouth facet never moved), `spikes/avatar/t2-neural/README.md:94 "b04 x Ditto"`
  (no detector fired; a forced box smeared the main eye-light).
- **Blind bench.** `spikes/avatar/bench/build_compare.py:4 "random letter. The page plays a line's entries side by side in sync"`
  — names and metrics hidden until Reveal, the letter map kept in `_blind.json`.

## What each route cost

| Route | Playback (1080p) | Motion generation |
| --- | --- | --- |
| t1 rig + procedural | `spikes/avatar/t1-rig/README.md:109 "fps p50 59.9 / p5 59.5-59.9, CPU 0.5-0.8 % of 16 cores"`, GPU process 128-130 MB | none |
| t4 rig + learned motion | same as t1 | `spikes/avatar/t4-hybrid/README.md:120 "4-7x realtime warm"`, peak 1.3 GB VRAM, load 6-15 s, and `spikes/avatar/t4-hybrid/README.md:103 "the motion latency is at least 4 s"` |
| t2 neural, live candidate | `spikes/avatar/t2-neural/README.md:37 "Ditto **patched** (ours)"`: 26/21 fps paced, flat ~1.0 s lag, 1.6 GB resident | inside playback |

## The verdict

The operator ranked the blinded clips and wrote (2026-10-18, recorded in the
spark idea note `.spark/Spark/ideas/athena-avatar.md`, a vault file outside git):
"T4 seems to have superior movement without being GPU demanding. T1 fails to move
with origami. T2 seems to be comparable in origami but I don't like the resources
usage. For Athena Portable I would use T4."

That is the technique's rule "when two routes look comparable, the cheaper one to
run wins" applied by the person who owns the decision, and the rule "when the art
is non-human, the rig is the main route and learned motion enters through the
parameter seam" confirmed on n = 2 portraits.

## Deviation recorded

The phrase "without being GPU demanding" holds for playback only. The director's
caveat, recorded beside the verdict: generating t4's motion needs the learned
motion model on the accelerator (about 1.3 GB VRAM) and its four-second windows
put a floor of four seconds under any live use, so t4 is today an offline,
per-utterance source. Procedural motion still owns idle, listening, thinking and
the live fallback. The standard (report both columns) stays; this record is the
second column.

## Upward lessons this run gave the technique

- Detector and landmark mesh are separate gates that fail separately on
  non-human art; test both.
- A route that keeps a stylised look perfectly can still drop the speech entirely
  — "look preserved" is not "usable".
- "T1 fails to move with origami" against identical rig art shows motion quality,
  not the renderer, decided the ranking: the same rig with a different motion
  source won.
