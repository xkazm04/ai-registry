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

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. No document in this subject has changed since the
2026-09-10 record; it reads stale because the digest scheme changed. **Retraction:** that
record gave `techniques/batch-lease-on-a-non-reentrant-resource.md` a `clarify` with the
reason "Rewrote resource versus record locking, admission versus atomic publication,
fencing...". That rewrite is not in the text. Commit `7792d1b1a` (2026-09-10) restored the
document from before the compression pass, and the current text has no fencing and still
claims a failed batch leaves "the corpus untouched except for a stated prefix". The
rewrite is still owed; it is recorded below as `clarify`, not as done. New findings: the
golden path says "two dozen" revisions while the technique and its application say
twenty; produce-direction-stamping says store absence for an empty steer, which conflicts
with the sibling subject's rule that an empty steer is a stamped value; and
typed-operator-inheritance states three things more broadly than its source does.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/content-drift-and-revision",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:23e162dc11978fce",
  "disposition": "clarify",
  "coverage": "All 11 current documents read in full; cross-checked against catalog-pipeline-authoring's direction technique. Primary sources opened for fencing, SQLite transactions and the inheritance source. Not evaluated: the consumer tree, its tests, any transaction boundary in it.",
  "counterexamples": [
    "A holder paused past its lease expiry can resume and write after a new holder acquired the lease; nothing in the procedure rejects the stale write.",
    "A lease guarantees one writer, not atomic publication: readers see the finished prefix mixed with the old remainder until the batch ends.",
    "A stamp with an empty direction, a stamp absent because the record predates stamping, and a dropped steer are three states; 'store absence' collapses the first two.",
    "Exactly the retention cap of revisions can mean no pruning has ever occurred (retained from 2026-09-10)."
  ],
  "sources": [
    {
      "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
      "result": "If 'the GC pause lasts longer than the lease expiry period' the client may 'go ahead and make some unsafe change'; a fencing token is 'a number that increases' each acquisition and storage rejects the lower token. Supports adding fencing to the lease procedure."
    },
    {
      "url": "https://www.sqlite.org/lang_transaction.html",
      "result": "'While its read transaction is active, X will continue to see an historic snapshot of the database prior to the changes implemented by Y.' Supports publishing staged results in one transaction when a mixture must not be visible; the page does not use the word atomic."
    },
    {
      "url": "https://raw.githubusercontent.com/CleverRaven/Cataclysm-DDA/master/doc/JSON/JSON_INHERITANCE.md",
      "result": "Confirms relative/proportional/extend/delete and abstract types 'discarded after JSON loading completes'; 'Not all types are supported, and not all are supported in the same way'; chained inheritance 'is especially likely to become unwieldy', with no stated depth limit; extend-by-default with 'override': true is stated for monstergroup only. Does not support 'one or two levels deep', 'standing tax', or merge-by-default as a general rule."
    }
  ],
  "documents": {
    "content-drift-and-revision.md": {
      "disposition": "clarify",
      "reason": "'Two dozen revisions' disagrees with the technique and application (twenty); correct. Still owed: 'lock per job maximises a half-completed sweep' and batch-lease-as-atomicity wording."
    },
    "techniques/add-only-hydration.md": {
      "disposition": "reverify",
      "reason": "Still owed: same-identity conflicts and dirty local edits during reconcile; wall-clock 'strictly newer' is not causal order."
    },
    "techniques/batch-lease-on-a-non-reentrant-resource.md": {
      "disposition": "clarify",
      "reason": "The 2026-09-10 rewrite was reverted (see prose). Add fencing to the hold rule (Kleppmann) and state that a lease is not atomic publication (SQLite snapshot semantics). Still owed: process scope and safe recovery."
    },
    "techniques/bounded-revision-history.md": {
      "disposition": "reverify",
      "reason": "Still owed: the archive, replace and prune need one transaction, and reaching the cap does not prove pruning happened."
    },
    "techniques/content-hash-vs-status-drift.md": {
      "disposition": "reverify",
      "reason": "Still owed: digests are not collision-proof identity, and dependency bytes outside the record can drift unseen."
    },
    "techniques/orphaned-artifact-visibility.md": {
      "disposition": "reverify",
      "reason": "Still owed: a complete scoped inventory before declaring an orphan; re-keying must handle collisions and verdict invalidation."
    },
    "techniques/produce-direction-stamping.md": {
      "disposition": "clarify",
      "reason": "'Store absence, not an empty string' conflicts with catalog-pipeline-authoring's rule that an empty steer is a stamped value distinct from a record that predates the stamp; align to the three states. Still owed: excluding direction from content identity assumes evaluation does not depend on intent."
    },
    "techniques/typed-operator-inheritance.md": {
      "disposition": "clarify",
      "reason": "Source opened: scope merge-by-default to the one type the source states it for, replace 'one or two levels deep' and 'standing tax' with what the source says. Still owed: cycles, missing parents, numeric bounds."
    },
    "applications/node--batch-lease-on-a-non-reentrant-resource.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; its no-expiry deviation is disclosed. Dates preserved."
    },
    "applications/node--content-hash-vs-status-drift.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; the FNV-1a choice is disclosed as non-cryptographic."
    },
    "applications/sql--bounded-revision-history.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun. Undisclosed deviation: revision rows carry status, tier and reason, which the technique counts as bookkeeping not to snapshot; and prune runs 'on the same call path', not stated to be in one transaction."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the four clarify items the record above named, each from a source opened this run
or an inconsistency checked across documents. The golden path's per-job-locking line and
the batch-lease technique's process-scope and recovery items stay owed, as do the
reverify items, so the subject stays `reverify`.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/content-drift-and-revision",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:c2fc9bd41453da92",
  "disposition": "reverify",
  "coverage": "All 11 current documents read in full; cross-checked against catalog-pipeline-authoring's direction technique. Primary sources opened for fencing, SQLite transactions and the inheritance source. Not evaluated: the consumer tree, its tests, any transaction boundary in it. Second record: the applied clarify items were re-read after editing; every other document is byte-unchanged and keeps its disposition.",
  "counterexamples": [
    "A holder paused past its lease expiry can resume and write after a new holder acquired the lease; nothing in the procedure rejects the stale write.",
    "A lease guarantees one writer, not atomic publication: readers see the finished prefix mixed with the old remainder until the batch ends.",
    "A stamp with an empty direction, a stamp absent because the record predates stamping, and a dropped steer are three states; 'store absence' collapses the first two.",
    "Exactly the retention cap of revisions can mean no pruning has ever occurred (retained from 2026-09-10)."
  ],
  "sources": [
    {
      "url": "https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html",
      "result": "If 'the GC pause lasts longer than the lease expiry period' the client may 'go ahead and make some unsafe change'; a fencing token is 'a number that increases' each acquisition and storage rejects the lower token. Supports adding fencing to the lease procedure."
    },
    {
      "url": "https://www.sqlite.org/lang_transaction.html",
      "result": "'While its read transaction is active, X will continue to see an historic snapshot of the database prior to the changes implemented by Y.' Supports publishing staged results in one transaction when a mixture must not be visible; the page does not use the word atomic."
    },
    {
      "url": "https://raw.githubusercontent.com/CleverRaven/Cataclysm-DDA/master/doc/JSON/JSON_INHERITANCE.md",
      "result": "Confirms relative/proportional/extend/delete and abstract types 'discarded after JSON loading completes'; 'Not all types are supported, and not all are supported in the same way'; chained inheritance 'is especially likely to become unwieldy', with no stated depth limit; extend-by-default with 'override': true is stated for monstergroup only. Does not support 'one or two levels deep', 'standing tax', or merge-by-default as a general rule."
    }
  ],
  "documents": {
    "content-drift-and-revision.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"Two dozen revisions\" now reads \"About twenty revisions\", matching the technique and the application. Still owed: the lock-per-job line and batch-as-atomicity wording."
    },
    "techniques/add-only-hydration.md": {
      "disposition": "reverify",
      "reason": "Still owed: same-identity conflicts and dirty local edits during reconcile; wall-clock 'strictly newer' is not causal order."
    },
    "techniques/batch-lease-on-a-non-reentrant-resource.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added that the lease is not atomic publication (stage and publish in one transaction where a mixture must not be visible) and that expiry admits a stale holder, so acquisitions carry an increasing fencing number the write path checks. Still owed: process scope and safe recovery."
    },
    "techniques/bounded-revision-history.md": {
      "disposition": "reverify",
      "reason": "Still owed: the archive, replace and prune need one transaction, and reaching the cap does not prove pruning happened."
    },
    "techniques/content-hash-vs-status-drift.md": {
      "disposition": "reverify",
      "reason": "Still owed: digests are not collision-proof identity, and dependency bytes outside the record can drift unseen."
    },
    "techniques/orphaned-artifact-visibility.md": {
      "disposition": "reverify",
      "reason": "Still owed: a complete scoped inventory before declaring an orphan; re-keying must handle collisions and verdict invalidation."
    },
    "techniques/produce-direction-stamping.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the empty-direction rule now stamps an empty direction and keeps a missing stamp for pre-stamp records, matching the three states in catalog-pipeline-authoring. Still owed: direction excluded from content identity assumes evaluation ignores intent."
    },
    "techniques/typed-operator-inheritance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: \"one or two levels deep\" now quotes the source warning that chained inheritance \"is especially likely to become unwieldy\"; merge-by-default is scoped to what the source does for at least one set-valued type; \"standing tax\" replaced with the source text \"not all are supported in the same way\". Still owed: cycles, missing parents, numeric bounds, the cosmetic string-variant rule."
    },
    "applications/node--batch-lease-on-a-non-reentrant-resource.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; its no-expiry deviation is disclosed. Dates preserved."
    },
    "applications/node--content-hash-vs-status-drift.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun; the FNV-1a choice is disclosed as non-cryptographic."
    },
    "applications/sql--bounded-revision-history.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness not rerun. Undisclosed deviation: revision rows carry status, tier and reason, which the technique counts as bookkeeping not to snapshot; and prune runs 'on the same call path', not stated to be in one transaction."
    }
  }
}
```
