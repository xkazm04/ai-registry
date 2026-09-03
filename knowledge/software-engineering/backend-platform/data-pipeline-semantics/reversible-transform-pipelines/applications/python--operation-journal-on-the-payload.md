---
layer: application
type: application
subject: reversible-transform-pipelines
technique: operation-journal-on-the-payload
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# The applied-operations stack in MONAI's transform layer

MONAI (Project-MONAI/MONAI, pinned at commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python >=3.10`) realizes
the journal as `MetaTensor.applied_operations`, a list of dictionaries that
every geometry-changing transform pushes onto and every inverse pops from.
The machinery lives in `monai/transforms/inverse.py`; the record vocabulary
lives in `monai/utils/enums.py`; the batch-facing rules are stated as a
developer contract in the `InvertibleTransform` docstring.

## The record and its closed vocabulary

`TraceKeys` (`monai/utils/enums.py:324-336`) is the single enumeration of
record keys: `class`, `id`, `orig_size`, `extra_info`, `do_transforms`,
`tracing`, `statuses`, `lazy`, plus the `none` sentinel and the `_transforms`
suffix the dictionary-style trace used. `TraceStatusKeys` (`:339-342`) holds
exactly one status, `pending_during_apply`. `transform_info_keys()`
(`inverse.py:114-116`) returns the four fields every push writes — class
name, `id(self)`, the tracing flag and `do_transform` — and
`get_transform_info()` (`:118-130`) fills them, defaulting `do_transform` to
`True` for non-random transforms. The operation-specific parameters go
under `extra_info`; the original shape goes under `orig_size`.

## Push as the last act of the forward call

`push_transform` (`inverse.py:132-167`) is called from each transform's
`__call__`. The `replace=True` path (`:147-160`) is the sanctioned form of
overwriting: a transform that must rewrite its most recent record — a
composite re-pushing its summary, a lazy transform upgrading a pending entry
— pops the old one (`check=False`) and pushes the merged record, carrying the
old `extra_info` and `orig_size` forward. Everything else appends. The
technique's "replacement is a corruption when an ordinary operation does it"
is the reason the flag is opt-in and defaults to `False`.

## Where the journal lives, and what pickling strips

The stack is on the tensor: `TraceableTransform`'s docstring
(`inverse.py:42-50`) names `MetaTensor` as the preferred carrier and the
parallel dictionary `<key>_transforms` as deprecated. Tracing state itself is
*not* on the tensor — it is a `threading.local` on the transform
(`_init_trace_threadlocal`, `:74-83`), so two loader threads sharing one
transform object can trace independently, and `__getstate__` (`:85-90`)
strips `_tracing` before pickling because a thread-local is not picklable.
The journal crosses the process boundary with the data; the tracing switch
does not, and is re-initialized from the environment in the receiving
process. That split is what lets a transform object be sent to a spawned
worker while the records it wrote there come back in the tensor.

## Pop searches for its own record

`get_most_recent_transform` (`inverse.py:344-384`) is the pop. It refuses
when tracing is off (`:361`, "Transform Tracing must be enabled") and when
the journal is empty (`:372-373`, a `ValueError` naming the key), so an
inverse with nothing to undo is an error rather than an empty success. With
`check=True` it scans from the top downward (`:376-382`) for the first record
that `_transforms_match` accepts and pops *that* one; only if nothing matches
does `check_transforms_match` (`:304-322`) raise, quoting the top record's
class and id against `id(self)`. This is the upward lesson the technique
records: the pop is "my most recent record", not "the top", because
`Compose.inverse` (`compose.py:391-406`) filters to `InvertibleTransform`
members and records from traced-but-not-invertible members remain above
the one being popped.

## The four-clause contract, verbatim

The `InvertibleTransform` docstring (`inverse.py:436-445`) states the
developer obligations the technique's contract section is drawn from:
inherit from the class; call `push_transform` in `__call__`; `extra_info`
"should have the same keys regardless of whether `do_transform` was `True`
or `False` and can only contain objects that are accepted in pytorch data
loader's collate function (e.g., `None` is not allowed)"; and `inverse` must
end by calling `pop_transform`. The same docstring (`:420-434`) records two
properties the golden path relies on: the inverse is called per key, "which
allows for different parameters being passed to each label (e.g., different
interpolation for image and label)", and the stack "grows" on the forward
pass and "shrinks back down to an empty list" on the inverse — the
round-trip invariant the equivalence tests assert.

## Composites journal their choice

`OneOf.inverse` (`compose.py:543-564`) pops its own record and reads
`extra_info["index"]` to find the one branch that ran, then inverts only
that member; `RandomOrder.inverse` (`:638-662`) reads
`extra_info["applied_order"]` and walks it reversed; `SomeOf.inverse`
(`:803-827`) does the same. Each returns the data untouched when the field
is absent, which is the "no invertible transform was applied" case and not
an error.

## What the cache writer does to identity

`reset_ops_id` (`monai/transforms/utils.py:1850-1862`) walks a data item and
rewrites every `TraceKeys.ID` to `TraceKeys.NONE`, in place. It is called by
the persistent dataset before writing to disk, because cached tensors
outlive the transform instances whose `id()` they recorded; the sentinel is
what `_transforms_match` (`inverse.py:324-342`) accepts as "identity
deliberately not tracked" (`:336-337`).
