# The source ledger

Every external source [`/intake`](../../.claude/skills/intake/SKILL.md) has mined, one
line each, newest first. (`/deepen` may also write here when it is handed a URL; the
ledger does not care which skill mined a source, only that one did.) One note per run sits beside this file.

This ledger answers one question in one second: **has this been mined already?** A
re-ingested video costs a full extraction round to rediscover declines that are already
written down, and the answer to "did we look at this" is not something to reconstruct
from memory.

## What a source note holds

The candidates a source produced and what happened to each - accepted, declined with a
reason, banked as a lead with a return condition, or caught as already covered. The
declines are the most valuable part. A decline nobody wrote down gets re-proposed every
run forever, and a source class nobody characterised gets over-trusted every run
forever.

## What it never holds

A consumer's paths, repository internals, or the transcript itself. Transcripts are
run inputs; they live in a scratch directory outside the repository and are deleted
when the run ends. A note quotes an anchor, never a corpus.

## Mined

| Date | Source | Kind | Words | Extracted | Accepted | Leads | Caught | Note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-08-27 | `github:herdrdev/herdr` - "the runtime your coding agents live on" | first-party agent-runtime repository (new class) | 607 | 15 | 3 | 0 | 2 | [[2026-08-27-herdr]] - the ingest returned 607 words and they were the wrong 607; every accepted finding came from files the README does not mention. Class carries three first-party documents that check each other: production rules for agents building it (`AGENTS.md`, 290 lines), a skill for agents driving it, and the hooks/recipes that enforce both. **Amends the vendor-skill lesson**: this bundled skill is the counter-example - a *negative* description ("Do not use merely because a task could benefit from a background terminal, delegation, or parallel work") plus a runtime precondition that halts it when unmet. Read a bundled skill for whether invocation pressure produced an ad or a gate; do not assume the ad. All three picked candidates landed in `terminal-multiplexing`. **The golden path's "the ring never blinks" claim fails on the subject's own primary tenant** - a child on the alternate screen has no scrollback to lose rows into, so a byte-faithful ring replays the current grid, not a transcript, and no budget increase recovers it; `bounded-replay-buffers` knew the alternate screen only as a replay-fidelity problem. New technique `occupant-state-detection` merged two candidates once the home contest resolved: `fleet-orchestration/lifecycle-signals` owns the state machine and ranks raw output weakest, and this source's whole situation is the case where its tier one *does not exist* - so the screen-derived substrate lands here and supplies that door. Grounded in 21 per-occupant rule manifests, not the docs; sharpest item is a code comment preventing **the user's own typed text from impersonating a working signal**. 2 of 3 fetches, both missed - the citation was in the tree's vendored emulator bindings all along |
| 2026-08-27 | `youtube:jp0PGmAwK3w` - "This 600M Model Fixes What Whisper Leaves Behind" | second-hand practitioner review (vendor release demo, new class) | 1565 | 10 | 4 | 1 | 1 | [[2026-08-27-s1-mini-transcript-cleanup]] - shortest source ever mined (1.5k words) and a good run, because the operator asked for installation requirements and that forced the primary source. **For this class the fetch IS the extraction**: a demo is organised around a happy path and states no operating constraints, so the control-line grammar, greedy-only decoding, the output ceiling, the behavioral-toggle trap and "empty output is expected" were all in the model card and none in the video. New technique `transcript-normalization` closes voice-io's missing stage - the corpus owned capture->transcript, transcript->command and display-text->speech, but nothing owned transcript->**written text a person reads**, one half of a symmetry it had already named. Its best section is written AGAINST the source: normalize toward a reader, never toward a reasoner - the video's proudest example (clean the transcript before the coding agent) is the one placement where the rule inverts, because a 0.6B normalizer seeing one utterance edits input for a model holding the whole thread. `stt-pipeline` amended: a stage further down gets a different empty (three empties, opposite meanings; the default integration raises an anomaly every time somebody clears their throat). Consumer verdict **do not adopt**, written as a negative application - the tree has exactly two dictation destinations and the reader/reasoner rule disqualifies both, which nobody designed. 2 of 3 fetches |
| 2026-08-27 | `youtube batch:x3Go2UiHZWk+RwynWBXuRaA+H3yU28Mqu9E+oECv0lTU8mo` - 4 AI-editing tutorials, 3 voices | practitioner-tutorial batch (editing lane, operator-dispatched) | 7636 | 9 | 4 | 0 | 4 | [[2026-08-27-video-editing-batch]] - the dispatch batch: 7.6k words -> `cut-compiled-from-source` (NEW, "compiled" had zero prior art - the edit as a declarative composition; the critique pass READS the source instead of watching pixels), transcript-as-derivation-spine on derived-turn-markers (3 authors), plans-as-markers on edit-plan-over-regeneration (propose/approve/apply in the editor annotation channel), generate-to-see-rebuild-natively on anchored-variation-slate. Plus an executed headless-editor probe on the dev machine (boots -nogui, full API, one one-time GUI preference gates external connections) landed as the consumer plan appendix. Shortest source (699w, a builder narrating their own connector) was the strongest |
| 2026-08-27 | `youtube batch:DfdlAwJ4SKw+8tnO15fJWVE+8obne_qS6MY+Whh8vCqboxQ+olXpy9Hu7R8+W-DJnoL1Y18+OF9xcQCQSFc+hpR_4UXGpuo+aTnek5komeE+kv1o8eKOcas+yyZQXxkVP14` - 11 AI-video tutorials, ONE creator | practitioner-channel-corpus (new sub-class) | 22371 | 12 | 6 | 1 | 5 | [[2026-08-27-video-workflow-batch-3]] - the channel corpus inverts batch economics: one voice voids in-batch convergence, so yield ran on corpus-vs-source novelty and cross-run corroboration only. Six amendments, zero new techniques: paired-panel anchors (both rung-3 frames cut from ONE image), the blocking frame as the camera schematic (third member of annotate-not-describe), the built previz plate (motion-plate-library first corroboration + fourth source), board chaining/panel repair/pacing contract (storyboard technique third author), voice minted from either direction, sample-set coherence before capture. Exemplar-conditioned story generation banked. Closes with the consumer-app video-generation integration plan (operator dispatch). 0 fetches |
| 2026-08-27 | `youtube:rKo9iLGjUbs` - "I Built a FREE App That Runs Your Entire Business" | practitioner-build-walkthrough (personal tool, new class) | 5750 | 12 | 3 | 0 | 2 | [[2026-08-27-control-center-dashboard]] - new class, a hybrid whose halves have opposite reliability: the product tour is a demo (strip test deletes all of it), the sentences about the tool he has run daily for months are a first-party account, and every finding came from the second half. The discriminator is cheap - is he describing what the tool does, or what happened to him while using it. Three findings, **0 fetches** (budget 3), all corroborated corpus-internally. `dedup-records-who-carried-it` (grant-source-landscape's 6th normalization-contract clause) closes a seam INSIDE one bundle: `verification-passport`, `majority-rule-doc-consensus` and `funder-portal-resolution` all consume a source count that the bundle's own ingest layer had and threw away one merge earlier - and the source implements it wrongly (counts newsletters that relay each other), so the technique carries the half it lacks: carrier sets are recorded at PUBLISHER granularity or they measure promotion, not truth. `task-envelope` gained the enumeration case - a brief that lists the parts supplies a machine-checkable done criterion by accident, and the model satisfies THAT one: fires on time, on the wrong axis, every surface present and every link dead (probe the leaf, not the shape). `acquisition` gained the per-user-installed rung - the ladder assumes one registered client, so a tool run once per user reaches the ceiling by walking the floor (delegated grant whose precondition is a manual paste), plus a 5th provenance case and the rule that a setup guide must never resolve the provider's trust prompt for the reader. Synthesis banked not landed: candidates 1+2 are independence accounting inflating and deflating; only one half was picked |
| 2026-08-27 | `youtube batch:Hjj-yiDJXTw+LsfcOoCc88I+HMVSCEh72n4+0v534yAyhwg+R8QvtGlVI_E+-ZqilAZOFLE+tZReV23ncuc+lvzPURroPxE+z3uX2YLGudM+VmDpBD_47M0+pYsc01oioKg+Ie0niOVuWzg` - 12 AI-video tutorials, ~5 voices | practitioner-tutorial batch (2nd) | 25336 | 13 | 10 | 0 | 7 | [[2026-08-27-video-workflow-batch-2]] - count voices, not videos (6 of 12 are one creator; same-author repetition is one sighting). Back-to-back batches compound: four landings were widenings of run 24's day-old amendments from independent sources, and the typed-input shape hit its third run in a row and landed as **law `typed-input-owns-its-channel`** (camera path / beat grid / emotion dial). New: `reference-role-map` (every attachment one named role, negative scope, group multiplication) + `storyboard-grid-conditioning` (numbered textless panel grid as one conditioning image; "storyboard" had zero prior art); moving-reference amendment (continuity carry vs scoped choreography transfer); the-import-is-the-lever (grade the anchor, the look rides in); edit passes are lossy (3 practitioners, 2 runs). Mid-run: a parallel session landed `character-identity-continuity`; triage re-based on HEAD. 0 fetches |
| 2026-08-27 | `youtube batch:3rDs6FhFoUQ+6arKHnBNJMI+5dWgZDka3Ww+9Y1A2nw_Veg+83NI19L7fhQ+tYJQusOS2jI+d7J82el-6AU+zYPgz6sOy74` - 8 AI-video workflow tutorials | practitioner-tutorial batch (first batch ingest) | 26578 | 15 | 10 | 1 | 3 | [[2026-08-27-video-workflow-batch]] - first batch run: 8 sources deduped at extraction, and within-batch convergence became the triage signal (every 2-source candidate landed). The yield clustered on the bundle's missing stage - multi-clip sequence continuity - as 2 new techniques (`performance-direction` completes cinematic-language's stack with the performer; `motion-plate-library` restores the layout/animatic split as a sourcing channel) + 6 amendment sections (identity sheet single-face rule, persistent-state variant sheets, voice as second identity surface, default-with-scoped-override style blocks, schematic spatial anchors, briefed match cuts, output-derived extensions, anchor-texture provenance). 0 fetches; vendor-channel tutorials read as first-party accounts wearing an ad - the strip test deletes the sponsor |
| 2026-08-26 | `youtube:NYFGCESmikA` - "DHH: Future of Programming, AI, Agentic Engineering, Vibe Coding & Linux" (Lex Fridman #501) | first-party-practitioner-account (podcast interview, new sub-class) | 54597 | 13 | 3 | 0 | 0 | [[2026-08-26-dhh-lex-fridman]] - longest source ever (3.7x prior record), same yield as sources a tenth its size; the sub-class's property: a five-hour conversation leaks the counterexample to its own stated advice (said "be as vague as you can", narrated a textbook tight envelope), and the contrast IS the discriminator. Three amendments, zero fetches: `task-envelope` gained its stated precondition (when done is not knowable the envelope inverts - finish-line constraints free, route constraints spend; discovery's deliverable is the next dispatch's done criterion), `heterogeneous-model-panels` gained the produce-review pair (cross-family sequential decorrelation for routine generation, which the panel rule excludes; corroborated against judgment-guardbands' correlated-judges argument), `fleet-orchestration` golden path gained the operator-medium section (chat couples the one human to fleet latency; work item in, batched decision surface out). 10 untriaged with anchors, incl. the single-owner doctrine's second independent sighting |
| 2026-08-26 | `web:githubnext.com/posts/knowledge-compressor` - "Knowledge Compressor" | first-party-practitioner-account (prototype report) | 4649 | 10 | 3 | 2 | 0 | [[2026-08-26-knowledge-compressor]] - the source's method landed as two techniques that both say the method AS PUBLISHED is unsound: it filters questions the model cannot answer from the article but never those it can answer WITHOUT it, and its require-a-failure guard is only safe after that screen. `unaided-baseline-screening` + `overshoot-and-restore` (eval-harness, first new techniques there since forge) + the recurring-bill/break-even amendment on `context-budgeting`, sharpened by 2026-08-25's cache multipliers. **Zero fetches** - all corroboration from corpus-internal convergence. Then built the corrected method and ran it: `scripts/compression-scan.mjs` + `docs/compression-lane.md` + `docs/compression-brief.md`. Result NEGATIVE and that is the finding - mean repetition 0.94% over ~3,350 docs, top entry document two-thirds irreducible under a real screen; the prototype's 50% came from a synthetic article written to be redundant. Lane default: run the scan, never the compression. Instrument caught its own overlap-counting defect on first read (74.3% -> 15.1%). Law lead banked: *a green result is evidence only where red was reachable*, 4 sightings/3 subjects, return on a sighting outside `software-engineering` |
| 2026-08-26 | `repo:jd-opensource/JoyAI-Echo` @ c796303 | research-model-release (new class) | n/a | 12 | 4 | 3 | 1 | [[2026-08-26-joyai-echo]] - new class: engine AND operating instructions in one tree, so every doc claim is checkable against the code that implements it, no fetch (budget 3, spent 0). The class's signature: a repo shipping two sibling systems hands you discriminators for free - two shot-writers from one lab gave opposite camera instructions, which landed as a boundary at almost no cost. Yield sat in the first-party prompt-engineering artifacts, not the README. `identity-split-from-state` + the `image-prompt-composition` anatomy going three blocks -> four (the restatement law's unstated precondition: a restated block may hold nothing that varies, and the constant only acquires moods when it stops being a style and starts being a subject); camera-as-control-channel discriminator into `movement-motivation`; pin-the-origin-roll-the-recent into `generated-shot-sourcing`, implemented twice at two altitudes in the source; joint-waveform spotting into `music-spotting-against-picture`, whose neighbour's keep/demote/strip enumeration it breaks |
| 2026-08-26 | `youtube:g3X8JauSWTM` - "Stop Building AI Slop - Build High-End Web Apps with AI" | practitioner-tutorial (course walkthrough) | 14649 | 12 | 3 | 0 | 9 | [[2026-08-26-stop-building-ai-slop]] - longest source in the ledger, three findings, none from the curriculum: cross-medium probes on `asset-vs-disposable-render`; `slots-claim-their-subjects` + the "two families" golden-path root (identity-slot convergence with 2026-08-23, landed not banked); structure-vs-restyle amendment on `style-onboarding-from-sample`; class row earned |
| 2026-08-26 | `repo:supermemoryai/supermemory` @ shallow clone | vendor-repository (new class) | 2091 | 16 | 3 | 1 | 4 | [[2026-08-26-supermemory]] - the engine is NOT in the repo (hosted); its ontology leaks through the visualization package's TypeScript types, which is the class's cheapest good artifact. `decay-and-forgetting` gained a third axis (the fact that expires by its own terms; the retrieval term *protects* time-boxed claims), `episodic-capture` gained the batch-shape half of the distiller ceiling at root altitude (3rd sighting, 2 runs). Realized + committed in a connected tree the same run; that tree then corrected the technique - overflow defers, it does not drop. Four catches, all cases where the corpus outclasses a SOTA vendor's own schema |
| 2026-08-26 | `operator dispatch` + `next@16.3.3` release notes / GHSA-p293-qw3h-jr36 + GHSA-2xp9-vwfh-vxw4 | operator-dispatch (new class) | n/a | 8 | 3 | 3 | 2 | [[2026-08-26-next-16-3-3-fleet]] - the dispatch was wrong about its own subject: asked for a performance topic, 16.3.3 is two critical unauthenticated RCEs and its AVIF fix is a REMOVAL. Literal ask unbuildable (denylist). Landed `## When the dependency is the framework` amendment, first `next`-stack application, `scripts/fleet-deps.mjs`, six project commits. The new instrument caught the run own pin-rewrite defect on first run |
| 2026-08-26 | `repo:rohitg00/ai-engineering-from-scratch` @ 39ea8a1 | curriculum-repo (511 lessons, 12-language i18n) | n/a | 7 | 1 | 4 | 3 | [[2026-08-26-ai-engineering-from-scratch]] - new category `localization/craft` + subject `translation-pipeline-topology` (6 techniques) forged same-run by three workers; "comprehension is proven by reconstruction" banked at two sightings; the discriminator (human quality claim) beats either topology |
| 2026-08-26 | `youtube:OzfgOjEfK98` - "Introducing Composer, a section-by-section song editor." | vendor-product-announcement | 76 | 6 | 4 | 1 | 1 | [[2026-08-26-composer-song-editor]] - thinnest source ever (exit 3, correctly); the operator's placement question became the session: `audio-generation` category (3 subjects, 14t), `partial-regeneration-seams`, the four-way audio discriminator, a music engine landed live in a consumer tree; the source itself yielded one catch (its headline is our `edit-do-not-regenerate` law) and one clock |
| 2026-08-25 | `youtube:wa6o-0C9UWE` - "Karpathy Listed What's Wrong With AI Coding" | practitioner-judgment relay | 3470 | 6 | 3 | 0 | 2 | [[2026-08-25-karpathy-coding-file]] - law 13 `silent-state-is-ungoverned` (five-way convergence closes), `restraint-amplifier-balance` technique, machine-checkable finish lines into task-envelope; altitude column added to the skill (0.10.0) on operator feedback |
| 2026-08-25 | `papers: 2607.09510 + 2605.29442 + 2607.21832 + 2606.08091` | commissioned-paper-batch | n/a | 4 | 4 | 3 | 0 | [[2026-08-25-agentic-dev-paper-batch]] - `worker-trajectory-anatomy` technique; measured paragraphs into enforcement-demotion and task-envelope; two independent corpora price fabricated success; PR study read and declined with reasons |
| 2026-08-25 | `repo:Shubhamsaboo/awesome-llm-apps` @ 11a4bc3 | app-aggregator (tutorial monorepo) | n/a | 8 | 3 | 3 | 3 | [[2026-08-25-awesome-llm-apps]] - the periphery beats the apps: skills eval ladder adopted (`scripts/check-skill-triggers.mjs`), cross-field epistemic coherence lands in structured-output; hash-chain audit declined on single-owner grounds |
| 2026-08-25 | `repo:DEEP-JLU/Awesome-Graph-Engineering` | paper-aggregator (~284 papers) | n/a | 7 | 3 | 3 | 2 | [[2026-08-25-awesome-graph-engineering]] - cluster triage, 3 papers read: `coordination-failure-triage` technique, two measured sections in `procedure-promotion`, store-shape paragraph; temporal-KG memory resolved as the corpus outreasoning the paper |
| 2026-08-25 | `repo:freestylefly/awesome-gpt-image-2` @ 6854698 | practitioner-codebase (curated prompt library) | n/a | 10 | 5 | 1 | 4 | [[2026-08-25-awesome-gpt-image-2]] - `verbatim-text-locking` + `screenshots-claim-a-record`, a third dialect in `prompt-dialect-matching`, one node application; the corpus meets the text-capable brief-reading model class |
| 2026-08-25 | `youtube:icM0ewXGvAw` - "19 Claude Code Mistakes \"Pro\" Users Are Still Making" | second-hand-practitioner-listicle | 4465 | 19 | 3 | 1 | 0 | [[2026-08-25-19-claude-code-mistakes]] - three techniques (`task-envelope`, `brief-carries-the-session`, `cache-continuity`), three rust applications, one correction; cross-repo self-check lines in the companion's worker prompts; 16 declined on operator scope |
| 2026-08-23 | `youtube:yCACmFTiCto` - "Turn Claude Into a One Person Marketing Team" | practitioner-tutorial (beginner walkthrough) | 9483 | 8 | 1 | 1 | 5 | [[2026-08-23-one-person-marketing-team]] - mined under `/deepen`; one technique on `evidence-bound-visuals` (synthetic-testimonial defect the source demonstrates), two corpus contradictions, aggregator topology banked |
| 2026-08-23 | `youtube:NUK_TBz46dM` - "Turn Claude Into A Web Design Genius in 3 Steps" | practitioner-deep-dive (technique demo) | 4037 | 6 | 1 | 0 | 5 | [[2026-08-23-seedance-web-design]] - mined under `/deepen`; one technique on `review-iteration-loops`, five catches, one corpus contradiction |
| 2026-08-22 | `repo:onecli/onecli` @ ff7a192 | practitioner-codebase | n/a | 10 | 7 | 0 | 3 | [[2026-08-22-onecli-repo]] - three new techniques, two amendments, two applications |
| 2026-08-22 | `web:linear.app/data` - "How teams build (Edition 01)" | vendor-telemetry-report | 4613 | 7 | 0 | 0 | 0 | [[2026-08-22-linear-how-teams-build]] - none picked; class characterised, 7 untriaged |
| 2026-08-22 | `web:pinglin.tw` - "The Shapes of Agent Memory" | first-party-empirical-study | 13767 | 12 | 6 | 1 | 2 | [[2026-08-22-shapes-of-agent-memory]] - five amendments across agent-memory + eval-harness |
| 2026-08-22 | `youtube:bxp4G-oJATM` - "Difficulty in Video Games" | designer-talk | 2332 | 6 | 5 | 0 | 0 | [[2026-08-22-game-difficulty]] - landed on `research/game-difficulty` + cross-repo |
| 2026-08-22 | `youtube:3MP8D-mdheA` - "How To De-Slop A Codebase Ruined By AI" | practitioner-deep-dive (technique demo) | 2456 | 6 | 0 (+1 dispatched) | 0 | 1 | [[2026-08-22-de-slop-a-codebase]] |
| 2026-08-22 | `youtube:gaDdrDdczO4` - "New Skills! v1.2..." | practitioner-deep-dive (skill-library release) | 2514 | 10 | 5 | 0 | 2 | [[2026-08-22-skills-v1-2-release]] |
| 2026-08-22 | `youtube:u8Im0l_vwqM` - "Inside DeepWiki: How Cognition Builds Wikis for Devin at Scale" | practitioner-deep-dive | 2974 | 10 | 2 (+1 proposed) | 0 | 1 | [[2026-08-22-inside-deepwiki]] |
| 2026-08-22 | `youtube:NC4h5kWH_-A` - "AI News: The AI Agent Race Just Exploded" | mixed-ai-news-roundup | 6958 | 10 | 4 | 1 | 2 | [[2026-08-22-ai-agent-race-exploded]] |
| 2026-08-21 | `youtube:EfGF7QbJItA` - "AI News: The Best Open Model Runs on Your Computer!" | mixed-ai-news-roundup | 6507 | 12 | 1 | 0 | 0 | [[2026-08-21-ai-news-open-model-local]] |

## Source classes, and what each is trusted for

Written from what runs actually observe, never assumed up front. A class earns a line
here after it has been seen twice, with the incident that taught it.

| Class | Reliable for | Not reliable for |
| --- | --- | --- |
| Designer talk (domain craft, no tooling) | The STRUCTURE of a domain's received wisdom - the decomposition, the named hazards, the shapes practitioners converge on. | Whether any particular studio's version is best, and anything about software. Its findings never route to `software-engineering`; they route to a domain bundle, which may not be on the branch you are standing on. |
| First-party practitioner deep-dive | What they built, what they measured, and what changed when they changed it. Facts about one system, from the person who changed it - no corroboration lane improves on that. | What works in GENERAL. The sample is one pipeline at one company, so a measured result is an existence proof, not a distribution. |
| Operator dispatch | The LOCAL facts: what the operator has observed in the fleet, what the fleet needs, which trees to open. Version numbers, adoption state, felt pain - all checkable against the checkouts, and cheap to check. | The GLOBAL frame. A dispatch is not written against the corpus and cannot know what is already forged, what the gate forbids, or why the subject it names is the wrong altitude. Verify its premises against the trees and its framing against the corpus; the second one is where it fails. |
| Mixed AI-news roundup | That the world moved: a release happened, a price changed, a benchmark was published. | Why it matters, whether it is true, whether it is new. Its claims are second-hand by construction. |

**First-party agent-runtime repository, first observation (2026-08-27).** An
open-source product whose *subject matter* is the same machinery this registry
indexes, so its repository is simultaneously engine, operating instructions, and
enforcement. Three files check each other: the production rules for agents building it,
the skill for agents driving it, and the hooks and task recipes that make both real -
and the third is where a rule's actual conditions live, because every rule worth having
had something behind it. Two things this class taught that generalise past it. **The
bundled skill is not automatically an ad**: this one's description is negative and its
first instruction is a precondition that halts it, which retires the 2026-08-26
prediction in favour of reading for what invocation pressure produced. And **when the
source implements the primitive, its own code is the primary source**: two web fetches
were spent hunting a terminal-behaviour citation that was sitting in the tree's vendored
emulator bindings, stated outright. Not yet a rule; one observation. The third sighting
of a related pattern - **the README is the least useful file present**, now seen in this
class, the vendor repository and the research-model release - is no longer per-class and
belongs in the method's class list once.

**Designer talk, first observation (2026-08-22).** A teacher explaining an established
body of practice - neither second-hand survey nor first-party account. The class has one
defining property for this registry: **it has a placement problem before it has a content
problem.** Its natural home was a bundle living on a different branch, which the mapping
instrument cannot see, so the instrument reported "no prior art" for a topic a sibling
branch covers in two subjects. The corpus is bigger than any one branch and the tooling
does not know it.

**First-party practitioner deep-dive, second observation (2026-08-22) - the row is
earned, and one sub-class is worth seeking out.** Both observations confirmed the split:
authoritative about what they built, silent on generality. The sub-class that outperformed
is the **release walkthrough** - a library author going through one version's changes.
It is organised around CHANGES, and a change carries its own motivation, so the author
states the failure mode out loud because it is the reason the release exists. Three of
five accepted findings came from that structure rather than from the feature described.
A feature demo shows the solution and hides the problem; a release walkthrough shows both.

Also confirmed across both: no corroboration fetch was needed in either run. The 3-fetch
budget binds on second-hand surveys and never on this class.

**First-party practitioner deep-dive, third observation (2026-08-23) - the failure mode
finally showed itself, and the yield profile against a MATURE bundle is different.** The
first two observations inferred the class's weakness from its structure; this one caught
it in the act. A device rule ("if it is a mobile user, serve the still instead of the
video") was stated with total confidence and is the named wrong answer in a subject the
corpus already carries, which requires the page's own measured frame cost rather than a
declaration the device makes about itself. That is precisely the shape the row predicts:
a general recommendation inferred from one system where it happened to work.

The yield profile is the other half. Five of six candidates were already covered - and in
four of those the corpus was not tied but strictly better hedged, holding the same rule
*with its condition attached* (a rights rule, a four-rung ladder, a measurement instead of
a guess). Against a mature bundle this class should be expected to produce catches, not
content, and **a catch is worth recording with the hedge that beat it**, because the hedge
is the reusable argument for the layer contract. Fetch budget was touched for the first
time in this class - not to corroborate what the practitioner did, which still needs no
lane, but to check a claim they made about generation in general.

**Cross-class, second sighting: the candidate a source explains badly is the one worth
the budget.** The 2026-08-21 roundup named a real gap and inverted the rule for filling
it; this practitioner named a real gap (no divergence phase before the review loop) and
inverted its mechanism, calling for more amplitude where the literature says amplitude is
the lever measured not to work. Both runs' single accepted finding came from their single
badly-explained candidate, while every correctly-stated claim was already owned. The
provisional reading, one sighting short of a rule: **a claim a source gets right is a
claim the corpus probably already has**, so the corroboration budget belongs on the
claims that sound wrong rather than on the ones that sound right.

**First-party practitioner deep-dive, first observation (2026-08-22).** Its authority
maps onto the layer contract almost exactly: strong evidence for the SHAPE of a
technique, weak evidence for its universality. So its claims land well as decision rules
with their conditions attached and badly as unqualified assertions - which is a
different editing job from the roundups, not merely a higher trust level. Yield differed
in kind as well as degree: a coherent account of one problem maps onto one region of the
corpus, so the run produced two techniques and a subject proposal rather than findings
scattered across six subjects. At 2,974 words it outproduced a 6,958-word roundup, which
is the first evidence that transcript length is not a yield proxy.

**Mixed AI-news roundup, second observation (2026-08-22) - the class row is now
earned.** Two runs, same channel, and the pattern held in both directions. The class
located four real gaps and was *wrong* about two things the corpus has measured (the
precision-tier rule in run 1, the throughput-buys-thinking claim in run 2), plus a third
it got backwards on agent identity. Yield is not a property of the class but of where
its segments happen to land: run 1 hit model and media subjects and produced one
finding, run 2 hit `llm-agent` and produced four.

The second observation adds something the first could not show: **the class becomes
authoritative in aggregate.** Two independent vendors across two runs shipped the same
"observed repetition becomes a named skill" feature, which met the upper-layer
corroboration bar with no web fetch at all. That only worked because run 1 wrote down
its untriaged candidates - a vocabulary with only "declined" in it would have lost the
first half of the pair.

**Mixed AI-news roundup, first observation (2026-08-21).** The class did exactly what the
row predicts. The one segment that reached a landed finding named a real hole in the
corpus and stated the rule backwards - the primary literature says the compression
*format* dominates the nominal bit count, while the source said take the highest number
that fits. Originating a finding and authorizing one are different acts, and this class
can only do the first. Not yet a rule; one observation.
