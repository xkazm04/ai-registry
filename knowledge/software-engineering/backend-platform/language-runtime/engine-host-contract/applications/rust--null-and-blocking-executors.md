---
layer: application
type: application
subject: engine-host-contract
technique: null-and-blocking-executors
stack: rust
status: forged
verified_on: 2026-09-03
verified_against: rust@1.91
---

# Null and blocking executors, as Boa ships them

Boa (`boa-dev/boa`, commit `665f03924a54e5162be227e7e909612e36f6e35a`, workspace
version 0.22.0 at `Cargo.toml:29`, toolchain witness `rust-version = "1.91.0"` at
`Cargo.toml:30`) is an embeddable JavaScript engine whose `boa_engine` crate exposes
jobs through a `JobExecutor` trait and ships exactly the two executors the technique
asks for. It is also the tree where the technique's documentation rule — *name the
default the builder actually installs, and keep the claim in one place* — has a live
counter-example, which is the structural fact this application exists to carry.

## The trait and the pair

`core/engine/src/job.rs:795-818` is the seam: `enqueue_job` takes a `Job` enum
(`job.rs:709-731`, non-exhaustive, one variant per job kind — promise, native async,
timeout, interval, generic, finalization-registry cleanup) and the doc at `job.rs:798`
says it "combines all the host-defined job enqueueing operations into a single method".
`run_jobs` is the synchronous entry and `run_jobs_async` defaults to forwarding to it
(`job.rs:809-817`), so a host that only has a blocking runtime overrides one method.

The **null executor** is `IdleJobExecutor` at `job.rs:820-846`: `enqueue_job` has an
empty body, `run_jobs` returns `Ok(())`, and the doc says "mostly useful if you want to
disable the promise capabilities of the engine" — the observable phrasing the technique
asks for rather than "discards jobs".

The **blocking drain** is `SimpleJobExecutor` at `job.rs:863-1046`. It is more than a
FIFO: it keeps four queues plus a `BTreeMap<JsInstant, Vec<ClockJob>>` of timers keyed
by the engine's own monotonic clock (`job.rs:870-877`), enqueues timers and intervals at
`now + delay` read from `context.clock()` (`job.rs:922-937`), and in `run_jobs_async`
dispatches every past-due clock job *before* the termination check — the comment at
`job.rs:970` says so in those words. Cleanup jobs are polled once only when every other
queue and the future group are empty (`job.rs:1012-1021`). The synchronous `run_jobs` is
`future::block_on(self.run_jobs_async(...))` at `job.rs:945-947`: one loop, blocked on,
not a second loop.

## Bail on the first error, and clear

Every job kind's failure path is the same three lines: `self.clear(); return Err(err);`
— for timeouts at `job.rs:988-991`, intervals at `job.rs:996-999`, cleanup at
`job.rs:1014-1017`, native futures at `job.rs:1023-1026`, promise jobs at
`job.rs:1030-1033`, generic jobs at `job.rs:1038-1041`. `clear()` at `job.rs:880-885`
empties all four queues. The stop token (`get_cancellation_token`, `job.rs:905-907`, an
`Arc<AtomicBool>`) is checked at the top of every iteration and takes the same path:
reset the flag, clear, return `Ok(())` (`job.rs:956-960`). A stopped drain and a failed
drain leave the executor in the same empty state, which is the technique's rule.

## The default-executor contradiction

Three places state what a `Context` gets when the embedder passes no executor, and they
disagree:

- `job.rs:16-17`, the module-level doc: `IdleJobExecutor` is "the default executor if
  no executor is provided. Useful for hosts that want to disable promises."
- `job.rs:865`, the type-level doc on `SimpleJobExecutor`: "This is the default job
  executor for the `Context`".
- `core/engine/src/context/mod.rs:1225-1227`, the builder:
  `self.job_executor.unwrap_or_else(|| Rc::new(SimpleJobExecutor::new()))`.

The builder installs the blocking drain; the type doc agrees; the module doc — the first
thing a reader of the jobs API sees — names the null executor. The code is on the right
side of the technique's rule (the default is the one that runs jobs, per
absent-guard-is-loud), and the module doc is the "stale claim beside a different
default" the technique warns is acted on. An embedder who read `job.rs:16-17`, saw
promises settle anyway, and concluded the doc must mean something else has learned the
wrong lesson about the executor seam. Recorded as a deviation: the standard's rule is
that the claim lives in one place and matches the builder; the tree carries it in three
places and one of them is wrong.

## Confirmed against the technique

Ship a null and a blocking executor and no third: confirmed — the engine crate contains
exactly `IdleJobExecutor` and `SimpleJobExecutor`; the interleaving loop lives in the
CLI (`cli/src/executor.rs`) and in `examples/src/bin/smol_event_loop.rs`, which are
hosts. Null executor documented as disabling promises: confirmed at `job.rs:822`.
Builder default runs jobs: confirmed at `context/mod.rs:1227`. Bail on first error:
confirmed, with the clear-then-return refinement that became an upward lesson. Timers
dispatched before the exit decision: confirmed at `job.rs:970-1010`. Documentation
names one default in one place: **deviation**, `job.rs:16-17` versus `job.rs:865` and
`context/mod.rs:1227`.
