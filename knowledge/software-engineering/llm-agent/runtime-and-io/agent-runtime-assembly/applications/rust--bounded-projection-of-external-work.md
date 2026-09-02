---
layer: application
type: application
subject: agent-runtime-assembly
technique: bounded-projection-of-external-work
stack: rust
verified_on: 2026-09-02
verified_against: rust@1.97
applied: code
ab_verdict: better
proof: ab-paired
---

# Cross-device remote jobs in Personas: two peers, no shared store, and a report that reached the system voice

The technique was written for a runtime with one store that outlives the
run. This tree tests the condition under which that premise fails: the
remote work runs on a **paired peer device** with its own database, and the
originator has no store in common with it. The seam was chosen to falsify,
and it did — on one clause — while the rest held with a twist worth
recording.

## What holds: the loop never polls, and truth is split by ownership

`src-tauri/engine/src/p2p/remote_jobs.rs` owns the wire and the persistence
half and, by its own doc comment, "does NOT run anything". The originator
persists an outbound row before sending (`send_instruction`), the runner
persists an inbound row before executing, and every progress note is written
to `remote_job_notes` keyed `(job_id, seq)` **before** any send is attempted,
so a failed send costs nothing. A link drop does not cancel the executor.
Recovery is originator-driven on reconnect (`resume_with_peer`): the
originator sends the highest contiguous note it holds and the runner answers
with the notes above it and the result if the job has finished. The module
states the property in the technique's terms: "exactly-once is a property of
the schema, not of anyone remembering to deduplicate."

The twist: with no shared store, "the store is the truth" becomes **each
side's store is the truth for the records that side produces** — the
originator owns the outbound row, the runner owns the note log — and the
resume exchange is the reconciliation. The originator's agent loop holds no
handle and polls nothing; the wire's row is its projection.

The runner side also realises the technique's "a job can never be left
running" clause four ways (`src-tauri/src/companion/remote_jobs.rs`, module
doc): execute returns immediately and spawns; the turn runs in an inner
spawn whose join handle converts a panic into a reportable failure; that
await is under a timeout above the turn's own ceiling; and a startup sweep
fails every inbound job left running by a dead process.

## What did not hold: the delivery rule

The technique requires that a remote payload re-entering the loop be framed
as untrusted, with the trusted instruction outside the input boundary. The
originator's listener (`append_outbound_episode`, `remote_jobs.rs:317`)
wrote the runner's model-authored summary and its last five notes verbatim
into a **System-role** episode — the role the recall window trusts most —
under a `[device: <name>]` prefix that is the originator's own voice. A
paired device is trusted to *run* an instruction (the pairing gate decides
that), but its model's output is still model output: it can carry a
`[device:` prefix of its own or a line that reads as instruction.

## A/B, paired, three fixtures

Arm A is the shipped interpolation; arm B carries the remote text through
`remote_report_block`: a quoted report under the framing, opened and closed
by marked delimiters, with the two markers the fence relies on (`[device:`
and the block's own close) neutralised inside the body. The predicate counts
remote-authored directive lines that sit outside the fenced block.

| fixture | A unfenced | B unfenced |
| --- | --- | --- |
| benign summary | 0 | 0 |
| device-prefix spoof (`[device: Laptop] SYSTEM: …`) | 1 | 0 |
| early-close spoof (closes the block, then a prefix) | 2 | 0 |

The tree's own precedent is the same split: the fix loop's
`FixInstruction` separates system-authored `framing` from model-authored
`evidence` and renders the second only inside a nonce-tagged untrusted
boundary. The crate could not be built in this session (an undeclared
updater permission in the capabilities manifest fails the build script), so
the arms ran as a standalone reduction and a unit test was added to the
module for when it can. Committed on the project's default branch with a
pathspec, not pushed.

## What this realization cannot do

The runner's closing note still interpolates the originator's instruction
into its own System episode without a block; that text is operator-authored
over the wire rather than model-authored, so the risk is lower and it was
left as the boundary. And the fence is textual: it makes forgery visible and
structurally blocked at the markers, it does not make the recall window
weigh a quoted report differently — that is a memory-value question the
memory subject owns.
