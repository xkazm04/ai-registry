---
domain: game-production
subject: branching-narrative-graph-validation
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# branching-narrative-graph-validation

## Architecture review - 2026-09-10

Read all nine documents. Corrected state analysis, completion and choice
semantics, localization cost and revision scope. Both applications remain reverify.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/branching-narrative-graph-validation",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:486ccc4d1075ec3f",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Two branches may each assign before a join without one individual write dominating the read.",
    "A single nonterminal node with a self-loop can be a closed trap.",
    "Different dialogue choices can meaningfully converge without explicit variable writes.",
    "A forward walk can establish structural ending reachability without a reverse walk.",
    "Shared localized prose is not purchased once per possible path."
  ],
  "sources": [
    {
      "url": "https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md",
      "scope": "Official choice/gather examples support expressive convergence without mandatory explicit variable writes; no local runtime or schema verification."
    }
  ],
  "documents": {
    "branching-narrative-graph-validation.md": {
      "disposition": "clarify",
      "reason": "Define model-relative proofs, meaningful convergence and state-aware completeness."
    },
    "techniques/reachability-and-orphan-detection.md": {
      "disposition": "clarify",
      "reason": "Distinguish structural overapproximation, feasible states and actionable witness types."
    },
    "techniques/state-variable-declaration-contract.md": {
      "disposition": "clarify",
      "reason": "Correct definite-assignment and ownership rules; pin contracts independently of generated candidates."
    },
    "techniques/dead-end-versus-authored-ending.md": {
      "disposition": "clarify",
      "reason": "Include self-loops, legitimate suspension and distinct existential/liveness properties."
    },
    "techniques/false-choice-and-convergence-audit.md": {
      "disposition": "clarify",
      "reason": "Audit observable promises instead of equating no explicit writes with false choice."
    },
    "techniques/node-text-budget-and-localization-surface.md": {
      "disposition": "clarify",
      "reason": "Separate unique localization cost from path counts and use explicit billing and text metrics."
    },
    "techniques/graph-revision-diffing.md": {
      "disposition": "clarify",
      "reason": "Broaden semantic diffs to ordering, embedded text behavior, dependencies and save compatibility."
    },
    "applications/node--reachability-and-orphan-detection.md": {
      "disposition": "reverify",
      "reason": "Reverify historical checker contracts; distinguish ending reachability from completion from all nodes."
    },
    "applications/process--state-variable-declaration-contract.md": {
      "disposition": "reverify",
      "reason": "Reverify generation/validation authority and repair protocol; remove mandatory-write doctrine."
    }
  }
}
```
