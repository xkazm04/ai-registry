---
layer: application
type: application
subject: trust-base
technique: census-counts-unmarked-members
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.97.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A desktop application whose trust base was counted by its markers

The tree is the desktop application personas, read at commit `89f31de41a`. Its
packages are pinned to the 2021 revision, `src-tauri/Cargo.toml:221 "edition"`, the
revision before environment writes were re-marked as unsafe; the census ran with
rustc 1.97.1. An earlier run on the same day audited this tree's trust base by its
markers and found 38 escape sites.

## The census, two predicates

Arm A is that earlier predicate: lines carrying the escape keyword as a block,
function, impl or foreign item. Arm B adds calls to the re-marked environment
functions on lines with no marker. Both were run over the tracked source by text
search, and the text search was first checked against the compiler: the revision's
migration lint, run over the data package's library and tests, named nine calls, and
the text search named the same nine lines.

| Arm | Count | Of which outside test directories |
| --- | --- | --- |
| A, marker sites | 38 | 38 |
| B, unmarked re-marked calls | 103 | 99 (most of them inside in-file test modules) |

The marker census reproduced the earlier run's 38 exactly, which is the floor: the
instrument agrees with the predicate it replaces. The target moved from 38 members to
141, and arm A could not have seen one of the 103.

## Where the production members sit

Five production sites write the environment, and placement sorts them:

- **Before any thread, argued correctly.** The entry point strips variables a
  development wrapper forced on, with the reason that it runs first,
  `src-tauri/src/main.rs:15 "main() is still single-threaded here."` That is the
  technique's removal by placement.
- **Before any thread, unargued.** The application's run function sets a library
  path, `src-tauri/src/lib.rs:141 "std::env::set_var("`, and then loads a settings
  file into the environment, `src-tauri/src/lib.rs:147 "dotenvy::dotenv().ok();"`,
  before logging starts. Sound by placement, with no note, and the second write
  happens inside a dependency where no census of this tree can count it.
- **After threads exist.** The crash hook sets a backtrace variable from the setup
  hook, after file logging and the database pools are up,
  `src-tauri/src/logging.rs:398 "std::env::set_var("`. And the boot step that mints
  the system key writes it and a bridge address into the process environment from a
  worker thread, `src-tauri/src/boot/finalize.rs:44 "tauri::async_runtime::spawn_blocking(move || {"`,
  with the argument `src-tauri/src/boot/finalize.rs:51 "at startup; edition 2021"`
  followed by the claim that the call is therefore safe. That is the narrowing the
  technique names: the revision decides whether the call compiles, not whether it is
  sound.

The credential write is also the technique's channel case. The variable is written so
in-process tools can read it, and then two spawn paths have to remove it again:
`src-tauri/engine/src/cli_process.rs:884 "set on the parent at startup). Only what a CLI needs to locate itself,"`
and `src-tauri/engine/src/verification_command.rs:142 "Variables of THIS process a detached server must not inherit. The app sets"`.

## The tests

The test runner runs tests on parallel threads, and the tree serializes its
environment tests with a lock per module: four separately declared locks,
`src-tauri/engine/src/hooks_sidecar.rs:290 "static ENV_LOCK: Mutex<()> = Mutex::new(());"`,
`src-tauri/engine/src/claude_md_projection.rs:250 "static ENV_LOCK: Mutex<()> = Mutex::new(());"`,
`src-tauri/db/src/audit_incidents_promoter.rs:316 "static ENV_LOCK: Mutex<()> = Mutex::new(());"`
and a fourth in the session launcher. Each excludes only its own module's tests, so
tests in two of those modules can write the environment at the same moment.

## What this realization cannot do

This run changed no line of the tree for this technique. Replacing the credential
channel touches the boot step, two tool functions that read the variables and two
spawn paths that strip them, which is a design change for the tree's owner, not a
line edit; the census and the five-site table are the input it would start from. On
the platform this machine runs, the standard library documents the call as always
sound, so the members are live on the tree's other two release platforms only, and
nothing here observed a crash on either.
