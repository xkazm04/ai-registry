---
layer: application
type: application
subject: self-describing-data-envelopes
technique: intersect-then-collate
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Intersect-then-collate in MONAI's `MetaTensor` batching

MONAI (pinned at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python
= ">=3.10"` in `pyproject.toml:20`) carries a medical image as a `MetaTensor` — a
`torch.Tensor` subclass mixing in `MetaObj` — and stacks a list of them into one
batched `MetaTensor` through a collate function registered with PyTorch's
`default_collate` machinery. That function is where the technique's procedure
is materialised, key by key.

## The intersection, the sentinel, the flag

`collate_meta_tensor_fn` at `monai/data/utils.py:418-437` runs the technique
almost line for line:

```python
collated = collate_tensor_fn(batch)                                  # :425
meta_dicts = [i.meta or TraceKeys.NONE for i in batch]               # :427
common_ = set.intersection(*[set(d.keys()) for d in meta_dicts if isinstance(d, dict)])  # :428
if common_:
    meta_dicts = [{k: d[k] for k in common_} if isinstance(d, dict) else TraceKeys.NONE for d in meta_dicts]  # :430
collated.meta = default_collate(meta_dicts)                          # :431
collated.applied_operations = [i.applied_operations or TraceKeys.NONE for i in batch]  # :432
collated.is_batch = True                                             # :433
```

Three of the technique's rules land verbatim. The payloads are stacked first by
the engine's own `collate_tensor_fn` (`:425`), then the metadata key set is the
`set.intersection` across every member (`:428`) and only those keys reach
`default_collate` (`:430-431`). The journals are kept as a **list of per-member
journals** (`:432`), never interleaved, which is what `decollate_batch` later
reads back. The batch flag is set on the result (`:433`), and the copy policy
in `MetaObj.copy_meta_from` (`monai/data/meta_obj.py:138-141`) reads it to
choose `copy_attr=not is_batch` in `MetaTensor.update_meta`
(`monai/data/meta_tensor.py:269`).

The sentinel is `TraceKeys.NONE` (`monai/utils/enums.py:333`), a string
`"none"`, and it appears in two places: a member with an empty metadata map is
replaced by the sentinel rather than by `{}` (`:427`), and a member with an
empty journal likewise (`:432`), so that `decollate_batch` can tell "this member
carried no history" apart from "this member carried a history the batch lost".

## The derived cache is recomputed by a stated rule

`spatial_ndim` is a cached value on every `MetaTensor`, kept in sync with the
affine — "the source of truth" — by the affine setter
(`monai/data/meta_tensor.py:523-534`, docstring at `:537-543`). The collate does
not copy the first member's cache. It recomputes the batch's value
(`monai/data/utils.py:434-436`):

```python
collated.spatial_ndim = min(
    min(getattr(t, "spatial_ndim", _DEFAULT_SPATIAL_NDIM) for t in batch), max(collated.ndim - 1, 1)
)
```

The minimum over members, clamped by the batch's own rank minus the batch axis
— the technique's "derived cache" paragraph is this rule, written beside the
collate where a reader of the batch will find it.

## The split restores per-member history

`decollate_batch` (`monai/data/utils.py:540`) walks the batched `MetaTensor`
and, for each member, re-attaches the journal from the list and clears the
flag (`:614-618`):

```python
for t, m in zip(out_list, batch.applied_operations):
    if isinstance(t, MetaObj):
        t.applied_operations = m
        t.is_batch = False
```

Ragged fields are walked with `zip_longest` and a `fill_value` (`:630, :637`).
The metadata that the intersection dropped is not restored by the split —
there is nothing to restore it from — which is the lossiness the technique
declares by design.

## Where the tree falls short of the standard

**Dropped keys are not named.** The technique's sentinel is a record of *which
keys were dropped*; the tree's sentinel marks only *members that had nothing at
all*. When `common_` is smaller than some member's key set, the extra keys
vanish at `:430` with no entry on the batch saying so. A downstream stage
asking why a batch lacks a key its members carried gets an absence, not an
answer. The standard stays: intersect, then *record* what did not survive.

**The empty-intersection case is unguarded.** When `common_` is empty (`:429`
false), `meta_dicts` is handed to `default_collate` still heterogeneous, and
what happens next depends on the engine's collate rather than on a stated
rule.

**The ragged fill is a default, not a sentinel.** `decollate_batch`'s
`fill_value` defaults to `None` (`:540`), which is a legitimate metadata value
in the same tree and is therefore not distinguishable from one.

## The keyed failure message

`list_data_collate` (`monai/data/utils.py:457-511`) collates a dictionary
sample key by key so that on a `RuntimeError` it can append `"Collate error on
the key '<k>'"` (`:492`) and a hint pointing at `pad_list_data_collate`
(`:494-497`) — the technique's "fails with the key and the shapes, and points
the caller at an explicit padding collate". Three commented-out calls to a
pre-1.0 `pickle_operations` survive beside it, each tagged `# bc 0.9.0`
(`:477-478, :632-634, :639-641`): dead compatibility code with no removal date,
noted here because the sidecar technique's rule is that such leftovers name a
reaper or go.
