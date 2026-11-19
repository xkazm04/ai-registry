---
source: batch
kind: batch
url: "youtube:POHCxOnrTtc, youtube:cu4mRqzbmUg, youtube:GOR4Fn0GGes, youtube:X5JDsP4KRMM, youtube:Mnj1J0yEPS8"
urls:
  - https://www.youtube.com/watch?v=POHCxOnrTtc
  - https://www.youtube.com/watch?v=cu4mRqzbmUg
  - https://www.youtube.com/watch?v=GOR4Fn0GGes
  - https://www.youtube.com/watch?v=X5JDsP4KRMM
  - https://www.youtube.com/watch?v=Mnj1J0yEPS8
title: "Multi-clip continuity carry, /shift batch of 5 videos from 5 channels"
author: "5 channels: Jen's AI Lab (no prior note), Creating with Conor (seven prior), Dan Kieft (four prior), Fain (none), Veteran AI (none)"
words: 9805
extracted: 72
accepted: 2
declined: 0
leads: 15
already_covered: 30
untriaged: 10
currency: 6
dispatched: 0
applied: 0
shipped: 0
held: 1
run_id: shift-1119-mccc
siblings: 3
fetches: 14
rescan_when: the held row shift-replica-mccc-dialogue-carry has a verdict; or a primary states whether the H3 ref2va weights were trained with keyframe rows; or 8 weeks elapse (2027-01-14)
---

# Multi-clip continuity carry, mined under /shift, 2026-11-19

Plan `plan-20261119-072526`, cluster `multi-clip-continuity-carry`, board run `shift-1119-mccc`. The
question: what has to travel from one clip to the next so a cast keeps the same face, voice, look and
state across a multi-clip episode, and can those carriers ride together in one reference call on our
local H3? Five miners read the captions in full and fetched what the descriptions link. The lander
re-read the ComfyUI node source at the pinned commit, gravitone's dialogue route and the home
techniques. No render, no GPU, no download, no web fetch by the lander. Phase 7.7: gate=skipped.

- **J** = `youtube:POHCxOnrTtc`, Jen's AI Lab, "My AI Actors Finally Look the Same in Every Scene
  (Seedance 2.5)" (842 words, 4:51, read whole). First-party account of her own film, affiliate tour
  around it. The prompt layout is in the description; the linked making-of (`PFO22eMjN84`) was read
  from its captions. The per-clip prompts are on screen only, absent as text.
- **C** = `youtube:cu4mRqzbmUg`, Creating with Conor, "STOP Wasting Credits & Master AI Micro Dramas in
  17 Min" (2,864 words, read to [00:16:53]). The plan called it a second-hand review; the build
  narration is first-party (which reference went into which clip, what he fixed in the edit). Prompts
  sit behind a paid sign-up, not followed. His eighth note: novelty is judged against his own rows.
- **D** = `youtube:GOR4Fn0GGes`, Dan Kieft, "I Made A GTA 6 Trailer with Seedance 2.5 + Claude Fable 5.2"
  (2,919 words, read to [00:15:48]). First-party build walkthrough, sponsored; a public prompt page and
  a prompt-writer skill, both read in full, neither reproduced. Third-party IP and a frozen trailer
  line: no remake from him.
- **F** = `youtube:X5JDsP4KRMM`, Fain, "I Tested Pika H3 Flex on RTX 4060 8GB — No Upscale" (1,247
  words, read whole). First-party, live render timer. No prompts published.
- **V** = `youtube:Mnj1J0yEPS8`, Veteran AI, "New H3 Image Designer: 16MP Output, Unreal Consistency"
  (1,933 words, read whole). First-party ComfyUI walkthrough, sponsored. The sheet workflow JSON and
  the custom node's README were fetched; his video prompts are absent.

**Class and expected yield, stated first:** five practitioner walkthroughs, four sponsored, none
measuring anything. The corpus already owns reference sheets, role maps, style blocks and the
conditioning ladder in depth. Expected: catches on locks and sheets, a few boundary leads, dated node
facts, and one remake. That held: 2 applications accepted (landed in a follow-up, below), 15 leads, 30 covered, 10 untriaged, 6
currency, 1 dropped, 1 held replica.

**Voices.** Five channels. Convergence counts channels, never videos. Two corrections to the plan's
counts: **Jen used no voice reference at all** ("For this film I left it empty", PFO [00:03:50]; the
dialogue came from a sound line), so "the previous clip as the voice carrier" rests on Conor alone.
And Fain's and Veteran AI's Flex runs are two channels on a reference route, not a voice on the held
FL2VA row's verdict.

**Admission.** The accept bar for upper-layer rows is **+3**. It comes from `/intake` Phase 5 Step 3
and its v2.21 paragraph as they stand. The dispatch's reason, "fp=1, 1, 1, 2 and 4", is the 2026-11-06
rows. The current scorecard tail is seven consecutive `fp=0` runs (all six 2026-11-16 rows and
2026-11-18) after `fp=1` on 2026-11-11. Step 4's step-down needs three consecutive `fp=0` runs whose
rejected rows a later run had to re-derive without reading the bank, and no such re-derivation is
recorded. A step is also a method edit, never a lander's setting. So +3 governs, by the method's text.
Eighteen upper-layer rows went through Phase 5: ten were scored and none reached +3, and eight were
vetoed V2. `auto=0/18/0`. **The two accepts are applications and ran under the corroboration table**
("only with a tree you opened"), as the 2026-11-16 lander ran its application row. Scored anyway for
the record, they read 2/0/1 (L1: G1 dated fact, +1 convergence on its composition half; R0, tree
opened) and 1/0/1 (L2), so neither would clear +3 as an upper-layer row, and neither is one. `fp=0`:
both miner accepts survived the lander's read.

## What landed

This note, its ledger lines and one held replica row, `shift-replica-mccc-dialogue-carry`, in
`946943e79`. No project was touched.

**The two accepts landed in a follow-up commit, after a deferral (V5, defer).** They append two
bullets to
`knowledge/media-generation/production-ops/video-assembly/applications/process--generated-shot-sourcing.md`,
after the 2026-11-06 "A moving reference on one local node" bullet. The door refused that path on
2026-11-19 (`path-refused`), because sibling `shift-1119-bmvr` held `video-assembly` on the board.
That sibling landed `2bfdb2e48` and changed no corpus file. Once its claim was released, a second
lander for this run re-read both bullets against ComfyUI `63be2f9` (`nodes_minimax_h3.py` AddGuide
and ReferenceToVideo, `model_base.py` extra_conds, `ldm/minimax/model.py` PackedLayout,
`text_encoders/minimax.py` per-type counters) and gravitone at `6b9802d4` (`comfyH3Ref.ts` lines 37
and 58, still `<Audio 1>` and `match`), recomputed every token figure, found the target file
unchanged since `2bfdb2e48`, and landed the wording below verbatim. `verified_on` not moved.

```markdown
- **A start frame beside the references, and the order of the tags (read
  2026-11-19, ComfyUI v0.42.1 `63be2f9`).** `MiniMaxH3AddGuide` anchors a still, a
  17k+5-frame clip or audio at any `frame_idx` (a negative index counts from the
  end). Its only check on the latent is that it is an H3 audio-video latent, which
  is what `MiniMaxH3ReferenceToVideo` emits, so one reference call can take a start
  frame and the references together. The packed sequence carries the reference
  blocks and the keyframe rows side by side, with keyframes placed on the target
  timeline after the references' span. Whether the reference checkpoint, a
  separate weight from the first-and-last-frame one, follows a keyframe is
  unmeasured, and the failure to expect is silent: a clip that ignores its start
  frame and raises no error. The tags are numbered per type in a fixed order:
  images, then each reference clip, with its soundtrack's `<Audio j>` placed just
  before its `<Video k>`, then the standalone audio files. Adding a reference clip
  with sound makes its soundtrack `<Audio 1>` and moves every standalone voice up by
  one, so a prompt that names a voice by a fixed `<Audio 1>` points at the wrong
  reference.
- **What `ref_image_size` does with a large still (read 2026-11-19, same commit).**
  Both settings only scale down, to multiples of 32 px. `match` scales a reference
  image to the generation's pixel area, and `max` scales it to a 2,048 px short
  edge. A reference costs one token per 32x32 px, and the tokens ride through every
  step. So a still drawn larger than the clip reaches the model only under `max`,
  and a 16:9 still stops there at 3648x2048 (about 7.5 MP, 7,296 tokens) whatever
  it was drawn at. A 1672x941 still enters an 832x448, 124-frame clip at 800x448
  (350 tokens) under `match` and at 1664x928 (1,508 tokens) under `max`, against
  13,468 tokens for the clip itself: 4.3 times the pixels for about 9 % more tokens
  per still. In a 1280x704 clip (32,560 tokens) the same still enters at 1280x704
  under `match`, and `max` gives it 1.7 times the pixels for about 2 % more. The
  node's tooltip warns that `max` "can be several times slower"; at this size the
  added tokens are a small share of the clip's, but no time was measured, and
  whether `max` holds a face better on this node is unmeasured.
```

## What the promotion read found

The lander opened ComfyUI `63be2f9` (v0.42.1): `comfy_extras/nodes_minimax_h3.py` (AddGuide 166-240,
ReferenceToVideo 243-365, sizing constants 31-34), `comfy/model_base.py` 2225-2250,
`comfy/ldm/minimax/model.py` 1-8, 38-48 and 350-402, and `comfy_extras/nodes_video.py` 308-380. Then
gravitone at `6b9802d4`: `lib/imaging/video/comfyH3Ref.ts` whole, `lib/producers/productionAudio.ts`
line 67, `lib/foundry/scout/sheet.ts` `SHEET_FRAMING`. Every token figure in both accepts was
recomputed from the node's formulas and agrees.

1. **The plan's predicted setup failure will not happen.** AddGuide's only check is that the latent is
   an H3 audio-video pair, which ReferenceToVideo emits, and the packed layout carries keyframes and
   references together (J, F read this independently). What is open is whether the ref2va weights
   *follow* a keyframe. That failure would be silent, and the replica's seam measure is built to see it.
2. **The frames-to-IMAGE path the 2026-11-16 note called untested is in core.** `LoadVideo` ->
   `GetVideoComponents` gives IMAGE and AUDIO, and `ImageFromBatch` takes a negative index for the last
   frame. It has never run here, but it needs no custom node, so the previous-clip arm is bankable,
   with a setup refusal recorded as a lead and the other arms run anyway.
3. **The tag order is a real defect-in-waiting at the seam.** The node labels a reference clip's
   soundtrack `<Audio j>` just before its `<Video k>`, ahead of the standalone audio. gravitone's
   `speakingPrompt` hard-codes `<Audio 1>` (line 37). Correct today, wrong the moment a clip with
   sound is attached.
4. **`match` already throws a large sheet away.** The 2026-11-06 bullet holds the `match` arithmetic
   and the head-first crop of a reference clip (so C12 is a catch). What it lacked is `max`: its
   2,048 px short-edge cap and its price. V3 adds that.
5. **Today's graph cannot be the control.** `setRef2VaGraph` wires one image and one audio, so it
   cannot voice two speakers (D's correction, confirmed). Arm B is the two-speaker extension with no
   start frame and no reference clip.
6. **Jen's three beats are in three rooms, and a start frame cannot jump rooms.** The replica keeps
   her names and lines and moves the beats into one continuous kitchen. Her `@image1` double-mapping
   (J5) disappears on H3, where a start frame is a keyframe and takes no tag.
7. **The identity ruler's floor is `MIN_FACE_PX = 80`** in `identity.py`; 125 px is the smallest
   measured medium face in its calibration, not the floor. The row cites the code.
8. **Veteran AI's sheet shows 6 views, not 13** (his saved designer state, per the V miner), and the
   resolution claim is thrown away at `match` on our route.

## Candidates

Merged across the five reports (72 miner rows, 64 here). `Voices` names the channels that state the row.

| # | Candidate | Voices | Anchor | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- |
| L1 | A start frame rides beside the references on the local node; a clip's soundtrack takes `<Audio 1>` and moves standalone voices up | J (F on the first half) | node code read at `63be2f9` | **Accept, landed (follow-up)** | table (application, tree opened); raw 2/0/1 | 2026-11-06 bullet lists counts and tags, not composition with a keyframe or the soundtrack-first order. Seam: gravitone `speakingPrompt` |
| L2 | `ref_image_size`: only `max` passes a large still's pixels, capped at a 2,048 px short edge, for a few percent of the clip's tokens | V (translation of his claim) | node code read; Codex 16:9 observed at 1672x941 | **Accept, landed (follow-up)** | table (application, tree opened); raw 1/0/1 | 2026-11-06 bullet holds `match` only. Seam: gravitone `comfyH3Ref.ts:58` |
| L3 | Carry a start frame with the identity references in one call | J, F, C | J [00:03:00]; F [00:02:59]-[00:04:15]; C [00:09:01]-[00:09:28] | Untriaged (boundary) | Phase 5, 2/0/1 | `generated-shot-sourcing` rungs 2 and 4 and "Pin the origin, roll the recent" already say it; the corpus is right, the rung list only reads as exclusive. Arm A1 exercises it |
| L4 | A tail-frame seam is not exact; cover it in the edit and say which | C, J | C [00:13:23]; J PFO [00:09:02] | **Lead, held row** | Phase 5, 2/2/1 | Decision rule 1 and rung 3 present the tail anchor as the defence and name no residual. **Discriminator:** how the start frame enters (a reference among others on their host, a pinned keyframe here). The seam measure decides |
| L5 | Persisting state written as a text line naming its location | J (wound across clips), D (placement inside one take) | J [00:03:27]-[00:03:52]; D page `[CONTINUITY]` | **Lead, held row** | Phase 5, 2/2/1 | `identity-split-from-state` § State that must persist: a reference variant, "not requested in text". J's half: the start frame carries the state in pixels and the text labels it. D's half: inside one take there is no sheet switch. B against A1 tests J's half only; neither arm renders the corpus's form, so the row can bound the rule, never invert it |
| L6 | When a moving reference is refused, the tail frame plus a stated handoff carries on | J | [00:03:00]-[00:03:27] | **Lead, held row** | Phase 5, 1/2/1 | § The moving reference: a span "dominates tail-frame anchoring for mood-bearing scenes". A1 against A2 asks locally what the clip adds over its frame |
| L7 | The previous clip as the voice carrier for both speakers | C | [00:09:01]-[00:09:28] | **Lead, held row** | table (one channel) | 2026-11-16 A12 (his own). Arm A2 |
| L8 | Pick the carrier per clip: the latest clip in which every speaker spoke, trimmed to them | C | [00:10:46], [00:11:12], [00:12:05] | Untriaged | Phase 5, 1/2/1 | § The moving reference names no per-speaker content. Replica rule: every carrier is a whole clip in which both speak |
| L9 | One voice asset per speaker, every line bound to it, no cross-taking | D | page `[REFERENCES]`, `[AUDIO]` | Lead, in the replica prompt | Phase 5, 1/2/1 | `reference-role-map` step 1 (one primary job per asset) by inference. Opposite default to C's two-speaker carrier; pinning each voice removes the need to choose a carrier for the voice |
| L10 | Scope a video reference: J "never identity"; D also never framing, background or light | J, D | J description; D page prompt | Already covered | catch | `unreferenced-channels-resample`; `reference-role-map` step 4. The replica takes D's wider scope, because the start frame owns the framing |
| L11 | Which frame is handed off: literal tail (J, C's jump clip), a pick at the cut (F), an authored end anchor (C clip 1) | J, F, C | F [00:03:50]-[00:04:15]; C [00:07:18], [00:07:44] | Untriaged (F's pick); catch (C's anchor, rung 3) | Phase 5, 1/2/1, V2 | **Discriminator:** whether the assembly owns the clip's end before generation. Rung 3 already says own it where the cut must land; the pick is the fallback when the end was left open. The replica keeps the literal tail |
| L12 | A montage shares assets and never chains | D | [00:10:27]; page | Already covered | catch | `generated-shot-sourcing` topology: star for independent variations, chain where the next beat depends on the last. **Discriminator:** does the next clip continue the action. Carriers are for continuous scenes only |
| L13 | A whole 25-30 s previous clip as the carrier | C | [00:09:56]-[00:12:05] | Already covered | catch | The 2026-11-06 bullet: the node keeps a longer clip's head; § The moving reference: trim to the span you mean |
| L14 | A hosted clip reference was refused for realistic faces while its last frame passed | J, D | J [00:02:34]-[00:03:27]; D skill | Currency | table | Host moderation, dated. **Corrects the plan:** not a boundary on video references; local H3 has no such check. The skill's face-obscuring advice is filter evasion and is not adopted |
| L15 | One host's doc for the 2.5 face rule and caps | J | host developer doc | Currency | table | The 2.5 caps stay contested in the application's table |
| L16 | Locks 1-3: same picture, role map plus keep-line, verbatim blocks, one look line | J | [00:00:51]-[00:02:34] | Already covered | catch | `approved-reference-sheet`, `reference-role-map`, `identity-split-from-state`, `style-block-restated-every-call` |
| L17 | Her template gives `@image1` two jobs | J | description; [00:01:17] vs [00:03:00] | Already covered | catch | `reference-role-map` step 1 |
| L18 | Blocking by counts, positions and visible body state; at most three shots in 15 s | J | PFO [00:05:56]-[00:06:21] | Already covered (shot cap untriaged) | catch | `prompt-dialect-matching`, `shape-language-over-nouns`. The cap is one host's number |
| L19 | A paid storyboard preview did not bind the render | J | PFO [00:05:06]-[00:06:21] | Untriaged | Phase 5, V2 | Nothing mapped |
| L20 | Dialogue from a sound line with no voice reference | J | PFO [00:03:50], [00:10:46] | Already covered | catch | `multi-speaker-speech-production`. Recorded so nobody counts her as a carrier voice |
| L21 | Spend saved steps on delivery size instead of an upscale pass | F | [00:01:41]-[00:02:08] | Already covered | catch | `resolution-as-stage-property`; gravitone already renders H3 at 1280x704 directly |
| L22 | 6-step Flex: 9 s at 0.6 MP in 9:19 on 8 GB, 8 shots | F | [00:05:45], [00:06:37] | Currency | table | Not comparable with `shift-proof-h3-flex-fl2va-6step` (ref2v, other adapter, size, card). Its comparable figures are 325.8 s against 413.0 s per clip (2026-11-11) |
| L23 | Flex ranked above "Fast H3" | F | [00:01:15] | Lead | table | Non-blind opinion on arms the operator judges blind: keep it off the review page until the pick |
| L24 | Tell the model to start from the opening frame's framing | F | [00:04:15] | Already covered | catch | § An extension is briefed from the output |
| L25 | Watch the step-2 preview and cancel bad takes | F | [00:05:07] | Lead | Phase 5, 1/2/2, V2 | No preview channel in the fleet's unattended H3 runs |
| L26 | Model-burned captions garble on longer dialogue; caption in the edit, checked against the script | F, C | F [00:07:05]-[00:07:55]; C [00:13:49]-[00:14:14] | Already covered | catch | `image-prompt-composition` architecture rule; `verbatim-text-locking`. Two channels on a rule the corpus holds |
| L27 | A memory-saving attention stack fits H3 on 8 GB | F | [00:02:33] | Untriaged | table | No use: Lynx runs H3 without offload |
| L28 | A video-upscale node's chroma error, set to auto | F | [00:06:37]-[00:07:05] | Dropped | no use | A tool bug |
| L29 | Flex on a reference route; the vendor ships a Flex Ref2VA adapter (not on disk) | F, V | F [00:02:08]; V [00:08:18]-[00:08:43] | Lead, conditional | table | Worth a night download only if the FL2VA blind pick comes back B or tie |
| L30 | Sheet everything that recurs before any video | C, D | C [00:02:06]; D [00:09:37]-[00:10:27] | Already covered | catch | `approval-reads-forward`; 2026-11-16 R19 |
| L31 | Era variants by editing the approved sheet | C | [00:03:49]-[00:04:14] | Already covered | catch | `identity-split-from-state`; `approved-reference-sheet` |
| L32 | A location reference spends its pixels on two large halves, not three panels | C | [00:04:40] | Lead | Phase 5, 1/2/1, V2 | Plausible on our node: at `match` a three-panel plate gets about 0.12 MP per view, two halves about 0.19 MP |
| L33 | Plates stay empty; the crowd goes in the motion prompt | C | [00:05:07] | Already covered | catch | 2026-11-16 R22; `reference-role-map` |
| L34 | Design a recurring prop so its story-active part always shows | C | [00:03:49] | Lead | Phase 5, 1/2/1, V2 | Adjacent to 2026-11-16 A8, not this rule |
| L35 | Frame a recurring transition without its location and reuse it | C | [00:05:33]-[00:06:24], [00:13:23] | Untriaged | Phase 5, 2/2/2 | No home. No fleet production has a recurring transition |
| L36 | Draft cheap, promote the winner | C, D | C [00:07:44]; D [00:13:58] | Already covered | catch | `resolution-as-stage-property` (both channels' own earlier rows) |
| L37 | Hosted single-pass dialogue clips run 18-30 s | C | [00:08:35]-[00:12:05] | Currency | table | One of his scenes is two to six of our 124-frame clips |
| L38 | Foreign speech in its language, the translation in edited captions | C | [00:10:46], [00:14:14] | Lead | table | 2026-11-16 A15 adjacent |
| L39 | Per-place music and title cards | C | [00:13:49] | Already covered | catch | `music-spotting-against-picture` |
| L40 | Story scene by scene before any credit | C | [00:01:16]-[00:02:32] | Already covered | catch | His 2026-11-16 A1, A9 |
| L41 | Views of one subject are one subject: state the headcount | D | skill; page `[EXCLUSIONS]` | Lead, in the replica prompt | Phase 5, 1/2/1, V2 | `reference-role-map` step 5 names the multiplication only in the wanted direction |
| L42 | Teach the writer a style by shot-by-shot analysis of reference films | D | [00:03:09]-[00:05:18] | Already covered | catch | `style-onboarding-from-sample` |
| L43 | Music first | D | [00:02:17]-[00:02:43] | Already covered | catch | `track-map-before-treatment`; `cue-first-assembly` |
| L44 | Describe a found image, never condition on it | D | page §05 | Already covered | catch | `style-onboarding-from-sample`, verbatim |
| L45 | One numbered block per continuous shot | D | skill | Already covered | catch | `scene-grammar-progression` |
| L46 | Eleven cuts in 23 s from one generation | D | [00:10:55] | Lead (repeat) | table | 2026-11-08 K16, same channel |
| L47 | The writer changed the asked duration | D | page §05 | Already covered | catch | `default-attractor-rejection` |
| L48 | Notes re-roll the whole multi-shot take | D | [00:13:58]-[00:14:56] | Already covered | catch | `partial-regeneration-seams` |
| L49 | One shared finish over the assembled cut | D | [00:15:21]-[00:15:48] | Untriaged | Phase 5, 2/1/2 | No corpus home on the picture side. The source's reason is wrong (a grade hides no generation defect). A CPU row waits for a full rough on the operator's signal |
| L50 | Correct a selfie's lens distortion when minting an identity | D | page §03 | Untriaged | table | Fleet casts are designed, not photographed |
| L51 | A speaking video sheet as the joint reference | D | [00:05:43]-[00:09:11] | Already covered | catch | 2026-11-16 R4, one host feature already counted |
| L52 | The writer can assemble the cut; the host is reachable from the chat agent | D | [00:15:21], [00:15:48] | Currency | table | 2026-11-16 A28 class |
| L53 | Prop sheet: two views on 18 % grey | D | page §04 | Already covered | catch | `reference-shows-only-invariants` |
| L54 | Draw the sheet with a still model, not one frame of a short video | V | [00:00:00]-[00:00:52]; README | Already covered | catch | gravitone already draws its sheet as a Codex still |
| L55 | A 16 MP sheet gives stronger identity in video | V | [00:07:26], [00:08:18] | Already covered | catch | True of the still, discarded at `match`; L2 holds the one switch that keeps part of it |
| L56 | A multi-view sheet repeats the face on every panel | V | designer state | Lead, not banked | Phase 5, 1/2/1, V2 | Contrary to `approved-reference-sheet` (the face appears once). **Discriminator:** the size at which the route feeds the sheet. No consumer until a scout sheet feeds an H3 call |
| L57 | Four demos as proof that clearer sheets help | V | [00:08:18]-[00:11:18] | Already covered | catch | `approved-reference-sheet` decision rule: a sheet's contribution without a control is a claim |
| L58 | Published sigma knots beat the generic scheduler at the same step count | V | [00:06:34]-[00:07:26]; workflow | Untriaged | Phase 5, 3/2/2 | A second channel for the held Flex row's untriaged P7 (a few-step model's schedule is its contract). Net 1 |
| L59 | Layout IDs in a sheet prompt get drawn as captions | V | [00:06:34]; README v1.5.2 | Already covered (identifier boundary untriaged, 2/2/1) | catch | `image-prompt-composition` text magnets; gravitone `SHEET_FRAMING` already says no text |
| L60 | Keep the reference order: character first, layout second | V | [00:06:06] | Already covered | catch | `reference-role-map` |
| L61 | Feed the layout guide as a reference | V | [00:05:14] | Lead | table | **Opposite default:** the node's author says start with it off ("can leave guide content") |
| L62 | H3 Image: a 4-20 MP band, the shared encoder, its own VAE, ComfyUI 0.45+ | V | template note; README | Currency | table | Encoder on disk; model and VAE are not; our tree is 0.42.1 |
| L63 | Re-render the sheet in another style and keep the views | V | [00:07:51] | Already covered | catch | 2026-11-16 R17 |
| L64 | Part references on one canvas are text permissions, not masks | V | README | Untriaged | Phase 5, 1/2/1, V2 | `reference-role-map` (the map is prose) |

Every miner row maps to one L row: 72 rows lose nine in eight merges (L3 takes three; L5, L11, L14,
L26, L29, L30 and L36 take two each), and L7 is the lander's row from C's clip wiring. Not extracted:
credit prices, plan promos, affiliate bonuses, model picks by proper noun.

## The replica, and what it decides

**Held row `shift-replica-mccc-dialogue-carry`** (`kind: replica`, sighted, estGpuMin 25, Lynx,
models on disk, core nodes only). Jen's scene (Adrian Vale, Clara Bennett, her published lines) in one
continuous kitchen over three beats. Stills from Codex image_gen (two sheets in gravitone's own
`SHEET_FRAMING`, the ring, the opening still). Voices: The Top's cast voice for Adrian and the
premade voice already used on Lynx for Clara, each pinned by a plain sentence never spoken in a clip.
Clip 1 is shared. Clips 2 and 3 run three ways: **B**, references and voices only; **A1**, B plus the
previous clip's last frame through `MiniMaxH3AddGuide` at `frame_idx 0`; **A2**, A1 plus the previous
clip with its soundtrack as `ref_video_0`. An optional **M2** reruns A1's clip 2 at `max`. Eight clips.
The prompts take each source's method:

| Method step | From |
| --- | --- |
| Role map, keep-line, verbatim identity blocks, one look line, DETAILS line | J (locks 1-3, 5), corpus |
| The literal last frame as the start frame, and the CONTINUE line | J (lock 4), F (node) |
| The previous clip as the voice carrier, a whole clip in which both speak | C (C9, C11) |
| Per-speaker voice references, no cross-taking, the clip scoped away from framing and light | D (D4, D5) |
| A headcount line | D (D3) |
| No on-screen text | F (row 8), C (C15) |
| The `max` clip | V (V3) |
| Seam, identity and voice measures; ComfyUI pinned at `63be2f9` | J, F, corpus |

What it settles, each before any landing: whether ref2va follows a start frame (seam, A1 against B);
what the clip adds over its frame (A1 against A2, the local form of J's refusal and of § The moving
reference's "dominates"); whether a wound holds in text alone (B) or only with the frame (A1); whether
the seam is closed or must be covered in the edit (L4); and whether `max` holds a face better (M2).
What it does not settle: the corpus's own wounded-sheet form, F's pick at the cut, C's authored end
anchor, the multi-view sheet (L56), and the voice reference's content (held in
`shift-replica-voice-reference-form`).

## Proposals (not landed)

0. **Landed.** The two deferred bullets (§ What landed, verbatim) went in once `shift-1119-bmvr`'s
   claim on `video-assembly` was released, after a re-read of the code they cite.
1. **gravitone, after the replica's verdict** (`lib/imaging/video/comfyH3Ref.ts`, read at `6b9802d4`):
   `H3VoiceRequest` takes a cast (several stills and voices); an optional start still chained through
   `MiniMaxH3AddGuide` at `frame_idx 0`; an optional previous clip with its sound into
   `ref_video_0`/`ref_video_audio_0`; `speakingPrompt` numbers its tags from the attached set instead of
   the literal `<Audio 1>` (line 37); `ref_image_size` `max` at line 58 only if M2 holds identity at the
   measured cost. A managed project: no code changed here.
2. **gravitone, now:** the stale "~63 min per 3 s ref2va clip" sits in a second place,
   `lib/producers/productionAudio.ts:67` (the speaking take's cost basis), besides the header of
   `comfyH3Ref.ts:13` that the 2026-11-16 note named. Lynx measures about 90 s cold at 832x448x124.
3. **Corpus, after the verdict:** L4 under `generated-shot-sourcing` decision rule 1 (C's banked
   wording in his report), L5 under `identity-split-from-state` § State that must persist (J's and D's
   wordings), L6 under § The moving reference, L8 beside it. Each waits on the replica.
4. **`shift-proof-h3-flex-fl2va-6step`:** add V's knots as a second channel on its P7 note, and F's
   timing to its benchmark line below the pick, never on the review page before it. Not edited here.
5. **L49 as a CPU row** (one shared grade and grain over a rough cut, gravitone
   `pipeline/trailer/cut.mts`): bank it when a kept production has a full rough, on the operator's
   signal.

## Plan homes

The plan named ten homes. Rows landed against `video-assembly` (`generated-shot-sourcing` and its
process application, `unreferenced-channels-resample`), `image-prompt-composition`
(`identity-split-from-state`, `reference-role-map`, `verbatim-text-locking`), `visual-style-locking`
(`approved-reference-sheet`, `style-block-restated-every-call`, `style-onboarding-from-sample`),
`character-identity-continuity` (`reference-shows-only-invariants`, `identity-ruler-calibration`),
`multi-speaker-speech-production` and `generative-provider-routing`. `character-voice-design`,
`production-pipeline-phasing` (only `approval-reads-forward`, as a catch), `frame-direction` and
`image-to-3d-input-gating` drew no row of their own: no source says anything about voice design,
pipeline phases, frame direction or mesh input.
