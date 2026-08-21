---
layer: application
type: application
subject: generated-mesh-acceptance
technique: structural-scorecard
stack: node
status: forged
verified_on: 2026-08-20
---

# The Tier-1 mesh gate in Node

`src/lib/visual-gen/mesh-critique.ts` in the PoF repo is a working realisation of the
structural scorecard: a pure `scoreMesh` over metrics that a separate Python/trimesh script
(`scripts/visual-gen/pof_mesh_critique.py`) emits as a `POF_CRITIQUE_*` marker block. No
model, no cost, deterministic. The module header calls it "the asset analog of the
experiment lab's `behavioralVerdict`" and explicitly reserves room for a render→CLIP tier
and a local VLM tier on top — the structural-is-not-sufficient rung, designed in.

## Metrics in, card out

`parseCritiqueMetrics` (`:36-72`) turns the marker block into `MeshMetrics`. The
not-measured contract is enforced at the type level: `componentFaces?: number[]` is
documented at `:26-31` as *"Absent when the critique script predates the histogram — never
defaulted to `[]`, which would read as 'measured, and there are none'."* `componentFacesOmitted`
carries the truncation count beside it.

`scoreMesh` (`:239-300`) runs the checks in the order the technique prescribes:

| Order | Check | Code | Severity |
|---|---|---|---|
| 1 | `verts < minVerts \|\| faces < 1` | `empty-mesh` | fail |
| 2 | any bbox extent `< 1e-4` | `degenerate-bbox` | fail |
| 3 | specks over tolerance | `floaters` | fail |
| 3 | substantial parts over budget | `parts-over-budget` | fail |
| 3 | specks within tolerance | `floaters` | warn |
| 3′ | no histogram → blunt count over budget | `components-over-budget` | fail |
| 4 | not watertight / winding / degenerate faces | `not-watertight`, `winding`, `degenerate-faces` | warn |
| 5 | `faces > maxFacesWarn` | `face-count` | warn |
| 6 | delivered vs **requested** budget | `budget-over` | warn |
| 7 | delivered vs **requested** world size | `scale-off` | warn |

`DEFAULT_THRESHOLDS` (`:158`) is `{ minVerts: 100, maxComponentsFail: 8, maxFacesWarn:
200_000, minExtent: 1e-4, maxFloatersFail: 4 }`, overridable per asset class via a
`Partial<CritiqueThresholds>`.

Verdict and score are derived, never assigned (`:294-297`):

```ts
const verdict = fails.length ? 'fail' : warns.length ? 'warn' : 'pass';
const score = Math.max(0, Math.min(100, 100 - fails.length * 50 - warns.length * 15));
```

`reasons` stays fails-then-warns because that is the order every existing consumer reads,
and `findings` is the same list in the same order with codes attached — the byte-identical
display surface the technique calls for.

## Where the repo confirms the harder rules

- **Density is a warn, never a fail.** There is no fail branch for `face-count` at any
  threshold. `critique-stage.ts:20-24` records the consequence: a 1,492,072-face mesh graded
  against the `modular-part` ceiling of 12,000 scores **warn / 85**.
- **Request-relative grades are omitted, not defaulted.** `budget?: BudgetGrade` is
  documented at `:212-218` — *"Absent when no budget was supplied — silence about a budget
  must never read as compliance with one"* — and it exists precisely because the class
  ceiling and the requested budget are different numbers: "a 55k-triangle character sits
  under the 60k ceiling while still being 1.4x the 40k that was asked for".
- **Scale is graded even without a request** (`:290-291`), so the card can say
  "generator-normalised, size unknown". The comment names the incident: "without this a 1 m
  hero passed clean next to a 1.8 m Mannequin".
- **The histogram fallback does not loosen.** `:263-273` — when `split.measured` is false the
  original blunt `m.components > maxComponentsFail` rule stands unchanged, commented "no
  silent loosening on old data".

## The face-share rule and readiness, in code

`classifyComponents` (`:74-115`) computes `floor = max(FLOATER_MIN_FACES /* 8 */, total *
FLOATER_FACE_SHARE /* 0.005 */)` and returns `{ measured, parts, floaters, floaterFaces }`
— the `measured` flag being exactly the derived-split flag the not-measured contract
requires. The truncation branch is the asymmetry worth copying verbatim: the histogram is
sorted largest-first, so if the smallest kept entry is already below the floor every
omitted entry is too and they all count as specks; if it is substantial they count as
**parts**, pushing toward the harsher verdict. The comment states the invariant plainly:
"Neither branch can manufacture a pass."

`faceRigReadiness` (`:118-150`) returns `ready: boolean | null` against
`FACE_RIG_MIN_SHELLS = 4`, with `null` when the split was unmeasured. Its docblock states
the separation the technique insists on: *"Display/routing only — deliberately NOT folded
into `scoreMesh`, since a prop with one shell is perfect and a head with one shell is merely
unsuitable for a different job."*

## The one place the shape is borrowed

`Scorecard.findings` is optional (`:196-207`) because `input-gate.ts`, a VLM image gate,
reuses the verdict/score/reasons envelope and its free-text defects have no mesh defect
class. The comment names the reasoning — *"inventing codes there would be exactly the kind
of fabricated precision this field exists to remove"* — and `scoreMesh`'s return type
(`Scorecard & { findings: Finding[] }`) makes the field mandatory on the geometry path. An
optional field on the shared shape, guaranteed on the owning producer: the pattern to copy.
