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
| t4 rig + learned motion | same as t1 | `spikes/avatar/t4-hybrid/README.md:120 "4-7x realtime warm"`, peak 1.3 GB VRAM, load 6-15 s; the spike also wrote `spikes/avatar/t4-hybrid/README.md:103 "the motion latency is at least 4 s"`, corrected below |
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

## Correction: the window was never a live blocker for this voice

The first version of this record carried the director's caveat that t4's
four-second analysis windows "put a floor of four seconds under any live use",
making t4 "an offline, per-utterance source". That was wrong for this voice.
Kokoro, run through sherpa, renders each sentence whole before it plays, and the
daemon renders sentence n+1 while sentence n plays; the motion for a sentence is
computed from its finished WAV while the one before it is heard. The window is a
floor only for audio streamed before its sentence is complete.

Measured on the shipped product path by the operator, 2026-10-18, RTX 4090, real
Kokoro and the real face helper, one 3-sentence 7.2 s line, 2 rounds (n = 6
sentences): mouth timelines 41-94 ms per sentence; JoyVASA motion 0.57-0.75 s per
~2.5 s sentence warm; first audio delayed by < 0.1 s (the mouth timeline only);
every motion event arrived; every timeline ended exactly on its sentence's last
sample. The per-sentence detail and its citations are in
[python--per-sentence-face-sidecar](./python--per-sentence-face-sidecar.md).

What stands from the caveat: "without being GPU demanding" holds for playback
only. Motion still needs the model resident (about 1.3 GB VRAM in the spike), and
procedural motion still owns idle, listening, thinking, the first moments of a
line and every fallback. The standard (report both columns) stays.

## The product that shipped

The verdict became athena-portable's ADR `docs/adr/0120-athena-has-a-face.md`,
landed on `main` at `350419a0..d5bb49cd` (2026-10-18; anchors resolved at
`d5bb49cd`). The rig is t1's renderer in the app,
`apps/desktop/src/avatar/glow.ts:386` "gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);";
the motion is layered as the verdict asked,
`apps/desktop/src/avatar/driver.ts:15` "3. **Neural motion.** When `signal.motion` is set it takes the head, the gaze and (unless its";
and the motion model is optional, `docs/adr/0120-athena-has-a-face.md:95` "The motion model runs in a separately configured Python env (the face helper, `face.python`);".

## Pending: the second hardware class and the default

The verdict was taken on one desktop accelerator. A measurement track is running
now and its results belong here; no figure is assumed until it lands:

- motion per sentence on CPU only — *pending*;
- motion per sentence on a small machine — *pending*;
- whether motion is on by default, and on which hardware — *pending*, to be
  decided from the two rows above, not from the 4090;
- faster motion models against JoyVASA on the same lines and retarget — *pending*.

## Upward lessons this run gave the technique

- Detector and landmark mesh are separate gates that fail separately on
  non-human art; test both.
- A route that keeps a stylised look perfectly can still drop the speech entirely
  — "look preserved" is not "usable".
- "T1 fails to move with origami" against identical rig art shows motion quality,
  not the renderer, decided the ranking: the same rig with a different motion
  source won.
