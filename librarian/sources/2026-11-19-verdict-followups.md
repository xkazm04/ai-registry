---
source: operator-verdict:verdict-followups-1119
kind: operator verdict (three sighted replica verdicts of 2026-11-19 turned into round-2 rows)
url: none
title: "Verdict follow-ups 11-19: dialogue continuity round 2, an ElevenLabs layer timed to the picture, and the r17 ad's full cut"
author: operator, sighted verdicts recorded in commit 41e76ecc7 and each item's verdict.json
words: 0
extracted: 3
accepted: 0
declined: 0
leads: 3
already_covered: 0
untriaged: 0
dispatched: 0
applied: 0
shipped: 0
held: 3
run_id: shift-1119-vf
siblings: 0
fetches: 6
---

# Verdict follow-ups 11-19: three directions, three held rows

Board run `shift-1119-vf`, a /shift follow-up lander for three operator verdicts of 2026-11-19
(commit `41e76ecc7`). No video. Nothing lands in the corpus: each direction becomes one held
replica row in `librarian/harvest/backlog.jsonl`, and the corpus waits on their verdicts.

## What arrived

| Item | Verdict (operator, sighted) | Direction, in his words |
| --- | --- | --- |
| `shift-replica-mccc-dialogue-carry` | keep developing. B: "visual style deforms between takes"; A1: "screen direction reversed in one scene after the transition" | "Keep web researching and developing so we master this technique. We struggle with consistency between scenes, and many YouTube videos we did /intake on already proved their solution." |
| `shift-replica-voice-reference-form` | none, in whisper, laugh and shout (`not-better`) | "Experiment with mixing an ElevenLabs audio layer over the video content, with a way to track the timing. Native audio from video models is not developed yet to where we need it." |
| `shift-replica-r19-ui-ad-3d-kit` | r19 dropped; r17 arm b kept (`not-better`) | "Develop arm b only. We still lack the intro/outro of the story; next round should focus on developing the full cut and a complete story." |

## 1. Scene-to-scene consistency: what the corpus already holds

A sweep of `librarian/sources/` and `knowledge/media-generation/` found 40 recorded continuity
methods. **None was built for a screen-direction flip across a chained start-frame cut, and none
has been tested for screen direction on Lynx.** The ones that bear on each failure:

| Failure | Method | Where | Channels | On Lynx |
| --- | --- | --- | --- | --- |
| Style drift (B) | Empty room plate as a scoped reference ("controls only the room") | `reference-role-map`; [2026-10-21](2026-10-21-laziest-cinematic-ai-video.md), 2026-09-14, 2026-09-18, [2026-11-16 R22](2026-11-16-speaking-character-reference-pack.md) | 4 | One trial: [2026-11-06](2026-11-06-minimax-h3-tiled-sampler.md) arm B, ref2va with an empty-room reference restored the room, one seed. Not used in round 1 |
| Style drift | An authored start still per beat (rung 2, image-anchored) | `generated-shot-sourcing` | corpus | Round 1 had it for C1 only |
| Style drift | Look line restated every call | `style-block-restated-every-call` | 3 + law | In round 1's B; it did not hold the room alone |
| Style drift | Which way the space faces is settled in the plate | `approval-reads-forward` | 1 + corpus | No |
| Direction flip (A1) | Brief the continuation from the actual output, not the original brief; "the clip wins" | `generated-shot-sourcing` § An extension is briefed from the output; [2026-11-19](2026-11-19-multi-clip-continuity-carry.md) L24 (Fain) | 3 | No: round 1's clip 2 restated the original sides |
| Direction flip | Axis discipline and screen-left/right words in every brief | `scene-grammar-progression` steps 3-4 | craft | No |
| Direction flip | Which frame is handed off: literal tail, a pick at the cut, an authored end anchor | [2026-11-19](2026-11-19-multi-clip-continuity-carry.md) L11 (Jen, Fain, Conor); rung 3 | 3 | Literal tail only |
| Direction flip | Built 3D blockout as a depth plate | `motion-plate-library` | 5+ | Camera held 2/2 (R12); previs closed by the operator 2026-11-08, not reopened |

**A reading of round 1's frames (opinion, not a measurement):** C1 opens with Adrian at frame left
and Clara at frame right, but its own last frame is a reverse angle (Clara alone at the door facing
camera, a dark foreground shape at frame right). That frame went to A1-2 as its start, while A1-2's
brief restated the original sides, which is the seam where "a character snaps back to where the
brief thought they were".

**Web (3 fetches, practitioner opinion, no measurement):** a screen-direction workflow (lock the
line first, name each character's screen-left or screen-right eyeline, log which side the
previous shot came from)
([hackernoon](https://hackernoon.com/ai-video-generation-forgets-where-the-camera-was-heres-the-screen-direction-workflow-that-fixes-it));
do not chain from the literal last frame, take the seed frame from before the slowdown in the last
10-15 % of the clip
([hackernoon](https://hackernoon.com/how-to-chain-ai-video-clips-into-one-shot-without-the-hidden-stutter-at-every-cut));
a last-frame still carries no camera-side information, so lock sheets and an environment plate
([invideo](https://invideo.io/faq/why-dont-startend-frame-methods-work-for-keeping/)). Each agrees
with a corpus row above, and none adds a measured result.

**Held row `shift-replica-mccc-continuity-r2`** (GPU, estGpuMin 48, same scene, cast, voices,
seed and route; round 1's C1 and stills reused). Round 1's B and A1 are the controls, and they
are not re-rendered. **P** gives each beat its own authored Codex start still, plus the room plate
and a screen-direction line, aimed at the style drift. **O** keeps the literal tail and briefs
the next clip from what that frame shows, the corpus's own rule. **H** hands off a frame picked
at the cut that agrees with the brief. **E** is H with the plate and an end anchor
(`MiniMaxH3AddGuide` at `frame_idx -1`, checked in the node at `63be2f9`). An optional **R**
reruns H's clip 2 off seed. The direction check is per frame: a red-mask centroid on Adrian's
stain, plus a fresh seat's side-and-facing read, counting flips per arm. Style is a hue-histogram
distance to the opening still.

## 2. An ElevenLabs layer timed to the picture

gravitone `6b9802d4`, read only: `speakWithVoice` posts to `/v1/text-to-speech/{id}` with no
timings. The dub route (`productionCutActs.ts` `lineStarts`, `layArgs`) lays each line at a take's
opening plus 0.2 s, with leading silence trimmed by `silencedetect`. No alignment or lip-sync path
exists. ElevenLabs docs fetched today: `/v1/text-to-speech/{voice_id}/with-timestamps` returns
per-character start and end times. The page does not say whether `eleven_v3` is served there, so
the row falls back to forced alignment. `/v1/forced-alignment` aligns any audio to a transcript
(words with loss), and its page states no price or limit. Lynx has no face-landmark library
(mediapipe, cv2, facenet_pytorch absent), so no lip-motion measure can run. H3 renders mouths
jointly with its native speech, so the native speech's word timings serve as the clip's lip clock.

**Held row `shift-replica-dialogue-el-dub`** (CPU, estCpuMin 15, under 400 characters). The six
lines of round 1's A1 cut are spoken in The Top's voice and Sarah's. Four sound tracks go on the
same picture: native; today's opening rule; each line shifted onto the native first-word onset;
and a per-word fit. Each is measured by onset offset in ms, word residuals, and envelope
cross-correlation lag.

## 3. The r17 ad's full cut

**Held row `shift-replica-r20-ui-ad-full-cut`** (CPU, estCpuMin 35). Arm b's 23 s stays
frame-identical as the middle of a 38.4 s cut, on track 166.766-205.16 s (20 whole bars). It gets
a four-bar intro on the bridge ("Status: failing."), so the viewer learns who the ad is for and
what is wrong. It gets a four-bar outro on the final chorus that shows music-clip's real film of
this song and ends on one action. A fresh seat writes both acts. The run checks the middle by
pixel difference and the audio by sample comparison.

## What could not be made specific

- No lip-motion measure: no landmark library on Lynx, and installing one is out of scope. The dub
  row measures audio against audio.
- Whether `eleven_v3` is served on with-timestamps is unknown until the call. A fallback is written
  in.
- Forced-alignment cost is not on its docs page. The dub row records credits per call.
- Identity across clips stays unmeasured (facenet_pytorch absent), as in round 1.
