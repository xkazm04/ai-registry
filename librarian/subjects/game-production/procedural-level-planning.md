---
domain: game-production
subject: procedural-level-planning
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# procedural-level-planning

## Architecture review - 2026-09-10

Read and assessed all 14 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/procedural-level-planning",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:0b7277eb6d4bcf22",
  "disposition": "reverify",
  "coverage": "All 14 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Conditional or approximate support is real when its limits are explicit. One paired fixture can remain unchanged because of thresholds; metadata-only changes do not prove semantic consumption. Normalization policy must preserve or explicitly amend intent.",
    "Define the chosen route, required rooms and unique-room versus traversal denominator. Multiple viable paths and cycles need explicit treatment. Padding still counts as optional scope even when its design value is poor.",
    "Shared algorithms can produce identical results legitimately. Declared read sets need control-flow and semantic checks; a single perturbation is insufficient. Original requests can be recovered from reliable immutable evidence."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/balance-validation/procedural-level-planning/procedural-level-planning.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    }
  ],
  "documents": {
    "procedural-level-planning.md": {
      "disposition": "reverify",
      "reason": "Reverify binary parameter support, mandatory output changes for every input perturbation, universal scalar progression rules and deterministic-stream constraints. The gate/key proof is repaired, including a directed permanent-key counterexample."
    },
    "techniques/algorithm-parameter-support-matrix.md": {
      "disposition": "reverify",
      "reason": "Conditional or approximate support is real when its limits are explicit. One paired fixture can remain unchanged because of thresholds; metadata-only changes do not prove semantic consumption. Normalization policy must preserve or explicitly amend intent."
    },
    "techniques/critical-path-to-optional-branch-ratio.md": {
      "disposition": "reverify",
      "reason": "Define the chosen route, required rooms and unique-room versus traversal denominator. Multiple viable paths and cycles need explicit treatment. Padding still counts as optional scope even when its design value is poor."
    },
    "techniques/declare-what-each-engine-ignores.md": {
      "disposition": "reverify",
      "reason": "Shared algorithms can produce identical results legitimately. Declared read sets need control-flow and semantic checks; a single perturbation is insufficient. Original requests can be recovered from reliable immutable evidence."
    },
    "techniques/gate-and-key-solvability-proof.md": {
      "disposition": "clarify",
      "reason": "Repaired stateful directed reachability, reversible-closure assumptions, consumable-key over-approximation, distinct goal/return/softlock properties and bounded-search reporting."
    },
    "techniques/landmark-and-sightline-legibility.md": {
      "disposition": "reverify",
      "reason": "Landmark and visible-option counts are heuristics conditioned on camera, occlusion and player position. Inside-room landmarks and maps can be valid; correlated visual cues are not automatically independent channels."
    },
    "techniques/pacing-linter-rules.md": {
      "disposition": "reverify",
      "reason": "A BFS visitation order is not a traversable pacing arc. Unknown fields require uncertainty rather than confirmed fatigue. Safe-room adjacency must respect direction and gate access; difficulty thresholds need units."
    },
    "techniques/safe-room-and-boss-placement.md": {
      "disposition": "reverify",
      "reason": "Largest and farthest candidates can conflict with arena or access requirements. Rest before a boss needs a legal pre-boss route; save services and after-boss rewards are design choices rather than universal placement defects."
    },
    "techniques/seed-determinism-contract.md": {
      "disposition": "reverify",
      "reason": "Deterministic named random substreams can preserve results across draw-order changes. Version compatibility may be deliberately maintained; a randomly chosen seed is reproducible once recorded with the full relevant configuration."
    },
    "techniques/zone-progression-linting.md": {
      "disposition": "reverify",
      "reason": "All nodes having inbound edges does not imply reachability from a declared start. For fixed bands, next-floor minus previous-floor is at least next-floor minus previous-ceiling, contrary to the stated understatement. Band edges do not establish actual player level."
    },
    "applications/node--declare-what-each-engine-ignores.md": {
      "disposition": "reverify",
      "reason": "The historical paired-input test cannot establish full parameter consumption or impossibility of drift. Integer-seed conversion needs an explicit signed/unsigned contract; remove machine-specific roots from published evidence on reconciliation. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--gate-and-key-solvability-proof.md": {
      "disposition": "reverify",
      "reason": "The displayed graph DFS is not an inventory-state proof. Global permanent-key closure can combine mutually unreachable states; recheck directed traversal and consumption in the consumer. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/node--pacing-linter-rules.md": {
      "disposition": "reverify",
      "reason": "Multi-root BFS can admit disconnected roots and compare nonadjacent rooms as one arc. Directional boss access and numeric zero versus missing difficulty need distinct checks. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--safe-room-and-boss-placement.md": {
      "disposition": "reverify",
      "reason": "The historical prompt asks for deterministic placement but does not enforce execution. RANDOM resolved once and stored can reproduce; float difficulty units need reconciliation with the integer threshold examples. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```
