"""family.py - compose N labelled columns of screenshots into one image per view.

A "family" is the same view (size + theme) of the same surface shot under several variants:
current vs contest entries, before vs after, three kit candidates. Each column is one
variant; each output image is one view with every variant side by side and a label strip,
so an owner compares like with like instead of flipping between files.

    python family.py --col "Current=shots/current/home" --col "A=shots/a/home" \
                     [--col ...] [--views 1920x1080-dark,1280x800-light] --out family/ \
                     [--name family] [--gap 16] [--strip 56] [--font-size 30] \
                     [--skip-missing] [--dry-run]

--col "Label=dir/prefix": images are dir/prefix-<view>.png; with an empty prefix
("Label=dir/") they are dir/<view>.png. Without --views, the views are discovered: every
<view> suffix present in ALL columns. Images are resized to the first column's size.
Output: <out>/<name>-<view>.png, one path printed per line.

Requires Pillow (python -m pip install Pillow) for composing; --dry-run only lists the plan
and needs nothing beyond the standard library.
"""
import argparse
import os
import sys


def parse_col(spec):
    """'Label=dir/prefix' -> (label, dir, prefix)."""
    if "=" not in spec:
        raise ValueError('--col expects "Label=dir/prefix", got %r' % spec)
    label, target = spec.split("=", 1)
    label, target = label.strip(), target.strip()
    if not label or not target:
        raise ValueError('--col expects "Label=dir/prefix", got %r' % spec)
    target = target.replace("\\", "/")
    if target.endswith("/"):
        return label, target.rstrip("/") or ".", ""
    d, prefix = os.path.split(target)
    return label, d or ".", prefix


def image_path(d, prefix, view):
    return os.path.join(d, ("%s-%s.png" % (prefix, view)) if prefix else ("%s.png" % view))


def views_in(d, prefix):
    """Every <view> for which dir/prefix-<view>.png exists."""
    if not os.path.isdir(d):
        raise ValueError("column directory does not exist: %s" % d)
    head = prefix + "-" if prefix else ""
    out = set()
    for name in os.listdir(d):
        if name.lower().endswith(".png") and name.startswith(head):
            v = name[len(head):-4]
            if v:
                out.add(v)
    return out


def discover_views(cols):
    common = None
    for _, d, prefix in cols:
        v = views_in(d, prefix)
        common = v if common is None else common & v
    return sorted(common or [])


def load_font(size):
    from PIL import ImageFont
    for name in ("segoeuib.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf", "arialbd.ttf", "Helvetica.ttc"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def compose(cols, view, out_path, gap, strip, font):
    from PIL import Image, ImageDraw
    imgs = [Image.open(image_path(d, p, view)).convert("RGB") for _, d, p in cols]
    w, h = imgs[0].size
    n = len(imgs)
    canvas = Image.new("RGB", (w * n + gap * (n - 1), h + strip), (12, 12, 14))
    draw = ImageDraw.Draw(canvas)
    size = getattr(font, "size", 12)
    ty = max(4, (strip - size) // 2)
    for i, (img, (label, _, _)) in enumerate(zip(imgs, cols)):
        x = i * (w + gap)
        canvas.paste(img if img.size == (w, h) else img.resize((w, h)), (x, strip))
        draw.text((x + 16, ty), "%s  \u00b7  %s" % (label, view), fill=(235, 235, 240), font=font)
    canvas.save(out_path)


def main(argv):
    ap = argparse.ArgumentParser(description="Compose labelled screenshot columns, one image per view.")
    ap.add_argument("--col", action="append", required=True, help='"Label=dir/prefix" (repeatable, >= 2 columns)')
    ap.add_argument("--views", default="", help="comma list of view suffixes; default: those present in every column")
    ap.add_argument("--out", required=True)
    ap.add_argument("--name", default="family")
    ap.add_argument("--gap", type=int, default=16)
    ap.add_argument("--strip", type=int, default=56)
    ap.add_argument("--font-size", type=int, default=30)
    ap.add_argument("--skip-missing", action="store_true", help="skip a view some column lacks instead of failing")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args(argv)
    try:
        cols = [parse_col(c) for c in a.col]
        views = [v.strip() for v in a.views.split(",") if v.strip()] or discover_views(cols)
    except ValueError as e:
        print("family: %s" % e, file=sys.stderr)
        return 2
    if len(cols) < 2:
        print("family: need at least two --col columns", file=sys.stderr)
        return 2
    if not views:
        print("family: no view is present in every column - check the dir/prefix of each --col", file=sys.stderr)
        return 2
    plan = []
    for v in views:
        missing = [image_path(d, p, v) for _, d, p in cols if not os.path.isfile(image_path(d, p, v))]
        if missing:
            if a.skip_missing:
                print("family: skip %s (missing %s)" % (v, ", ".join(missing)), file=sys.stderr)
                continue
            print("family: view %s is missing %s (pass --skip-missing to skip it)" % (v, ", ".join(missing)), file=sys.stderr)
            return 2
        plan.append((v, os.path.join(a.out, "%s-%s.png" % (a.name, v))))
    if a.dry_run:
        for v, p in plan:
            print("%s <- %s" % (p, " | ".join(image_path(d, pr, v) for _, d, pr in cols)))
        return 0
    try:
        import PIL  # noqa: F401
    except ImportError:
        print("family: Pillow is required to compose images: python -m pip install Pillow", file=sys.stderr)
        return 3
    os.makedirs(a.out, exist_ok=True)
    font = load_font(a.font_size)
    for v, p in plan:
        compose(cols, v, p, a.gap, a.strip, font)
        print(p)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
