---
source: youtube
kind: sponsored practitioner build-walkthrough
url: https://www.youtube.com/watch?v=q_5QS7AlNgA
title: "How to Make AI Anime from Start to Finish with Japan's #1 Platform (One Piece God Valley)"
author: Noble Goose
words: 2261
extracted: 10
accepted: 0
declined: 0
leads: 4
already_covered: 6
untriaged: 2
applied: 2
shipped: 0
dispatched: 0
run_id: anime-q5qs
siblings: 0
intake_version: 2.9.0
---

# AI anime start to finish - the first render proof

Intake 2.8.1 at Phase 0; this run wrote and then used **2.9.0** (Phase 6b, render proof), on
the operator's brief that media and game findings were landing "blindly without actually
trying to generate outputs". A source originates a finding; it never authorizes one.
Captions `vtt/en.*`, 2,261 words, read in full. Sponsored walkthrough (the platform is the
sponsor; the creator says the workflow is platform-neutral). Same author as
[rival-anime-studios](2026-09-07-rival-anime-studios.md). Board: 0 siblings.

Declared focus (round 46), both applied: read a catch cluster against its siblings, and spell
a zero two other ways. "setting consistency" returned software settings; "location
continuity" and "environment reference plate" found `reference-role-map`'s location plate.
The catch cluster is where the run's only render-bound row came from.

## Workflow recovered

1. One found image as the style reference, "our Bible, it locks everything" [00:00:25].
2. Character references before any shot: full body, plain background, style reference
   attached; one variant made by editing a canon image under the style reference [00:01:17-00:02:57].
3. Settings from the style reference; the misty island is an EDIT of the clear island [00:03:23].
4. Establishing shots ARE the setting images [00:04:14].
5. Shot keyframes composed from style + setting + character references, roles named in the
   prompt [00:04:39-00:05:30].
6. Motion from first + last frame, prompt carries motion and camera only - "I don't need to
   say 2D anime style" [00:05:56-00:06:21].
7. One reference-driven clip carrying two camera beats [00:06:47].
8. Realism-first video models give the wrong MOVEMENT for anime, not just the wrong frame [00:05:56].
9. Assembly: trim, order, layer music [00:08:03].

## Triage

| # | Candidate, anchor | Shape | Prior art | Read | Outcome |
| --- | --- | --- | --- | --- | --- |
| 1 | Style image as the locked bible, 00:00:25 | technique | `visual-style-locking/approved-reference-sheet`, `style-onboarding-from-sample` | catch | Already covered, and stricter: a found image is a draft until renders from it are ratified |
| 2 | Character sheet first, full body, plain background, 00:01:17 | technique | `reference-shows-only-invariants`; `image-to-3d-input-gating/single-subject-plain-background` | catch | Already covered |
| 3 | Setting images as a reference class, 00:03:23 | technique | `reference-role-map` (location plate, relation clause) | catch | Already covered, found on the second spelling |
| 4 | Head frame derived by editing the tail, 00:03:23 | technique | `generated-shot-sourcing` rung 3, "cut from one cloth" | catch | Already covered |
| 5 | Establishing shot = setting image, 00:04:14 | economy | `generated-shot-sourcing` rung zero | catch | Already covered |
| 6 | Keyframe from three role-named references, 00:04:39 | technique | `reference-role-map` | catch | Already covered |
| 7 | **Motion prompt without style words when anchors carry the look, 00:06:21** | reading of two laws | `style-block-restated-every-call` step 3 **vs** `generated-shot-sourcing` "the prompt asks, the anchor simply is" and `typed-input-owns-its-channel` | contradiction inside the corpus | **Render-bound -> Phase 6b.** Rendered; arms not discriminable (see round 1). No landing |
| 8 | Two camera beats in one reference clip, 00:06:47 | boundary | `one-anchor-per-clip`, `movement-motivation` | thin, n=1 platform demo | Untriaged |
| 9 | Anime needs an anime-trained motion model, 00:05:56 | routing | `generative-provider-routing/capability-to-vendor-plan` | plausible | Lead (below) |
| 10 | Parallel queue while authoring the next shot, 00:06:21 | ops | none | strip test: product feature | Untriaged |

## Render proof

**Instruments proven before scoring:** one 24 GB card, 63 GB RAM, 194 GB free on the system
drive; a local node-graph generation server with an image model taking chained reference
latents, an image-to-video model taking first and last frame on an 8-step turbo LoRA, and a
5B text/image-to-video model; ffmpeg; a 3D package for turntables. Resource discipline reused
read-only from the connected project that already runs this stack.

**Stills** - the source's pipeline on local models with the corpus's guards, original cast and
places: style anchor 75 s, character sheet 100 s, setting plate 90 s, island tail 80 s, misty
head as an edit of the tail 110 s, three-reference keyframe 180 s, follow-through tail key
95-160 s. Every image call needed a host-RAM recycle.

**Director pre-read (opinion, never the verdict):**
- Style anchor holds the attribute grammar. Character sheet shows invariants only.
- Setting plate, pass 1 (style reference admitted at 0.2): **rejected** - the anchor replaced
  the composition (its peak, its two gulls in place, its ship, sea for floor). Pass 2 (0.6 +
  named negative scope): copy gone, a sea band still replaces the floor; accepted as shared by
  every arm.
- Island tail: palette role slip, vermilion spent on lava. Misty head: composition held, mist
  under-applied.
- Keyframe: identity reads; eyes drifted amber -> red, three-quarter not profile, the plate's
  sea band leaked in.
- Tail key, pass 1 (full-strength edit of the keyframe) and pass 2 (composed with the keyframe
  at 0.3): **both rejected** - the keyframe's pose came back. Pass 3 from the keyframe's own
  references and seed with only the pose text changed: a real second pose (profile, lean,
  scarf whipping), but the arrow still nocked and the camera angle different from the head.

### Round 1 - pairs nobody could tell apart

Motion A/B at 832x480, 73 frames, 24 fps, same seed and anchors: arm A = style block + motion
beat, arm B = motion beat only; shot 1 on head + tail anchors, shot 2 on a head anchor.
**Operator, blind: tie, tie.** Motion across all four clips read as realistic interpolation.
A follow-up reel (5.8 s, smooth 24 unique fps vs held on twos) went to the operator as the
proficiency proof. **Operator:** *"The outputs are basically identical, if we want to triage we
need to experiment with two different approaches. It seems like we run two times the same
process."*

**What the director got wrong:** the style-block tie was read as a refutation of
`style-block-restated-every-call` step 3, and a boundary section was written into the technique
before the second pair. Neither pair had been discriminable. The edit was reverted with
`git restore` and never committed; both round-1 pairs are recorded as **not verdicts**. The
method gained the discrimination gate before anything else was shown.

### Round 2 - approaches, with a seed control

| Pair | between | seed floor | ratio | gate 1.5x | Operator, blind | Arm |
| --- | --- | --- | --- | --- | --- | --- |
| round 1 shot 1, style block on/off | 4.36 | 9.30 | 0.47 | refused (retroactive) | tie | not a verdict |
| round 1 shot 2, style block on/off | 5.76 | 9.30 | 0.62 | refused (retroactive) | tie | not a verdict |
| **method**: text-only vs reference pipeline | 68.98 | 9.30 | 7.42 | passes | X | **pipeline** |
| **keys**: head-only vs head + authored tail key | 26.54 | 9.30 | 2.85 | passes | X | **head-only** |

Metric: mean absolute RGB difference over matched frames (0-255); floor = the pipeline clip
against itself at seed + 1. Content-blind by design - it decides whether there are two things
to look at, never which is better.

- **method -> pipeline, `render` better.** The text-only clip was polished generic anime with
  the wrong costume, an unasked background crowd, a different gate and no plaza. The pipeline
  clip held the sheet and the bible. Every stage of that pipeline was already a catch above, so
  this corroborates and lands nothing - and it is the operator's evidence that the craft was
  understood rather than described.
- **keys -> head-only, `render` unmeasurable for rung 3.** The losing arm broke the corpus's
  one-cloth rule (tail at a different angle) and lost as the rule predicts: the clip reached the
  tail pose by mid-clip and held it, arrow never released - the prose "releases the arrow" lost
  to the typed tail. Rung 3 done properly was never tested.

**Cleanup:** after both verdicts, `render-triage.mjs clean` removed 65 paths, **71.1 MB** - every
still, clip, extracted frame and blind link, plus this run's files in the generation server's
output and input folders. The server was stopped (this run started it); no foreign job was
running. Kept: manifests, verdicts, prompts, discrimination scores.

## Leads

1. **The anchor owns the camera.** Head and tail anchors sharing one framing; prose asked for a
   slow push-in; no clip in either arm moved. Return: a pair that varies anchor framing against
   a camera prose instruction, on a second generator.
2. **A reference that shows a pose owns the pose** - as a full-strength edit and composed at
   late 0.3. Bears on `generated-shot-sourcing` rung 3, which assumes the tail can be derived
   from the head by an edit. Return: a second generator reproducing it, or an editor that
   changes pose under a pose-bearing reference.
3. **The late-admission window is per reference kind.** A whole-scene style anchor at 0.2
   replaced layout; `reference-admitted-late` was measured on identity references. Return: a
   second generator, or a plate at 0.6 that still copies content.
4. **Motion register.** The operator read every clip as live-action interpolation - the
   source's claim witnessed on the one local image-to-video model. The routing half (use an
   anime-trained motion model) is untestable here. Return: an anime-trained video model or motion
   LoRA on the machine.

Leads 1-3 share one shape - a typed input silently owning a channel the prose believes it
controls - which is `typed-input-owns-its-channel` witnessed three ways on one generator:
corroboration of a law already written, not a new one.

## Untriaged

Rows 8 and 10 above, with anchors; nobody verified them.
