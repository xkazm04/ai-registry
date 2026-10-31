---
layer: application
type: application
subject: settings
technique: config-backup-and-restore
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.80
applied: simulation
ab_verdict: better
proof: structural-only
---

# Three backups and no door back

The desktop app's primary store is a single local database, and the tree
states the force in its own words: local-first, no server-side replica, the
file on the operator's machine is the only copy. The version witness is
`src-tauri/Cargo.toml:222` (`rust-version = "1.80.0"`); the gate that read
this tree ran on a 1.97 toolchain.

The technique has two halves: rotate backups before every write that could
damage the file, and give the product a surface that offers them back. The
tree has the first half in full and the second not at all, and it says so.

## What is built

`src-tauri/db/src/backup.rs:82-96` snapshots the store and its journal
siblings before any connection opens, on every boot of an existing
database; three sets survive rotation (`:47`). `src-tauri/db/src/damage.rs`
classifies corruption by extended result code, quarantines the store on
canonical damage, and stops rotation so a damaged-but-readable file cannot
rotate its own good copies out of existence (`:21-26`). That last rule is
one the technique should carry and does not state as sharply.

## What is missing, in the tree's words

The backup module's recovery story is a doc comment: copy the newest backup
back over the store (`backup.rs:9-10`). A migration that meets DDL it cannot
rewrite chooses to log and continue rather than abort, because an abort
"would strand the user with an app that will not start and no in-product
restore path" (`src-tauri/db/src/migrations/incremental/support.rs:312-315`).
That is a design decision made under a constraint the technique removes.

## The simulation

Three cases from the tree, walked under A (today) and B (a restore surface
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

Predicted better on all three; recorded as a direction proposal in the
project rather than built, because a restore surface is a capability the
project's scope admits but does not yet name.

## What the realization cannot do

Nothing here protects the operator's UI preferences, which live in browser
storage behind the app shell; they are derivable and a lost theme is not a
lost run, so the technique's rotation half was deliberately not extended to
them.

## Re-checked 2026-10-31

Re-checked 2026-10-31 at personas@61029d7ae0. Four anchors moved and were
updated in place: `Cargo.toml` `:222`, the snapshot `backup.rs:82-96`,
the damage rule `damage.rs:21-26` and the strand comment
`support.rs:312-315`. The local-first force is quoted at `damage.rs:3-4`.
The `backup.rs:9-10` recovery comment is unchanged. Two findings changed.

- **Rotation is no longer "three sets".** Boot sets keep the newest
  `MIN_BACKUPS = 2` unconditionally and up to `MAX_BACKUPS = 3`
  (`:44-47`) only while the kept total fits `MAX_BACKUP_BYTES` (768 MiB,
  `:52`). Ad-hoc sets age out after 14 days. The reason is recorded at
  `:27-28`: a 347 MB store cost 1.04 GB at three sets. A size-bounded
  floor-and-ceiling is a sharper rotation rule than a fixed count.
- **The door back is half built, so "not at all" is reversed for the
  backend.** `src-tauri/db/src/restore.rs` (`c14d0edf4`, 2026-09-03)
  provides three things. First, a list of every set with a probed
  `quick_check` state that names its probe. Second, an offer for a boot
  that has no way forward. Third, a restore that only writes a marker,
  applied by `init_db` on the next boot before any connection opens
  (`lib.rs:395`). This is case three's falsifier, built as specified. No
  Tauri command or frontend calls the list or the request, though. The
  quarantined boot ends in `restore::log_offer` (`lib.rs:459`), a log
  line the operator must find. The migration branch still logs and
  continues, and its comment still says there is "no in-product restore
  path". Under B's own terms, cases one and two still wait on a surface.

verified_on is not moved. The 1.97 toolchain that ran the original gate
is not recorded in the tree, which now pins `1.96.1`, so it could not be
re-checked.
