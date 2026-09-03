---
layer: application
type: application
subject: optional-dependency-degradation
technique: minimal-install-test-lane
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# A lane that runs the suite with every extra absent, and a list that refuses to rot

The same deep-learning toolkit whose lazy-import helper is described in [python--guarded-singleton-accessor](./python--guarded-singleton-accessor.md) (MONAI, pinned at commit `02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python = ">=3.10"` in `pyproject.toml:20`) carries the proof obligation that application named and did not show: a minimal-requirements lane, invoked as `./runtests.sh --min` (`runtests.sh:690-694`, which runs `python -m tests.min_tests` with coverage switched off) and wired into `.github/workflows/cicd_tests.yml:159,245`, `docker.yml:97` and `release.yml:63`. `CONTRIBUTING.md:194-232` ("Adding new optional dependencies") states the contributor's half: optional APIs are always invoked lazily, "integration tests with minimal requirements are deployed to ensure this strategy", and a test that uses a third-party package either skips on the helper's boolean or is kept out of the lane.

## The lane

`tests/min_tests.py` is the lane. Its `run_testsuit()` opens with the exclusion list, `exclude_cases`, at `tests/min_tests.py:31-221` — 189 module stems, each a test module that needs an extra. Two assertions follow and they are the technique's self-validation:

- `:222` — `assert sorted(exclude_cases) == sorted(set(exclude_cases))`, failing with the list printed if any entry is duplicated.
- `:224-237` — the test tree is walked (`rglob("test_*.py")`), each module whose stem is in the list is removed from the list as it is skipped (`:230-232`), and whatever remains is by definition stale: `:237` is `assert not exclude_cases, f"items in exclude_cases not used: ..."`.

The `__main__` block (`:242-252`) runs the cheaper proof first: `load_submodules(sys.modules["monai"], True)` imports every submodule of the package and asserts the error list is empty, so an optional import promoted to a hard one fails here, by module name, before any test is collected. The exit status is `int(not result.wasSuccessful())` (`:252`).

**Deviation, recorded against the technique's "print the entry as written" rule.** Line `:236` rewrites each leftover entry to a path before the assertion: `str(list(Path(__file__).parent.rglob(f"*{et}*"))[0])`. For a stale entry that still matches *some* file by substring, that yields a helpful path. For an entry that matches nothing on disk — the commonest stale case, a typo or a deleted module — the `[0]` raises `IndexError` before `:237` runs, so the lane still fails but no longer names the entry. The standard stays: list the entry as written.

## The skip decorators and the capability probe

`tests/test_utils.py:231-253` defines `SkipIfNoModule` and `SkipIfModule`; both read `optional_import(self.module_name)[1]`, the helper's own boolean, and wrap `unittest.skipIf`. `tests/test_utils.py:332-354` is the probe for the class of extra the boolean cannot vouch for: `has_cupy()` imports the package, returns the bare boolean when not in the main test process (`is_main_test_process()`), and otherwise builds a two-by-three array, compiles and runs an `ElementwiseKernel`, frees the memory pool and returns the kernel's result — any exception yields `False`. `HAS_CUPY = has_cupy()` (`:355`) computes it once per process.

## The proxy's shape

`monai/utils/module.py:340-343` documents `as_type`: `"default"` raises on the first call, `"decorator"` lets the constructor succeed and raises on the second call, anything else returns a lazy class usable as a base class that raises on construction. The realization is `_LazyRaise` (`:409-427`) — `__getattr__` and `__call__` raise the stored `OptionalImportError`, and `__getitem__`/`__iter__` at `:435-439` extend that to subscript and iteration — and `_LazyCls(_LazyRaise)` at `:444-451`, whose `__init__` raises unless `as_type` starts with `"decorator"`.

The traceback rule is at `monai/utils/module.py:389-393`: in the `except` branch the traceback is formatted with `traceback.format_exception(...)` into `tb_str`, then `import_exception.__traceback__ = None`, and only the strings are captured by `_LazyRaise`, which appends `tb_str` under "Original traceback:" when building its message (`:417-418`). `CHANGELOG.md:46` records this as the 1.6.0 fix, "Fix memory leak in `optional_import` traceback handling (#8782)".

`require_pkg` at `monai/utils/module.py:454-490` is the warn-or-raise gate: a decorator over a function or a class's `__init__` that calls `optional_import` at first invocation and, when the package is absent, raises `OptionalImportError` by default or, with `raise_error=False`, emits `warnings.warn` and proceeds into the body. The choice is a keyword at the declaration site, which is the technique's "opted into by name" rule.

## What this realization cannot do

The exclusion is keyed on the module stem only (`:229`), so two test modules with the same stem in different directories would consume one entry between them, and the second would be collected. And the lane is a whole-module instrument: a single case inside an otherwise-portable module still has to skip itself, which is why both mechanisms exist.
