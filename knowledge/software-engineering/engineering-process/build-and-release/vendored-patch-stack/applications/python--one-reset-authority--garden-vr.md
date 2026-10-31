---
layer: application
type: application
subject: vendored-patch-stack
technique: one-reset-authority
stack: python
verified_on: 2026-10-31
verified_against: python@3.12
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A patch that rides as an uncommitted edit hides every other edit

The stack version is witnessed by the tree's own host installer, which resolves
CUDA wheels for `cp312` (`tools/gen3d/install_trellis_host.py`, the `"312"`
argument). The tree is garden-vr, a public repository, read at `59ad3e5` and
changed at `89f7767`.

## The seam

garden-vr generates 3D props locally through ComfyUI with the ComfyUI-TRELLIS2
custom node. Both upstreams live outside the repository, under one machine root,
as `git clone --depth 1` checkouts at the commits `tools/gen3d/pins.json`
records. One upstream bug is carried as `tools/gen3d/patches/trellis2-device-arg.patch`,
applied by hand with `git apply`, so in the live tree the patch is an
**uncommitted edit** to the node's `model.py`. ComfyUI ignores `/models/` and
`/custom_nodes/`, so the weights (about 12 GB when present) are ignored files
*inside* the vendored ComfyUI checkout. The README described how to build the
tree and said nothing about how to reset it. There was no reset command at all.

This is the technique's case exactly: a build workspace that is also a
version-control checkout, with no single destroyer. It is also a seam that could
falsify the technique's "When not to use it" clause, because the trees themselves
are cheap. Re-checking out a pin from the clone's own object store and
re-applying one patch takes seconds. Had the ladder been ceremony here, the
right landing would have been one target and no grades.

## A and B

Fixtures were local depth-1 clones of the live trees at the pinned commits, with
the patch applied, a stand-in weights file under `models/` and a `__pycache__`.
A fresh copy was used for each case.

- **Arm A:** the version-control habit, with `git status` as the detector.
- **Arm B:** `tools/gen3d/vendored.py`, which provides:
  - `check`: does each tree equal its pin plus its patches? It compares the
    worktree against a throwaway index built as `read-tree <pin>` +
    `apply --cached <patch>`.
  - Grades named by what they keep: `bytecode`, `tree` (saves any drift as a
    `.diff` first), and `reinstall`, which only prints the manual steps.

| case | A | B |
| --- | --- | --- |
| hand fix inside the already-patched file | `git status` byte-identical to the clean patched tree: invisible | `check` exit 1, names the file |
| `git checkout -- .` in the node tree | patch gone (0 of 2 lines), 0 status lines: looks pristine | `check` exit 1; `reset tree` restores 2 of 2 lines, `check` exit 0 |
| `git clean -fdx` at the ComfyUI root | stand-in weights deleted | `reset bytecode` drops `__pycache__`, weights kept |

- **Target:** decay or reset paths that end detected or restored with the
  expensive layer kept went from 0 of 3 to 3 of 3.
- **Floor:**
  - On a clean patched tree, `check` exits 0, so there is no false alarm.
  - `reset tree` is idempotent.
  - Its output `model.py` matches the live patched file in content. Only line
    endings differ.
  - Upstream's `HEAD` still equals the pin, so the README's fresh clone
    reproduces the pin today.

`arena_local.sh` now runs `check` before generating, so drift fails the arena at
its first line rather than minutes into a model load.

Run against the live machine root, read-only, the check found real drift. The
node tree was clean. The ComfyUI tree had 36 tracked `models/` placeholder files
deleted, left there by a wholesale wipe of the machine's model stores. Neither
git habit nor the README would ever have said so.

## What the tree says about the technique

**Cheapness is a property of everything the tree holds, not of its tracked files.**
The tracked trees here are cheap, so the "When not to use it" clause seemed to
apply. But an ignore rule puts the most expensive layer inside the same directory.
The one command that sees ignored files, version control's clean, deletes exactly
that layer. The grades still paid. The question to ask is what the directory
contains, ignored files included.

**When the patch rides as an uncommitted edit, version control's view of the tree
stops being evidence.** A clean patched tree and a patched tree carrying a hand fix
show the same status line. The detector has to compare against pin plus patches,
not against `HEAD`. The tree's second identity, which the technique treats as the
hazard, then supplies the instrument: a throwaway index gives the
re-materialization test's answer without re-materializing. This is one sighting,
banked in the subject note rather than written into the technique.

## What the realization cannot do

- The guard is documentary plus a preflight. Nothing stops `git clean -fdx` from
  running in the machine root. The strong form, failing the destructive command
  itself, is not available without wrapping git.
- The check covers the two pinned trees. A third custom node present on the
  machine is in neither `pins.json` nor the README, so it is outside the
  authority.
- The patch list lives in the script, so a new patch file must be added there too.
- `reinstall` is deliberately not automated. The venv and the weights are still
  rebuilt from prose.
