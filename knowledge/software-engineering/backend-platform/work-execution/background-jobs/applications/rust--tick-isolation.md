---
layer: application
type: application
subject: background-jobs
technique: tick-isolation
stack: rust
verified_on: 2026-08-22
---

# One panic boundary for twenty background tasks

Layer 1 of the technique — crash capture as the *envelope's* job, not the
body's — was present in this backend fifty-six times, written out by hand. The
consolidation into `spawn_guarded` (`src-tauri/src/background_job.rs:80-105`)
is a compact case study in what a shared crash barrier can and cannot absorb.

## The five steps, and which four were identical

Every long-running background task hand-rolled the same sequence: spawn →
`AssertUnwindSafe(..).catch_unwind()` → `extract_panic_message` →
`tracing::error!` → *some* recovery. The helper's doc comment
(`:60-80`) records it: the first four were **byte-identical modulo the tracing
field NAME** — `job_id` / `run_id` / `scan_id` / `debug_id`, nine spellings of
one concept — and only the fifth genuinely differed. The campaign's own count
of the duplication is 26 copies of the message-extraction step alone, exported
zero times before this change.

That is the correct shape for this technique. Capture, extraction and the log
line are envelope concerns and belong in one place; **recovery is a body
concern** and belongs at the call site, because what a panicked tick should
leave behind is entirely local: a job marked failed, a run row closed, a lock
released, nothing.

## The log field names had to be unified, and that is a telemetry change

`tracing` field names must be literals, so nine spellings of one identifier
could not be unified any other way. The helper emits `task=<kind>
entity_id=<id>` uniformly, and the doc comment names the change rather than
burying it: the panic log became greppable across every background task at the
cost of nine bespoke field names nobody was querying separately. Worth
recording because the temptation was the other way — a per-call-site field
name parameter would have preserved the old logs exactly and rebuilt the
divergence inside the abstraction.

## The parameter that was refused

Exactly one caller wanted a variation on the recovery arm. The helper does not
take an optional parameter for it; the caller composes a closure instead
(`on_panic: R where R: FnOnce(String) -> Fut`). A shared primitive that grows a
knob per caller becomes the union of its callers' special cases and stops being
a primitive — and an optional parameter that exactly one call site sets is the
first knob, always. Composition at the one site that needs it is the cheaper
trade.

## What it deliberately does NOT fix

The helper preserves existing behaviour including **dropping the
`JoinHandle`** — the ~20 call sites that discard it keep discarding it, and
the returned handle carries no must-use obligation. The doc comment states
why: making these tasks abortable is behaviour-changing work that does not
belong inside a refactor whose whole claim is that nothing observable moved.
That is the right instinct for a consolidation, and it is also an honest
record of a remaining gap: this backend has 222 spawns, 31 retained handles
and 7 aborts, so ~165 production spawns still start work that can die with
nobody positioned to notice. The panic barrier makes the *runtime* survive a
dead task; it does nothing about the task's own supervision.

## The tests are the whole safety argument

19 call sites moved their panic recovery onto previously non-existent shared
code, and the ordinary suite never executes a panic path. Four tests stand
behind that move (`background_job.rs:676-836`, the file's `#[cfg(test)] mod tests`): the recovery arm receives the
extracted message; a worker that returns normally never runs the recovery
arm; a panicking worker leaves its job **failed** rather than stuck at
running; and a panicking task does not poison its siblings. The third is the
one that matters at the call sites — it is the difference between the
technique's isolation and the padded-cell-with-no-window it warns about.

Each was confirmed to fail with the recovery call removed. That proof is
where the sharpest lesson of this whole consolidation came from, and it is
recorded in the test module's own comment: a custom silencing panic hook,
added to keep intentional backtraces out of the test output, **defeats the
harness's own panic capture** and turns a failing assertion into a harness
that dies with no output at all. The tests looked clean precisely because
they had been quieted. The full rule is
[negative-control-tests](../../../../engineering-process/build-and-release/test-harness/techniques/negative-control-tests.md);
the instance belongs here because crash-barrier tests are the population most
likely to attract a silencer.
