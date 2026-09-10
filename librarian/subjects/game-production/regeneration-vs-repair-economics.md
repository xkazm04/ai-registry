---
domain: game-production
subject: regeneration-vs-repair-economics
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# regeneration-vs-repair-economics

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/regeneration-vs-repair-economics",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:a33dc4e375862ffe",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed in table order. 1 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "With generation cost 2, grading cost 1 and independent success probability 0.25, expected cost through success is (2+1)/0.25 = 12, not 2/0.25+1 = 9.",
    "Two repairs can reduce a defect from 100 units to 10 while retaining the same defect code; the repeated code alone does not show no progress.",
    "A defect absent from the remedy map may have an untested repair, and its absence says nothing about permission to ship."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/asset-production/sourcing-economics/regeneration-vs-repair-economics",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "regeneration-vs-repair-economics.md": {
      "disposition": "reverify",
      "reason": "Reverify exactly-three branches, unknown remedy routed to shipment, finite failed rolls promoted to stage impossibility and one paired repair generalized to all inputs. Hold, discard, redesign and bounded investigation are valid outcomes. The cost technique is repaired; related golden-path claims remain."
    },
    "techniques/best-of-n-parameter-sweep.md": {
      "disposition": "reverify",
      "reason": "One-axis sweeps miss interactions; factorial or other designed searches can compare multi-axis changes. Local computation and retained artifacts cost resources. Sanitized labels can collide, and a best candidate still needs required gates. Losers from a parameter sweep are not automatically iid reroll pass-rate samples."
    },
    "techniques/bounded-refine-iteration.md": {
      "disposition": "reverify",
      "reason": "A deterministic generator can refine when its inputs change. Repeated defect codes with improving magnitude do not prove nonconvergence. Preserve best under a comparable basis and distinguish no output from ungraded output; time/cost limits need cancellation or accounting for work that continues externally."
    },
    "techniques/defect-class-to-remedy-map.md": {
      "disposition": "reverify",
      "reason": "A class can have several remedies, so local and reroll sets need not be disjoint. An absent map entry means unknown, not known ineffective. One successful pair is scoped evidence, and plausible bounded trials may establish new entries. Warn-only work can be economically justified; unknown remedy must not authorize shipping a failed artifact."
    },
    "techniques/refuse-the-fix-that-cannot-help.md": {
      "disposition": "reverify",
      "reason": "Input size limits and memory isolation can make a formerly pathological operation safe within a bounded domain; one incident does not prove permanent impossibility. Derived basenames alone do not prevent collisions or symlink escapes. A refusal needs no destructive fallback but can route to an authorized alternative; human presence does not erase resource limits."
    },
    "techniques/reroll-economics-per-credit.md": {
      "disposition": "clarify",
      "reason": "Repaired cost-per-success arithmetic to include repeated grading costs, explicit iid/retry assumptions, finite budgets, uncertainty and separation of unknown remedy from shipment eligibility. Removed unsupported market-price defaults and per-artifact expected-value dismissal."
    },
    "techniques/score-basis-must-be-stated.md": {
      "disposition": "reverify",
      "reason": "Dropping missing components changes the estimand and generally needs explicit renormalization for a partial score. A zero sentinel labeled ungraded can still be accidentally averaged; use null or tagged states. Required missing evidence still blocks acceptance, and a heterogeneous penalty sum does not establish actual defect severity."
    },
    "applications/node--defect-class-to-remedy-map.md": {
      "disposition": "reverify",
      "reason": "Historical four failures do not establish a zero reroll success probability or universal fragmentation. The 52-asset audit and reduction pair remain scoped observations; safe basenames require actual containment/identity checks. Consumer and prices not rerun; remove machine-specific root during reconciliation."
    },
    "applications/process--bounded-refine-iteration.md": {
      "disposition": "reverify",
      "reason": "Historical research summaries are not fresh checks of every paper's stopping rule. The described retry loop lacks input refinement; same primary defect can improve numerically. Optional ungated flags need explicit output states, and existing count caps do not prove in-flight spend cancellation. No consumer or paper measurements refreshed."
    }
  }
}
```
