---
layer: application
type: application
subject: companion-identity
technique: constitution-self-model-split
stack: rust
status: forged
verified_on: 2026-09-23
verified_against: rust@1.96
applied: experiment
ab_verdict: better
---

# A shipped constitution that carries the op catalog (Personas / Athena)

Personas seeds its companion's law, `~/.personas/companion-brain/constitution.md`,
from a template compiled into the binary, and the running prompt reads the law from
that file rather than from the package (`src-tauri/src/companion/prompt/build.rs:102,
123-125`). The partition itself holds: identity and constitution are separate files
with separate writers (`companion/brain/identity.rs:1-12`), and the Brain Viewer
gates its edit affordance to the identity kind
(`src/features/plugins/companion/BrainViewer.tsx:676, 784`), so the app offers no
in-product editor for the law. The upgrade path is where the standard is
missed, and it is missed for the reason the technique now leads with.

Re-read 2026-09-23 at personas `1b8161096`; toolchain pinned in
`rust-toolchain.toml` (channel `1.96.1`), manifest floor `rust-version = "1.80.0"`
(`src-tauri/Cargo.toml:218`).

## The baseline is the grammar

The template is 1,911 lines and carries 103 `OP:` lines — the companion's whole
action vocabulary lives in the law file (`templates/constitution.md`, e.g.
`:257-265`). A build-time test fails when an op is wired end to end but "named
nowhere in `constitution.md`" (`every_catalog_op_is_taught_by_the_constitution`,
`companion/dispatcher/catalog.rs:860`), which makes the coupling mandatory: every
new feature is a constitution edit. `CONSTITUTION_VERSION` stands at **66**
(`companion/templates/mod.rs:571`), with a changelog comment per bump from v37
onward (`mod.rs:299-570`); git shows 78 commits to the template since
2026-05-01 and 26 since 2026-08-01, the latest on 2026-09-21.

## The upgrade replaces whatever the person wrote

`ensure_initialized` (`companion/disk.rs:41-114`) seeds when absent (`:74-86`), and
otherwise, whenever the stored stamp is below the embedded one, copies the file to
`constitution.bak-<ts>.md` and overwrites it with the template, "only run upgrade
once per version bump regardless of what edits the user has made" (`:87-107`).
There is no fingerprint of the shipped text, so an untouched file and an amended
one are treated alike. The backup's result is discarded (`let _ = fs::copy(…)`,
`disk.rs:93`) and the overwrite runs anyway. The only record of an upgrade is a
`tracing::info!` (`disk.rs:100-106`); nothing in the frontend mentions a
constitution backup or upgrade. The feature README corrected its own earlier claim
that an upgraded install keeps its file (`docs/features/companion/README.md:825`)
and notes that "the `.bak-` files are never reaped (31 had accumulated before
anyone counted)" (`README.md:827`).

Against the technique's four mitigations: versioned, yes; recoverable, usually (the
backup is best-effort); loud, no (a log line); rare, no (66 versions). Each bump
sets the person's amendments aside, and because the grammar lives in the same file,
keeping the old file would leave the companion unable to emit the new ops, so a
keep-mine option would not work in this design. That is the case the layering rule
exists for: the op catalog would be assembled from the package, and the person's
file would hold only law.

## An amendment path through the build

Dev mode (debug builds, a header toggle) lets the companion propose `dev_improve`:
a coding CLI session "at the app's own source checkout" (`companion/dev_mode.rs:1-15`,
`repo_root` at `:20-30`). Frontend-flagged work runs in the main checkout, backend
work in a worktree applied later by `dev_merge`
(`commands/companion/approvals/approval_exec_dev.rs:855-914`), and the session runs
with `--dangerously-skip-permissions` inside a registered project (`:916-920`). The
task prompt (`dev_mode.rs:991` onward) scopes the change by instruction only;
nothing excludes `src-tauri/src/companion/templates/constitution.md`, the
`CONSTITUTION_VERSION` constant, or `disk.rs` from what the session may edit. A
template edit plus a version bump, merged and rebuilt, is delivered into the
person's `constitution.md` by the upgrade path above.

Both ops are declared approval-gated (`dispatcher/catalog.rs:177-178, 651-652`),
and the executor's comment says "Always click-approved (double policy: not on
AUTOAPPROVE_ALLOWLIST, and gated on dev mode + debug build here)"
(`approval_exec_dev.rs:861-862`). The allowlist was removed on 2026-08-10: under
autonomous mode every proposed action fires except the listed defer arms
(`approval_autopilot.rs:11-24, 76-102`), and neither `dev_improve` nor `dev_merge`
has one. The gate the comment describes exists only in manual mode.

## Where it falls short of the standard

- **Grammar in the law file**: this is the root. Every feature is a law bump, so
  the upgrade can never be rare. Seam to test the layering rule: assemble the op
  catalog from the package at prompt build time
  (`prompt/build.rs:123-125`) and leave `constitution.md` as law only.
- **No fingerprint rung**: an untouched file cannot be told from an amended one, so
  every install takes the backup-and-replace path.
- **A backup that may not exist** (`disk.rs:93`) and **a notice nobody sees**
  (`disk.rs:100-106`).
- **The upstream is writable by the companion** under dev mode, and under autonomous
  mode without a click; the code's own comments still describe a click gate.

## Applied 2026-09-23 - the upgrade ladder over git history and the install, read-only

57 constitution version bumps in 143 days. By a lexical test (an op line or a catalog op
name) 21 are grammar-only, 32 mixed and 4 law-only; reading the 4 by hand, 3 are feature
procedures, so at most 1 of 57 changed durable law. 20 template commits changed the text
without a bump and 17 of them changed op lines - grammar that reaches an existing install
only at the next bump, and would ship with the binary under layering. Person's file
rewritten per bump: 57 as built, at most 1 with the grammar out.

The floor refuted the landing's worst case *on this install*: 39 of 39 backups are
byte-identical to a shipped text, so no amendment was ever displaced - nothing had been
written, and the product has no in-product editor for the law. A fingerprint of the
shipped text would have made all 39 upgrades silent; 3 of them re-fired over text that was
already current (the stamp lives in the app database, the file in the home folder -
mechanism inferred). The backup's result is discarded; the failure path was never
observed. Both dev-mode ops fire under autonomy, so the law's source is writable without a
click. `better`. Return: rerun when an in-product law editor ships or any install shows
an amended file.
