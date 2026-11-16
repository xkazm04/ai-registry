---
source: batch
kind: batch
url: "youtube:IIiq_2MonYg, youtube:TCSR8XGk-wQ"
urls:
  - https://www.youtube.com/watch?v=IIiq_2MonYg
  - https://www.youtube.com/watch?v=TCSR8XGk-wQ
title: "Agent-directed story episode, /shift batch of 2 videos from 2 channels"
author: "2 channels: Skai Generated (second sighting after 2026-11-06-generated-asset-to-rig-route), Creating with Conor (six prior notes)"
words: 4163
extracted: 32
accepted: 0
declined: 0
leads: 6
already_covered: 17
untriaged: 3
currency: 2
dispatched: 0
applied: 0
shipped: 0
held: 1
run_id: shift-agent-directed-story-episode
siblings: 2
fetches: 3
rescan_when: the held row shift-replica-c29-never-the-glass has a verdict; or a source counts retakes with and without an approved location plate on one piece; or 8 weeks elapse (2027-01-11)
---

# Agent-directed story episode, mined under /shift, 2026-11-16

Plan `plan-20261116-085513`, cluster `agent-directed-story-episode`, board run
`shift-agent-directed-story-episode`. The question: how does an agent take a short story from idea to
finished shots without losing the plot or the continuity? The decisions under it are three. Which story
form is written and approved before any image? When is the shot breakdown shown? Is a continuity fault
fixed by editing the still and adding a rule to later prompts, rather than rolling again? Two miners read
the captions in full and fetched the linked material. The lander re-read the transcripts at the anchors,
the home techniques, and gravitone's scout outline records (read only). No render, no GPU, no download.
Phase 7.7: gate=skipped.

- **S** = `youtube:IIiq_2MonYg`, Skai Generated, "How To Make Viral 2D AI Animation Videos With Claude
  Code" (1,984 words, read to [00:08:27]). A second-hand practitioner review: a sponsored demo of the host
  it promotes, with affiliate links. Its build half carries the evidence. The public prompt pack (a shared
  document, no licence stated) was fetched as text and read in full. It holds the story, the character
  sheet prompt, the director agent prompt, 13 image prompts (several of them edits), 13 motion prompts and
  the narration. It does not hold the story-writing prompt.
- **C** = `youtube:TCSR8XGk-wQ`, Creating with Conor, "The Claude + Seedance 2.5 System for AI Micro
  Dramas" (2,179 words, read to [00:16:06]). A second-hand practitioner review, sponsored. The prompts sit
  behind an affiliate sign-up, which we do not make, so they were reconstructed from the captions.

**Class and expected yield, stated first:** two sponsored walkthroughs of the same chat-to-shots loop.
The corpus owns story structure, approval order and partial regeneration in depth, so the expectation
was catches, at most one boundary, and a remake. That held: 0 accepted, 6 leads, 17 covered, 3
untriaged, 2 currency lines, 1 held row.

**Voices.** Two channels, and convergence counts channels. They converge on four things the corpus
already holds: show the breakdown and prompts before paid generation, a character sheet as the identity
source, simple motion, and story before images. They converge on one thing it does not hold: derive a
place's other frames from one approved parent (A7). They chose opposite defaults on text (A15). The
discriminator is below.

**Admission.** The accept bar is **+3**. It comes from `/intake` Phase 5 Step 3 and its v2.21 paragraph
as they stand today, and from the current `SCORECARD.md`. Step 4's step-down has not fired: the
scorecard's recent rows still carry `fp=1` on 2026-11-11. The landers earlier today read the bar the
same way. The dispatch brief's "+3 for the rest of this shift" note dates from 2026-11-06 and was not the
authority here. Five upper-layer rows were scored, and none reached the bar. Leads and the two
currency lines ran under the corroboration table. `auto=0/5/0 fp=0`: neither miner accepted anything.

## What landed

This note, its ledger lines, and one held row: `shift-replica-c29-never-the-glass`. No corpus file
changed, and no project was touched.

## What the promotion read found

1. **The P1 keep belongs to the old outline, not the rethink.** The S miner wrote that c-29 "already has
   the three-beat form and a kept P1 verdict". The operator's P1 verdict of 2026-11-16 (`keep`, in
   `plot-verdicts-1116.json`) was given to "Operation Water Glass", with the note that every idea was
   "extremely mediocre" and never asked why anyone should watch. "It Was Never About the Glass" is the
   Fable rethink written after that verdict, and it changes the plot: a heist voice, two failed attempts,
   and the chair as the real score. Nobody has judged the rethink. It is waiting on the operator's
   to-keyframes picks. So the held row carries two blockers, not one.
2. **c-29 is photoreal, not 2D.** Its `look` is "photoreal domestic noir" at cat height. Skai's rule that
   fast motion warps a drawn character (A10) is a boundary of drawn styles, and the remake does not test
   it. The parts of S's method that do transfer are not about style: approving shared assets first,
   showing the breakdown, fixing a still by edit, the per-shot invariant, cause chains in motion prompts,
   and text in the edit.
3. **The 2,000 credits were clip retakes, and the source's own lesson is the keyframe lock.** The
   transcript says the retakes went "mostly fixing those gates" [00:07:37], and the lesson drawn is "Lock
   every key frame before you animate it" [00:08:02]. So the gate came back in motion after the stills
   were edited, which is why the invariant line went into the motion prompts. The S miner read the bill
   as the cost of skipping location approval. That reading fits `approval-reads-forward`, but the source
   does not separate the two causes. A18 stays a catch either way, against that technique and
   `identity-split-from-state` step 5 (emit the invariant into the motion hop).
4. **A3's home was wrong.** `reversal-anatomy`'s "escalate once" governs the escalation step of a
   factual reversal. A comedic try-fail ladder is not a reversal. It is a chain of attempts linked by
   "but", which `but-therefore-beat-linking` already tests. So the ladder's rung count is not a boundary
   on `reversal-anatomy`. The home is contested (+1 RISK), and the row stays untriaged.
5. **The remake's clip cost is measured, not guessed.** gravitone's LTX-2.5 image-to-video graph
   (`pipeline/video/ltx-i2v-api.json`) already does "generate at half size, then a latent x2" inside one
   graph. It measured 101 s for a 5 s clip at 960x576 on 2026-10-22. The separate x2 upscale (22.6 min a
   clip in the gpu-bank table) would cost about 290 min for 13 shots, so a speed-over-quality rough skips
   it. That is the basis of the held row's estimate.
6. **The rethink names its own cheapest tests and fallbacks.** These are: shot 10's glass physics, cat
   identity across shots 2, 6, 9 and 13 from one sheet, the dog roll in shot 7, and the voice. The
   voice risk says to design three voices and pick the least performed, which needs the operator. The
   held row avoids that. It takes the first designed preview as a stated placeholder, because casting
   comes after a video proves the concept (operator, 2026-11-09).
7. **Plan corrections, confirmed from both miners and the transcripts.** Both videos are captioned to
   the end. S's credit bill is at [00:07:12]-[00:08:02], not past the transcript. Conor has six prior
   notes, not five.

## Candidates

Merged across the two reports: 32 miner rows became 28. `Voices` names the channels that state the row.

| # | Candidate | Voices | Anchor | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | Write and choose the story before any image | S, C | S [00:00:50]-[00:01:15]; C [00:01:57]-[00:02:16] | Already covered | catch | `short-form-narrative-structure` (`scqa-opening`, `but-therefore-beat-linking`, `reframe-close`); `ad-concept-development/llm-seat-assignment` (the generator offers options, a person decides). C picks the third of five ideas with no criterion, which makes it a counter-case to the operator's diagnosis. S gives a criterion (hook says what went wrong before how; every fix makes it worse; the payoff flips it). Neither asks why anyone would watch. rethink-1116's `whyWatch` already does |
| A2 | Give the model the form, one specific situation and the character, never "write me a funny story" | S | [00:01:15] | Already covered | catch | `divergence-against-the-median`; `creativity-template-mechanisms`. The story prompt is not in the pack |
| A3 | A comedic try-fail ladder may climb three rungs in a short | S | [00:01:41] | Untriaged, 1/3/1 | Phase 5 | Promotion read 4: not a boundary on `reversal-anatomy`, whose escalation step belongs to factual reversals. G 1, R 2 prose +1 contested home (`but-therefore-beat-linking` against `reversal-anatomy`). c-29 uses two failed attempts |
| A4 | Size the cast and locations at concept | C | [00:02:08] | Untriaged, 1/2/1 | Phase 5 | `approval-reads-forward` § The roster comes from the same walk tags assets after the beats exist. Nothing makes roster size a cost to cap at concept. Training-data convergence (the micro-budget screenwriting rule) clears V2. S's "single specific situation" is adjacent but is not this rule, so it adds no convergence |
| A5 | Character sheet: views plus only the expressions the beats call for | S, C | S [00:02:58], pack; C [00:03:00]-[00:03:55] | Already covered | catch | `reference-shows-only-invariants` ("a small closed vocabulary ... Mint the variants as one batch"); `approved-reference-sheet` |
| A6 | Prop sheets with no logos and blank plates | C | [00:04:15] | Already covered | catch | `approval-reads-forward` roster walk; `plan-checks-predict-the-expensive-failure` (legible text) |
| A7 | Mint a location's sibling frames from one approved parent | C, S | C [00:04:36]; S pack images 6 and 9 | **Lead, exercised in the held row** | Phase 5, 2/2/1 | Below the bar. G 1 boundary +1 convergence (two channels). R 2: both rest on prose, and neither counted takes. The lander read `approval-reads-forward` and `identity-split-from-state` in full. Nothing says that the sibling angles of an unchanged place derive from the approved parent. `identity-split-from-state` covers only a place the story changes ("edited from the first"). Returns with the held row's verdict |
| A8 | Make same-class props distinct on purpose | C | [00:04:56] | Lead | corroboration table | Nothing on same-class props within one story. Thin: one ring, no failure shown |
| A9 | The agent shows the breakdown and every prompt before the batch; a change regenerates one shot | S, C | S [00:03:23]-[00:03:49], pack Steps 5-6; C [00:05:47], [00:06:20] | Already covered | catch | `approval-reads-forward` (gate each shot on what its paid call consumes, from 2026-11-06-film-preproduction-chain); `style-block-restated-every-call` (named shots are addressable); `edit-plan-over-regeneration` |
| A10 | Keep drawn-character motion simple and the camera locked | S, C | S [00:03:49]; C [00:05:27] | Already covered | catch | `style-block-restated-every-call` (simple sustained motion survives). Promotion read 2: the drawn-style half does not reach c-29 |
| A11 | One rules block restated for the whole episode | C | [00:05:27] | Already covered | catch | Law `style-is-restated-not-remembered`; `performance-direction` |
| A12 | The previous clip as the voice reference | C | [00:05:32] | Already covered | catch, routed | Our route is H3 `ref_audios` (operator, 2026-11-11). The reference-pack cluster landed today (`2026-11-16-speaking-character-reference-pack`) |
| A13 | Write the physical cause chain into the motion prompt, with preconditions in order and negatives naming the out-of-order version | S | [00:05:05]; pack motion 8 | **Lead, exercised in the held row** | Phase 5, 2/2/2, V2 | No home sentence covers precondition order inside one clip (grep over visual-generation and production-ops). `generated-shot-sourcing` warns against packing beats into one clip, and motion 8 packs nine links into 5 s. One channel, no retake count for that shot, so no evidence it worked |
| A14 | Once a body defect recurs, state the part as a count | S | [00:04:40]; pack motion 5, 6 | Already covered | catch | `negative-prompting` (the contract grows by evidence, in countable positive language) |
| A15 | Text on a fixed in-world surface is locked in generation; text carrying story information goes in the edit | S against C | S pack image 11, motion 11-13; C [00:12:31] | Already covered | catch, discriminator | `verbatim-text-locking`; `plan-checks-predict-the-expensive-failure`; `sound-off-first-design`. **Opposite defaults, discriminator:** generate text only when it is a fixed surface the camera must hold across shots, and put text that carries changing story information (a message, a name, a time, a label) in the edit. c-29's blueprint labels are the edit side |
| A16 | Fix a continuity fault by editing the still, not re-rolling | S | [00:05:31]-[00:05:56]; pack images 1, 2, 7-10 | Already covered | catch | `partial-regeneration-seams`; law `edit-do-not-regenerate`; `identity-split-from-state` § State that must persist gets promoted to a reference. Image 9's two-reference propagation is the same move |
| A17 | A recurring prop's invariant is written per shot, with the polarity that shot's still shows | S | pack motion 1, 4, 7, 9, 10 | **Lead, exercised in the held row** | Phase 5, 1/3/1 | `identity-split-from-state` step 5 emits identity "in every frame where the subject appears". It says nothing of asserting the prop's absence where it does not. G 1 boundary; R 2 prose +1 self-contradiction (the transcript says one line went into every prompt; the pack shows per-shot lines, and the miner sided with the pack) |
| A18 | The retake bill came from a recurring element no approved asset fixed | S | [00:05:31], [00:07:37]-[00:08:02] | Already covered | catch | `approval-reads-forward`; `identity-split-from-state` step 5. Promotion read 3: the 2,000 credits were clip retakes, and the source's own lesson is the keyframe lock. The cost evidence fits law `cost-per-usable-output` |
| A19 | A still fix costs a small fraction of a clip re-roll | S | [00:07:37]-[00:08:02] | Currency, note only | corroboration table | About 2 credits a still fix against 48-72 per clip re-roll (24-36x); 74 images cost less than three 5 s clips; the 13 kept clips cost about 770 of about 3,000. One creator, one vendor's credit prices, 2026-11. On our stack stills cost seat time and clips cost GPU minutes, so the direction carries over and the numbers do not |
| A20 | Never ship stills over voiceover | S | [00:06:21] | Lead | corroboration table | A platform-policy claim, unverified against the policy text. Nothing of ours uploads a stills animatic |
| A21 | Scout plot pages should name a try-fail escalation | S (gravitone read) | gravitone rethink-1116 (read only) | Lead, gravitone proposal | corroboration table | `but-therefore-beat-linking`. c-08's 13.0-32.2 s beat is a list ("and then"). The miner's count of escalation words in 7 of 28 files is a keyword count, not a structural read. Proposal 2 |
| A22 | Rewrite a slow opening and leave the rest unchanged | C | [00:02:44] | Already covered | catch | `withholding-budget`; `hook-shape-selection`; law `edit-do-not-regenerate` |
| A23 | Pin the axis to a named landmark | C | [00:06:28] | Already covered | catch | `scene-grammar-progression` (axis discipline, landmark pinning) |
| A24 | Split a long scene; the continuation opens on a new angle | C | [00:07:05]-[00:07:35] | Already covered | catch | `scene-grammar-progression` ("change enough between shots"); `generated-shot-sourcing` |
| A25 | Negative audio direction on native-audio clips ("no added breathing") | C | [00:07:30] | Untriaged, thin | corroboration table | No home. Whether H3 or LTX honours it is untested |
| A26 | In a wordless scene, state positions in prose | C | [00:09:55] | Already covered | catch | `scene-grammar-progression` § When prose cannot hold the geography (a marked schematic beats prose). The corpus holds the stronger method |
| A27 | Spot music on the finished cut in a mood arc | C | [00:11:20]-[00:12:57] | Already covered | catch | `music-spotting-against-picture`; the opposite order is `cue-first-assembly`, already with its own case |
| A28 | A hosted generator and a stock-music library both reachable from a desktop chat agent | C | [00:00:51]-[00:01:42], [00:10:46] | Currency, note only | corroboration table | `generative-provider-routing`. Neither tool is on this box |

Not extracted: credit plans, affiliate offers, and model comparisons by proper noun.

**Scored rows** (Phase 5): A3 1/3/1, A4 1/2/1, A7 2/2/1, A13 2/2/2 (V2 vetoes it in any case), A17
1/3/1. None reached +3. An amendment with convergence tops out at 2 under v2.21, so A7 could not clear
the bar even with RISK 0.

## The held row: c-29 as a whole rough, built with this loop

**Why c-29 and not a new plot.** The plan asked for an original storytime short on a /scout theme. Since
then the operator judged the plot step itself weak, and R18 (a brief-first rewrite of The Vault) was
dropped at its paper stage on 2026-11-11. A fresh plot from a generator repeats the step the operator just
judged. The rethink of c-29 already has S's form, reached without this source. The hook states the
contradiction first ("Everyone thinks it's about the glass."). The escalation is two failed attempts.
The payoff flips the situation ("It was always the chair."). It also carries a `whyWatch`, 13 shots with
first and last frames, and a line-timed narration.

**`shift-replica-c29-never-the-glass`** (`kind: replica`, Lynx, estGpuMin 95, blocked). The run:

1. Mints the shared assets first on Codex image_gen: a cat sheet, a dog sheet, and one parent plate of
   the room, approved against a written forward list per `approval-reads-forward`. Sibling angles are
   edits of the parent (A7).
2. Draws 13 keyframes from c-29's `firstFrame` lines, with the style and identity blocks verbatim. A
   continuity fault is fixed by editing the still (A16).
3. Writes each motion prompt in S's fixed-section form. Every prop invariant follows the polarity of
   that shot's still (A17), and the three attempt shots carry their cause chains (A13).
4. Renders on LTX-2.5 at 704x1280, internal x2 only.
5. Records a placeholder narration voice on ElevenLabs v3, and puts all text in the edit (A15).
6. Stops at the rough cut. It is never marked proven.

**It is blocked on the operator twice:** the to-keyframes pick on rethink-1116 must include c-29, and full
rough videos start only on the operator's signal (standing rule, 2026-11-10). Once started, every step
runs without a person.

It decides two things for the /scout film line. Does a why-watch rethink hold as a whole rough? Do
plate-first approval, edit-not-reroll and per-shot invariants keep the glass, the chair and the cat
consistent across 13 shots without a retake bill? Retakes per shot, with the fault named, are read
beside the verdict and are never the verdict. A kept verdict brings A7, A13 and A17 back to Phase 5 with
a one-machine, one-viewer result.

The cluster had no second replica. Conor's romance micro-drama has no project `use`, and its plot came
from the five-ideas step the operator rejected. Its method lines are folded into the one row. S's own
story, The Crawl, is original and could be remade as written, but it has no `use`, so it is not banked.

## Proposals (not landed)

1. **Held row first, amendments after.** If the c-29 rough is kept and its record shows no
   continuity retakes on the glass and the chair, A7 is a boundary for `approval-reads-forward`: sibling
   angles of a place are derived from the approved parent. A17 is a boundary for
   `identity-split-from-state` step 5: a recurring prop's absence is asserted in the shots that lack it.
   Both are amendments for the lander who reads the verdict.
2. **gravitone, proposal only:** add an escalation line and the but/therefore test to the scout plot-only
   page before keyframes. The seam is the outline step in gravitone `.claude/skills/scout/SKILL.md` ("a
   five-beat OUTLINE with a spec"). No code generates the rethinks; they were written in a session. A
   change there is the gravitone owner's, so the shift did not edit it.
3. **A13** returns when the c-29 rough shows whether the attempt shots' cause chains held on LTX, or when
   a source counts retakes with and without an ordered chain.

## Plan homes

The plan named eight homes. Rows landed against `short-form-narrative-structure`, `production-pipeline-phasing`
(`approval-reads-forward`), `review-iteration-loops` (`partial-regeneration-seams`), `video-assembly` and
`image-prompt-composition`. `trailer-structure` drew one catch (A27's `cue-first-assembly`).
`cinematic-language` was read only as A13's neighbour (`movement-motivation` covers motivated action,
not precondition order). `ending-first-narrative-structure` drew none: no row is about game narrative.
Outside the list, rows landed against `visual-style-locking`, `scene-grammar-progression`,
`ad-concept-development` and `character-identity-continuity`.

## Fetches

Three, all for replication material: S's prompt pack as a text export (HTTP 200, no login) by the S
miner, and C's watch page and its description by the C miner. The lander spent none, and re-read both
cached transcripts at the anchors.
