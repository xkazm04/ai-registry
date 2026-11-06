---
source: batch
kind: batch
url: "youtube:v-r-SWMiRo4, youtube:yNMPr6oBozg"
title: "Reference artifact for identity and motion, /shift batch of 2 videos from 2 channels"
author: "2 channels: AI Samson; JOEY"
words: 6021
extracted: 32
accepted: 3
declined: 0
leads: 11
already_covered: 10
untriaged: 5
dispatched: 0
applied: 0
shipped: 0
run_id: shift-ref
siblings: 2
fetches: 9
---

# Reference artifact for identity and motion, mined under /shift, 2026-11-06

Plan `plan-20261106-150931`, cluster `reference-artifact-for-identity-and-motion`. Read from captions and
page records: nothing on screen was seen. Phase 7.7: gate=skipped (unattended shift); nothing was asked. No proof
ran, no ComfyUI call was made, no project changed.

**Convergence counts channels.** S = AI Samson (`v-r-SWMiRo4`, 2,690 words), J = JOEY (`yNMPr6oBozg`, 3,331
words). **J is the same voice as L, G and V in [[2026-11-06-film-preproduction-chain]], and counts once across both
batches.** Nothing here adds a vote to a J row there, and no J row there adds a vote to `yNMPr6oBozg`.

**Expected yield,** stated by the plan and both miners: catches, one amendment at most, no new subject. It held,
lower than that. No upper-layer row landed. Both sources are sponsored by the host they demonstrate.

## The decision: which reference, and how much one may carry

**A sheet or a turntable says who. A driving clip says what moves and how the camera travels. No voice sends a clip
alone, so "does a clip beat stills" has no evidence yet.**

| Artifact | S | J | Status |
|---|---|---|---|
| One image | Loses what the camera never saw [00:08:32], [00:09:24] | - | Corpus agrees (`multi-view-master-reference`) |
| Several views in one sheet | "A vast improvement" [00:08:32], the largest step he shows | Identity on stills, a headless front panel in written notes | By eye, one voice each, on different jobs |
| Turntable clip | Paired with stills, "comparable" but sharper [00:08:59]-[00:09:24]. **No clip-only arm** | None | Unmeasured. Held row |
| Driving clip | Never used | Motion and camera only, never "tagged" in the host's tool | One voice. Held rows |
| Clip with stills | Yes | Yes, by construction | Both pair them, for opposite jobs, so **not counted as convergence** |

Reading, which is the miners' inference and is measured by nothing: the step that matters is one view to several.
What a turntable adds is one shared invention, not new information, since it is generated from the stills. So it is
repeatability rather than accuracy, as S half concedes at [00:10:17]. It is also paid again on every shot.

## Discriminators where voices chose opposite defaults

| Question | S | J | Discriminator | Status |
|---|---|---|---|---|
| What is a clip for | Identity | Motion and camera | **Does the clip's own motion serve the shot?** If yes it is a driver, and identity goes elsewhere. If no, as with a turntable, its motion is the unwanted part and has to be scoped out | Miners' inference, unmeasured |
| Name the clip in the prompt | Tagged | "Never tagged" | **Who typed the input.** J's host tool takes the clip through a typed input, so the prompt has nothing to name. **The local node is S's case:** its prompt must use `<Video k>` | Code and notes read |
| Head on the body panel | Full body and face, head not stated | Headless front | Not an established disagreement: S's prompts are behind a sign-up | `approved-reference-sheet` sides with J. Catch |
| Build or film the motion | - | "Go film it yourself" [00:06:24] | **A camera path is numbers, so build it. A body's weight is what a blockout lacks, so capture it.** The operator's depth route has a camera verdict and no body verdict | Inference. `shift-ref-swap-1` runs on a generated driver and cannot settle filmed weight |

## Triage

Score rule: upper-layer rows ran under Phase 5, G/R/C. Currency and leads ran under the corroboration table. Row ids
carry the channel's letter and the miner's row number.

| # | Candidate | Anchor | Voices | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|
| S1 | A clip used for identity is a third use of the channel | [00:04:44]; vendor doc | 1 (S) | amendment, Phase 5 | real gap | 1/0/1 | lead, render-bound. Row `shift-ref-identity-1`. J gives no second voice: its clip carries motion only |
| S2 | A turntable fixes one invention; gate it as a set | [00:00:52], [00:10:17] | 1 (S) | amendment, Phase 5 | partial | 2/1/1 | lead, render-bound. `shift-ref-identity-1` records drift per take |
| S3 | A sheet spends one image's pixels across its views | [00:02:11]; node code | 1 (S) | amendment, Phase 5 | real gap | 1/0/1 | lead, render-bound. `shift-ref-identity-1` |
| S4 | A moving reference is paid per shot and cut to the shot | Node code; sourcing ledger | 1 (S) | amendment, Phase 5 | partial | 1/0/1 | untriaged; the dated half landed as S5 |
| S5 | The local node's moving-reference mechanics | Node lines 243-364 | code | application, table | dated fact | n/a | **accept, landed** in `process--generated-shot-sourcing` |
| S6 | Name a one-sided feature's side in every prompt | [00:03:54], [00:10:17]-[00:10:44] | 1 (S) | amendment, Phase 5 | partial | 1/2/1 | untriaged. Add-on to a verdict, not banked |
| S7 | Change the outfit under one identity reference | [00:11:35]-[00:12:26] | 1 (S) | amendment, Phase 5 | partial | 1/2/1 | untriaged. Add-on to a verdict, not banked |
| S8 | Show the head on the body panel | [00:01:44]-[00:02:11] | 1 (S) | catch | catch | n/a | covered: `approved-reference-sheet`. Unverified from captions |
| S9 | Generate a 360 to obtain views | [00:03:28]; J at [G 00:20:47] | 2 (S, J) | lead, table | partial | n/a | lead, merged with M9 + L6 + G22 of the film note. J already counted there |
| S10 | Hard detail as the consistency probe | [00:06:26], [00:07:16]-[00:07:42] | 1 (S) | catch | catch | n/a | covered: `camera-position-not-focal-length` |
| S11 | Compare output marks against the reference | [00:05:35], [00:06:26]-[00:06:51] | 1 (S) | catch | catch | n/a | covered: same file |
| S12 | Tag clip and sheet together | [00:04:44] | 1 (S) | catch | catch | n/a | covered: `reference-role-map`. Arm D measures the pair |
| S13 | One clip per cast member | [00:11:09]-[00:11:35] | 1 (S) | lead, table | partial | n/a | lead: a 3-clip render |
| S14 | Video models that accept the method | [00:12:53] | 1 (S) | currency, table | dated fact | n/a | lead: sponsor-linked opinion, vendor pages unread |
| S15 | A summarizer's "navigation only" on a client-rendered doc | This run | ours | lesson, judgment | real gap | n/a | **accept, landed** in `.claude/skills/intake/LESSONS.md`, as the second sighting |
| J1 | Scope body and camera separately | [00:05:59]; notes; vendor formula | 1 (J) | amendment, Phase 5 | real gap | 1/0/1 | **lead, render-bound**, was 2/0/1 accept. Convergence struck, see below. Rows `shift-ref-camera-1`, `shift-ref-swap-1` |
| J2 | Keep identity on stills, motion on the clip | [00:04:18]-[00:04:43], [00:05:33] | 1 (J) | catch | catch | n/a | covered: `reference-role-map`, `motion-plate-library` |
| J3 | Declare the mouths when a clip has performers | Notes | 1 (J) | amendment, Phase 5 | partial | 1/2/1 | untriaged. Proof not banked, see below |
| J4 | One pass cannot swap person, object and scene | [00:05:33]-[00:06:24] | 1 (J) | amendment, Phase 5 | real gap | 2/5/1 | lead, render-bound. `shift-ref-swap-1`. Would correct `motion-plate-library` |
| J5 | Film a stand-in; it becomes the final prop | [00:07:42]-[00:08:08] | 1 (J) | lead, table | partial | n/a | lead: "here's what I think it's for" is a proposal, undemonstrated |
| J6 | Give a driving clip a rights row | [00:03:51]-[00:04:18], [00:06:24] | 1 (J) | amendment, Phase 5 | partial | 1/0/1 | untriaged, was 1/1/1: home read. No legal reading offered |
| J7 | Don't name a clip the runner typed | Notes | 1 (J) | catch | catch | n/a | covered: law `typed-input-owns-its-channel`. The local node is the other case |
| J8 | Map each character to a performer | Notes | 1 (J) | lead, table | partial | n/a | lead: a two-performer clip |
| J9 | Live performance as the motion source | [00:04:43], [00:06:50]-[00:07:42] | 1 (J) | catch | catch | n/a | covered: `motion-plate-library` |
| J10 | Remove objects from a real plate | [00:09:25]-[00:09:53] | 1 (J) | lead, table | partial | n/a | lead. Proof not banked, see below |
| J11 | A vendor bars real faces in reference clips | Vendor doc | vendor | currency, table | dated fact | n/a | **currency, landed**, with a contradiction the miner lacked |
| J12 | Dated spend record | Project page; [00:12:54] | 1 (J) | currency, table | dated fact | n/a | **currency, landed**. Dollar conversion left out: the rate is not shown to be his |
| J13 | Hosted motion tool and reference caps | Vendor page; notes | vendor | currency, table | dated fact | n/a | **currency, landed** for the tool's own page. "2.5 at 50 refs" stays contested: one more report, no reconciliation |
| J14 | Portable prompt package | [00:17:36]; notes | 1 (J) | catch | catch | n/a | covered: `reference-role-map` |
| J15 | Headless front panel | Notes | 1 (J) | catch | catch | n/a | covered: `approved-reference-sheet`. Same voice as L10 |
| J16 | "Old skills" retired | [L 00:03:30]; notes | 1 (J) | catch | catch | n/a | retires nothing: a rename and a split, and no registry file depends on them |
| J17 | A summarizer's title-only read; the raw page held a pointer | This run | ours | lesson, judgment | real gap | n/a | **accept, landed**, merged with S15 |

Admission: auto=0/10/0, fp=1. J1 was the only miner accept of an upper-layer row, and it died at the promotion read.

## Why row J1 did not land

The miner's score was 2/0/1 with one soft point: "the host may run that vendor's model", which it could not establish.
**Settled: it does, so the +1 falls and the row is 1/0/1.**

- S names it on camera, in this batch: inside that host, "I'll be using" the vendor's 2.5 model [00:03:28].
- The host's own navigation lists the vendor's 2.5 and 2.0 under Video Models.
- J's own notes say another of his skills writes prompts for that vendor's 2.0 and 2.5. So his prompt grammar lives in
  that vendor's ecosystem, and the vendor's formula cannot be counted as a reader who never saw it.
- **What stays unknown:** which model the motion tool itself runs. Its page does not say. The convergence needed
  independence shown, so an unknown does not restore it.

**It was also never free to land.** The miner argued that the wording "makes no claim about obedience", so no verdict was
owed. But the row changes what a generator is told, in a render-bound home, and its effect shows in the output. So it is
a lead with held rows under Phase 6b, whatever the score.

**One more thing the host's page shows.** Its motion mode "keeps the motion, camera and timing" as one. Neither of its two
modes separates camera from body, so J's three forms are requests his skill writes in prose, on a tool whose page does
not offer them. That sharpens the question to whether a model obeys the words. Pair `body` and pair `scope` ask it.

**Row 1 of S** also stays below threshold. `yNMPr6oBozg` states no scope on an identity clip. Its only clip carries motion
[00:05:33], [00:05:59]. No voice is added, and the row's route is its own verdict.

## Promotion read

| Claim | Result |
|---|---|
| Plan: "the operator's standing pick of 4 image references is the baseline" | **Corrected, as both miners said.** The workflow's prompt maps four different subjects: blacksmith, robed man, axe and a second hero. The answer reads "H3 4 reference images", "Good enough for recurring characters". So four views of one character have never been judged, and arm A is new |
| Plan: 2 x 2 clips, "about 30 GPU min" each | **Corrected.** One seed cannot separate an arm from a sample. See the rows |
| Plan: B10 or B11 orbit clips as ref_video | **Would be cut.** Code read: over-length clips lose their tail, then fall to 17k+5. 120 and 121 frames both keep 107. All rows use 124 |
| Plan: turntable by TRELLIS and Blender | **Dropped.** A rigid orbit cannot drift or swap sides, which is the failure S warns about at [00:10:17] |
| S miner: turntable by first-frame route from a split frame | **Changed.** S gives the model his images as references [00:03:03]-[00:03:28], and a first-frame route has seen only one side, so its back would be invented and arm C would lose by construction. The row uses the reference route with all four views |
| S miner: one image at `match` adds about 405 video tokens, a same-size clip 14,985 | Confirmed from `video_latent_t` and the 2x2 patch: 15 x 27 = 405, times 37 |
| J miner: patch and references "code read only", unverified | **Confirmed further:** `controlnet.py` lines 62-65 give reference rows a zero control row by design. Still never run here, so it is the camera row's positive control |
| J miner P1: character still on the depth pass of the bench scene | **Defect.** That pass is an axe, a floor and two blocks, and its silhouette dominates the control. A character reference on an axe-shaped depth adds a class swap to a camera test. The row builds its own grey box with a primitive mannequin |
| J miner: bench axe is "own" | **Could not be confirmed.** The bench notes only that its reference was "already in the ComfyUI input dir", and a search of the one project likely to hold it found no origin. So no row uses it, B11's axe passes, or the B04 clips showing it. The rows build every driver from primitives or plain text |
| J miner P2: add a pole to the bench rig | **Dropped.** It needs a rig that [[2026-11-06-generated-asset-to-rig-route]] already refuted, and "if the walk cycle extends" is not unattended. The row generates its driver |
| J miner P2: run later arms "only if the second fails" | **Dropped:** that needs a judgement mid-proof. All arms run |
| Tags | `MiniMaxH3ReferenceToVideo` labels each input for the encoder, and its description requires the same tags in the prompt. The bench's depth template has no reference and no tag, so its camera route has never carried identity. All rows state their tags |
| `ref_videos` | **No workflow on this machine has ever used it** (grep of the bench). Each row therefore stops on a rejected input and files a lead |
| Vendor doc | Re-fetched raw, same 663,966 bytes. Caps, channel list, formula, worked example and face rule all confirmed verbatim |
| J: face rule collides with filming yourself | **Sharper than reported.** The host's motion tool sells "Shoot on your phone", so it is not a blanket rule on that route. Landed that way |
| J: 915 credits, 8 generations, 58.75 s, "like 900" | Confirmed on the raw page and at the transcript |
| J: dollar figure at a list rate | Not landed. The rate he pays is unclear in captions |
| S: "the winner" | "Comparable" in the same breath, on one front view. His final test is described both as clip plus "the image" and as clip plus sheet [00:08:59], so the arm's inputs are unclear. Arm D uses one image and says so |

## Held rows

Three rows replace the plan's two proofs, about 245 GPU min against its 60, and every number there comes from a
sample or arithmetic. All are unmeasured at these settings. **None uses third-party IP or a real face:** every character is
an original stylised figure from plain text, and every clip is built here from primitives or plain text. All models are on
disk by listing, and no row needs the operator before its verdict. Prompts, seeds and sizes are all in the rows. Each
one names its tags, pins 124-frame clips to a 124-frame shot, checks them with `ffprobe` first and stops on a failed
control, filing a lead about the pipeline.

- `shift-ref-identity-1`, about 110 min. S1, S2, S3, S12. Four views, a sheet built mechanically from those views, clip alone,
  clip plus one image, on one hard shot at two seeds. The sheet is composited, so pixels per view is its only variable.
- `shift-ref-camera-1`, about 50 min. J1 and the operator's route. Scoped clip, depth patch, unscoped clip. A grey box
  of primitives gives a depth pass and an RGB pass with one camera.
- `shift-ref-swap-1`, about 85 min. J1, J4, J5. One generated driver with a person, a pole and a static camera. Person only;
  three swaps within a shape; three with a class change; and one arm that asks for the body's motion under a new camera.
  It cannot say what filmed footage would do.

**Not banked, with what each lacks:**

- **J3, mouths.** A driver exists (the bench's spoken H3 clip). The row is off the decision, one voice, on notes only. Held back so it does not pile a verdict on a low-priority row. That is this run's miss against the local-example rule, stated.
- **J10, removal.** This route has never run, its question is not this cluster's, and building the ground-truth scene is a project of its own.
- **S6, S7.** Both are add-ons that only make sense on the winning arm, so they wait for `shift-ref-identity-1`'s verdict rather than a conditional arm.
- **S13.** Waits for the same verdict, since it multiplies whichever route wins.
- **J5** as its own row: `shift-ref-swap-1` arm b is the nearest local read, with no filmed proxy.

## Conditional wording, if a verdict earns it

Not landed. Arm A for each is the file at `HEAD`, and arm B is this text.

**S1, `generated-shot-sourcing`, "The moving reference":** "A clip can also be asked to carry a subject rather than a movement:
a rotation of a character, supplied so that shots share every angle of one look. That is the same channel with its scope inverted.
The clip's motion is now the unwanted part, and a channel that transfers subject, camera and action does not know which you
meant. Check the output for what leaked: a subject that turns unasked, or a camera that orbits."

**S2, `approved-reference-sheet`, "When the sheet holds a subject, not a style":** "A rotation clip generated from the sheet adds no
view the sheet can vouch for. Its in-between angles are one generator's guess, and what the clip buys is that every later shot
shares the same guess. So gate it like a view set before anything is conditioned on it: walk the whole rotation against the
approved views, and reject it if a marking moves, changes side or vanishes."

**S3, same file, "The window and the send count are different numbers":** "A third number sits beside those two: pixels per view.
Where a pipeline scales each reference to a budget, several views in one image share one budget, and fine marks are the first thing
lost. If the call has reference slots to spare, send the views as separate images. Keep the composite for a window too small to hold them."

**S4, `generated-shot-sourcing`, after "trim the reference":** "Check the clip against the length of the shot it conditions as well as
the platform's cap: a pipeline may cut a clip to the generated length without saying so, and a reference meant to show a whole movement
then shows part of one. And price it per call. A still is minted once; a clip's seconds or tokens are paid again on every shot that uses it."

**J1, `generated-shot-sourcing`, after "Choreography transfer":** "The movement inside that scope is not one setting. A clip shows a
body's motion and a camera's path, and these are separate requests: both together, the camera path alone on a new scene, or the body's
motion under a new camera. Say which one the shot wants, then check that the output obeyed. A tool may offer only the first as a mode."

**J4, `motion-plate-library`, lines 65-67.** A rewrite of a standing sentence: "The bound output can depart in shape from what the plate
showed, within limits to measure: a replacement of a different class has to move the way the plate's subject moved, and each extra thing
swapped in one pass spends the same conditioning. Swap one thing at a time when a pass fails, so the failure names its cause."

**J3, same section as J1:** "A clip with people in it also carries their mouths. Decide them as part of the scope: closed, speaking
stated words, or following the clip."

**J6, `generated-shot-sourcing`:** "A clip's rights travel with it. Record where it came from and on what terms before it conditions
anything, as for any acquired asset. \"Sourced\" is not a licence. Motion you staged or built yourself has none of this to record."

## Phase 7.5

Nothing owes a row. The landings are dated facts in an application and one lesson. **No project seam exists to change:** the fleet's one
image-to-clip contract has no clip input and its reference is one still, read by both miners. Grep coverage of other projects was capped.
If a project adds a clip field, the scope and the view set belong there. Leads owe the rows above.

## Proposals, not landed

1. The conditional wording above, each on its verdict.
2. **The hosted model's face rule** should be re-read for 2.5 and for the host's route before any brief promises a filmed performance.
3. **`reference-role-map` step 4** scopes a clip for choreography and never the inverse. S1's verdict decides whether it needs a line.

No law, direction, XL row or taxonomy change was made.

## Leads: return conditions

- **S1, S2, S3:** the verdict on `shift-ref-identity-1`.
- **J1:** verdicts on `shift-ref-camera-1` and `shift-ref-swap-1`. A win reads 2/0/1 as an independent run.
- **J4, J5:** the verdict on `shift-ref-swap-1`; a filmed driver with a recorded origin, for what a body's weight adds.
- **S9 + M9 + L6 + G22:** the render arm, or the geometry slot of J's skill file.
- **S13:** a three-clip render on the winning route.
- **S14:** vendor pages for each named model.
- **J8:** a two-performer clip. **J10:** a built plate with its clean render as ground truth.
- **J13:** vendor numbers for the 2.5 caps. **J's skill files:** one read of the motion skill could promote J3 and J4, and is untrusted text.

## Could not verify, and what was not done

- Either video on screen, so no output, take count or drift is known from a source.
- **Which model the host's motion tool runs.** Neither its page nor the record says.
- S's prompts: behind a sign-up, which nobody submitted. So his turntable wording and his panel are unread.
- Whether a rotating clip leaks motion, what any row costs in time or memory, or whether the patch and references work together. All wait for the rows.
- The vendor doc covers the 2.0 series and S used 2.5. Its "Omni reference input" section sits on a linked page, unread.
- Homes read whole by the lander: `process--generated-shot-sourcing`. Read in part: `generated-shot-sourcing` (moving reference), `motion-plate-library` (binding pass), `approved-reference-sheet` (sheet rules), and `reference-role-map` by grep. Those files take no landing here. Plan homes `visual-style-locking`, `character-identity-continuity`, `image-prompt-composition`, `generated-video-motion-extraction` and `generated-output-grading` golden paths were not opened.
- Node source read from disk: nothing was sent to ComfyUI.
- Fetches: 6 by miners, 3 raw by the lander, in scratch.
