---
source: batch
kind: batch
url: "youtube:2hJsvDSPWYM, youtube:bgku5BCqqLs"
title: "Cinematic prompt form, /shift batch of 2 videos from 2 channels"
author: "2 channels: Dan Kieft; Creating with Conor"
words: 6376
extracted: 32
accepted: 0
declined: 0
leads: 10
already_covered: 17
untriaged: 3
dispatched: 0
applied: 0
shipped: 0
run_id: cinematic-prompt-form-1108
siblings: 2
fetches: 9
---

# Cinematic prompt form, mined under /shift, 2026-11-08

Plan `plan-20261107-120659`, cluster `cinematic-prompt-form`. Two sponsored second-hand practitioner
reviews of a hosted video model (both sponsored by the same host):

- **K = Dan Kieft**, 3,802 caption words, plus a first-party public prompt page with 8 complete
  sectioned video prompts, two public template documents and one public style file. All of it was
  read without a login. A paid community was not joined.
- **C = Creating with Conor**, 2,574 caption words. The workflow document he promises in speech is
  **absent** from the description, the pinned comment, his site (connection refused) and one web search.
  So his prompts are reconstructed from speech, and the canal-boat lines come from captions.

Read from captions and the pages. Nothing on screen was seen. Phase 7.7: gate=skipped (unattended
shift), and nothing was asked. **The accept bar is +3** for this shift (Phase 5 Step 4, after fp=1, 1, 1, 2
and 4 across runs). It governed every scored row below.

**Convergence counts channels.** K and C are independent: neither cites the other. JOEY (a channel
from `2026-11-06-film-preproduction-chain`) counts as a third voice only where a row cites his
verbatim prompts. The vendor's guide corroborates but is not a channel.

**Expected yield,** stated by both miners before their tables: catches against `cinematic-language`,
at most one amendment, and one replica each. That held: no accept, two replicas banked.

## The decision: the prompt form for local cinematic and dialogue shots

- **Named parts against one block.** Both channels give the parts an *authoring* reason, never a
  model reason. K: the formula is "to teach yourself to think about all of these different parts".
  C: one block "gives everything the same attention", a claim with no control arm. C's parts also
  change with the shot's job (camera, dialogue, lighting, realism), so they work as a checklist and
  not as one form. **Two channels converge that the parts are an authoring checklist. Nobody, in the
  sources, the corpus or the replicas, has measured named parts against one block.** K is also
  inconsistent about whether the labels reach the model: his template document says "Do not include
  headings inside the prompt", while all 8 of his video prompts keep labelled sections. So the split
  and the labels are two separate variables.
- **Fit to H3's six sections.** Only three kinds of part map to an H3 section: **references**
  (`subject_definitions`), **speaker tags** (`<Subject N> (Sx)` plus `<d>`, at each vocal event) and
  **sound** (`overall_soundscape`, `non_diegetic_music`). Camera, acting, lighting and realism parts
  are not sections on H3. They are a fill-in list for `detailed_description`, written in playback
  order, with the style opening "in one or two English sentences before `[Shot 1]`" (guide 5.2). K's
  six labelled video sections map with one split and two merges (his miner's table). The guide calls
  its six sections the "Full-Reference Mode **Rewrite Output Format**", which is the form its own
  prompt rewriter emits. A ComfyUI graph has no rewriter in front of it. Writing that form directly is
  dialect matching by inference: the guide never says the captions were written in it.
- **What decides it:** `shift-replica-r10-robot-form`, the same words as six sections against one
  block, on the same seeds. Until then the house form stays what it is, and the sectioned form is
  what three replicas (R1, R3, R5) have already rendered without a comparison arm.

## Triage

Score rule: upper-layer rows ran under Phase 5, G/R/C, bar +3. Currency rows and leads ran under the
corroboration table. Catches were confirmed by opening the named home.

| # | Candidate | Anchor | Voices | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|
| K1 | Map the six labelled video sections onto H3's six | K page, video prompts | 1 | application, table | partial | n/a | **lead**, carried by `shift-replica-r10-robot-form` |
| K2 | Named sections are a dialect where the model's own rewriter emits them | H3 guide section 1; K page | 1 + vendor | amendment (scope), Phase 5, render-bound | partial | 1/3/1 | **lead with a held row** (`shift-replica-r10-robot-form`). Was 1/1/1 at the miner |
| K3 | Write a still prompt as camera, tone, lighting, texture, camera first | K [00:08:39]-[00:10:52] | 2 (K, JOEY) | catch | catch | n/a | covered: `style-first-token-ordering` (token order), `cinematic-language` decision order |
| K4 | The parts are an authoring checklist; the labels are a separate variable | K [00:09:11]; K template doc | 2 (K, C) | lead, table | real gap | n/a | **lead**, the cluster's sharpest question. Return: R10's verdict, then a labels-only pair |
| K5 | Sell realism with camera behaviour | K [00:17:37]-[00:19:22] | 2 (K, JOEY) | catch | catch | n/a | covered: `movement-motivation` steps 3, 5 and 6; `genre-visual-contracts` vérité |
| K6 | One camera reaction per shot, locked to an event, performed once | K page (all 8) | 1 | catch | catch | n/a | covered: `movement-motivation` "One move per shot". K contradicts himself ("combine them" in speech), and his page takes the corpus's side |
| K7 | Make it look filmed by a human (found footage) | K [00:17:12]; K page | 1 | catch | catch | n/a | covered: `footage-claims-a-camera`, the manufactured-crowd case. Why the plan's found-footage proof is dropped |
| K8 | Repeat an overlay exclusion list at both ends | K page | 1 | catch | catch | n/a | covered: game-production prohibition law; `prompt-dialect-matching` exclusion style per model |
| K9 | Give each reference one role and nothing else | K page | 1 | catch | catch | n/a | covered: `reference-role-map` |
| K10 | Name a mouthless speaker's speaking element, and keep the other's steady | K page, focus-fail prompt | 1 | amendment, Phase 5, render-bound | partial | 1/2/1 | **lead with a held row** (`shift-replica-r10-robot-form`). The silence half is a catch on `reference-role-map` ("state who stays silent") |
| K11 | Hosted H3 Max is weak at realism without references | K [00:07:02] | 1 | lead, table | thin | n/a | lead. No proof: every route we run is reference-built |
| K12 | Draft cheap, then upscale the winner once | K [00:07:29]-[00:08:20] | 1 | catch | catch | n/a | covered: `resolution-as-stage-property`; the plan already closed it |
| K13 | Run one prompt across several image models | K [00:02:38] | 1 | catch | catch | n/a | covered: `generated-output-grading` cross-provider flips |
| K14 | Turn a liked prompt and image into a reusable style file | K [00:14:37] | 1 | catch | catch | n/a | covered: `style-onboarding-from-sample` |
| K15 | Escalate contrast in levels 0-3 | K [00:15:30]-[00:17:12] | 1 | technique, Phase 5 | not opened | n/a | untriaged: probable home `ad-concept-development` not opened |
| K16 | Cut density inside one generation (7 hard cuts in 10 s) | K page | 1 | lead, table | real gap | n/a | lead: H3's cut ceiling is unmeasured |
| K17 | Hosted model standings, Nov 2026 | K [00:05:12]-[00:08:20] | 1 | currency, table | dated fact | n/a | currency, hosted only. No application citation was re-checked, so no clock moves. Praise of a retired still route reopens nothing |
| C1 | Split the shot prompt into named parts | C [00:00:57]-[00:01:22] | 2 (C, K) | lead, table | partial | n/a | **lead**, joins K4 |
| C2 | Write the camera as lens, start, move, end | C [00:01:49] | 1 | catch | catch | n/a | covered: `movement-motivation`, `lens-effect-language` |
| C3 | A wide lens makes near things huge | C [00:02:42] | 1 | catch | catch | n/a | covered: `lens-effect-language` intent 1 |
| C4 | Dolly zoom by numbers (85 to 28 mm, 6 m to 2 m) | C [00:03:07]-[00:03:44] | 1 | catch + lead | catch | n/a | **catch**: `movement-motivation` step 5 names the dolly-zoom and says to describe the perceptual result. Lead: one numbers-against-effect-words pair, the useful remainder of the plan's second proof. Deferred, no row |
| C5 | Name the speaker on every line | C [00:04:10] | 3 (C, K, JOEY) + vendor | catch | catch | n/a | covered: `reference-role-map` line binding; the guide's `(Sx)` rule |
| C6 | Direct the listener while the other speaks | C [00:04:36]-[00:05:29] | 2 (C, JOEY) | amendment (boundary), Phase 5, render-bound | real gap | 2/1/1 | **lead with a held row** (`shift-replica-r11-alibi`). Wording banked below. Was 2/2/1 |
| C7 | Keep the dialogue framing short | C [00:04:10] | 1 | catch | catch | n/a | covered: `movement-motivation` "hold still" |
| C8 | Give dialogue its time | C [00:04:36] | 2 (C, JOEY) | catch | catch | n/a | covered: `generated-shot-sourcing` "a spoken line is a duration claim" |
| C9 | Write the light as source, split, colour | C [00:05:29] | 1 | catch | catch | n/a | covered: `lighting-as-dramatic-instrument` |
| C10 | State a brightness split as frame area, with one dark accent | C [00:06:20]-[00:08:12] | 1 | amendment (boundary), Phase 5, render-bound | partial | 1/2/1 | untriaged: one voice, prose only, no proof designed |
| C11 | Let a passing shadow sell scale | C [00:07:46] | 1 | technique, Phase 5 | not opened | n/a | untriaged: home not opened |
| C12 | Sell realism with a real camera's faults and a scared operator | C [00:09:02] | 1 | catch | catch | n/a | covered: `genre-visual-contracts`, `footage-claims-a-camera` |
| C13 | A reference sheet with a headless outfit panel | C [00:10:25]-[00:10:51] | 1 | lead, table | partial | n/a | lead, folded into R11's stills as separate single-figure plates |
| C14 | Give references a role line and a short description | C [00:11:43] | 1 | catch | catch | n/a | covered: `reference-role-map`; H3 `subject_definitions` |
| C15 | The hosted model defaults to 720p | C [00:01:22] | 1 | currency, table | dated fact | n/a | currency, hosted only, no clock moved |

Admission: auto=0/4/0, fp=0. No miner auto-accepted a row, so none could die here. Leads 10 (K1,
K2, K4, K10, K11, K16, C1, C4, C6, C13), caught 17, untriaged 3 (K15, C10, C11), currency 2.

**Scoring reasons.**

- **K2, 1/3/1, net -2.** A boundary of the emphasis-syntax paragraph (G 1). The miner scored R 1. The
  lander re-ran the rewrite test. The paragraph's standing sentence says section-break markers are
  runtime features over caption-class models, and that language-model-encoder pipelines "ignore them
  or read them as literal text". H3 runs a language-model encoder and documents named sections as
  load-bearing. The miner's wording keeps that sentence true only by re-scoping "section-break
  markers" to exclude named sections. That is a scope rewrite (+2). The dialect step itself, "the
  rewriter's output form is the caption form", is inference: the guide names a rewrite output, not a
  training caption (+1). Render-bound in any case.
- **K10, 1/2/1, net -1.** One voice, prose (R 2). The silence half is already in `reference-role-map`.
- **C6, 2/1/1, net 1.** No home says anything about the non-speaker in a dialogue
  (`performance-direction` opened in full; its zero-beat section covers set dressing; rule 5 bounds a
  performer but assumes the performer has the beats). G: boundary 1 + convergence 1 (C, and JOEY's
  verbatim prompts). R drops from 2 to 1: the vendor's own three-line example writes a mouth-closing
  clause after every line ("She closes her lips and guards the cookie while <Subject 4> pulls the dog
  back"), which is a primary for the speech-channel half. The body-keeps-performing half still rests
  on prose. Render-bound: it changes what a generator is told, so it cannot land without a verdict.
- **C10, 1/2/1, net -1.** One voice, prose.

## Opposite defaults, with the discriminator

- **The listener.** K's prompt and R10 keep the listener's speaking light "steady", and the corpus
  says "state who stays silent". C says a still listener "looks fake straight away". **Discriminator:
  which channel are you briefing?** The listener's speech channel stays shut (mouth closed, or the
  speaking light steady). The rest of the body keeps performing (breath, swallow, the eyes going to
  the speaker). Both voices are right about different channels.
- **Reference sheets.** C packs three panels into one image. Our H3 lesson is separate single-figure
  pictures. **Discriminator: does the model bind a role per picture?** H3 does (`<Picture N>`), so
  split the panels.
- **Labels in the prompt.** K's template document drops the headings and his video prompts keep them.
  His miner reads that as still prompts with one subject against video prompts that carry
  references, a cast, a speaker and sound. That is the miner's inference; K never states it.

## Promotion read

| Claim | Result |
|---|---|
| The H3 guide's six sections are the "rewrite output format" | **Confirmed, fetched raw by the lander.** Title: "Full-Reference Mode Rewrite Output Format Guide". Section 1 lists the six sections in order |
| `(Sx)` at each vocal event; `[Shot N]` marks cuts | Confirmed, guide 5.1 and 5.4, verbatim as the miners quoted |
| H3's own two-speaker example gives the speakers separate shots | **Confirmed, and sharper:** three shots (S1, S2, S1), with cuts at 00:03.000 and 00:05.000. A continuous take with an exchange appears nowhere in the guide |
| C: "The H3 guide has no non-speaker rule" | **True as a rule, incomplete as a read.** Neither miner reported that each line in the vendor's example is followed by a mouth-closing clause ("She closes her lips", "He closes his mouth into an apologetic smile"). R11's brief now adds that clause after each line |
| K: `detailed_description` norm is 350-500 words | Confirmed, guide 5.2, which adds "Dialogue-dense content prioritizes fitting the complete spoken timeline rather than mechanically reaching a word count". Both replica prompts are dialogue-dense and stay under 350 |
| H3's trained range is 124-362 frames, so 15.1 s is the ceiling | Confirmed in `comfy_extras/nodes_minimax_h3.py` lines 105, 131 and 266. 362 = 17 x 21 + 5 sits on the 17k+5 grid, and so do 345 and 209 |
| Models on disk | Confirmed by listing: `minimax_h3_ref2va_pruned_int8_convrot`, `minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16`, `minimax_h3_video_vae_int8_convrot`, `minimax_h3_audio_vae_fp32`, `qwen3vl_32b_minimax_h3_int8_convrot`. ComfyUI was not called |
| K: "the Stamp crop may not read as one figure" | **Resolved.** The lander opened the cast image and cropped it with ffmpeg in scratch: `crop=512:730:652:130` holds Stamp alone (red eye slit, belt hammer, grey-green plates) on the concrete wall. No neighbour shows at the right edge from width 512 |
| C: "R5's five-picture s7 is unrendered" | **Updated.** R5 has since rendered s1-s5 (`results.jsonl`). s1 ran with 4 reference pictures at 158 frames. s6 and s7, the 5-picture graphs, are still unrendered. So R10's 4 pictures are proven on this graph, and R11's 5 are not |
| R5 graphs take a first frame | **Corrected.** R5's graphs pass every picture through `ref_images.ref_image_N` with `ref_image_size: match`, and there is no first-frame input. "<Picture 1> is the look of this shot" is a role line on a reference. R11 still crops that still to exactly 1280x704 so that `match` has nothing to distort |
| gravitone seams: one prose `motion` line per clip, 124 frames fixed | Confirmed at gravitone HEAD 6331ec94 in the clip submitter: the frame count is a fixed 124 at 1280x704, and the clip prompt is the motion line plus " The shot ends on: " and the end scene, with no speaker IDs. The trailer skill's Stage 2 names "speech with a robot and no mouth" as an open sound test, and Stage 3 says "one shot per 5.2 s H3 clip at most" |
| R11 cost "17-20 GPU min a take" | **Raised to about 45 min for 2 takes.** R1's 294 frames took 1036 s. Linear scaling gives 362 frames about 21 min, and attention grows faster than the frame count. The row carries 45 |

Fetches: the miners made 9 (K: the page, two documents, one style file, the guide; C: the watch page,
the description, comments, one search, the site). The lander made 1: the guide, raw.

## Phase 7.5

Nothing landed in the upper layers, so no applied row is owed. `simulation` was not used anywhere.
Both seams are designed and not applied: the dispatch forbids a project change in this run.

## Held rows

- **`shift-replica-r10-robot-form`**, kind `replica`, about 45 GPU min, `machine: Lynx`. Two mouthless
  robots from the trailer's own cast trade one line each in one handheld two-shot, at 8.7 s.
  Six-section form against one block, with the same words, the same four single-figure pictures and
  the same two seeds per arm: 4 clips. Attribution is traced by each robot's own light, masked and
  read against the clip's own two utterances. The outcomes are fixed on the row before rendering.
  Answers K2, K4 and K10, and whether gravitone's clip submitter should emit the sectioned form.
- **`shift-replica-r11-alibi`**, kind `replica`, about 45 GPU min. A canal-boat galley scene with our
  own cast (two sisters, Nell and Tess) and five spoken lines plus one snort, in one locked take at
  H3's ceiling of 362 frames (15.1 s), six-section form, 2 seeds. The lines are C's, word for word from
  captions. The speakers are reconstructed, and line 2 is ambiguous. Answers whether a dialogue scene
  can be one long take, whether the right human mouth moves on each line, and C6, the listener.

Both use only what is on disk. Stills come from Codex CLI image_gen, never the retired still route.
Pictures are single-figure crops. One locked shot is one `[Shot 1]`, with no `[Shot 2]` mark anywhere.
There is no third-party IP, no real person and no account. Each row says what each possible result
means, so nobody is needed mid-proof. The operator's verdict comes at the end of the batch.

## Proposals, not landed

1. **C6, `performance-direction`, a section after "The zero-beat performance".** Drafted for after
   R11, with no proper nouns:

   > **The listener is a performer.** In a shot where two figures talk, the one not speaking still
   > needs beats of their own during each line: a breath, a swallow, the eyes going to the speaker, a
   > reaction to what the line says. Their speech channel stays shut: the mouth closed, or for a
   > figure with no mouth, its speaking element steady. Close the speaker's mouth at the end of the
   > line too, in the same sentence. Two failures sit on either side. A listener with no beats freezes
   > and reads as a cutout waiting for a cue. A listener whose speech channel moves takes the line
   > away from the speaker. Brief both halves on every line, and read the take for both: the
   > listener's face moves above the frozen floor while their mouth stays below the speaker's.

   It re-enters Phase 5 on R11's verdict. A pass on both seeds adds a measured observation (R to 0,
   net 2) and still needs a third voice or a refutation to clear +3. This is where the plan's
   expected `cinematic-language` amendment belongs. The golden path's decision order is untouched.
2. **K2, `prompt-dialect-matching` § emphasis syntax.** A scope rewrite, so it stays the operator's
   whatever R10 shows. Banked wording: "A named-section schema is not emphasis syntax. Where a model
   ships its own prompt rewriter whose output is a fixed set of named sections, a pipeline that
   calls the model without the rewriter writes that output form directly. Where no such schema is
   documented, section markers stay what this paragraph says they are." Re-enter with R10's verdict.
3. **gravitone seam, the clip submitter's prompt form.** If R10's sectioned arm wins on attribution
   on both seeds, the clip submitter's prompt builder emits the six sections with `<Subject N> (Sx)` speaker tags for shots
   that carry speech. Measure: the R10 light trace on two trailer shots with speech. Floor: identity
   hold on frames at 0.1 s, the midpoint and the end. Not applied: no verdict, and no change by dispatch.
4. **gravitone seam, dialogue length.** If R11 holds 362 frames on both seeds, the trailer skill's
   "one shot per 5.2 s H3 clip at most" gains a dialogue exception: one locked two-shot up to 15.1 s
   on the reference route. A skill text change in that repo, proposed only.
5. **E-none.** No direction, law, XL row or taxonomy change was made or is needed.

## Plan corrections

- **Dolly zoom is a catch.** `movement-motivation` step 5 names the dolly-zoom and its effect phrasing.
  The plan's "no corpus hit under that name" was wrong.
- **The expected `cinematic-language` amendment belongs in `performance-direction`** (C6). It stays
  banked, with its wording drafted above for after R11.
- **The plan's found-footage proof is dropped.** The source prompt is the manufactured-crowd case of
  `footage-claims-a-camera`, with 7 hard cuts in 10 s against one verified H3 cut. K's page shows no
  scene gravitone wants, which is the plan's own drop condition.
- **The plan's camera-and-light proof (H3 against LTX) becomes lead C4.** The form question rides on
  R10.
- **C's prompts are absent.** The canal-boat lines come from captions, and the speakers are reconstructed.
- The plan called K "thinner, leads at most". His public page holds the cluster's most decision-relevant
  material. The plan also said the rest of his material sat in a paid community. Nothing was found to be
  community-only.
- The plan's first proof asked setup to find H3's length limit. It is in the node file: 362 frames.

## Leads: return conditions

- **K1, K2, K4, K10, C1:** the operator's verdict on `shift-replica-r10-robot-form`. Then a labels-only
  pair (labelled parts against the same parts unlabelled, inside `detailed_description`) if the form
  wins.
- **C6, C13:** the verdict on `shift-replica-r11-alibi`.
- **C4:** a trailer needs the dolly-zoom figure. Then one numbers-against-effect-words pair on H3.
- **K11:** a route without references is proposed for realism shots.
- **K16:** a trailer plan wants more than one cut inside one H3 generation. Then a cut-density ladder.

## Could not verify, and what was not done

- Any on-screen content. Both videos were read from captions.
- C's actual prompts, and the speaker of canal-boat line 2.
- The tails of K's three prompts that are cut short on his page itself.
- K15 and C11 homes were not opened.
- No gravitone file was changed, no project test suite ran, and ComfyUI was not called.
- The board claim and the queue are left to the supervisor.
