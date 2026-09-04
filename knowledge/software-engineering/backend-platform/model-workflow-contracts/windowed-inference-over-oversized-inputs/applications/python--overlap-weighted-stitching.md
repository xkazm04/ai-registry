---
layer: application
type: application
subject: windowed-inference-over-oversized-inputs
technique: overlap-weighted-stitching
stack: python
status: forged
verified_on: 2026-09-03
verified_against: python@3.10
---

# A medical-imaging toolkit's sliding-window inferer: two canvases, one division, and a schedule-derived normaliser

MONAI's `sliding_window_inference` (`monai/inferers/utils.py`, pinned at commit
`02201b8600df372cb425f2bb8e0cb7addd0df50f`, `requires-python >=3.10` in
`pyproject.toml:20`) is the reference realisation of the two-canvas rule on
PyTorch tensors, and it is worth reading precisely because it also realises the
three sibling concerns — the positive weight floor, the resolution scale and the
band buffer — in the same two hundred lines. The `SlidingWindowInferer` class
that wraps it (`monai/inferers/inferer.py:446`) exposes the parameters; the
release note that generalised it into `PatchInferer`
(`docs/source/whatsnew_1_2.md`, "Modular patch inference") names the split it
kept: splitting, per-patch processing and merging are separable, and the merging
rule below is the one that survived the generalisation unchanged.

## The schedule

`_get_scan_interval` (`utils.py:399-421`) computes `int(roi_size * (1 -
overlap))` per axis and floors it at one (`:419`); when the window equals the
input on an axis the interval is the window, so there is exactly one position.
`dense_patch_slices` (`monai/data/utils.py:163-203`) lays the windows out and
pulls the last one back: `start_idx -= max(start_idx + patch_size - image_size,
0)` (`data/utils.py:197`). That single line is why the coverage is irregular at
the far edge of every axis and why nothing downstream may assume a coverage
count. When the window exceeds the input on any axis, the input is padded first
and the padding recorded; the crop that removes it is at `utils.py:338-347`.

## The two canvases

The numerator canvas and the count map are allocated on the first window, once
per output head, at `utils.py:300-306`: the output tensor at the output shape
and the count map as a single-channel tensor of the same spatial shape. The
count map is then filled in one pass over the slice list — `for __s in slices:
count_map_list[-1][..., *__s] += w_t_` (`:307-310`) — before any prediction is
accumulated. This is the upward lesson the draft took from the tree: the
normaliser is a function of the schedule and the weight map alone, and the tree
builds it that way rather than incrementally beside the numerator. The weight
map `w_t_` is moved to the canvas device once (`:306`) rather than per window.

Each window's prediction is multiplied by the weight in place (`sw_device_buffer[ss]
*= w_t`, `:322`), moved to the canvas device (`:323`), and added at its output
coordinates by `_compute_coords` (`:387-396`, the `out[...] += p` at `:396`).
The division happens exactly once, after the loop: `output_image_list[ss] /=
count_map_list.pop(0)` (`:333-334`). Constant blending is realised as the
technique states — `compute_importance_map` returns `torch.ones(patch_size)`
for `BlendMode.CONSTANT` (`data/utils.py:1093`) and the same accumulate-and-
divide path runs; the vocabulary is the two-member `BlendMode` enum
(`monai/utils/enums.py:197-203`).

Windows are run in batches of `sw_batch_size`; the batch is assembled by
concatenating the sliced windows and moving the result to the window device
(`utils.py:240-256`), and an optional conditioning tensor is sliced with the
same coordinates so it stays aligned (`:247-256`).

## Where the tree falls short of the standard

The integrality obligation for resolution-decoupled outputs is documented as a
recommendation to the caller (`utils.py:70-72`: choose parameters so that
`overlap*roi_size*output_size/input_size` is an integer) and not checked; the
slice coordinates are truncated with `int()` at `:394` and the padding crop
uses `round()` at `:345-346`, so a violating configuration misaligns silently.
The standard checks at the entry and refuses. In buffered mode the resolution
scale is not applied at all (`z_scale` is computed only when `not buffered`,
`:296`) and only the first output head is accumulated (`:277`, "len(seg_tuple)
> 1 is currently ignored") — a multi-head or resolution-changing model under the
band buffer loses heads without an error, which the standard treats as a
refusal condition rather than a documented limitation.

## What to take from it

Read `:300-310` and `:333-334` together and the whole rule is visible: one
allocation each, one pass for the normaliser, one division. The parts of the
function around them — the band buffer at `:274-284` and `:311-321`, the
resolution scale at `:296-298` — are additions to that skeleton, not
modifications of it, which is the shape a stitcher should keep.
