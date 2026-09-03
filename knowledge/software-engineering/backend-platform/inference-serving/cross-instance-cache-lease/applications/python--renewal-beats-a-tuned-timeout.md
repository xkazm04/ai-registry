---
layer: application
type: application
subject: cross-instance-cache-lease
technique: renewal-beats-a-tuned-timeout
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.12
---

# Lease renewal for disaggregated prefill in a Python inference engine

The exemplar is the vLLM inference engine at commit
`facd9a74a1cd1b9fed324cdc2cceb8d54fdad3d0`, whose NIXL connector holds KV cache
blocks on a prefill instance (P) until a decode instance (D) has read them over
RDMA. The design note is `docs/design/nixl_kv_cache_lease.md`; the mechanism
lives in `vllm/distributed/kv_transfer/kv_connector/v1/nixl/base_scheduler.py`
and `.../nixl/base_worker.py`.

## The two failure modes, stated as a pair in the design note

`docs/design/nixl_kv_cache_lease.md:7-17` is the standard's argument almost
verbatim, and it names both directions before proposing anything:

- *The single-timeout problem* (`:9`): the original design used one large
  timeout, `VLLM_NIXL_ABORT_REQUEST_TIMEOUT`, defaulting to **480 seconds**.
  "When D crashed or disconnected, P would hold onto potentially several GBs of
  'dead' blocks for up to 8 minutes before reclaiming them. During this window,
  subsequent requests hitting P would find reduced cache capacity and experience
  degraded performance." That is the standard's *invisible* failure: a latency
  regression with no error.
- *The overloading problem* (`:13`): "Simply lowering the timeout introduces a
  different failure mode. Under traffic surges, requests can sit in D's waiting
  queue for a long time before being scheduled... blocks get freed before D ever
  has a chance to read them — causing unnecessary recomputation and wasted
  prefill work."

The obvious move is named and rejected in the document itself, which is why
this is a usable exemplar rather than an accident: the resolution at `:17` is a
short initial lease plus renewal, "short for the dead case and unbounded for
the slow case", with no number left between them.

## The derivation, in two constructors

The three constants are one constant and two ratios, exactly as the technique
requires — and, notably, the ratios are hardcoded rather than exposed, with a
comment saying so:

```python
# base_scheduler.py:75-81
self._kv_lease_duration: int = (
    vllm_config.kv_transfer_config.get_from_extra_config("kv_lease_duration", 30)
)
# NOTE (NickLucche): For now we use a hardcoded value for a simpler interface.
self._heartbeat_interval = self._kv_lease_duration // 6
```

```python
# base_worker.py:325-329
kv_lease_duration: int = vllm_config.kv_transfer_config.get_from_extra_config(
    "kv_lease_duration", 30
)
self._lease_extension = kv_lease_duration * 2 // 3
```

30 seconds initial, renew every 5, extend by 20. Four renewal attempts fit
inside one extension, which is what licenses the best-effort send below. The
configuration table (`docs/design/nixl_kv_cache_lease.md:122-125`) documents the
derivation as derivation — "Heartbeat interval and extension amount are derived
automatically" — so an operator who raises `kv_lease_duration` to 60 moves all
three numbers together and cannot desynchronize them.

## The initial grant is sized for the dead case only

Note what the default did *not* become. The old single timeout was 480s and had
to cover slow collection; the new initial lease is 30s and covers only "how long
may a crashed D strand this". The 480s value survives in the tree, but for the
other retention case — `decoder_kv_blocks_ttl`, discussed in the clock
application — where no renewal is possible.

## Reclaim, and what the expiry log records

The sweep runs in `base_worker.py:2312-2330`, inside the same per-step call that
processes transfers:

```python
now = time.perf_counter()
while self._reqs_to_send:
    req_id, expires = next(iter(self._reqs_to_send.items()))
    # Sorted dict, oldest requests are put first so we can exit early.
    if now < expires:
        break
    count = self.consumer_notification_counts_by_req.pop(req_id, 0)
    self.xfer_stats.record_kv_expired_req()
    logger.warning(
        "Releasing expired KV blocks for request %s which were "
        "retrieved by %d remote worker(s) before lease expired.",
        req_id, count,
    )
```

Two things the standard asks for are present: expiry is a **counted, distinct
outcome** (`record_kv_expired_req`, separate from the collected path), and the
warning carries how many remote workers had already pulled — the partial-fanout
diagnostic. What is absent is a reclaim margin: the comparison is `now <
expires` with no slack for a renewal in flight, and the safety comes entirely
from the 4:1 ratio between interval and extension rather than from an explicit
margin at the reclaim site. The standard keeps the margin.

The early-`break` comment is worth reading against
`monotonic-renewal-never-shortens`: the dict is ordered by insertion, and a
renewal writes through an existing key without reordering it, so after any
renewal the head is no longer the earliest deadline. The consequence is delayed
reclaim of items behind a renewed one — the safe direction, and a bound the
comment does not state.

## Batching and best-effort send

`_send_heartbeats` (`base_worker.py:2442-2475`) builds one message per remote
engine — `"HB:" + ",".join(hb_info.req_ids)` — so N in-flight requests against
one P cost one notification per interval, and the send is wrapped in a
`try/except Exception` that logs at `debug` and continues. A dropped renewal is
one of four; the derivation is what makes the swallow defensible, and the two
decisions should be read together.

Transport reuse is stated as a design decision rather than an accident
(`docs/design/nixl_kv_cache_lease.md:110`): heartbeats ride the existing
`send_notif`/`get_new_notifs` notification system "rather than adding ZMQ
connections or API changes", inheriting its backend fallback so renewal works
on every deployment the transfer works on.

## What this tree does not do

No fencing or generation token exists on the lease, and none is needed here:
the collector performs an RDMA **read** and mutates nothing on the holder, so a
stalled D that resumes after expiry finds blocks gone rather than blocks
reassigned under it. The standard's fence requirement applies from the moment a
write path is added, and the read-only property is the reason it can be
deferred — a fact worth recording next to the lease rather than rediscovering.
