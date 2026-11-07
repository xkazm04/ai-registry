---
source: https://www.youtube.com/watch?v=aZglGvBPQGs
kind: youtube
url: https://www.youtube.com/watch?v=aZglGvBPQGs
title: "Jev Course - Prefill-Only Inference & Decision Models from Scratch"
author: "freeCodeCamp.org (course by Vivek Kalyanarangan)"
words: 12598
extracted: 20
accepted: 1
declined: 0
leads: 4
already_covered: 3
untriaged: 10
dispatched: 0
applied: 1
shipped: 0
run_id: shift-prefill
siblings: 2
rescan_when: held row shift-prefill-c reports that a resident model returns the digit rows at a prefilled position, which reopens row 1; or a fleet seam reads a closed set from token probabilities; or the tree at github.com/vivekkalyanarangan30/how-jev-works checks in a run's output; or 8 weeks elapse (2027-01-01)
---

# Prefill-only decision models, mined under /shift, 2026-11-06

Plan `plan-20261106-150931`, cluster `prefill-decision-model-mechanics`, one voice. A second-hand
course that rebuilds someone else's closed system, plus its teaching tree
(`how-jev-works` @ `8403611d5f6c5c2f25ce0e3da6de6535bc95fd47`, 24 files, 1,669 lines, depth 1,
never executed, **no licence file**, so no code is copied here and design is in our own words).
Phase 7.7: gate=skipped (unattended shift); nothing was asked. The voice is single, so the cluster
carries no convergence of its own. Expected yield was catches on the model half and at most one
technique: it came back as one boundary rule and no technique.

## The fold, re-tested

The miner proposed one new technique, `scored-continuations-over-closed-answers`, at 3/0/2, folded
from rows 1 to 6. **The fold did launder.** Scored whole, it clears exactly. Scored per rule, one rule
clears and the head does not:

- The convergence +1 belongs to row 2 alone. The earlier measured artifact is about first tokens and
  says nothing about scoring allowed answers as a replacement for decoding. Carried on the fold, it
  lifted seven other rules, including the miner's own reasoned rules.
- RISK 0 skipped three charges. The home is contested and +1 is owed even after choosing, as
  `2026-10-05-decision-model-fixed-line-calibration` row 1 charged itself. The subject's opening defines
  the number over probabilities "already returned" and "what it just said", and the structured-output
  subject owns closed-set token trees. The source contradicts itself on the row's central claim, see
  below. And the draft's "not every self-hosted path provides it" is correct and makes
  `scorer-cost-class`'s "A self-hosted deployment always has them" false in the same subject, so the
  miner's "no existing sentence goes false" does not hold.
- The accept never reads the fleet's own result. `2026-09-20-jev-batch-practitioner` read a distribution
  at the score position of this same gate on 18 images: argmax agreement 18/18, separation 0.675 against
  0.700 for the stated integer, errors ranked at 0.542. Recorded `not-better`. The report cites that note
  for one logprob token and stops. A read at a position has been tried on the only seam and bought
  nothing, and that is a prior the head must face.

## Triage

Upper-layer rows ran under Phase 5, G/R/C. Currency and leads ran under the corroboration table.

| # | Candidate | Anchor | Shape, rule | Read | G/R/C | Decision |
|---|---|---|---|---|---|---|
| 1 | Score the allowed answers, do not read the generated one (miner 3/0/2) | [00:42:27]; `1_vanilla_decoding.py:74-77`; `extras/score_dont_generate.py:46-50`; `3_pure_decoding.py:49-50` | technique, Phase 5 | partial | 2/4/2 | **untriaged**. G 2, no convergence. R: home +1, self-contradiction +1, rewrite +2. Without the rewrite charge it is still 2-2 |
| 2 | Two answers sharing a first token tie | [00:44:37]; `common.py:84-88,233-240`; `extras/first_token_collisions.py` | amendment, Phase 5 | real gap | 2/0/1 | **accept**, new decision rule in `scorer-cost-class`. Boundary 1, convergence +1 |
| 3 | The spelling of an answer leaks into its probability; the mirror test | `extras/score_depends_on_wording.py:5-7,43-53` | amendment, Phase 5 | partial | 1/1/1 | **untriaged**. The mirror's reading is wrong, see Arithmetic |
| 4 | Pointwise scoring cannot move a ratio | `extras/pointwise_vs_listwise.py:44-47`; `README.md:114-116` | amendment, Phase 5 | partial | 1/1/1 | **untriaged**. Exact only on one path; the exit inference does not follow |
| 5 | A restricted softmax discards the mass it does not read | miner's, from `3_pure_decoding.py:50` | amendment, Phase 5 | thin | 1/2/1 | **untriaged**. True arithmetic, 0.97 on 3.5e-4 of mass; no measurement that it predicts error |
| 6 | Questions in one pass must not see each other | [00:49:53]; `common.py:281-291` | amendment, Phase 5 | partial | 1/3/1 | **untriaged**, `reconsider?` against [[2026-09-18-jevai-system-one]] row 4, still no fleet seam co-asks. The tree's other path breaks it: `common.py:69-70` writes every question's description into the shared prompt |
| 7 | Encoder or decoder | [01:23:17]; `README.md:84-91` | technique, Phase 5 | thin | 2/3/2 | **untriaged**. Discriminators below |
| 8 | A generated verdict conditions each field on earlier ones | `1_vanilla_decoding.py:76` | technique, Phase 5 | partial | 2/2/2 | **untriaged**, held row `shift-prefill-b` |
| 9 | Calibration needs a fit set with mistakes | `extras/calibration_and_ece.py:71-73` | correction, Phase 5 | partial | 1/0/1 | **untriaged** |
| 10 | Rate an ordered answer with a rank-aware rule | [01:20:10]; `extras/rlcd_training.py:68` | amendment, Phase 5 | partial | 1/0/1 | **untriaged**. No fleet seam reads an ordinal distribution |
| 11 | "Works right out the bat" | [01:06:54] | catch | likely catch | n/a | already covered: `probability-calibration-is-not-agreement`, opened |
| 12 | Train a head, and whether the RL matters | [01:11:11]; `extras/rlcd_training.py:132-135` | lead, table | thin | table | **lead**. Return: a fleet seam with thousands of labelled outcomes; the largest fixture has 88 |
| 13 | Bidirectional state, causal questions, valid cache | `extras/hybrid_encoding.py:3-18` | lead, table | thin | table | **lead**. Return: a released model with this mask, or a trained comparison |
| 14 | Read the state once, question-blind | [00:24:13]; `README.md:87-89` | catch | likely catch | n/a | already covered: `paged-block-cache` |
| 15 | Three answer shapes and the confidence formula | [00:03:28]; `README.md:103-111` | catch | likely catch | n/a | already covered: `stated-distribution-over-closed-labels`. The fetched essay names the vendor's adapter as the formula's source |
| 16 | The hosted architecture is still unpublished | [00:41:59]; `README.md:110` | currency, table | real | table | **currency, no reset** |
| 17 | The vendor rescans come due 2026-11-13 and 2026-11-15 | frontmatter of both | currency, table | real | table | **currency, not fired early**, see Promotion read |
| 18 | The open small decision model, named | card, fetched | lead, table | real | table | **lead, half fired**. Return: a fine-tuned arm with labels |
| 19 | The two larger open models from [[2026-10-05-decision-model-fixed-line-calibration]] | not in this source | lead, table | thin | table | **lead, unchanged** |
| 20 | Question first on the encoder; sigmoid for multi-label | [00:22:54], [01:24:28] | technique, Phase 5 | thin | - | **untriaged**, not opened |

Admission: auto=1/10/0, fp=1 (the miner's accept died at the promotion read). No vetoes. No
escalations, and the scope rewrite below stays a proposal.

**Why row 2 is not contested.** The trap is also stated in `vision-model-grading-schema`, in another
bundle, as one case on one scale. That file owns grading a vision output; no subject there owns the
general read, so the general form has one claimant. No cross-bundle link; the other file is described
in prose. Row 2 also scores 2/0/1 on evidence I opened: the tree's refusal, the earlier measured
artifact, the resident model's vocabulary and the replay.

**Tree against tree.** `README.md:114` says "this repo scores each option independently". True of
`decide` (`common.py:198`), whose prompt holds descriptions only. False of `pack` (`common.py:223-227`),
which files 2 and 3 use, where every option is written into the prefix. So no path has both properties
the draft asks for: `decide` keeps ratios fixed and shows each question its siblings, and `pack` isolates
questions and lets options interact. Any later landing has to say which path it means.

## Arithmetic

Exact pointwise invariance was checked in scratch, with a stand-in deterministic scorer and no model and
no tree code run. Log-odds under softmax are `(s_i - s_j)/T`, and a third row does not enter.

| Case | Result |
|---|---|
| Fixed prompt and fixed read position, T = 1 and 0.7 | shift 0 and -1.7e-16, confirmed. Exact as arithmetic |
| The tree's printed "-0.0000" | Reads raw scores before the softmax (`pointwise_vs_listwise.py:33`), so it tests nothing about softmax. It tests only that a larger batch returns the same logits, which is a numeric claim and was not run |
| Shared-prefix strip (`common.py:81-84`) with a third option | **Not invariant.** `FRAUD`, `FRAUD_REVIEW` reads after the prefix `FRAUD`; adding `CLEAR` empties the prefix, the read moves, and the pair now collides. The miner's rule 1 repair breaks its rule 4 |
| Options in the prefix (`common.py:223-227`) | **Not invariant**, by construction |
| The exit label | A stand-in exit share runs 0.005 to 0.858 with the state while the other ratio holds at 1.5. Invariance fixes the ratio and says nothing about the exit's own score, which is state-conditioned. The draft's "takes mass by how likely its spelling is" and its "decorative exit" do not follow, and no run measures them |
| Same row read twice | Exact tie, difference 0. The draft's "or something near one" is wrong for a one-position read |
| Sum against mean | Same pair, opposite winners (-1 and -1.53, then -1 and -0.38). Confirmed |
| Mirror test | `top - score` holds exactly under any index prior symmetric about the midpoint: a prior of 0, 4, 0 puts 0.99 on the middle and the gap reads 0. And both arms use the same wording, so the gap reads index prior and order, not "the wording still speaking". It finds one kind of bias and certifies nothing |

The prose figures 0.948, 0.975, 0.97/1.46/1.98 and 7e-5 remain unverified, and none is carried.

## Promotion read

| Claim | Result |
|---|---|
| Hosted log-odds +0.38 to +0.11 over ten blocks | Fetched. Mean change -0.28, every block down, range -0.02 to -0.46. **The report omits that the second distractor's interval included zero**, and the author says a set-dependent temperature could explain it. Not "an irrelevant option moves it" in general |
| Sibling-secret visibility | Fetched: 0.00 with the secret in a sibling, 0.90-0.92 in the state, five repeats. The author says it does not reveal the mask. On a hosted model, not on a fleet seam |
| The 09-18 rescan condition "may already have fired" | **No.** The card's 0.727 is a third-party accuracy, not a vendor calibration against labels |
| Card: 0.362, 0.318, 0.461, 0.766, 0.735, ECE 0.466 to 0.081, Apache 2.0, 421M | Confirmed through a summarising fetch. Label leakage is stated for the card's binary type on an encoder, which is thinner than the draft's use of it |
| "Small for a short answer after a long prefill, the usual shape of a vision grader"; prediction under 10% | **Not supported.** The gate's reply is not short, about 82 tokens at p50 by character count. Recorded arena: fastest row 775 ms for about 44 tokens, so at most 17.6 ms per token, against p50 3,206 ms. That bound permits up to 47% at p50, and the miner's own 30% falsifier is not excluded. A bound, not a measure: the arena stored wall time only |
| "The 88-image arena" as the fixture for both held rows | **60 of 88 images are not on this machine**: `generated/` is ignored and empty, and a search of the projects folder found none. 28 committed fixtures remain, 13 good and 15 bad. Rows narrowed to those |
| Arm B "same prompt, one token" | Loses DEFECTS and VERDICT, which `input-gate.ts:106-107` turns into the job's refusal reasons. The miner did not declare that floor |

## Does the local daemon expose logits at a prefilled position?

Checked read-only. **Not settled, and the row's lack is named.** Nothing was loaded (`/api/ps` empty before and after).

- Daemon 0.40.6, one model on it: `qwen3.8:27b` (qwen35, Q4_K_M, llamacpp runner). `gemma4:12b`, the model that returned a full sequence in the 09-20 probe, is no longer listed.
- API page, fetched: `logprobs`, `top_logprobs` (top N only, no maximum stated, no way to name a token), `raw`, `num_predict`. It does not mention prefill. So a restricted read over named rows is reachable only when every allowed row falls inside the top N.
- `/api/show`: capabilities completion, vision, tools, thinking, and no logprob flag. Template `{{ .Prompt }}`. Vocabulary 248,320 tokens with **0 multi-digit tokens**, so `10` is `1` then `0` here.
- On record from 09-20, on an earlier state of the daemon: this model returned one logprob token for a 33-token answer. Which token is unknown. If it is the first, a one-token prefilled read might work on it anyway.

## Phase 7.5

`scorer-cost-class` amendment, pof, mode `experiment`, verdict `unmeasurable`. Chosen to falsify: the
rule has no reach here if the resident vocabulary holds `10` or the seam's good inputs rarely score it.
Neither: 0 multi-digit tokens, and 14 of 19 good inputs score `10`. A replay over the recorded arena
replies at temperature 0, where the emitted first digit is that position's argmax by definition. Target:
good inputs refused, 14 against 0. Floor: bad admitted, 7 against 7. **It is not `better`,** because no
seam makes this read: pof parses the whole integer and has no logprob anywhere. The replay sizes a hazard
nobody ships. Instrument that would make it measurable: `shift-prefill-c`, then a seam. No application
document, because nothing was applied. The seam entry for pof's own `.ai/applied.jsonl` is a proposal; no
project was changed.

## Held rows

All on `qwen3.8:27b`, on disk, on the 28 committed fixtures, with no operator step. Rows a and b need no
logits. Benchmarks, so no pick is owed.

- `shift-prefill-a`: decode share, read from the reply's own `eval_duration` and `prompt_eval_duration`. Resolves the "when it pays" claim.
- `shift-prefill-b`: score position in the reply's field order. Promotes or retires row 8.
- `shift-prefill-c`: the capability probe. Decides whether row 1 can ever run here.

**Not banked:** an open decision model arm. Laya is not on disk, and a fair arm needs a fine-tune, labels
and a training job. Anything needing the other 60 images. Rows 3, 4 and 5 as proofs: they depend on `c`.

## Encoder and decoder discriminators (row 7), unmeasured

Compute `q x P_E x (S + Q)` against `P_D x (S + qQ)`, so break-even near `q = P_D / P_E` when `Q` is much
smaller than `S` (`README.md:84-86`), which gives about 10 questions per state against a 4B decoder and 64
against 27B. The encoder reads the state with the question visible; the decoder must read it question-blind
to cache it. Multi-token options: encoder immune to collision by a marker in front, not immune to wording.
Context is a checkpoint fact (512 to 8,192 on the card, 32k on the tree's default), not an architecture rule.
The video's per-parameter claim [01:24:53] is contradicted by the tree, "Untested here" (`README.md:90-91`).
Zero-shot gap between its two files is instruction tuning, per the tree. The discriminator is questions per
state, and no fleet project hosts either.

## Leads and currency

- **Row 18.** The model is Laya, `convaiinnovations/laya`, Apache 2.0 on the card's field, 421M. Answers the
  name half of the [[2026-10-05-decision-model-fixed-line-calibration]] lead. Zero-shot 0.362 on its own
  benchmark sits below majority class 0.461, so an arm C needs a fine-tune. Fine-tuned 0.766 sits above a stated
  teacher ceiling of 0.735, which needs explaining before anyone quotes it. Also: 512 tokens at the root
  checkpoint and about 808 MB, per the miner. Not on disk.
- **Row 19.** This source predates and does not name them. Return unchanged. The same holds for the K18 models.
- **Row 17.** [[2026-09-18-jevai-system-one]] and [[2026-09-20-jev-batch-practitioner]] come due within 9 days, with no vendor page read today.
- **Row 16.** The tree's `README.md:49` heads the decoder "what Jev does" while `:110` says unpublished. "5,000 questions" is the video's alone.

## Proposals

- **Scope rewrite, `scorer-cost-class`.** "A self-hosted deployment always has them" is contradicted by the 09-20 probe. Proposed: "A self-hosted deployment can, and whether it does is per resident model". Rewrite test fails (+2), so it waits. `shift-prefill-c` re-checks it on today's daemon.
- **pof seam.** Nothing to change; the whole-integer parse is correct. If the gate ever reads a distribution, the 0-10 scale has to move first and the line is void.
- **Fixture.** pof's input-gate arena cannot be re-run here: 60 of 88 images are missing. For the owner.
- **Gate comment.** The arena record holds 89 files against a truth list of 88; one was removed after recording. Counts above use the list.

## Could not verify

Everything numeric in the tree's prose. What the emitted one-logprob token is. Prefill on the chat route.
`top_logprobs` maximum. The replay assumes the fitted line, and replies recorded on 2026-09-22. All three fetches (the API page, the card, the essay) came through a summarising reader. The 10-05 video's checkpoint is still inferred from its title.
