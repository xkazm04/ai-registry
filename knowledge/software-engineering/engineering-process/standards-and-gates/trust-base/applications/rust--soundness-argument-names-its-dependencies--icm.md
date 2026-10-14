---
layer: application
type: application
subject: trust-base
technique: soundness-argument-names-its-dependencies
stack: rust
status: forged
verified_on: 2026-10-14
verified_against: rust@1.85
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# Three locks that each think they are the only one, and a silenced lint at a cast (icm)

Source tree: `github:rtk-ai/icm@5f402434` (2026-10-13), a four-crate Rust workspace, read at
release 0.11.4 under the 2024 edition (`edition = "2024"`, Rust 1.85), in which mutating the
process environment is itself an `unsafe` operation. A census of every `unsafe` site, with a
note counted when `SAFETY` appears within the four lines above it: 73 sites, 64 of them
environment mutations in tests, none of those carrying a note; of the 9 outside tests, 5
carry one.

## The arguments that are written well

The production environment write states the one fact it rests on and where that fact holds:
`crates/icm-cli/src/ort_runtime.rs:141 "SAFETY: reached from `main` before the embedder, or any other"`
thread is started. That is the technique's first end, the site naming its dependency, and
it is the right dependency: the 2024 edition made the call unsafe precisely because another
thread may read the environment.

## The test suite's argument, split three ways

The tests rest on the same fact, that no other thread touches the environment while one test
mutates it, and enforce it with a mutex. The tree declares that mutex three times: once in
each of two test modules of the CLI binary
(`crates/icm-cli/src/main.rs:14197 "static ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());"`,
`crates/icm-cli/src/main.rs:14256 "static ENV_LOCK: std::sync::Mutex<()> = std::sync::Mutex::new(());"`)
and once in the summarizer's tests, whose comment states the hazard it closes
(`crates/icm-cli/src/summarizer.rs:823 "runner (one sets `ICM_INVOKER` while another expects it unset)."`).
Three statics are three locks. Each serializes its own module, and the test runner runs the
three modules, and the tests that guard themselves only by a variable name unique to the test,
on parallel threads of one process. The argument "nothing else touches the environment" is
true inside each module and false across them, and none of the 64 sites says which lock it
depends on. A unique variable name does not discharge it either: the hazard is a concurrent
read or write of the environment as a whole, not of one key.

The technique's two-ended note is the cheap repair: one lock, declared once in a shared test
helper, whose declaration says every environment mutation in the crate's tests depends on it,
and a `SAFETY` line at each site naming that helper.

## The cast whose argument was replaced by a lint allowance

The vector extension is registered with SQLite through a function-pointer cast, and the lint
that would have required the target type to be written out is switched off at the site
(`crates/icm-store/src/store/connection.rs:42 "#[allow(clippy::missing_transmute_annotations)]"`).
The soundness of that cast depends on a declaration in another crate, the extension entry
point's signature, matching the callback type the registration expects. Nothing at the site
says so, and the allowance removes the one prompt that would have made the next reader write
the type down. The other unannotated production sites are a signal-disposition reset at
startup (`crates/icm-cli/src/main.rs:2223 "unsafe { libc::signal(libc::SIGPIPE, libc::SIG_DFL) };"`)
and two pre-exec closures that start a new session for detached workers, each a one-line
platform call whose argument is short but unwritten.

## Return condition

`unmeasurable` here: the tree was read, not built. The instrument that would measure it is
the workspace's own test run with the three modules forced onto one thread and then onto many,
comparing failures; and, for the cast, a build with the lint allowance removed, which should
fail until the type is named.
