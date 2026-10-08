---
source: youtube:BKDrtzJktO0
kind: practitioner build-walkthrough (tour-dominant, vendor demo half) + operator dispatch ("research and forge path of music clips making for existing audio tracks")
url: https://www.youtube.com/watch?v=BKDrtzJktO0
title: Suno v6 + Seedance 2.5 is NUTS at Making AI Music Videos
author: Dan Kieft
words: 4751
extracted: 16
accepted: 5
declined: 0
leads: 4
already_covered: 7
untriaged: 0
dispatched: 1
applied: 2
shipped: 1
run_id: intake-1005-bkdr
siblings: 0
---

# The track is somebody else's clock: a music-video subject, forged from one tutorial's failure case

A 24-minute creator tutorial for one generated music video (song, three
characters, sets, angles, lip sync), plus an operator dispatch asking for the
whole path of making a video for a track that already exists. The corpus had no
such path. Zero documents mentioned lip sync for a generated performer; the three
neighbours that put audio first (`cue-first-assembly`, `audio-first-beat-pacing`,
`music-spotting-against-picture`) all leave the audio a choice or run the other
direction.

## Class, and the expected yield said before the table

**Practitioner build-walkthrough**, tour-dominant, with a vendor demo half (one
platform hosting several generators, promoted throughout). Expected yield
declared at Phase 2: *catches on everything the tour shows (angles, character
sheets, sets), and the operating half concentrated where something went wrong
for the creator*. It was. The one segment that is a first-party failure account
(a performer lip-syncing to ad-libs and to the instrumental intro, fixed by
exporting the lead vocal stem) carried the run's only render-bound technique.
The segment the source was proudest of (fifteen hard-cut angles from one
generation) is, as the class predicts, where its boundary is missing: the model
places its own cuts, on its own clock.

Container: 4,751 words over 23:30 is an honest caption count. No repository
(`routing=n/a`). 0 siblings on the board at claim. Local `main` was 46 ahead and
25 behind `origin/main`; `origin/main` was read for the media-generation
taxonomy (it adds two data-video subjects, none in `production-ops`).

Declared focus from the scorecard (build arm A's first fixture from the source's
own named examples): applied. The render fixture rebuilds the source's own
failure case (an instrumental intro and an ad-lib from a second voice around
the lead lines), not a paraphrase of it.

## Triage

Rule per row: upper-layer rows scored (G/R/C), currency and leads under the
corroboration table. The XL row is the operator's dispatch (E4 met by the
invocation itself).

| # | Candidate | Anchor | Shape | Prior art | Read | G/R/C | Outcome |
|---|---|---|---|---|---|---|---|
| 1 | Condition the singer on the isolated stem of their own voice, not the mix | [00:21:49]-[00:22:40] | technique (render-bound) | none | real gap | 4/0/2 | **lead** after the render proof (operator: B on full clip, tie on both close-ups; no seed control) - draft banked in `librarian/handoffs/2026-10-07-performer-stem-conditioning-draft.md` |
| 2 | Pass the audio reference as video with a black picture, not audio-only | [00:21:49] | lead | none | thin | - | lead (vendor slot behaviour; strip leaves nothing) |
| 3 | Song first, then picture | [00:02:10] | catch | cue-first-assembly, audio-first-beat-pacing | likely catch | - | already covered |
| 4 | Beat first, then remix to genre with lyrics via audio reference | [00:03:01]-[00:04:44] | catch | music-prompt-composition/reference-track-anchoring | likely catch | - | already covered (and out of scope: track is final) |
| 5 | Face, then outfit, then a sheet from close-up + full body | [00:05:09], [00:08:36] | catch | character-identity-continuity/reference-shows-only-invariants | likely catch | - | already covered |
| 6 | Let the video model invent simple sets; image plates for control | [00:10:17]-[00:11:33] | catch | video-assembly/generated-shot-sourcing | likely catch | - | already covered |
| 7 | Angle vocabulary (low, high, dutch, ground, overhead, OTS, profile) | [00:12:50] | catch | cinematic-language/camera-position-semantics | likely catch | - | already covered |
| 8 | One generation, fifteen hard-cut angles | [00:16:15]-[00:17:32] | design | generated-shot-sourcing (angle-library probe) | partial | 3/1/2 | landed in XL as coverage-across-the-phrase's counter-case (scouting pass) |
| 9 | Keep a visual anchor so fast cuts do not distract | [00:18:23] | design | none ("eye trace" absent corpus-wide) | real gap | 3/1/2 | landed in XL as cut-rate-follows-the-section |
| 10 | Movement vocabulary; add shake in post | [00:18:49]-[00:19:15] | catch | cinematic-language/movement-motivation | likely catch | - | already covered |
| 11 | Restyle a clip video-to-video to keep its camera move | [00:19:40] | lead | generated-shot-sourcing | thin | - | lead |
| 12 | One-shot 30 s promo; audio reference capped near 30 s | [00:20:05]-[00:20:56] | design | platform-format-adaptation (derived short) | partial | 3/1/2 | cap landed in XL as segment-on-the-master-clock; promo cut = catch |
| 13 | Clip duration must match what was prompted | [00:15:23] | design | duration-and-tempo-locking (music side only) | partial | folded | folded into segment-on-the-master-clock |
| 14 | Draft at a low setting, then generate high | [00:14:57] | catch | draft-resolution ladder (batch 4) | likely catch | - | already covered |
| 15 | "The model doesn't matter, only your taste" | [00:06:53] | lead | generative-provider-routing | thin | - | lead: contradicts measured routing; nothing to land |
| 16 | Operator dispatch: the whole path for an existing track | - | XL subject | none | real gap | E4 | **forged**: music-video-production |

`auto=4/0/1`, `fp=0` (no auto-accepted row died at Phase 6).

## Design count and the XL trigger

Rows 1, 8, 9 and 12 share one HOME IF NEW (a music-video subject). Four design
candidates with one home fire the XL trigger mechanically, and the operator's
dispatch asked for the same subject. Spec: `librarian/specs/2026-10-05-music-video-production.md`
(EXECUTED). One forge worker, about 10 web calls (2 over its budget of 8).

## What landed

`knowledge/media-generation/production-ops/music-video-production/`: golden path
and five techniques (`track-map-before-treatment`, `form-follows-what-the-track-gives`,
`segment-on-the-master-clock`,
`coverage-across-the-phrase`, `cut-rate-follows-the-section`) and one gravitone
application. Worker overrides accepted: stack `next` not `node` (the envelope
needs the browser's offline audio renderer); seek-stable-composition-authoring
cited for frame-index determinism only; the scouting counter-case already owned
by generated-shot-sourcing, so technique 5 adds only the music-video consequence;
technique 3 narrowed to shots with a readable mouth (the primary says the
accompaniment drives head, expression and eyes) - and then withdrawn after the
render proof, below. The golden path carries the stem question as an open
question with the measurement, not as a rule.

**Collision, recorded so it is legible later.** On 2026-10-06 at 10:09 a sibling
session committed this run's uncommitted files as found (`a9c6b31e`, "NOT written
by this session") so an `origin/main` merge could fast-forward, and pushed them.
The render-bound technique therefore reached `origin/main` about 15 hours before
its verdict. This run's own commit removes it; it was on the remote, unverified,
in between.

Director's verification: the singing-face paper (arXiv 2303.14044) re-read in
full, and its ablation sentence confirmed verbatim ("the generated mouth
movements are severely disrupted by the background music (e.g., the mouth still
keeps open during silence)"). The worker's fetch-summary citation was replaced
with the verbatim quote. All 32 application anchors resolved by
`check-anchors.mjs`. Purity grep against the source's vocabulary clean.

Render-unverified surface (generator instructions outside technique 3, stated so
a later render proof can find them): technique 4's handles generated against the
master's audio and "next longer duration over stretching"; technique 5's
"identical slice for every setup"; technique 6's re-framing at brief time.

## Fleet

One tree carries a music-video discipline: gravitone, on the visualizer rung (one
poster, a baked envelope, audio-reactive effects). Its envelope has bands, flux,
onsets and tempo candidates, and no sections, bar grid or vocal map
(structural-only, recorded in the application).

The seam hunt was the second source again: the export re-normalized every master
with a single-pass dynamic normalizer. **Experiment, paired, n=1 synthetic
fixture**, section loudness by ebur128: master contrast 8.2 dB, single-pass 2.7,
two-pass linear 3.0 (falls back to dynamic when the gain would breach the peak
ceiling, so the comment's named upgrade would not have fixed it), copy 8.3 at
-18.1 LUFS, peak-capped linear gain 8.2 at -16.7 LUFS / -1.0 dBTP. Whole-track LRA
moved only 8.5 -> 8.8 and does not see it. Verdict `better`; shipped on gravitone
branch `intake/1005-peak-limited-gain` (`970252f` + ledger row `d37f2f1`), cut from
`origin/main` because the local checkout was 145 behind. Not merged, not pushed.
The finding was written back into the golden path's delivery section.

## Leads

- **Audio reference as a video track with a black picture.** The source says it
  syncs better than an audio-only reference on its engine. Return condition: a
  local engine with both slots (one exists: the reference-to-video model's
  `ref_video` + `ref_video_audio` slots) and a render pair holding everything else
  fixed.
- **Video-to-video restyle preserving an approved camera move.** Return condition:
  a second independent source, or a local video-to-video route to render it.
- **"Model choice does not matter, only taste."** Contradicts measured routing in
  `generative-provider-routing`; nothing to land. Return condition: none - recorded
  so it is not re-proposed.

## Render proof

Instruments proven before scoring: the reference-to-video model with its turbo
LoRA (4 steps, 832x480, 124 frames at 24 fps), standalone `<Audio 1>` reference
slot; reference face = an original character from gravitone's consistency lane.
Fixture rebuilt from the source's own failure case (declared focus): instrumental
0-1.3 s, female lead 1.3-2.8 s, a second MALE voice ad-libbing 2.9-3.7 s, female
lead 3.8-4.9 s; synthetic beat, OS speech voices. One variable: arm A = the full
mix as `<Audio 1>`, arm B = the isolated lead stem. Identical prompt both arms:

> Use <Picture 1> as the reference for the woman's face, hair and clothing. She is
> the singer of <Audio 1>. Static medium close-up: she faces the camera and sings
> <Audio 1>, her lips forming its words in time with it; whenever <Audio 1> carries
> no voice her lips stay closed. The camera holds. [setting clause] Photographic,
> 35mm cinema, natural skin texture, no text, no watermark.

- **Positive control (B alone, first):** mouth closed through the intro, moving on
  both lead lines, closed through the ad-lib gap and the tail. The model does sync
  to a reference audio track. 58.5 min.
- **Arm A:** 39.1 min (second attempt; the first died with ComfyUI under memory
  pressure, and the session's background shells were reaped by the harness).
- **Metric, declared before arm A existed** (dark-pixel fraction in a
  face-detected mouth ROI, mean per interval), A / B: intro 0.039 / 0.041, lead1
  0.065 / 0.062, **ad-lib 0.064 / 0.036**, lead2 0.132 / 0.138.
- **No second seed rendered** (operator chose to stop after arm A to spare the
  machine), so there is no discrimination ratio, and the pair may not author a
  landing. Sheet built with `--allow-indistinct`, the caveat printed on it.
- **Operator, blind:** shot1 (full clip with the master mix) -> X = **B (stem)**;
  shot2 (mouth crop, ad-lib window at half speed) -> tie; shot3 (mouth tiles every
  4th frame) -> tie.
- **Director's pre-read (opinion):** the mix arm opens late in the ad-lib (around
  frame 84) where the stem arm stays closed; nothing else differs visibly.
- **Verdict mapping:** `unmeasurable` at n=1 without a precheck. The direction
  agrees with the stem rule; the size is small. One half of the source's claim is
  **refuted on this model**: the instrumental intro did not make the face mouth with
  either input. The other half - a second voice in the mix is mouthed - shows up,
  weakly. Landed as a lead with the full draft; the golden path names the question.
- **Cleanup:** `render-triage clean` removed 16 paths, 121.8 MB (ComfyUI output and
  staged inputs by run id); the scratch directory goes at Phase 9. ComfyUI stopped
  after the last render (operator instruction).
