---
layer: application
type: application
subject: regeneration-vs-repair-economics
technique: defect-class-to-remedy-map
stack: node
status: forged
---

# The remedy map and its router, in a Node visual-generation pipeline

PoF (`C:\Users\kazda\kiro\pof`) implements the map as two exported constants and a pure
assessor, with the routing refusals in a separate module. Nothing here touches Blender, a
job store or the network — which is the property that makes the rules testable.

## The map itself

`src/lib/visual-gen/critique-stage.ts:61-78` holds both sets, keyed by the `FindingCode`
vocabulary that `src/lib/visual-gen/mesh-critique.ts:239-300` (`scoreMesh`) emits:

```ts
export const FINISH_RESOLVES: readonly FindingCode[] = [
  'face-count', 'budget-over', 'parts-over-budget', 'components-over-budget',
];
export const REROLL_RESOLVES: readonly FindingCode[] = ['empty-mesh', 'degenerate-bbox'];
```

Two entries in the paid set. That is the whole list of defects where paying another
20 Tripo credits is rational, and the file says why: everything else is determined by the
generation *stage*, not the draw — recorded live, four independent rolls of one prompt at
`assetClass: 'prop'` scored 0/100 on all four with 16–50 floaters and 35–56 parts on all
four.

The critical omission is documented in the doc comment above `FINISH_RESOLVES`:
`'floaters'` is **deliberately absent**, because joining does not delete specks and
decimation multiplies them. Listing it "would let a routed finish claim a cure it does not
deliver".

## The measurement that built it

`critique-stage.ts:1-45` is the before/after pair the technique demands. Re-measured
2026-08-20 over all 52 `.glb` under `generated/`, metrics re-derived from the glTF buffers
and graded by the repo's own `scoreMesh`:

- 10 of 52 fail (19.2%), and **all 10 fail on `floaters`** — never `face-count`, never
  `parts-over-budget`.
- `tripo3d/jinx_v32_run.glb` — 1,482,446 faces, 2 components, 1 floater → **warn**.
  Its decimated sibling `tripo3d/jinx_v32_run_game.glb` — 46,791 faces, 17 components,
  **16 floaters** → **fail**.
- The shipped caveat had blamed face count; `scoreMesh` files `face-count` as a warn with
  no fail rule at any threshold, so re-tuning that number would have changed zero verdicts.

The comment draws the conclusion the technique states as a rule: state the tier, do not
re-tune the number the claim blamed.

## The derivation at routing time

`assessStage()` (`critique-stage.ts:117-155`) takes a verdict plus a declared `MeshStage`
(`'raw' | 'finished' | 'unknown'`) and produces the three disjoint lists —
`finishResolvable`, `rerollResolvable`, `unaddressed` — plus `misTiered`, true only when a
`raw` mesh is condemned *solely* by criteria the finish stage exists to satisfy. It refuses
to tier a missing verdict (`if (!critique?.ok || critique.verdict === undefined) return
empty;`) so an absent critic never renders as a calibration problem, and its own comment
pins the safety property: "there is no path here that turns a `fail` into anything else,
which is the property that keeps 'the gate is mis-tiered' from becoming 'so ship it
anyway'."

`caveatFor()` derives the sentence from the verdict's own findings rather than printing a
blanket disclaimer, including the `unknown`-stage branch that withholds the tiered reading
instead of guessing.

## Why codes and not prose

`mesh-critique.ts:158` documents the cost of the previous approach: consumers reasoning
about defect *kind* had to sniff reason strings — `failureShape` in `best-of-n.ts` blanked
digits and compared only the first line, "and it still took two live-only corrections to
stop mis-matching". The `FindingCode` union is the single vocabulary the map keys on.

## The routing refusals

`src/lib/visual-gen/finish-routing.ts:1-33` closes the edge the gate never had — the
verdict "condemned a mesh, and the condemnation went nowhere" — and encodes all three
refusals: a plan is produced only when at least one *failing* code is in `FINISH_RESOLVES`,
with `unaddressed` named up front in the returned `FinishPlan.note`; `cullInterior` is never
set (its `loose_shell_count` builds per-vertex polygon lists over the high-poly mesh, the
same memory-bomb family as the `trimesh.split()` that consumed 211 GB on 2026-08-18); and
every output path is a safe basename inside `FINISH_OUTPUT_DIR` within the `ASSET_DIRS`
allow-list, with the input required to resolve to an allow-listed generated file. The
refusal is a typed result, `FinishRefusal { ok: false; reason: string }`, returned in the
same position as a plan.
