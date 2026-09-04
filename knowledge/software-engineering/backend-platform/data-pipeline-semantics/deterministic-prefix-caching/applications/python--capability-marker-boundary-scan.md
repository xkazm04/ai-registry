---
layer: application
type: application
subject: deterministic-prefix-caching
technique: capability-marker-boundary-scan
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# One predicate, five sites: how MONAI's datasets find the cache seam

MONAI at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f` (requires Python 3.10+,
`pyproject.toml:20`) implements the boundary scan as a single lambda passed to
`Compose.get_index_of_first` (`monai/transforms/compose.py:307-319`), and the lambda is
the technique's rule verbatim:

```python
lambda t: isinstance(t, RandomizableTrait) or not isinstance(t, Transform)
```

The first clause is the capability marker; the second is the unknown-callable rule.
The marker is defined at `monai/transforms/traits.py:69-75` as an empty class whose
docstring calls it "an interface to indicate that the transform has the capability to
perform randomized transforms", explicitly extendable "by people adapting transforms
to the MONAI framework" — a trait to declare, not a base class with a generator to
inherit. `Randomizable` (the class that does own an RNG) mixes the trait in, so most
random transforms carry it by descent, but a third-party transform can declare it
without ever holding a generator.

The predicate appears, character-identical, at five sites:

- `monai/data/dataset.py:337-339` — `PersistentDataset._pre_transform`, which runs the
  chain with `end=first_random, threading=True` and is the value that gets written to
  disk;
- `monai/data/dataset.py:359-361` — `PersistentDataset._post_transform`, which runs the
  chain with `start=first_random` on every hit;
- `monai/data/dataset.py:945-947` — `CacheDataset._transform`, followed at `:949-951`
  by `data = deepcopy(data) if self.copy_cache is True else data` before the tail runs
  (the copy-before-tail rule; the `copy_cache` docstring at `:1052-1055` states the
  two conditions under which an operator may turn it off — the tail does not modify
  the cache, or every item is used once per process in a multiprocessing loader);
- `monai/data/dataset.py:291-293` — `PersistentDataset.set_transform_hash`, which walks
  `self.transform.flatten().transforms` and stops at the same predicate to decide which
  stages contribute to the advisory head hash;
- `monai/data/grid_dataset.py:255-258` — `GridPatchDataset.__init__`, where the seam is
  computed once and stored as `self.first_random`; `_load_cache_item` (`:305-320`)
  caches the image-level head and `__iter__` (`:340-362`) replays each patch with
  `start=self.first_random`, which is the "same cut, one level down" the golden path
  describes.

Confirmed against the standard: the seam is found by trait membership, never by name
or configured index; the docstrings at `dataset.py:169-171` and `:737-742` teach the
one author rule ("please always put as many as possible non-random transforms before
the randomized ones"); nested chains are flattened before the hash walk; and the
threaded fill (`dataset.py:906-909`, a `ThreadPool` over `_load_cache_item`) passes
`threading=True`, which makes `monai/transforms/compose.py:130-131` deep-copy every
transform that carries the `ThreadUnsafe` marker (`traits.py:87-95`) per application —
the second capability marker the golden path names.

Two deviations, recorded without lowering the standard. First, the predicate is
copy-pasted as an anonymous lambda at five sites rather than named once; the traits
file is the authority on the vocabulary, but the *rule that consumes it* has five
hand-maintained copies, and a sixth capability (say, a `ClockReadingTrait`) would have
to be added to all of them. Second, four of the five sites recompute the scan per item
inside `__getitem__`; only `GridPatchDataset` computes it once at construction as the
technique's procedure step 5 prescribes. The cost is negligible, but it means the
dataset classes would not notice a chain replaced after construction in any principled
way. A minor anchor note: the `get_index_of_first` docstring example (`compose.py:316`)
references a `RandomTrait` class that does not exist; the real name is
`RandomizableTrait`.
