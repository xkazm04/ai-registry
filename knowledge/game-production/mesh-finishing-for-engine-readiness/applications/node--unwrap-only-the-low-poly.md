---
layer: application
type: application
subject: mesh-finishing-for-engine-readiness
technique: unwrap-only-the-low-poly
stack: node
status: forged
---

# A Node finishing runner that plans the unwrap before it spawns Blender

PoF drives Blender headless from Node to turn dense image-to-3D output (Hunyuan3D, Tripo,
TripoSR) into a decimated low-poly with real UVs and baked maps. The whole stage lives in
`src/lib/visual-gen/mesh-finish.ts` (408 lines), built as pure planning cores plus an
injectable spawn seam so the orchestration is unit-tested without Blender present.

## The unwrap is a plan, not a flag

`UNWRAP_FACE_CEILING = 200_000` (line 21) carries the rule in its comment: *"Above this
face count an auto-unwrap explodes into unusable island counts (and routinely hangs/crashes
the unwrapper) — the high-poly is never the thing you unwrap."*

`unwrapPlan(requested, targetFaces)` (lines 172–190) is the enforcement, and it refuses in
two distinct ways rather than returning a boolean:

- No `targetFaces` at all → `unwrap: false` with `'unwrap runs on the retopo'd low-poly
  only — set targetFaces to decimate first'`.
- `targetFaces` above the ceiling → `unwrap: false` with a reason that interpolates both
  the requested figure and the ceiling: `` `targetFaces ${targetFaces} is above the
  ${UNWRAP_FACE_CEILING}-face unwrap ceiling — the island count explodes; decimate
  further` ``.

Both reasons name the remedy, which is what makes the refusal a result rather than a dead
end. `MeshFinishResult.unwrapSkippedReason` carries it back to the caller — the field's own
comment reads *"Set when an unwrap was asked for but refused — never dropped silently."*

## Dependent operations fail together

`buildMeshFinishArgs` (lines 232–265) is where the dependency becomes structural rather
than documentary. It calls `unwrapPlan` first, then `bakePlan`, and the bake flags are
gated on `plan.unwrap && bakes.length`. A caller that requests a bake alongside an
un-plannable unwrap gets no `--bake` argument at all: the argv is built from the plan, so
there is no code path that can send a bake into a mesh with no UVs.

## The same shape guards the interior cull

`cullInterior` (lines 76–86) applies the identical pattern to a different operation, with a
different ceiling and a sharper distinction. The cull runs on the full-density mesh *before*
decimation, so the script refuses it above its own `CULL_FACE_CEILING` (200k faces) and
reports `cullRefusedReason`. Separately, `cullLimitReasonFor(facesCulled, shells)` (lines
283–288) fires when the cull *did* run and removed nothing while the mesh had more than one
disconnected shell — measured on Blender 4.2 headless, `select_interior_faces` selects 1
face on a welded shared wall and 0 on an enclosed separate shell, so the body under a chest
plate is invisible to it. The two fields are deliberately distinct; the field comment states
the invariant directly: *"an absent `facesCulled` must never read as 'the cull found
nothing'."*

The API surface applies a second layer: `POST /api/visual-gen/mesh-finish` refuses the
`cullInterior` flag outright, leaving it reachable only from in-process callers that have
measured their own input.

## What the repo taught upward

Two things this application contributed back to the technique. First, that the ceiling
belongs on the *reduction target* rather than on the input face count — the check is
cheap, happens before any process is spawned, and catches an over-generous decimation
request that would still explode the unwrapper. Second, that a refusal and a
ran-and-found-nothing must be separate fields on the result type, not two values of one
optional number; the comment on `cullRefusedReason` is the clearest statement of that rule
anywhere in the codebase.

The knowledge entry `ai-lowpoly-generation-not-final` in `src/lib/knowledge/ue-gotchas.ts`
(line 249) states the containing order the runner implements: *"AI low-poly/UV generation
is 80-90% there, never final — the quality path is high-poly gen → retopo → deterministic
UV → bake."*
