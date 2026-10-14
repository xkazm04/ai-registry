---
layer: application
type: application
subject: optional-dependency-degradation
technique: misconfiguration-never-reaches-a-fallback
stack: cpp
status: forged
verified_on: 2026-10-14
verified_against: cpp@17
---

# An unset cache directory is resolved by the library, never forwarded

Read at a pinned clone of a physics-simulation library (version 0.6.4 in its `VERSION` file), with the C++ standard witnessed by `ovphysx/CMakeLists.txt:51 "set(CMAKE_CXX_STANDARD 17)"`. The library caches cooked collision shapes through a local datastore that needs a directory, and the host application may or may not supply one. The decision record that governs it is `ovphysx/plc/adr/ADR-0001-cooked-collider-cache-location.md`, whose status is `proposed`: it says the policy has been in force since 0.5 while the record itself awaits owner sign-off.

## The defect the order removes

Leaving the setting empty let the datastore's default service pick a path relative to the interpreter directory. On a standard Linux virtual environment that resolved to a system directory the process cannot write, and two error lines were logged on every scene attach. The record states the lesson in one sentence: `ovphysx/plc/adr/ADR-0001-cooked-collider-cache-location.md:41 "Declining to choose delegates the choice rather than avoiding it"`. It also records the reviewer's objection that fixed the input channel: `ovphysx/plc/adr/ADR-0001-cooked-collider-cache-location.md:31 "Please no env variables, this is something that the app should provide"`.

## The resolution order as implemented

`configureUjitsoLocalCache` in `ovphysx/src/CarboniteLoader/CarboniteLoader.cpp` runs before the plugins load and walks four steps.

0. It returns early when there is nothing to cache to: `ovphysx/src/CarboniteLoader/CarboniteLoader.cpp:832 "if (!settings->getAsBool("` covers the datastore or cooking being switched off by the host.
1. A configured directory is created if needed and accepted only if the write probe passes: `ovphysx/src/CarboniteLoader/CarboniteLoader.cpp:846 "if (std::filesystem::is_directory(dir, ec) && canWriteInto(dir))"`. The probe is an exclusive create of a uniquely named file, `O_CREAT | O_EXCL | O_NOFOLLOW` on POSIX and `CREATE_NEW` on Windows, removed straight away (`ovphysx/src/CarboniteLoader/CarboniteLoader.cpp:774 "O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW"`). A failure logs a warning and falls through.
2. Otherwise `createProcessCacheDir` makes a fresh directory under the OS temp root: `mkdtemp` on POSIX (unpredictable name, owner-only mode), a random-token `create_directory` on Windows that fails rather than adopting an existing entry. It refuses a relative temp root: `ovphysx/src/CarboniteLoader/CarboniteLoader.cpp:792 "if (ec || !tempRoot.is_absolute())"`. Removal is registered with `atexit` as well as the loader's shutdown, and the use is logged with "Cooked colliders are discarded at shutdown".
3. If that fails too, the local datastore is turned off and a warning says collision cooking runs uncached: `ovphysx/src/CarboniteLoader/CarboniteLoader.cpp:857 "settings->setBool("`. The comment above it names the reason, which is to avoid the default's unwritable app-directory path.

The rejected alternative of disabling the datastore whenever the setting is unset is therefore used only here, as the last rung, because the record's table says that disabling alone leaves a different error and silent uncached work.

## What the three tests assert

All three are in `ovphysx/tests/python_tests/test_ujitso_cooking_cache.py` and launch a child process with a private temp root.

- `ovphysx/tests/python_tests/test_ujitso_cooking_cache.py:176 "def test_unset_cache_dir_is_quiet_and_persists_nothing"`: no datastore error lines, and on POSIX no `ovphysx-cache-*` directory left in the temp root. On Windows the leftover check is skipped because cleanup is best-effort there.
- `ovphysx/tests/python_tests/test_ujitso_cooking_cache.py:279 "def test_unwritable_configured_dir_falls_back_without_errors"`: a directory made read-only yields no datastore errors. It asserts the absence of errors, not that the fallback directory was the one used, and it skips on Windows and under root.
- `ovphysx/tests/python_tests/test_ujitso_cooking_cache.py:303 "def test_configured_cache_dir_is_used_not_the_fallback"`: a usable configured directory receives the cooked data and no process-private directory is created. This is the half that keeps the fallback from swallowing a good configuration.

## What this realization cannot do

- Nothing tests rung three. No test makes the temp root unusable and asserts the uncached path, so the last rung is reasoned from the code, not exercised.
- The probe proves writability at startup only. A directory that fills or is revoked later is the datastore's problem, outside this order.
- The location is applied once, at the first runtime bootstrap in a process, so a different directory in a second configuration is ignored without notice. The record leans toward making that an error and has not.
- The temp root still follows the platform's temporary-directory variables, which the record names as the one exception to reading no environment.
- The record leaves two questions open: whether to ship a persistent per-user default (reversing the decision, leaning no), and whether the datastore will gain a memory-only mode, which the record names as its revisit trigger. It has no owner sign-off.
