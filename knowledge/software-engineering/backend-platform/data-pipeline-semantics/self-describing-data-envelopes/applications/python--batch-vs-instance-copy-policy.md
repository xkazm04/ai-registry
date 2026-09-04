---
layer: application
type: application
subject: self-describing-data-envelopes
technique: batch-vs-instance-copy-policy
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# The copy table in MONAI's `MetaObj` and `MetaTensor`

MONAI (pinned at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python
= ">=3.10"` in `pyproject.toml:20`) implements the envelope as `MetaTensor`, a
subclass of `torch.Tensor` that mixes in `MetaObj`
(`monai/data/meta_tensor.py:90`). The copy policy is written down twice in
prose — once on each class — and implemented once, in a function every copy
path calls.

## The stated rule

The class docstrings state the shape row of the table in the same words on
both classes (`monai/data/meta_tensor.py:100-104`, `monai/data/meta_obj.py:77-81`):

> For `c = a + b`, then auxiliary data (e.g., metadata) will be copied from the
> first instance of `MetaTensor` if `a.is_batch` is False (For batched data,
> the metadata will be shallow copied for efficiency purposes).

That is "deep for an instance, shallow for a batch", with the first-operand
inheritance rule stated in the same breath — and it is documentation a reader
finds on the type, not policy reconstructed from an if-chain.

## The four slots and the flag

`MetaObj.__init__` (`monai/data/meta_obj.py:85-90`) declares what an envelope
carries: `_meta` (the metadata map, which holds the affine under
`MetaKeys.AFFINE` with a typed accessor at `meta_tensor.py:517-520`),
`_applied_operations`, `_pending_operations`, and `_is_batch`, plus the cached
`_spatial_ndim`. The batch flag is a slot in its own right (`:89`), read by
the copy routine below.

## The per-type rows

`MetaObj.copy_items` (`monai/data/meta_obj.py:112-120`) is the per-type table,
one branch per row:

```python
if is_immutable(data):
    return data                      # immutables by reference
if isinstance(data, (list, dict, np.ndarray)):
    return data.copy()               # containers and plain arrays: shallow
if isinstance(data, torch.Tensor):
    return data.detach().clone()     # engine primitives: detach, then clone
return deepcopy(data)                # everything else: deep
```

The docstring on the function says "list and dict are shallow copied for
efficiency purposes" (`:113`), which is the technique's argument that the
mutation being defended against is an append or a key set on the container,
not element-level mutation.

## The shape row, at the one call site

`copy_meta_from` (`monai/data/meta_obj.py:122-142`) takes the first `MetaObj`
in its inputs (`:133`) and then branches on `copy_attr` (`:138-141`):

```python
if not copy_attr:
    self.__dict__ = {a: first_meta[a] for a in keys if a in first_meta}  # shallow copy for performance
else:
    self.__dict__.update({a: MetaObj.copy_items(first_meta[a]) for a in keys if a in first_meta})
```

The shallow branch shares the *same* metadata dict and journal list objects
between the batch and its source — which is exactly the aliasing the technique
says is acceptable for a batch, because a batch is consumed and split, not
mutated stage by stage.

`MetaTensor.update_meta` (`monai/data/meta_tensor.py:225-277`), the code run
after every `__torch_function__` dispatch (`:332`), is where the flag is read to
choose the branch (`:257`, `:268-269`):

```python
is_batch = any(x.is_batch for x in MetaObj.flatten_meta_objs(args, kwargs.values()) if hasattr(x, "is_batch"))
...
ret.is_batch = is_batch
ret.copy_meta_from(meta_args, copy_attr=not is_batch)
```

Note the `any`: the batch flag on the result is an OR over every enveloped
operand, while the slots are inherited from the *first* one (`copy_meta_from`
takes `first(input_objs)`). This is the exception the propagation technique
records — a batch on either side of an operation makes the result a batch —
and it was an upward lesson from this tree.

## The three sites that maintain the flag

The technique enumerates where the flag is set. In this tree: the collate sets
it on (`monai/data/utils.py:433`, `collated.is_batch = True`); the split sets it
off per member (`:614, :618`, `t.is_batch = False`); and the dispatch hook
propagates it as above (`meta_tensor.py:268`). Batch indexing that selects
one member — `batch[0]` — is handled in `_handle_batched` (`:280-300`) by
decollating and returning the member's own metadata, so the flag comes off
with the slice.

## The kill switch and the serialisation registration

Two neighbouring facts in the same files confirm sibling techniques of this
subject. `set_track_meta` / `get_track_meta` (`monai/data/meta_obj.py:33-63`)
is a function pair over a module global `_TRACK_META = True` (`:25`) — default
on — and `update_meta` reads it at the dispatch hook (`meta_tensor.py:263-264`)
to return `ret.as_tensor()`, the bare `torch.Tensor`, when tracking is off. And
the envelope registers itself with the engine's restricted loader at import
time (`meta_tensor.py:696-697`, `torch.serialization.add_safe_globals`), so that
weights-only loading does not silently strand the slots — the subclass
technique's "registers itself as permitted" obligation. The default coordinate
space is stamped at construction when the reader did not say
(`meta_tensor.py:221-222`, `MetaKeys.SPACE` defaulting to RAS).
