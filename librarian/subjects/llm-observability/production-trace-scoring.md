---
subject: production-trace-scoring
domain: llm-observability
last_touched: 2026-08-23
touched_by: external-reconcile
dry_streak: 0
---

# production-trace-scoring

First touch: [[2026-08-23-6]], external reconcile against `langfuse/langfuse`
@ `3c3ca18` (v4.16.0). Gained `node--stable-hash-sampling` (uncovered; the
worker switched from the settle-window hint on evidence, as the contract
allows). Single-stack debt cleared. Executed evidence: transliterated
harnesses reproduced the repo's own committed expectation value; n=100k
nesting proof; quantization replay.

## Measured disproof, cycle-ready

- `stable-hash-sampling` words the mechanism as "hash mod N". Measured on the
  same 100k ids: threshold-on-[0,1) nests (s(0.05) within s(0.10) within
  s(0.50)); mod-N does not (mod-20 not within mod-3), so raising a rate under
  mod-N redraws the population - the exact failure the technique exists to
  prevent. Restate as threshold form, demote mod-N to a variant. Priority for
  the next cycle.

## Open leads (banked, convergence rule applies)

- Salting decision rule: one global domain means every evaluator at the same
  rate judges the SAME traces - breadth vs cross-rubric comparison, choose
  explicitly.
- Join-preservation: hashing the JOIN KEY on both sides makes a sampled join
  estimable at *1/rate, not *1/rate squared - a use the technique never names.
- settle-window-completion on this tree is bindable as refutation-shaped: a
  fixed first-sighting delay is a second legitimate shape (needs the receipt
  more, not less); the span path has delay 0.
- The admission rate never reaches the verdict (policy unversioned while the
  judge is versioned) - the technique's stamp-the-rate rule, violated live.
- Upstream-reportable: integer-percent quantization zeroes the read sample
  past ~20M rows while the UI announces a non-zero rate.

## Cross-subject proposals

- judge-calibration / judge-contract subjects: EvaluatorVersion stamped per
  score is a clean judge-provenance realization; a node application target.
- analytics-store-design: a sampled preflight that picks the query strategy
  and reports ~ estimates - a technique-shaped pattern the bundle lacks.
