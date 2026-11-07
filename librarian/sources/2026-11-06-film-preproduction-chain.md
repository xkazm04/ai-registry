---
source: batch
kind: batch
url: "youtube:EC0lEkIKdjo, youtube:lI71zwGEtUM, youtube:LOUEH3DzLro, youtube:8g3Z1geC8BU, youtube:VGDHR_U3r5k"
title: "Film preproduction chain, /shift batch of 5 videos from 3 channels"
author: "3 channels: Mira AI; Creating with Conor; JOEY"
words: 14621
extracted: 85
accepted: 2
declined: 0
leads: 22
already_covered: 41
untriaged: 14
dispatched: 0
applied: 1
shipped: 0
run_id: shift-film
siblings: 1
fetches: 17
---

# Film preproduction chain, mined under /shift, 2026-11-06

Plan `plan-20261106-150931`, cluster `film-preproduction-chain`. Read from captions and page records:
nothing on screen was seen, and `VGDHR_U3r5k` has no captions at all. Phase 7.7: gate=skipped (unattended
shift); nothing was asked. No proof ran, no ComfyUI call was made, no project changed.

**Convergence counts channels.** M = Mira AI (2,099 words), C = Creating with Conor (2,135), J = JOEY:
L = `LOUEH3DzLro` (3,965), G = `8g3Z1geC8BU` (6,422), V = `VGDHR_U3r5k` (no transcript). L, G and V are
one voice. A fleet tree corroborates and is not a channel.

**Expected yield,** stated by the plan and each miner before its table: mostly catches, one or two
amendments from cross-author convergence, a lead on role seats, no new subject. It held. One miner accept
was a lesson, and no miner accepted an upper-layer row.

## The decision: where the spend gate sits before final render

**No voice has one gate. All three put the strongest gate on the stills-to-motion boundary, and they
differ on what it reads.** That part corroborates "Gate the expensive boundary" in
`phase-order-and-graduation` and adds no rule.

| Voice | Last gate before final motion | What it reads | Conditioning of the paid shot | Who can spend |
|---|---|---|---|---|
| M | A still, per shot, human approves | Identity, wardrobe, set. Writes "animate it, send me both", then reports correcting the still instead [00:09:21] | First frame | Agent holds the connector and is told to ask |
| C | A script validator, human reads nothing per shot | Form only: word band, opener, shot size, through-line [00:03:50]. Reads one still, on the one first-frame block [00:09:03] | References, one block first frame | Agent holds the connector, no control narrated |
| J | A 480p take, human reads it | Action, framing, dialogue [L 00:18:31], [G 00:17:44] | References [G 00:16:53] | No agent credentials: a person pastes each prompt |

**The answer for an agent-run pipeline, as far as these voices go:** settle identity and world on stills
at asset level, gate each shot on what its paid call actually consumes, and use a low-size motion draft for
what only motion can show. That is a synthesis. No voice states it, none measured it, and J, the only
voice with a draft, is not agent-run. On who holds the gate, J's structural arrangement is the only one here
with an enforced limit: `payoff-removal` already says a budget a prompt announces is prose, and the raw vendor
page shows no cap to lean on.

## Discriminators where voices chose opposite defaults

| Question | M | C | J | Discriminator | Status |
|---|---|---|---|---|---|
| Still first, or low-res motion draft | Still | Neither, except one still | Draft | **Two that compose.** What the paid call consumes decides what a still can gate at all. The defect class decides the rung: identity, wardrobe, set read on stills; motion, line order and timing need motion | Behaviour fits on three voices. **A still gates only where it is the literal input holds on all three, and C's one exception is the sharpest evidence.** Render-bound: lead, rows held |
| Batch or per shot | Per shot, serial | Six at once, no draft | Prompts one at a time, draft each, render concurrently [G 00:30:51] | How much of one shot's output the next consumes. M's seven shots hold a set across cuts; C's blocks are hard-cut narration, and the one chained block gets a gate. J is a third case: the gate is per prompt and the render is parallel, so these are two axes and not one | Miner's inference, 0 measurements. Untriaged |
| Beats before assets | Approved script, then "the character sheets, the locations, and the props" [00:03:25] | 13 stills, then the script | Script, beat sheet, tag, build [G 00:04:53], [00:14:20] | Does any shared asset carry a state the story changes? J's figure "gets beat up" [00:14:46]; C's stills hold still, with one exception | **Landed** in `approval-reads-forward` |
| A draft approves the request or the take | none | none | The prompt, three times [G 00:17:19], [00:17:44], [00:31:18]; a wanted sample is carried by upscale, extension or a cut instead | One voice, stated in its own words. Whether the take survives is what the proof reads | Lead, row held |

## Triage

Score rule: upper-layer rows ran under Phase 5, G/R/C. Currency and leads ran under the corroboration table.
Rows not admitted keep the miner's score and were not re-read. Row ids carry the video's letter.

| # | Candidate | Anchor | Voices | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|
| M1 | Do not read a retry price as a deviation's price | [00:05:56]-[00:06:22] | 1 (M) | amendment, Phase 5 | real gap | 1/0/1 | untriaged, promotion read lowers R; one voice, proposal 7 |
| M2 | Paid plates before the free shot plan | [00:05:31], [00:06:22] | 1 (M) | catch | catch | n/a | covered: `phase-order-and-graduation`. Her paid plates follow an approved script; only the camera plan follows them |
| M3 | Check render risk when choosing the story | [00:01:43]-[00:02:09] | 1 (M) | amendment, Phase 5 | partial | 2/2/1 | untriaged |
| M4 | Gate the still before paying for motion | [00:09:21] | 1 (M) | catch | catch | n/a | covered: `gate-before-every-credit-spend`. The evidence for lead C3 |
| M5 | Quote the prompt, composition and cost before spending | [00:05:31] | 1 (M) | catch | catch | n/a | covered: `consent-gates` |
| M6 | Connecting the provider gives spend control | [00:03:00] | 1 (M) | catch | catch | n/a | covered: `payoff-removal` |
| M7 | No claim of an image without a returned artifact or link | [00:03:25], [00:04:40] | 1 (M) | catch | catch | n/a | covered: `cite-evidence-not-descriptions` |
| M8 | Tag locked and recommended; a brief conflict stops at the lock | [00:06:47]-[00:07:12] | 1 (M) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| M9 | Draw hard physical shots to scale before any frame | [00:07:12]-[00:07:38] | 1 (M) | lead, table | partial | n/a | lead |
| M10 | Approve one shot at a time, pilot one package first | [00:08:03], [00:09:21] | 1 (M) | catch | catch | n/a | covered: `gate-before-every-credit-spend` |
| M11 | One job per bot | [00:00:25]-[00:00:51], [00:11:17] | 1 (M) | lead, table | partial | n/a | lead, merged with C16 |
| M12 | Bind a lighting rule to a story fact | [00:04:15] | 1 (M) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| M13 | Derive a relative from a loose reference | [00:05:05]-[00:05:31] | 1 (M) | lead, table | partial | n/a | lead |
| M14 | A hosted generation marketplace exposes an MCP link to consumer chat bots | [00:02:34]-[00:03:00] | 1 (M) | currency, table | dated fact | n/a | lead: vendor page not fetched |
| C1 | Lint the script before any motion render | [00:03:50]-[00:04:16] | 1 (C) | catch | catch | n/a | covered: `phase-order-and-graduation` |
| C2 | Paid shared stills before the script | [00:02:34]-[00:03:50] | 1 (C) | amendment, Phase 5 | partial | 1/0/1 | untriaged, was 2/1/1: its convergence with M is struck. Proposal 2 |
| C3 | A still gates only where the still is the input | [00:04:28], [00:09:03]-[00:09:29] | 3 (M, C, J) | amendment, Phase 5 | real gap | n/a | lead, render-bound, was 2/3/1. Rows `shift-film-draft-1`, `-2`. Proposal 1 |
| C4 | Speech baked into a clip moves the script lock earlier | [00:05:07], [00:10:34] | 1 (C) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| C5 | A head anchor minted before its predecessor exists | [00:09:03]-[00:09:29] | 1 (C) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| C6 | Fix a short take by rewriting, with longer words | [00:05:07] | 1 (C) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| C7 | Word band predicts the take window | [00:03:50], [00:04:41] | 1 (C) | catch | catch | n/a | covered: `delivery-rate-budgeting` |
| C8 | No two consecutive shots the same size | [00:03:50] | 1 (C) | catch | catch | n/a | covered: `process--scene-grammar-progression` |
| C9 | One through-line object in every block | [00:03:24], [00:08:10] | 1 (C) | catch | catch | n/a | covered: `one-anchor-per-clip` |
| C10 | Style key first, everything derives from it | [00:02:34]-[00:02:59], [00:07:43] | 1 (C) | catch | catch | n/a | covered: `draft-proofing-locked-ratchet` |
| C11 | Start frame for the block with a state change | [00:09:03] | 1 (C) | catch | catch | n/a | covered: `generated-shot-sourcing` |
| C12 | Render all blocks at once | [00:09:29] | 1 (C) | catch | catch | n/a | covered: `gate-before-every-credit-spend` |
| C13 | An education script has no fact check | [00:04:41], [00:06:27] | 1 (C) | catch | catch | n/a | covered: `figure-must-cite-a-fact` |
| C14 | Music bed dips under speech | [00:10:59] | 1 (C) | catch | catch | n/a | covered: `music-bed-sized-to-the-finished-cut` |
| C15 | Hosted generation marketplaces expose a connector to chat clients | [00:01:18]-[00:01:44]; vendor page below | 1 (C) | currency, table | dated fact | n/a | **currency, landed** in `process--generated-shot-sourcing` |
| C16 | One chat instead of role seats | [00:01:44] | 1 (C) | lead, table | partial | n/a | lead |
| C17 | Thumbnail text promises, it does not restate the topic | [00:11:25] | 1 (C) | lead, table | partial | n/a | lead |
| L1 | Approve what the paid call will receive | [00:14:42], [00:16:24]-[00:16:49], [00:18:06]-[00:18:31] | 3 (M, C, J) | amendment, Phase 5 | real gap | n/a | lead, merged with C3 |
| L2 | A motion draft approves the request, not the take | [00:18:31] | 1 (J) | amendment, Phase 5 | real gap | n/a | lead, render-bound. Row `shift-film-draft-1`. Proposal 4 |
| L3 | State a fact once, or twice on purpose | [00:15:08] | 1 (J) | amendment, Phase 5 | partial | 1/3/1 | untriaged; merged with G2, not banked, see Held rows |
| L4 | Bind each spoken line to its speaker | [00:17:14]-[00:18:06] | 1 (J) | catch | catch | n/a | covered: `reference-role-map` |
| L5 | A fixed-order prompt spine | [00:14:42] | 1 (J) | catch | catch | n/a | covered: `gravitone` |
| L6 | Write the scene's geometry into the prompt | [00:14:42]; same voice `8g3Z1geC8BU` [00:20:21] | 1 (J) | lead, table | partial | n/a | lead |
| L7 | Drop camera-body and stock names; say what is visible | [00:13:51]-[00:14:17] | 1 (J) | catch | catch | n/a | covered: `lens-effect-language` |
| L8 | Draft low, then resend the same prompt high | [00:18:06]-[00:18:31] | 1 (J) | catch | catch | n/a | covered: `resolution-as-stage-property` |
| L9 | Mid-grey ground, no key light | [00:09:56]-[00:10:48] | 1 (J) | catch | catch | n/a | covered: `reference-shows-only-invariants` |
| L10 | Face, then outfit, then headless sheet | [00:08:14], [00:11:14] | 1 (J) | catch | catch | n/a | covered: `approved-reference-sheet` |
| L11 | Scope a reference to bone and face | [00:12:07]-[00:12:32] | 1 (J) | catch | catch | n/a | covered: `reference-role-map` |
| L12 | Show references to the writer, not the generator | [00:08:40]-[00:09:05] | 1 (J) | lead, table | partial | n/a | lead |
| L13 | Explore on a characterful model, normalize on a clean one | [00:09:05]-[00:09:56] | 1 (J) | lead, table | partial | n/a | lead |
| L14 | Build clean plates | [00:13:25]-[00:13:51] | 1 (J) | catch | catch | n/a | covered: `identity-split-from-state` |
| L15 | Fade distance to avoid a plastic look | [00:14:17] | 1 (J) | lead, table | partial | n/a | lead |
| L16 | World canon as a loadable file, by interview | [00:03:56], [00:05:39]-[00:06:31] | 1 (J) | lead, table | partial | n/a | lead |
| L17 | A bible will carry the voice | [00:17:14] | 1 (J) | catch | catch | n/a | covered: `unreferenced-channels-resample` |
| L18 | Stretch 1080p to 200% with grain instead of upscaling | [00:15:59]-[00:16:24] | 1 (J) | lead, table | partial | n/a | lead |
| L19 | A text agent with no credentials cannot overspend | [00:08:40]-[00:09:05] | 1 (J) | catch | catch | n/a | covered: `gate-before-every-credit-spend` |
| L20 | Model version facts | [00:15:59], [00:16:24] | 1 (J) | currency, table | dated fact | n/a | lead: vendor doc unread |
| L21 | Dated cost point | [00:18:06]; description | 1 (J) | currency, table | dated fact | n/a | lead: no rung split |
| G1 | A draft approves the prompt; carry a take by other means | [00:17:19]-[00:17:44], [00:20:47]-[00:21:13], [00:31:18]; description | 1 (J) | amendment, Phase 5 | real gap | n/a | lead, merged with L2 |
| G2 | State a fact once in the block; beats use the label | [00:28:29]-[00:28:56] | 1 (J) | amendment, Phase 5 | partial | 1/3/1 | untriaged |
| G3 | Shorten before re-rolling a bad motion take | [00:28:29]-[00:28:56] | 1 (J) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| G4 | Separation can recover a joint soundtrack | [00:25:55]-[00:27:11] | 1 (J) | correction, Phase 5 | real gap | n/a | lead, was 2/4/1 untriaged: its proof needs an install. Proposal 3 |
| G5 | Derive the asset roster from the beats | [00:04:53], [00:14:20]-[00:15:11] | 2 (J, M); C opposite | amendment, Phase 5 | real gap | 2/0/1 | **accept, landed in `approval-reads-forward`**, was 1/1/1 |
| G6 | Bake a held prop into a character variant | [00:14:46]-[00:15:11]; description | 1 (J) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| G7 | Give every figure in the shot something to do | [00:13:02]-[00:13:29] | 1 (J) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| G8 | Overlap a hard action across two prompts | [00:28:56]-[00:30:26]; description | 1 (J) | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| G9 | Drop camera-body and stock names | see test | 1 (J) | catch | catch | n/a | covered: `lens-effect-language` |
| G10 | A capture-format number as a look word | [00:24:38]-[00:25:03] | 1 (J) | catch | catch | n/a | covered: `lens-effect-language` |
| G11 | Five named camera moves | [00:23:20]-[00:24:38] | 1 (J) | catch | catch | n/a | covered: `movement-motivation` |
| G12 | Bind the look in the plate | [00:16:27]-[00:17:19] | 1 (J) | catch | catch | n/a | covered: `generated-shot-sourcing` |
| G13 | An exclusion clause does not guarantee silence | [00:25:29]-[00:26:21] | 1 (J) | catch | catch | n/a | covered: `music-spotting-against-picture` |
| G14 | Author variants for persisting damage | [00:14:46] | 1 (J) | catch | catch | n/a | covered: `identity-split-from-state` |
| G15 | Brief an extension from the output | [00:22:04]-[00:22:55] | 1 (J) | catch | catch | n/a | covered: `generated-shot-sourcing`. **Corrects L and V:** the screenshot goes to the text model and the video is the input |
| G16 | Too much dialogue rushes; let beats breathe | [00:18:36]-[00:20:21] | 1 (J) | catch | catch | n/a | covered: `generated-shot-sourcing` |
| G17 | Check runtime before spending | [00:11:19]-[00:11:44] | 1 (J) | catch | catch | n/a | covered: `generated-shot-sourcing` |
| G18 | Read prompts first; stop re-rolling | [00:10:29], [00:32:09] | 1 (J) | catch | catch | n/a | covered: `generated-shot-sourcing` |
| G19 | Reference tags must match how they are attached | [00:15:11]-[00:15:36], [00:27:11] | 1 (J) | catch | catch | n/a | covered: `reference-role-map` |
| G20 | A bible does not carry the voice | [00:13:29], [00:28:03] | 1 (J) | catch | catch | n/a | covered: `unreferenced-channels-resample` |
| G21 | Reference at final size; upscale for the cheap tier | [00:17:19], [00:31:18] | 1 (J) | catch | catch | n/a | covered: `resolution-as-stage-property` |
| G22 | Sweep a plate with motion to get the rest of the room | [00:20:21]-[00:21:13] | 1 (J) | lead, table | partial | n/a | lead |
| G23 | Contrast jumps at an extension seam | [00:22:30]-[00:23:20] | 1 (J) | lead, table | partial | n/a | lead |
| G24 | Bible as a re-uploadable file that flags open questions | [00:08:46]-[00:10:03] | 1 (J) | lead, table | partial | n/a | lead |
| G25 | Grain and bars in post | [00:34:18]-[00:35:09] | 1 (J) | lead, table | partial | n/a | lead |
| G26 | Dated facts | Description; [00:16:27], [00:33:53] | 1 (J) | currency, table | dated fact | n/a | **currency, landed** in `process--generated-shot-sourcing` |
| V1 | Dated spend record for one full music video | Page fields; [LOUEH 00:18:06] | 1 (J) | currency, table | dated fact | n/a | **currency, landed** in `process--generated-shot-sourcing` |
| V2 | A project's credit total excludes standing canon | `Nano Banana Pro` 2.22%; "CTRL WORLD" | 1 (J) | catch | catch | n/a | covered: `reroll-economics-per-credit` |
| V3 | A still gates only where the still is the input | Section above | 3 (M, C, J) | amendment, Phase 5 | real gap | n/a | lead, merged with C3 |
| V4 | Draft low, then resend the same prompt high | [LOUEH 00:18:06-00:18:31]; `stack` | 1 (J) | catch | catch | n/a | covered: `resolution-as-stage-property` |
| V5 | Finish the track, then build picture on it | Description | 1 (J) | catch | catch | n/a | covered: `music-video-production` |
| V6 | Measure generator cuts against the bar grid | Page fields | 1 (J) | lead, table | partial | n/a | lead |
| V7 | A summarizing fetch of a JS page is not an empty result | This run | 1 (J) | lesson, judgment | real gap | n/a | **accept, landed** in `.claude/skills/intake/LESSONS.md` |

Admission: auto=1/20/0, fp=0. Two rows moved by the render clause rather than dying on score. The lane S
accept ran under judgment, as a lesson.

## Why the accepts landed or did not

**G5, roster from the beats: accepted, 2/0/1, at threshold.** G 1 boundary +1 convergence: J states it and
M's designer works from "the approved script". R 0: home read in full, anchors read in both transcripts,
and the gap is real, because a forward list starts from an asset and cannot find one nobody listed. Film
script breakdown clears V2 as training-data convergence. An append: every existing sentence stays true. **Not
render-bound:** it changes no generator call and no acceptance of an output. Its observable is a list, and a
render pair could not tell the arms apart. **Weakness, stated:** neither voice measures a saving, and M's half
is a role brief rather than a tagging pass. J's limit is carried in the wording: his film's main cast already
existed [G 00:07:02], so only locations, props and variants followed the beats. If a reader counts M's half
as not convergence, this is 1/0/1 and should not have landed. **Read at `/intake reflect`, 2026-11-06:** M's half is
soft and at +3 this row banks. It is kept, because no sentence is false, its limits are carried in the wording, and
script breakdown is standing film practice, so the rule does not rest on M's half.

**C2, stills before the script: not accepted, 1/0/1, down from the miner's 2/1/1.** See the promotion read.
What remains is real and is one voice, so it is proposal 2.

**C3 + L1 + V3, a still gates where it is the input: render-bound, lead.** The behaviour is three voices and
the corpus's two premises are read: "it examines the input", and references leave "where and when to the
brief". The local node source confirms the two modes differ: `first_frame` is a frame, and reference tokens "ride
through every sampling step". On paper this clears, but it changes what is accepted before a paid call and its
effect shows in output, so no verdict means no landing. Rows `shift-film-draft-1` and `-2`.

**L2 + G1, a draft approves the request: render-bound, lead.** One voice, 1/2/1. A verdict is an independent run,
so a win reads 2/0/1. Row `shift-film-draft-1`.

**G4, source separation: lead, per the dispatch.** No separator is on this box by the miner's check, and an
install cannot run unattended, so it is not banked. Named lack: a separator on disk. The corpus split it exposes
is proposal 3.

**V7, lesson: landed in lane S.** A real run event, reproduced by the lander on a second page.

## Promotion read

| Claim | Result |
|---|---|
| G: tail screenshot goes to the text model, the video is the generator's input | **Confirmed verbatim** [G 00:22:04] to [00:22:30]: "send it to Claude", then "Set that video as your reference". L and V were wrong that it is a literal input. So it is no still gate and matches `generated-shot-sourcing` "An extension is briefed from the output" |
| C miner: M's paid plates and C's stills before the script "converge" | **Contradicted.** M has an approved script before any paid asset [00:02:34]. What follows her plates is a camera plan [00:06:22], not beats. C's convergence point falls away, and M joins J on beats first. C's row dropped by its +1 |
| C miner: plan's "before render" is true only of motion | Confirmed. "Nothing has rendered yet" [00:04:16] follows the stills [00:02:34] to [00:03:50] |
| C: a start frame "matches exactly" a predecessor that does not exist yet | Confirmed as narrated [00:09:03], and it is "then" generating "the six blocks at once" [00:09:29] |
| M: "generate the image... animate it" against "instead of animating it" | Confirmed [00:09:21]. Her working gate is the still |
| J: "get the prompt right", three times | Confirmed [G 00:17:19], [00:17:44]. L's "simply resend it" confirmed [L 00:18:31] |
| G: runtime overrun and script before tags | Confirmed at the anchors read; [00:11:19] not re-read |
| V: project page record | **Confirmed by a fresh raw fetch**: 45, 4,849, 263.04 s, 3840x2160, generation shares. The summarizer's failure reproduces |
| G's return condition: the short film's raw page | **Ran it.** 34 generations, 11,520 credits, 476.7 s, one motion model at 100% of the stack |
| V miner: a project's figure "may omit discarded takes" | **Softened for credits.** At L's $0.04, $450 is 11,250 credits, within 2.4% of 11,520, and the creator's figure is "wins and failed gens". Generation counts still do not cover the film |
| Plan's proof: 832x480 against 1280x704 | **Defect.** Aspects differ (1.733, 1.818), against `resolution-as-stage-property`: "varies size, never shape". The rows use 640x352, which is an exact quarter |
| Miners' workflow pointers | `b04r2-r2v` names an encoder (`nvfp4_awq`) that is not on disk; the rows name the swap to int8. Its `ref_image_size: match` also scales references to the draft's area, a second variable, so the rows pin `max` |
| Miners' 640x352 evidence | A sample already on record: FL2VA at 640x352 took 116 s against 307 s at 960x544 and "Colour goes teal; useful for motion only". So colour is not judged on the draft |

**Fleet evidence, not a channel.** A media project's video plan already says "cheapest tier that reveals the defect
class", and "A passed probe settles only what it exercised". It also says to "promote the accepted take", which is
the wording row 1 tests. Its plan has no cast system, so it holds no roster seam.

## Phase 7.5

`approval-reads-forward`, roster section: mode `experiment`, verdict `better`, n=1, on `pof`'s seven-beat cutscene
sheet, chosen to falsify because it already passed the forward walk. Declared 4 of 11, walked 11, floor held,
written after one read of the sheet. The application carries the table. The file is unchanged on the branch's upstream.
`.ai/applied.jsonl` in that project was not touched. No render, engine or suite ran. `simulation` was not used.

The currency rows and the lesson owe no row. Leads owe none.

## Held rows

Two rows replace the plan's proof, about 70 GPU min against the miners' 75 to 90.

- `shift-film-draft-1`, about 45 min. Reference route, two prompts, draft, final, and a second-seed final each.
- `shift-film-draft-2`, about 25 min. First-frame route, one prompt, same three clips, plus a table of which defects
  the input still already showed.

**Why this costs what it costs.** Each second-seed final is the noise control: without it, a draft "agreeing" with
its final cannot be told from any two takes agreeing, which is the plan's proof's real flaw. The reference route is the
one J and most of C actually use, and the plan never tested it. The first-frame route is what M uses. It was cut from
two prompts to one, dropping 3 clips of the miners' 12, because its second prompt asks only what row 1 already
asks. Splitting lets row 1 answer alone in a smaller idle window, and a stopped row keeps its clips. **Estimates scale
from a 219 s and a 116 s sample and are not measured at these sizes.** Both rows also record GPU seconds per rung, the
rate card that decides whether a local ladder pays at all.

**Both run unattended:** every prompt, seed and size is in the row, a failed positive control stops the row as a lead
about the pipeline, nothing is owed mid-proof, and every model is on disk. The picks mean what the rows say before anything renders.

Not banked:

- **Repetition (L3, G2).** A fix for its confound is designed in the report, about 20 min. Even a win reads 1 boundary against a
  scoped standing sentence, below threshold, and it is off this decision. The fleet's training ledger is 10 of 17 `not-better`.
- **Separation (G4).** Needs an install.
- **Mirror to scale (M9), relative (M13), head anchor (C5), distance fade (L15), capture token (G10), second figure (G7),
  held prop (G6), overlap (G8), room sweep (G22), bar grid (V6).** Specific in the reports and each one voice. They wait for a second
  voice or a free window so they do not pile up operator verdicts on rows that cannot land alone. That is this run's miss
  against the local-example rule, stated.

## Proposals, not landed

1. **C3 + L1 + V3, on a verdict, under "A probe may change medium" in `asset-vs-disposable-render`:** "A probe also has to be
   something the paid call consumes, or a sample of that call. A shot conditioned on its first frame receives a still, so
   reading the still gates the input. A shot built from references and a prompt receives no frame: a still made to preview it
   approves an image the clip never sees. Gate those shots on their references and prompt, then use a low-size motion draft if
   framing or action must be seen before the spend. Identity, wardrobe and location read on stills under either conditioning, so
   gate them there first."
2. **C2, batch boundary in `approval-reads-forward`.** Its exception owes the list "until the first shot is accepted
   against the asset". In a batch every shot is paid for before any is accepted, so that moment comes after the spend. Wording:
   "Where shots render as a batch, the first acceptance comes after every shot is paid for, so the list is owed at script lock." One
   voice, 1/0/1. Returns with a second batch voice or a priced re-mint.
3. **The corpus disagrees with itself on separation.** `unreferenced-channels-resample` says "the mix cannot be fixed downstream",
   `music-spotting-against-picture` "unmixable afterwards", while `track-map-before-treatment` uses separation on mixes and warns that it
   "leaks". G4's wording is in its report, and it is a rewrite, so it waits for a listening pair.
4. **L2 + G1, on a verdict, under "Promotion, not regeneration" in `resolution-as-stage-property`:** G's revised wording in its
   report, with the sentence on what survives rewritten to the result.
5. **The media project's video plan** says "promote the accepted take". Under row 1 that may need to read "the accepted request",
   or a route that keeps the pixels. A project doc, no change made, and waits for the verdict.
6. **`pof`, cutscene step:** declare the player and soldier links, and add a roster line to the sheet. Waits for build width and its own
   gate. Its local master is 11 behind its origin; the file has no upstream change.
7. **M1, retry price, wording in its report.** 1/0/1 after the read, one voice. Returns with a second voice accepting on a price.
8. **Fleet manifest:** miners found `gravitone` only by directory listing; a miner's `loadFleet` call failed on its return shape.

No law, direction, XL row or taxonomy change was made.

## Leads: return conditions

- **C3 + L1 + V3, L2 + G1:** verdicts on `shift-film-draft-1` and `-2`.
- **G4:** a separator on disk, then the miner's listening pair.
- **M9 + L6 + G22, to-scale geometry and the room sweep:** the skill file's geometry slot read, or the render arm run.
- **M11 + C16, role seats:** a seats-versus-one-agent comparison. J's four skills are a third arrangement with no arm either.
- **M13, L12, L13, L15, L16 + G24, L18 + G25, C17, G23, V6:** a second independent voice with a measurement, or the local example.
- **L20:** the vendor's own model page, which two fetches failed to read.
- **L21:** a rung split. M14: the second vendor's page.
- **Skill files and prompts behind the sponsor's pages:** a browser session. `showPrompts` is true on both project pages, so prompts could
  settle the route question and the repetition row. Neither raw page holds them.
- **G20:** the voice method J promises for a later video [G 00:13:55].

## Could not verify, and what was not done

- Any film, so no draft-against-final or still-against-clip agreement is known from a source.
- Which route any J shot took: no prompts were read. "No per-shot still" is an absence over two transcripts read whole by miners. The lander read anchors.
- What the page fields cover. Credit conversion rests on one spoken figure and one written one.
- Whether validators in C are code or the writing agent checking itself.
- Whether a separator really is absent: the miner checked the default Python only.
- Every miner read `research-map` output filtered rather than whole, so absences rest on scoped greps. The lander's own check for a roster step was a grep of media-generation and one registry query.
- Homes read whole by the lander: `gate-before-every-credit-spend`, `asset-vs-disposable-render`, `resolution-as-stage-property`, `approval-reads-forward`, `phase-order-and-graduation`, `process--generated-shot-sourcing`. Read in part: `generated-shot-sourcing` (ladder, extension, anchor, audio, acceptance sections). Not opened: `review-iteration-loops`, `video-assembly`, `generative-provider-routing`, `agent-chaining`, `hitl-approval`, `music-video-production` golden paths, which the plan listed and no landing touches.
- Fetches: 13 by miners, 4 by the lander (one 404 on a wrong slug), raw, in scratch.
