---
source: batch
kind: batch
url: "youtube:3QwU8TM7Rag, youtube:XqtnBlPJ6KE, youtube:NSCWaUo_2_0, youtube:UtY2DsOUCjE, github.com/htdt/godogen, github.com/per-simmons/unreal-agent-harness, github.com/phytrisha/blender-unity-game-studio, anthropic.com/engineering/harness-design-long-running-apps"
title: Agent-built PC games, Sep-Oct 2026 (batch of 8; a 9th, youtube:doR2RhsneRA, already mined 2026-09-29)
author: 8 authors (Chong-U; Can It Code?; Slightly Esoteric Game Development; Stefan 3D AI; htdt; per-simmons; phytrisha; Anthropic Labs)
words: 17745 ingested (4 transcripts + 1 article); trees 14718 + 83104 + ~465000 in-tree docs vs READMEs 1170 + 694 + 1225
extracted: 31
accepted: 2
declined: 0
leads: 4
already_covered: 12
untriaged: 13
dispatched: 0
applied: 2
shipped: 0
run_id: intake-agentgames-1029
siblings: 0
fetches: 0
rescan_when: "godogen: when its companion asset repo (held props, animation agent, integrate guides) is published or 8 weeks elapse (2026-12-24); unreal-agent-harness: when its .claude/skills land in the tree or 8 weeks elapse (2026-12-24); blender-unity-game-studio: when the asset critic gains a numeric approve threshold or 8 weeks elapse (2026-12-24)"
---

# Agent-built PC games: the loop needs a pivot verdict and a quarantined critic

**Class:** a batch of 8 sources from 8 authors, so within-batch convergence counts voices.
- **Four first-party practitioner build-walkthroughs** (videos, three of them sponsored).
- **One vendor engineering post:** a first-party primary that authorizes on its own.
- **Three repositories, each a practitioner account in repository form.** They were cloned and swept by
  three read-only workers, and their design records are summarised below.
- **Source 1 skipped:** `youtube:doR2RhsneRA` was already mined 2026-09-29
  (`2026-09-29-fan-out-point-36h-game-build.md`). Its declines and untriaged rows were read first.

**Expected yield:** catches, plus amendments where the repos' gates refine existing techniques. A batch buys
coverage, not per-source efficiency.

**Operator context:** a decommissioned look push had just landed four concept-scene-parity and sprite
techniques. The operator asked for this batch to enrich game-development know-how for a revival.

## Design records (repositories)

- **godogen @ `40542b6`:**
  - a thin runtime with no planner;
  - judging the running game through a deterministic 15-20 s proof clip the agent watches back;
  - an asset manifest with an in-game size column;
  - a hero asset with image-to-image edits for style families;
  - motion that is half authored, with relational gates;
  - guides spent only on silent failures.

  Routing count: 1 NONE (proof clip; nearest runtime-observation-evidence). Stays in intake.
- **unreal-agent-harness @ `bf8dc7a`:**
  - a harness that shrinks captures before the agent reads them;
  - art routing by role from a five-way bake-off (kit / script / image-to-3D);
  - a module dimensional contract with a bounds check;
  - parallel prep but serial scene edits;
  - a three-angle capture sweep that trusts pixels over success returns;
  - staged proxy boxes;
  - a realism lever order.

  Routing count: 0 NONE (all have homes: declare-the-producer-per-asset-class, generated-asset-world-scale,
  runtime-observation-evidence, procedural-level-planning).
- **blender-unity-game-studio @ `d36f7c6`:**
  - a critic that never sees the builder's report;
  - verdicts APPROVE / REVISE / REJECT, plus NOT ASSESSED ranked above APPROVE;
  - confidence-thresholded findings with one bounded fix round;
  - re-runnable stage scripts with upstream locks;
  - numbers and pictures with fixed review views;
  - a style bible addressed by heading;
  - helpers that emit observations, not verdicts.

  Routing count: 2 with a partial home (the REJECT semantics and the quarantine), both in
  concept-scene-parity. Stays in intake.

## Triage (route: the score for upper-layer rows; the corroboration table for currency and leads)

| # | Candidate | Voices | Prior art | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|
| 1 | Separate refine from pivot after every review; keep every round and name the best | 3 (vendor post; studio tree; decommissioned project's tree) | concept-scene-parity stop rule (stops a flat element; no per-round pivot verdict, no current best) | real gap | 4/0/2 | **landed: technique refine-or-pivot-with-every-round-kept** |
| 2 | Quarantine the critic (paths only, planted-claim test), tune it on owner divergences, and measure its seat (a dropped verifier as the boundary) | 4 (vendor post; studio tree; godogen tree; project) | owner-anchor-for-a-model-panel; no-gate-self-certifies | real gap (boundary + mechanism half) | 3/0/1 | **landed: amendment to owner-anchor-for-a-model-panel** |
| 3 | Judge the running build through a captured clip or a sweep, not stills or exit codes | 5 | runtime-observation-evidence (tiers-of-truth, behavioural-discriminators) | likely catch | - | already covered |
| 4 | Route each asset class to kit / script / generator from a paired trial | 3 (one is two videos' bake-offs) | generative-artifact-gating/declare-the-producer-per-asset-class | likely catch | - | already covered (corroborates the paired-trial rule) |
| 5 | One hero asset, the rest derived by image edits | 3 | visual-style-locking/approved-reference-sheet | likely catch | - | already covered |
| 6 | Asset manifest with an in-game size column | 2 | generated-asset-world-scale | likely catch | - | already covered |
| 7 | Target from several in-game mock-ups before building | 4 | toolkit-fit-slice-before-the-look-is-chosen (landed today); review-iteration-loops/anchored-variation-slate | likely catch | - | already covered |
| 8 | Module dimensional contract with a bounds assertion | 1 tree | generated-asset-world-scale; mesh-finishing | likely catch | - | already covered |
| 9 | NOT ASSESSED ranks above APPROVE | 1 tree | law unmeasured-is-not-a-pass | likely catch | - | already covered |
| 10 | Mutation-test a validator (break it on purpose 11 times) | 1 | test-input-generation; scan-sweep's seeded-red controls | likely catch | - | already covered |
| 11 | Fixed review views so rounds compare | 3 | element-scorecard-from-the-concept-camera; score-only-what-the-device-shows | likely catch | - | already covered |
| 12 | Serialize scene mutations, parallelize prep | 2 | software-engineering fleet-orchestration | likely catch | - | already covered |
| 13 | Verify a write by reading it back | 1 tree | quality-gates | likely catch | - | already covered |
| 14 | Weight the rubric toward the generator's weak axes; rubric wording given to the generator steers its output | 1 (vendor primary) | aaa-craft-rubric-authoring (states a rubric is "not a scoring prompt") | partial | 2/0/2 | untriaged: **render-bound** (it changes what a generator is told), owed a local render pair before it can land |
| 15 | The agent authors the tunable data surface; a person tunes feel, layout and style in the editor | 4 | none states it (nearest: ability-authoring-to-engine, machine-paced-delivery) | partial | 3/2/2 | untriaged: the home is contested between production-governance and systems-canon; G-R 1 |
| 16 | Capture QA misses contact gaps and style judgement; use numeric contacts and a person | 2 trees | runtime-observation-evidence; generated-mesh-acceptance | partial | 2/1/1 | untriaged: one-tree evidence for the style half |
| 17 | Render every non-visual asset to a viewable proxy (spectrogram, alpha composite) | 2 trees | generated-mesh-acceptance/posed-see-through-render | partial | 2/1/1 | untriaged: the audio half has no home read this run |
| 18 | Gate relations and derivatives, not limbs or keys (motion) | 1 tree | motion-quality-gating | partial | 2/1/2 | untriaged |
| 19 | Drive the gate through the production code path | 1 tree | runtime-observation-evidence | likely catch | - | untriaged (not opened) |
| 20 | Validate an output against the consumer's own acceptance code | 1 tree | quality-gates/match-the-resolved-artifact | likely catch | - | untriaged |
| 21 | Shrink captures to a capped PNG plus a JSON sidecar before the agent reads them | 1 tree | runtime-observation-evidence/bounded-evidence-with-provenance | likely catch | - | untriaged |
| 22 | Matte against a solid colour near the destination environment | 1 tree | sprite-and-atlas-production | partial | - | untriaged (render-bound) |
| 23 | Separate DCC source files per asset class; preview scene for imports | 1 | mesh-finishing-for-engine-readiness | thin | - | untriaged |
| 24 | Image-model repaint of the current capture as the next lighting target | 1 | concept-scene-parity (concept images) | partial | - | untriaged (render-bound, n=1) |
| 25 | Planner keeps the spec at product level; detailed specs cascade errors | 1 (vendor) + prior research | judgeable-spec-authoring | likely catch | - | untriaged (not opened) |

## Leads (return conditions)

- **Level composition stays human.** One creator laid out a level by hand in 2 h 39 m, saying "every frontier
  model ... not really good at building big spaces". The prior research round found the same in other
  creators.
  - Return: when a second first-party source measures agent-built layout against a person's.
- **Video-generated effects cut into flipbooks beat layered static frames up close.** One creator showed this
  side by side, and the decommissioned project saw the same.
  - Return: a local render pair under Phase 6b.
- **Free-tier model routes for engine and DCC driving (currency).** One creator built a playable engine game
  with free hosted models over the same tool bridges. Image-to-3D free tiers were also used.
  - Return: dated; refresh when the free tiers change.
- **The harness's own documented material-slot bug is still in one kit builder.** `futuristic_kit_jobs.py:122`
  still calls the clear that the guide says resets face slots.
  - Return: a fix commit upstream (the rescan condition).

## Contradiction kept as the boundary

The vendor post says a separate evaluator is a strong lever, and that it is worth its cost only where the work
sits past what the builder does reliably alone. godogen dropped its separate verifier because it "added no
signal". The two agree once the boundary is stated, and the amendment to owner-anchor is written from that
boundary: measure the critic's seat by its owner-upheld disagreements.

## Phase 7.5

Two rows, both `simulation` on mage-arena-vr (decommissioned, public), with three real cases each from its
committed record. The seams were chosen to falsify: each case names the result that would have killed the
technique. The project's gate cannot replay judged rounds, so code and experiment modes were unreachable. The
source-tree applications (studio @ `d36f7c6`) carry the structural realization.

## Render proof (declared focus: test)

No landed row is render-bound, so the focus was neither moved nor tested by a landing. Three untriaged rows are
render-bound (14, 22, 24) and owe a local render example under v2.18 that this run did not produce. This is
named as this run's miss, not hidden.

## Siblings

0 live runs at claim.
