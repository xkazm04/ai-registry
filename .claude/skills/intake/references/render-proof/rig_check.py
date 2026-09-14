"""rig_check - the clean-rig precondition for render-bound motion and rigging pairs (intake 2.10.0).

    blender --background --factory-startup --python-exit-code 2 --python rig_check.py -- <rig.blend> <spec.json> <out.json>
    blender --background --factory-startup --python-exit-code 2 --python rig_check.py -- --selftest

Two consecutive 3D render proofs lost their perceptual pair to the SUBJECT rather than to the
approaches under test: a proxy figure with a cube for a hand, then a generated mesh whose fist was
welded to its thigh (a torn sheet at the top of every chop) and whose axe was partly weighted to
the leg. Both times the rig was reported fine by the pass that built it. This instrument runs
before any animation or rigging arm is designed, and a subject that fails it is repaired or
banked as a lead - it is never animated for the operator to judge.

Checks, all measured on the evaluated mesh, never read off a report:
  UNWEIGHTED    a vertex with no deform-bone weight (the solve failed or skipped it)
  RIGID_SHARE   a vertex of a declared rigid part with less than `rigid_share` of its weight on
                the part's bone (a weapon partly bound to a leg)
  RIGID_DRIFT   at a declared extreme pose, a rigid-part vertex further than `rigid_dev_m` from
                where the bone's rigid transform puts it (the part stretches or lags)
  TEAR          at a declared extreme pose, more than `max_stretched_edge_share` of all edges
                longer than `stretch_ratio` times their rest length (parts fused across bones)

spec.json:
  {"armature": "<name, optional if one>", "mesh": "<name, optional if one>",
   "rigid": [{"name": "axe", "bone": "hand.R", "vertex_group": "rigid_axe"}],   # or "indices": [...]
   "poses": [{"name": "arm_overhead", "bones": {"upper_arm.R": [-150, 0, 0]}}], # local XYZ euler, degrees
   "tolerances": {"rigid_share": 0.95, "rigid_dev_m": 0.01, "stretch_ratio": 2.0,
                  "max_stretched_edge_share": 0.001}}
Declare the poses the ACTION will reach (the top of a windup, the bottom of a strike) before any
arm is keyed: a rig is clean for an action, not in general. Mark rigid parts with a NON-deform
vertex group so the marker survives renumbering - index lists broke after a topology split.

Exit: 0 clean, 1 findings, 2 could not run (usage, missing object or bone, crash).
The self-test builds a clean fixture that must pass and a dirty one - a weapon bridged to a thigh
block, weapon vertices partly on the wrong bone, one unweighted vertex - that must fail with
UNWEIGHTED, RIGID_SHARE, RIGID_DRIFT and TEAR. A check that cannot catch its planted defects has
no standing to certify a rig.
"""
import json
import math
import sys

import bpy

EXIT_PASS, EXIT_FAIL, EXIT_CANNOT = 0, 1, 2
DEFAULT_TOL = {"rigid_share": 0.95, "rigid_dev_m": 0.01, "stretch_ratio": 2.0, "max_stretched_edge_share": 0.001}


class CannotRun(Exception):
    pass


def find_objects(spec):
    sc = bpy.context.scene
    arms = [o for o in sc.objects if o.type == "ARMATURE"]
    arm = sc.objects.get(spec["armature"]) if spec.get("armature") else (arms[0] if len(arms) == 1 else None)
    if arm is None or arm.type != "ARMATURE":
        raise CannotRun(f"armature not found or ambiguous ({len(arms)} armatures in scene)")
    skinned = [o for o in sc.objects if o.type == "MESH"
               and any(m.type == "ARMATURE" and m.object == arm for m in o.modifiers)]
    mesh = sc.objects.get(spec["mesh"]) if spec.get("mesh") else (skinned[0] if len(skinned) == 1 else None)
    if mesh is None or mesh.type != "MESH":
        raise CannotRun(f"skinned mesh not found or ambiguous ({len(skinned)} meshes bound to {arm.name})")
    if not any(m.type == "ARMATURE" and m.object == arm for m in mesh.modifiers):
        raise CannotRun(f"{mesh.name} has no armature modifier pointing at {arm.name}")
    return arm, mesh


def reset_pose(arm):
    arm.animation_data_clear()
    for pb in arm.pose.bones:
        pb.location = (0, 0, 0)
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (0, 0, 0)
        pb.scale = (1, 1, 1)


def apply_pose(arm, pose):
    reset_pose(arm)
    for name, deg in pose.get("bones", {}).items():
        pb = arm.pose.bones.get(name)
        if pb is None:
            raise CannotRun(f"pose '{pose.get('name')}' names a bone the rig lacks: {name}")
        pb.rotation_euler = tuple(math.radians(d) for d in deg)
    bpy.context.view_layer.update()


def world_coords(mesh, expected):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = mesh.evaluated_get(dg)
    me = ev.to_mesh()
    if len(me.vertices) != expected:
        ev.to_mesh_clear()
        raise CannotRun(f"evaluated mesh has {len(me.vertices)} vertices, base has {expected}: a modifier "
                        f"changes topology, so per-vertex checks cannot align")
    mw = mesh.matrix_world
    co = [mw @ v.co for v in me.vertices]
    ev.to_mesh_clear()
    return co


def rigid_indices(mesh, part):
    if "vertex_group" in part:
        g = mesh.vertex_groups.get(part["vertex_group"])
        if g is None:
            raise CannotRun(f"rigid part '{part.get('name')}' names a missing vertex group {part['vertex_group']}")
        return [v.index for v in mesh.data.vertices if any(e.group == g.index and e.weight > 0 for e in v.groups)]
    if "indices" in part:
        n = len(mesh.data.vertices)
        return [i for i in part["indices"] if 0 <= i < n]
    raise CannotRun(f"rigid part '{part.get('name')}' declares neither vertex_group nor indices")


def check(spec):
    tol = {**DEFAULT_TOL, **spec.get("tolerances", {})}
    arm, mesh = find_objects(spec)
    deform = {b.name for b in arm.data.bones if b.use_deform}
    gidx = {g.index: g.name for g in mesh.vertex_groups}
    verts = mesh.data.vertices
    n = len(verts)

    unweighted = [v.index for v in verts
                  if sum(e.weight for e in v.groups if gidx.get(e.group) in deform) <= 1e-6]

    reset_pose(arm)
    bpy.context.view_layer.update()
    rest = world_coords(mesh, n)
    edges = [(e.vertices[0], e.vertices[1]) for e in mesh.data.edges]
    rest_len = [(rest[a] - rest[b]).length for a, b in edges]

    parts = []
    for part in spec.get("rigid", []):
        bone = arm.data.bones.get(part.get("bone", ""))
        if bone is None:
            raise CannotRun(f"rigid part '{part.get('name')}' names a missing bone {part.get('bone')}")
        idx = rigid_indices(mesh, part)
        low_share = []
        for i in idx:
            ws = {gidx.get(e.group): e.weight for e in verts[i].groups if gidx.get(e.group) in deform}
            tot = sum(ws.values())
            if tot <= 1e-6 or ws.get(bone.name, 0.0) / tot < tol["rigid_share"]:
                low_share.append(i)
        parts.append({"name": part.get("name"), "bone": bone.name, "vertices": len(idx),
                      "below_share": len(low_share), "idx": idx})

    poses_out = []
    for pose in spec.get("poses", []):
        apply_pose(arm, pose)
        posed = world_coords(mesh, n)
        stretched = sum(1 for (a, b), r in zip(edges, rest_len)
                        if r > 1e-6 and (posed[a] - posed[b]).length > tol["stretch_ratio"] * r)
        drift = []
        for p in parts:
            pb = arm.pose.bones[p["bone"]]
            b = arm.data.bones[p["bone"]]
            rigid = (arm.matrix_world @ pb.matrix) @ (arm.matrix_world @ b.matrix_local).inverted()
            devs = [(posed[i] - rigid @ rest[i]).length for i in p["idx"]]
            drift.append({"part": p["name"], "max_dev_m": round(max(devs), 4) if devs else None,
                          "over_tolerance": sum(1 for d in devs if d > tol["rigid_dev_m"])})
        poses_out.append({"pose": pose.get("name"), "stretched_edges": stretched,
                          "stretched_share": round(stretched / max(len(edges), 1), 5), "rigid": drift})
    reset_pose(arm)

    findings = []
    if unweighted:
        findings.append({"code": "UNWEIGHTED", "count": len(unweighted), "sample": unweighted[:10]})
    for p in parts:
        if p["below_share"]:
            findings.append({"code": "RIGID_SHARE", "part": p["name"], "bone": p["bone"],
                             "count": p["below_share"], "of": p["vertices"]})
    for po in poses_out:
        for d in po["rigid"]:
            if d["over_tolerance"]:
                findings.append({"code": "RIGID_DRIFT", "pose": po["pose"], "part": d["part"],
                                 "count": d["over_tolerance"], "max_dev_m": d["max_dev_m"]})
        if po["stretched_share"] > tol["max_stretched_edge_share"]:
            findings.append({"code": "TEAR", "pose": po["pose"], "stretched_edges": po["stretched_edges"],
                             "share": po["stretched_share"]})
    if not spec.get("poses"):
        findings.append({"code": "UNMEASURED_POSES", "note": "no extreme poses declared - tear and drift were not checked"})
    return {"verdict": "clean" if not findings else "findings", "armature": arm.name, "mesh": mesh.name,
            "vertices": n, "edges": len(edges), "tolerances": tol, "findings": findings,
            "rigid_parts": [{k: v for k, v in p.items() if k != "idx"} for p in parts], "poses": poses_out}


def build_fixture(dirty):
    """Two bones (root, upper); a root block, an upper block, a thigh block beside the weapon on
    root, and a weapon rigid on upper. Dirty: a quad welds the weapon to the thigh block, the
    weapon's bottom vertices are 60% on root, and one root vertex has no weight."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    ad = bpy.data.armatures.new("fx_arm")
    arm = bpy.data.objects.new("fx_arm", ad)
    sc.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    root = ad.edit_bones.new("root")
    root.head, root.tail = (0, 0, 0), (0, 0, 1)
    up = ad.edit_bones.new("upper")
    up.head, up.tail = (0, 0, 1), (0, 0, 2)
    up.parent, up.use_connect = root, True
    bpy.ops.object.mode_set(mode="OBJECT")

    verts, faces, weights = [], [], []

    def box(cx, cy, z0, z1, s, w):
        base = len(verts)
        for z in (z0, z1):
            for dx, dy in ((-s, -s), (s, -s), (s, s), (-s, s)):
                verts.append((cx + dx, cy + dy, z))
                weights.append(dict(w))
        for q in ((0, 1, 2, 3), (4, 7, 6, 5), (0, 4, 5, 1), (1, 5, 6, 2), (2, 6, 7, 3), (3, 7, 4, 0)):
            faces.append(tuple(base + i for i in q))
        return base

    a = box(0, 0, 0.05, 0.95, 0.2, {"root": 1.0})
    box(0, 0, 1.05, 1.95, 0.2, {"upper": 1.0})
    t = box(0.5, 0, 1.30, 1.45, 0.05, {"root": 1.0})
    w = box(0.5, 0, 1.50, 1.90, 0.05, {"upper": 1.0})
    if dirty:
        faces.append((w + 0, w + 1, t + 5, t + 4))
        for i in range(w, w + 4):
            weights[i] = {"upper": 0.4, "root": 0.6}
        weights[a] = {}
    me = bpy.data.meshes.new("fx_mesh")
    me.from_pydata(verts, [], faces)
    me.update()
    mesh = bpy.data.objects.new("fx_mesh", me)
    sc.collection.objects.link(mesh)
    for bn in ("root", "upper"):
        mesh.vertex_groups.new(name=bn)
    for i, ws in enumerate(weights):
        for bn, wt in ws.items():
            mesh.vertex_groups[bn].add([i], wt, "REPLACE")
    mesh.vertex_groups.new(name="rigid_weapon").add(list(range(w, w + 8)), 1.0, "REPLACE")
    mesh.parent = arm
    mesh.modifiers.new("Armature", "ARMATURE").object = arm
    return {"armature": "fx_arm", "mesh": "fx_mesh",
            "rigid": [{"name": "weapon", "bone": "upper", "vertex_group": "rigid_weapon"}],
            "poses": [{"name": "swing", "bones": {"upper": [90, 0, 0]}}]}


def selftest():
    clean = check(build_fixture(dirty=False))
    dirty = check(build_fixture(dirty=True))
    codes = {f["code"] for f in dirty["findings"]}
    expected = {"UNWEIGHTED", "RIGID_SHARE", "RIGID_DRIFT", "TEAR"}
    problems = []
    if clean["verdict"] != "clean":
        problems.append(f"clean fixture reported findings: {clean['findings']}")
    if not expected <= codes:
        problems.append(f"dirty fixture missed {sorted(expected - codes)}; got {sorted(codes)}")
    result = {"selftest": "ok" if not problems else "failed", "problems": problems,
              "clean_verdict": clean["verdict"], "dirty_codes": sorted(codes)}
    print("RIGCHECK_SELFTEST " + json.dumps(result))
    sys.exit(EXIT_PASS if not problems else EXIT_CANNOT)


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if args == ["--selftest"]:
        selftest()
    if len(args) != 3:
        print("RIGCHECK_CANNOT usage: -- <rig.blend> <spec.json> <out.json> | -- --selftest")
        sys.exit(EXIT_CANNOT)
    rig, spec_path, out = args
    try:
        bpy.ops.wm.open_mainfile(filepath=rig)
        with open(spec_path, encoding="utf-8") as fh:
            spec = json.load(fh)
        result = check(spec)
    except CannotRun as e:
        print(f"RIGCHECK_CANNOT {e}")
        sys.exit(EXIT_CANNOT)
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(result, fh, indent=2)
    print("RIGCHECK " + json.dumps({"verdict": result["verdict"], "findings": result["findings"]}))
    sys.exit(EXIT_PASS if result["verdict"] == "clean" else EXIT_FAIL)


main()
