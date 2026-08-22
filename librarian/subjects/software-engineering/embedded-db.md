---
subject: embedded-db
domain: software-engineering
last_touched: 2026-08-22
dry_streak: 0
---

# embedded-db

First touch: [[2026-08-22-2]], external reconcile against `sqlite/sqlite`
@ `45f4f1c` (3.54.0). Gained `c--journal-and-durability-modes` — second stack;
single-stack debt cleared. `c` declared as a bundle extra stack for this.

## Open leads (banked, convergence rule applies)

- **The contract's two halves have opposite persistence** — journal mode is in
  the file header, sync level per-connection; boot assertion is two acts at two
  frequencies. SECOND SIGHTING of "persist the verdict" (with golang-migrate's
  dirty flag, same wave).
- Environment-derived defaults must never override a signed clause
  (`setDefaultSyncFlag` gated on `bSyncSet==0`).
- "Checkpoint returned OK" and "checkpoint completed" are different facts —
  verify maintenance by measured journal size, not return code.
- Sidecars can outlive every connection — delete/reset clause should be an
  invariant, not advice.

## Cross-subject proposals (for owning subjects)

- Per-connection contract re-assertion belongs in the POOL BUILDER →
  connection-pooling.
- SQLite's commit-time auto-checkpoint as the canonical counter-example →
  quiet-window-maintenance (also grades the existing rust application's
  unconditional TRUNCATE against the PASSIVE→TRUNCATE spectrum).
- `VACUUM INTO` / `sqlite3_backup_*` as the engine-native snapshot primitives →
  migrations' snapshot contract.

## Applied to the technique layer

- 2026-08-22-3: **opposite persistence of the two halves** applied to `journal-and-durability-modes` ([[2026-08-22-3]]).
