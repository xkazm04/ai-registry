---
layer: application
type: application
subject: settings
technique: applied-defaults-ledger
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.80
applied: simulation
ab_verdict: not-better
proof: structural-only
---

# Where a replay already owns the property

The desktop app has no settings schema version and no migration chain. Its
migrations are idempotent replays run on every boot: a column is added if
absent, an index created if missing, a foreign key repointed when its
stored DDL still names the old table. The backup module records the
consequence directly: there is no schema-version counter in this codebase,
so there is no cheap "will this boot change the schema" signal, and the
store is backed up on every boot instead (`src-tauri/db/src/backup.rs:15-18`).
The version witness is `src-tauri/Cargo.toml:115` (`rust-version = "1.80.0"`).

The technique replaces a version chain with a ledger of applied default
sets. This tree has neither, and the simulation says the ledger would not
help it.

## Three cases, walked both ways

- **A one-time repair guarded by state** (`src-tauri/db/src/migrations/fk_hygiene.rs`).
  Under the ledger it runs once and is recorded. Under the replay it
  re-checks the live state on every boot, which is what makes a hand-edited
  or hand-restored database safe: the replay heals, the ledger would read
  its own "applied" entry and skip the check. Not better.
- **A repoint that re-scans stored DDL on every boot** (`migrations/incremental/support.rs:215-235`),
  logging an error each time the shape is unknown. The ledger would silence
  the log after the first success, and would also stop noticing when a
  restored file brings the old shape back. Marginal on noise, worse on
  safety. Not better.
- **Persisted UI stores with no migrate step** (`src/stores/*.ts`). A renamed
  default would silently reset a user's explicit choice on the next
  release. This is the case the ledger exists for, and the tree has no
  instance of it on the Rust side, because settings rows there are written
  by the user and never shipped as a default set.

## The finding

The ledger is for shipped sets of values the user may edit or delete. For
structure, an idempotent replay already has the property and adds one the
ledger cannot: every boot re-verifies. The technique gained a boundary
section from this reading. The return condition for this tree is a shipped
default set the user can override - keyboard shortcut rebinding, preset
packs - at which point the persisted UI store is the seam.
