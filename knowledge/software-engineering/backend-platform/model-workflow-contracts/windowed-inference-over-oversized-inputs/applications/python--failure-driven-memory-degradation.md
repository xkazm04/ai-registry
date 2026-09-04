---
layer: application
type: application
subject: windowed-inference-over-oversized-inputs
technique: failure-driven-memory-degradation
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# An adaptive sliding-window inferer that descends on out-of-memory and remembers the size that failed

MONAI's `SlidingWindowInfererAdapt` (`monai/inferers/inferer.py:608-694`, pinned
at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python >=3.10`
in `pyproject.toml:20`) is the ladder in the technique realised as a subclass
of the plain `SlidingWindowInferer` (`inferer.py:446`). It adds no stitching
logic; it decides, per call and per failure, which combination of the base
class's `device`, `buffer_steps` and `buffer_dim` parameters to run, and it
writes what it learned back onto the instance.

## The rungs, as written

The state is three booleans and an integer computed before the loop
(`inferer.py:640-645`): `cpu_cond` is true when the input's spatial element
count exceeds `self.cpu_thresh`; `gpu_stitching` when the input is on the
accelerator and `cpu_cond` is false; `buffered_stitching` when the input is on
the accelerator, `cpu_cond` is true and buffering was not disabled by a
non-positive `buffer_steps`. The loop (`:652-690`) runs the base inferer with
`device=inputs.device if gpu_stitching else torch.device("cpu")` and
`buffer_steps=buffer_steps if buffered_stitching else None`, and on a caught
`RuntimeError` descends:

- if `gpu_stitching` was on, turn it off, **write `self.cpu_thresh =
  inputs.shape[2:].numel() - 1`** (`:671`), and turn buffering on unless it was
  skipped (`:669-681`);
- else if `buffer_steps > 1`, halve it and **write it back as
  `self.buffer_steps`** (`:683-688`);
- else turn buffering off and fall to host stitching (`:689-691`).

Every branch logs a warning naming the rung, the buffer size and the input
shape (`:675-682, :686-688, :691`), which is the visibility the technique
requires of a ratchet. The threshold is a public attribute, so an operator can
reset it by assignment; the tree offers no method for that, and the standard
would prefer one.

Adaptation is disabled when the caller named a canvas device — the first
statement of the call is `if self.device is not None: return super().__call__(...)`
(`:637-638`) — which is the "explicit choice wins" rule the draft took from the
tree. The buffer axis is chosen automatically as the longest spatial axis when
it is at least twice the last axis (`:647-650`).

## Classification at one door

The descent is gated by a single predicate, `"OutOfMemoryError" not in
str(type(e).__name__)` (`:664`), combined with a check that there is a rung
left to descend. It is a type-name match — the runtime does not offer the
condition as a catchable class that is stable across versions — but it is
written once and every rung consults the same line, which is what the standard
asks of a classification that cannot be typed. Any other `RuntimeError` is
re-raised immediately (`:665`).

## Where the tree falls short of the standard

The trial count is bounded at ten (`:652`), which is right; what is raised on
exhaustion is not. The loop falls through to a fresh `RuntimeError` carrying
the state flags as its message (`:692-694`), raised outside the `except` and
so without the original out-of-memory error chained to it. The last real
failure was logged at `:667` and is otherwise gone. The standard raises the
original failure, or chains it, so that the caller's traceback ends at the
allocation that did not fit rather than at a summary of booleans.

Nothing is released between rungs. After an out-of-memory error the caching
allocator may hold the failed attempt's blocks, and the next rung is tried
against a heap that has not been returned. The standard frees the cache between
rungs; the tree relies on the allocator.

## What to take from it

The whole ladder is fifty lines because the base class already separates the
window device from the canvas device and already accepts a buffer size — the
adaptive subclass has nothing to implement but the policy. A stitcher whose
memory parameters are not independent inputs cannot be wrapped this way, which
is the strongest argument for the two-parameter design in
`split-device-inference-and-stitching`.
