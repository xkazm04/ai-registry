---
source: batch
kind: batch
url: "youtube:r2UTG2ZyZTU, youtube:MzUV03KouXM"
title: "Editable source over rendered file, /shift batch of 2 videos from 2 channels"
author: "2 channels: JOEY; Mira AI"
words: 7185
extracted: 37
accepted: 4
declined: 0
leads: 8
already_covered: 13
untriaged: 7
dispatched: 0
applied: 1
shipped: 0
run_id: shift-editable
siblings: 1
fetches: 9
---

# Editable source over rendered file, mined under /shift, 2026-11-06

Plan `plan-20261106-150931`, cluster `editable-source-over-rendered-file`. Read from captions, one
vendor page, one prompt pack and one vendor repository: nothing on screen was seen. Phase 7.7:
gate=skipped (unattended shift); nothing was asked. No GPU job ran, no ComfyUI call was made by this
lander, no project changed.

**Convergence counts channels.** J = JOEY (`r2UTG2ZyZTU`, 5,220 words), the same voice as L, G and V in
[[2026-11-06-film-preproduction-chain]] and as `yNMPr6oBozg` in
[[2026-11-06-reference-artifact-for-identity-and-motion]], and it counts once across all three batches.
M = Mira AI (`MzUV03KouXM`, 1,965 words), also a voice in the film batch. Both videos are sponsored by the
host they demonstrate. A fleet tree corroborates and is not a channel.

**Expected yield,** stated by the plan and both miners: catches on edit-as-code, at most one amendment, one
lead, no subject. It held. The plan's expected amendment (revision cost) did not survive, and the one that
landed comes from measurement, not from either source's sentences.

## The decision: which layer is the unit of revision

**The layer below the last sampler. Above it, an edit is a new take. Below it, an edit reaches whatever reads
what it changed.** That is per layer, and one deliverable can hold both.

| Layer in the demonstrated deliverables | Renderer | Unit of revision | Evidence |
|---|---|---|---|
| Notation plan into a generative model | Sampler | The take | Measured, [[2026-11-06-yue2-notation-editing]] |
| Cut, captions, overlays written as code | Function of source | Whatever reads the edit | Measured here |
| Effects written as code | Function of source, if seeded | The effect | Inference from a recipe. Row `shift-editable-code-sfx-proof` |
| B-roll and music bed | Hosted model | The take | The pack: "regenerate that ONE clip" |
| A vendor editor's project file | Agent samples once, above it | The project, by his report | Not testable: After Effects is absent from this machine |

What J retracts is narrower than the headline. He keeps that the look was never the hard part [00:00:52]. He
retracts that an agent cannot hand over a working file [00:01:19]-[00:01:44]. The retraction runs against his past self and
in line with his sponsor. What costs him is the rest: "plenty that I didn't like" [00:02:35], "horrible slop"
[00:09:49]-[00:10:15], "a lot slower way to make a .mp4" [00:15:48]. His earlier statement was not found.

## Discriminators where voices chose opposite defaults

| Question | J | M | Discriminator | Status |
|---|---|---|---|---|
| Where the source lives | A vendor editor's project | Code | **Not the finding the plan expected.** The vendor page offers J's tool an agent-revision prompt too | Struck as the split |
| Who revises the source | A person by hand [00:02:35], who must be able to read it [00:15:48] | The agent, from a sentence [00:02:36], [00:07:51] | **Can the note be stated as an element and a property?** "Logo bigger" can. "Feels jittery" needs a curve read by eye | Miner's inference, unmeasured |
| Where sound comes from | Library samples by hand [00:14:31]-[00:14:57] | Synthesised in code [00:06:55] | Tested in `shift-editable-code-sfx-proof`, which has no library arm because no library is on disk | Open |
| Whether a machine can spot sound | Hosted tools failed reading a video [00:14:31] | The agent wrote the timeline, so it held the stamps [00:06:29] | **Whether a plan exists**, which `picture-as-timing-brief` already draws | Catch, 2 voices |

## Reconciling the two reports

J's report asked that M's accept land with three fixes and that its full walk supersede M's samples. All three
were taken: "frames that read what it changed", the 600-frame evidence, and comparison before the encoder. J's
own two accepts folded into that one landing.

Taken further than either report asked:

- **M's opening, "The renderer decides this, not the plan", was dropped.** It is row 1b in other words, and
  1b stays a proposal. Without it, every standing sentence in the file stays true.
- **Retime was dropped from the upper layer.** It is unmeasured, so it moved to a held arm.
- **The cause was dropped from the frame-order sentence.** M's "corners of scaled elements" is a location, not
  an isolated cause. M's own table files this as a lead, row M15, and it stays one.

## Triage

Score rule: upper-layer rows ran under Phase 5, G/R/C. Currency and leads ran under the corroboration table. Row
ids carry the channel's letter and the miner's row number.

| # | Candidate | Anchor | Voices | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|---|
| M1 | Price an edit by its renderer | J [00:01:19], [00:02:35]; M [00:02:36], [00:07:51]; measured | 2 | amendment, Phase 5 | real gap | 2/0/1 | **accept**, in `partial-regeneration-seams` with J's three fixes |
| J5 | Route differs by where the last sampler sits | J [00:01:19], [00:02:35] | 1 | merged | - | - | folded into M1 |
| J2 | An edit reaches whatever reads what it changed | J [00:18:48]-[00:19:14]; measured | 1 | amendment, Phase 5 | real gap | 1/2/1 | folded into M1. Not landed in `cut-compiled-from-source`, reasons below. Proposal 2 |
| J3 | Compare frames before the delivery encoder | measured | 0 | amendment, Phase 5 | real gap | 1/1/1 | folded into M1. Not landed in `edit-plan-over-regeneration`, reasons below |
| M2, J4 | Narrow "When not to use this" | carried, row 1b of [[2026-11-06-yue2-notation-editing]] | 2 | scope rewrite, Phase 5 | real gap | 4/2/1 | carried, counted in that note and not here. Proposal 1 |
| J10 | Dated run record for an agent-written project | [00:11:31], [00:12:47], [00:13:13]-[00:13:39], [00:14:57] | 1 | currency, corroboration table | real | n/a | accept, one bullet in `process--generated-shot-sourcing` |
| J11 | Hosted connector drives a local motion editor | vendor page; [00:12:47] | 1 | currency, corroboration table | real | n/a | accept, one bullet there. Miner's "each promising editable layers and keyframes" corrected |
| M14 | Vendor route moved since 2026-09-16 | vendor README, skill file | 1 | currency, corroboration table | real | n/a | accept, in this note only. No `verified_on` moved, as the tree was not re-cloned |
| M8 | Build short effects from code | M [00:06:55]; pack skill 3 | 1 | lead, corroboration table | partial | n/a | lead. Row `shift-editable-code-sfx-proof` |
| M10 | "No background music" on each clip prompt | M [00:05:12], [00:06:55] | 1 | lead, corroboration table | partial | n/a | lead. Row `shift-editable-no-music-line` |
| M15 | Frame order changes raster, not values | measured | 0 | lead, corroboration table | partial | n/a | lead. Home `seek-stable-composition-authoring`. Row `shift-editable-b17-revision-bench` |
| J9 | One source fans out to many deliverables | J [00:05:34]-[00:05:59] | 1 | lead, corroboration table | thin | n/a | lead. He never shows a reflow. The reflow arm of `shift-editable-b17-revision-bench` |
| J13 | Generated screens first went unused | J [00:09:22]-[00:10:15] | 1 | lead, corroboration table | partial | n/a | lead |
| J15 | Name the curve and the blur in the brief | J [00:12:22]-[00:12:47] | 1 | lead, corroboration table | partial | n/a | lead |
| J18 | Cut lip-sync audio to whole seconds | J [00:26:04]-[00:26:55] | 1 | lead, corroboration table | partial | n/a | lead |
| J20 | A "10-bit" claim from a hosted model | J [00:22:15]-[00:23:06] | 1 | lead, corroboration table | thin | n/a | lead |
| J1 | Hand over the working file | J [00:01:19] | 1 | catch | - | n/a | already covered: `motion-plate-library`, `edit-do-not-regenerate` |
| J12 | Video-reading tools cannot spot sound | J [00:13:39]-[00:14:57] | 2 | catch | - | n/a | already covered: `picture-as-timing-brief` |
| J14 | Storyboard in text before the build | J [00:11:57]-[00:12:22] | 1 | catch | - | n/a | already covered: `phase-order-and-graduation`. He does not narrate acting on it |
| J16 | Five things to know, "90%" | J [00:15:48]-[00:19:14] | 1 | catch | - | n/a | one tool's manual, and the 90% is unmeasured |
| J19 | A story bible saved generations | J [00:23:06]-[00:24:48] | 1 | catch | - | n/a | film note, same voice and same record, no new vote |
| M3 | Write the edit as code | M [00:02:36] | 1 | catch | - | n/a | already covered: `cut-compiled-from-source` |
| M4 | "Nothing is ever baked in" | M [00:07:51]; pack | 1 | catch | - | n/a | false as stated. `cut-compiled-from-source`: footage is not source |
| M5 | Low-resolution drafts until approval | M [00:03:53] | 1 | catch | - | n/a | already covered: `asset-vs-disposable-render` |
| M6 | Word-timed transcript drives cuts | M [00:03:01] | 1 | catch | - | n/a | already covered: `derived-turn-markers` |
| M7 | Sound map from the timeline | M [00:06:29] | 2 | catch | - | n/a | already covered: `picture-as-timing-brief`, second witness |
| M9 | Sound on everything vs chosen silence | M [00:06:55]; pack | 1 | catch | - | n/a | already covered: `trailer-punctuation-grammar`. The source contradicts itself |
| M11 | One action per clip | M [00:05:12] | 1 | catch | - | n/a | already covered: `performance-direction` |
| M13 | Never prompt for on-screen text | pack skill 2 | 1 | catch | - | n/a | already covered: `checkability-routes-the-pixel` |
| J6 | A source you cannot read is no source | J [00:15:23]-[00:15:48] | 1 | amendment, Phase 5 | partial | 1/2/1 | untriaged |
| J7 | An unreviewed agent-written source is not cheap to redo | J [00:02:35], [00:12:47] | 1 | amendment, Phase 5 | partial | 1/2/1 | untriaged. He never states the comparison |
| J8 | Revision cost beats a re-render | J [00:02:35], [00:15:23] | 1 | amendment, Phase 5 | thin | 1/3/1 | untriaged. The plan's amendment, struck below |
| J17 | Motion is an insert, not the campaign | J [00:19:40]-[00:20:31] | 1 | amendment, Phase 5 | thin | 1/2/1 | untriaged |
| J21 | One-prompt demos hide hand hours | J [00:01:44]-[00:02:09] | 1 | amendment, Phase 5 | thin | 1/2/1 | untriaged. No instance named |
| M12 | Generate long, trim to the slot | pack steps 5, 6; M [00:05:38] | 1 | amendment, Phase 5 | partial | 1/3/1 | untriaged. Self-contradicting on the length |
| M16 | Mix numbers and "2 frames late" | pack skill 3 | 1 | amendment, Phase 5 | thin | 1/2/1 | untriaged |

Admission: auto=1/9/1, fp=2. J2 and J3 were miner accepts that died here. 37 candidates: 4 accepted, 3 folded, 8
leads, 13 catches, 7 untriaged, 2 carried.

## Why the accept landed, and why it is thin

**M1, 2/0/1, at threshold.** GAIN 1 for the boundary case, +1 for convergence. RISK 0: this lander re-ran both
miners' scripts and opened the files. COST S.

The +1 rests on the rule the 2026-09-16 note applied: the corpus reached the discriminator without this source.
Row 1b wrote "only when the render is a function of it" from a sampler measurement, before this cluster. Two channels
report the route independently, and a fleet compositor's author coded the same contract in a comment and a test.

**Its weakness, stated.** Both miners had read row 1b before writing. All the measurements use one composition and one
browser, and three runs of one instrument are not three voices. Neither video states the boundary: they say a source
is cheap to change, not what an edit reaches. **If the supervisor does not count this as convergence, the row is 1/0/1
and should be reverted.** It is a two-paragraph append and one decision rule.

**Render proof.** The home's `use_when` names clips, so the clause was checked. The question is identical or divergent,
which is what [[2026-09-16-hyperframes]] ruled an automated instrument settles and an eye cannot. No operator
verdict is owed, because the row makes no claim about which take is better.

**J2, 1/2/1.** J's convergence was a tutorial aside about parented layers, in a tool nobody ran, plus M's reading of a
seed. Neither states the generalisation, which is the miner's own, and J's miner had read M's report. So the +1 is struck.
J's rewrite test also missed a sentence. It tested "provably untouched, because it is the same data", which does stay true,
but the next sentence says the byte-identical contract "stops being a discipline to audit". Telling a reader to compare
frames before calling an edit local contradicts that on frames, so RISK +2. The home is also a named render-bound area.

**J3, 1/1/1.** M's sentence is a condition on a capture script, stated without a measurement, and training-data
knowledge of encoders is not a second reader. The home is contested: `edit-plan-over-regeneration` is about discrete
beats, and `seek-stable-composition-authoring` already holds the encoder's altitude. "Not a reason to re-review" was
J's own inference from PSNR, and it was dropped.

## Promotion read

Both miners' scripts still existed and were run from copies in this lander's scratch, Edge `--disable-gpu`, no GPU work.

| Claim | Result |
|---|---|
| J's full walk: control 0, caption 119, title 580, curve 242 of 600 | **Exact**, every span. Delivered 264, 600, 600. Keyframes 0, 250, 500. PSNR floors match |
| M's sample: 11 of 11 outside the window identical, 4 of 4 inside differ | **Exact** |
| M's frame order: 0, 6, 9, 3, 1 of 11 | 0, 6, 9, **4**, 1. The shape held. Which frames moved did not all repeat, so the wording gives only the worst case |
| "A shared curve changed 242 frames in 16 separate spans" | **Misleading, corrected.** Five stretches, split 11 times by one frame where both curves cross at the midpoint. Landed as "wherever anything was easing" |
| J's boxes, 8% and 58% | Hold as the largest single-frame box. The union over all frames is 14% and 80%, so "largest" was added in the application |
| New falsifier: do frames with changed state predict frames with changed pixels? | **Yes.** No pixel changed without a state change, across 4 arms. State over-predicted only on invisible frames (1 caption, 20 title) |
| J's 2-frame shortfall in the box pass | Reproduced, 117, 578, 240 against hashes. Not explained. The hash count is what landed |
| J on the vendor page: nine skills, "same computer", the revision prompt | Quotes hold in the raw page. Nine of 18 listed name After Effects. "Each promising editable layers and keyframes" is **false as written**: most promise editable motion, and some descriptions do not |
| M on the pack: placeholder, "may be the wrong thing entirely", "regenerate that ONE clip", the riser line | Quotes hold in the saved pack |
| M: the vendor's `/media-use` covers sound effects, read cut short | Read. Effects come from "HeyGen (signed in); Openverse (credit CC BY); bundled", so **the vendor skill's table lists no synthesis**. `references/audio.md` was not read |
| Plan: "one asset becomes 40", "a change costs 20 minutes against a re-render" | Struck, as J's report found and the transcript confirms. The 20 minutes is one hand-fix pass on a first output. No re-render is timed, and no reflow is shown |
| Plan: B17 as the stand-in | Holds for locality. It stands in for no editor project, and M's demo may not have used the engine at all |

**The skills are marketing until read, and this is how far each was read.** The pack's three files: read whole. The host's
nine: the listing, one prompt and the install steps, no skill file. The vendor's nine: the README and one `SKILL.md`. After
Effects is absent from this machine, so the working-file claim stays a claim.

## Phase 7.5

`partial-regeneration-seams`, condition added. Mode `experiment`, verdict `unmeasurable`, project `gravitone`.

Chosen to falsify: the state-against-pixels pass could have shown a frame changing with nothing reading the edit. It found none.
Target: frames outside the readers come back byte-identical. Floor: a control at 0 of 600, and the edit visibly applied in state.
Both held, on the bench copy only.

The seam was read and not changed. That project's compositor hashes its whole motion object into the particle seed, on purpose
by its own comment, and two look settings stay outside the hash, so one renderer shows both behaviours. **Not a defect.** No path
that edits one motion number was found in the files read, so the project has no arm and no gain to measure. The instrument that
would decide it: one job with one motion number changed, current seed against a seed from the particle fields alone, target the
particle pixels unchanged, floor the bloom change still showing. Its suite was not run. The currency rows owe no row.

## Render proof and held rows

Mode `experiment`, never `render` or `simulation`. Nothing here has a pick yet, so no review page was built; the rows reach the
rolling page when they run. Scratch is left in place for the director.

| Row | Device | Estimate | What changed from M's draft |
|---|---|---|---|
| `shift-editable-b17-revision-bench` | cpu, benchmark, no pick | about 12 min | Arms a and b dropped as measured. `--disable-gpu` written in, naming line 6 of the bench capture script. Literals for the retime made a pre-written list. Clock and bar masked, because they read t directly and would fail every frame. A one-line time map, a no-`scale()` arm and J9's reflow added. M's "about 5 minutes" was too low |
| `shift-editable-code-sfx-proof` | cpu, proof | about 10 min, then an ear | **M's pair 1 could not be blind, as one arm is silent: stated in the row as a plain preference.** Pair 2 is the blind pick. Recipes and stamps written out, because the pack sits in scratch. A floor added from a second PRNG seed. The picture is copied, so no browser starts; a re-capture must pass `--disable-gpu` |
| `shift-editable-no-music-line` | gpu | 35 min, unmeasured | **Models checked on disk, which M's draft left to a memory note.** Prompts written out. A shared first frame pins the picture. A positive control added, and picks given their meaning before rendering, including the void case |

Each row runs unattended and owes nothing mid-proof. Not banked, each with what it lacks:

- **J15, naming the curve.** Agent-written arms: two briefs, then an eye. It needs the agent's text fixed first, or it tests the agent.
- **J18, whole-second audio.** The bench's backlog says no local template carries reference audio, so it would first be a
  pipeline proof, and it is off this decision.
- **J13, flat screen against drawn layers.** It answers by construction on the CPU. A real test needs an agent run.
- **The working-file claim (J1, J6, J7, J8).** Needs After Effects, the vendor plugin and an operator's account. Install and
  sign-in are the operator's call, and nothing else stands in.

## Proposals, not landed

1. **Row 1b, scope of the "When not to use this" clause in `partial-regeneration-seams`,** unchanged from
   [[2026-11-06-yue2-notation-editing]], and it stays a person's call because it narrows a standing exclusion:
   "A plan is a source of truth only when the render is a function of it. A notation plan handed to a generative renderer
   fixes pitch, harmony and bar structure and leaves performance, timbre and production to sampling. When the approved thing is
   a performance, hold it by reference."

   | Arm | Edit | Measured result |
   |---|---|---|
   | Sampler | One chord, same seed, two songs | Sound 1.07 against a new seed's 1.02, and 0.68 against 0.65. Bars before the edit moved as much as bars after |
   | Function of source | One caption string, same source, one composition | 119 of 600 frames changed, 481 byte-identical, control 0 of 600, re-run by the lander |

   Different media and different instruments: the two sides were never one experiment.
2. **`cut-compiled-from-source`, "stops being a discipline to audit".** True of the document, and not of the frames: a one-line
   shared-curve edit changed 242 frames of elements it did not name. Proposed tail: "That holds for the document. The frames
   an edit reaches are whatever reads it, so compare them." A rewrite, so it needs a person. The frames side is now stated in `partial-regeneration-seams`.
3. **A second-sighting candidate.** M15 and the 2026-09-16 lead on order-independence point at the same gap in
   `seek-stable-composition-authoring`: a composition can pass frame-index purity and still differ in raster. Waits for the bench row.

No law, direction, XL row or taxonomy change was made.

## Currency

Vendor repository, read 2026-11-06 at `18fc75dc`: Apache-2.0, about 80k stars. `npx hyperframes skills update`, a Claude Code plugin,
and 9 skills with a core set of 4. The CLI skill's description lists editing the timeline. The 2026-09-16 note read `3704863d`,
and its rescan stays due 2026-11-25. Install stays an operator step. **M's demo cannot be credited to this engine:** its pack
ships a placeholder for the install command, warns against the npm package this README installs, and calls an ffmpeg fallback
"what we call hyperframes".

## Leads: return conditions

- **M8, effects from code:** the picks on `shift-editable-code-sfx-proof`.
- **M10, the no-music line:** `shift-editable-no-music-line`.
- **M15, frame order:** the `descending` and `noScale` arms of `shift-editable-b17-revision-bench`.
- **J9, fan-out:** that row's `reflow` arm, or a practitioner timing a reflow.
- **J13, flat screen:** a second voice, or one agent run flat against drawn.
- **J15, naming the curve:** a blind pick on agent-written arms with a fixed text.
- **J18, whole-second audio:** his promised method video, or a local reference-audio template.
- **J20, 10-bit:** his promised unsponsored video, or a delivered file's pixel format and banding read.

## Could not verify, and what was not done

- Any frame or project in either video, and whether his editor's render is deterministic.
- Which engine M's demo used, and its 31-effect figure.
- Sponsorship terms. J says the integration is sponsored and no more.
- Everything audible. Nobody listened to anything, and the proof rows have not run.
- The J film transcripts are off disk, so anchors into them rest on the landed notes.
- Miner conduct, self-reported and already in the shift log: J's miner sent one `HEAD` to ComfyUI's `/queue`, which changed nothing.
- `ad-concept-development` and `generated-output-grading` were not opened: no accept touches them. The six plan homes were read whole.
