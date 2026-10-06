---
layer: application
type: application
subject: mesh-finishing-for-engine-readiness
technique: export-proven-by-read-back
stack: node
status: forged
verified_on: 2026-10-05
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Reading an agent's scene export back, in a Node asset pipeline

## What was opened

A Next/TypeScript game-production pipeline that drives a live Blender session through a
bridge. Each operation is a Python script generated in TypeScript, and every script ends
in one machine-readable receipt line that the UI parses. Success renders only when that
receipt is present. The receipt discipline is well built: a transport success is
explicitly not a pass, a script that printed prose without a receipt reads as
unconfirmed, and the receipt prints after the `raise` so a failed operator can never
emit one.

The export script stopped one rung short. Its receipt printed when the exporter returned
`FINISHED`, and the module's own comment called that status "the strongest evidence
available from here", because the bridge may be on another machine and the pipeline
cannot stat the file. That reasoning holds for the TypeScript side. It does not hold for
the script, which runs inside the Blender that wrote the file and can open it a line
later.

**The witness for that version:** the tree pins no runtime in CI and declares no engines
field, so `node@24` is taken from the `@types/node` major in its manifest. The DCC side
was run on Blender 4.2.1 LTS, the install path the pipeline's own render script
defaults to.

## The paired run

Both arms are the pipeline's own generated scripts: A from the commit before the change,
B from the change. They ran over the same three fixtures in both formats, on the same
Blender build. Ground truth was read from each written file by an independent reader in
the harness, not by either arm.

| Fixture | Format | A: receipt? | A: file | B: receipt? | B: file |
| --- | --- | --- | --- | --- | --- |
| Clean: mesh, camera, light, skinned mesh, collection instance | glTF, FBX | yes | correct | yes | identical to A |
| Document with a side scene holding one mesh | glTF | **yes** | **2 scenes, side mesh beside the hero** | yes | 1 scene, hero only |
| Document with a side scene holding one mesh | FBX | yes | correct (exporter writes the active scene) | yes | identical to A |
| Empty scene | glTF | **yes** | **valid 132-byte file, zero meshes** | no, raises `empty-export` | same file, not confirmed |
| Empty scene | FBX | **yes** | **valid 4,076-byte file, zero meshes** | no, raises `empty-export` | same file, not confirmed |

**Target:** wrong-content files that still printed a receipt. A: 3. B: 0.
**Floor:** the clean fixture exports identically in both arms, B raises nothing on it,
and B leaves the document as it found it. Bone nodes, the camera, the light and the
collection instance produced no false positive. The FBX re-import's cleanup left the
datablock counts, the active object and the selection unchanged in every case. The
floor held. The pipeline's own suite for the bridge and the scene composer (95 tests),
its typecheck and its lint all passed.

B changes two things, so a third arm isolated them: B's read-back with A's unscoped
call. It caught the side-scene leak on its own and named both issues, `extra-scenes` and
`foreign-objects: Leak`. The scoping option prevents the leak, and the read-back catches
it if a later call site drops the option. Those are separate protections, which is the
technique's argument for keeping the read-back after the scoping is fixed.

## What the change is

The glTF call gains the active-scene scope. Before the write, the script resolves the
intended set: the scene's mesh-like objects, plus the objects inside any collection it
instances. After `FINISHED`, the glTF branch parses the file's JSON chunk and counts its
scenes and its mesh-bearing nodes. Bone, camera and light nodes carry no mesh, so they
are never compared. The FBX branch re-imports into a temporary collection of the active
scene, counts meshes, then removes every datablock the import created and restores the
active collection, the selection and the active object. Any issue raises before the
receipt prints.

## What this realization cannot do

- **The FBX read-back counts; it does not compare names.** A re-import into a document
  that already holds the originals renames everything on collision, so names prove
  nothing there. It catches an empty or mesh-less file. It would not catch a foreign
  mesh in an FBX, which the active-scene behaviour of that exporter prevented in this run.
- **No clip check.** The export path requests no specific clips, so there is no intended
  clip list to compare against. One open-source client reports muted clips silently
  skipped under its own animation presets. Under this pipeline's default options the
  clip survived, so the failure depends on the options and is not universal.
- **The container choice was tested only on the side that works.** The same client
  imports into a temporary collection of the active scene because a separate new scene
  breaks on skinned rigs. Here, the clean fixture's skinned mesh re-imported into the
  active scene's temporary collection without error, and cleanup was complete. The
  new-scene failure itself was not tried.
- **Bounds are not checked.** World-space bounds within the asset's class would catch a
  unit or transform error at the write. This pipeline checks extent on the import side
  instead.
