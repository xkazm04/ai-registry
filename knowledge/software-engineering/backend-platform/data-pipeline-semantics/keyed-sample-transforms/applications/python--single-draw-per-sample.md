---
layer: application
type: application
subject: keyed-sample-transforms
technique: single-draw-per-sample
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# Single draw per sample in MONAI's dictionary transforms (Python)

How MONAI realizes one random draw per sample across keys, and how it forwards
random state from the dictionary wrapper to the array transform it holds.
Citations are against `Project-MONAI/MONAI` at commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f` (`requires-python = ">=3.10"` in
`pyproject.toml:20`).

## 1. The two-call idiom, verbatim

`RandRotated` (`monai/transforms/spatial/dictionary.py:1825`) holds an array
`RandRotate` as `self.rand_rotate` (`:1885`). Its `__call__` (`:1916-1937`)
does exactly what the technique prescribes, in order:

```python
d = dict(data)
self.randomize(None)                 # the wrapper's own coin: _do_transform
# all the keys share the same random rotate angle
self.rand_rotate.randomize()         # the held array transform draws its angle
...
for key, mode, padding_mode, align_corners, dtype in self.key_iterator(
    d, self.mode, self.padding_mode, self.align_corners, self.dtype
):
    if self._do_transform:
        d[key] = self.rand_rotate(d[key], ..., randomize=False, lazy=lazy_)
```

Two draws, two owners, one read each: the gate lives on the wrapper
(`RandomizableTransform.randomize` sets `_do_transform = self.R.rand() <
self.prob`, `monai/transforms/transform.py:375`), the parameters live on the
array instance, and every key is then applied with `randomize=False`. The
comment at `:1919` is the technique's whole argument in one line. Note also
that `key_iterator` is handed the per-key `mode`, `padding_mode`,
`align_corners` and `dtype` lists as extra iterables, so per-key parameters
are zipped inside the one gate rather than by the transform.

## 2. Seeding the wrapper seeds the held instance

`RandRotated.set_random_state` (`:1898-1901`) calls
`super().set_random_state(seed, state)` and then
`self.rand_rotate.set_random_state(seed, state)`. That is the forwarding the
technique requires — without it, `Compose.set_random_state` would reseed the
wrapper's coin and leave the angle generator untouched. `Compose` itself
reseeds each `Randomizable` child from its own `R`
(`monai/transforms/compose.py:286-291`): `_transform.set_random_state(seed=
int(self.R.randint(MAX_SEED, dtype="uint32")))`, so seeding the chain once
determines every child's draws in order. The chain is seeded at construction
from the global determinism seed (`:280`, `self.set_random_state(seed=
get_seed())`), which is how a `set_determinism()` call reaches a chain built
afterwards.

## 3. The multi-sample variant keeps the single draw

`RandCropByPosNegLabeld.__call__` (`monai/transforms/croppad/dictionary.py:
1285-1298`) draws once — `self.randomize(d.get(self.label_key), ...)`, which
delegates to `self.cropper.randomize` (`:1271-1274`) — then builds
`num_samples` shallow-copied output dictionaries, deep-copies every key *not*
in `self.keys` into each (`:1291-1294`, the pass-through obligation under
fan-out), and finally calls `self.cropper(d[key], randomize=False, lazy=lazy_)`
per key (`:1297-1298`). All `num_samples` crops of the image and of the label
come from the same frozen centres.

## 4. The contract that makes this necessary

`Randomizable` (`monai/transforms/transform.py:188-198`) states the three
facts the technique rests on: state is local to the instance ("component-
specific determinism without affecting the global states"), the API "is not
thread-safe", and "deepcopying instance of this class often causes
insufficient randomness as the random states will be duplicated". It inherits
`ThreadUnsafe` (`:188`), which is what `execute_compose` checks when
`threading=True` (`monai/transforms/compose.py:133`): the transform is
deep-copied per application. Every caller that passes `threading=True` also
passes `end=first_random` (`monai/data/dataset.py:342, 511, 921`;
`monai/data/grid_dataset.py:313`), so the threaded phase stops before the
first random transform and the deep-copy never duplicates a live generator
— the structural escape the thread-unsafe-marking technique names.

## 5. Where the tree falls short of the standard

- `Randomizable.R` is a **class-level** `np.random.RandomState()`
  (`transform.py:200`), so unseeded instances share one generator until
  `set_random_state` is called on them or on a chain containing them. The
  standard asks for a per-instance generator from construction.
- The `execute_compose` docstring says copies are made of transforms "that
  have the `RandomizedTrait` interface" (`compose.py:107-108`); the code
  checks `ThreadUnsafe` (`:133`). The marker is the right one; the docstring
  is stale.
- The deep-copy is per transform per item inside the loop (`:132-133`),
  not per worker at executor start; correct for the deterministic prefix it
  is scoped to, but a large cached lookup table is copied on every sample.
