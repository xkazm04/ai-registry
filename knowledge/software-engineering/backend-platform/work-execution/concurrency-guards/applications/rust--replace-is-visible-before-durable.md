---
layer: application
type: application
subject: concurrency-guards
technique: replace-is-visible-before-durable
stack: rust
status: forged
verified_on: 2026-11-06
verified_against: rust@1.99
applied: experiment
ab_verdict: unmeasurable
proof: ab-paired
---

# Rust: three outcomes of a publish, and a directory that will not open on Windows

The version is the compiler this probe ran on, rustc 1.99.1, on Windows. Two trees were read and not run.
`teamleaderleo/glaeda` is Apache-2.0. `melgarafael/lina-space` declares no licence, so it gets line references and our words.

## Opposite defaults

glaeda at `1feddaa1` names four failure points,
`src/unix_personal_worker_store/publication_fault.rs:12 "PublicationDirectorySync,"`, and its test asserts the third outcome,
`src/unix_personal_worker_store/publication_fault_tests.rs:156 "fn directory_sync_fault_reports_error_after_initial_delivery_is_visible() {"`:
an error comes back while the successor is what a reader loads,
`src/unix_personal_worker_store/publication_fault_tests.rs:218 "let expected = if point == PublicationFaultPoint::PublicationDirectorySync {"`.

lina-space at `9b4d57c8` logs that same failure and returns success on a recovery path, where the rebuilt store is already the
only way forward (`crates/lina-core/src/events.rs:2689-2696`). It also flushes a directory only when an append created the file
(`crates/lina-core/src/events.rs:3707-3710`). Both flushes sit behind a Unix-only gate with no comment saying the guarantee is
absent elsewhere.

## The run

A harness of our own, with the fault injected after the rename.

| Arm | Fault at directory step | Failure before the replace | No fault |
| --- | --- | --- | --- |
| A, every error means not published | fresh reader sees the new version; guarded retry fails with a conflict on the writer's own success | not published | published |
| B, classify by what happened | visible, unconfirmed | not published | durable |

Target: the writer's account of a publish its readers can already see, wrong in A and right in B. Floor: the other two cases,
identical in both arms.

`std::fs::File::open` on a directory, on this Windows machine, returned `PermissionDenied`, raw OS error 5. That settles the
question the first miner left open. The plain standard-library path cannot flush a directory here. The other platform's flush
was not exercised on this box.

## The seam

The nearest connected project ships on Windows. One of its publishes writes, flushes, renames and treats every error as not
published, and that is correct for it today, because nothing runs after the rename. So there is no third outcome to mishandle,
and no way to add one through the standard library on its main platform. A daemon lock file in the same project is the When-not
case. Recorded unapplied. It would need a Unix release of that path, or a platform call outside the standard library, and either
is the owner's decision.

## Verdict

`unmeasurable`. The classification is shown on a toy. The harm the directory flush prevents needs a power-loss harness (a faulting
block device, or a virtual machine cut mid-write), and none is on this box. The corpus's claim about the entry rests on the fsync
manual page.

## What this realization cannot do

It cannot show a crash undoing a rename. It shows only what the writer and a reader do when the step after the rename fails.
