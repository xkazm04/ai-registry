---
layer: application
type: application
subject: time-travel-replay
technique: timeline-derivation
status: forged
stack: rust
verified_on: 2026-09-26
verified_against: rust@1.96
applied: code
ab_verdict: better
---

# The record behind a replay: what the Rust engine writes, and what its reader serves (personas)

Written against `personas` master at `a8cb3aa62` (toolchain pinned `1.96.1`,
edition 2021, Tauri 2). The React half of this replay is described in
[react--timeline-derivation](./react--timeline-derivation.md). This is the half
that decides what that timeline can know: the engine that writes the record
and the commands that hand it to the viewer. No Rust code in the fleet runs a
viewer-owned transport; this is the only second-stack seam, and it is where
the replay's worst defect lived.

## Three clocks in one run

The run is recorded against three different origins:

- **tool steps** carry `started_at_ms: start_time.elapsed()` from a monotonic
  `Instant` taken at `run_execution` entry (`src-tauri/src/engine/runner/mod.rs:245`);
- **trace spans** carry milliseconds from the trace collector's own epoch,
  created one statement later (`:248`);
- **log lines** carry a wall-clock stamp, `chrono::Utc::now().to_rfc3339()`,
  written as `[{timestamp}] {msg}` (`src-tauri/engine/src/logger.rs:78-80`).

The first two are run-relative and immune to a wall-clock step; the third is
the only one a person can read as a time of day. The client puts step markers
and log silences on one axis, so the technique's single-time-authority rule
applies: the log offsets are measured from the first stamped line, not from
the step clock's origin, and the two origins differ by the time between entry
and the logger's creation (`:276`). Small, and stated nowhere.

## Unclosed items: disclosed on spans, erased on steps

The engine closes what the stream never closed, in two places, and only one
of them keeps the disclosure the technique asks for:

- **spans**: `finalize` force-closes orphans at the run's end and writes
  `span.error = Some("span not properly closed")` (`src-tauri/core/src/trace.rs:398-405`).
  The item is bounded and it says so.
- **tool steps**: `finalize_open_tool_steps` stamps an open step with the
  run's end (`runner/mod.rs:3493-3506`), and the comment is candid that "the
  stamp is therefore indistinguishable from a normally-closed step", because a
  `finalized` flag would have regenerated a ts-rs binding outside that
  change's write set. The client later infers ends for historical rows and
  marks them `inferred_end`; rows the engine closed itself arrive looking
  measured. This is the technique's "a silently repaired timestamp is an
  estimate wearing a measurement's face", created by a write-set boundary.

Eviction is counted rather than hidden (`evicted_span_count`, "non-zero means
the trace is incomplete"). A result pairs to its step by `tool_use_id`,
falling back to the newest open step. Before that pairing, the runner's own
comments record 240 of 2,998 persisted steps left unclosed.

## The reader stripped the tempo off the record

`get_execution_log_lines` (`src-tauri/src/commands/execution/executions.rs:800`)
is the paged reader the Replay tab switched to on 2026-09-17, replacing a
full-file read that could ship 10 MB. It kept only the text after the stdout
tag:

```rust
line.find("[STDOUT] ").map(|pos| sanitize_secrets(&line[pos + 9..]))
```

Every stdout line on disk is `[<rfc3339>] [STDOUT] <text>` (the runner writes
`logger.log(&format!("[STDOUT] {}", ..))`, `runner/mod.rs:2877`), so the
page arrived with its stamps cut off. The client's timestamp parser anchors on
a leading `[`, found nothing, and fell back to spreading lines evenly across
the run. The silence disclosure and skip-silence built on 2026-09-02 were all
still present and all unreachable, and a cancelled run (no `duration_ms`) lost
its timeline entirely. Unit tests stayed green because they fed the parser a
whole stamped log, never the page the command returns.

Measured 2026-09-26 over the 523 stdout-bearing execution logs on the
operator's machine, projecting each file the way the command does and running
the client's own regex and silence rule over the first 500-line page:

| page served | logs with recorded tempo | silences disclosed |
| --- | --- | --- |
| text after the tag (as shipped) | 0 of 523 | 0 |
| stamp kept | 523 of 523 | 3,445, in 520 logs |

The fix (personas `281c02dc3`, on local master, unpushed because master
has diverged from origin) keeps the writer and its reader in one place: `split_stdout_line`
beside `ExecutionLogger` returns the stamp and the text, the command takes an
opt-in `stamped` flag that only the replay sets (the log viewer, run
comparison and session recovery keep the bare text), and the client strips the
stamp from what it displays. A round-trip test writes through the real logger
and parses the stamp back; the client test feeds a page in the shape the
command returns, including chrono's nanosecond `+00:00` form. The new
display-text test fails against the unmodified parser.

## The page is a projection, and it does not say so

The same measurement found the second thing the reader does to the record.
The replay asks for the first 500 stdout lines. 20 of the 523 logs are longer,
and for them the first page covers between 52% and 99% of the recorded span
(median about 85%). Engine lines (`[WARN]`, memory, hooks) are filtered out
before paging. The replay's line counter reads `N/500` with no notice that the
run continued. The technique's derivation rule reaches the reader: a timeline
is derived from what the reader serves, so a page, a filter or a strip between
writer and timeline is part of the derivation and states its coverage. This
one is recorded here and not fixed in this run.

## Why the engine does not ship frames

A Rust `dream_replay` engine once built the replay server-side: full state per
frame, shipped to the client. It was deleted on 2026-08-04 (`a5e8455c8b`)
after a parity run over 2,942 real traces. A 169-span trace produced 338 frames
and a 1,302 KB payload from a 53.6 KB span array, 24 times larger and quadratic
in span count, because every frame carried the full active and completed id
sets. Its cumulative cost was 0.0 until the second-to-last frame, because only
the root span carries cost (0 of 12,791 child spans did). That is
scrub-performance's position-function rule, measured from the losing side:
per-frame materialized state costs payload quadratic in run size, and an
accrual folded from a record that only prices the root is a step function, not
a curve.
