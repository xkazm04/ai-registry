---
layer: application
type: application
subject: mesh-finishing-for-engine-readiness
technique: headless-dcc-capability-limits
stack: process
status: forged
verified_on: 2026-08-20
---

# Live-probing UE 5.8 headless before building on it

PoF automates Unreal Engine 5.8 with no interactive editor, and every capability it relies
on was established by running a probe script against the real 5.8.0 install and recording
the result with its date. The probe corpus, not the Python API reference, is what the
pipeline is designed against.

## The canonical finding

`src/lib/knowledge/ue-gotchas.ts`, entry `headless-physics-needs-ticking-world` (near line
375), is the template:

> "Live-probed on UE 5.8.0. The whole API surface resolves in the pythonscript commandlet —
> `PrimitiveComponent.set_simulate_physics` / `is_simulating_physics` /
> `put_rigid_body_to_sleep` / `set_enable_gravity`, `LevelEditorSubsystem.editor_play_simulate`
> / `editor_request_end_play` / `is_in_play_in_editor`,
> `EditorActorSubsystem.spawn_actor_from_class`, `SystemLibrary.begin_transaction` /
> `end_transaction`, `PhysicsAsset` / `BodyInstance` / `ChaosSolverActor` — so introspection
> alone suggests a headless 'simulate then bake' pass is scriptable. It is NOT."

Both failure shapes appear in one entry. The silent no-op: the commandlet's world is a
transient `/Temp/Untitled_0` with no physics scene, so `set_simulate_physics(True)` leaves
`is_simulating_physics()` returning `False` and a spawned actor never falls. The fatal
exit: `LevelEditorSubsystem.editor_play_simulate()` crashes with exit code 3, a callstack
through `UnrealEditor-PythonScriptPlugin.dll` — *"not an exception you can catch."* And the
missing primitive: `SystemLibrary` offers only `delay_until_next_tick` /
`set_timer_for_next_tick`, which need a tick that never comes.

The entry then does the thing the technique asks for — it names the boundary rather than
the bug list: *"the commandlet is an asset-authoring tool, not a simulation host."* The
work splits on that line: transforms, actor tags, transactions and map saving stay
headless; the settle runs in a `-game` session and Python only stamps the resulting
transforms back.

## Prefer the proven primitive over the convenient wrapper

`src/lib/visual-gen/metahuman-conform.ts:1-19` records the same discipline at a finer
grain. The high-level `conform_to_target_meshes(character, key, params)` *executes*
headless and returns `False` without the interactive tool's keypoint/curve targets and the
optional content pack. The lower-level `conform_body_to_target(...)`, fed vertices
extracted via `MetaHumanCharacterEditorSubsystem.get_mesh_data_for_conforming`, is the
proven programmatic path — so that is the one the seam uses. Ergonomics lose to
provability; the recipe lives in `docs/research/ai-to-metahuman-conform-recipe.md`.

## The unguessable details a probe produces

`src/lib/visual-gen/chaos-cloth.ts:1-30` carries two naming gotchas that no amount of
reading documentation would have surfaced, both ground-truthed on 2026-07-22 by
`cloth_probe.py` / `cloth_probe2d.py`:

- The Dataflow node type name is the full struct name **with** the `F` prefix
  (`FChaosClothAssetStaticMeshImportNode`); the un-prefixed name returns an empty node —
  a silent no-op in miniature.
- The Terminal node's collection input pin is `CollectionLod0`, **not** the display name
  `"Collection LOD 0"`.

The proven chain is recorded as a recipe — StaticMeshImport → TransferSkinWeights →
SetPhysicsAsset → Terminal, via `DataflowEditorBlueprintLibrary` plus
`DataflowBlueprintLibrary`. Two further practices from the technique show up verbatim: the
`ChaosClothAsset*` plugins are declared per-run through `enablePlugins` rather than edited
into `PoF.uproject` globally, and the residual manual step is named rather than pretended
away — weight-map painting is brush-interactive, so the MVP scope is the auto skin-weight
transfer path only.

## What the repo taught upward

The date-and-version stamping on every probe entry, and the habit of recording the *naming*
details alongside the verdict, both came from here. So did the framing that the useful
output of a probe survey is a one-sentence statement of what the mode is for — the
technique's "asset-authoring tool, not a simulation host" formulation is this repo's
sentence, generalised.
