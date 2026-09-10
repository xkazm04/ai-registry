---
subject: production-trace-scoring
domain: llm-observability
last_touched: 2026-09-10
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

## Measured disproof - LANDED in cycle N1-a ([[2026-08-23-7]]): threshold form written into the technique; mod-N demoted with the measured reason

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

## 2026-08-28 - /harvest batch 1 + A/B evaluation

`error-analysis-first-taxonomy` landed as a new technique (trace-driven evals
practitioner corpus: saturation rule, guaranteed random review slice,
principal-expert critique-to-few-shot). A/B probe (standing up scoring for a
consuming project's unscored apex chat surface) returned **impact-positive**,
blind 10-8; decisive checks were failure-modes-first-with-stopping-criterion
and the unknown-unknowns random slice - exactly the landed content.
Evaluation ledger: [[../../harvest/evaluations.md]].

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/production-trace-scoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:2e088430e7257c73",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two workers select the same unscored trace before either posts a verdict; both pay.",
    "A span arrives while the judge runs; a receipt stamped on POST certifies bytes the judge never saw.",
    "A client searches unkeyed hashes for IDs outside the sampled interval."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/production-trace-scoring",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "production-trace-scoring.md": {
      "disposition": "reverify",
      "reason": "Settling, sampling and provenance are useful, but explicit completion markers can exist. A server anti-join is not a claim and cannot prevent concurrent paid calls. Identical input does not imply identical stochastic verdict; rubric or judge changes can justify new evaluation. Receipts must describe the read snapshot, not write-time state."
    },
    "techniques/drift-classified-rescoring.md": {
      "disposition": "reverify",
      "reason": "Root digest and count do not prove whole-trace equality. Growth can change a context-sensitive judgment; changed rubric or judge may also justify spending. Missing receipts mean unknown coverage, not affirmative coverage; retaining old verdicts without automatic paid backfill is a separate policy."
    },
    "techniques/error-analysis-first-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Expert inspection and open coding are useful, but one reviewer and saturation do not establish rare-error coverage. Preserve a held-out evaluation set rather than training the prompt and reporting performance on the same critiques. Multiple annotators, proactive risk categories and continued monitoring can be appropriate."
    },
    "techniques/errors-always-oversampling.md": {
      "disposition": "reverify",
      "reason": "Oversampling errors changes inclusion probabilities; raw pooled scores are not population estimates. Direction of bias depends on score semantics. Record selection-time status, overrides and caps; randomize bounded strata with known inclusion probability. Relative sampling does not replace an evaluation budget."
    },
    "techniques/settle-window-completion.md": {
      "disposition": "reverify",
      "reason": "Quiet time approximates completion only under stated ingestion assumptions. Use server-observed activity, consistent read snapshots and trusted completion markers where available. Maximum age can admit partial traces explicitly; it cannot prove completion. Continuous traces require bounded retention and incomplete-coverage reporting."
    },
    "techniques/stable-hash-sampling.md": {
      "disposition": "clarify",
      "reason": "Repaired adversarial IDs, invalid rate handling and stable sampling versus absolute budget. Domain/version and inclusion policy must be recorded, with monotone threshold admission for a fixed hash domain."
    },
    "techniques/unscored-work-queue.md": {
      "disposition": "clarify",
      "reason": "Repaired selection mistaken for pre-spend atomic claim and exactly-once payment. Durable claims, attempts and reconciliation are required across concurrency and ambiguous crashes; complete client anti-joins can be correct but inefficient."
    },
    "techniques/verdict-coverage-receipt.md": {
      "disposition": "clarify",
      "reason": "Repaired write-time receipt TOCTOU and root digest overstating full coverage. Bind receipt to the actual immutable judge packet and distinguish observed total from included content and unknown legacy coverage."
    },
    "applications/node--stable-hash-sampling.md": {
      "disposition": "reverify",
      "reason": "Historical Langfuse harness and deployment observations retained, not rerun. Domain changes redraw cohorts; mutable sample rate without history loses inclusion probabilities. The displayed percent rounding makes rates below half a percent select zero residues. Paired query sampling needs the identical join identity, not independent draws."
    },
    "applications/rust--drift-classified-rescoring.md": {
      "disposition": "reverify",
      "reason": "Historical Rust receipt and drift implementation retained, not rerun. Server POST-time stamping does not prove what was read before judging. Root identity plus text is not exactly text equality, FNV is not collision proof, truncation can affect judgment, and receipt-less verdicts have unknown coverage. Same prompt does not guarantee same verdict."
    },
    "applications/rust--unscored-work-queue.md": {
      "disposition": "reverify",
      "reason": "Historical Rust queue implementation retained, not rerun. Complete server anti-join fixes the top-1000 horizon but does not establish atomic claims, crash recovery or concurrent idempotency before paid calls. Rubric label alone may omit judge/rubric revision and target snapshot."
    }
  }
}
```
