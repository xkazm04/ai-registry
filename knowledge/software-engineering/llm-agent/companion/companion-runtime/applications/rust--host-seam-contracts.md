---
layer: application
type: application
subject: companion-runtime
technique: host-seam-contracts
stack: rust
status: forged
verified_on: 2026-09-23
verified_against: rust@1.96
---

# The host seam in the Personas companion (Athena)

A Tauri desktop application hosts a persistent companion. Two of its subsystems
sit on opposite sides of this technique's line, one second channel re-implements
the companion and another calls it, and the store question turns out to be
different from the one the technique first asked.

Citations re-resolved on 2026-09-23 against the tree at `1b8161096`. Rust
witness is the observed `rustc 1.96.1`, matching the tree's
`rust-toolchain.toml` pin; the manifest floor is `rust-version = "1.80.0"`
(`src-tauri/Cargo.toml:218`).

## Confirmed: the sleep cycle has a real seam, with a double

The memory-maintenance cycle takes its model access as a trait object rather
than calling the process spawner directly:

```rust
pub trait CycleLlm: Send + Sync {
    async fn call(&self, leg: &str, prompt: &str, timeout: Duration) -> Result<String, AppError>;
}
```
(`src-tauri/src/companion/brain/sleep_cycle/run.rs:74-76`)

The production implementation is `MeteredLegs` (`run.rs:79-88`), which forwards
to the metered one-shot path; the test implementation is `Canned`
(`sleep_cycle/tests.rs:47`, `impl CycleLlm` at `:68`), and both `run` helpers in
the test module take `llm: &dyn CycleLlm` (`tests.rs:81`, `:85`). The whole cycle —
admission, both legs, the apply path, the report — runs with no model, no network
and no interface.

`leg: &str` is a required parameter, the same structural rule
[metered-llm-seam](../techniques/metered-llm-seam.md) describes.

## Confirmed, and a condition: the store double is the real engine

The cycle tests and the dispatcher tests do not use a hand-written store. They
open the production SQLite schema in throwaway instances: `init_test_db()`
copies a once-migrated template to a unique temp file per test
(`src-tauri/db/src/lib.rs:2390-2400`), explaining why not `:memory:` — "r2d2 hands
out multiple connections and each in-memory connection would get its own empty
database" — and the dispatcher's `test_pool()` uses a shared-cache memory URI
for the same reason (`src-tauri/src/companion/dispatcher/tests.rs:36-45`). The
store is an embedded engine that can open a disposable instance, so the technique's
acceptance test is satisfied for storage without a Store trait; this is the case
the technique's store condition was written from.

The one store dependency that *did* cost test isolation is the one the technique
names as "read from process environment": `disk::brain_root()` honours a
`PERSONAS_HOME` override (`src-tauri/src/companion/disk.rs:28-31`), and because
that is one process-global, the cycle tests need a lock shared across the brain
module to stop other tests' redirects from pointing the cycle's disk reads
elsewhere mid-test (`sleep_cycle/tests.rs:31-42`, and the `SQL_SERVED_BODY`
note at `:95-107`, where a lost read made admission "correctly-but-wrongly"
skip). The database, injected as a pool, caused none of this; the path, read
from the environment, caused all of it.

## Deviation: the runtime is a module inside its host's package

The companion is `src-tauri/src/companion/`, a module of the desktop crate, not a
crate of its own — while the workspace already has separate `core`, `db` and
`engine` crates (`src-tauri/Cargo.toml:14`). Measured 2026-09-23 by grep over the
module: of 152 `.rs` files, 100 reference `crate::db` (the `personas_db` crate,
re-exported by the desktop crate as `crate::db`, `src-tauri/src/lib.rs:24`), 41
reference `crate::commands`, `crate::engine`, `crate::AppState` or `crate::state`,
and 29 reference `tauri`. The raw `crate::db::repos::…` calls from companion jobs
and proactive passes are the visible part of this. No build rule can see the line
while the runtime shares the host's crate; extracting it into a crate the desktop
crate depends on would make every `crate::commands` / `AppState` reach a cycle the
build refuses, and would leave the `personas_db` edge as the explicit decision the
technique says it is.

## Deviation: the turn path is bound to the desktop framework

`send_turn` (`src-tauri/src/companion/session/turn.rs:63`) takes `app: &AppHandle`,
and the module imports `tauri::{AppHandle, Emitter}` (`turn.rs:9`) because
streaming is done by emitting framework events from inside the turn (e.g.
`:401`, `:767`). There is no turn sink; the sink *is* the desktop event bus, so
the turn cannot run in a test without the framework. The Playwright specs that
drive the Stop button against a running app (`tests/playwright/companion-stop-button.spec.ts:1-20`)
are not this lane and say so themselves — "The actual stream-cancellation
behavior is covered by the unit-level interrupt registry" — which is the runtime
test lane existing for one piece (`session/interrupts.rs`) and not for the turn.

## Confirmed: a second mouth that calls the runtime

`src-tauri/src/companion/remote_jobs.rs` runs an instruction arriving from
another paired device "as a REAL Athena turn, with her own ops, her own approval
rows and her own autopilot rules" (`:6-9`), by calling `session::send_turn`
(`:250-257`) rather than re-implementing it, and states why a remote-only policy
was refused: "a second answer to the same question — and the one that silently
rots" (`:30-32`). That is the technique's second consumer done right — and it runs
inside the same host process, taking the same `AppHandle` and `AppState`
(`:250-253`), so it proves the turn is reachable from a second mouth and nothing
about whether the runtime could live in another host.

## Deviation: the other second consumer re-implements the companion, by written contract

`.claude/skills/athena/brain.py` is a 232-line, zero-dependency Python bridge
that reads and writes the companion's brain from outside the application, so a
terminal channel can hold a conversation whose episodes the sleep cycle later
consolidates. Its docstring states the arrangement (`brain.py:16-21`):

> Parity contract (verify against source when upgrading):
>   - markdown  episodic.rs:478 format_episode_markdown
>   - node row  episodic.rs append_episode INSERT (importance 3, excerpt<=500B)
>   - FTS row   (node_id, body=content, tags='session:{sid} role:{role}')
>   - ids       ep_{8 hex} / turn_{12 hex}   (util::short_id = uuid4 simple prefix)
>   - machine markers episodic.rs:45 — terminal content must never start with one

Five behaviours of the durable write path, re-implemented in a second language
and kept aligned by a checklist that names Rust line numbers, plus two admission
constants "mirrored from brain/sleep_cycle.rs (display only — the app's admission
is authoritative)" (`brain.py:36-37`). It is a debt marker, correctly labelled as
one, and it is not a seam. The two second consumers in one tree are the
technique's contrast in its cleanest form: the one that calls the turn inherits
every change; the one that copies the write path inherits none.

## The pattern that did work, in a neighbouring subsystem

The daemon bridge faced the same problem — a second process could not see
in-memory ambient signals — and solved it by sharing, not copying:
`docs/features/companion/athena-daemon-bridge.md:58` — "The same
`format_signals_for_prompt` is used by `AmbientContextFusion::format_for_prompt`
(windowed path) and the daemon. Byte-identical rendering for byte-identical
input." Letting each process capture its own signals was rejected in writing
(`:25`) because "two clipboard listeners on one machine race; redaction runs twice
with potentially different decisions, breaking the privacy contract" — the
argument [operative-working-set](../techniques/operative-working-set.md) makes in
general form.

## What an extraction would cost here

For the turn: small. The session directory already holds the turn's lock module
(`session/locks.rs`), interrupt registry (`session/interrupts.rs`), failure
wrapper (`session/failure.rs`) and stream module (`session/stream.rs`); what binds
it to the host is the emit calls and the `AppHandle` parameter — one capability,
the sink, not yet named. Naming it would let the terminal bridge call the turn
instead of re-implementing its write path. For the store: a Store trait is not
what testing needs here, since the real engine already serves; what a crate
boundary would buy is a build that sees the line, with `personas_db` as the one
declared lower edge.
