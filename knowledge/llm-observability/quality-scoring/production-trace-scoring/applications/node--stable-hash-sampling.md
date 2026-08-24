---
layer: application
type: application
subject: production-trace-scoring
technique: stable-hash-sampling
stack: node
status: forged
verified_on: 2026-08-23
source: langfuse/langfuse
---

# Stable-hash sampling in Langfuse's evaluation scheduler

Langfuse **v4.16.0**, `langfuse/langfuse` @ `3c3ca18eed76b164b418776d8d93cc1590e1d65b`
(2026-08-23) — a pnpm/TypeScript monorepo whose `worker/` schedules LLM-as-a-judge
evaluations over live ingested traffic. It carries **two independent hash
samples**: one choosing which traces get judged, one choosing which score rows a
dashboard reads. Only one discloses itself, and that asymmetry is the finding.

## The admission sample: the technique, near-verbatim

`worker/src/features/evaluation/deterministicSampling.ts:6-17` hashes a
domain-separation constant plus the target id with SHA-256, takes the top 53
bits, divides by `2**53` to land in `[0,1)`; `shouldSampleEvaluation` (`:19-29`)
admits iff `samplingValue < samplingRate`. No state read, no randomness drawn — a
pure function of identity. Rate is a `Decimal` column
(`packages/shared/prisma/schema.prisma:1014`, `:1036`).

**Sharpening — a threshold, not a modulus.** The technique writes the mechanism
as "hash mod N equals zero". The `value < rate` form buys what mod-N does not:
samples **nest** as the rate rises, at arbitrary non-divisor rates, so raising a
rate only *adds* traces and never re-draws the population into re-bought
verdicts. The repo asserts it as a named test — "creates nested samples as the
sampling rate increases" (`__tests__/deterministicSampling.test.ts:20-32`). A
second sharpening sits at `:3`: `SAMPLING_DOMAIN =
"langfuse:evaluation-sampling:v1\0"` makes a deliberate re-draw a one-token edit
and an accidental one impossible.

**Deviation — SHA-256, not "a small well-specified non-cryptographic hash".**
The technique says cryptographic strength "buys nothing here"; the tree spends
it, once per event and reused across every config (`evalService.ts:496`). *The
technique is right about the requirement (specified, stable output) and
over-specific about the means* — and this repo's read-side sample uses
cityHash64, so it does not itself hold that crypto strength is needed.

## Rule by rule

- **Key on identity, not content — confirmed; the key is the evaluated *target*,
  not always the trace.** `evalService.ts:492-495` keys on `observationId` else
  `traceId`; `observationEval/scheduleObservationEvals.ts:94` on
  `observation.span_id` — span- and trace-level evaluators sample independently.
- **N ≤ 1 means everything — confirmed** (`deterministicSampling.ts:25`,
  `rate >= 1` → `true`). The mirror branch (`:26`, `rate <= 0` → `false`) is
  unreachable from the write path, which validates `z.number().gt(0).lte(1)`
  (`web/src/features/evals/server/router.ts:98`): defence in depth, not a mode.
- **Sample gate ≠ idempotency gate — confirmed, and the *order differs between
  the two paths of this same tree*.** The trace path dedups first
  (`evalService.ts:734-739`) and samples second (`:741-752`); the observation
  path samples first (`scheduleObservationEvals.ts:129-142`), then upserts a
  deterministic id over `(config, assignment, trace_id, span_id)` as its dedup
  (`:205-236`). *Sharpening: stable membership is what lets the gates commute.*
- **Bypasses are explicit named policies — ABSENT.** Grep over
  `web/src worker/src packages/shared/src` for
  `oversampl|always ?sample|error.?override|forceSample|bypass.*sampl|sampl.*bypass`
  returns two irrelevant hits (a react-query `onError` comment, a test title).
  Failure coverage exists only as an evaluator *filter*, so "all errors plus 5%
  of the rest" needs **two configs** with complementary filters and rates — the
  per-stratum variant, reached by configuration, not by a bypass.

## The rate never reaches the verdict; a different sample discloses itself

An evaluator's score carries metadata from
`packages/shared/src/server/evals/evalExecutionMetadata.ts:24-57`; the key list
(`packages/shared/src/features/evals/evalExecutionMetadata.ts:1-12`) is ten
entries — job execution, job configuration, evaluation rule, assignment,
evaluator, **evaluator version**, three target ids. **No sampling rate.** Grep
for `sampl` across `packages/shared/src/server/repositories/scores.ts`,
`packages/shared/src/server/services/`, `web/src/features/scores` and
`web/src/features/dashboard` returns nothing. The rate is recoverable only via
the config row, and `sampling` is a mutable column with no version history while
`EvaluatorVersion` (`schema.prisma:931-955`) versions prompt, model and params.
*Finding: the tree versions the rubric and not the sampling policy, so old
verdicts are reweightable only by today's rate — the restatement "stamp the rate
per verdict" exists to prevent. The technique holds; the code does not.*

The *read* sample is disclosed in full:
`web/src/features/score-analytics/components/SamplingDetailsHoverCard.tsx:98-102`
renders "`{rate}% (hash-based)`" beside `~`-prefixed estimates (note at
`:117-120`); the tRPC payload carries `samplingMethod`, `samplingRate`,
`actualSampleSize` and the raw `samplingExpression` (`scoreAnalyticsRouter.ts:529-535`).

## The read sample keys on the join key — a use the technique does not name

`web/src/features/score-analytics/server/queryHelpers.ts:61-68` builds
`cityHash64(trace_id, observation_id, session_id, dataset_run_id) % 100 < percent`
— keyed on the **scored target**, not the score row. One expression, built at
`scoreAnalyticsRouter.ts:282-289`, is interpolated into *both* score CTEs of a
comparison (`buildScoreComparisonQuery.ts:412`, `:437`), so a target sampled into
one side is sampled into the other and **matched pairs survive sampling** — which
licenses `buildEstimateQuery.ts:82-92` to scale a 1%-sample join by `*100`. Two
*independent* 1% samples would intersect at ~0.01% and the estimate would be
junk: stability buys join-preservation here, not replay.

**Upstream-reportable: the read sample quantizes to zero.**
`scoreAnalyticsRouter.ts:275-278` computes `rate = min(1, 100000/maxCount)` then
`percent = Math.round(rate * 100)`. Past ~20M rows the rate falls under 0.005,
`percent` rounds to **0**, `% 100 < 0` matches nothing — and the card still
announces "0.4% (hash-based)". Replayed below.

## Executed evidence

`node v24.14.0`, no network. The shallow clone has no `node_modules`, so vitest
could not run; both functions were transliterated byte-for-byte (types stripped)
into two harnesses in `<scratch>/worker-production-trace-scoring/`.

1. `sampling-harness.mjs` reproduces the repo's committed expectation
   `getDeterministicSamplingValue("obs-123") === 0.6881281372814657`
   (`deterministicSampling.test.ts:9`): **MATCH**, identical across two fresh
   processes. Over n=100 000 ids `trace-0..trace-99999`: 4 941 admitted at rate
   0.05 (4.94%), 9 892 at 0.10 (9.89%), 49 786 at 0.50 (49.79%), and
   `s(0.05) ⊂ s(0.10) ⊂ s(0.50)` — **true**. Counterfactual under the technique's
   mod-N wording: mod-20 kept 4 995, mod-3 kept 33 420, and **mod-20 is not a
   subset of mod-3** — nesting lost. Domain lever: `v1`→`v2` at 0.05 admitted
   4 904, overlapping v1's 4 941 in 226 ids (~250 if independent) — a full redraw.
2. `read-sample-harness.mjs` replays `scoreAnalyticsRouter.ts:269-289`: maxCount
   20 000 000 → percent **1**; 20 000 001 → percent **0**, predicate `% 100 < 0`,
   **0 of 100 residues kept**, hover text "0.5% (hash-based)".

Not verified: whether the ≥20M path is reached on a live deployment; either
sample's runtime behaviour (no BullMQ/ClickHouse available).
