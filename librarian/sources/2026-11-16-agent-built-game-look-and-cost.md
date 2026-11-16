---
source: batch
kind: batch
url: "youtube:TZciMltLfhk, youtube:lIUYzxgLev8"
urls:
  - https://www.youtube.com/watch?v=TZciMltLfhk
  - https://www.youtube.com/watch?v=lIUYzxgLev8
title: "Agent-built game look and cost, /shift batch of 2 videos from 1 channel"
author: "1 channel, first sighting (Fun AI Builds With Mark); no prior note or ledger row for it"
words: 1923
extracted: 19
accepted: 0
declined: 0
leads: 3
already_covered: 10
untriaged: 4
currency: 1
dispatched: 0
applied: 0
shipped: 0
run_id: shift-agent-built-game-look-and-cost
siblings: 2
fetches: 5
rescan_when: a second channel reports a whole agent-built game's cost in a stated unit (wall clock or allowance share), or a carved subsystem skill with self-tests is shown reused by a later run with both runs' costs; or 8 weeks elapse (2027-01-11)
---

# Agent-built game look and cost, mined under /shift, 2026-11-16

Plan `plan-20261116-085513`, cluster `agent-built-game-look-and-cost`, board run
`shift-agent-built-game-look-and-cost`. The question: when an agent builds a whole game on a long
loop, does a stylised look (cel shading, voxels) buy detail the model can sustain, and what does a
six-hour or week-long run cost against a short run with a prebuilt skill? Two short showcases, read
from cached captions in full. Nothing on screen was watched. No GPU, no download, no render.
Phase 7.7: gate=skipped.

- **T** = `youtube:TZciMltLfhk`, "I Kept Pushing Fable 5.2 - This is Getting Ridiculous." (1,166
  words, 6:29). The creator plays a cel-shaded open world he says one six-hour loop built.
- **L** = `youtube:lIUYzxgLev8`, "I Kept Pushing Fable 5.2... This Entire World Is Destructible"
  (757 words, 4:18). The creator plays a destructible voxel dragon game, then a 15-minute ship
  battle built on a second model with the destruction skill.
- **Linked pages** (miners, 5 fetches in all): the creator's paid bundle page (public copy only;
  the skills sit behind a $9 paywall and were not bought) and a free "game-workbench" prompt page
  (571 words, read in full; its `.skill`/`.zip` was not downloaded). The workbench is a review
  site for an existing game, not either game's build method. No prompt for either game exists on
  any page reached.

**Class and expected yield, stated first:** practitioner build-walkthroughs, nearly all tour, by a
creator who sells the skills he credits. Expected: catches against `concept-scene-parity`,
`unattended-build-loop` and `agent-run-budgeting`, one currency line, at most one lead. That held:
0 accepted, 3 leads, 1 currency line, 10 covered.

**Voices.** One channel, one voice. The cluster has no convergence on any row. The style claim is
also a repeat inside this voice: T says "I said in one of my recent videos that I thought that cel
shaded graphics were really good for AI games" [00:01:18]. Across runs, the style rule was already
reached by the 2026-11-06 U11 row and the 2026-11-10 F9 and S7 rows, all covered by the same
technique, so this voice adds a sighting, not a landing.

**Admission.** The +3 bar governed the four scored rows (B7, B8, B12, B16), and none reached it.
The bar comes from `/intake` Phase 5 Step 3 and its v2.21 paragraph, as it stands today. Step 4's
step-down condition (three consecutive `fp=0` runs whose rejected rows a later run had to re-derive)
has not fired: the scorecard's last row carries `fp=1`. Currency and leads ran under the
corroboration table. `auto=0/4/0 fp=0`: neither miner accepted anything, so no accept died here.

## What landed

This note and its ledger lines. No corpus file changed, no project was touched, no row was banked.

## Candidates

| # | Candidate | Video | Anchor | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- |
| B1 | A stylised cel look gives detail the model can sustain | T | [00:01:18], [00:05:12] | Already covered | catch | `toolkit-fit-slice-before-the-look-is-chosen` step 1 lists "a stylised cel look with authored shadow colours" among looks that suit a generator-led team. Lander re-read it |
| B2 | Even a liked build gets the player's hands wrong ("the animation for the hands is a bit wonky") | T | [00:03:03] | Already covered | catch | Same technique, first slice element: generators "have no strong recipe for stylised first-person hands". One build, the creator's own admitted defect |
| B3 | One six-hour loop showcase offered as proof the look works | T | [00:00:00], [00:01:44] | Already covered | catch | `trial-matrix-design` ("a single beautiful render proves nothing"); `no-gate-self-certifies`. No log, timer or prompt on screen |
| B4 | The kept look distilled into a reusable skill | T | [00:01:44]-[00:02:10] | Already covered | catch | `toolkit-fit-slice` step 2 (a short style file with one approved anchor per asset class); `visual-style-locking` § Style is a property of the project. The skill's content is paywalled |
| B5 | A long loop drains the premium model's weekly window; a cheaper model stays the daily driver | T | [00:05:39]-[00:06:06] | Already covered | catch | `allowance-budgeting-across-workloads` (a window is capacity to allocate across producing, scoring, operating, slack); `cheapest-sufficient-tier` |
| B6 | "50% fable limit every single week" | T | [00:06:06] | Dropped | corroboration table | A miner filed it as a lead. The lander drops it: the figure has no unit (50 % of what is unstated), so it can date nothing and no consumer could act on it |
| B7 | Keep extending one build across loops | T | [00:01:44] | Untriaged, 1/2/1 | Phase 5 | A boundary in `refine-or-pivot-with-every-round-kept`. A stated plan with no result |
| B8 | Density as a point of interest in every sightline | T | [00:03:30] | Untriaged, 1/2/1 | Phase 5 | Generic open-world craft, no method, self-judged. Nearest: `procedural-level-planning` |
| B9 | A separate, context-blind agent grades 8 to 12 screenshots each round ("Never grade your own work.") | T, L | workbench page | Already covered | catch | `owner-anchor-for-a-model-panel` § Quarantine the critic; `blind-judging-of-agent-runs`; `no-gate-self-certifies`. Both miners read the same page: one row |
| B10 | The builder's eye is the only judge ("It looks so good.") | L | [00:01:46], [00:02:12] | Already covered | catch | `no-gate-self-certifies`; `verified-vs-self-reported-pass-rate` |
| B11 | A whole destructible voxel game took "an entire week of Fable usage", starting from a prebuilt world skill, the week including writing the destruction skill | L | [00:02:37]-[00:03:02] | Currency, ledger only | corroboration table | Below |
| B12 | The week and the 15-minute run are not a comparison | L | [00:02:37]-[00:03:29] | Untriaged (remainder, V2) | Phase 5 | Below. **The promotion read contradicted the miner:** the comparison half is covered |
| B13 | Carve a proven subsystem from a long build into a drop-in skill with an installer, self-tests and a sandbox | L | [00:02:37]; bundle page | Lead | corroboration table | Below |
| B14 | A weaker model plus the carved skill reproduced the mechanic in 15 minutes | L | [00:03:02]-[00:03:29], [00:03:54] | Lead | corroboration table | Below; pairs with B13 |
| B15 | A voxel look suits an agent-built game | L | whole video, implicit | Already covered | catch | `toolkit-fit-slice` step 1. Voxels are not in that list, but L never argues the style; it is a boundary example with nothing behind it |
| B16 | Fire spreads by material and buildings collapse by section | L | [00:00:27]-[00:02:37]; bundle page | Untriaged, V2 | Phase 5 | A feature list with no mechanism and no primary. Nearest: `rigid-body-simulation-stability` |
| B17 | Sample captures by eye: automated checks miss black frames and empty shots | L | workbench page | Already covered | catch | `unverifiable-is-not-fail` names a measurably black frame as a failure |
| B18 | Operator notes are read at each round start and outrank the loop's own plan | L | workbench page | Lead | corroboration table | Below |
| B19 | Mark what could not be captured; never invent entries or placeholder art | L | workbench page | Already covered | catch | `unattended-build-loop` (unverifiable is a third state); `unverifiable-is-not-fail` |

Dropped as having no attachment: the creator's guess about the next model releases [00:03:54], and
the bundle and arcade pitches.

## B12: what the lander's read found

The L miner scored this row 2/2/1 as a new technique for `outcome-conditioned-cost` and asked one
promoting question: does the corpus already require equal starting state in a cost comparison? It
did not read the answer. The lander did.

- **Yes, it does.** `agent-benchmark-design` § Cells must differ in exactly one thing pins "the same
  starting revision of each repository, the same instruction text ... the same ceilings".
  `cheapest-sufficient-tier` step 1 says the same: "Same instruction, same starting revision ...
  Anything else that differs between cells ... makes the comparison a story rather than a
  measurement." The week and the 15 minutes differ in model, starting state and task (a walled city
  against one ship battle). That is three variables, so it is a catch, three times over.
- **What remains is narrower:** a run seeded from a prior run's carved output owes a share of that
  output's cost, if the short run's price is quoted at all. Neither `outcome-conditioned-cost` nor
  `allowance-budgeting-across-workloads` states it. The latter's nearest sentence is about a
  response cache making token totals read as cold cost. The remainder targets a technique and has no
  primary, no tree and no source that states it (the source only sets two numbers side by side), so
  V2 vetoes it. Recorded untriaged.

## Currency (B11, ledger only)

One agent-built browser game, a destructible voxel world with fire spread and defenders, took about
one week of a premium model's windowed allowance, by the creator's account, with a prebuilt voxel
world skill in hand. Writing the destruction skill was part of that week. It is self-reported, one
voice, and a week of a windowed allowance is not a measured quantity. Under the corroboration table
a currency line may stand alone, so it is filed here and nowhere in `knowledge/`.

The 2026-11-10 S2 line's return condition (a second channel reporting wall clock per agent-built 3D
task) **does not fire**: this is allowance per whole game, not wall clock per task. For scale only,
two channels now give whole-game agent cost in coarse, different units: about 50 to 100 hours of
wall clock ([`2026-09-16-gpt6-two-game-builds`](2026-09-16-gpt6-two-game-builds.md) row 8,
untriaged there) and about one week of allowance (this one). Different
units are not convergence. **Return when** a second channel states a whole game's cost in the same
unit as one of these, at which point `agent-run-budgeting` can take one order-of-magnitude line.

## Leads

- **B13. Carve a proven subsystem into a drop-in skill.** After the long build, the destruction and
  fire engine was packaged, by the bundle page's public copy, as an add-on "ready to drop into any
  Voxel World project", with an installer, self-tests and a playable sandbox. The nearest corpus
  homes cover something else: `procedure-promotion` promotes a procedure, not shipped code, and
  `packaged-surface-evaluation` evaluates an installed package rather than how one is cut out of a
  build. The source is vendor copy for a paid product, and the skill is unread. **Return when** a
  second voice or a public tree shows a carved module with its own self-tests reused by a later run,
  with both runs' costs. Use then: a game repo building a second title on the same engine. None
  today.
- **B14. A capability gap closing when the hard subsystem arrives prebuilt.** The second model,
  "definitely a bit" behind the first by the creator's account, reproduced spreading fire and
  destruction on one ship battle in about 15 minutes with the skill. One scene, self-judged, built
  "just to simulate it". B12 is why the 15 minutes is not a price. Returns with B13.
- **B18. Operator notes outrank the loop's plan, read at each round boundary.** The workbench prompt
  reads the operator's notes at the start of every round, puts new ones at the top of the queue,
  ranks them above its own plan and answers each when done. `mid-turn-steering` is turn-level, and
  `review-at-the-fan-out-point` says the run is watched intermittently, but neither states a
  round-boundary steering channel for a multi-round loop. One voice, a prompt with no outcome.
  **Return when** a second voice or a tree shows round-boundary steering in a long unattended loop
  with a measured effect. Home then: `unattended-build-loop`.

## Replication

Nothing to remake, and no row banked. Each miner named one replica candidate and dropped it for
having no use: a cel toolkit-fit slice (hands plus one animated character) and a voxel sandbox with
material-keyed fire, built once from scratch and once from a carved module. No kept line is a game,
and in mage-arena, bp and PoF the look and any destruction system are the operator's call, with no
open decision naming them. The lander agrees. If a game repo opens a look decision, the slice in
`toolkit-fit-slice-before-the-look-is-chosen` is the method, not this source.

## For the cluster question

- **Style:** one voice, by eye, restating a rule the corpus already holds with three earlier
  sightings. The one defect the creator admits (the hands) is the element that technique already
  says to slice first. Voxels add nothing argued.
- **Loop cost:** no measured answer. The week bought a reusable module as well as a game; the 15
  minutes measured integration on one self-judged scene, on a different model, at a different task.
- **The plan's framing compares a run that wrote a skill with a run that consumed it.** That framing
  is the B12 catch.

## Plan homes

The plan named six homes. The rows landed against `concept-scene-parity`, `unattended-build-loop`
and `agent-run-budgeting`, plus `agent-benchmark-design` and `cheapest-sufficient-tier` from the
promotion read. `shader-budget-authoring` and `distance-tiered-stand-ins` drew no row: neither video
gives a frame cost or a draw distance. `visual-style-locking` holds one catch (B4).
