---
domain: grant-funding
subject: proposal-quality-review
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# proposal-quality-review

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/proposal-quality-review",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:f9e854788bb50952",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "A 601-word answer violates a hard 600-word portal cap even though it fits a widened editorial band.",
    "A revision removes a leading heading but adds an unsupported percentage; nonempty output is not repaired output.",
    "Two reviewers both read requested before either writes in_review; separate checks alone do not prevent double claim.",
    "The displayed regex flags Chapter XX and [Smith, 2024], but misses an explicit placeholder longer than forty characters."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/proposal-craft/proposal-quality-review",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "path": ".bench/e10-probe.mjs",
      "scope": "Local dependency-free reproduction of the two regexes displayed in the application; results true, true, false for Roman XX, legitimate citation and long slot. Not a consumer implementation test."
    }
  ],
  "documents": {
    "proposal-quality-review.md": {
      "disposition": "reverify",
      "reason": "Deterministic checks can be incomplete or heuristic, have compute cost, and depend on policy version and context. Keyword presence does not establish engagement and numerical echo does not establish grounding. Severity depends on stage and actual call constraints; zero critical failures with skipped checks is incomplete. Expert judgment is not infallible and model assistance is not categorically impossible."
    },
    "techniques/critical-vs-quality-severity.md": {
      "disposition": "clarify",
      "reason": "Repaired immutable gate severity contradiction, stage-specific placeholders, binding length caps versus targets, detector uncertainty and incomplete coverage. Green is a scoped check result rather than filing authorization."
    },
    "techniques/expert-review-tier-operation.md": {
      "disposition": "clarify",
      "reason": "Repaired roster versus real capacity, atomic claim/cancel races, revision binding, paid-request recovery and overly absolute refund/earned-fee policy. Review completion does not permanently bar review of a revised draft."
    },
    "techniques/placeholder-and-jargon-detection.md": {
      "disposition": "reverify",
      "reason": "Short Latin label patterns miss long or non-Latin placeholders and flag legitimate bracket citations. Non-letter X guards still flag standalone Roman XX. A slot represents missing data rather than satisfying substantive quantification; supported autofill can propose a resolution for approval. Contextual jargon can be valid."
    },
    "techniques/revise-to-green-single-pass.md": {
      "disposition": "clarify",
      "reason": "Repaired mandatory recheck of revised text, retained-original safety state, no guaranteed repair or majority-conversion claim, grounding and source revision binding. One pass is a budget policy rather than an empirically universal optimum."
    },
    "techniques/rubric-mirrors-prompt-guidance.md": {
      "disposition": "reverify",
      "reason": "Shared requirements should derive from the actual call; agreement between prompt and critic can preserve the same mistake. Independent factual checks are valuable. Keyword presence is not semantic engagement, generic defaults cannot certify unknown sections, and hard caps must never be widened. Human authors are subject to the same binding requirements."
    },
    "techniques/section-word-band-checks.md": {
      "disposition": "reverify",
      "reason": "Word bands are editorial defaults, not universal evidence about reviewer tolerance. A forty-word answer can satisfy a short question; optional empty sections are not necessarily missing. Measure the actual portal unit and counting rules, and never widen hard caps. Logic models have different valid structures and length alone cannot determine development."
    },
    "applications/node--placeholder-and-jargon-detection.md": {
      "disposition": "reverify",
      "reason": "Historical implementation/date retained, not rerun. Local reproduction of displayed regexes confirms Chapter XX and [Smith, 2024] flag while a long explicit fill-in slot does not. Named optional coverage flags do not prove all applicable checks exist or ran. Placeholder errors here reflect submission stage, contradicting fixed-severity doctrine."
    },
    "applications/node--revise-to-green-single-pass.md": {
      "disposition": "reverify",
      "reason": "Historical code/date retained, not rerun. Displayed loop does not establish that replacement was rechecked before return. Whole prompt grounding can include untrusted text and unrelated matching numbers; exempt 0%/100% can be factual fabrications. Numeric presence is not claim entailment, and a nonempty revision may introduce worse failures."
    }
  }
}
```
