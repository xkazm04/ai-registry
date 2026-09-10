---
domain: grant-funding
subject: grant-matching
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# grant-matching

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/grant-matching",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:cf92be6e6c66f936",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 5 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "With all other components equal, ten keyword hits still outrank three under any strictly increasing saturation transform.",
    "The same concept written in three spelling variants earns more than one variant unless deduplicated before counting.",
    "An injected response containing valid JSON and score 100 passes a schema check.",
    "A mandatory geographic restriction cannot be overridden by strong mission fit."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/matching-and-intelligence/grant-matching",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://www.microsoft.com/en-us/msrc/blog/2025/07/how-microsoft-defends-against-indirect-prompt-injection-attacks",
      "scope": "Primary description calls spotlighting probabilistic; no local attack benchmark or provider execution."
    }
  ],
  "documents": {
    "grant-matching.md": {
      "disposition": "reverify",
      "reason": "Capacity heuristics are not formal pass/fail facts; geography can be a mandatory gate. Unknowns must remain unresolved. Saturation does not reverse raw hit order; deterministic functions are not zero-cost or infallible, and parseable injected output can affect more than one score."
    },
    "techniques/diminishing-returns-keyword-overlap.md": {
      "disposition": "clarify",
      "reason": "Repaired concept deduplication before scoring and monotone-transform limitations; missing text differs from measured no overlap. Formula arithmetic is correct but cannot by itself demote broad announcements."
    },
    "techniques/explainable-match-reasons.md": {
      "disposition": "reverify",
      "reason": "Faithful attribution does not establish true fit. Unsupported positive defaults need explanation, while negative or missing evidence can be useful to users. Reason count is not strength, and claims about all post-hoc explanations require evidence."
    },
    "techniques/injection-safe-rfp-analysis.md": {
      "disposition": "clarify",
      "reason": "Repaired mitigation versus guarantee, valid-schema malicious output, tool authority limits, truncation completeness and grounded output checks."
    },
    "techniques/llm-plus-deterministic-two-lane.md": {
      "disposition": "reverify",
      "reason": "Model superiority and fallback availability are not guaranteed. Provider spend cannot necessarily be reclaimed; structured ingest can be stale versus authoritative call prose. Cache requires rule/model versions and time expiry. Model-assisted extraction is possible with verified gate evidence."
    },
    "techniques/verdict-thresholds.md": {
      "disposition": "clarify",
      "reason": "Repaired authoritative conditions versus heuristics, unresolved eligibility, invalid scores and arbitrary band limits. Geography can hard-block, revenue-relative fit need not."
    },
    "techniques/weighted-component-scoring.md": {
      "disposition": "reverify",
      "reason": "Missing-value defaults encode policy rather than neutral truth. Preserve native currency plus dated conversion rather than replacing it. A sum may tie and need tie-breaking; component weights and regional preferences require evaluation, and clamping can conceal a broken component."
    },
    "applications/node--weighted-component-scoring.md": {
      "disposition": "clarify",
      "reason": "Removed private checkout root, retaining historical implementation and verified_on. Displayed scoring still needs consumer verification: substring geography, variant-inflated overlap, fixed revenue range, and half-credit unknown amounts can misrank."
    },
    "applications/process--injection-safe-rfp-analysis.md": {
      "disposition": "clarify",
      "reason": "Removed private checkout root; historical prompt/date not refreshed. Newline stripping cannot stop single-line instructions, valid JSON can carry manipulated scores, source text can omit key requirements, and cache expiry/spend recovery claims need consumer evidence."
    }
  }
}
```
