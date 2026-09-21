"""pose_sheet - the video-free presentation for 3D render proofs (intake 2.10.0).

    blender --background --factory-startup --python-exit-code 2 --python pose_sheet.py -- <rig_or_scene.blend> <spec.json> <out.png> [<arm_script.py>]
    blender --background --factory-startup --python-exit-code 2 --python pose_sheet.py -- --selftest

Operator direction, 2026-09-14: comparisons must not depend on generating video. A 3D arm is
shown as ONE still image - its key poses in columns, fixed cameras in rows - rendered from the
arm's own scene. Clips were the presentation that failed twice: generated references did not
honour speed instructions, and an engine capture pass returned 7 of 16 screenshots. Blender stills
rendered every frame requested across both runs.

What makes two sheets comparable, and therefore blind-triageable:
  - IDENTICAL FRAMING for every arm on one subject: orthographic cameras whose centre and scale
    come from the subject's REST bounds (or from `frame` in the spec), never from the posed
    bounds of the arm being rendered - a wider swing must not shrink its own character.
  - Workbench studio light, a ground plane, object colours: deterministic, no sampling noise, so a
    pixel difference is a geometry or pose difference.
  - No text on the sheet. The run id, the arm and the frame numbers go into `<out>.json`, which
    the operator never sees before revealing.
  - The sampling is declared: with an arm script, frames are either listed in the spec or sampled
    `samples` times at an even stride where one exists, and the kept-of-available and the actual
    frames are written beside the sheet.

spec.json:
  {"armature": "<optional>", "hide": ["<object names to hide>"],
   "poses": [{"name": "rest", "bones": {}}, {"name": "top", "bones": {"upper_arm.R": [-150, 0, 0]}}],
   "frames": [1, 17, 24, 40],          # OR, with an arm script, explicit frames
   "samples": 6,                        # OR sampled frames when neither poses nor frames are given
   "cameras": [{"yaw_deg": -60, "elev_deg": 8}, {"yaw_deg": 30, "elev_deg": 8}],
   "frame": {"center": [0, 0, 1.2], "size_m": 4.0},   # optional; default = rest bounds x headroom
   "headroom": 1.35, "cell_px": 400}
An arm script defines `animate(armature)` exactly as the director's animation harness expects.

Exit: 0 rendered, 2 could not run. The self-test renders a two-bone fixture at two poses from two
cameras and asserts the sheet's size, that it is not blank, and that the two pose columns differ.
"""
import json
import math
import os
import runpy
import sys
import tempfile

import bpy
import numpy as np
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))


class CannotRun(Exception):
    pass


def reset_pose(arm):
    for pb in arm.pose.bones:
        pb.location = (0, 0, 0)
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0, 0, 0)
        pb.scale = (1, 1, 1)


def rest_bounds(objs):
    pts = [o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx


def cells_for(spec, arm, arm_script):
    """Returns a list of (label, setter) - each setter puts the scene into one column's state."""
    if spec.get("poses"):
        def pose_setter(pose):
            def s():
                arm.animation_data_clear()
                reset_pose(arm)
                for name, deg in pose.get("bones", {}).items():
                    pb = arm.pose.bones.get(name)
                    if pb is None:
                        raise CannotRun(f"pose '{pose.get('name')}' names a missing bone {name}")
                    pb.rotation_euler = tuple(math.radians(d) for d in deg)
                bpy.context.view_layer.update()
            return s
        return [(p.get("name", f"pose{i}"), pose_setter(p)) for i, p in enumerate(spec["poses"])], None
    if not arm_script:
        raise CannotRun("spec has no poses and no arm script was given")
    arm.animation_data_clear()
    reset_pose(arm)
    runpy.run_path(arm_script)["animate"](arm)
    act = arm.animation_data.action if arm.animation_data else None
    if not act:
        raise CannotRun("arm script created no action")
    f0, f1 = int(act.frame_range[0]), int(act.frame_range[1])
    available = f1 - f0 + 1
    if spec.get("frames"):
        frames = [int(f) for f in spec["frames"]]
        sampling = {"kind": "listed", "frames": frames, "available": available}
    else:
        kept = int(spec.get("samples", 6))
        stride = (available - 1) / (kept - 1) if kept > 1 else 0
        frames = [round(f0 + k * stride) for k in range(kept)]
        even = kept > 1 and (available - 1) % (kept - 1) == 0
        gaps = sorted({frames[i + 1] - frames[i] for i in range(len(frames) - 1)})
        sampling = {"kind": "sampled", "kept": kept, "available": available, "frames": frames,
                    "stride": int(stride) if even else None, "gaps": None if even else gaps,
                    "note": "frames between samples were removed by the sampler, not missing from the motion"}

    def frame_setter(f):
        def s():
            bpy.context.scene.frame_set(f)
        return s
    return [(f"frame{f}", frame_setter(f)) for f in frames], sampling


def render_sheet(spec, out_png, arm_script=None):
    sc = bpy.context.scene
    arms = [o for o in sc.objects if o.type == "ARMATURE"]
    arm = sc.objects.get(spec["armature"]) if spec.get("armature") else (arms[0] if len(arms) == 1 else None)
    if arm is None:
        raise CannotRun(f"armature not found or ambiguous ({len(arms)})")
    for name in spec.get("hide", []):
        o = sc.objects.get(name)
        if o:
            o.hide_render = True
    arm.hide_render = True
    meshes = [o for o in sc.objects if o.type == "MESH" and not o.hide_render]
    if not meshes:
        raise CannotRun("no visible mesh to render")

    arm.animation_data_clear()
    reset_pose(arm)
    bpy.context.view_layer.update()
    mn, mx = rest_bounds(meshes)
    if spec.get("frame"):
        center, size = Vector(spec["frame"]["center"]), float(spec["frame"]["size_m"])
    else:
        center = (mn + mx) / 2
        size = max(mx.x - mn.x, mx.y - mn.y, mx.z - mn.z) * float(spec.get("headroom", 1.35))
    ground_z = mn.z

    cells, sampling = cells_for(spec, arm, arm_script)

    bpy.ops.mesh.primitive_plane_add(size=size * 3, location=(center.x, center.y, ground_z))
    ground = bpy.context.object
    ground.color = (0.32, 0.33, 0.35, 1)
    for o in meshes:
        o.color = (0.78, 0.76, 0.72, 1)
    world = bpy.data.worlds.new("W")
    world.color = (0.09, 0.09, 0.11)
    sc.world = world
    sc.render.engine = "BLENDER_WORKBENCH"
    sh = sc.display.shading
    sh.light, sh.color_type, sh.show_cavity, sh.show_shadows = "STUDIO", "OBJECT", True, True
    px = int(spec.get("cell_px", 400))
    sc.render.resolution_x = sc.render.resolution_y = px
    sc.render.image_settings.file_format = "PNG"
    cam = bpy.data.objects.new("SheetCam", bpy.data.cameras.new("SheetCam"))
    sc.collection.objects.link(cam)
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = size
    cam.data.clip_end = size * 20
    sc.camera = cam

    cameras = spec.get("cameras") or [{"yaw_deg": -60, "elev_deg": 8}, {"yaw_deg": 30, "elev_deg": 8}]
    tmp = tempfile.mkdtemp(prefix="pose_sheet_")
    rows = []
    for ci, c in enumerate(cameras):
        yaw, elev = math.radians(c["yaw_deg"]), math.radians(c["elev_deg"])
        cam.location = center + Vector((math.cos(yaw) * math.cos(elev), math.sin(yaw) * math.cos(elev),
                                        math.sin(elev))) * size * 4
        cam.rotation_euler = (center - cam.location).to_track_quat("-Z", "Y").to_euler()
        row = []
        for li, (_, setter) in enumerate(cells):
            setter()
            path = os.path.join(tmp, f"c{ci}_{li}.png")
            sc.render.filepath = path
            bpy.ops.render.render(write_still=True)
            img = bpy.data.images.load(path, check_existing=False)
            w, h = img.size
            row.append(np.array(img.pixels[:], dtype=np.float32).reshape(h, w, img.channels))
            bpy.data.images.remove(img)
            os.remove(path)
        rows.append(np.concatenate(row, axis=1))
    os.rmdir(tmp)
    # image pixels are bottom-up: the first camera row must end on top
    sheet = np.concatenate(rows[::-1], axis=0)
    h, w, ch = sheet.shape
    out = bpy.data.images.new("sheet", w, h, alpha=(ch == 4))
    out.pixels = sheet.ravel()
    out.filepath_raw = out_png
    out.file_format = "PNG"
    out.save()
    bpy.data.images.remove(out)
    card = {"sheet": os.path.basename(out_png), "columns": [label for label, _ in cells],
            "cameras": cameras, "frame": {"center": list(center), "size_m": size, "from": "spec" if spec.get("frame") else "rest bounds"},
            "cell_px": px, "sampling": sampling}
    with open(out_png + ".json", "w", encoding="utf-8") as fh:
        json.dump(card, fh, indent=2)
    return card, (h, w)


def selftest():
    # rig_check.py runs main() at import; build the fixture by executing only its builder source
    src = open(os.path.join(HERE, "rig_check.py"), encoding="utf-8").read().split("\nmain()")[0]
    ns = {"__name__": "rig_check_fixture"}
    exec(compile(src, "rig_check.py", "exec"), ns)
    ns["build_fixture"](dirty=False)
    out = os.path.join(tempfile.mkdtemp(prefix="pose_sheet_selftest_"), "sheet.png")
    spec = {"poses": [{"name": "rest", "bones": {}}, {"name": "swing", "bones": {"upper": [90, 0, 0]}}],
            "cell_px": 120}
    card, (h, w) = render_sheet(spec, out)
    img = bpy.data.images.load(out, check_existing=False)
    px = np.array(img.pixels[:], dtype=np.float32).reshape(img.size[1], img.size[0], img.channels)[..., :3]
    bpy.data.images.remove(img)
    problems = []
    if (h, w) != (240, 240):
        problems.append(f"sheet is {w}x{h}, expected 240x240 (2 cameras x 2 poses x 120 px)")
    if float(px.std()) < 0.01:
        problems.append("sheet is blank")
    left, right = px[:, :120], px[:, 120:]
    if float(np.abs(left - right).mean()) < 0.001:
        problems.append("the two pose columns are identical - posing did not reach the render")
    for p in (out, out + ".json"):
        os.remove(p)
    os.rmdir(os.path.dirname(out))
    print("POSESHEET_SELFTEST " + json.dumps({"selftest": "ok" if not problems else "failed", "problems": problems,
                                             "columns": card["columns"]}))
    sys.exit(0 if not problems else 2)


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if args == ["--selftest"]:
        selftest()
    if len(args) not in (3, 4):
        print("POSESHEET_CANNOT usage: -- <scene.blend> <spec.json> <out.png> [<arm_script.py>] | -- --selftest")
        sys.exit(2)
    blend, spec_path, out_png = args[:3]
    arm_script = args[3] if len(args) == 4 else None
    try:
        bpy.ops.wm.open_mainfile(filepath=blend)
        with open(spec_path, encoding="utf-8") as fh:
            spec = json.load(fh)
        card, _ = render_sheet(spec, out_png, arm_script)
    except CannotRun as e:
        print(f"POSESHEET_CANNOT {e}")
        sys.exit(2)
    print("POSESHEET " + json.dumps({k: card[k] for k in ("sheet", "columns", "sampling")}))
    sys.exit(0)


main()
