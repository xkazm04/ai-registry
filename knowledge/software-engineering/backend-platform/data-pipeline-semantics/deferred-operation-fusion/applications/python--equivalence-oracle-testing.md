---
layer: application
type: application
subject: deferred-operation-fusion
technique: equivalence-oracle-testing
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# MONAI's lazy-versus-eager oracle, and the fusion it exercises

MONAI (Project-MONAI/MONAI, pinned at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`,
`requires-python = ">=3.10"` in `pyproject.toml:20`) ships one shared test helper that
every lazy-capable transform's test suite calls, and it is the technique's three
assertions in order. This application reads that helper, then the accumulator it
drives, then the one place where the accumulator's behaviour is not what a chain test
would need it to be.

## The helper

`test_resampler_lazy` in `tests/lazy_transforms_utils.py:33-92` takes a transform
instance and the output of the same transform run eagerly (`expected_output`), and
does the following.

It re-seeds a randomizable transform (`:61-62`) so both paths draw the same
parameters, switches the instance to lazy (`:64`) and calls it, obtaining a tensor
with pending operations. **Assertion one — peek before flushing** (`:72-74`):

```python
assert_allclose(lazy_out.peek_pending_affine(), non_lazy_out.affine)
if not skip_shape_check:
    assert_allclose(lazy_out.peek_pending_shape(), non_lazy_out.shape[1:4])
```

The composed transformation and pending shape are read from the envelope without
materializing anything and compared against the eager output's affine and spatial
shape. **Assertion two — flush equals eager** (`:76-77`): `apply_pending` is called
with the resampling parameters the transform was constructed and called with
(`get_apply_param`, `:24-31`, collects `mode`, `padding_mode`, `dtype`,
`align_corners`), and the result is compared value-wise with `rtol=1e-5, atol=1e-7`
by default (`:41-42`) — a stated tolerance the caller may widen, not bit equality.
**Assertion three — both invert to the same thing and leave nothing behind**
(`:78-91`): for an invertible array transform whose eager output carries a trace, the
instance is switched back to eager (`:85`), both outputs are inverted, and the test
asserts `out.applied_operations == []`, `out.pending_operations == []`, and
`ref ≈ out` at `rtol=1e-3, atol=1e-3` — the looser per-assertion tolerance the
technique describes for the inverse stage, two orders wider than the forward check.

The oracle observes the real flush (`apply_pending` from
`monai/transforms/lazy/functional.py`, imported at `:18`), not a hand-computed matrix.
It is scoped to one transform in isolation; there is no chain form of the helper.

## The accumulator it drives

`apply_pending` (`functional.py:250-310`) folds the pending list in order.
`combine_transforms` in `monai/transforms/lazy/utils.py:66-80` is the algebra: two
affine-shaped operands are multiplied (`torch.matmul(left, right)`, `:73`), two
displacement-field-shaped operands are added (`return left + right`, `:79`), and any
other pairing raises `NotImplementedError` (`:80`) — the refusal the technique
requires, though a bare one that does not name the two kinds. The parameter
vocabulary each pending entry carries is the closed `LazyAttr` enum at
`monai/utils/enums.py:649-663`: `SHAPE`, `AFFINE`, `PADDING_MODE`, `INTERP_MODE`,
`DTYPE`, `ALIGN_CORNERS`, `RESAMPLE_MODE`, extracted per entry by
`kwargs_from_pending` (`utils.py:92-108`).

## What a chain oracle would catch

The compatibility break is present in shape and absent in effect. The loop at
`functional.py:280-293` reads:

```python
for p in pending[1:]:
    new_kwargs = kwargs_from_pending(p)
    if not is_compatible_apply_kwargs(cur_kwargs, new_kwargs):
        # carry out an intermediate resample here due to incompatibility between arguments
        ...
        data = resample(data.to(device), cumulative_xform, _cur_kwargs)
    ...
    cumulative_xform = combine_transforms(cumulative_xform, next_matrix)
    cur_kwargs.update(new_kwargs)
```

but `is_compatible_apply_kwargs` at `utils.py:117-119` is a stub — its whole body is
`return True`. The intermediate resample is therefore unreachable, and the
`cur_kwargs.update(new_kwargs)` on the last line means the final resample runs with
whichever interpolation mode, padding mode and dtype the *last* entry carried: the
last-entry-wins policy the technique names as the wrong answer, applied to every
chain. The scout's brief described this as "inserts an intermediate resample whenever
`is_compatible_apply_kwargs` fails (mode, padding, dtype, align_corners differ)"; on
re-reading it never fails, and the brief's line range (`:255-266`) is the override
parsing rather than the loop. A single-transform oracle cannot see this — with one
pending entry there is nothing to disagree with — which is the concrete reason the
technique requires a short-chain form with a neighbour of differing parameters on
either side. Overrides, when given, are applied as a blanket at flush
(`cur_kwargs.update(override_kwargs)`, `:294`) rather than per entry, which is
consistent with a comparison that never runs and would need to change the day it does.

The subject's standard stays where the draft put it: the mid-chain resample on a
parameter run boundary is the correct behaviour, the stub is a deviation, and the
chain oracle is the test that would have made it visible.
