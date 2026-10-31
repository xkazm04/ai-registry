---
layer: application
type: application
subject: settings
technique: config-backup-and-restore
stack: rust
status: forged
verified_on: 2026-10-31
verified_against: rust@1.80
applied: simulation
ab_verdict: better
proof: structural-only
---

# Three backups and no door back

*Read on 2026-09-03 at `c14d0edf4^`, the commit before the restore module
landed; line anchors below are given at personas@61029d7ae0. What changed
after that read is in the last section.*

The desktop app's primary store is a single local database, and the tree
states the force in its own words: local-first, no server-side replica, the
file on the operator's machine is the only copy (`src-tauri/db/src/damage.rs:3-4`).
The version witness is `src-tauri/Cargo.toml:222` (`rust-version = "1.80.0"`);
the toolchain that ran this read is not recorded in the tree, which has
pinned `1.96.1` in `rust-toolchain.toml` since 2026-09-18.

The technique has two halves: rotate backups before every write that could
damage the file, and give the product a surface that offers them back. At the
pin the tree had the first half in full and the second not at all, and it
said so.

## What is built

`src-tauri/db/src/backup.rs:82-96` snapshots the store and its journal
siblings before any connection opens, on every boot of an existing
database; at the pin three sets survived rotation. `src-tauri/db/src/damage.rs`
classifies corruption by extended result code, quarantines the store on
canonical damage, and stops rotation so a damaged-but-readable file cannot
rotate its own good copies out of existence (`:21-26`). That last rule is
one the technique should carry and does not state as sharply.

## What was missing at the pin, in the tree's words

The backup module's recovery story was a doc comment: copy the newest backup
back over the store (`backup.rs:9-10`, unchanged). A migration that meets DDL
it cannot rewrite chooses to log and continue rather than abort, because an
abort "would strand the user with an app that will not start and no
in-product restore path" (`src-tauri/db/src/migrations/incremental/support.rs:312-315`).
That is a design decision made under a constraint the technique removes.

## The simulation

Three cases from the tree, walked under A (the pin) and B (a restore surface
over the existing sets):

- **The migration branch.** Under A the residue is tolerated forever. Under B
  the abort is safe, because the operator can choose a set. Falsified if the
  abort costs more than the dangling key.
- **Canonical damage at boot.** Under A the operator learns a file-copy
  procedure from a comment. Under B the boot ends in a list of sets with a
  quick-check state. Falsified if a quick check passes on a set that will
  not boot; the state column must name its probe.
- **The founding case, a bad migration.** Under A, a manual copy. Under B,
  one dialog. Falsified if restore-by-copy runs while a pool is open, in
  which case restore must defer to the next boot through a marker the
  pre-boot snapshot step reads.

Predicted better on all three; recorded at the pin as a direction proposal in
the project rather than built, because a restore surface is a capability the
project's scope admits but did not yet name.

## What the realization cannot do

Nothing here protects the operator's UI preferences, which live in browser
storage behind the app shell; they are derivable and a lost theme is not a
lost run, so the technique's rotation half was deliberately not extended to
them.

## Since 2026-09-03

Re-checked 2026-10-31 at personas@61029d7ae0. Two findings changed after the
pin.

- **The backend half of the door back was built the same day.**
  `src-tauri/db/src/restore.rs` (`c14d0edf4`, 2026-09-03) provides three
  things (`:13-40`). First, `list_backup_sets` (`:115`): every set with a
  `PRAGMA quick_check(1)` state that names its probe, bad sets included.
  Second, `offer_for` (`:236`): an offer for a boot that has no way forward,
  `None` for a healthy store. Third, `request_restore` (`:284`), which only
  writes a marker; `init_db` applies it on the next boot, after the snapshot
  and before any connection opens (`src-tauri/db/src/lib.rs:395`). That is
  case three's falsifier, built as specified. **There is still no surface.**
  No Tauri command and no frontend code calls the list or the request; the
  only callers outside the module are `apply_pending_restore` and
  `restore::log_offer` (`lib.rs:459`), so the quarantined boot now ends in a
  log line listing the sets, which the operator must find. The migration
  branch still logs and continues, and its comment still says there is "no
  in-product restore path". Under B's own terms, cases one and two still
  wait on a surface.
- **Rotation is no longer "three sets".** Since `04b4c2b7f4` (2026-09-14),
  boot sets keep the newest `MIN_BACKUPS = 2` unconditionally and up to
  `MAX_BACKUPS = 3` (`backup.rs:44-47`) only while the kept total fits
  `MAX_BACKUP_BYTES` (768 MiB, `:52`); ad-hoc sets age out after 14 days
  (`:57`). The reason is recorded at `:27-28`: a 347 MB store cost 1.04 GB at
  three sets. A size-bounded floor-and-ceiling is a sharper rotation rule than
  a fixed count.
