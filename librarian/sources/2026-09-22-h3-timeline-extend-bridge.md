---
source: h3-timeline-extend-bridge
kind: first-party practitioner build-walkthrough (video)
url: https://www.youtube.com/watch?v=kqP09NfJXaQ
title: "Mini Video Editor Timeline Node for H3! - Extend, Prepend, Bridge, Cut, Loop & Upscale"
author: ChanonDevs (OBVPM)
words: 10041
extracted: 12
accepted: 2
declined: 0
already_covered: 5
untriaged: 3
leads: 3
dispatched: 0
applied: 1
shipped: 0
run_id: intake-kqP09
siblings: 1
---

# An extension that has to arrive is a different problem from one that continues

A developer walks through a community node pack they built for an open-weights
video model: a one-track timeline where clips are generated, extended forward,
prepended backward, bridged between two clips, looped, cut on the model's latent
grid, and finally refined at a higher resolution as one sequence. The tour half
shows the UI. The operating half, the part worth mining, is what broke while they
built it: backward extension would not converge with a mask alone, per-clip refinement
changed the detail at every seam, and the tail's motion kept overruling the prompt.

## Class and expected yield

A **first-party practitioner build-walkthrough**. The author built the thing, so
the operating half is a first-party account, n=1, with its failure modes paid for.
The demo half is a tour. **Expected yield, said before the table:** mostly catches
against a video-assembly subject that already treats extension as a budget, one or
two operating-half findings, and no fetch needed for the first-party claims. The
fetch is spent on the one claim with a primary literature behind it.

Board at Phase 1: one live sibling (`intake-4B8_TjUlcQ`, holding
`media-generation/research-grounding/evidence-bound-visuals`). A third
(`intake-mimo-v26`) joined during Phase 4. Neither held a subject this run touched.

Declared focus carried in from the scorecard: (1) the formula-term hunt, (2) say
the expected routing count before routing, (3) re-check a reference file's open
questions. (1) produced row 4 (the window as a subtrahend). (2) is n/a, because a
video has no design record. (3) is n/a: no memory-lane reference was used.

## Corroboration

- **Code read in a tree.** This machine's model install confirms two source
  claims. Durations snap to a `17k+5` frame grid, which is the source's "17
  frames per latent":
  comfy_extras/nodes_minimax_h3.py:34 "while n % 17 != 5:".
  The model's trained arrival channel is keyframe conditioning at a resolved
  frame index, and that is the channel the source found it had to add before a
  prepend would converge:
  comfy_extras/nodes_minimax_h3.py:135 "if last_frame is not None:" (the last frame is then attached at
  index frame_count - 1) and
  comfy_extras/nodes_minimax_h3.py:147 "cond = node_helpers.conditioning_set_values(cond, {".
- **Fleet tree.** The consuming project's video README records the opposite
  failure of the same quantity. A clip "ARRIVED by 40% of its length; every frame
  after is the same picture being repainted", and pinning `first_frame ==
  last_frame` "reduced the motion to a slow breath". The source records the
  short-span failure; the fleet records the long-span one.
- **Fetch 1 of 3.** `arxiv.org/abs/2302.08113`: "a new generation process ...
  that binds together multiple diffusion generation processes with a shared set
  of parameters or constraints". Its per-step closed form is the normalised
  weighted average the target subject already computes. Fetches 2 and 3 were
  not spent.

## Triage

Upper-layer rows ran under the v2.5 score. Currency and leads ran under the
corroboration table.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Refine windows in lockstep, one division per step | se/backend-platform/model-workflow-contracts/windowed-inference-over-oversized-inputs | new-technique | real gap | 3/0/2 | **accept** |
| 2 | K | amendment | M | A backward or bridging extension is an arrival: target through the keyframe channel, span sized to the travel | mg/production-ops/video-assembly (generated-shot-sourcing) | corrects-claim | real gap | 3/1/2 | **accept -> render proof (Phase 6b)** |
| 3 | K | amendment | S | The tail's momentum outvotes the prompt; move the seam, not the prompt | same | new-technique | partial | 1/2/1 | untriaged |
| 4 | K | amendment | S | The conditioning window is paid from each call's output; a bridge pays it twice | same (the extension-channel section) | corrects-claim | partial | 1/0/1 | untriaged |
| 5 | K | technique | M | Keep the pre-decode state beside the accepted clip; a re-encode is lossy at the seam | same, and review-iteration-loops/partial-regeneration-seams | new-technique | partial | 2/1/2 | untriaged |
| 6 | K | amendment | S | Reset chained drift with a fresh root and a bridge into it | review-iteration-loops/partial-regeneration-seams | none | likely catch | - | already covered |
| 7 | K | - | S | Accept a continuation by watching it across the joint | video-assembly; sound-effect-generation/loop-seam-acceptance | none | likely catch | - | already covered |
| 8 | K | - | S | Keep the generating settings with the output; restore by diff | generated-shot-sourcing ("Provenance travels with the clip") | none | likely catch | - | already covered |
| 9 | K | - | S | Iterate cheap, then refine once | review-iteration-loops; the cost-per-usable-output law | none | likely catch | - | already covered |
| 10 | K | - | S | Assemble by stream copy; invalidate the preview on any edit | video-assembly/cut-compiled-from-source | none | likely catch | - | already covered |
| 11 | - | lead | - | An open-weights video model now has community timeline nodes with latent-mask extension, prepend, bridge and loop | - | dates-application | - | - | lead |
| 12 | - | lead | - | A browser's looped playback stutters at the wrap; the file may be seamless | - | none | thin | - | lead |

Rows 1 and 2 are the only upper-layer rows above the +2 threshold. Row 4's RISK
is 0 because the director re-checked the arithmetic (5.88 s generated - 4.25 s
kept = 1.63 s = 39 frames at 24 fps, the stated window). It still caps at GAIN 1,
because a boundary case is not a new mechanism. Row 5 is blocked on
source-prose risk alone. Its promoting question is "does
partial-regeneration-seams already own a stored-original rule that covers the
latent state?" Answered by one read: it owns the rule for *edits* ("every edit
applies to the stored original"), and the latent sidecar is the same rule one
representation lower. The row stays untriaged, and its note names that neighbour
as the home to amend.

## Row 1 - landed

`step-synchronous-windows`, a new technique in
windowed-inference-over-oversized-inputs. The subject's reassembly rule
("performs the division exactly once, after the last window") is correct for a
one-pass model and produces a detail seam for an iterative one: two windows run
window-major commit to different detail in their overlap, and blending two
confident, different answers makes a crossfade. The source's failed attempt, a
per-clip refine handed the previous clip's tail latents, is the handoff repair
the technique names and rejects, because it constrains geometry and not detail.
The step-major order, one division per step, canvas-level noise and the
residency cost are all written against the subject's own techniques. Home chosen by the
subject's opening boundary statement ("this subject owns that reassembly: the
window schedule, the blending rule"), not by the source's domain.

**Applied:** unapplied. No fleet project runs a multi-step model over overlapping
windows. The consuming project's chain lane has the handoff shape, but its clips
are deliberate hard cuts, which is the technique's own "when not to use".
Return condition: a project adds a tiled or context-windowed refinement pass (a
sequence upscale, a panorama, a long-clip refine).

## Row 2 - render proof (Phase 6b), and what landed

**Instruments proven before scoring.** A local node-graph server at 0.33.0 on
one 24 GB card, with the model's first-and-last-frame checkpoint (fp8) and its
8-step turbo adapter present. The first launch failed while loading the text
encoder (`HostBuffer.read_file_slice failed`) at 125 of 127 GB commit. The
largest holder was an Ollama `llama-server` (PID 41004, 30 GB, started
2026-09-21 15:32, `ollama ps` empty). **The operator authorized stopping it**,
commit fell to 98 GB, and the relaunch ran clean. Recorded here so a sibling
that relied on that process can trace it.

**Scenario and positive control.** The consuming project's own continuous
head-turn shot (an original character in an original location), whose first
and last frames this stack had already rendered legibly in 73 frames.
Countable expectation: one woman, one continuous shot, ending turned toward
the light shaft.

**Arms.** One variable, span: 22 / 73 / 175 frames, at 672x384, 8 steps, sampler
`res_multistep`, seeds 770425 and 424242. Identical prompt for every arm:

> Medium shot. She stands still and turns her head slowly toward the shaft of
> light, chin lifting. The camera holds. Dust drifts through the beam. One
> continuous shot, no cuts. The subject is <the project's character clause>.
> The setting is <the project's location clause>. Photographic, 35mm cinema,
> natural skin texture, no text, no watermark.

Wall clock: 45-100 s per clip, six clips.

**Discrimination.** span-short (73 vs 22): 0.88x; span-long (73 vs 175): 1.16x.
Both are below 1.5x, and `render-triage.mjs sheet` refused all four pairs. Per
v2.12 the operator was shown a blind look page anyway, with the ratios printed.

**Director's pre-read (opinion).** 22 frames: a fast, continuous turn with no cut
(largest step 1.4-1.6x median). 175 frames: it holds near frame 1 for about 120
frames, snaps between frames 120 and 133 (a 3.0-3.9x median step), then holds.
Every arm reached the target frame (0.016-0.017 mean absolute distance).

**Operator's picks (blind).** span-long: the 73-frame span on both seeds. That
overrules a refused 1.16x, and it is consistent 2/2. span-short: the 22-frame
span on seed 1 and the 73-frame span on seed 2, a split. My first question
asked for one answer across two differently shuffled pairs, which made the
answer unreadable. The pairs were re-asked one seed at a time, and this split
is the result of the re-ask. The mistake was the director's.

**Verdict mapping.** Split across pairs means a scoped amendment. Long side:
`better` for the travel-sized span. Short side: `unmeasurable` at this n and
ratio. **The source's own claim, that too short a span makes the bridge cut, did
not reproduce for a small travel. That is the corrected premise.** The failure
it located is real and lives on the other side: surplus span is spent standing
still, then snapping. The consuming project's README had found the open-ended
form of the same thing.

**Landed:** a section in generated-shot-sourcing, *A clip pinned at both ends is
paced by the model, not by its span*, plus two `use_when` entries and the
application `python--generated-shot-sourcing.md` (`applied: render`,
`ab_verdict: better`, `grader: operator`). **Not landed:** "an arrival must go
through the end-frame channel; a mask alone does not converge". Every arm used
the keyframe channel, so that half was never rendered. It is lead 13.

**Cleanup.** After the verdict: `render-triage.mjs clean` removed 18 paths, 159.2 MB (the run-id output folder and the staged inputs). Kept: manifest, verdict, metrics and prompts in the run scratch until Phase 9.

- **13 (lead).** A backward extension or bridge built only from masked pixels,
  without the model's end-frame channel, converges near the target but with a
  visible change (source, n=1, [00:34:28]-[00:35:44]). The install's arrival
  channel is keyframe conditioning (anchored above). Return condition: a
  latent-mask extension node on this machine, which allows a render pair of
  mask-only against mask plus keyframe on the same travel.

## Untriaged - nobody verified these

| # | Title | Anchor | Why unscored higher |
| --- | --- | --- | --- |
| 3 | The tail's momentum outvotes the prompt; cut back before extending | [00:24:33]-[00:26:41] "when it sees the character is about to walk off the frame, it lets the character walk off" | n=1, source prose. The corpus's "briefed from the output" adapts the brief to the clip; this adapts the clip (the extension point) to the brief. Home: generated-shot-sourcing, beside partial-regeneration-seams' *excise an interval*. |
| 4 | The window is a subtrahend: kept = generated - window; a bridge or loop pays two windows | [00:21:31]-[00:22:22], [00:42:18]-[00:43:11] | Formula-term hunt: generated-shot-sourcing names the window's reach ("how deep the window reaches") and not its cost. Arithmetic re-checked. GAIN 1 caps it. |
| 5 | Keep the latent state and the conditioning beside the clip, deleted with it | [00:29:18]-[00:32:44], [00:52:47]-[00:54:34] | partial-regeneration-seams owns "apply to the stored original"; this is the same rule for the pre-decode state, and the source shows the re-encode as a visible lighting step at the seam. |

## Already covered

- **6** Chained extension degrades; reset with a fresh root and a bridge.
  partial-regeneration-seams: "each generative pass re-encodes what it touches"
  and "every edit applies to the stored original". A convergent sighting, and
  the bridge is one more way to return to an original.
- **7** Acceptance across the joint. The result preview plays the previous and
  new clips merged; loop-seam-acceptance already makes "listen across the joint"
  the acceptance test, and generated-shot-sourcing treats seams as edit points to
  gate.
- **8** Settings snapshot in the output: generated-shot-sourcing "Provenance
  travels with the clip". The source's restore-clobbers-newer-presets gotcha is
  app-level, not a standard.
- **9** Low-res iteration, then one refine pass: cost-per-usable-output, and
  review-iteration-loops' draft economics.
- **10** Stream-copy assembly: cut-compiled-from-source.

## Leads

- **11 (currency).** An open-weights video model with first/last-frame
  conditioning now has community nodes for latent-mask extension, prepend, bridge
  and loop, plus a step-interleaved windowed refine. The core install on this
  machine carries keyframe conditioning and no mask extension node. Return
  condition: when the consuming project's H3 lane needs a continuation longer than
  one span, re-read this node pack's tree (clone it, Phase 2b) rather than the video.
- **12.** A browser video element's loop wraps with an audio stutter the file
  does not contain (the author verified it in an NLE timeline). Return condition:
  when a project's acceptance step for a looped asset is "play it in the browser".

## Directions

n/a. A video has no design record.
