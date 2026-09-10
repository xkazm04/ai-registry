---
domain: game-production
subject: agent-behaviour-authoring
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# agent-behaviour-authoring

## Architecture review - 2026-09-10

Read all nine documents. Corrected absolute model, knowledge, commitment and
coordination claims and narrowed decision-trace evidence. Both applications remain reverify.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/agent-behaviour-authoring",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:13bbe0728b5d23bc",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Empty trace after collector failure does not prove an agent never ran.",
    "A confirmed claim whose holder dies still needs expiry; arrival confirmation alone cannot reclaim it.",
    "A health drop caused by another agent does not prove the tested action executed.",
    "Two individually sensed facts can have mutually exclusive guards, leaving an intent infeasible.",
    "A read-only perceived-health cache is not a second writable health authority."
  ],
  "sources": [
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---overview",
      "scope": "Official event-driven tree and blackboard observation model; no consumer code or engine runtime checked."
    }
  ],
  "documents": {
    "agent-behaviour-authoring.md": {
      "disposition": "clarify",
      "reason": "Replace exclusive knowledge/model claims with explicit information, execution, coordination and evidence contracts."
    },
    "techniques/behaviour-model-selection.md": {
      "disposition": "clarify",
      "reason": "Qualify complexity thresholds, tree evaluation, target selection and binary-authoring restrictions."
    },
    "techniques/perception-before-decision.md": {
      "disposition": "clarify",
      "reason": "Scope sensing and confidence models; allow declared knowledge sources and distinguish source existence from feasible reachability."
    },
    "techniques/blackboard-as-declared-shared-state.md": {
      "disposition": "clarify",
      "reason": "Define multiwriter reduction, atomic snapshots, perceived caches and reliable event semantics without conflating storage with authority."
    },
    "techniques/commitment-and-recovery-windows.md": {
      "disposition": "clarify",
      "reason": "Separate reconsideration from execution, allow authored tracking/concurrency and define interrupt and clock semantics."
    },
    "techniques/group-coordination-without-a-hive-mind.md": {
      "disposition": "clarify",
      "reason": "Add atomic lease lifecycle, fencing, multi-slot rollback and fairness; scope commander and resource-location claims."
    },
    "techniques/decision-trace-as-evidence.md": {
      "disposition": "clarify",
      "reason": "Reject empty-trace and seed-only proofs; require instrumentation health, causal action correlation and scoped coverage."
    },
    "applications/node--group-coordination-without-a-hive-mind.md": {
      "disposition": "reverify",
      "reason": "Reverify prompt/runtime boundary, lease races and health-change attribution."
    },
    "applications/process--perception-before-decision.md": {
      "disposition": "reverify",
      "reason": "Reverify engine semantics and historical generation limits; distinguish timeout, sensing and reaction controls."
    }
  }
}
```
