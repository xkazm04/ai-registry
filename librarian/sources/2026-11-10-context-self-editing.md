---
source: youtube
kind: video
url: "https://www.youtube.com/watch?v=Bgtr1Ue40Jo"
title: "Context Language Models: Your Agent Doesn't Need Compaction"
author: "Prompt Engineering"
words: 2203
extracted: 11
accepted: 1
declined: 0
leads: 3
already_covered: 4
untriaged: 1
dispatched: 0
applied: 0
shipped: 0
run_id: shift-context-self-editing
siblings: 2
fetches: 4
---

# Context self-editing, mined under /shift, 2026-11-10

Plan `plan-20261109-152922`, cluster `context-self-editing`, board run `shift-context-self-editing`.
The question: should an agent edit its own context instead of having it compacted, when does
self-editing beat a summary, and what does it cost the prompt cache? One video, read from cached
captions only (2,203 words, nothing on screen watched). No GPU, no download, no install, no clone, no
model call. Phase 7.7: gate=skipped.

**Class:** a second-hand practitioner review of a research release, with a small first-party test
inside it (n=1 per arm, synthetic, one local 27B model, a 32K budget; the creator's own words: "don't
treat it as a benchmark"). The test's failures are the useful half: default summaries invented
identifiers, the agent recovered by re-grepping against an instruction, and under default settings the
model mostly did not self-edit.

**Expected yield, stated first:** an amendment, perhaps one technique on self-editing and its
prefix-cache cost, against a heavily worked `prompt-assembly`. **It came out at one technique.**

**Voices:** one channel. The paper is the primary this video relays, not a second voice, so nothing
here carries convergence.

**Admission:** the +3 bar governed 6 scored rows. The miner scored the technique row 3/1/2 (the
decision rules rested on the video and an extension README). The lander spent the promotion read the
miner named: the paper's full text (arXiv `2609.37725`, HTML, read through a fetch on 2026-11-10;
budget ablation, harness appendix, cost appendix, safety section). It confirms the mechanism, the
budget boundary, the model-capability boundary and the cache slope in the paper's own numbers, so RISK
drops to 0 and the row clears at **3/0/2**. Rows 2, 4, 7 and 8 fold into it. `auto=1/5/0 fp=0`: the
miner accepted nothing, and the one accept is the lander's, on a primary.

## What landed

- **New technique `model-curated-context`** in `software-engineering/llm-agent/prompt-and-context/prompt-assembly`:
  the model under work as the editor of record of a client-held list. When it beats a summary and when
  it ties; the one overflow guard the client keeps and its firing rate as the evidence the policy ran;
  the cache slope when the model chooses edit position and cadence; every self-edit through the
  summary's validation door. Laws cited: `one-validation-door`, `count-carries-predicate`,
  `gate-sees-target`.
- Golden path: `techniques:` entry and index bullet.
- `context-ownership-regimes`: one appended section, "Inside the client-held regime, a second editor",
  pointing at the new technique. Every existing sentence stays true (the three regimes are about who
  holds the list; the new case is who edits it within one of them), so it is an append.

## What the paper's full text said, against the miner's open items

| Miner's item | Paper (full text) | Effect |
| --- | --- | --- |
| Self-editing ties summaries at a large budget | 128K, multi-task coding benchmark: plain self-editing 47.3, summary 47.8; with subagents 50.2 | confirmed; the 128K gain is delegation's |
| A 9B model trailed clean summaries until RL | Before RL 28.8% vs 34.7% (at 1.52 vs 4.01 PFLOPs per question); after RL 42.5% vs 42.1% | confirmed, six points |
| The model often does not self-edit | 9B: 1.4 edits per task, none in half the tasks, peak 30.2K of 32K; 27B: 2.6 edits, peak 17.6K | confirmed and measured |
| Harness: guard, reminder, size note, one call per turn | Rollback-and-retry on overflow (bounded at 6 and 50 by benchmark); reminder 2,048 tokens before the budget; token-count hints help, closer is better. **One call per turn is not in the paper**, and the guard's firing rate is not reported | guard, reminder and gauge confirmed; one call per turn stays the video's n=1 and is written as a precondition to test |
| A mid-context edit loses everything after it | Appendix: every token after an in-the-middle edit is re-prefilled; per-turn estimate for a 27B model 1.41e14 FLOPs append-only, 5.74e14 mid-edit, 10.81e14 edit at the start (7.7x) | confirmed with numbers |
| Suffix cache reuse | Approximates a re-prefill; 7.8% of prompt tokens reused beyond the prefix hit, 5.3 points from reasoning stripping and 2.5 from other edits; one serving stack | written as research, not a lever |
| Injection persists through editable context | Safety section names it; no evaluation or defense | confirmed as a stated risk |

One inconsistency is recorded rather than resolved: an appendix row puts the 9B self-editing run at
39.9% against the summary's 37.7% on the same web benchmark, which the main table (28.8 vs 34.7) does
not. It is most likely a different instruction setting; the technique rests on the main table and on
the edit counts, which say the same thing.

The cache mechanism's other citation is a serving engine's prefix-caching design document (miner fetch
2): it keys each block by its tokens and every token before it. That is a **design statement, not a
measurement**, and the technique says so.

## Triage

| # | Candidate | Anchor | G/R/C | Outcome | Rule / prior art |
| --- | --- | --- | --- | --- | --- |
| 1 | The agent edits its own context like a file; the model is the editor of record | [00:03:51]-[00:04:42] | 3/0/2 | **Accepted** (lander, after the promotion read) | Phase 5; new technique `model-curated-context` |
| 2 | Self-edit cache cost is set by where the model edits | [00:11:10]-[00:11:35] | 1/0/1 | Folded into 1 | `cache-breakpoint-allocation` § Blast radius; paper's cost appendix |
| 3 | Default summaries invented identifiers and compounded | [00:07:45]-[00:08:12] | - | Already covered | `summary-evidence-gate` |
| 4 | The harness decides whether self-editing happens | [00:09:53]-[00:10:45] | 1/2/1 | Folded into 1 | `recovery-path-as-loss-signal` § opposite polarity; paper's harness appendix |
| 5 | The agent re-grepped every log against an instruction | [00:08:37] | - | Already covered | `recovery-path-as-loss-signal` |
| 6 | After a summary the agent denied a line it had read | [00:08:37]-[00:09:02] | - | Already covered | `history-compaction`, `summary-evidence-gate` (omission half) |
| 7 | Self-editing wins at 32K, ties at 128K; a 9B model needs RL | [00:12:26] | 2/2/1 | Folded into 1 | paper, budget ablation and RL table |
| 8 | Not automatically cheaper (about 2x tokens in one run) | [00:11:35]-[00:12:01] | 1/2/1 | Folded into 1 | as an instance, labelled n=1 |
| 9 | A self-edit is a write to the standing layer; injection persists | [00:12:53] | 1/0/1 | Partly in 1; the `summary-evidence-gate` boundary sentence **untriaged** (below) | `one-validation-door` |
| 10 | Compaction is steerable in plain language | [00:05:08] | - | Already covered | `compaction-target-is-an-aim`, `amortized-compaction-cadence` |
| 11 | Suffix cache reuse after an edit | [00:12:01] | - | Lead L1 | corroboration table; currency watch |

Each folded row ran under Phase 5 inside row 1's score. Row 11 is a lead under the corroboration table.

## Untriaged

- **P2, a boundary sentence in `summary-evidence-gate`** naming a self-edit as one of the writes that
  go through its one validator. 1/0/1, law-derived, under the bar. The new technique states the rule
  from its side and links the gate; the gate's own sentence ("all writes to the standing summary go
  through this one validator") stays true without it. Return: when a second source or a fleet tree
  runs a self-editing loop, so the gate's enumeration of writers can be checked against one.

## Leads

- **L1, post-edit KV reuse at the server.** Returns when a serving stack this fleet runs (the local
  model path or a hosted provider) ships reuse of KV after an edit, or the method leaves one model on
  one GPU. It would change the technique's "plan as if every edit re-bills its tail".
- **L2, the paper's emergent behaviours** (a self-invented notes role, a helper invoked 37 times, a
  scoreboard kept by 163 in-place edits at 6-8K tokens). Confirmed in the full text; used in the
  technique only as the shape of state that favours self-editing, not as evidence. No return needed
  beyond a fleet run that reproduces one.
- **L3, the guard's firing rate.** The paper reports edits per task and not how often its rollback
  fired. Returns when any self-editing result (ours or published) reports both; it would test the
  technique's central measurement rule.

## Apply (Phase 7.5): unapplied, blocked on two operator calls

**Seam:** bp `/perfect` analysis on the Pi harness (the operator's local-fallback experiment of
10-22). Arms: Pi's default summarizing compaction (A) against the self-editing extension with one tool
call per turn and per-result size notes (B), same task, same 32K budget, same model. Target: model
edits against guard fires, shared leading tokens and prompt tokens per task, re-reads after each
boundary. Floor: the `/perfect` directions' evidence verdicts unchanged.

**Blocked, both operator calls, nothing installed:** the 27B local model the plan names is not on disk
(no manifest or blob found by the plan), and installing the self-editing extension is a fetched-code
step. A third item to confirm: the 10-22 local harness script lived in a session scratchpad and may be
gone.

**The one measurement that could run now, named and not run:** arm A's loss on this fleet's own
agent-harness transcripts, no GPU. Count re-reads of already-read paths and repeated searches in the
turns after each compaction boundary, against the same count in matched turns with no boundary. It
measures the summary baseline's recovery rate here; it cannot measure arm B. Not run in this seat: it
reads private transcripts.

## Replication

No banked row. The video's finished work is a synthetic three-task test whose remake needs the missing
model and an install, both above; no `render.use` exists without them, and nothing is render-bound.

## Not extracted

The on-screen demo and the creator's settings (not seen), the third self-built task (named, not
described), model and hardware specifics as content, and the closing verdict (an opinion over n=1).
