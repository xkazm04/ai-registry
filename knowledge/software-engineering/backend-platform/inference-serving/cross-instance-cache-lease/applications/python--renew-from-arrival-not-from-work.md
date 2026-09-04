---
layer: application
type: application
subject: cross-instance-cache-lease
technique: renew-from-arrival-not-from-work
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Hooking renewal into the scheduler's admission path, not its execution path

Same tree as the sibling application: vLLM at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`. The decode-side connector renews
the prefill instance's KV lease, and the whole point of this application is
*where* it is wired.

## The insight is stated as an insight

`docs/design/nixl_kv_cache_lease.md:35`:

> A critical insight is that heartbeating must start **as soon as a request
> enters D's scheduler** — not when it gets scheduled for execution. Under heavy
> load, a request may sit in the waiting queue for much longer than the initial
> lease duration, and the gap between arrival and scheduling is unbounded.

The document promotes the wiring decision to a named insight rather than
leaving it as a call-site detail, which is the correct treatment: the wrong
wiring passes every test that does not build a backlog.

## Admission hook

`base_scheduler.py:196-235`, `on_new_request`, runs when a request enters the
waiting queue:

```python
def on_new_request(self, request: "Request") -> None:
    """Track a request that may need heartbeats."""
    params = request.kv_transfer_params
    ...
    if params is None or not params.get("do_remote_prefill"):
        return
    remote_engine_id = params.get("remote_engine_id")
    ...
    if remote_engine_id not in self._heartbeat_by_engine:
        self._heartbeat_by_engine[remote_engine_id] = HeartbeatInfo(...)
    self._heartbeat_by_engine[remote_engine_id].req_ids.add(remote_request_id)
    self._heartbeat_req_engine[request.request_id] = (
        remote_engine_id, remote_request_id,
    )
```

Two maps: peer to item set (the batching unit) and item to peer (the stop
index). The peer identity arrives in `kv_transfer_params` from the router, so
this tree does not hit the technique's *when not to use* case where the peer is
unknown until scheduling — routing has already chosen P before D ever sees the
request.

## One tick, both phases

Renewal is emitted from `build_connector_meta` (`base_scheduler.py:479-485`),
which runs once per scheduler step over the whole tracked set, waiting and
running alike — there is no handoff at the moment a request is scheduled, and
therefore no gap:

```python
# Package heartbeats, throttled by heartbeat_interval.
if self._heartbeat_by_engine:
    now = time.perf_counter()
    if now - self._last_heartbeat_time >= self._heartbeat_interval:
        self._last_heartbeat_time = now
        meta.heartbeat_by_engine = self._heartbeat_by_engine
```

The throttle is one global timestamp rather than per-peer, so all peers renew
on the same tick — a coarser but simpler schedule than per-peer timers, and
adequate because the interval is a quarter of the extension.

## Deferred, not blocking, first renewal

`_send_heartbeats` (`base_worker.py:2442-2460`) is the technique's "let the
first renewal be deferred" step, with the reason in the comment:

```python
# Proactive handshake (this request may still be in waiting queue) so
# the **next** heartbeat for this remote can go through.
if (self._ensure_handshake(...)) is not None:
    continue  # handshake is still pending
```

The loop starts the handshake off-thread and skips this tick for that peer. The
design note (`:98`, `:114`) records the side benefit the technique predicts:
"the early handshake also **speeds up the eventual KV transfer**" — the correct
choice is also the faster one, because the queueing window is free time and the
handshake would otherwise sit on the first transfer's critical path.

## Every exit, and the tracking structure's own reaper

`_stop_heartbeat` (`base_scheduler.py:237-245`) is called from
`update_connector_output` when the transfer completes and from
`request_finished` on finish or abort, and it reaps the container as well as
the entry:

```python
if info := self._heartbeat_by_engine.get(engine_id):
    info.req_ids.discard(remote_id)
    if not info.req_ids:
        # Clean up empty engines so we don't leak a key when remote dies.
        del self._heartbeat_by_engine[engine_id]
```

That comment is the technique's step 6 written by someone who hit it: without
the empty-set delete, a long-lived decode instance accumulates one dead peer
entry per prefill instance it ever spoke to, and every renewal tick walks them.

## Where the standard is not met

The exit set covered here is completion, finish and abort. Preemption back out
of execution is not separately handled, because tracking is keyed on the
request rather than on its scheduling state — which happens to give the right
behaviour (a preempted request stays tracked) for a reason the code does not
state. A reader adopting this pattern in a scheduler where preemption clears
per-request connector state should enumerate the queue states explicitly, as
the technique's decision rules require.
