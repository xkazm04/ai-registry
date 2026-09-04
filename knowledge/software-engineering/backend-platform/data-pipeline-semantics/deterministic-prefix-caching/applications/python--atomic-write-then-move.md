---
layer: application
type: application
subject: deterministic-prefix-caching
technique: atomic-write-then-move
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# PersistentDataset's write path: temp-then-move, corrupt-then-unlink, and the key that names it

MONAI's `PersistentDataset` (`monai/data/dataset.py:162`, commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f`) is the disk substrate, and its
`_cachecheck` method (`:366-425`) is the whole read-and-write discipline in forty
lines. The path is worth reading in order.

**The key.** `:385-389` builds the entry name as `hash_func(item)` — `pickle_hashing`
from `monai/data/utils.py:1377`, sha256 over a pickled record — with
`self.transform_hash` appended, and names the file `<hash>.pt` under `cache_dir`. The
head hash is produced by `set_transform_hash` (`:287-316`): it serialises the
deterministic prefix with the operator's chosen hasher and, when JSON serialisation
raises `TypeError`, falls back to hashing the concatenated class names (`:308-315`) —
the graded fallback the technique describes. The docstring's disclaimer is at
`:206-210`: the transform hash makes the dataset "robust to changes in transforms.
This, however, is not guaranteed ... If in doubt, it is advisable to clear the cache
directory." Two deviations: `hash_transform` defaults to `None` (`:235`, "Default to
None (no hash)"), so the advisory hash is off unless requested; and there is no clear
command — `set_data` (`:317-325`) does `shutil.rmtree` on the cache directory when the
records are replaced, which is the invalidation-on-replacement rule, but an operator
who has only changed a parameter clears the directory by hand.

**The read.** `:391-400`: if the file exists, `torch.load(hashfile,
weights_only=self.weights_only)` inside a handler. An `UnpicklingError`, or a
`RuntimeError` whose message says "Invalid magic number; corrupt file", produces
`warnings.warn(f"Corrupt cache file detected: {hashfile}. Deleting and recomputing.")`
and `hashfile.unlink()` — unlink, log, fall through to miss. Any other `RuntimeError`
re-raises. The docstring at `:213-219` names the systematic version of this case:
because loading is `weights_only=True` by default, "any other object type may be
stored but will fail to load and force a cache recompute" — a cache that is full and
all-miss, with one warning per item to say so, which is the technique's requirement
that corrupt be spelled differently from missing.

**The write.** `:402` runs the head on `deepcopy(item_transformed)` with the comment
`# keep the original hashed` — the record was hashed before the head mutated it.
`:405-424` then writes: a `tempfile.TemporaryDirectory()` context, `torch.save` into
`Path(tmpdirname) / hashfile.name`, and `shutil.move(str(temp_hash_file), hashfile)`
guarded by `if temp_hash_file.is_file() and not hashfile.is_file()` with
`FileExistsError` passed — many workers may compute the same entry and the first
rename wins. The context manager is the temporary's reaper: an exception anywhere in
the block removes the directory and its half-written file. The code's own comment
(`:406-408`) says why: "a nearly atomic rename operation to make the cache more
robust to manual killing of parent process which may leave partially written cache
files in an incomplete state."

The comment's word "nearly" is the deviation. The temporary lives in the system
temporary directory, not in `cache_dir`, and when the two are on different
filesystems `shutil.move` degrades to copy-then-delete, which is exactly the
non-atomic write the technique exists to prevent. The standard — temporary in the
same directory, rename within it — stays; the repo's choice is safe on a single-volume
machine and not on a cache directory mounted from shared storage, and the docstring
does not say which. A `PermissionError` on the move is swallowed (`:423-424`, citing
issue #3613) and one on the load is swallowed only on Windows (`:394-396`), so on that
platform a locked file falls through to recompute rather than raising.
