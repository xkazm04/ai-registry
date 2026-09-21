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

## 2026-09-10 — architecture re-review after the compression revert

I retract the `documents` map of the earlier 2026-09-10 record. It dispositioned a
compressed rewrite that has since been reverted, so its "Repaired ..." reasons refer
to text that is not on disk, and its blanket `reverify` rested on restating each
technique's own boundary section as a defect. Two of its leads survive on my own
reading and appear below with different reasoning.

All eleven documents read in full. This is the most coherent subject in the group:
the three questions it opens with — is this trace finished, is it worth paying to
judge, have I already paid — are each owned by a named technique, and the pairings
between them (settle window with receipt, receipt with drift classification, sample
gate with idempotency gate) are argued rather than asserted. The spend asymmetry in
`drift-classified-rescoring` — staleness is a disclosure problem, re-scoring is a
spend decision — is the sharpest idea in the bundle and I would not touch a word of
it. Dominant disposition `keep`.

Three findings.

**`error-analysis-first-taxonomy` describes an evaluation leak.** Its Graduation
section says the expert's written critiques are "recycled into the judge contract as
worked examples" *and* that "the labeled traces become the first stratified golden
set; the judge is calibrated against it". Those are the same traces. A judge given a
trace's critique as a few-shot example and then scored for agreement on that trace's
label is being measured on its supervision, and the agreement number that results is
inflated by construction. The technique already knows this shape of error — it is why
it insists on a guaranteed random slice against the samplers' blind spots — so the
omission reads as an oversight rather than a position. A held-out split between the
critiques that teach and the labels that calibrate is the missing sentence.

**The golden path still words the sampling mechanism in the form the corpus
disproved.** `stable-hash-sampling` was amended in cycle N1-a to make the
threshold-on-`[0,1)` form the mechanism and demote hash-mod-N to a variant, on
measured evidence that mod-N does not nest (the same 100k ids: `s(0.05)` inside
`s(0.10)` inside `s(0.50)` under thresholds; mod-20 not inside mod-3). The golden
path still says membership is "a stable hash of its id falling in the 1-in-N bucket",
which is the bucket/residue framing the amendment demoted. Small, but it is the
golden path's only statement of the mechanism, and the whole point of the amendment
was that the wording chooses the property.

**The Langfuse application's characterization of the technique is now false.** It
opens its sharpening with "The technique writes the mechanism as 'hash mod N equals
zero'" — present tense, and no longer true, because that application's own finding is
what changed it. The record is otherwise excellent and should keep every observation
it makes; it needs the tense fixed and a line saying the amendment landed, or a
future reader will conclude the corpus never absorbed its own disproof.

Beyond those: `verdict-coverage-receipt`'s requirement that the receipt record the
*true* span count even when the read was clipped, and that a clipped read be
provenance rather than a drift signal, is exactly the interlock with
`span-cap-truncation-signal` in the sibling subject, and both ends state it. The
`errors-always-oversampling` cost arithmetic checks out (at 1% errors, full error
coverage costs about what doubling a 1-in-100 sample costs).

Unresolved: no third-party tree was cloned and nothing was executed. The Langfuse
harnesses (the committed expectation value `0.6881281372814657`, the n=100k nesting
proof, the quantization replay at 20M rows) and the LightTrack tests are retained as
historical records at their pins; whether the >=20M read-sample path is reached on a
live deployment was already recorded as unverified there and still is. FNV-1a's
adequacy as the receipt fingerprint is a spend question rather than a security one in
this design, and I did not test collision behavior.

<!-- architecture-review:v1 -->
```json
{
  "subject": "llm-observability/production-trace-scoring",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:42c8e8ea9199995d",
  "disposition": "clarify",
  "coverage": "All 11 owned documents read in full at current bytes, with the sampling mechanism traced across golden path, technique and application to check that the landed disproof propagated. Retracts the earlier 2026-09-10 record's document map, which described reverted content. Not evaluated: langfuse/langfuse and the LightTrack tree were not cloned; no harness, vitest or cargo suite was rerun; no verified_on or refresh_by field was refreshed; judge behavior under any live deployment was not observed.",
  "counterexamples": [
    "A principal expert's critique for trace T is used as a worked example in the judge contract, and trace T is also in the golden set the judge is then calibrated against. The agreement measured on T is agreement with the judge's own supervision.",
    "An operator raises the sampling rate under the mod-N wording the golden path still carries. The residue classes do not nest, the population is redrawn, and verdicts already paid for fall out of the sample.",
    "A rubric judges the whole span tree rather than the root exchange. Grown drift is then changed input, and the none/grown/changed boundaries move - the technique says so in its closing section, but the spend gate keyed on the single word 'changed' does not.",
    "Two scorers select the same unscored page between the store's anti-join and either one's write. Both pay the judge; the uniqueness constraint saves the record and not the money, which the technique concedes and does not close without leases.",
    "A trace never goes quiet. The settle window never admits it, so the maximum-age ceiling judges it mid-life and the receipt records a size that later arrivals will classify as grown - correct handling, but the verdict describes a fraction of a session."
  ],
  "sources": [
    {
      "path": "knowledge/llm-observability/quality-scoring/production-trace-scoring",
      "result": "Every owned document read at current bytes; the mod-N-to-threshold amendment traced across the three documents that state the mechanism. Establishes that the golden path and the node application still carry the pre-amendment wording; establishes nothing about whether the cited external code still reads as described."
    }
  ],
  "documents": {
    "production-trace-scoring.md": {
      "disposition": "clarify",
      "reason": "Words sample membership as 'a stable hash of its id falling in the 1-in-N bucket', the residue framing that this subject's own measured disproof demoted in favour of the threshold form. It is the golden path's only statement of the mechanism, and the amendment exists precisely because the wording decides whether raised rates nest. Everything else - the three questions, the window-receipt pairing, the two operational invariants - is sound."
    },
    "techniques/drift-classified-rescoring.md": {
      "disposition": "keep",
      "reason": "The three states, the spend asymmetry, the one-covering-verdict rule that stops a corrected trace re-scoring forever, and the reading of a rising changed-rate as a settle-window signal rather than a re-scoring problem. The rubric-relative fingerprint scope in the closing section anticipates the obvious objection."
    },
    "techniques/error-analysis-first-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Graduation has the same labeled traces supply both the judge's worked examples and the golden set it is calibrated against. Agreement measured that way is inflated by construction. The technique already reasons carefully about sampler blind spots, so a held-out split between teaching critiques and calibrating labels is the missing rule, not a new posture."
    },
    "techniques/errors-always-oversampling.md": {
      "disposition": "keep",
      "reason": "The bounded-marginal-cost arithmetic holds, the gate ordering (idempotency, then override, then hash bucket) is stated with the failure of the wrong order, and the aggregate-must-confess-the-bias section names the specific artefact - an error-rate blip manufacturing a phantom quality drop - rather than gesturing at bias."
    },
    "techniques/settle-window-completion.md": {
      "disposition": "keep",
      "reason": "The maximum-age ceiling closes the never-quiet trace, the 'what settling is not' section forecloses the stored-completion-bit bug, and the shorter-window-plus-receipt preference is argued from verifiability rather than taste."
    },
    "techniques/stable-hash-sampling.md": {
      "disposition": "keep",
      "reason": "Carries the landed amendment correctly: the threshold form is the mechanism, nesting is the property it buys, mod-N is demoted with its failure named. The reproducible-across-releases rule about unspecified default hashers and the per-verdict rate stamp are both right."
    },
    "techniques/unscored-work-queue.md": {
      "disposition": "keep",
      "reason": "The horizon failure is dissected precisely - invisible, triggered by success, wasteful twice - and the technique is explicit that a write constraint protects the record and not the money. It concedes the crash-window race and states the condition under which leases are worth their cost rather than pretending selection is atomic."
    },
    "techniques/verdict-coverage-receipt.md": {
      "disposition": "keep",
      "reason": "Three fields each answering a distinct future question, fingerprint scoped to what the judge read rather than the whole trace, truncation recorded as provenance and explicitly not as drift, and the degradation rules that refuse to claim a change the receipt cannot see. The server-stamps-read-compares split is the correct division."
    },
    "applications/node--stable-hash-sampling.md": {
      "disposition": "clarify",
      "reason": "States in the present tense that 'the technique writes the mechanism as hash mod N equals zero'. That wording was demoted by the amendment this very record's measurement produced, so the sentence now misdescribes the corpus. Every observation it makes - domain separation, the two independent samples, the unstamped rate against a versioned evaluator, the quantize-to-zero read sample - should be kept unchanged. Not rerun; scoped to Langfuse v4.16.0 @ 3c3ca18."
    },
    "applications/rust--drift-classified-rescoring.md": {
      "disposition": "keep",
      "reason": "Every clause of the technique appears as a doc comment adjacent to the code enforcing it, in money terms, with the four-case test named. The observation that writing the price into the comment is what stops a refactor from simplifying grown into a re-score is the transferable part. Not rerun; refresh_by 2026-11-20 left as it stands."
    },
    "applications/rust--unscored-work-queue.md": {
      "disposition": "keep",
      "reason": "A before/after where the before is preserved at the call site as the incident that forced the change, with the horizon, the detonation threshold and the double waste all visible in one quoted comment. The permanent-incapacity termination path completes the unsupervised-loop posture. Not rerun."
    }
  }
}
```
