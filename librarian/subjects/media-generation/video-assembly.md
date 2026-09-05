---
subject: video-assembly
domain: media-generation
last_touched: 2026-09-04
dry_streak: 0
---

# video-assembly

First note: [[2026-08-26-joyai-echo]] - /intake run 23. Subject predates the notes (forged 2026-08-19).

## State

6 techniques, 2 applications (process, react). The subject's posture is that a timeline is a document of record and a generated clip is a candidate held to the same bar as delivered footage. Two techniques took amendments in one run and they are related: both are places where the subject's rules assumed a *separated* pipeline.

## 2026-08-26 - /intake run 23 ([[2026-08-26-joyai-echo]])

- `generated-shot-sourcing` - **adjacency anchoring does not scale to a chain.** The technique called head-and-tail anchoring "the strongest structural defense against mid-clip identity drift"; that superlative is true per seam and false per sequence, because each link's reference is a generation rather than the original, so error compounds while every seam still passes inspection. Landed `pin the origin, roll the recent` with the two bounds a validator in the source asserts (pinned portion strictly smaller than the bank; rolling portion at least one full step wide).
- Strongest evidence of the run: the source implements that policy **twice, independently, at two altitudes** - a shot-level memory bank with its first slots pinned, and a per-layer attention cache with a persistent sink in a bounded window. Different mechanisms reaching one policy is the best available argument that the policy is about long horizons and not about either implementation.
- The consequence worth carrying: **pinning promotes early shots into permanent evidence.** Only accepted material is ever pinned, and the opening of a long chain becomes the most expensive review in the run - which contradicts the technique's own closing advice to generate rough and provisional while the picture is fluid. Written as the stated exception it is, not silently.
- `music-spotting-against-picture` - **when the soundtrack is not separable, spotting moves upstream.** A model emitting picture, dialogue, effects and score as one waveform removes every lever that works by adjusting levels. The music decision survives; its binding moment moves to brief time, addressed in shots rather than timecode, with ducking expressed as an instruction (weaker than an automated duck - verify on the returned clip).
- That amendment also breaks a neighbour's enumeration: `generated-shot-sourcing`'s keep / demote / strip options for baked audio all presuppose separability. Recorded on both sides with a pointer rather than duplicating the material.

## Open leads (banked, with return conditions)

- **Paired memory anchors on the modality that can be empty.** The source selects its audio memory window by maximum spectral energy and then picks the video frame from *that window's* time range - audio chooses the moment, video follows, because a frame is representative anywhere while a voice only exists where there is energy. Real, narrow, one implementation. Return when a second system selects cross-modal memory slots on an informativeness proxy rather than on position.
- Neither amendment has an application. Return when a connected tree runs a chain long enough for compounding drift to be measurable - the measurement is a comparison against the *origin*, not against the neighbour, and that is precisely the review nobody runs.
- Untriaged from the same source: a memory slot that records *why* its selection degraded (falls back to center selection on exception and writes the reason into the slot's metadata). Provenance-of-degradation; small, but the shape fits this subject's document-of-record posture.

## 2026-08-27 - /intake run 24 ([[2026-08-27-video-workflow-batch]])

- NEW technique `motion-plate-library`: the layout-reel/animatic split of traditional animation restored as a sourcing channel - appearance-free motion plates (flat, low-detail, cheapest tier) banked by motion class and restyled at use with the project's references. The plate is the asset, the bound render the disposable; live footage normalizes into a plate too. Sits beside generated-shot-sourcing, which keeps frame-exact continuity cases.
- Two amendments on `generated-shot-sourcing`: **extensions are briefed from the output, not the brief** (the accepted clip is the authority on what happened; the prompt-writer analyzes actual frames before writing the continuation; the clip wins conflicts with intent - 2 sources) and **the anchor imports its maker's texture** (an image-model start frame carries its smoothed finish into the whole clip; mint anchors from the motion model itself - still-subject clip, or a cuts-every-second brief that harvests an angle library; references over anchors when staging must stay free - the rung decision now carries texture provenance and staging freedom as costs, not just control as a benefit).
- The conditioning ladder is becoming this subject's spine: three of the last four findings here attach to it. If a fifth arrives, consider promoting the ladder plus its riders into the golden path body rather than accreting sections.

## 2026-08-27 - /intake run 25 ([[2026-08-27-video-workflow-batch-2]])

- NEW technique `storyboard-grid-conditioning`: the shot plan drawn as a numbered, textless panel grid and attached as one conditioning image - order is what prose loses first; text on panels leaks into shots as watermark-like glyphs; panel count follows beat density and legibility caps it. "Storyboard" had zero prior art corpus-wide before this run.
- `generated-shot-sourcing` took three more riders: **the moving reference** (a clip as conditioning; whole-previous-clip continuity carry beats tail-frame anchoring for mood-bearing scenes; external choreography transfer is mandatory-scoped and trimmed to the exact span), **the import is also the lever** (grade the reference stills before animating - the constructive corollary of run 24's anchor-texture hazard, cross-run convergence one day apart), and **dialogue is a duration claim** (performance-pace seconds; split dialogue-heavy beats at brief time).
- The promotion flagged yesterday is now due: the conditioning ladder carries five riders across two runs (extension-from-output, anchor texture + lever, moving reference, dialogue duration) plus two sibling techniques (motion plates, storyboard grids) that are really conditioning channels. Next structural pass on this subject should rebuild the golden path around a widened ladder - conditioning channels as the spine - rather than accreting a sixth section.

## 2026-08-27 - /intake run 26 ([[2026-08-27-video-workflow-batch-3]])

- `generated-shot-sourcing`: rung-3 construction rule - **paired-panel anchors**. Separately generated head/tail frames disagree about everything unpinned and the model glitches reconciling them; both anchors as two panels of one image, split. One still instead of two, nothing to reconcile.
- `motion-plate-library` got its **first corroboration** (independent creator, one run after forge) and a fourth source: the built previz - LLM-driven 3D blockout with meter-exact numbers, viewport render as the plate. Building is the only source where motion is exact rather than sampled.
- `storyboard-grid-conditioning` third independent author, and a new section: boards chain (N+1 conditioned on N), panels repair (identity re-stated), the panel count is a pacing contract on the clip cap.
- Ladder-promotion pressure now at six riders; the note from run 25 stands and strengthens.

## 2026-08-27 - /intake run 27 ([[2026-08-27-video-editing-batch]])

- NEW technique `cut-compiled-from-source` (9th): the timeline-as-document doctrine taken to its strongest form - the edit authored as a declarative composition and compiled, promoting partial-regeneration-seams' symbolic-source escape clause to an authoring decision. The payoffs: source edits (byte-identical by representation, not by audit), scoped style swaps, edit styles as standing contracts, and a critique pass that reads interval arithmetic instead of watching pixels. Boundary: the footage inside clips stays pixel-land.
- `derived-turn-markers` gained the voice-led derivation source: the word-timed transcript as the reference frame captions, overlays, cut points and highlight selection derive from. Three independent authors in one 4-video batch.
- The subject is now 9 techniques and its center of gravity has shifted: conditioning channels on the sourcing side, compiled-source on the assembly side. The golden-path rebuild flagged twice is now overdue - next structural pass should reorganize around sourcing channels / assembly source / lanes+honesty.

## 2026-08-28 - /intake run 26 ([[2026-08-28-gemini-omni-1-1-flash]])

- **Run 25's own wording corrected one day later, by the vendor it was describing.** The moving-reference amendment landed "continuity carry" as extending from the *whole previous clip*; the platform's API documentation says the model uses **the last 10s** of the clip. The carry is a bounded window **off the tail**, not the artifact - and the announcement that prompted the check said only "up to 10 seconds of prior context", which is compatible with sampling from anywhere. The mechanism was in the docs, not the marketing, because *which* ten seconds is not a selling point.
- New section on `generated-shot-sourcing`, **the extension channel has bounds of its own**: two platform numbers define the channel (window depth, cumulative ceiling) and neither is stable - one platform's window moved from the final second to the final ten in a single release, on a parameter no caller sets, so a sequence reads as continuous or as a series of restarts depending on a version nobody wrote down. The window is a **versioned fact for the vendor ledger, beside the rate card**.
- Three consequences, each anchored in material the subject already owns: what has scrolled out of the window must be **re-supplied, not trusted** (chain drift arriving one level down, answered by pin-the-origin-roll-the-recent); the chain's **cumulative** ceiling means extension does not lift the clip cap but re-denominates it - it buys a larger unit to place the seam between, and a chain run until the platform refuses has let the ceiling choose the cut; and the **increments are quantized while authored durations are not**, so derived durations (beat gap, narration span, music cue) are paid at the timeline in a trim the technique's own decision rules already name as discarding the tail the model composed toward.
- Also corrected in the same file: the moving-reference trim rule moved from **economy to obligation**. It read as "the cheapest edit in the pipeline"; references cap hard (3 clips of 3s on this platform), tight enough that a reference is a *sample* of the material. An unstated span is chosen by the platform, and **a span nobody chose is not a scoped reference however carefully its negative scope was written** - which bites hardest on choreography transfer, where the surviving seconds are the whole instruction.
- Catches, all three where this subject is **ahead of the vendor**: rung-3 head-and-tail anchoring (the corpus carries the mid-clip glitch and the one-cloth rule; the announcement demonstrates the feature and states neither), baked-in audio, and the cheap draft tier (owned by `resolution-as-stage-property` next door, including the true-upscaling-over-re-sampling preference I briefly and wrongly believed was missing).
- **The structural debt flagged on 2026-08-27 is now overdue, and this run made it worse.** That note said the conditioning ladder carries five riders across two runs and the next pass should rebuild the golden path around a widened ladder "rather than accreting a sixth section". This is the sixth section. The content is right and the shape is not; the widened-ladder rebuild is a `/deepen` job on this subject and should be dispatched before the next intake lands here.
- No application. The operator named a consumer project in the dispatch and then declined the row at triage, so no tree was modified. The assessment is banked in the source note: that project's plan generates one clip per frame at a duration **derived from the script's beat gap**, which a quantized 10s extension step cannot express - so the release's headline feature is the one it cannot use, and the cheap draft tier is the one that confirms a decision it had already made. Return when that plan's P3 (multi-shot scenes) is built, where the extension bounds start to bind.

## 2026-08-28 - /intake run 35 ([[2026-08-28-media-generation-batch-4]])

- **The structural debt flagged on 2026-08-27 and marked overdue on 2026-08-28 is now worse, and this run is the reason.** That note said `generated-shot-sourcing`'s conditioning ladder carries riders accreted across runs and that the next pass should rebuild the golden path around a widened ladder rather than adding another section. This run added **two** more. Both are correct content in the wrong shape, and the shape is now the subject's dominant problem. **Dispatch the `/deepen` ladder rebuild before any further intake lands on this subject.** Second consecutive run to say so; first to make it worse.
- `generated-shot-sourcing` gained **rung 3 over an exact graphic**. The paired-panel rule assumes a photographed world where two anchors differ by a camera; a designed graphic (map, chart, board, diagram) has *exact* identity, so a motion model re-synthesises the artwork every frame. That is not the drift the rung resists, it is destruction, and no adherence setting reaches it because the model was never holding the graphic. Landed the authored-diff chain: base state, each later state minted from the one before with a single named addition, states handed over in order. The chain must be cumulative rather than radial or state 3 disagrees with state 2 - the paired-panel failure through a different door. Mechanism boundary: head-and-tail takes exactly two frames, so three or more states fall off it onto ordered references. Ceiling stated: a graphic that must be *right* is composited from a deterministic render, not sampled.
- `generated-shot-sourcing` gained **a third cost of a frame anchor**. The file priced two (staging freedom, imported texture); this is over-pinned *motion*. A frame is one phase of whatever moves, and for cyclic movement the anchor fixes where in the cycle the subject is - pin both members of a symmetric pair and no phase is left to infer, so the figure translates instead of walking. Pin one, mid-stroke, counterpart out of frame. General form: an anchor carries the pose the shot opens on, not the mechanism the shot depends on continuing.
- **Method lesson, recorded here because this is where it happened.** A candidate (the video reference carrying motion state a still cannot) was triaged as a real gap because the conditioning ladder enumerates four rungs and video is on none of them. The file owns it in full two hundred lines later under "The moving reference", with the continuity-carry / choreography-transfer split and the trim rule. **An enumeration near the top of a long technique file is not the file's coverage** - and this file is long enough that its own opening enumeration reads as a boundary it is not, which is the ladder debt surfacing as a triage error rather than as a reader complaint.
- Catch: one soundtrack laid across the whole edit with per-clip generated music stripped. `music-spotting-against-picture` next door **contradicts the source and is right** - a cut that is 100% scored has usually not been spotted at all.
- No application. No tree was opened this run.

## 2026-08-31 - /intake run 28 ([[2026-08-31-3d-documentary-ai]])

- `generated-shot-sourcing` gained **rung 3 across two worlds: the pair stops being a move and becomes a cut.** The ladder's rung 3 carried an explicit denial - "the two anchors must be cut from one cloth", because separately generated head and tail frames "disagree about everything the prompt did not pin" and the model "breaks visibly in the middle of the move". A tutorial source paired a head anchor with a separately generated plate of a *different room* and got no break: the clip covered the anchored space and then hard-cut to the referenced one. Past some threshold of difference the pair stops reading as two views of one scene and reads as a **scene boundary**, which the model renders as an edit. The denial was right about the middle case and over-reached into a third one.
- **The finding is the denial hunt working exactly as Phase 6 describes it** - *where a subject explicitly denies a symmetry, check whether it denied too much.* It is worth recording how invisible this was to the source's own emphasis: the creator narrates the two-world pair as a nice cinematic moment and moves on in nine seconds. He does not think it is interesting. It is *this corpus* that had a rule forbidding it. A source that contradicts a denial without noticing is the cheapest high-altitude finding available, and no triage that ranks candidates by the source's confidence will ever surface one.
- The amendment states the cost rather than just the affordance, which is what keeps it a technique: **the cut lands inside the clip, so the assembly does not own it.** That is this file's own "a seam left to land wherever the cap fell is a cut nobody made", arriving through a door the clip-cap section does not watch - the cap section assumes every cut is a seam *between requests*. Discriminator written in: *does the assembly need to own this cut point?*
- **Application, `simulation`, verdict `better`** ([[2026-08-31-3d-documentary-ai]]). The consuming tree has no video generation anywhere, which made it the wrong place to test the affordance and an unusually good place to test the cost. Three cases from its shipped project: the act-two marker is derived by scanning the scene list and accumulating durations (a merged two-world clip moves it or erases it and the scan returns null); the only readiness signal is a per-scene null picked-frame (a clip spanning two scenes leaves one permanently unpicked while its footage exists); the sync bench carries one offset per clip and cannot move a cut inside one. Each prediction names its falsifier.
- **The structural fact is the better half, and nobody designed it.** That tree could not have been built to say anything about anchor pairs - it makes no motion requests at all. It demonstrates the amendment's cost anyway: one picked frame per scene, one span per clip, one offset. **A clip containing its own cut is unrepresentable there.** The assembly owning every cut is not a policy that project chose and could revisit; it is a shape.
- **THE STRUCTURAL DEBT IS NOW THREE RUNS OLD AND THIS RUN MADE IT WORSE AGAIN.** 2026-08-27 flagged five riders and said the next pass should rebuild the golden path around a widened ladder "rather than accreting a sixth section". 2026-08-28 added the sixth and called it overdue. **This is the seventh, and the file is now 444 lines across 13 sections.** The content of each rider has been right every time and the shape has been wrong every time - which is precisely the pattern the method says stops being a lesson and becomes a rule at three sightings. The rung ladder is no longer a ladder; it is four rungs plus five special-case subsections hanging off rung 3 alone (one cloth, exact graphic, two worlds) and three more off frame anchors. **Escalate: this is a `/deepen` job on `video-assembly` to rebuild the ladder as a first-class decision structure, and intake should stop accreting onto this file until it happens.** A run that finds an eighth rider should bank it as a lead rather than land it.



## 2026-09-04 - wan2gp (intake)

One amendment to `generated-shot-sourcing`, on the **derivation topology of a series
of conditioning images** — found by reading the technique for its unqualified
sentences rather than for its gaps.

The exact-graphic section says to mint each state from the state before it, and warns
that "state 3 derived from state 1 disagrees with state 2 about everything the prompt
did not pin". That is true, and true for a reason the sentence does not carry: those
states **accumulate**, so state 3 cannot be reached from state 1 without re-specifying
state 2's addition. Most anchor series do not accumulate — a set of end-frame anchors
or keyframes are independent variations on one subject — and for those the chain stops
being the route to the content and becomes a pure drift pump, which is the same
failure "adjacency anchoring does not scale to a chain" already names one level up.

The discriminator is now stated (*does each state need what the state before it
added?*), and the three topologies this subject holds — chain, star, and the pinned
bank it already owned — sit in one table. They **compose along a pipeline** rather
than competing: still anchors minted star from one graded master, clips between them
conditioned by the pinned bank, which still has to carry the origin because moving
picture must also follow what just happened.

**The apply step corrected this amendment, and that is the note's real content.**
Applied to a fleet studio that mints frame plates: the tree was **already a pure star
and nobody designed it that way** — references are memoized per *theme*, not per
frame, so no path exists along which one frame's error reaches another. The defect
was the property the star silently depends on. Its selector took the *newest* four
approved proofs from a pool of up to fourteen, so the founding proof left the
reference set at approval 5 of 14, and late frames in a sheet were judged against four
references sharing nothing with the four the theme was founded on.

Pinning the founding proofs fixed that (5/14 -> 14/14, shipped). But the experiment's
**second** measurable came back unchanged — 14 distinct masters in both arms — and
that is what corrected the corpus: **origin retention and master stability are
different properties, and the bank rule buys only the first.** The amendment now says
so, and names freezing the reference set per series as what would actually deliver
stability. A verdict-only harness would have returned `better` and left the
overclaim standing.

Neighbour note: `character-identity-continuity` explicitly "stops at the cut and
hands over" to this subject for sequence-scale drift, and this amendment lands on the
handover itself — the topology governs how the *anchors* are minted, which is shot
sourcing, not conditioning-within-a-generation. No edit was made there.
