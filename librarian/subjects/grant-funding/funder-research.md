---
domain: grant-funding
subject: funder-research
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# funder-research

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-research",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:66c330e07954de75",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A real funder page times out: verification is unavailable, not evidence that the programme is fictional.",
    "A retry finds the exact approved row already persisted: zero changed rows can still mean successful idempotent promotion.",
    "An invitation-only call is usable by an applicant holding an invitation."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/funding-landscape/funder-research",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "funder-research.md": {
      "disposition": "reverify",
      "reason": "Pipeline is useful but scraper failures can return wrong rows and models can return empty results. Invitation-only is actionable for invited applicants; local currency may differ from award currency. Unknown verification must not mean refuted, and human review is not the only possible precision measurement."
    },
    "techniques/adversarial-verification-pass.md": {
      "disposition": "clarify",
      "reason": "Repaired inconclusive versus contradicted evidence, per-claim verification, fresh source scope and bounded operational failures. Independent sessions do not guarantee independent errors."
    },
    "techniques/coverage-gap-driven-planning.md": {
      "disposition": "reverify",
      "reason": "Lowest count is a heuristic, not guaranteed highest marginal value: demand, seasonal supply and verification costs differ. Staging is not live coverage, duplicate populations inflate counts, and research time is not last successful source confirmation. Zero baseline suppresses persistent-zero anomalies."
    },
    "techniques/discovery-with-omit-if-unsure.md": {
      "disposition": "reverify",
      "reason": "Instructions do not prove a lower fabrication rate or make empty output operationally successful. Repeated cap hits can mean abundant real supply. Preserve original titles and actual award currency rather than assuming jurisdiction language/currency; omissions and unavailable discovery need distinct outcomes."
    },
    "techniques/human-review-before-promotion.md": {
      "disposition": "clarify",
      "reason": "Repaired revision-bound approvals, existing-equal writes, atomic retry semantics and material enrichment changes. Delaying a day can lose a deadline; batching speedup and all-rejections-as-ground-truth are unmeasured."
    },
    "techniques/provenance-and-confidence-per-row.md": {
      "disposition": "reverify",
      "reason": "A deterministic completeness score is triage, not calibrated truth. More claims do not imply stronger evidence; duplicate runs may share sources. Field-level provenance is needed when amounts and deadlines differ in support, and prose is not inherently more authoritative than a score."
    },
    "techniques/schema-validation-at-boundary.md": {
      "disposition": "reverify",
      "reason": "Malformed JSON is an execution/parse failure, not a successful empty search. Locale punctuation coercion and permissive dates can alter values; HTTP scheme alone does not make a safe retrieval target. Deadline as identity duplicates amended calls; accent folding may collide. Schema validation does not remove later validation at new boundaries."
    },
    "applications/node--coverage-gap-driven-planning.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date not rerun. Counting staged candidates as serving coverage conflicts with the live-only claim; deduplication and rejected states need inspection. Comparing two runs misses persistent zero and seasonality. Deterministic quality scores do not establish accuracy."
    },
    "applications/process--discovery-with-omit-if-unsure.md": {
      "disposition": "reverify",
      "reason": "Historical prompt and date retained. Default false conflates absence of confirmation with refutation; source snippets and per-field evidence are not demonstrated. Separate CLI context is a useful control, not statistical independence, and locale currency can be incorrect for international awards."
    }
  }
}
```
