---
layer: application
type: application
subject: deferred-operation-fusion
technique: single-flush-decision-point
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# The flush predicate in MONAI's lazy resampling

MONAI (Project-MONAI/MONAI, pinned at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`,
`requires-python = ">=3.10"` in `pyproject.toml:20`) implements deferred resampling
for its transform chains under the name *lazy resampling*, documented in full in
`docs/source/lazy_resampling.rst`. This application reads the one function that
decides whether pending operations are applied before a transform runs, the
properties that function consults, and the places where the tree falls short of the
technique.

## The predicate is one function

`apply_pending_transforms_in_order` in `monai/transforms/lazy/functional.py:146-193`
is the door. Its docstring (`:150-161`) states the rule the way the technique states
it: pending transforms are evaluated if the transform is lazy but checks data or is
not executing lazily, if it is an `ApplyPending[d]`, or if it is not a lazy transform
at all — and it adds, at `:153-155`, that "there is only one mechanism for executing
lazy resampling at present". The body is four lines:

```python
must_apply_pending = True
keys = transform.keys if isinstance(transform, ApplyPendingd) else None
if isinstance(transform, LazyTrait) and not transform.requires_current_data:
    must_apply_pending = not (transform.lazy if lazy is None else lazy)
```

(`functional.py:184-187`). The default is to flush; only a `LazyTrait` that does not
declare `requires_current_data`, and that is actually lazy for this call, escapes it.
The tri-state pipeline mode is visible in the last line — `lazy is None` means honour
the transform's own flag, any other value overrides it — and is documented on
`Compose` at `monai/transforms/compose.py:213-222`: `False` (the default) performs no
lazy resampling, `None` honours each instance's property, `True` forces it for every
capable transform. Both branches log which one was taken (`:190-193`,
`"Apply pending transforms"` versus `"Accumulate pending transforms"`), which is the
observability the technique asks for at the decision point.

Every transform in a `Compose` passes through this door: `apply_transform` in
`monai/transforms/transform.py:93` calls it before dispatching, and `execute_compose`
drains unconditionally at the end of the chain
(`monai/transforms/compose.py:137`,
`data = apply_pending_transforms(data, None, overrides, logger_name=log_stats)`).

## The properties the predicate reads

`LazyTrait` in `monai/transforms/traits.py:22-56` is the capability marker: a
`lazy` getter and setter, and a `requires_current_data` getter documented as "whether
the transform requires the input data to be up to date before the transform executes.
Such transforms can still execute lazily by adding pending operations to the output
tensors" (`:50-56`) — the two-independent-properties reading, in the source's own
words. `LazyTransform` in `monai/transforms/transform.py:305-331` is the base most
transforms inherit: `lazy` defaults to `False` at construction (`:311`), and
`requires_current_data` returns `False` (`:328-330`).

`ApplyPending` in `monai/transforms/lazy/array.py:19-32` is the barrier. It inherits
`InvertibleTrait` and not `LazyTrait`; its docstring says it "doesn't do anything
itself, but its presence causes the pipeline to be executed as ApplyPending doesn't
implement `LazyTrait`"; `__call__` and `inverse` both return their input unchanged.
Its immunity to `lazy=True` is exactly the `isinstance(transform, LazyTrait)` guard
above — the mode only reaches transforms that carry the trait.

The value-reading declarations live on the crops. `CropForegroundd`,
`RandCropByPosNegLabeld` and `RandCropByLabelClassesd` return `True` from
`requires_current_data` (`monai/transforms/croppad/dictionary.py:917, 1123, 1282`),
and each still emits its own pending entry by delegating to the array cropper with
`lazy=lazy_` (`:929-931` for `CropForegroundd`). `SpatialCropd` at `:536-538` is the
computed form the technique now describes: `return self._has_str_roi`, set at
`:486` to whether any of the region parameters is a string naming another key in the
dictionary — constant extents read nothing, extents resolved from the data do.

## Where the tree falls short

Three deviations, none of which lower the standard.

The array-form crops declare `False`. `CropForeground.requires_current_data` at
`monai/transforms/croppad/array.py:871` returns `False`, and so do
`RandCropByPosNegLabel` (`:1179`) and `RandCropByLabelClasses` (`:1362`) — yet
`CropForeground.__call__` at `:944` calls `self.compute_bounding_box(img)` on the
array it was handed before deciding its crop. In a `Compose` of array transforms with
`lazy=True`, a pending rotation ahead of it is not flushed and the bounding box is
computed on stale voxels. The dictionary forms are protected because their own
declaration trips the predicate before they delegate; the inner form used directly is
not. The scout's brief listed these three array lines as `requires_current_data=True`;
on re-reading they are the opposite.

The trait's default is unknown, and the predicate reads unknown as permissive.
`LazyTrait.requires_current_data` in `traits.py:50-56` has a docstring and no body, so
a class that implements the trait directly and forgets the property returns `None`;
`not transform.requires_current_data` at `functional.py:186` turns `None` into "does
not require current data" and lets the transform run lazily. `LazyTransform` closes the
hole for its subclasses by returning `False` explicitly, which is the technique's
recommendation — but the interface itself is the laundering point the technique warns
about.

Overrides are dropped silently under eager mode. `transform.py:80-82` documents that
`overrides` "are currently only applied when Lazy Resampling is enabled ... If lazy is
False they are ignored", with no warning at the call site; the keyword set itself is
validated loudly (`functional.py:37` defines the closed set, `:250-252` rejects an
unknown key via `look_up_option`), so the tree is loud about a misspelled override and
silent about an override that had no effect.

## Inverse runs eager and refuses leaked pending state

`Compose.inverse` at `monai/transforms/compose.py:391-419` first calls
`_raise_if_not_invertible`, which scans the trace for a `PENDING_DURING_APPLY` status
and raises with the accumulated reasons (`:409-419`); it then warns and overrides
`lazy` to `False` for the inverse pass if it was `True` (`:398-403`). That is the
golden path's rule that an inverse never drains a pending list — it refuses when one
leaked into an applied operation, and it never creates new ones.
