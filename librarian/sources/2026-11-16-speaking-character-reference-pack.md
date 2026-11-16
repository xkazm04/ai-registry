---
source: batch
kind: batch
url: "youtube:r2K2ZvJio7I, youtube:jeMl0OSwDss, youtube:LgeHvWy50aM"
urls:
  - https://www.youtube.com/watch?v=r2K2ZvJio7I
  - https://www.youtube.com/watch?v=jeMl0OSwDss
  - https://www.youtube.com/watch?v=LgeHvWy50aM
title: "Speaking character reference pack, /shift batch of 3 videos from 3 channels"
author: "3 channels: JOEY (six prior rows across two 2026-11-06 notes), Dan Kieft (two prior), Mira AI (two prior)"
words: 10008
extracted: 44
accepted: 0
declined: 0
leads: 8
already_covered: 19
untriaged: 11
currency: 0
dispatched: 0
applied: 0
shipped: 0
held: 1
run_id: shift-speaking-character-reference-pack
siblings: 3
fetches: 12
rescan_when: the held row shift-replica-voice-reference-form has a verdict; or a primary measures a phonetic-coverage voice reference against a plain one on any in-context engine; or 8 weeks elapse (2027-01-11)
---

# Speaking character reference pack, mined under /shift, 2026-11-16

Plan `plan-20261116-085513`, cluster `speaking-character-reference-pack`, board run
`shift-speaking-character-reference-pack`. The question: what reference pack must exist before any
shot so that a character keeps the same face, outfit and voice and can still emote? The decision under
it is what the voice reference says: one plain line, short lines tagged across the character's
emotions, or a phonetic pangram tagged that way. Three miners read the captions in full and fetched
the linked pages. The lander re-read the 11-10 voice replica's records, the gravitone seam and the
home techniques. No render, no GPU, no download. Phase 7.7: gate=skipped.

- **J** = `youtube:r2K2ZvJio7I`, JOEY, "The Free Claude Skill That Gives AI Characters a Real Voice
  (entire workflow)" (3,597 words, read to [00:20:59]). First-party, sponsored by the video host. The
  skill kit and the open project page render client-side, so no prompt, pangram or skill text was
  obtained. The wall was a client API; no login or affiliate flow was followed.
- **D** = `youtube:jeMl0OSwDss`, Dan Kieft, "How I Make Cinematic AI Ads with Fable 5.2 & Seedance 2.5"
  (4,511 words, read to [00:24:02]). The plan called this a second-hand review. It is a first-party
  build walkthrough, sponsored by the same host: a public prompt page (realism-site.vercel.app, read
  in full, "© Dan Kieft · DK Media BV", not reproduced) holds every request, every expanded prompt
  and the results.
- **M** = `youtube:LgeHvWy50aM`, Mira AI, "How to Turn Yourself into an Animated AI Cartoon" (1,900
  words, read to [00:10:11]). First-party tutorial, sponsored by a different host. Its public prompt
  pack (a shared document, no licence stated) was read in full.

**Class and expected yield, stated first:** three sponsored practitioner walkthroughs. The tour halves
are feature demos; the yield sits in stated failures and published prompts. Expected: no accept, a
handful of leads, many catches on sheets, since the corpus owns reference sheets, role maps and style
blocks in depth. That held: 0 accepted, 8 leads, 19 covered, 11 untriaged, 1 dropped, 1 held row.

**Voices.** Three channels. Convergence counts channels, and one correction applies: **J's and D's
speaking-video reference is one host feature, demonstrated by two creators who are both sponsored by
that host.** Under the corroboration table it is one vendor design relayed twice, so it counts as one
observation, not two. This corrects the J miner's "now 2 channels" on the 2026-11-06 S1 row.

**Admission.** The accept bar is **+3**. It comes from `/intake` Phase 5 Step 3 and its v2.21
paragraph as it stands today, and from the current `SCORECARD.md`. Step 4's step-down (three
consecutive `fp=0` runs whose rejected rows a later run had to re-derive) has not fired: the
scorecard's recent rows carry `fp=1` on 2026-11-11. The lander earlier today (`cffd66a71`) read the
bar the same way. The dispatch's older "+3 for the rest of this shift" note dates from 11-06 and was not
the authority here. Nine upper-layer rows went through Phase 5: five were scored and none reached
the bar, and four were vetoed V2. Leads, the application row and the thin host behaviours ran under
the corroboration table. `auto=0/9/0 fp=0`: no miner accepted anything.

## What landed

This note, its ledger lines, and one held row: `shift-replica-voice-reference-form`. No corpus file
changed, and no project was touched.

## What the promotion read found

The lander re-read the records the plan's GPU proof rests on. Five things did not hold as written.

1. **The 11-10 replica never tested a reference on new words.** `shift-replica-voice-refaudios`
   arm A's reference WAV *was* the dialogue line it was asked to speak ("You came all this way for a
   lantern? ..."), read in a premade voice ("Sarah - Mature, Reassuring, Confident"), not a cast one.
   So "A held" shows that H3 ref2va follows a reference that already contains the line. It does not
   show that it carries a voice to different words, let alone to a register the reference never
   voiced. The plan's "same still and seed as arm A" cannot hold either. The Top's cast voice is an
   adult male for a painted wooden toy, while arm A's still is a woman's portrait. The held row uses
   The Top's own kept still.
2. **The route is already chosen.** The operator's sighted verdict of 2026-11-11 reads `ab=A ac=A
   cd1=tie`, `route: ref-audio`. But gravitone's store still reads `outcome: not recorded`,
   `route: dub` (`node pipeline/productions-voice-proof.mts --real --read`, run 2026-11-16). The
   new proof does not open the route. What opens it is a person storing the 11-11 verdict with
   `--set held` (a proposal, below). The new proof decides what the reference clip carries.
3. **The timing conflict is resolved: 89.6 s per clip is the figure on Lynx, and "~63 minutes for a
   3 s clip" is stale.** The 63 minutes comes from the 2026-09-03 dojo cycle on **Wolf**, at about 28
   GB of free host RAM, with the legacy loader flags forcing expert paging (gravitone
   `pipeline/video/README.md`). Those flags were dropped on 2026-09-09 (gravitone `8de4d465`, "they
   cost 30x and bought nothing"), and the same README then measured 48 s for a 640x384x73 H3 clip. On
   Lynx on 2026-11-10, the ref2va graph at 832x448x124 took 89.575 s cold (no cached node) and 80.95 s
   warm (13 cached nodes), from ComfyUI `/history`. The header comment in `comfyH3Ref.ts` still cites
   the Wolf figure.
4. **The sheet seam has no consumer yet.** The D miner proposed a held row on gravitone's head-only
   `SHEET_FRAMING`, gated on "if scout scenes cast full-body frames". The lander's read: the scout
   sheet (`sheets/<c-NN>.png`) is read by the scout decision sources and its own act, and no H3 or
   production call takes it as a reference. The 11-10 replica fed a scout photo frame, not a sheet.
   With nothing downstream, there is no `use`, so no row was banked (R8).
5. **The plan's class for D was wrong** (first-party, not second-hand), and J's real deliverable is a
   generated speaking clip, not the audio clip. Both miners recorded this; the lander confirmed it from
   their quoted transcript lines and from D's prompt page as quoted.

## Candidates

Merged across the three reports. `Voices` names the channels that state the row.

| # | Candidate | Voices | Anchor | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | The voice reference spans the character's registers, tagged | J, M | J [00:07:18]-[00:07:43]; M [00:07:14], pack "Prompt for audio reference" | **Lead, held row** | Phase 5, 3/4/2, V2 | Below. Would rewrite `freeze-the-design-into-a-reference` rule 2 for one engine class. Render-bound with no verdict |
| R2 | The voice reference covers every phoneme (a phonetic pangram) | J | [00:06:25]-[00:06:52]; description | **Lead, in the held row (B against C)** | corroboration table | No corpus home: a grep for phonem/phonetic finds pronunciation and SSML only. Phonetically balanced scripts are the convention for a voice *training* set, not for a few-second in-context reference (training-data read). J's text was not obtained |
| R3 | One plain 4-30 s line is enough | D | [00:05:41], [00:16:01]; page | Lead (arm A's practitioner voice) | corroboration table | All three of his lines are in one calm register, so his evidence covers in-register use only. That is what rule 2 already predicts. He adds no arm, and he sharpens what the held row must test |
| R4 | A generated speaking clip is the character's joint face-and-voice reference | J, D (**one observation**) | J [00:11:09]-[00:12:01], [00:15:52]; D [00:05:35]-[00:06:07], page | Lead | corroboration table | 2026-11-06 S1 (`shift-ref-identity-1`, unmeasurable). H3 has `ref_videos` + `ref_video_audios` (node source read), which have never run here. Not banked: a frames-to-IMAGE loader into `ref_video` is untested, so the row would fail at setup or need a person |
| R5 | Bind the clip as voice only; the model generates the line | M, D | M pack failed vs fixed `@audio1`; D page "Apply this voice only to Dan" | Already covered | catch | `unreferenced-channels-resample` ("controls the voice, never the words, never the performance"). gravitone `speakingPrompt` already runs this mode. M's fix changed three things at once and is confounded |
| R6 | The sheet: one three-quarter face, headless front and back bodies | J, D, M | J [00:10:16]; D [00:03:33]; M pack style-world sheets | Already covered | catch | `approved-reference-sheet` § When the sheet holds a subject ("the identity-bearing surface appears exactly once ... remove its face"). Lander re-read it. D's own real-person sheet prompt keeps the heads, and the one output fetched still shows half a face |
| R7 | Sheet backdrop: mid-grey (D) against pure white (M) | D against M | D [00:03:07]; M pack | Already covered | catch | `reference-shows-only-invariants` § A field at mid tone: the corpus already chose grey, with a better mechanism (tonal centre) than D's light bounce. M gives no reason. **Discriminator:** whether the backdrop's tone is committed into the clip's exposure, and the corpus answers it |
| R8 | gravitone's sheet is head-and-shoulders only | D | gravitone `lib/foundry/scout/sheet.ts` `SHEET_FRAMING` (read) | Lead, **not banked** | corroboration table | Promotion read 4: no consumer, so no `use`. What it lacks: an H3 or production call that takes the sheet as a reference, and a kept beat with a full-body speaking frame |
| R9 | The still model adds skin patches and blurred hair | D | [00:04:25]-[00:04:50], [00:10:55] | Lead | corroboration table | One face, judged by eye, in a comparison won by the sponsor's own model. The model named is the one behind our Codex image_gen. Check at 100% crops when sheets next feed a clip |
| R10 | Two performers given one beat move in unison and read as fake | D | [00:20:31]; page Scene 3 | Untriaged, 2/1/1 | Phase 5 | A boundary for `performance-direction`, re-read: nothing there on two performers sharing a beat. +1 for training-data convergence (animation craft calls it twinning). His own scene-1 shrug is briefed simultaneous on purpose, which is the boundary. D miner's wording kept in its report for a later run |
| R11 | Crop the headless panel at the neck, not the chest | D | page, Mitchell and driver requests | Untriaged, 1/2/1 | Phase 5 | Boundary under `approved-reference-sheet`, which says remove the face but not where to cut. Prose only |
| R12 | A lineup sheet with a size ratio, and the held prop in the sheet, fix relative scale | M, J | M [00:05:59]; J [00:12:01]-[00:12:27] | Lead | corroboration table | `scene-grammar-progression` § When prose cannot hold the geography covers landmark scale as ratios, not character to character. 2026-11-06 G6 (held prop) is the same lead. Two channels, no measurement |
| R13 | Remix three named influences, each decomposed into traits | M | [00:04:17]-[00:05:08] | Lead | corroboration table | `medium-vocabulary-locking` takes every name out. Untested whether three names dilute one attractor. Judged by eye on one pair |
| R14 | Naming one show replaces the character | M | [00:04:43] | Already covered | catch | `medium-vocabulary-locking` § Naming a work imports the work |
| R15 | Ban sheet layout when a frame is wanted | M | pack good prompt | Already covered | catch | `reference-role-map` (each reference controls nothing else) |
| R16 | One style block pasted unchanged everywhere | M | [00:05:08] | Already covered | catch | `style-block-restated-every-call` |
| R17 | Re-make the sheets in the target style first | M | [00:05:33] | Already covered | catch | `approved-reference-sheet` (approved renders become the image half) |
| R18 | Location views from new camera positions, not crops | M | [00:06:24]-[00:06:49] | Already covered | catch | `camera-position-not-focal-length`; `scene-grammar-progression` |
| R19 | A prop sheet for anything in two shots | M | [00:06:49] | Already covered | catch | `reference-role-map`; `motif-establish-vary-payoff` |
| R20 | An underfilled 30 s take fills itself with running | M | [00:08:31]-[00:08:57] | Already covered | catch | `performance-direction` step 1 (beat starvation) |
| R21 | Corrections pasted into a fresh, stateless generation | M | pack fixed prompt | Untriaged, thin | Phase 5, V2 | Nothing found on the idiom (two-subject grep). `partial-regeneration-seams` is the nearest |
| R22 | Location plates hold only what every shot may inherit | D | [00:09:35]-[00:12:11] | Already covered | catch | `approval-reads-forward`; `reference-shows-only-invariants` |
| R23 | Role-map rows re-describe, and contradict, the references | D | page Scenes 1-3 vs Mitchell sheet | Already covered | catch | `reference-role-map` step 3. The published picks show the compromise its sibling technique predicts (the reference won the jacket, the prose won the beard) |
| R24 | The prompt expander overrode a stated lighting constraint | D | page sheets | Already covered | catch | `default-attractor-rejection` § The default also lives in the tooling |
| R25 | Draft cheap, promote the winner; re-roll before re-briefing | D | [00:15:09]-[00:16:52] | Already covered | catch | `resolution-as-stage-property`; `performance-direction` |
| R26 | One batch per call for variety | D | [00:07:51] | Untriaged, thin | corroboration table | Likely one host's batching. No mechanism |
| R27 | Funny through small real details; "no caricature" | D | [00:08:16]-[00:08:43] | Untriaged, thin | Phase 5, V2 | Near `default-attractor-rejection`, not opened for caricature |
| R28 | Reserve half the frame, composite graphics video-to-video | D | page Scene 4 | Untriaged, thin | Phase 5, V2 | 7 of 8 takes drew a line down the middle. Nearest: `overlay-composition-and-safe-area` |
| R29 | Optics as field-of-view degrees | D | page Scenes 1-5 | Already covered | catch | `lens-effect-language` (numbers are register until a controlled pair proves otherwise) |
| R30 | Ask a later take to drop the sheet's props | J | [00:12:27]-[00:13:17] | Untriaged, thin | corroboration table | The author says it is untested. 2026-11-06 J4 |
| R31 | A voice's catalogue language does not bind its reading language | J | [00:08:33]-[00:08:58] | Untriaged, thin | Phase 5, V2 | Our casts read English |
| R32 | Wrap the voice clip as a whole-second black video | J | [00:09:25]-[00:09:51] | Dropped | no use | One host's input type. H3 takes standalone `ref_audios` |
| R33 | A voice described in prose or a bible drifts | J | [00:04:16]-[00:05:06] | Already covered | catch | `unreferenced-channels-resample`; 2026-11-06 G20 |
| R34 | Dubbing after generation breaks in drama | J | [00:05:06]-[00:05:32] | Already covered | catch | `unreferenced-channels-resample`; `identity-split-from-state` |
| R35 | Hand references in at the highest resolution | J | [00:15:01]-[00:15:26] | Already covered | catch | `resolution-as-stage-property` |
| R36 | A speaking reference halves dialogue generations | J | [00:13:42], [00:14:34] | Untriaged, thin | corroboration table | A claim with no count |
| R37 | A voice bank decoupled from faces | J | [00:16:42]-[00:17:07] | Already covered | catch (at the seam) | Already our route: a standalone `ref_audios` clip with any still |
| R38 | Supplied dialogue track against voice-only reference | M | pack failed vs fixed prompt | Untriaged, 1/3/1 | Phase 5 | Would narrow `identity-split-from-state`'s "either direction". The fix is confounded three ways, and the source contradicts itself (its "failed" prompt already holds the corrections) |
| R39 | The clone vendor's own doc says to keep the sample consistent in tone | J (corroboration fetch) | elevenlabs.io instant-voice-cloning doc, fetched by the J miner 2026-11-16 | Untriaged, 1/1/1 | Phase 5 | A primary for rule 2 as written, for clone engines. Citing it is an append to a technique with no new rule, and it waits on R1's verdict so the engine scope can be written once |

The miners filed 44 rows. Six were merged where channels stated the same thing (R1, R4, R6 from
three reports, R7, R12), and R39 is the J miner's corroboration fetch, filed as its own row: 39 rows.
Not extracted: credit prices,
plan promos, image-model comparisons by proper noun, the eagle, and the 24-30 s single take (already
in `process--generated-shot-sourcing`).

**Scored rows** (Phase 5): R1 3/4/2 (G 2 inverts rule 2 for one engine class, +1 convergence J+M; R 2
prose, +2 rewrite), with V2 vetoing it in any case, because the only primary in hand corroborates
the rule rather than the claim. R10 2/1/1. R11 1/2/1. R38 1/3/1. R39 1/1/1. R21, R27, R28 and R31 V2.
None reached +3, and the veto stands on R1 whatever the score.

## R1, R2, R3: the voice reference, and what the held row decides

**Three channels, three forms, and nobody measured:**

| Form | Channel | Evidence |
| --- | --- | --- |
| One plain line | D | Every line he shows is in one calm register |
| Short lines tagged across registers, no pangram | M | 14 tagged lines in the pack; judged by ear |
| A phonetic pangram tagged across registers | J | Text not obtained; judged by ear |

**The discriminator is the engine class.** A clone engine copies the sample's manner along with its
timbre. The vendor's own cloning doc (fetched by the J miner) says to keep "a consistent tone
throughout", and that a very dynamic sample gives "less predictable results". That is rule 2. A joint
audio-video model, given the sample in context with voice-only scope, might take the sample as
identity and take the performance from the line and the prompt. J and M both use that route, and
gravitone does too. The corpus's own measurement on a local joint generator
(`unreferenced-channels-resample`) found the sample "an anchor ... not a target", and it warns that an
unscoped sample conditions its mood into every line. Which of the two H3 ref2va is, when the line asks
for a register the reference never voiced, is open. Only a render answers it. Phonetic coverage (R2)
cannot be separated from emotional coverage in J's design, so the row pairs B against C at matched
registers and length.

**Held row `shift-replica-voice-reference-form`** (`kind: replica`, sighted, estGpuMin 18, Lynx). The Top's
cast v3 voice (`JysajW71lbjo58muHvCz`) reads three original references through gravitone's
`speakWithVoice` on eleven_v3: A, one plain sentence pair; B, five pangram segments, one register
each; C, six short lines over the same registers. That is about 1,000 characters, re-rolls
included, a small spend. The H3 graph is the 11-10 replica's own, seed 20261110 throughout, on The
Top's kept still (scout-codex 2026-11-08 t3 c-20 panel-5). Three new lines (a whisper, a laugh, a
shout) are each rendered against all three references, 9 clips. The operator listens per line, with
the cast preview as the anchor, and answers B against C once. The page states A's length confound.
Every step runs without a person, and an ElevenLabs refusal stops it at setup. The estimate rests on
the 11-10 Lynx timings above.

## Proposals (not landed)

1. **Store the 11-11 voice verdict in gravitone**: `node pipeline/productions-voice-proof.mts --real
   --set held --evidence .ai/shift/replicas/shift-replica-voice-refaudios/verdict.json` (or the
   operator's preferred note). The script says only a person's judgement is stored, so the shift does
   not run it. Until then `productionVoiceRouteOf` reads `dub` and the ref-audio route is refused.
2. **Correct the stale header in gravitone `lib/imaging/video/comfyH3Ref.ts`**: "~63 minutes for a 3 s
   ref2va clip" is the 2026-09-03 Wolf figure, before the loader-flag fix. On Lynx it is about 90 s
   cold at 832x448x124. That is a comment-only change in a managed project, so it is left as a proposal.
3. **After the held row's verdict**: scope `freeze-the-design-into-a-reference` rule 2 by engine class,
   cite the vendor cloning doc (R39), and, if B or C wins, add the reference content to
   `unreferenced-channels-resample` § The reference ... is minted. This is an amendment for the lander
   who reads the verdict.
4. **R4, a speaking-clip reference through `ref_videos`**: bank it only once a frames-to-IMAGE path into
   `MiniMaxH3ReferenceToVideo.ref_videos` has been tried once on CPU-side setup and a production asks
   for facial acting the still route lacks.
5. **R8**: return when an H3 or production call takes the scout sheet as a reference.

## Replication

The cluster's one replica is the held row. Each miner offered one: J's speaking sheet, D's deadpan
close-up on a plate, and M's two-character fetch beat. D's and M's are gated on the voice verdict by
their own reports, and both merge into whatever follows it. J's is R4, which is not bankable today. No
GPU is spent on a replica that nothing would use before the voice question is answered.

## Plan homes

The plan named eight homes. Rows landed against `character-voice-design`,
`character-identity-continuity` (`reference-shows-only-invariants`), `visual-style-locking`
(`approved-reference-sheet`, `style-block-restated-every-call`) and `image-prompt-composition`
(`reference-role-map`, `medium-vocabulary-locking`, `default-attractor-rejection`). Outside the list, they also
landed against `unreferenced-channels-resample` and `performance-direction`. `speech-synthesis-script-writing`,
`multi-speaker-speech-production`, `generated-speech-acceptance` and `voice-io` drew no row: no source
says anything about markup dialects, engine generations, clip grading or a runtime speak path.
