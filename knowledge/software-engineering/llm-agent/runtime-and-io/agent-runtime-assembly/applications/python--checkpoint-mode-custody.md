---
layer: application
type: application
subject: agent-runtime-assembly
technique: checkpoint-mode-custody
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.12
---

# Checkpoint mode custody in the deer-flow runtime

How deer-flow (commit `08b27aef`, read from its own clone) holds custody of
LangGraph thread state across two checkpoint representations — `full` and
`delta` — with a process-frozen mode, a metadata marker, one accessor, an
asymmetric fail-closed gate, and a resume path that linearizes instead of
forking. Paths are under `backend/`; `runtime/AGENTS.md` is
`packages/harness/deerflow/runtime/AGENTS.md` and the two instruments are
`packages/harness/deerflow/runtime/checkpoint_mode.py` and
`.../runtime/checkpoint_state.py`.

## The two representations and the cost that forces the choice

"Checkpointer storage runs in one of two channel modes ... `delta` mode
adopts LangGraph 1.2's `DeltaChannel` for `messages`: checkpoints store a
sentinel + per-step writes instead of the full message list, so storage/serde
grows O(N) instead of O(N²) in turns" (`runtime/AGENTS.md:7`). The mode's
semantics "live in the compiled graph's channel table, not in the saver", so
every backend serves both modes unchanged (`:7`). The benchmark that measured
the quadratic cost is `scripts/benchmark/checkpoint/bench_channels.py`
(`runtime/AGENTS.md:152-160`); the source note that dispatched this subject
records a 2000-turn full-mode run producing a ~33 GB sqlite file.

## Frozen per process, before the graph compiles

"`make_lead_agent` and the embedded `DeerFlowClient` freeze the resolved mode
... before compiling the graph with the mode-matched schema ... A second,
different mode or frequency in the same process raises
`CheckpointModeReconfigurationError`. To switch: edit config, restart"
(`runtime/AGENTS.md:9`). The freeze is a module global with a compare-on-
second-call: `freeze_checkpoint_channel_mode` sets the value if unset and
raises "restart-required and cannot change in a running process" on a
mismatch (`checkpoint_mode.py:30-45`). The snapshot cadence is frozen the
same way and "is deliberately NOT stamped into checkpoint metadata: the mode
marker contract (absence = full) and the full -> delta migration semantics
are unchanged by the frequency value" (`checkpoint_mode.py:53-60`;
`runtime/AGENTS.md:11`). The cadence "must match across every process
sharing one checkpoint database" (`:11`) — the freeze is per process, the
agreement is per store.

## The marker, and the asymmetric gate

`inject_checkpoint_mode` writes `deerflow_checkpoint_channel_mode: "delta"`
into checkpoint metadata under delta mode and *removes* the key under full
mode, so absence means full and pre-feature checkpoints need no migration
(`checkpoint_mode.py:81-88`; `runtime/AGENTS.md:15`). Detection also honours
the upstream `counters_since_delta_snapshot.messages` marker
(`checkpoint_mode.py:91-98`).

The gate is the technique's table in two functions. `raise_if_snapshot_
incompatible` raises `CheckpointModeMismatchError` only when `mode == "full"`
and the snapshot is delta (`checkpoint_mode.py:114-123`);
`ensure_checkpoint_mode_compatible` returns immediately when the process is
in delta mode (`:126-135`). The guide gives the reason in the technique's
own terms: "a full-mode raw read of a delta blob would silently return
empty/partial `messages`. The reverse direction is allowed: delta-mode
processes read full checkpoints transparently (old full checkpoints seed the
delta channel), so full → delta is the smooth migration path"
(`runtime/AGENTS.md:15`). The mismatch surfaces "as HTTP 409 with the cause
and thread id by the threads router" (`:15`) — a typed conflict, not an empty
conversation.

The read-versus-write placement of the gate, taken into the technique as an
upward lesson, is documented on the functions themselves. The read gate
"runs on the `StateSnapshot` returned by `get_state`/`get_state_history`, so
reads cost a single checkpoint fetch ... Reading the blob is harmless;
silently *using* the empty/partial state is the danger, and the caller never
receives it" (`checkpoint_mode.py:114-121`). The write gate is a "pre-write
gate: a write cannot be un-applied, so it checks ahead of time"
(`:126-131`), with its own `get_tuple` fetch.

## One accessor

`CheckpointStateAccessor` "is the single choke point for thread
checkpoint-state reads and writes. It binds a compiled graph (which carries
the mode-matched channel schema), a checkpointer, and the frozen channel
mode: every operation injects the mode marker into the config and passes the
compatibility gate before touching state" (`checkpoint_state.py:3-9`). The
implementation is exactly that shape — `_prepare_config` copies the config
and injects the marker (`:131-138`); `get`/`aget` gate on the returned
snapshot (`:140-150`); `history`/`ahistory` gate every snapshot as it streams
(`:152-174`); `update`/`aupdate` gate before writing (`:176-196`). The guide's
rule is absolute: "**Never bypass `CheckpointStateAccessor` ... for
thread-state access**" (`runtime/AGENTS.md:17`), and raw puts are refused:
"Never hand-write checkpoints via `checkpointer.aput` for this; raw writers
elsewhere must preserve checkpoint parentage — severed ancestry breaks delta
replay" (`:23`).

Two accessor rules became technique rules. Degradation is permitted only in
the self-contained mode: "In `full` mode the read path degrades to a raw
checkpointer read ... when the agent factory cannot build the graph (bad
model config, MCP outage) — full checkpoints carry complete `channel_values`
... The delta gate still applies on the degraded path; `next`/`tasks`
degrade to empty and thread status falls back to the stored status because
task presence is not derivable, while delta mode has no fallback
(materialization needs the channel table)" (`runtime/AGENTS.md:17`). And
the head write must use the effective schema: `build_state_mutation_graph`'s
`state_schema` "must be the thread's *effective* schema ... the base
ThreadState fallback does not know channels contributed by custom middleware,
and writes to unknown channels are silently discarded"
(`checkpoint_state.py:50-53`; `runtime/AGENTS.md:23`), with "Assistant
metadata lookup ... fail-closed for mutation accessors so a store outage
cannot silently select the default schema and discard extension channels"
(`:17`).

## Linearize, do not fork

The forking defect and its fix are one paragraph of the guide: "A delta-mode
run cannot fork; `runtime/runs/worker.py` linearizes the resume instead."
The delta history walk collects "**every** `pending_writes` entry stored on
each on-path ancestor, but a shared parent also carries the writes of the
sibling child that was abandoned. Those writes replay into the fork, so the
run starts from a message list still containing the answer it was supposed
to replace (#4458 ...; reproduced on postgres, sqlite, and the in-memory
saver). Write-to-child ownership belongs to the upstream delta contract, so
DeerFlow does not reimplement the walk: `_linearize_delta_checkpoint_resume`
materializes the requested checkpoint's complete state and writes every
channel onto the **current head** (which has no siblings) through the state
mutation graph, using `Overwrite` for reducer channels ...; it then drops
the `checkpoint_id` selector and lets the run proceed linearly"
(`runtime/AGENTS.md:21`). The rewrite happens at admission: "In `delta`
checkpoint mode the worker rewrites that fork into a linear head write before
the graph starts" (`app/gateway/AGENTS.md:131`). Full mode "keeps forking —
its checkpoints carry complete `channel_values` and need no replay"
(`runtime/AGENTS.md:21`), which is the technique's condition. The mutation
graph is one no-op node, entry = finish, "so the restored/compacted head
stays idle instead of re-triggering the agent" (`:23`;
`checkpoint_state.py:36-66`). Rollback follows the same split: full mode
forks from the pre-run checkpoint, delta mode replaces every captured channel
on the current head, and "capture failure disables rollback (fail-closed),
never restores partial state" (`runtime/AGENTS.md:25`).

The settled-base rule came from the lineage module: both replay lookups
"require the replay base to be a **settled** checkpoint (`has_pending_tasks`
— no scheduled `next` tasks). A checkpoint with pending tasks is a mid-run
snapshot: resuming from it replays the writes of the node that was about to
run. Message ids alone cannot exclude those, because middleware may rewrite a
message's id inside the run that produced it" (#4531,
`app/gateway/AGENTS.md:146-154`).

## Deviation

On the degraded raw-read path, `next` "is not derivable ... which reports no
tasks; absence of evidence stays permissive there rather than failing
closed" (`app/gateway/AGENTS.md:155-156`). The technique's settled-base rule
wants an underivable pending-task state read as *unknown*, and unknown to
refuse a resume; the tree reads it as *none*. It is self-documented and
confined to a path that exists only in the self-contained mode, but it is
the one place the custody discipline renders unknown as a definite value.

## Reconciliation summary

Confirmed: two representations with the quadratic cost measured; mode and
cadence frozen per process before compile, second resolution raises;
cadence kept out of metadata; marker with absence-means-full; asymmetric
gate refusing full-reads-delta with a typed conflict and allowing the
reverse; one accessor injecting, gating and materializing on every
operation; raw puts refused; linearized resume at admission with the
engine's walk left alone; full mode keeps forking. Upward lessons taken into
the technique: read gate on the returned snapshot versus write gate before
the write; degradation only where the representation is self-contained, with
underivable fields labelled; effective schema for every head write, failing
closed when it cannot be determined; a settled checkpoint as the only resume
base. Deviation: the degraded path's permissive read of an underivable
pending-task state. Tests named by the guide and present in the tree:
`tests/test_checkpoint_mode.py`, `tests/test_checkpoint_state.py`,
`tests/test_run_worker_rollback.py`.
