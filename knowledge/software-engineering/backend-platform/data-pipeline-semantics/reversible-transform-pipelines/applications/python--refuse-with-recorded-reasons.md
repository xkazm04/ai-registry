---
layer: application
type: application
subject: reversible-transform-pipelines
technique: refuse-with-recorded-reasons
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Pending-during-apply: MONAI records at push time and raises at inverse time

MONAI (Project-MONAI/MONAI, pinned at commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python >=3.10`) has
exactly one recorded reason for non-invertibility, and its two halves sit in
different files: the detector in `monai/transforms/inverse.py`, the refusal
in `monai/transforms/compose.py`. The same files carry the lossy and
batch-facing decisions the subject's other techniques describe, so this
application covers those too.

## The detector writes onto the datum

`track_transform_meta` (`inverse.py:275-290`) is the push for an eager
transform. When the target `MetaTensor` still has `pending_operations` — a
lazily deferred resample or crop that has not been materialized — the push
does not raise. It builds a message naming the applied transform's class and
the list of pending classes (`:276-282`, with the dictionary key appended
when there is one), appends it to the `pending_during_apply` list inside the
`statuses` field of the *last pending* record (`:284-288`), copies the
statuses onto the record being pushed (`:289`), and pushes it (`:290`). The forward
pass continues; the training input is produced; the reason travels with the
tensor.

## The refusal reads the whole journal first

`Compose.inverse` (`compose.py:391-406`) opens with
`self._raise_if_not_invertible(data)` (`:392`) before any member is
inverted. That method (`:409-421`) calls `has_status_keys`
(`monai/transforms/utils.py:2443-2490`), which recurses through lists,
tuples, dictionaries and tensors, collecting every message under the
requested status key from every record of every tensor's
`applied_operations` (`:2471-2483`). It returns `(True, None)` when nothing
was found and `(False, messages)` otherwise (`:2485-2487`). The compose then
raises one `RuntimeError` with all messages joined by newlines (`:417-419`),
or — the guard for a status flag written without text — "no reason logged in
trace data" (`:421`). Nothing has been popped when the refusal lands.

## Warn and correct versus record and refuse

Two lines apart, the compose shows the technique's second decision rule. A
compose configured with `lazy=True` and asked to invert warns that "lazy
execution is not supported when inverting" and overrides `lazy` to `False`
for the call (`compose.py:398-402`): the condition is correctable by the
inverse pass itself, so it is corrected. Pending-during-apply is not
correctable — the offending transform's parameters were computed against
un-materialized geometry — so it is the one that refuses.

## Identity fallbacks, as shipped

`_transforms_match` (`inverse.py:324-342`) accepts a record when its `id`
equals `id(self)` (`:333-334`), when it is the `TraceKeys.NONE` sentinel
(`:336-337`), or when the multiprocessing start method is `spawn` and the
class names agree (`:340-341`). The docstring calls the spawn branch a
"basic check". **Deviation from the standard:** the class-name fallback is
silent — there is no once-per-process warning that the check has been
weakened — and `tests/transforms/inverse/test_inverse.py:455-463` skips its
out-of-order-inverse test unless the start method is spawn, "as the check is
only basic anyway". The technique asks for the warning; the repo does not
emit it.

## The lossy inverse, named at the call site

`Invertd` takes `nearest_interp` (`monai/transforms/post/dictionary.py:902-905`):
when set, the recorded `applied_operations` are rewritten through
`convert_applied_interp_mode(trans_info, mode="nearest", align_corners=None)`
before the inverse runs, so a label-map prediction is carried back with
nearest-neighbour resampling while the input's recorded smooth mode is left
untouched on the source tensor. The substitution is an explicit constructor
argument, which is the declaration the deliberate-lossy-inverse technique
requires.

## Decollate before invert, as a round trip

`BatchInverseTransform.__call__` (`monai/transforms/inverse_batch_transform.py:99-112`;
the scout's anchor placed this file under `monai/data/`, where it is not)
implements batch inversion exactly as the decollate-before-invert technique
prescribes and warns against optimizing away: `decollate_batch` (`:100`), a
`_BatchInverseDataset` over the per-item results (`:101`), a second
`DataLoader` (`:102-104`) whose default `collate_fn` re-stacks — and, when
the inverted items have unequal sizes, a hint to construct it with
`collate_fn=lambda x: x` (`:109-111`) so the return is a list. The design
rationale is stated in `docs/source/whatsnew_0_6.md:12-18`: decollation
enables "the transform inverse operation for data items in different
original shapes, as the inverted items are in a list, instead of being
stacked in a single tensor".

## Test-time augmentation only warns

`TestTimeAugmentation._check_transforms` (`monai/data/test_time_augmentation.py:160-175`)
walks the chain and, when `apply_inverse_to_pred` is set and a `Randomizable`
member is not an `InvertibleTransform`, appends "Transform #N (type X) is
random but not invertible" to a list that becomes a `warnings.warn` (`:169`,
`:174-175`). **Deviation from the standard:** this is a configuration-time
check — the better moment, as the technique says — but a random,
non-invertible member with inversion requested cannot produce a correct
result, and the standard refuses there rather than warning.
