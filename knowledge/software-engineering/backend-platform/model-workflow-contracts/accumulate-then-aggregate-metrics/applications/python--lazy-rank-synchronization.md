---
layer: application
type: application
subject: accumulate-then-aggregate-metrics
technique: lazy-rank-synchronization
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Lazy rank synchronization — MONAI's `Cumulative` buffer and `evenly_divisible_all_gather`

MONAI (Project-MONAI/MONAI, pinned at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`,
`requires-python = ">=3.10"` in `pyproject.toml:20`) gives every cumulative metric one
base class, `Cumulative` (`monai/metrics/metric.py:125-293`), whose whole job is the
accumulate-then-aggregate seam: local per-sample buffers, a gather that runs once and
lazily, a cached union, and detached reads. This document traces the sync path and the
two entry points that trigger it, and names what the base class does not do.

## The buffers and the flag

`Cumulative.__init__` (`metric.py:183-192`) holds three fields: `_buffers` (a list of
per-buffer lists of per-sample tensors), `_synced_tensors` (the cached union), and
`_synced`, the flag. `reset` (`metric.py:194-201`) clears all three.

`extend` (`metric.py:203-225`) is the per-batch append. It allocates one buffer per
argument on first call, converts each argument to a tensor, and splits it along dim 0
into per-sample rows (`torch.split(d_t, 1, dim=0)`, `metric.py:219`) — the buffer holds
samples, not batches. Its last line is `self._synced = False` (`metric.py:225`); `append`
ends the same way (`metric.py:245`). This is the upward lesson the technique took from
the tree: the writer invalidates the cache, not only `reset`.

`CumulativeIterationMetric.__call__` (`metric.py:327-353`) is the callable seam: it runs
the per-batch computation through `IterationMetric.__call__`, which detaches `y_pred`
and `y` before computing (`metric.py:79-80`, and per-item at `metric.py:101-105`), then
`extend`s the result, unpacking a tuple into parallel buffers (`metric.py:348-351`).

## The sync

`Cumulative._sync` (`metric.py:256-270`):

```python
if self._synced or self._buffers is None:
    return
try:
    self._synced_tensors = [
        evenly_divisible_all_gather(torch.stack(b, dim=0), concat=True) for b in self._buffers
    ]
except (RuntimeError, TypeError, ValueError) as e:
    raise TypeError(f"{e}. unable to sync buffer contents: {self._buffers}.") from e
self._synced = True
```

Two triggers call it: `__len__` (`metric.py:272-280`, "the method will trigger
synchronization of the local buffers") and `get_buffer` (`metric.py:282-293`). `aggregate`
is abstract (`metric.py:247-254`) and is expected to call `get_buffer`, which is what
`DiceMetric.aggregate` does (`monai/metrics/meandice.py:177`).

`evenly_divisible_all_gather` (`monai/utils/dist.py:59-140`) is the pad-gather-strip
procedure. The native path (`dist.py:82-106`) exchanges lengths first with an
`all_gather` of a one-element tensor (`dist.py:93-96`), pads the local tensor with zeros
to `max_len` along dim 0 (`dist.py:98-101`), gathers (`dist.py:103-104`), and strips each
rank's padding by its exchanged length, `o[:l, ...]`, in rank order (`dist.py:106`). The
docstring at `dist.py:72-74` states the element-type requirement the technique carries:
"The input data on different ranks must have exactly same `dtype`." With a world size
of one, or with no process group initialized, the function returns its input unchanged
(`dist.py:129-137`) — the single-process identity through the same code path.

## Detached reads

`get_buffer` (`metric.py:282-293`) syncs, then returns
`[x.detach().clone() for x in self._synced_tensors]`, unwrapping a single buffer to the
tensor itself (`metric.py:292-293`). `do_metric_reduction` writes into its input
(`f[nans] = 0`, `monai/metrics/utils.py:117`), so the clone is what keeps the cached
union intact for the second reader — which exists: `IgniteMetricHandler.compute`
(`monai/handlers/ignite_metric.py:131`) stores `metric_fn.get_buffer()` into
`engine.state.metric_details` for the report writer after `aggregate` has already run.

## The reporting side of the collective

`MetricsSaver.__call__` (`monai/handlers/metrics_saver.py:131-164`) all-gathers the
per-sample filenames on every rank (`string_list_all_gather`, `metrics_saver.py:141`)
and only then guards on `idist.get_rank() == self.save_rank` (`metrics_saver.py:144`)
before writing. The collective is joined everywhere; the file is written once.

## What the base class does not do

- **Buffer arity is not enforced.** The `Cumulative` docstring (`metric.py:138-139`)
  says "the data list should have the same length every time calling `add()`", but
  `extend` and `append` iterate `zip(self._buffers, data)` (`metric.py:215, 241`), so a
  call with fewer items silently appends to fewer buffers and the misalignment is not
  detected. The technique refuses such a call.
- **No duplicate detection.** A padding distributed sampler produces a union longer
  than the dataset; nothing here compares `len(metric)` to the dataset size. The
  technique's rule — check the gathered count against the set — is the consumer's.
- **Rank-zero-only aggregation is not guarded against.** A caller who wraps
  `aggregate()` in a rank check deadlocks the other ranks inside `all_gather`; the
  ignite handler avoids it because ignite calls `compute` on every rank.
