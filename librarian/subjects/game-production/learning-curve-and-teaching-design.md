---
domain: game-production
subject: learning-curve-and-teaching-design
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# learning-curve-and-teaching-design

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/learning-curve-and-teaching-design",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b5effb67785ed534",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Scheduled introduction does not establish competence or a universal boredom floor. Prior knowledge, discovery, rest and skill retention vary; alternative paths need path-specific requirements rather than one taught-set estimate.",
    "Four beats per atom, costly tests and ten-minute spacing are design choices, not universal necessities. Require evidence for combination teaching and distinguish optional discovery from missing required instruction.",
    "An atom inventory is useful but normalized labels can collide. Cycles may reflect incorrect prerequisites rather than duplicate atoms; a runtime introduced flag does not establish competence."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/balance-validation/learning-curve-and-teaching-design/learning-curve-and-teaching-design.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    },
    {
      "url": "https://www.itl.nist.gov/div898/handbook/apr/section1/apr131.htm",
      "scope": "Official search evidence for incomplete time-to-event observations. Used to distinguish censored observation from attained events; no player study or new learning-rate measurement."
    }
  ],
  "documents": {
    "learning-curve-and-teaching-design.md": {
      "disposition": "reverify",
      "reason": "Reverify universal learning-as-fun claims, mandatory atom scheduling, scheduled exposure as taught competence and attribution of unused mechanics to teaching. The competence technique is repaired; related golden-path assertions still need reconciliation."
    },
    "techniques/flow-corridor-as-two-sided-envelope.md": {
      "disposition": "reverify",
      "reason": "Scheduled introduction does not establish competence or a universal boredom floor. Prior knowledge, discovery, rest and skill retention vary; alternative paths need path-specific requirements rather than one taught-set estimate."
    },
    "techniques/introduce-practise-test-spacing.md": {
      "disposition": "reverify",
      "reason": "Four beats per atom, costly tests and ten-minute spacing are design choices, not universal necessities. Require evidence for combination teaching and distinguish optional discovery from missing required instruction."
    },
    "techniques/skill-atom-inventory.md": {
      "disposition": "reverify",
      "reason": "An atom inventory is useful but normalized labels can collide. Cycles may reflect incorrect prerequisites rather than duplicate atoms; a runtime introduced flag does not establish competence."
    },
    "techniques/teaching-escalation-ladder.md": {
      "disposition": "reverify",
      "reason": "Teaching modality has no universal cost/reliability ordering. Accessibility, culture and task affect what works; explicit instruction can teach, and prior failed trials of every cheaper rung are not always necessary."
    },
    "techniques/time-to-competence-measurement.md": {
      "disposition": "clarify",
      "reason": "Repaired exposure versus attainment, clock and opportunity basis, repeated-window first hits, follow-up confirmation, incomplete observations and unsupported causal attribution of departures."
    },
    "techniques/unused-mechanic-detection.md": {
      "disposition": "reverify",
      "reason": "Low use is a symptom, not proof of teaching failure. Missing opportunities and incentives are alternative causes; static scheduling and simulation policies cannot establish what a human learned or rejected."
    },
    "applications/node--unused-mechanic-detection.md": {
      "disposition": "reverify",
      "reason": "The historical simulation average below 0.1 uses per fight is not an opportunity-conditioned human learning measure. Resource eligibility and simulated decision policy need inspection before routing the finding to teaching. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--skill-atom-inventory.md": {
      "disposition": "reverify",
      "reason": "The historical skip condition Introduced OR player_level >= 5 uses exposure and level as competence proxies. Derived atom tokens can collide; declarations about input restoration require runtime evidence. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
