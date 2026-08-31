---
subject: entity-lifecycle
domain: software-engineering
last_touched: 2026-08-31
dry_streak: 0
---

# entity-lifecycle

First touch: 2026-08-29, /deepen architecture batch. Was single-stack (rust) and never
swept; now 6→7 techniques, 2→5 applications (node--orphan-reconciliation from
systedo-case — first second stack; rust--orphan-reconciliation negative specimen from
personas; node--archive-restore-semantics from kp; both prior rust applications
re-verified — every line citation had drifted — verified_against rust@1.80).

Landed: **orphan-reconciliation** (lane-convergent) — reaper registry with three
derivations, durable orphan ledger written at the delete door, dependent-side sweep;
scheduled-for-deletion as a third axis, not a use of archive; sharing-the-predicate-is-
not-sharing-the-effect (preview through the enforcement path; fleet measured 3.29×
off); cascade measurement in time and locks with the referencing-column index rule
(fleet: 26,016ms→1,066ms with the index).

Survived: delete-is-permanent-by-contract (strengthened — field practice, regulatory
reads, ghost-vector recovery), archived-at-over-status-enum, declarations-beat-
programmatic-cleanup, restore-never-recreates-under-new-id.

Proposals routed: storage-level erasure vs API-level deletion → data-retention;
feature-retirement homelessness → dead-code (the reference resolves, is not answered);
the delete-drain ceremony shared_with → job-coordination.

Banked: ownership transfer as a technique (return: a fleet tree implements owner
reassignment — the kp org/member layer is the likely site); deletion grace-period
ladder (return: any consumer builds a trash); DB-enforced archive predicates (return:
a fleet specimen).

Forecast: one more productive pass (state machines, ownership transfer), then drying.

### 2026-08-31 - `/intake`, arriving from an agent-memory source

Gained no techniques. `archive-restore-semantics` gained one section, "The flag's two
populations: who writes it, who honors it", and two law citations
(`one-validation-door`, `absent-guard-is-loud`). Source: [[2026-08-31-future-agi]] -
mined for its agent memory system, which is where the deletion defect surfaced.

The finding is that a same-row existence flag is a convention, and two populations have
to be enumerated separately because they fail in opposite directions. The writers: the
flag is applied by overriding the single-entity delete, and the set-level delete does
not route through that override - so in the source the agent's own delete tool
hard-deletes while the human API's delete soft-deletes, one verb with two meanings split
by whether the caller held an instance or a query. The readers: a full unique index
counts flagged rows, so an archived entity keeps holding its key, and in the source a
human-deleted key becomes permanently unwritable by the agent.

The home was contested and the argument is worth keeping. The golden path already names
this consequence - "uniqueness constraints ... behave as if the data were gone when it
isn't" - but frames it as a hazard of *softening delete into hidden*. The sharper
reading is that it is a required decision of **archiving**, which this subject
recommends: "Restore into a world that changed" is written for a name that "may have
been claimed", which can only happen if archiving released the key. Whether it does was
never decided anywhere in the subject. The amendment states the fork and picks the
released-key branch, on the grounds that its failure mode is the one the technique was
already written to handle.

**Unapplied, and the fleet sweep is the reason.** No managed project carries the seam in
either half: one keeps deletions in a separate tombstone table and writes explicit SQL
with no per-entity override to bypass; another already uses partial unique indexes. Two
independently built trees, neither of which discussed this, both landed on the branch
the amendment recommends - corroboration for the default, and exactly why there was
nothing to test. Recorded `unmeasurable` with the instrument that would measure it
named, rather than simulated with invented cases.
