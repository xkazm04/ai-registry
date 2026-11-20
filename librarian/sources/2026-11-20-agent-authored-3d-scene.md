---
source: batch
kind: batch
url: "youtube:HaFfexk1h84, youtube:5mA9Hab09Do"
urls:
  - https://www.youtube.com/watch?v=HaFfexk1h84
  - https://www.youtube.com/watch?v=5mA9Hab09Do
title: "Agent-authored 3D scene, /shift batch of 2 videos from 2 channels"
author: "2 channels: Stefan 3D AI (second-hand review run through his own 11-test deck, sponsored by a hosted-generation extension; twenty prior notes), Nick Saraev (second-hand showcase listicle that funnels to his community; first sighting). A third person, Felix Rieseberg, enters through a post linked in Nick's description and is read as a first-party post, not a mined voice"
words: 4641
extracted: 19
accepted: 0
declined: 0
leads: 1
already_covered: 8
untriaged: 4
currency: 3
dispatched: 0
applied: 0
shipped: 0
held: 0
run_id: shift-1120-a3ds
siblings: 2
fetches: 1
rescan_when: the operator's verdict on shift-replica-svfx-fireball-texture-route (row S4, its arm S); or a second channel publishes a logged scene-build or whole-game run (session log or timer) on a current model, so agent-run-budgeting can take a line; or anyone runs the top model at high effort on a scene-build deck beside max (row S1); or a managed project builds animated assemblies with an interference audit (row S6); or 8 weeks elapse (2027-01-15)
---

# Agent-authored 3D scene, mined under /shift, 2026-11-20

Plan `plan-20261120-104354`, cluster `agent-authored-3d-scene`, board run `shift-1120-a3ds`. The
question: when an agent builds a 3D scene in Blender or three.js as the finished picture, which model
should do it, at what time and cost, and what still breaks? Two miners read the cached captions in
full. Nothing on screen was watched. No GPU, no ComfyUI call, no model download. Phase 7.7:
gate=skipped.

- **S** = `youtube:HaFfexk1h84`, Stefan 3D AI, "Claude Fable 5.2 is Scary Good at 3D" (2,714 words,
  14:41). Four models get the same 11 prompts and input files: 8 tests in Blender 5.1, 3 in three.js.
  His public post (no pledge needed) links an archive with a measured table per test: time, tokens,
  tool calls and counterfactual API cost, the effort each model ran at, and every prompt. The miner
  read the table, three prompts and three compare pages by HTTP range request, without downloading
  the 16 GB archive.
- **N** = `youtube:5mA9Hab09Do`, Nick Saraev, "13 INSANE Things You Can Build w/ Claude Fable 5.2"
  (1,927 words, 9:13). A tour of browser builds with no method, timer or cost. The prompts sit behind
  a community signup that was not joined. The description links five posts by other people. One of
  them carries a fact: **Felix Rieseberg**, 2026-11-09, a whole browser FPS built one-shot with no
  human feedback, "models, sounds, textures" from scratch, "~$550 at API pricing, ~2.7M output and
  445M input tokens, heavily cached. Took 8 hours!"

**Class and expected yield, stated first:** two second-hand pieces about a model release. Expected:
currency rows, catches, at most one lead, nothing to remake. That held: 0 accepted, 1 lead, 3
currency lines, 8 caught, 4 untriaged, 3 dropped. The lead's yield is an amendment to a held row
banked earlier today, not a new row.

**Voices.** Two channels, plus Felix's first-party post. They converge on one thing only: a long
agent build's tokens are overwhelmingly input (row S3). Stefan's earlier rows (2026-09-16 row 8,
2026-11-10 S2) are the same channel, so this video gives them no second voice. Felix's post is the
first whole-game figure in wall clock from a channel other than Stefan.

**Admission.** The **+3 bar** governed the two scored rows (S6, and the order-of-magnitude line N1
and S2 would put in `agent-run-budgeting`). It comes from `/intake` Phase 5 Step 3 (its v2.21
paragraph) and Step 4, read against `SCORECARD.md` on 2026-11-20: the last nonzero fp is 2026-11-19
(`layout-decision-placement`, fp=1), there are not three consecutive fp=0 runs whose rejected rows a
later run re-derived, and no run records a re-derivation. So the step-down has not fired, and a step
is a method edit, never a lander's setting. Neither scored row reaches +2 either, so the bar changes
no outcome here. N7, N8 and N9 are V2 vetoes, recorded untriaged and not scored. Currency rows and
the lead ran under the corroboration table. `auto=0/2/0`. **fp=0**: neither miner accepted anything.

## What landed

This note, its ledger lines, and one amended held row: `shift-replica-svfx-fireball-texture-route`
gains **arm S** (Way 4, simulation) before its first run. Only its arms, brief, guard and estimate
basis changed. `estGpuMin` stays 15, because arm S runs on the CPU. No corpus file changed, no code
changed, no project touched.

## What the promotion read found

The lander read both reports whole, re-read the miner's saved copies of Stefan's `index.html`,
three compare pages and the T06 prompt, made **one range request** (26 KB) for the Opus run's T06
technical report from the same public archive, read PoF's `pipelines/vfx.ts` at `origin/master`
66dc1d35c (equal to the remote tip by `ls-remote`), opened the 2026-11-10, 2026-11-16 and
2026-09-16 notes for their return conditions, `cache-continuity` and `unit-classes-are-open` for
row S3, and ran three CPU-only Blender 5.2.2 probes for arm S.

- **Confirmed (the table).** Totals re-added: the top model $475.73 against $238.14 (2.00x), 1,003
  against 772 summed minutes (1.30x), longer on 11 of 11 tests (1.05x on T07 to 1.82x on T06). It
  misses the test's one rule on 0 of 11 against 2 of 11 (T02, T07) and is graded "clean" on 9
  against 3. The table's time is close to elapsed time: the Opus T06 log gives 57 min 24 s elapsed
  to its cutoff against the table's 60 min, which also counts the turns after the cutoff.
- **Contradicted (the S4 claim).** The miner wrote that "an agent built a spell shot whose smoke is
  a low-resolution gas sim". The T06 prompt only *allows* one ("a low-resolution smoke simulation
  (64 divisions or fewer) or a geometry-nodes system"). The Opus run's own report says its dust "is
  a geometry-nodes system ... not a fluid simulation", and it lists "Make the dust a real
  low-resolution smoke simulation" as its next step. Its bakes (cloth, particles, rigid body) took
  35.6 s in all. The Fable run's dust method was not read. So the source does not demonstrate the
  route. The arm stands on standard game-VFX practice (training-data convergence) and on the
  lander's probe, below.
- **Corrected (the arm's renderer).** The miner priced the arm at 1-3 GPU minutes of EEVEE, and the
  dispatch said "CPU EEVEE". On Lynx EEVEE renders on the card, and the bank allows only ComfyUI's
  queue there (the r4 and r9 precedents moved to Cycles on the CPU for that reason). Cycles on the
  CPU is enough: the lander's probe baked a 64-division gas domain over 64 frames in **19.7 s** (37
  MB cache; 48 divisions in 7.5 s) and rendered 256x256 frames at 32 samples in **1.0-2.2 s** each,
  with a fire flash at frame 12 and white smoke at frame 40. A turbulence field takes a `seed`
  (checked), so SEED varies shape and not timing. The arm takes no GPU minute.
- **Corrected (pricing, both miners).** Both priced cache writes at an assumed 1.25x input. The Opus
  T06 run's own usage section, from its session log with the price page saved, prices **1-hour cache
  writes at $8 per MTok (2x input)** and cache hits at $0.20 (0.05x), and splits its $19.34 as cache
  reads $9.45 (49 %), output $6.24 (32 %), cache writes $3.65 (19 %, 0.46M tokens, all 1-hour TTL),
  uncached input about $0. Row S3 is resolved on that basis.
- **Struck (convergence on N1).** Nick's miner scored N1 with +1 convergence "Felix and Mark". Mark's
  unit is a week of allowance (2026-11-16 B11) and Felix's is wall clock, so they are not
  convergence. The two wall-clock whole-game figures, Felix's 8 h and Stefan's 50-100 h (2026-09-16,
  an earlier model, looped), disagree by 6-12x.
- **Held (the seam).** PoF `pipelines/vfx.ts` steps 3 "Mesh / Sprite" and 4 "Material" still name no
  engine at `origin/master` 66dc1d35c (`gallerySeed`), so the held row's `use` stands.
- **Corrected (the plan).** The miners' corrections stand: 11 tests, not 10 (T03, the kickflip, is
  missing from the chapters); the sea dragon took 1 h 46 min at 2.19x, and the 3x scene is T03
  (2.62x); the 61 credits were T04's alone, 37 of them spent on an unused attempt; the 13 builds in
  N's tour are presented as his own, and the credited builds are five different ones.

## The 2026-11-16 B11 and 2026-11-10 S2 return conditions

**B11 fires by its letter, and the line it allows still does not land.** B11 waits for "a second
channel [that] states a whole game's cost in the same unit as one of these". Felix states a whole
game in wall clock, and he is not Stefan, so it fires on the wall-clock leg. Stefan's "two weekly
limits on my two Claude accounts" does not fire the allowance leg: it covers an 11-scene deck, not a
game, and the plan tier is unstated on both sides. Stefan's miner leaned "no" because of that
allowance leg. Nick's miner said "yes". Both are partly right, and the wall-clock leg decides it.

What fires is permission to propose a line, not the line itself. The line would be "a small
agent-built browser game is a several-hour to multi-day unattended run". It scores **1/2/1 = -1**:
GAIN 1 (a boundary line in `agent-run-budgeting` § The three budgets), no convergence (the two
figures differ by 6-12x across model generation, one-shot against looped, and scope), RISK 2 (both
figures are self-reported prose, and Felix's is notional "at API pricing", with no log). That is
below +3, and below +2. No managed project runs whole-game agent builds, so no ceiling in use would
move. Filed as currency. Felix's affiliation and access tier were not checked in-run; the miner
flagged a possible vendor tie from training knowledge only.

**The 2026-11-10 S2 condition does not fire.** It asks for a second channel reporting wall clock per
agent-built 3D task. Stefan's measured table is the same channel as S2. Felix's 8 h is a whole game,
the scope difference 2026-11-16 B12 already struck. For scale only: Stefan's measured scenes take
47-127 min on four models, which brackets his own earlier 0.5-1.5 h now that it is logged.

## Candidates

Rule column: "Phase 5, +3" for scored upper-layer rows; "V2" for vetoed rows; "corroboration table"
for currency and leads; "catch" for rows the corpus already holds. G/R/C is the lander's.

| # | Candidate | Voices | Anchor | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- |
| N1 | A whole browser FPS, built one-shot: about 8 h, about $550 notional, 2.7M output and 445M input tokens | Felix (via N) | Felix post, N's description | Currency, ledger only | corroboration table | Fires B11 on wall clock. The `agent-run-budgeting` line it allows scores 1/2/1 = -1 (no convergence, prose). Above |
| S1 | Top model against mid model, both at max effort, 11 scene builds, one run per cell: 2.00x the notional cost, 1.30x the wall clock, one-rule misses 0/11 against 2/11 | S | index.html table | Currency, ledger only | corroboration table | `cheapest-sufficient-tier` (sweep effort, one cell supports a paired comparison, not a verdict). The vendor's guidance starts the top model at `high`; nobody ran `high`, the grades are the models' own audits (`no-gate-self-certifies`), so it names no default and moves no recorded decision |
| S2 | One unattended scene build takes 47-127 min on four models (Claude runs 51-111 min, $16-62 notional, 54-88M input and 0.33-0.75M output tokens); the deck took two weekly limits on two accounts | S | table; [00:02:55] | Currency, ledger only | corroboration table | `agent-run-budgeting` § The three budgets holds no figure. Same channel as 2026-11-10 S2, so no second voice; the allowance datum has no plan tier |
| S3 (N2) | What drives a long build's bill | S, N, Felix | compare pages; Felix post; Opus T06 report § 8 | Caught, contradiction resolved | catch | Below. `cache-continuity` already prices a write at "roughly 1.25x (more for a long-lived entry)" and makes the read fraction per model; `unit-classes-are-open` keeps cache-write units apart from reads. The resolution is a pricing exercise on those rules |
| S4 | Add a Blender simulation arm to the held fireball replica | S (prompt), standard practice | T06 prompt; Opus T06 report | Lead, applied to the held row | corroboration table | `use` inside the row's own: PoF vfx steps 3-4. Above (contradicted, then the arm stands on practice and the probe) |
| S5 | Render-budget preflight: three test frames, the film at 10 min or less, nothing over 20 min, bakes at 20 min or less, playblasts for checks | S | shared prompt half | Caught | catch | `preflight-before-an-expensive-cook`; `preflight-estimation`. Carried into arm S's brief |
| S6 | A zero-interference check is met by spacing parts apart: the low-cost model kept panels 4-8 mm apart for "0 intersecting pairs in all 840 frames" and "the body reads as loose red sheets", while the model that measured honestly reported 1,839 overlapping pairs | S | T01 compare page | Untriaged, raw 2/2/2 | Phase 5, +3 | GAIN 2 (a new technique: pair an interference audit with a maximum-gap check on mating parts); RISK 2 (the compare page's prose, with CAD practice as training convergence, so no V2). No corpus home on clearance; nearest `instrument-answers-only-its-own-question`. No managed project builds animated assemblies. It also explains the plan's "Gemini leaves holes" |
| S7 | Generate the hard part, code the rest, hide the join; generated sky panoramas and textures | S | T04, T06 compare pages | Caught | catch | `declare-the-producer-per-asset-class`; `part-cut-planning`. The cluster's "placed assets against model-everything" question has no arm here: T04 required generation and T01 forbade it |
| S8 | Price a run from its own logged counters, deduplicated by response id, with the price page saved | S | shared prompt half; Opus T06 report § 8 | Caught | catch | `cost-metering`; `time-ceilings-count-working-time`. It is why these numbers outrank the channel's earlier ones |
| S9 | Frozen prompt, empty workspace, hashed inputs | S | shared prompt half | Caught | catch | `agent-benchmark-design` § Cells must differ in exactly one thing |
| S10 | The vendor recommends the mid tier for most work | S | [00:02:55] | Caught | catch | The local `claude-api` reference agrees (Opus 5.5 is the default; the top model on request) |
| N3 | A showcase 3D city at "(Max)" | N | Gostev post | Caught | catch | `cheapest-sufficient-tier`. Stefan's post shows his "max" is the effort tier; this tag stays unread |
| N4 | A short animated scene authored wholly in code (clay stop-motion, embroidery, a flip book, a four-season tree) | N | [00:00:51], [00:06:25], [00:07:15], [00:08:32] | Caught | catch | 2026-11-10 `code-rendered-watchable`, 2026-11-16 `code-rendered-motion-brief`; the UI-ad 3D kit (r19) was dropped 11-19 |
| N7 | A progressive path tracer: coarse in motion, refining when still | N | [00:02:57]-[00:03:22] | Untriaged | V2 | No primary, thin. Nearest `frame-stepped-page-capture` |
| N8 | An explainer scene with exploded, transparent and cutaway views | N | [00:03:50]-[00:04:16], [00:07:41]-[00:08:06] | Untriaged | V2 | No primary, thin. No home in the cluster |
| N9 | Generated audio bound to the same state variable as the visuals | N | [00:01:42], [00:07:41] | Untriaged | V2 | No primary, thin. Nearest `spatial-audio-scene-authoring`, another concern |
| N5 | "The best at beautiful animations" | N | [00:01:42] | Dropped | corroboration table | A ranking with no comparison and no unit |
| N6 | "Burned a hole in my wallet" | N | [00:00:00] | Dropped | corroboration table | No unit (2026-11-16 B6 precedent) |
| N10 | Three working devices from a one-paragraph prompt | vendor post | N's description | Dropped | corroboration table | Outside the cluster |

Also dropped: the "nerfed" speculation [00:03:45], intelligence-index points [00:00:50], the
"frontier vs non-frontier" pairing [00:01:15], N's other tour items with no attachment, and the
community pitches. **S11, recorded and not a row:** the narration contradicts the source's own table
twice ("pretty much the same time" [00:08:23] against 1.30x; "the difference is like minor" on the
spell [00:09:14] against "clean" and "finished"). The measured table outranks the commentary over it.

## Row S3: what drives the bill

The miners disagreed. Nick's said a long build's cost "is set by context re-reads and cache writes,
not by output". Stefan's said output is 42-48 % of the top model's bill and that the gap between the
two models comes from output and cache-write prices. Priced on the logged rates (both Claude models
read cache at $0.20 per MTok; writes at 2x input for a 1-hour entry, by the Opus run's own price
page; the top model's write multiple is assumed the same):

| Run | Input : output | Output share | Cache-read share (upper bound) | Remainder: writes and uncached input |
| --- | --- | --- | --- | --- |
| Opus T06 (logged) | 153 : 1 | 32 % | 49 % | 19 % (0.46M written tokens) |
| Opus T01 | 154 : 1 | 33 % | 51 % | 16 % (about 0.7M) |
| Fable T01 | 107 : 1 | 48 % | 26 % | 26 % (about 1.0M) |
| Fable T06 | 160 : 1 | 42 % | 34 % | 24 % (about 0.8M) |
| Felix, whole game, 8 h | 165 : 1 | 20 % | 16 % | **64 %** (22-35M at a 2x or 1.25x write) |

- **The token ratio converges** across two channels and a post (107-165 : 1).
- **Re-reads are never the main driver of the top model's bill.** At 0.05x input they are 16-34 %
  of it. They are the largest share only on the mid model, whose output is half the price.
- **What varies is cache-write volume.** One- to two-hour scene runs write 0.5-1.0M tokens. Felix's
  8-hour run implies 22-35M. A long run that keeps rewriting its context, through expired entries,
  compaction or edits to the prefix, pays for it there. That is Felix's bill: about two thirds
  writes, a fifth output.
- **The gap between the two models** comes from output and write prices, as Stefan's miner said,
  because both read cache at the same price.

Safe sentence, if anyone writes it: "a long agent build's tokens are read-dominated; its bill's split
is per model and per run, and the term that grows with run length is cache writes". It follows from
`cache-continuity` and `unit-classes-are-open` with today's prices, so it is a catch. The prices are
dated facts, recorded here only.

## Lead S4, applied to a held row

**`shift-replica-svfx-fireball-texture-route` gains arm S**, before its first measurement:

> Way 4, simulation: Blender 5.2.2 headless on the CPU, one gas domain of at most 64 divisions per
> element (the burst as fire, the smoke white), a seeded turbulence field, Cycles CPU frames at
> 256 px cut to the same 8x8 atlas of 128 px cells with the same luminance alpha; burst and smoke
> only, shown with the code core; a SEED 2 pair on the atlas sheet.

The brief now carries the setup check (0e), the Way 4 step with the source's render budget as its
preflight, 16 clips instead of 12, the per-element choice that offers S for the burst and the smoke,
and an empty-atlas check. The guard keeps Blender on the CPU, never EEVEE, never during the lease or
beside `render.mjs`, and turns a setup failure into a lead with Ways 1-3 unchanged. The row records
why the arm is there and from which source. **Why it clears:** the row's `use` (which texture route
PoF's vfx steps 3-4 name per element) is exactly what a sim arm answers for smoke, the route is the
industry default the row left out, it needs no model, no download and no GPU, and the probe ran it on
Lynx. **What it does not settle:** UE GPU cost, as for every route in the row.

## For the cluster question

- **Which tier:** at max effort, the top model was the only one to keep every test's one rule, for
  2.0x the notional cost and 1.3x the wall clock. One run per cell, both at max, graded by the
  models' own audits: under `cheapest-sufficient-tier` it names no default. The plan's failure list
  maps to T01: transit contacts on the mid model, and the low-cost model's "holes" are gaps left on
  purpose to pass a no-intersection check (S6).
- **Placed generated assets against modelling everything:** no source gives an arm of each on one
  subject. Felix's game is the model-everything side at 8 h; Stefan's scenes place a generated head,
  skies and textures where the prompt allowed them. A juxtaposition, not a comparison.
- **Time and cost:** a scene build is 1-2 h and $15-62 notional on the Claude models at max; a small
  one-shot game was 8 h and about $550. Nothing in the fleet runs either today: r19's three.js kit
  was dropped on 11-19, previs is closed, and PoF props are parametric by the operator's 10-21 choice.

## Replication

Nothing remade. Nick's miner dropped its one candidate (a code-only clay short) for having no use.
Stefan's miner found that 10 of the 11 tests feed no kept line, and turned the eleventh (T06's
simulated smoke) into arm S of an existing row instead of a new remake. The lander agrees. The
archive's other prompts, reports and build scripts are indexed by the miner and can be range-read
later, a few KB each.

## Proposals (not landed)

- None to the corpus. Row S6 waits for a consumer: if a managed project builds animated assemblies
  with an interference audit, a clearance upper bound beside it is the technique to test there.

## Plan homes

Rows drew on `agent-run-budgeting`, `model-and-effort-selection` (`cheapest-sufficient-tier`),
`cross-provider-benchmark-operations` (`agent-benchmark-design`), `generative-provider-routing`
(`declare-the-producer-per-asset-class`) and, from the promotion read, `cache-continuity` and
`cost-metering`. `generative-provider-auditing`, `concept-scene-parity`,
`mesh-finishing-for-engine-readiness`, `live-system-demo-film` and `motion` drew no row: no test
reports a mesh budget, a concept-to-scene check or a capture method the corpus lacks.
