---
layer: application
type: application
subject: serving-process-topology
technique: hot-loop-isolation
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Hot-loop isolation in a Python inference engine

Citations are to `vllm-project/vllm` at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`, whose `docs/design/` tree states the
split in its own words before the code demonstrates it.

## The sentence exists, and it is in the design record

`docs/design/metrics.md:135-152` writes the split out explicitly, and it is worth
quoting because most systems never say it:

> - EngineCore is the inner loop. Performance is most critical here
> - AsyncLLM is the outer loop. This is overlapped with GPU execution (ideally),
>   so this is where any "overheads" should be if possible.

The stated goal on the preceding lines is "to move computation and overhead out
of the engine core process to minimize the time between each forward pass" — the
period is the inter-forward-pass gap, and the product figure it multiplies into
is inter-token latency. That is the technique's Step 1 artifact, written down
before any boundary argument.

## What leaves the loop

`docs/design/arch_overview.md:68-133` assigns the API server process "HTTP
requests (e.g. the OpenAI-compatible API), input processing (tokenization,
multi-modal data loading), and streams results back to clients". Tokenization and
multi-modal loading are the Step 2 "touches payloads only" class, and they are
the largest per-request CPU cost in the system; detokenization returns the same
way. The engine core process keeps "the scheduler, KV cache management, and
coordination of model execution across GPU workers" — the ordering-required core
and nothing else.

Metrics follow the same rule rather than an exception to it: the frontend derives
them from the `EngineCoreOutputs` the engine core was already returning, so the
inner loop ships events and never computes a rate.

## The boundary, in code

`vllm/v1/engine/core.py` carries the loop. `EngineCoreProc.run_busy_loop` (line
1411) is two calls per iteration — `self._process_input_queue()` then
`self._process_engine_step()` — and both queues are plain in-process
`queue.Queue` objects (lines 1046-1047) fed and drained by separate socket
threads, so the loop never touches a socket.

The non-blocking rule is implemented as the asymmetry the technique describes,
not as a spin. `_process_input_queue` (line 1437) returns immediately when the
queue is empty *and* there is work in flight; when the engine is idle it sets
`process_input_queue_block` (line 1090) and blocks on the queue instead. The
comment at lines 1341-1344 records the deadlock this creates and its fix — a
shutdown request wakes the idle loop by pushing a `WAKEUP` sentinel onto
`input_queue`, because signalling it any other way would need the queue's own
non-reentrant mutex.

Crossings are per-iteration, not per-request: `_process_engine_step` puts one
`EngineCoreOutputs` batch per step (line 1475), covering every request that
advanced.

## Typed death across the boundary

`core.py:1642` puts `EngineCoreProc.ENGINE_CORE_DEAD` on the output queue on the
way out. The outer half reads it from the channel it was already reading, so
every in-flight request fails with the real cause instead of waiting on a queue
that has silently stopped producing. This is
[verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)
applied to the one verdict that would otherwise present as a hang.

## Reaping, without trusting the parent's handlers

`vllm/v1/executor/multiproc_executor.py` builds the pipe construction the
technique names. `WorkerProc.make_worker_process` creates `death_reader,
death_writer = context.Pipe(duplex=False)` (line 719), passes the reader to the
child as `death_pipe` (line 730), closes the reader in the parent (line 752), and
keeps the writer open with the comment at 753-754: when the parent exits, the
child's read end raises `EOFError`. Graceful shutdown closes the same writer
(lines 515-518, 259-263), so orderly stop and parent death are one mechanism.

The wait escalates rather than hanging: a grace period (line 473), then `SIGTERM`
with a log line naming what is still running (line 485), then a hard kill (line
495). `weakref.finalize(self, self.shutdown)` at line 121 makes the path
reachable from interpreter teardown as well as from a signal.

## Many-to-many, and a derived default

`docs/design/arch_overview.md:74-80` states that each API server connects to
**all** engine cores "in a many-to-many topology, enabling any API server to
route requests to any engine core", and that the API server count "automatically
scales to match the data parallel size" while remaining overridable with
`--api-server-count`. That is the technique's Step 4b in both halves: the two
sides are sized independently, and the outer pool's default is derived from the
inner count rather than fixed.

## What this stack does not demonstrate

The design record's own note at `docs/design/multiprocessing.md:11` flags that its
source references are to the code as of December 2024, and several line anchors
in that document no longer resolve in this tree. The rule the technique states —
citations decay faster than the standard does — is visible in the source itself.
