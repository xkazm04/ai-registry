---
layer: application
type: application
subject: node-boot-and-declarative-bootstrap
technique: ordered-boot-dag
stack: rust
status: forged
verified_on: 2026-09-26
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# The boot graph of an async Rust API that owns a SQL store: `tracklight`

tracklight's `lighttrack-api` (`crates/api/src/main.rs`, axum 0.7 on tokio, toolchain pinned
at 1.96.1) is a stateful node without a seal. It owns a SQLite, Postgres or Firestore store,
seeds it on first start, and serves an ingest and query API. Its `main` is the boot graph
written as one function. Read against [ordered-boot-dag](../techniques/ordered-boot-dag.md),
it confirms the pre-storage rung and validation before acquisition. It adds one edge the Go
reading could not show: the execution context a step runs in. It also carried the
announcement deviation the technique now names, fixed and measured in the same pass.

## The order, rung by rung (at `53ff57f`)

Logging is initialised first (`main.rs:318`), "before anything can want to say something".
Then the one refusal that reads only the environment: `credential_boundary::check_boot`
(`:331`) refuses to start an unauthenticated instance unless the operator set a sentence-valued
opt-out. Its comment gives the ordering reason in the technique's terms: "Before the store is
opened, the router is built or a port is bound … a guard raising inside a handler leaves the
process up, the port open and the health check green." It is the configuration-only rung. It
runs before storage because it reads nothing storage holds, and a refusal there acquires
nothing that would need releasing.

Storage comes next, and here the async runtime adds an edge. The Postgres store calls
`block_on` internally and panics on the async main thread, so the store connect, the first-run
price seed and the warm of the per-project policy cache all run inside one
`tokio::task::spawn_blocking` closure (`:362-402`). The comment at `:389-392` calls that
closure "the one startup context allowed to call the store synchronously". In an async
runtime the graph has a second dimension: a step must come after everything it reads, *and*
run on an executor that its dependencies can be called from. A step placed in the right order
on the wrong executor fails exactly like a missing edge, on one backend and not the others.

State construction follows, then (after this pass) the bind (`:464`), the posture
announcement (`:467-489`), the boot-time posture lines (redaction, price-book staleness, the
backend's capability manifest at `:499`), the background tasks (`:508-528`) and `axum::serve`
(`:535`). The node has no unseal-shaped step, so the technique's own "when not to use" holds
for the diagnostic. tracklight has no verify-only mode and no replaying diagnostic. What it
has instead is one indexed startup event carrying the whole runtime configuration, so that
"why did prod behave differently is a field comparison across two boots". That is the cheap
substitute a two-rung graph earns, and it is not a gate.

## Finalizers: the language binds them, except for what is detached

In Rust the finalizer is bound at acquisition by ownership. Every `?` between the store open
and `axum::serve` drops the store handle and the listener on the way out, so the verify-only
leak the technique warns about has no path to occur in scoped code. The exception is what is
spawned. The five background tasks are detached `tokio::spawn`s whose handles are dropped, and
`axum::serve` runs without a graceful-shutdown future. On exit, the runtime cancels them at
their next await point rather than draining them. That is harmless here only because the
store's writes are single transactions on a crash-safe journal. A multi-step background write
would be torn by the same shutdown.

## The deviation, and the measured fix

Before this pass the posture event, whose message is `"lighttrack-api v{} listening on
http://{bind}"`, was logged from the *configured* address some sixty lines before
`TcpListener::bind`, and the background tasks were spawned before the bind too. Two arms
were run on the same machine, with the port held by another process and a fresh SQLite file:

| | pre-fix binary (`ee3ce2c`) | fixed binary (`53ff57f`) |
|---|---|---|
| port already held | logs `listening on http://127.0.0.1:18799`, then exits 1 on address-in-use | logs no listening line; exits 1 on address-in-use |
| bind to `127.0.0.1:0` | would print `:0` (the configured string) | prints `listening on http://127.0.0.1:49216` (from `local_addr()`) |

The fix binds first, reports `listener.local_addr()`, and starts every background task after
the last step that can refuse the process. The workers-after-bind half measured as *no
observable difference* on this tree. The schedule sweep spends its first tick immediately
and waits a full interval before acting, and a held port fails the bind within milliseconds,
so no sweep ever acted in the doomed process. It is kept for the ordering rule, not for a
measured harm. The hazard needs a worker whose first action precedes a slow or retried bind.

## Not applied here

The verify-only condition (address-in-use beside a live node is *held*, not a failure) has no
seam: the binary has no verify-only mode. Its return condition is a `--check` flag or a
diagnose subcommand.
