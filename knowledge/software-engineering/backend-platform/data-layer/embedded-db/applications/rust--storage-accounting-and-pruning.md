---
layer: application
type: application
subject: embedded-db
technique: storage-accounting-and-pruning
stack: rust
verified_on: 2026-10-31
verified_against: rust@1.96
---

# Storage accounting and pruning in the system commands

`src-tauri/src/commands/infrastructure/system/storage.rs` implements the
technique's pruner ceremony almost clause for clause — its 133 lines are a
compact reference for the safety rails — while the accounting half is
present only in miniature.

## The ceremony, implemented

- **Dry-run by default:** `let dry_run = dry_run.unwrap_or(true);`
  (`storage.rs:380`) — invoking `prune_storage` with no arguments deletes
  nothing and returns the preview counts. Deletion requires the explicit
  `dry_run = false`.
- **Age floor:** `MIN_PRUNE_AGE_HOURS = 24` (`:31`), enforced with
  `.max(MIN_PRUNE_AGE_HOURS)` (`:383`) so a caller asking for a *smaller*
  window is silently clamped up to the floor — the floor is a floor, not a
  default.
- **Terminal-state allowlist:** `TERMINAL_STATES` (`:35`) with the
  technique's exact rationale in the comment: *"Deliberately an allow-list
  (never `NOT IN ('running', …)`) so an unknown/active state is never
  deleted."* The fail-safe direction for new vocabulary entries, stated at
  the constant.
- The predicate also requires `completed_at IS NOT NULL` (`:330`) — a row
  claiming a terminal status without a completion timestamp is excluded,
  belt-and-suspenders against a state/timestamp mismatch.

The module doc traces the design to an operational lesson imported from
another system (`:1-8`) — the contract arrived here as learned ceremony,
which is how destructive-operation rails should propagate.

## Where it stops short of the technique

1. **Accounting is not per-table.** `StorageReport` (`:32-39`) carries one
   file size and counts for one table (`persona_executions`). The
   technique's unit of actionability — per-table rows/bytes/share, across
   *every* store — does not exist; `personas_data.db` and the backups
   directory are outside the report entirely.
2. **Count-then-delete race.** `pruned_executions` is a `COUNT(*)`
   (`:116-123`) taken before a separate `DELETE` (`:125-130`); rows
   crossing the cutoff between the two statements make the reported number
   wrong in either direction. The count and the delete are not one
   transaction, so the result is an estimate presented as a tally —
   count-carries-predicate violated by a whisker.
3. **No referential closure.** The `DELETE` touches `persona_executions`
   only; dependent rows (traces, tool usage, events keyed by execution id)
   are left to foreign-key cascade *if* declared, and the command neither
   verifies nor documents that closure.
4. **No prune ledger and no reclamation.** Results return to the caller
   but are not recorded, and nothing releases freed pages afterwards — the
   file never shrinks, so the user-visible promise ("prune frees space")
   is not yet closed end to end. The reclamation step's natural home
   already exists: the quiet-window maintenance loop in
   `src-tauri/db/src/lib.rs:288-350`.

Net: the destructive half — where a bug is unrecoverable — has every rail
the technique demands; the observational half — where a gap merely delays
insight — is thin. That is the right order to build them in, and the
remaining work is measurement, not ceremony.

Re-checked 2026-10-31 at personas@22260d77c9: the module has grown from 133 to
548 lines (tests included) and three of the four gaps above have moved; the
line anchors in that list name constructs that no longer exist.

- **Gaps 2 and 3 are closed.** `prune_executions` (`storage.rs:324-367`) runs
  the per-table counts, the `DELETE` and the counts again inside one
  `BEGIN IMMEDIATE` transaction, tallies casualties per table by row-count
  diff (which sees the FK cascade and the FTS trigger), and decides only the
  final verb: `ROLLBACK` for a dry run, `COMMIT` for the act. Preview and
  receipt now come from the same enforcement path, so the count-then-delete
  race and the unverified referential closure are both gone.
- **Gap 4 is half closed.** `reclaim_storage` (`:247-281`) gives free pages
  back through the same dry-run-by-default contract over `db::reclaim`, and a
  committed prune merges the FTS index (`:347-354`). Reclamation is an
  explicit operator act, not a step of the quiet-window loop, and there is
  still no prune ledger.
- **Gap 1 is narrowed, not closed.** `StorageReport` (`:41-65`) now carries
  free pages, the WAL, `backups/` and `logs/` beside the file size. It is
  still not per-table, and `personas_data.db` is still outside it.

The verdict's order still holds, but its second half is now too harsh: the
observational half has the count-carries-predicate rail it lacked.
