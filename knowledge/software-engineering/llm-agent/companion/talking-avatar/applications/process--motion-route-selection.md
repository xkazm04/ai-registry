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

## The second hardware class and the default

The verdict was taken on one desktop accelerator. The follow-up measurement
(athena-portable `main` at `0d1baaec`, `spikes/avatar-measure/`, 2026-10-18)
ran the shipped motion path on the same desktop's CPU and on its RTX 4090
(anchors below resolve at `0d1baaec` and at `d4264003`, which added the licence
record):
`spikes/avatar-measure/README.md:14 "AMD Ryzen 7 7800X3D (8 cores / 16 threads), RTX 4090, 64 GB RAM, Windows 11, torch"`.
**Every CPU figure below is relative, not a specification:** the box was shared and
`spikes/avatar-measure/README.md:17-18 "kept it at 92-100 % busy for the whole run"`; each
row carries its load (`machine_busy_pct` in `results/`), and the bench ran at HIGH
priority class, so the figures lean pessimistic for a machine that runs only the
companion.

### Motion per sentence, CPU only and on the 4090

Warm wall time for the 3.26 s sentence (one 4 s window), median (min-max), and
real-time factor; 3 processes x 3 repetitions, n = 9 per cell, background 100 %
busy:

| config | 3.26 s sentence | RTF | cores used |
| --- | --- | --- | --- |
| CPU, 4 threads | 3.02 s (2.06-3.28) | 0.93 | 2.8 |
| CPU, 8 threads | 1.78 s (1.46-1.93) | 0.55 | 5.9 |
| CPU, 16 threads | 1.35 s (1.20-1.43) | 0.41 | 9.6 |
| RTX 4090 | 0.67 s (0.65-0.86) | 0.21 | 1.0 |

Rows: `spikes/avatar-measure/README.md:94 "3.02 (2.06-3.28)"`,
`spikes/avatar-measure/README.md:95 "1.78 (1.46-1.93)"`,
`spikes/avatar-measure/README.md:96 "1.35 (1.20-1.43)"`,
`spikes/avatar-measure/README.md:99 "0.67 (0.65-0.86)"`; the cell size at
`spikes/avatar-measure/README.md:90 "### A.1 Motion per sentence (n = 9 per cell; background 100 % busy)"`.

The cost is a step per 4 s window, so a 1 s probe predicts every sentence:
`spikes/avatar-measure/README.md:30 "**Cost is a step function of 4 s windows.**"`, with ratios
`spikes/avatar-measure/README.md:32 "3x (ratios 0.99-1.17 / 1.92-2.17 / 3.01-3.25 across configs). So one warm 1-window probe predicts"`.
The denoiser is most of it: `spikes/avatar-measure/README.md:34 "**The denoiser is 85 % of CPU time.**"`.

**Small machine: still unmeasured.** The pinned-core proxy failed under the
background load (`spikes/avatar-measure/README.md:116 "the pinned 4-core run got only 1.6 cores of CPU."`)
and the README withdraws it:
`spikes/avatar-measure/README.md:121 "**The pinned rows are not a laptop measurement and not even a good proxy on this box.**"`.
Unpinned 4 threads is the stand-in, and a real laptop is expected slower:
`spikes/avatar-measure/README.md:124 "limits, so expect it to be slower than that row. **Not verified:** any real laptop."`.

### What the viewer gets: live coverage

Coverage is the share of speech time carrying neural motion, replayed through the
shipped schedule with Kokoro (2 threads) rendering on the same CPU; 3 lines of
5 sentences per config:

| config | coverage, Kokoro live | coverage, all rendered ahead |
| --- | --- | --- |
| CPU 4 threads | 2 % | 0 % |
| CPU 8 threads | 44 % | 77 % |
| CPU 16 threads | 67 % | 92 % |
| RTX 4090 | 82 % | 96 % |
| CPU 4 threads, lean load + 10 DDIM steps | 80 % | 96 % |

Rows: `spikes/avatar-measure/README.md:154 "3.19, 3.55, 3.50"`,
`spikes/avatar-measure/README.md:152 "1.88, 2.60, 1.97"`,
`spikes/avatar-measure/README.md:150 "1.30, 1.20, 1.22"`,
`spikes/avatar-measure/README.md:148 "0.65, 0.75, 0.63"`,
`spikes/avatar-measure/README.md:156 "**CPU 4 threads, lean + DDIM 10**"`. The isolated
factors had made 4-8 threads look viable:
`spikes/avatar-measure/README.md:39 "Isolated warm RTF (0.55-0.93) made 4-8 threads look viable."`
and `spikes/avatar-measure/README.md:40 "said 2-44 % of speech got neural motion."`.

### The default-on rule (proposed, not yet shipped)

`spikes/avatar-measure/README.md:229 "Neural motion is on by default when the helper's own probe measures **W ≤ 1.0 s**"`
— W the warm cost of one 4 s window at the step count it will use. The line sits
between the 0.83 s live window that covered 80 % and the 1.36 s one that covered
67 %, with the idle probe's offset allowed for
(`spikes/avatar-measure/README.md:233 "The 1.0 s line sits in the gap between 0.83 and 1.36 with"`).
The probe leaves the voice two cores
(`spikes/avatar-measure/README.md:241 "threads to the physical core count minus 2, leaving room for Kokoro's 2."`),
times two 10-step passes, predicts the other step counts and picks from a ladder
(`spikes/avatar-measure/README.md:246 "{50, 25, 10} with W_K ≤ 1.0 s. If even W10 > 1.0 s, set motion off with"`),
and reports the choice in `caps`. Predicted outcomes: the 4090 at 50 steps, this
desktop's CPU at 25 (16 threads) or 10 (4-8 threads), a 2-core machine on
procedural motion, a real 4-core laptop near the line —
`spikes/avatar-measure/README.md:261 "0.7-1.1 s. **Not verified.**"`.

### Faster motion models

Speedups inside the current model, quality judged against the model's own
seed-to-seed gap (30 held-out sentences on the GPU; timing n = 3 at 8 threads):

- 10 DDIM steps, 3.1x faster at 0.66° head error to the default:
  `spikes/avatar-measure/README.md:189 "**DDIM 10 steps**"`, against
  `spikes/avatar-measure/README.md:47 "0.53° between two seeds of the unchanged model."`;
  roll amplitude 0.66x.
- Lean load (skip the renderer modules), identical math:
  `spikes/avatar-measure/README.md:187 "**−600 MB RAM (2.19 → 1.60 GB)**"`.
- onnxruntime, one 4 s window, n = 5:
  `spikes/avatar-measure/README.md:209 "onnxruntime is 2.5-2.7x faster than torch at 4-8 threads."`.
- Dropped: bf16 on CPU (0.5x), fp16 on CUDA (slower), no CFG (halves the
  motion), `torch.compile` (needs MSVC on Windows).

Candidate models, as the README states them
(`spikes/avatar-measure/README.md:265 "### Candidates (licences per primary sources, checked 2026-10-18; speed claims are the authors')"`):

| candidate | standing | licence as the README states it |
| --- | --- | --- |
| JoyVASA distilled into a small GRU (ours) | recommended next: 0.27 s audio encoder + 11 ms GRU per 3.26 s sentence, 4 threads | inherits JoyVASA's weight and data terms |
| JoyVASA (today) | shipped | code and weights MIT; audio encoder chinese-hubert-base, see the licence check below |
| ARTalk (2025) | fallback if the JoyVASA provenance check fails | MIT code and weights; needs FLAME, which has its own terms (see below) |
| NVIDIA Audio2Face-3D | eye channels only, if gaze becomes a priority | SDK MIT; NVIDIA Open Model License |
| Ditto, SadTalker PoseVAE, LAM-Audio2Expression, NeuroSync | not chosen | weights unstated or ambiguous; NeuroSync to check first |
| DiffPoseTalk; EmoTalk, FLOAT, audio2photoreal, TalkSHOW, BEAT-trained models | excluded | no licence / research-only / non-commercial |

Rows: `spikes/avatar-measure/README.md:303 "**0.27 s HuBERT + 11 ms GRU (4 threads)**"`,
`spikes/avatar-measure/README.md:270 "4 s windows, 50-step DDPM + CFG"`,
`spikes/avatar-measure/README.md:347 "**Hold:** ARTalk (pose and blink, MIT) as the fallback if the JoyVASA weight or data provenance"`,
`spikes/avatar-measure/README.md:348 "Consider the Audio2Face-3D eye channels only if gaze becomes a priority."`,
`spikes/avatar-measure/README.md:275 "not usable"`,
`spikes/avatar-measure/README.md:278 "excluded (non-commercial)"`.

**Licence check, verified against primary sources 2026-10-18**, recorded on
athena-portable `main` at `d4264003` in `spikes/avatar-measure/LICENCES.md`
(`spikes/avatar-measure/LICENCES.md:3 "Checked 2026-10-18 against primary sources"`;
not legal advice, two questions marked legal):

| component | code | weights | training data / other terms | consequence |
| --- | --- | --- | --- | --- |
| JoyVASA | MIT | MIT (model card `license: mit`) | "private Chinese and public English", undisclosed | usable; data provenance unknown |
| chinese-hubert-base (JoyVASA's audio encoder) | repo has no LICENSE | MIT-labelled | pretrained on WenetSpeech, downloadable "for non-commercial purposes" | **provenance risk**: a permissive weights label does not clear a non-commercial pretraining set |
| LivePortrait | MIT | MIT | its LICENSE: commercial use requires removing the InsightFace detection models | the shipped helper path does not load them |
| InsightFace buffalo_l | — | non-commercial research only | — | reached only by the spike's decoder calibration, not by the shipped helper |
| ARTalk | MIT | MIT | needs FLAME, whose academic licence forbids commercial use and redistribution; only "FLAME 2023 Open" allows commercial use | the fallback holds only with FLAME 2023 Open |
| Kokoro-82M (the voice) | — | Apache-2.0 | CC BY data credits | usable with credits |
| sherpa-onnx (the voice runner) | statically links espeak-ng, GPL-3.0 | — | — | downloading it from upstream creates no duty; bundling it needs the GPL text and Corresponding Source; the separate process keeps the host app's licence |

Rows: `spikes/avatar-measure/LICENCES.md:21 "wrapper, DiT motion generator, motion template"`,
`spikes/avatar-measure/LICENCES.md:22 "**provenance risk**"`,
`spikes/avatar-measure/LICENCES.md:23 "commercial use requires removing InsightFace's detection models"`,
`spikes/avatar-measure/LICENCES.md:11-12 "InsightFace is not reached"`,
`spikes/avatar-measure/LICENCES.md:28 "FLAME's academic licence forbids commercial use and redistribution"`,
`spikes/avatar-measure/LICENCES.md:33 "espeak-ng is statically linked into the sherpa-onnx executable"`.

What it changes: the distilled student is the project's own work, but running
it on the Chinese HuBERT at inference inherits that encoder's risk —
`spikes/avatar-measure/LICENCES.md:45 "Re-extracting its features with facebook/hubert-base-ls960 (Apache-2.0) leaves only"`
— and is retrained and re-measured. The verdict:
`spikes/avatar-measure/LICENCES.md:52 "**Keep user-installed / optional:** JoyVASA + LivePortrait, chinese-hubert-base, sherpa-onnx (GPL"`,
`spikes/avatar-measure/LICENCES.md:54 "**Never ship:** InsightFace buffalo_l, FLAME academic."`,
`spikes/avatar-measure/LICENCES.md:58 "**No blocker on the shipped path.**"`. Still open: the data
behind the JoyVASA weights, and whether WenetSpeech's term carries into the
encoder's MIT weights (`spikes/avatar-measure/LICENCES.md:63 "(legal)"`).

## Upward lessons this run gave the technique

- Detector and landmark mesh are separate gates that fail separately on
  non-human art; test both.
- A route that keeps a stylised look perfectly can still drop the speech entirely
  — "look preserved" is not "usable".
- "T1 fails to move with origami" against identical rig art shows motion quality,
  not the renderer, decided the ranking: the same rig with a different motion
  source won.
- The shipped helper loaded its motion model on `cuda:0` whenever MPS was absent,
  so "optional, runs anywhere" meant "CUDA only" until a bench hid the GPU
  (`spikes/avatar-measure/README.md:25 "**The shipped helper cannot run motion on a CPU at all.**"`):
  test with the accelerator hidden before claiming a fallback.
- Isolated real-time factors of 0.55-0.93 became 2-44 % coverage once the voice
  rendered on the same cores; the default is decided from the live replay, not the
  isolated bench.
- A distilled student of the incumbent model is the first faster model to try,
  because it keeps the channels, the retarget and the verdict; other models are
  fallbacks for a failed licence check.
- The licence check read weights and pretraining data apart from code: an
  MIT-labelled audio encoder pretrained on a non-commercial corpus was the
  finding, and it reaches the student too unless the student's encoder is
  swapped.
