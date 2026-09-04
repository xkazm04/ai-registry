---
layer: application
type: application
subject: metric-surface-contract
technique: same-process-monotonic-intervals
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Stamped events across a process boundary in an LLM inference engine

An open-source LLM inference engine splits serving into an inner scheduling loop
(`EngineCore`, its own process) and an outer frontend loop (`AsyncLLM`, the API server
process) — and publishes every request-latency metric from the outer one. Citations are
against `vllm-project/vllm` at commit `facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`, files
`docs/design/metrics.md`, `vllm/v1/engine/__init__.py`, `vllm/v1/metrics/stats.py`.
This is the technique's rule in a system that had no choice about it: the two loops are
two operating-system processes, so their monotonic clocks have different origins.

## 1. The rule, stated in the design record, then enforced in a docstring

`docs/design/metrics.md:153-162` states it in three sentences: use monotonic time rather
than wall-clock time because the latter moves under time sync; monotonic clocks "differ
between processes — each process has its own reference point"; "therefore, in order to
calculate an interval, we must compare two monotonic timestamps from the same process."

The rule then lives where a maintainer will trip over it. `EngineCoreEvent`
(`vllm/v1/engine/__init__.py:177-193`) is a three-field struct — type, timestamp,
factory — whose docstring says the timestamp "is a monotonic timestamp and is used by
the engine frontend to calculate intervals between engine core events. These timestamps
should not be compared with timestamps from other processes." `new_event` defaults the
stamp to `time.monotonic()` taken in the emitting process (`:192`). The transport is a
field on the value the inner loop already returns: events ride on `EngineCoreOutput`,
and the batch-level generation moment is a single `timestamp` on the enclosing
`EngineCoreOutputs`, defaulted in `__post_init__` (`:281`) so one clock read serves
every request in the iteration.

## 2. The rejected alternative is written down, with the reason

`docs/design/metrics.md:218-227`: "We explored the possibility of having the frontend
calculate these intervals using the timing of events visible by the frontend. However,
the frontend does not have visibility into the timing of the `QUEUED` and `SCHEDULED`
events and, since we need to calculate intervals based on monotonic timestamps from the
same process ... we need the engine core to record timestamps for all of these events."

Two of the four events are invisible downstream, which is exactly the case the technique
names: a reconstruction would not have been imprecise, it would have folded queueing time
into processing time. Recording the rejection is what stops it being re-proposed.

## 3. The event vocabulary is closed and tiny

`EngineCoreEventType` (`vllm/v1/engine/__init__.py:169-174`) is an `IntEnum` of three
members — `QUEUED`, `SCHEDULED`, `PREEMPTED` — plus the batch-level new-tokens moment
carried separately. Every published interval is a difference of two of them
(`docs/design/metrics.md:196-205`): queue is queued→scheduled, prefill is
scheduled→first tokens, decode is first→last tokens, inference is scheduled→last tokens,
inter-token is between successive token events. No duration is shipped by the inner
loop; only stamps.

`IterationStats.update_from_events` (`vllm/v1/metrics/stats.py:506-529`) is the whole
consumer: a three-branch loop that assigns `queued_ts`, assigns `scheduled_ts`, and
counts preemptions. The arithmetic happens once per request at completion in
`update_from_finished_request` (`:531-560`), in the outer process, from stamps that all
came from the inner one.

## 4. The caller-anchored interval is anchored at the boundary — deliberately

Time-to-first-token and end-to-end latency are **not** derived from the inner loop's
events. Both are computed against `req_stats.arrival_time` (`stats.py:471`, `:540`) —
the frontend's own stamp, which `docs/design/metrics.md:262-266` says starts when
tokenization begins, "in order to account for input processing time". The same-process
rule still holds: `_time_since` (`stats.py:451-453`) subtracts from
`self.iteration_timestamp`, another frontend stamp. Two families, two anchors, both
internally consistent — the technique's rule 5, realized.

## 5. Where the document and the code disagree — read this as the warning

`docs/design/metrics.md:196-200` defines the queue interval as ending at the "most
recent `SCHEDULED`" and prefill as starting from it, i.e. a preempted request's phase
clock restarts. The implementation does the opposite: `stats.py:522-524` keeps the
**first** scheduled stamp (`if req_stats.scheduled_ts == 0.0:  # ignore preemptions`),
and the comments at `:545-557` say so explicitly — "Any preemptions during prefill is
included in the interval", and likewise for decode and inference.

Both are defensible policies; they produce different distributions from the same system,
and a document and its code that state opposite ones is precisely the drift the technique
warns about. The code's comments are the more trustworthy artifact here because they sit
at the arithmetic. The standard is unchanged: pick one attribution rule, write it beside
each interval's definition, and make the two agree — this tree has done the first two and
not the third.

A second, smaller instance: `docs/design/metrics.md:245-250` says preemption during
prefill affects the first-token interval, but first-token latency is measured from the
frontend's arrival time and therefore includes preemption regardless of what the inner
loop reports.
