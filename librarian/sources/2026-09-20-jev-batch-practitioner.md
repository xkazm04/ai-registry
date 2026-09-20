---
source: jev-batch-practitioner
kind: batch - first-party practitioner account + second-hand explainer + web
url: https://www.youtube.com/watch?v=ymgH8jS6Wb8
urls:
  - https://www.youtube.com/watch?v=ymgH8jS6Wb8
  - https://www.youtube.com/watch?v=ZgXej_9isxY
title: "Twelve use cases tested, an explainer with the API shape, and the architecture question answered from the web"
author: "Nate Herk (AI Automation); Codevolution; web"
words: 4179 + 3477 + 4 web searches
extracted: 14
accepted: 1
declined: 0
leads: 3
already_covered: 6
untriaged: 2
currency: 4
dispatched: 0
applied: 2
shipped: 0
run_id: intake-jevbatch-0920
siblings: 2
rescan_when: the vendor publishes an architecture paper or model card; or a self-hosted grader lands in a fleet tree; or 8 weeks elapse (2026-11-15)
---

# The third and fourth passes over one model, and the question they were asked

This is the **third** time this registry has mined this model in three days
([[2026-09-18-jevai-system-one]] from the vendor's docs and open adapter,
[[2026-09-20-jev-system-1-agentic-loop]] from a review). The operator's question
this time was not "what does this source say" but **"are we missing a
cutting-edge architecture concept that would help a Claude-heavy ecosystem or
local models in media generation"**, so the run was steered at that and the
batch was read for architecture rather than for use cases.

**Batch lane**, two sources deduped by author, plus four web searches. Two
siblings live on the board throughout (`intake-uhelj`, `intake-qw2ns`), the
second holding four media-generation subjects — checked clear against this run's
target immediately before the write.

## The answer to the question that was asked

**No new architecture concept was found, and the reason is worth stating
precisely: there is no published architecture to miss.** The vendor has
published no paper and no model card, and says the design is "close to the chest
for now"; public speculation runs from an encoder-only transformer with
classification heads to a stripped-down text diffusion model. What is disclosed
is a *training objective* (RLCD — reinforcement learning for calibrated
decisions, optimising the confidence number to match observed correctness) and
an *interface* (typed answers over caller-declared label sets, produced in one
parallel pass rather than token by token).

Both of those the corpus already models, and it modelled them before this source
existed. The interface is `stated-distribution-over-closed-labels`, forged
2026-09-18, whose closing paragraph anticipates a purpose-built decision model by
name-free description. The economics are `scorer-cost-class`. The threshold
discipline is `probability-calibration-is-not-agreement`.

**The one claim that would have been new is refuted by the literature.** If RLCD
genuinely trains calibration, the tempting inference is that the caller no longer
has to fit a threshold on their own cases. The transfer literature says
otherwise — fine-tuned models drop sharply cross-domain, and calibration
thresholds tuned on one distribution do not reliably transfer to held-out data,
which is an open problem rather than a solved one. So **calibration remains a
property of a distribution over a task, not a property of a model**, and a
calibration-trained grader still owes the fit on the caller's own cases. That is
what the corpus already says; the contribution of this run is that it is now
corroborated from outside the corpus rather than asserted inside it.

## What was actually new, and where it landed

The landing is in the **media lane**, and it came from the operator's second
question rather than from either video.

A census of the media-generation bundle found **zero references to token
probabilities or distribution-shaped answers** anywhere in it — the only
"confidence" in `generated-output-grading` is OCR bounding-box confidence, which
is a different quantity. Meanwhile `vision-model-grading-schema` declares a
three-item enumeration for a field that keeps producing arguable answers:
*sharpen it into a count, split it into two booleans, or demote it to human
judgement.* All three change the field. A fourth remedy changes the **answer
shape** — keep the field, read its distribution, and use borderline-ness to route
only the ambiguous cells to the second grader the file already recommends for
every cell when stakes rise.

That gap is real, it is an enumeration gap of exactly the kind the method hunts,
and it is where a locally served model matters: a grader you host yourself
already computes the probabilities it samples from, so recording them is free,
while a hosted endpoint usually will not return them and asking the model to
*state* a distribution is a second act of generation. The rule therefore inverts
on deployment, which is the amendment's core.

**Cross-bundle boundary, stated not linked.** The measured evidence that a
distribution-shaped answer pays at a noisy grader lives in `llm-observability`
(AUROC 0.82 on borderline-ness, a 0.2–0.8 band holding 4 of 7 disagreements).
Cross-bundle links are forbidden, so the media amendment states the mechanism in
its own prose and the boundary is recorded in both subject notes.

## The apply step refuted the amendment at the fleet's own seam

pof already grades with a vision model — and with the one the operator asked
about: `src/lib/anim-critique/qwen.ts` runs a measured chain whose members
include a 27B-class VL model, benchmarked at 0.95 combined with 2 false passes
against a flash model's perfect 40/40. The gate thresholds a 0–100 parse at
`passAt`, and the input gate runs `passAt: 7`.

Two findings, both negative, both useful:

- **CORRECTED 2026-09-20.** This note first said no self-hosted serving exists
  in the tree. That was wrong, and it was an instrument failure rather than a
  reading error: `git grep -l` combined with `-n` silently collapses the result
  set (1 hit against 10 for the same query). pof carries a local eye at
  `src/lib/vision/providers/ollama.ts` with `OLLAMA_HOST` and
  `OLLAMA_VISION_MODEL` set, defaulting to the 27B model the question was
  about, resident on this machine. The free branch IS reachable, and a measured
  A/B over it is recorded in `librarian/applied.md` the same day. What survives
  of the original claim is narrower and still true: **no logprob is read
  anywhere in the tree** (0 occurrences, re-checked with a corrected
  instrument).
- **The band would have nothing to rank.** pof's own benchmark records that
  *every* error across every model in both blocks was a false PASS, scoring a
  confident 10/10 on concepts whose arms are buried in drapery or hair. A
  borderline band around 7 cannot rank a saturated 10. This is the corpus's
  characteristic failure — confidently, stably wrong scores high — arriving as a
  measurement rather than as a caution, and it is why the amendment carries the
  saturation rule rather than leaving it implied.

Recorded `not-better` with the seam class named. The amendment stands; the seam
that would confirm it does not exist in this fleet yet, and the return condition
says what would create it.

## Currency

| Fact | Source | Why it matters |
| --- | --- | --- |
| Input context window is **64,000 tokens** | first-party account | Bounds every "analyse the whole codebase in one pass" claim: such a pass is chunked, and the chunking is the caller's problem |
| Reachable via two third-party gateways, not only the waitlist | first-party account | Materially lowers the cost of the prior note's rescan condition ("an API key is available to this fleet") |
| **$0.042 per million input tokens, output free** | explainer | ~47,000 short decisions per dollar; the first published unit price this registry has recorded for the class |
| Usage reports **23 output tokens** on a model advertised as producing none | explainer, live run | **Second sighting.** The prior run's adapter test witnessed 55. Two independent sources now contradict the "no output tokens" framing — the billing claim is true, the architectural claim is not established |

## Already covered

Six, all against subjects forged before these sources: the three primitives and
their caps; one parallel pass; the threshold-in-code rule (both videos
independently reach "pick a threshold and branch in your application", which the
corpus states as decision rule 1); the golden-set evaluation advice ("run Jev,
run Opus, run Sol, see which balances accuracy and cost" is
`cheapest-sufficient-configuration` almost verbatim); "if you can calculate it
exactly in code, do that"; and the none-of-the-above exit.

## Leads

- **A decision-only model cannot act.** The practitioner tried browser use and
  reports it "was unable to actually type things in — it would make decisions and
  then route to a different model that's better with actually controlling the
  browser." This directly contradicts the "System 1 browser agent" proposed in
  [[2026-09-20-jev-system-1-agentic-loop]], from a source that actually ran it.
  *Return:* when a fleet project puts a decision-only tier in front of an
  actuator and measures the handoff.
- **Batching dominates latency, and it is the caller's property not the
  model's.** 1,000 emails across seven rules took 70s sequentially and **6s
  parallelised, at identical cost**. A latency number quoted for this class
  describes a client's concurrency, not a model. *Return:* when a throughput
  claim for a classifier tier is compared across two client implementations.
- **The decision cost is often not the binding cost.** The practitioner's trading
  demo found exchange fees dwarfed the model spend. *Return:* when a fleet cost
  ledger shows a non-token term dominating.

## Untriaged

| Candidate | Anchor | Why it stopped here |
| --- | --- | --- |
| Analysis is recovered from a battery of closed questions rather than requested: "Jev on its own doesn't analyse things for you, but if you're strategic with the way you set up the questions, you can get analysis from it" | v1 `[00:11:24]` | Reads `partial` against `vision-model-grading-schema`'s field-census rule, which is the same move for grading. Needs one read to decide whether the general form (decompose an open analytic question into a fixed battery, read the story off the aggregate distribution) is owned anywhere outside grading |
| Twelve use cases were twelve instances of one use case, and the practitioner says so | v1 `[00:15:41]` | A possible boundary on breadth claims for this model class; no corpus home obvious, and one author's aside is thin ground for one |

## Addendum, same day: the A/B was designed and run, and it refuted the hypothesis

The operator asked whether the gap could be validated rather than argued. It
could, and the answer is **no at this seam** — measured, not inferred.

**Instrument probe before the result.** The local daemon returns per-token
`logprobs` with `top_logprobs`, so the free branch is real. But not on the
configured model: `qwen3.8:27b` returns exactly **one** logprob token for a
33-token answer — text-only and with an image alike — while `gemma4:12b`
returns the full sequence. *Local* does not imply *instrumented*; the resident
model decides, and that is a precondition to check at configuration time rather
than a property of self-hosting.

**Design.** 18 labelled concept images from pof's own `generated/icons/` (10
single-subject creature concepts, 8 maps, wireframes and sheets — labelled by
construction, not by eye), pof's `buildInputGatePrompt` verbatim, one call per
image, both arms read from the **same response**. Arm A is pof's parse of
`SCORE=<int>`; arm B is the distribution over the score token. Zero added calls,
~4s per image.

**Results.**

| Measure | Arm A (stated) | Arm B (distribution) |
| --- | --- | --- |
| argmax agreement (floor) | — | **18/18** |
| good-vs-bad separation (AUROC) | **0.700** | 0.675 |
| borderline-ness ranks A's errors | — | **0.542** |
| saturated cells (pMax ≥ 0.99) | — | 1 of 18 (median 0.705) |

**The pre-declared falsifier did not fire, and the hypothesis failed anyway.**
The prediction was that the distribution would be saturated and have no
resolution. It was not saturated. It simply pointed in an uninformative
direction: borderline-ness ranked the gate's own errors at a coin flip, and the
probability-weighted mean slightly *reduced* separation. Both false passes were
held confidently — a user-interface wireframe, which cannot become a mesh at
all, scored 9 with two thirds of the mass on 9.

That is the characteristic failure the uncertainty subject already names —
confidently wrong scores high — arriving in the vision lane as a measurement.
**Spread is not information**, and the amendment now carries a correlation
admission test instead of a spread test: show that borderline-ness ranks *this*
grader's errors above chance on labelled cells, or the distribution is a
diagnostic to log and not a router.

**Two traps the run paid for.** A 0–10 scale makes the top answer two tokens, so
a distribution read at the score position scores `10` as a `1`; it produced an
apparent eight-point correction that was pure artifact and was caught only by
re-running on a single-token 0–9 scale. And swapping the resident grader failed
**all ten** correct inputs at the unchanged `passAt: 7` — a threshold is fitted
to a grader, and a local substitution is a grader change.

Nothing was shipped to pof; the experiment is read-only against its tree.
