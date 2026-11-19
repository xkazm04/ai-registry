---
source: youtube
kind: video
url: "youtube:IRZqAdKcNTE"
urls:
  - https://www.youtube.com/watch?v=IRZqAdKcNTE
  - https://huggingface.co/KRAFTON/Raon-1-nano
title: "Small local NPC model, /shift batch of 1 video from 1 channel"
author: "1 channel: Sam Witteveen (third sighting; second-hand practitioner review of a vendor's open-weights release, no sponsor)"
words: 4212
extracted: 8
accepted: 0
declined: 0
leads: 1
already_covered: 2
untriaged: 4
currency: 1
dispatched: 0
applied: 0
shipped: 0
held: 0
run_id: shift-1119-slnm
siblings: 3
fetches: 4
rescan_when: all three parts of the lead's return condition hold - a runtime on this machine loads Raon-1 nano (llama.cpp PR #32200 merged and picked up by Ollama, or the operator approves SGLang or a vendor fork), a project with a runtime NPC decision seam is in the fleet, and the roughly 2 GB download is scheduled for night; or 8 weeks elapse (2027-01-14)
---

# Small local NPC model, mined under /shift, 2026-11-19

Plan `plan-20261119-072526`, cluster `small-local-npc-model`, board run `shift-1119-slnm`. The
question: should a game's NPC brain be a small on-device model fed game state in context, and is a
1.5B dense model distilled from an MoE enough for intent choice and short in-character lines in JSON,
beside the game, on a runtime that serves it today? One miner read the transcript whole and the vendor
model card. No GPU, no download, no render. Phase 7.7: gate=skipped.

- **W** = `youtube:IRZqAdKcNTE`, Sam Witteveen, "RAON-1 Nano: The Tiny LLM for AI Game Characters"
  (4,212 words, 21:16). A walkthrough of Krafton's Raon-1 nano (1.5B effective) and its parent Raon-1
  mini (29B MoE), with a hand-built two-model "arena" demo: life-sim intents and short lines in JSON
  [00:16:22]-[00:17:20]. No rates, no token counts, no failure counts, run on a workstation-class box.

**Class and expected yield, stated first:** a second-hand practitioner review of a vendor release. For
this class the vendor's model card is the extraction. Expected: one lead, one currency line, catches,
no accept. That held: 0 accepted, 1 lead, 1 currency line, 2 covered, 4 untriaged.

**Voices.** One channel, so no convergence on any row.

**Admission.** The **+3 bar** governed the two Phase 5 rows that carry a score (5 and 6). It comes from
`/intake` Phase 5 Step 3 (its v2.21 paragraph) and Step 4 as they stand, read against `SCORECARD.md`:
the tail reads fp=0 since 2026-11-11's fp=1, but the step-down needs three runs whose rejected rows a
later run had to re-derive without reading the bank, none is recorded, and a step is a method edit,
never a lander's setting. Neither scored row would clear +2 either. The lead and the currency line ran
under the corroboration table. `auto=0/2/0 fp=0`: the miner accepted nothing, so no accept died here.

## What landed

This note and its ledger lines. No corpus file changed, no project was touched, no row was banked.

## What the promotion read found

No row was an accept, so the read went to the facts the lead and its return condition lean on. The
lander re-fetched the model card, queried the three llama.cpp pull requests through the GitHub API,
opened `behaviour-model-selection` at its menu and its hybrid rule, re-checked the machine and the
fleet map, and opened mage-arena-pc's Director provider at `de4fbd6`.

- **Held: thinking-first.** The card: "Raon-1 nano is designed for thinking mode; disabling it is not
  recommended", and thinking is "enabled by default in the chat template". The only build that answers
  without thinking is the LiteRT-LM bundle: "This bundle has a 4,096-token context and answers without
  thinking." The native context is 262,144 tokens.
- **Held: 3.1B in memory.** "1.5B effective parameters", 3.1B total "including a 1.5B per-layer
  embedding table"; the checkpoint is 3.2B with a 55M multi-token-prediction module. Only the 6 MLA
  layers keep a KV cache, about 7 KiB per token in BF16. The budget beside a game is 3.1B plus a small
  cache, not 1.5B.
- **Held: #32200 is an open draft.** "model : add Raon-1-nano support", opened 2026-11-13, `state`
  open, `draft` true, not merged. #31107 ("add Raon-1 mini preview support", a draft) closed unmerged on
  2026-10-24 after 23 minutes, and it concerned *mini*. #32176 (mini-preview) is open, not a draft,
  updated 2026-11-19.
- **Held: no structured-output support stated.** The card covers tool calling through a vLLM-fork
  parser and never mentions JSON schema or constrained output. It names no game, NPC or roleplay use.
- **Held: runtimes.** vLLM and llama.cpp need vendor forks (GGUF at `KRAFTON/Raon-1-nano-gguf`);
  SGLang is shown with a stock install; transformers and MLX need repo code; LiteRT-LM is stock.
  Ollama appears only as a "compatible app" in the quantizations link, with no setup of its own; with
  the architecture unmerged in mainline llama.cpp, nothing says it loads.
- **Held: the box.** No `ollama`, `llama-server` or `llama-cli` on PATH; the Ollama model store has no
  manifests and an empty blob directory. Neither arm nor the qwen3.8:27b baseline can be served.
- **Held: the fleet.** `projects.json` has no mage-arena-pc entry. pof's only local model is a vision
  provider; personas scopes games out.
- **Held: the Director's contract.** `packages/director/src/providers.ts` at `de4fbd6` sends
  `think: false` and passes the schema as Ollama's `format` (lines 214, 246-248). That is the
  configuration the card advises against, and schema enforcement sits in a runtime that cannot yet load
  this architecture. mage-arena-pc is out of the fleet; it is named here only as the evidence seam.
- **Held: the home's gap.** `behaviour-model-selection` § The menu has four entries (state machine,
  hierarchical fallback, utility scoring, planner) and no language-model entry; its hybrid rule reads
  "a scoring layer choosing the intent and a structural layer executing it".

## The lead: a small context-fed model as the NPC intent chooser

**Claim (source's terms).** An NPC needs instruction following, tone and game state in context, not
world knowledge, so a small on-device model should be enough [00:04:04]-[00:05:21]; demo [00:16:52].
The demo shows well-formed intents and lines; it measures nothing, and the creator flags his benchmark
reading as his own [00:08:43].

**Home it would test.** `game-production/systems-canon/agent-behaviour-authoring/techniques/behaviour-model-selection`
(no language-model rung) and `agent-operations/model-and-effort-selection/cheapest-sufficient-tier`
(measure your own task, take the cheapest tier that clears the bar).

**Return condition, all three parts:**

1. **A runtime here loads the model.** #32200 merges into mainline llama.cpp and Ollama picks it up,
   or the operator approves SGLang or the vendor's llama.cpp fork on this machine.
2. **A runtime NPC seam is back in the fleet.** mage-arena-pc re-admitted, or a new in-scope game
   with a runtime NPC decision.
3. **The download waits for night.** The Q4 GGUF is roughly 2 GB (house rule: large downloads at
   night); the 27B baseline is larger and must be re-pulled the same way.

Strike the lead if no local-NPC work is coming.

### The four-arm test design (part of the lead, not a banked row)

Not banked as a held row: there is no runtime on this machine and no fleet seam, so `next` could never
run it. It is written down so the run that meets the return condition starts from it.

- **Arms.** (a) Raon-1 nano Q4, thinking on; (b) the same, thinking off; (c) the qwen3.8:27b baseline
  (the Director's `ollama.model`); (d) the Director's offline `PlannerProvider` as the floor. Two nano
  arms because the card's designed mode and the Director's contract disagree.
- **Run.** Feed each arm the seam's own `decide` and `parley` requests through its harness, same seeds
  and camp states.
- **Measure.** Schema pass rate before repair; validator repair rate; `incomplete-output` and
  `done_reason=length` rate under the 1,800-token `num_predict` cap (thinking eats it); intent
  distribution against the planner; lines that break the parley rules (digits, invented names,
  out-of-world echo); p50/p95 latency; peak memory.
- **Discriminator.** If thinking-off nano holds the schema pass rate within a few points of the 27B
  baseline, the small model serves the bulk soak. If it holds only with thinking on, per-decision
  latency and the token cap decide instead.
- **Time.** About 1-2 h of CPU or GPU soak once the runtime and weights are present.
- **What it lacks today:** a runtime binary, the weights, the baseline weights, and an in-fleet seam.

## Candidates

Rule column: "Phase 5, +3" for scored upper-layer rows; "corroboration table" for the lead and the
currency line; "catch" for rows the corpus already holds.

| # | Candidate | Voices | Anchor | G/R/C | Read | Outcome | Rule | Prior art and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Trial a ~1.5B context-fed model as the NPC intent chooser | W (1) | [00:04:04]-[00:05:21], [00:16:52] | n/a | real gap, no evidence | Lead | corroboration table | `behaviour-model-selection` has no language-model rung; `cheapest-sufficient-tier` owns the procedure. Qualitative demo only. Return condition and four-arm design above |
| 2 | Raon-1 nano shipped: Apache 2.0, thinking-first, 3.1B in memory, forks only | W + vendor card | [00:19:02]-[00:19:56] | n/a | dated fact | Currency, note only | corroboration table | Corrected against the card and the GitHub API: the PR "closed unmerged" is mini's #31107; nano's #32200 is an open draft. "4K, no thinking" is the LiteRT bundle only |
| 3 | Push NPC inference onto player hardware to escape metering | W | [00:02:43]-[00:03:11] | - | likely catch | Already covered | catch | `on-device-vs-cloud` decision matrix, "Cost shape": per-use metering that scales with adoption against a one-time footprint |
| 4 | NPC intent as a typed record from needs and time | W | [00:16:52]-[00:17:20] | - | likely catch | Already covered | catch | Law `deterministic-code-owns-numbers`. The Director is stricter: the model picks from a schema enum and code picks targets and numbers; the demo lets the model emit object and duration |
| 5 | A language model as the intent-scoring layer only, over the declared menu, with an offline planner as the fall-back rung | W + tree | [00:16:52]; Director `PlannerProvider` | 2/1/2 (raw +1) | partial | **Untriaged** (best row) | Phase 5, +3 | Append to `behaviour-model-selection`'s menu under its hybrid rule. GAIN 2 (new technique outside the scan's top 15, no convergence); RISK 1 (home gap confirmed by the lander's read, but the claim rests on an unmeasured demo). A promotion read could lower RISK by 1 at most, to +2, still under +3, so it was not spent. No fleet seam for Phase 7.5. Re-read when the lead returns |
| 6 | Screen context-fed models on grounding, not stored knowledge | W | [00:07:29]-[00:08:23] | 1/2/1 (raw -1) | thin | Untriaged | Phase 5, +3 | `cheapest-sufficient-tier` makes the task eval the decider; a public-benchmark profile is at most a pre-filter. Creator's read of vendor-reported numbers |
| 7 | MoE-to-dense conversion by diversity-scored expert merge | W | [00:10:36]-[00:13:16] | n/a | thin for us | Untriaged | not scored | No fleet project trains or distills models; the paper's +6.3 points and 1.6x were not fetched |
| 8 | Keep a teammate's long-session memory in context | W | [00:04:04] | n/a | likely catch | Untriaged | not scored | One sentence, not elaborated. Near `companion-runtime`, `agent-memory` |

Counts: accept 0 / lead 1 / currency 1 / catch 2 / untriaged 4.

## Instruments and plan: what was wrong

- **Plan, llama.cpp.** "The llama.cpp pull request was closed unmerged" is true only of mini's #31107.
  Nano's #32200 is an open draft, so part 1 of the return condition is nearer than the plan implied,
  but a draft awaiting review is not a date.
- **Plan and video, size and context.** "1.5B" and "4K context with no thinking" understate the model:
  3.1B in memory, and 4K without thinking is the LiteRT bundle only.
- **Plan, the seam.** The Director fits in shape (closed intent enum, code resolves effects), but its
  `think: false` plus schema-in-`format` contract is the configuration the vendor advises against. The
  plan did not test this, and the seam is out of the fleet since 2026-11-18.
- **Plan, the extraction.** The plan named the NeurIPS paper as this class's extraction. The model card
  was the better one for the decision question; the paper only bears on row 7, which no fleet project
  uses.
- **Miner, research map.** Ran at default `--top`; homes came from `registry-query` and file reads,
  and the absence claims rest on greps over `game-production` and `knowledge/` prose.

## Proposals (not landed)

- Re-score row 5 as an amendment to `behaviour-model-selection` only after the four-arm run produces a
  number; until then it is a menu entry with no measurement behind it.
- No project change is proposed: mage-arena-pc is out of the fleet, and pof and personas have no
  runtime NPC decision seam.

## Fetches: 4

Miner 3 (a web search for the card, the model card, the GitHub API for #32200, #31107, #32176).
Lander 1 web (the model card again) plus the GitHub API for the same three PRs.

## Not verified

- The NeurIPS paper and its +6.3-point and 1.6x claims (row 7).
- The release date: third parties disagree (10-29 vs 11-11), and the card does not say.
- That the vendor's PUBG teammate runs on this model; the creator says the vendor has not claimed it
  [00:05:21].
- Any tokens/s or memory total beside a running game.
- Whether stock SGLang or the vendor GGUF actually loads on this ARM64 Windows machine.
