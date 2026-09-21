"""sheet_distance - the discrimination metric for render-proof sheets (intake 2.10.0).

    blender --background --factory-startup --python-exit-code 2 --python sheet_distance.py -- <a.png> <b.png>
    blender --background --factory-startup --python-exit-code 2 --python sheet_distance.py -- --selftest

Two outputs are only worth an operator's look if they differ by more than the same approach
differs from itself. `render-triage.mjs sheet` enforces that from a `discrimination` record; this
computes the record's numbers, so the metric is a shipped instrument instead of a scratch script
rewritten each run.

  masked_mean_abs      mean absolute RGB difference (0-255) over pixels that are foreground in
                       EITHER image. Foreground = any channel more than 12 levels from the
                       median colour of the image border. A whole-frame mean was measured
                       refusing real differences because a small subject leaves most pixels as
                       identical background; masking removes that dilution.
  silhouette_distance  1 - IoU of the two foreground masks - a secondary read of shape change.
  fg_share             share of the frame that is foreground in either image.

It cannot say which image is better, only whether there are two different things to look at.
Images must share dimensions. Uses only Blender's bundled Python (bpy + numpy): no installs.
Exit: 0 measured, 2 could not run. The self-test asserts identical images measure 0 and a
shifted subject measures above 0 on both metrics.
"""
import json
import os
import sys
import tempfile

import bpy
import numpy as np

BG_THRESHOLD = 12


def load(path):
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, img.channels)[..., :3] * 255.0
    bpy.data.images.remove(img)
    return px


def foreground(a):
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    return (np.abs(a - bg) > BG_THRESHOLD).any(axis=2)


def measure(pa, pb):
    a, b = load(pa), load(pb)
    if a.shape != b.shape:
        raise ValueError(f"size mismatch {a.shape} vs {b.shape}")
    ma, mb = foreground(a), foreground(b)
    union = ma | mb
    if not union.any():
        return {"masked_mean_abs": 0.0, "silhouette_distance": 0.0, "fg_share": 0.0}
    return {"masked_mean_abs": round(float(np.abs(a - b)[union].mean()), 2),
            "silhouette_distance": round(1.0 - float((ma & mb).sum()) / float(union.sum()), 3),
            "fg_share": round(float(union.mean()), 3)}


def write_png(path, rgb):
    h, w, _ = rgb.shape
    img = bpy.data.images.new("tmp", w, h, alpha=True)
    rgba = np.concatenate([rgb / 255.0, np.ones((h, w, 1), dtype=np.float32)], axis=2)
    img.pixels = rgba.astype(np.float32).ravel()
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


def selftest():
    d = tempfile.mkdtemp(prefix="sheet_distance_")
    base = np.full((80, 120, 3), 90.0, dtype=np.float32)
    one = base.copy()
    one[20:50, 20:50] = 220.0
    two = base.copy()
    two[20:50, 60:90] = 220.0
    p1, p1b, p2 = (os.path.join(d, n) for n in ("one.png", "one_copy.png", "two.png"))
    write_png(p1, one)
    write_png(p1b, one)
    write_png(p2, two)
    same, moved = measure(p1, p1b), measure(p1, p2)
    problems = []
    if same["masked_mean_abs"] != 0.0 or same["silhouette_distance"] != 0.0:
        problems.append(f"identical images measured {same}")
    if moved["masked_mean_abs"] <= 0.0 or moved["silhouette_distance"] <= 0.0:
        problems.append(f"shifted subject measured {moved}")
    for p in (p1, p1b, p2):
        os.remove(p)
    os.rmdir(d)
    print("SHEETDIST_SELFTEST " + json.dumps({"selftest": "ok" if not problems else "failed",
                                              "problems": problems, "same": same, "moved": moved}))
    sys.exit(0 if not problems else 2)


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if args == ["--selftest"]:
        selftest()
    if len(args) != 2:
        print("SHEETDIST_CANNOT usage: -- <a.png> <b.png> | -- --selftest")
        sys.exit(2)
    try:
        result = measure(*args)
    except Exception as e:
        print(f"SHEETDIST_CANNOT {e}")
        sys.exit(2)
    print("SHEETDIST " + json.dumps(result))
    sys.exit(0)


main()
