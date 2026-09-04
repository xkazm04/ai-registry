---
layer: application
type: application
subject: execution-state-checkpointing
technique: the-record-outlives-the-rewind
stack: process
status: forged
verified_on: 2026-09-04
---

# A self-modifying agent's state-by-reset matrix

Citations resolved against `github.com/exoharness/exo` at commit `7801005`.
The system is an agent harness that can rebuild and restart itself and can
rewind the sandbox it does its work in, which makes it the exact case this
technique is about: the thing performing the reset is the thing whose memory is
at risk.

## The matrix

`docs/SELF-CONTROL.md:54-65` is the artifact. Eight rows — code and prompts,
conversation history and event log, agent artifacts, adapter and scheduler
records, secrets, local profile memory, the sandbox filesystem, worker
connections — against four columns: where it lives, **survives sandbox
rewind**, **survives service restart**, and **checked in**.

Two columns of reset is what makes it a table rather than a sentence, and the
table earns its keep in exactly the two cells where the columns disagree. The
sandbox filesystem is `**no** (that is the point)` under rewind and `yes (warm
sandbox)` under restart. Worker connections are `yes` under rewind and `**no**
(reconnect after drain)` under restart. Every other row is `yes/yes`. A single
"what a rewind captures" paragraph could not have expressed either
disagreement, and those two rows are the whole reason the document exists.

The `checked in` column is the reproducibility column the technique asks for:
only the code-and-prompts row carries `yes`, which is what makes the last
operating rule — secrets are "the one category that cannot be casually copied
or recreated" — derivable rather than asserted.

## The rules are read off the table

`SELF-CONTROL.md:67` states them in one sentence each, and each traces to a
cell: preserve the durable directory unless the user asks otherwise; **never
store durable memory only in the sandbox filesystem (it is the one resettable
layer)**; put user-specific memory in the local profile and behavioural changes
in checked-in prompts; treat secrets as uncopyable. The second is this
technique's central rule, and it is stated as a consequence of the one row
whose rewind cell reads `no`.

## The trail, and the rewind inside it

`SELF-CONTROL.md:69` names the append-only conversation event log as the record
that answers "what happened to me, and what have I already tried?" — explicitly
"especially after rolling back sandbox state, when the filesystem no longer
reflects past attempts."

Host actions write into the *same* log rather than into side channels: the
adapter runner appends `host_reboot` when it claims a reboot notice,
`adapter_runner_started` on every start, `adapter_runner_draining` on a
graceful drain, and `rebuild_and_restart_exo` when a deferred self-update
finishes. `SELF-CONTROL.md:69` also records the inference this buys — "a start
without a preceding `host_reboot` implies a crash or manual restart" — which is
available only because both entry kinds are in one ordered log.

`SELF-CONTROL.md:75` states the non-truncation property directly: `rewind_sandbox`
restores sandbox filesystem state and "does not roll back conversation events,
artifacts, adapter records, scheduler records, or secrets." The record-first
ordering is in the tool implementations:
`crates/executor/src/harness_tool.rs:561-618` emits
`EventData::SandboxSnapshotted { sandbox_id, snapshot_id }` into the active
turn as part of the snapshot tool, and `:620-690` emits
`EventData::SandboxStarted { sandbox_id, snapshot_id: Some(..) }` in the same
turn that performs the rewind — so the reset is an entry in the history it is
resetting around, naming the capture it restored.

`SELF-CONTROL.md:76` adds the second durable axis: version control is "the
second immutable log", because the repository mount is host-backed and survives
the rewind.

## The gap is in the table, not omitted from it

`SELF-CONTROL.md:78` publishes what the trail does not yet cover: host events
come from the adapter runner only, the scheduler runner and the control loop do
not write start/drain/crash entries, and there is no cross-conversation event
stream. This is the practice the technique now names as a rule — a coverage hole
that is written down is a hole a reader can compensate for, while an omitted one
reads as an absence of events.

## Testing one cell with two signals

`crates/cli/tests/snapshot_round_trip.rs:120-190` is the two-signal test. After
capture, phase 3 makes two independent mutations — overwrites `/tmp/demo.txt`
to "version 2" and creates `/tmp/post-snapshot.txt` — with the comment naming
why there are two. Phase 5 asserts both: the overwritten file reads "version 1"
again, and `test -f /tmp/post-snapshot.txt` returns non-zero. The pairing is
what pins the boundary; either assertion alone is satisfiable by a reset that
did nothing or by one that wiped everything.

## Two deviations

`exoharness/docs/sandbox-snapshots.md:275-279` records that captures have **no
reaper**: "There is no GC. Snapshots remain on disk until the conversation
directory is deleted." Captures are whole machine images and the largest
created resource in the system, so this is the row where an unowned cleanup
costs the most; the standard stays.

`exoharness/docs/sandbox-snapshots.md:247-258` records that captures can only be
taken of sandboxes acquired in the current process, because the running-sandbox
map is per-process. The trail therefore has a shape the matrix does not show: an
environment that survives a service restart cannot be captured after one, which
is a cell the table would have exposed had the columns been crossed for the
capture operation as well as the reset operations.
