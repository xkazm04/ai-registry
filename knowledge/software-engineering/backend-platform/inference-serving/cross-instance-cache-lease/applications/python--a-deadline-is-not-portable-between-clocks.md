---
layer: application
type: application
subject: cross-instance-cache-lease
technique: a-deadline-is-not-portable-between-clocks
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Rebasing a `perf_counter` deadline across two engine processes

Same tree and commit as the sibling applications: vLLM at
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. Python's `time.perf_counter()` is
monotonic with an *undefined* reference point — the documentation guarantees
only that differences within one process are valid — so a `perf_counter` value
that crosses a process boundary is a number in a foreign unit system. This tree
hits the problem twice and solves it the same way both times.

## Where the foreign deadline appears

The renewal path never sends an absolute deadline: heartbeats carry request ids
only (`"HB:req1,req2"`, `base_worker.py:2442-2470`) and the receiver computes
`time.perf_counter() + self._lease_extension` on its own clock — the
technique's preferred "send durations, not deadlines".

The correction is needed for the *other* retention case. In bidirectional
transfer, D caches blocks that P may pull on a later conversational turn, under
a plain `decoder_kv_blocks_ttl` (default 480s) because "the timing of the next
conversational turn is client-dependent (not controlled by the system)" and no
renewal is possible (`docs/design/nixl_kv_cache_lease.md:104`). D communicates
the expiry time back so P knows when to recompute — and that expiry is a
`perf_counter` reading from D's process. The same note states the fix in one
sentence: P "estimates the clock offset to D from the handshake round-trip and
applies it before comparing the deadline against its own `perf_counter`".

## The estimate, from a round trip already paid for

`base_worker.py:770-782`, inside the handshake exchange:

```python
start_time = time.perf_counter()
sock.send(msg)
reply_parts = sock.recv_multipart()
recv_time = time.perf_counter()
...
remote_perf = msgspec.msgpack.decode(reply_parts[1])
rtt = recv_time - start_time
if rtt < best_rtt:
    best_rtt = rtt
    best_offset = remote_perf - (start_time + recv_time) / 2
```

Two properties worth transplanting. The offset is the midpoint estimate the
technique specifies, computed from a handshake that had to happen anyway — no
extra message, no clock service. And it is a **best-of-N by lowest round trip**
rather than a last-write: the handshake speaks to several remote ranks, and the
estimate's error is bounded by round-trip asymmetry, so the fastest exchange is
the best sample. The `if rtt < best_rtt` guard is one comparison that keeps a
tail-latency sample from setting the offset for the whole connection.

## Stored per peer, dropped with the peer

The offset lives in `self._engine_clock_offset: dict[EngineId, float]`
(`base_worker.py:434-435`) — keyed by peer, never global — and is populated on
handshake completion alongside the remote agent map
(`base_worker.py:1039-1042`). On engine eviction it is discarded with an
explicit comment (`base_worker.py:2786-2787`):

```python
# Drop the cached clock offset; it is re-measured on the next handshake.
self._engine_clock_offset.pop(engine_id, None)
```

That is the technique's "re-estimate on reconnect, and only on reconnect": a
restarted peer has a new `perf_counter` origin, so a surviving offset would be
a confident wrong answer, and the invalidation is tied to the same event that
invalidates the agent handles.

## The boundary people forget is a boundary

The scheduler process and the worker processes are the same deployment, the
same release, often the same host — and still different clock domains. The
scheduler therefore stamps its own reading into the per-step metadata
(`base_scheduler.py:470-474`) so workers can rebase the deadlines it sends:

```python
meta.reqs_to_send = self._reqs_need_send
# Clock reference for reqs_to_send: deadlines above are in this
# process's perf_counter domain; workers (possibly on other nodes,
# where perf_counter has a different epoch) rebase against this.
meta.scheduler_clock = time.perf_counter()
```

This is the technique's one-way-message variant: no round trip is available on
a fan-out message, so the sender ships the reading of the clock that produced
the deadline and lets each receiver rebase. The comment naming the domain in
the same breath as the field is what stops the next author comparing it
directly.

## Where the standard goes further

The tree does not record the estimate's error bound, nor derive the reclaim
margin from observed round-trip asymmetry — the margin is implicit in lease
durations that are seconds against round trips that are sub-millisecond. That
implicitness is safe here and would not survive a wide-area deployment; the
technique keeps the explicit derivation.
