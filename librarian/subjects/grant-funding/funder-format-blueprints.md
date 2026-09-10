---
domain: grant-funding
subject: funder-format-blueprints
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# funder-format-blueprints

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "grant-funding/funder-format-blueprints",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:ba00c5f24eb00fa8",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 2 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Two programmes on one portal require different forms: source alone cannot choose both correctly.",
    "An unscored mandatory declaration must be submitted even though it earns no rubric points.",
    "One portal answer can support multiple evaluation criteria, and one criterion can span several fields.",
    "A proposed future regulation is not a final application template."
  ],
  "sources": [
    {
      "path": "knowledge/grant-funding/proposal-craft/funder-format-blueprints",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    },
    {
      "url": "https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/horizon/wp-call/2026-2027/wp-15-general-annexes_horizon-2026-2027_en.pdf",
      "scope": "Read introduction and admissibility: separate programmes, topic-specific deviations and forms provided in submission system; not verification of future programme legislation."
    }
  ],
  "documents": {
    "funder-format-blueprints.md": {
      "disposition": "reverify",
      "reason": "Scored criteria and form fields are not universally one-to-one; mandatory unscored annexes are not dead weight. A portal can host multiple programmes and a generic template is not submission-ready by default. Hard page/character limits differ from advisory word bands."
    },
    "techniques/arts-panel-sections.md": {
      "disposition": "reverify",
      "reason": "Useful candidate triad, not a universal panel structure. Reach can be a justified target rather than actual attendance; seat counts do not establish unique people. Claims about panel preferences, highest weights and length need call-specific evidence."
    },
    "techniques/blueprint-routing-rules.md": {
      "disposition": "clarify",
      "reason": "Repaired precedence so exact current call and stage override source/genre heuristics, with provisional routing and explicit migration. Shared keys do not automatically validate different questions."
    },
    "techniques/federal-rubric-sections.md": {
      "disposition": "reverify",
      "reason": "Four dimensions are an optional working outline, not all federal criteria. Points need not dictate proportional words, qualitative evidence can be valid, and local government reviewer culture is not established by the source category."
    },
    "techniques/movement-funder-sections.md": {
      "disposition": "reverify",
      "reason": "Organizing, advocacy and service delivery can coexist; officer backgrounds and scoring reactions are unsupported generalizations. A causal diagram can convey theory of change. Activity permissibility cannot be achieved merely by changing narrative framing."
    },
    "techniques/supranational-award-criteria-sections.md": {
      "disposition": "clarify",
      "reason": "Repaired conditional three-criterion scope, form-to-rubric mapping, call/stage thresholds and limits. Verifiable objectives need not always have numerical targets; future programme continuity is not guaranteed."
    },
    "techniques/trust-and-lottery-sections.md": {
      "disposition": "reverify",
      "reason": "Trusts may use formal scoring and professional reviewers. Shorter is not always stronger, core costs can be fundable, and a single indicator may not suffice. Confirm actual question set, limits and safeguarding requirements for the call."
    },
    "applications/process--blueprint-routing-rules.md": {
      "disposition": "reverify",
      "reason": "Historical code/date preserved, not rerun. Source-first resolver cannot distinguish programmes on one portal; repeated band tables may drift and shared keys do not prove critique coverage. Capping 12 requirements at 300 characters can delete obligations or qualifiers; delimiter removal cannot guarantee instruction isolation."
    },
    "applications/process--federal-rubric-sections.md": {
      "disposition": "reverify",
      "reason": "Historical prompt implementation/date retained. Static word bands are not derived from call point allocations, null guidance does not prove all old behavior unchanged, and sharing federal section arrays does not prove municipal form compatibility."
    },
    "applications/process--supranational-award-criteria-sections.md": {
      "disposition": "reverify",
      "reason": "Historical date remains unchanged. Official annex introduction excludes several separate work programmes, allows topic deviations, and requires actual submission forms. Threshold arithmetic is correct within its scope; proposed successor legislation cannot establish unchanged future sections, keys or guidance. Remaining successor assertions not independently verified."
    }
  }
}
```
