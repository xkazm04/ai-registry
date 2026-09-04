---
layer: application
type: application
subject: guest-execution-bounding
technique: one-terminator-many-armed-slots
stack: rust
status: forged
verified_on: 2026-09-04
verified_against: rust@1.75
proof: structural-only
---

# One shared terminator over an embedded script engine, in a headless browser engine

## What was read

A nine-crate Rust workspace implementing a headless browser engine: it embeds V8
through `deno_core`, owns a DOM tree, a CSS cascade and a CPU paint pipeline, and
serves the Chrome DevTools Protocol over WebSocket. Read at commit `14ce5178` — the
architecture overview, the contributor guide's "Robustness invariants (do not remove)"
section, `crates/obscura-js/src/cdp_watchdog.rs`, and the script-phase bounding in
`crates/obscura-browser/src/page.rs`.

The witness for `verified_against` is the floor the workspace actually compiles under: the project declares no `rust-version` of its own, its container build pins the `1.x` line, and the vendored text-shaping crate it builds as part of the workspace declares `rust-version = "1.75"`. That is the most precise version this tree witnesses, and it is a floor rather than the version any build used.

## Why the counted set is empty here

This host cannot use a single counted ceiling from this subject's first half. V8 is a
third-party engine consumed as a library; the host does not own its dispatch loop, has
no place to put a back-edge counter, cannot duplicate a dispatch table, and does not
see a frame push. The architecture document states the constraint that closes off the
obvious remedy in one sentence: the isolate is single-threaded by design, and
`tokio::time::timeout` cannot preempt synchronous V8 — it only cancels at await points,
and a script that never yields never reaches one.

That is the precondition failure the technique is written for, stated by a real system
in its own terms.

## What the tree does instead

`crates/obscura-js/src/runtime.rs` exposes `arm_watchdog` / `disarm_watchdog`, which
terminate the isolate **from a separate thread** through V8's thread-safe
`IsolateHandle`. Nothing is killed: the handle raises V8's own termination condition,
V8 unwinds at its next safe point, and the host's entry point receives it. The
contributor guide lists this under invariants that must not be removed, and pairs it
with `panic = "unwind"` pinned in the release profile so that the `catch_unwind` around
the DOM op boundary still works — an engine that aborts on panic would take the process
down through V8's FFI frame instead of degrading to a null result.

`crates/obscura-cdp` arms the same mechanism around every CDP command, so the ceiling
is not optional per handler. The documented failure it prevents is precise: a runaway
page holding the V8 lock and wedging every other session on the server.

## The structural fact

The header comment of `cdp_watchdog.rs` records something the technique claims and
that a design document would not normally admit: the file exists because a
**thread-per-command** watchdog cost about 240 microseconds per command on the hot
dispatch path, and because a **single global slot** was wrong once the server moved to
a thread-per-connection model (issue #430) — several connections can have a command
armed at once, and one connection's arm would overwrite another's, leaving that command
unbounded. The fix is one long-lived watchdog thread holding a map of armed slots keyed
by a monotonic generation.

That is this subject's
[one-terminator-many-armed-slots](../techniques/one-terminator-many-armed-slots.md)
arrived at independently, under commercial pressure, with the cost measured rather than
argued — and the note that the dispatcher's `disarm` observes a `fired` flag and clears
V8's termination state before the isolate runs its next command is the same
firing-is-observed rule, for the same reason.

## What this realization cannot do

The bound is a liveness ceiling and the tree treats it as one: every number is
operator-tunable through an environment variable, and none of them is presented as
reproducible. A page near the deadline succeeds on one machine and fails on another,
and no part of the engine's correctness rests on where the line falls. The engine also
cannot bound *memory* this way — a V8 heap cap is passed to V8 as a flag and enforced by
V8, not by the terminator — so the ceiling set here is genuinely partial, and the
environment-variable documentation is where the partial list is published.

Nothing here was measured by this run: the 240-microsecond figure and the wedging
failure are the tree's own claims, read from its source comments rather than
reproduced. The structural facts — that one shared thread exists, that slots are keyed
by generation, that the arm is unconditional on the dispatch path — were confirmed by
reading the code.
