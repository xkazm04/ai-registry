---
source: youtube:ICtPrhMBUKA
kind: video
url: https://www.youtube.com/watch?v=ICtPrhMBUKA
title: A small trained decision model against a hosted one on 1,000 support chats (product names mangled by the caption track)
author: The AI Automators
words: 2906
extracted: 13
accepted: 1
declined: 0
leads: 2
already_covered: 7
untriaged: 3
currency: 1
dispatched: 0
applied: 1
shipped: 1
run_id: intake-1005-ictp
siblings: 1
fetches: 1
---

# The calibration that tripled errors, and the gate that forgot whose line it was

**Class:** first-party practitioner account. The author trained a ~400M-parameter
open decision model on their own GPU, ran it against a hosted decision model on
1,000 held-out chats, and fitted a temperature on a separate split. n=1, one
dataset. A community upsell sits at roughly 00:10:41-00:11:00 and is not a
candidate. **Expected yield, stated before the table:** this is the **sixth
pass** over the hosted typed-decision model
([[2026-09-18-jevai-system-one]], [[2026-09-20-jev-system-1-agentic-loop]],
[[2026-09-20-jev-batch-practitioner]], [[2026-09-20-jev-rag-reranking]],
[[2026-09-29-decision-model-use-cases]]). The interface, the cost ladder and the
threshold discipline are all owned by `generator-uncertainty-scoring`, so the
model half was predicted to be catches. The new material was the open trainable
model and the author's own calibration experiment, and that half was predicted
to yield at most one technique.

**Siblings:** 1 live on the board at Phase 1 (`intake-1005-bkdr`, another video,
phase 0, holding no subjects). No contention on any file touched.

**Declared focus (from [[2026-10-05-posthog-multiplayer-ai-lessons]]): build arm
A's first fixture from the source's own named examples, not from the stripped
claim.** Applied, and it decided the run. The source names its dataset (a public
action-based support-conversation set with 30 actions), its baseline (a
word-feature classifier) and its comparison method (errors at one 0.9 line,
before and after a temperature). The probe rebuilt all three. A paraphrased
fixture ("calibration makes confidence honest") would have tested the half the
corpus already states. The source's own method was the half that was wrong, and
it was wrong in a direction the paraphrase hides.

## The finding

The source credits recalibration with taking errors from 97 to 36 per thousand
"even though we haven't actually tweaked the gate" `[00:12:48]`, and in the
same breath reports escalations rising from 160 to 326 `[00:13:13]`. Those are
two different gates: one admits 840 cases, the other 674. It then ranks the two
models at that one line (39 wrong of 718 admitted against 36 of 674)
`[00:13:39]`. **The source located something true and explained it wrongly**:
the gate's trade between mistakes and human work is real, and it says so well
(`[00:13:39]` "where you put this gate very much is a business decision"). But
the error drop it credits to calibration is a drop in coverage.

The corpus held the rule in the wrong bundle. `agent-memory/baseline-ladder`
states "compare two arms at matched coverage" for abstention, from the
selective-prediction literature. `generator-uncertainty-scoring`, which owns
every threshold on a confidence score, had no notion of coverage at all
(grep: zero hits for coverage, abstention or matched in its six files).
Cross-bundle links are forbidden, so the rule is restated on this side.

## The probe (declared before running)

Fixture: the source's own dataset, fetched (fetch 1 of 3). 30 actions, label
set identical to the source's (`search-pricing`, `validate-purchase`,
`search-boots` all present). Scorer: the source's own named baseline, a
word-feature classifier with a full 30-way distribution. Four
conversation-disjoint splits as the source describes: train, select, fit the
temperature, report (1,004 report cases, one action per conversation). Three
seeds.

- **Target:** the error change credited to recalibration. Arm A = the source's
  method (errors at one nominal line). Arm B = matched coverage.
- **Prediction:** arm B's difference under a tenth of arm A's.
- **Falsifier:** arm B reaches half of arm A.
- **Floor:** argmax identical in both arms (asserted in the script).

**Result.** Floor held: every argmax identical. Test accuracy was 0.85-0.87.
Over 12 seed-by-threshold points, arm A attributed **124** errors of change to
recalibration, and arm B found **19**. Arm B was smaller at every point. The
largest single gap was 7 of 17, at seed 1, line 0.7. **The prediction missed
(15% against <10%) and the falsifier did not fire.** The temperature came out
1.10 (seed 0), 0.78 (seed 1) and 0.89 (seed 2). Seed 1, whose fit cut expected
calibration error the most (0.111 -> 0.049), reads under the source's method as
recalibration **tripling** errors at 0.9 (8 -> 24). The sign at a fixed line
follows the temperature, not the improvement. AURC moved at most 1.4%, and
97-99% of sampled case pairs kept their order.

The source's own classifier scored 77.3%. This run's scored 85-87% on a
different split and featurization, so the two are not comparable and no claim
is made about the source's number.

## Triage (v2.5 score; upper-layer rows only)

Expected yield said out loud above. Rows 2-13 ran under the corroboration table
or resolved to catches before scoring.

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | G/R/C | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Compare gates at matched coverage | `generator-uncertainty-scoring` (no coverage concept); `agent-memory/baseline-ladder` (same rule, other bundle) | new-technique | real gap | 3/1/2 | **accept** - G: new technique 2, +1 convergence (baseline-ladder from selective prediction; pof arena 2026-09-22 found per-grader lines independently). R: 0 after the probe, +1 contested home (judge-calibration-and-drift owns graders' trust bars; chosen against its stated scope, which is agreement and drift, not operating points) |
| 2 | K | technique | S | Fit the temperature on its own split, apart from checkpoint selection | `stated-distribution-over-closed-labels` rule 6 | none | likely catch | - | already covered; folded into the new technique as rule 6 |
| 3 | K | technique | M | Run a no-model word baseline before comparing a specialist and a generalist | `eval-harness/unaided-baseline-screening` (a different screen) | new-technique | partial | 2/2/2 | **untriaged** - promoting question (does any subject own "a non-model baseline anchors every model comparison"?) answered no on one read, but the claim rests on the source alone |
| 4 | K | correction | S | A lean-state generalist against a trained specialist compares states | `cross-provider-benchmark-operations/handicap-disclosure-in-the-result-row` | none | likely catch | - | already covered - a weakened input to one arm is a handicap, and the source corrected itself (rich state: 87.4 vs 86.1) |
| 5 | K | technique | S | A whole-percent probability API quantizes the gate | `stated-distribution-over-closed-labels` rule 5 (saturation) | none | partial | - | folded into row 1 as rule 5 (coarse scales reach only some coverages), measured on the pof integer scale |
| 6 | K | technique | S | The operating point is a trade between mistakes and review load | `hitl-approval/review-queues` | none | partial | - | folded into row 1 as rule 3 |
| 7 | K | technique | S | Accuracy, confidence and calibration are three different numbers | `probability-calibration-is-not-agreement` | none | catch | - | already covered |
| 8 | K | technique | S | Bin by stated confidence and compare to the hit rate | `probability-calibration-is-not-agreement` | none | catch | - | already covered (ECE/MCE) |
| 9 | K | technique | S | A decision check costs under 100 ms beside a generation | `scorer-cost-class` | none | catch | - | already covered |
| 10 | K | technique | S | Train a specialist where one decision recurs over stable choices with labelled history | `model-routing` | none | catch | - | already covered ([[2026-09-18-jevai-system-one]] row 6) |
| 11 | K | technique | S | Fine-tuning can regress between passes; keep the best checkpoint on validation | none | none | thin | - | **untriaged** - no subject owns model training, no fleet project trains a model; generic |
| 12 | X | currency | S | An open ~400M decision model trains in minutes on one consumer GPU and runs offline | lead 8 of [[2026-09-18-jevai-system-one]] | resets-clock | - | table | **lead** - see Leads |
| 13 | K | technique | S | Richer state lifts a model you cannot train (67.3 -> 87.4 at ~7,000 tokens per request) | `prompt-assembly` | none | catch | - | already covered as a dated fact; untriaged as a cost row (accuracy per token never compared against the local specialist) |

`auto=1/1/0`, `fp=0`. Row 3 is the rejected row (2/2/2: GAIN 2 minus RISK 2 is
0). No escalations: no direction, taxonomy change, law or XL.

Altitude: row 1 lands at **technique**, carrying two dated measurements. It is
one convergence short of doctrine: two bundles now hold the rule, and a third
run reaching it from a different source would make it a law candidate for
`llm-observability/_laws.md`.

## Apply (Phase 7.5) - pof, `code`, `better`

**Seam chosen to falsify.** The pof image-to-3D input gate reads a 0-10 grader
score against a line, refits the line per grader for one model, and falls back
to a default fitted on a different grader for every other. Its 2026-09-22 arena
committed raw answers from three graders. **What a CAUGHT outcome would teach:**
if the shared line and the per-grader lines rank the graders identically
*and* by similar margins, then rule 2 costs nothing at a real seam, and the
technique would have to say that matched coverage matters only when scorers'
scales diverge. **What it returned:** the ranking held (9B best both ways), but
the margin did not. Seven fewer bad inputs at the shared line became one at
matched operating points, and each shared-line count was two to three times the
grader's own. **Half-confirmed: the technique's "exaggerates more often than it
inverts" sentence came from this seam.**

**Structural fact:** the gate card carried `model` and `thresholdsFrom`, and
`summarizeInputGate` dropped both from the outcome the generate route reports.
So 178 of 267 recorded answers were read on a borrowed line, invisibly.

**Shipped:** pof `f6f1286a` (master, not pushed). The outcome keeps both fields,
and the note names the line. Paired replay over 267 recorded answers: named
0/267 -> 267/267, borrowed lines disclosed 0 -> 178/178. Floor: verdict
267/267, refusal 267/267. Suites 32/32, tsc clean on touched files (16
pre-existing errors, all in untracked sibling WIP). **The project's own
experiment ledger was read first**: the 2026-09-22 row set "pass set >= 20
before another row moves". The truth set holds 19, so the 12B row (line 8:
15/69, 0/19, nothing on the line) is **not** shipped and is the return
condition.

## Currency

- `image-to-3d-input-gating/applications/node--single-subject-plain-background.md`:
  six of eight anchors had moved since the 2026-09-22 per-grader commit (about
  45 lines added). The union shape it enumerated was made false by this run's
  own commit. All eight were re-resolved and `verified_on` moved to 2026-10-05.
- **Dispatch, not done here:** `process--score-defect-verdict-protocol.md`
  (`input-gate.ts:67` is now `:50`, `:141` is now `:207`) and
  `node--scene-partition-is-the-gated-unit.md` in the same subject cite moved
  lines. *Return:* the next `/librarian` sweep of `image-to-3d-input-gating`,
  re-resolving every anchor in both.

## Leads

- **An open small decision model exists and trains locally.** The source fine-tuned
  a ~420M open-weights decision model on 5,900 chats in under four minutes of GPU
  time `[00:08:34]`. This reopens lead 8 of [[2026-09-18-jevai-system-one]]
  ("the hosted model's calibration on our own cases - return: an API key") by
  a second road that needs no key. The caption track mangles the name. *Return:*
  the model's name and license confirmed from a vendor page, then the
  closed-label experiments of 2026-09-18 re-run with it as arm C.
- **Two gates' curves from one arena.** The 12B separates bad from good nearly as
  well as the 27B (0.984 vs 0.988), yet at its own line it admits 12 against
  7, because two good inputs share score 9 with bad ones. Rank quality and
  operating-point quality disagree on an integer scale. *Return:* when a grader
  that exposes token probabilities is wired into the gate, so a continuous score
  can be compared with the stated integer at matched coverage.

## Untriaged (nobody verified these)

| Candidate | Anchor | Why it stopped here |
| --- | --- | --- |
| A no-model word baseline anchors every specialist-vs-generalist comparison | `[00:08:08]`-`[00:08:34]`, `[00:14:05]` | 2/2/2: rests on the source alone; no subject owns "baseline below the models" outside eval scenario screening |
| Fine-tuning can go backwards between passes; keep the best checkpoint on validation | `[00:05:09]` | no training subject, no fleet trainer; generic |
| Accuracy per request token: a 7,000-token rich state against a local specialist | `[00:09:51]` | the source never priced the trade it set up; would need both arms' cost |

## Catches

Rows 2, 4, 7, 8, 9, 10 and the dated-fact half of 13. The corpus said each
better. Rows 5 and 6 were folded into the landing as rules.

## Files

- New: `knowledge/llm-observability/quality-scoring/generator-uncertainty-scoring/techniques/compare-gates-at-matched-coverage.md`
- New: `knowledge/llm-observability/quality-scoring/generator-uncertainty-scoring/applications/node--compare-gates-at-matched-coverage--pof.md`
- Edited: the subject's golden path (frontmatter list, one paragraph, techniques list)
- Edited: `knowledge/game-production/asset-production/sourcing-economics/image-to-3d-input-gating/applications/node--single-subject-plain-background.md` (currency)

Scratch (`<scratchpad>/intake-1005-ictp`: transcript, the 37 MB dataset, the probe
script, three result files) deleted at Phase 9 by run id.
