---
domain: game-production
subject: content-drift-and-revision
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# content-drift-and-revision

## Architecture review - 2026-09-10

Read and assessed all 11 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/content-drift-and-revision",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:53f7dd8bc1b57ea2",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "Two disjoint rows can still contend for one editor instance.",
    "An expired worker can resume after a new owner has acquired an unfenced lease.",
    "Exactly the retention cap of revisions can mean no pruning has ever occurred.",
    "Hydrating an existing identity from an older snapshot can overwrite a dirty local edit."
  ],
  "sources": [
    {
      "url": "https://www.sqlite.org/lang_transaction.html",
      "scope": "Official transaction semantics distinguish atomic writes from admission locks; no consumer transaction boundary was inspected."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc8785",
      "scope": "Canonicalization requires a defined serialization contract; this does not choose the application content projection or certify a noncryptographic digest."
    },
    {
      "url": "https://github.com/CleverRaven/Cataclysm-DDA/blob/master/doc/JSON/JSON_INHERITANCE.md",
      "scope": "Current inheritance documentation describes supported operators and abstract definitions; historical adoption and local consumer behavior were not rerun."
    }
  ],
  "documents": {
    "content-drift-and-revision.md": {
      "disposition": "reverify",
      "reason": "Reverify content projection, deterministic regeneration and batch atomicity claims. Resource ownership, record conflicts and atomic publication are distinct contracts."
    },
    "techniques/add-only-hydration.md": {
      "disposition": "reverify",
      "reason": "Reverify same-identity conflict handling, dirty edits and deletion evidence. Use revision checks and authoritative scoped snapshots or tombstones; wall-clock order is not causal order."
    },
    "techniques/batch-lease-on-a-non-reentrant-resource.md": {
      "disposition": "clarify",
      "reason": "Rewrote resource versus record locking, admission versus atomic publication, fencing, process scope, bounded drain and safe recovery."
    },
    "techniques/bounded-revision-history.md": {
      "disposition": "reverify",
      "reason": "Reverify atomic archive/replace/prune and actual truncation evidence. Preserve provenance, migrate restored content and recompute current verdicts; reaching the cap alone proves no deletion."
    },
    "techniques/content-hash-vs-status-drift.md": {
      "disposition": "reverify",
      "reason": "Reverify digest equivalence and projection claims. Content can drift while status also changes; include relevant dependency bytes and avoid treating checksums as collision-proof identity."
    },
    "techniques/orphaned-artifact-visibility.md": {
      "disposition": "reverify",
      "reason": "Reverify complete scoped inventory before declaring an orphan and coordinate rekeying with references, collisions and verdict invalidation. Visibility alone does not improve a coverage denominator."
    },
    "techniques/produce-direction-stamping.md": {
      "disposition": "reverify",
      "reason": "Reverify empty versus absent direction against the neighboring catalog contract. Exclude direction from content identity only when evaluation does not depend on intent; operator input cannot override mandatory rules."
    },
    "techniques/typed-operator-inheritance.md": {
      "disposition": "reverify",
      "reason": "Reverify operator order, supported types, cycles, missing parents and numeric bounds. Abstract definitions can skip instantiation requirements while still requiring valid structure."
    },
    "applications/node--batch-lease-on-a-non-reentrant-resource.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed batch-lease-on-a-non-reentrant-resource contract. Rewrote resource versus record locking, admission versus atomic publication, fencing, process scope, bounded drain and safe recovery."
    },
    "applications/node--content-hash-vs-status-drift.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed content-hash-vs-status-drift contract. Reverify digest equivalence and projection claims. Content can drift while status also changes; include relevant dependency bytes and avoid treating checksums as collision-proof identity."
    },
    "applications/sql--bounded-revision-history.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed bounded-revision-history contract. Reverify atomic archive/replace/prune and actual truncation evidence. Preserve provenance, migrate restored content and recompute current verdicts; reaching the cap alone proves no deletion."
    }
  }
}
```
