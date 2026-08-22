---
layer: application
type: application
subject: generated-asset-world-scale
technique: import-scale-derivation
stack: node
status: forged
verified_on: 2026-08-20
---

# Deriving the import scale in a pure grading module

**Stack:** TypeScript module in a Next.js app (`src/lib/visual-gen/world-scale.ts`, 140
lines), consumed by the Tier-1 mesh critique (`src/lib/visual-gen/mesh-critique.ts:286`).

## Shape

`gradeWorldScale(bbox, request)` is a pure function: it takes the measured bounding-box
extents (produced by the critique's `BBOX` step, a `trimesh` read in glTF metres) and a
`SizeRequest { targetExtentM }`, and returns a `ScaleGrade`. No I/O, no engine, so the
whole rule set is unit-tested in `src/__tests__/lib/visual-gen/world-scale.test.ts` and
`critique-scale.test.ts`.

The three quantities the golden path names are the three fields of the result, and each is
optional exactly where its source might be absent:

```ts
export interface ScaleGrade {
  verdict: 'matches' | 'off' | 'unmeasured';
  measuredExtentM?: number;
  targetExtentM?: number;
  ratio?: number;             // measured / target
  importUniformScale?: number; // target / measured
  normalized?: boolean;
  reason?: string;
}
```

## The derivation, and the two absences

`world-scale.ts:126-127` is the whole technique:

```ts
const ratio = measuredExtentM / targetExtentM;
const importUniformScale = targetExtentM / measuredExtentM;
```

Both are computed together, and — per the module's own doc comment, *"the correction
factor is reported even on a match, so callers can always apply it"* — the `matches`
branch (`:129`) returns `importUniformScale` too. A caller never has to branch to find
out whether a factor exists.

The two missing-input cases are handled *before* the division and return distinct reasons
rather than a neutral 1.0:

- **no target** (`:107-118`) → `verdict: 'unmeasured'`, reason `"no target size was
  requested for this mesh — nothing to hold the delivery to"`, and when the delivery is in
  the normalisation band the reason appends *"its real-world size is unknown until one is
  set"*.
- **no measurement** (`:120-125`) → `verdict: 'unmeasured'`, reason `"mesh was not
  measured — a 1.80 m target cannot be confirmed without a bounding box"`.

`usable()` (`:69`) gates both: a value counts only if it is a finite number greater than
zero, so a zero-extent degenerate box does not silently produce an infinite scale.

## Tolerance

`SCALE_TOLERANCE = 0.1` (`:31`) is a single exported relative tolerance, applied as
`Math.abs(ratio - 1) <= SCALE_TOLERANCE`. This is a **deviation** from the standard: the
golden path calls for tolerance per asset class, because a modular kit piece cannot absorb
what a rock can. The module ships one global number; the class-aware version is the
correct target and the standard is not lowered to match the code.

## The reason string carries the basis

The `off` branch (`:132-139`) builds a message that states measured, target, ratio, the
normalisation detection, and the fix:

> `delivered 1.00 m longest extent against a 1.80 m target (0.56x) — generator-normalised
> output (every provider returns a ~1 m box regardless of the asset); import with
> ImportUniformScale 1.80 or rescale before shipping`

Every number in it carries its unit, and `fmt()` (`:91`) is the one formatter that
guarantees it. The critique promotes this string to a `scale-off` warning
(`mesh-critique.ts:287`) so it reaches the scorecard verbatim rather than as a code.

## Where it is applied — and where it is not

`mesh-finish.ts` (the retopo → unwrap → bake runner) carries `targetExtentM` on its
`MeshFinishSpec` but deliberately does not act on it; the field's comment says so: *"Not
applied by the script (the low-poly keeps the generator's ~1 m box); the Tier-1 gate grades
the delivery against it and reports the import scale that fixes it."* That is the golden
path's ordering rule realised as a type — the finishing bench carries declared intent
without acting on it, and the correction happens once, at the import edge.
