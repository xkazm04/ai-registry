---
layer: application
type: application
subject: asset-class-poly-budgeting
technique: class-ceiling-vs-requested-budget
stack: process
status: forged
verified_on: 2026-08-20
---

# Process: a per-class budget corpus that states its own basis

PoF (`C:\Users\kazda\kiro\pof`) keeps its per-asset-class geometry budgets as a data
corpus in `src/lib/visual-gen/polycount-presets.ts`, with the rationale for each number
stored in the same record as the number. Two consumers read it: generation (hand the
budget to a budget-aware provider so the mesh is generated inside its class budget
instead of decimated after the fact) and critique (`critiqueThresholdsFor` feeds the
Tier-1 gate a class-aware `maxFacesWarn` — *"a 150k-face prop is a problem the
class-blind 200k default missed"*).

## The corpus (lines 42–92)

| `assetClass` | `faceLimit` (request target) | `warnAbove` (ceiling) | `maxComponents` | stored rationale |
| --- | --- | --- | --- | --- |
| `character` | 40,000 | 60,000 | 24 | matches the character pipeline's game-tier budget, rig intact; highest per-asset budget |
| `weapon` | 15,000 | 22,500 | 6 | small on screen at the project's camera distance; silhouette + normal map carry detail |
| `prop` | 10,000 | 15,000 | 6 | placed many times per scene; generated props also ship to non-virtualized paths (mobile preview, collision) |
| `environment` | 60,000 | 90,000 | 40 | large silhouettes earn a bigger budget; bounded because generated buildings fragment |
| `modular-part` | 8,000 | 12,000 | 3 | assembled in multiples — the per-part budget must leave headroom for the whole |

The basis is stated in the module header: *"game-ready targets at ARPG camera
distance"*, with the character figure explicitly **locked** to the character pipeline's
game-tier spec and a written instruction to keep the two in sync — one authority, with
the duplication acknowledged rather than hidden.

`maxComponents` is the companion class-aware limit that lives in the same record: the
comment records that a class-blind default of 8 failed an assembled character (head,
lashes, brows, eye layers, mouth interior, teeth, tongue, body, hands, hair, cape,
accessories) as "fragmented", while specks stay policed by the floater rule *"which no
class relaxes"*.

## The ceiling-not-a-target statement (lines 1–20)

The header states the shaping doctrine in capitals — **CEILING, NOT A TARGET TO MAX
OUT** — and grounds it in a measurement: on hair, *3,000 quads resolved individual
strands, 6,000 made the generator invent a whole head*. A second, independently written
statement of the same lesson sits in the knowledge corpus at
`src/lib/knowledge/ue-gotchas.ts`, entry `ai-3d-model-tier-and-budget-shaping`, which
adds the low end (1,500 quads produced a mess), the observation that good generators
*skip* spending budget on flat surfaces rather than adding loops, and the corollary that
text is never geometry at any budget (verified up to 10,000 quads).

## Part-split division (lines 116–150)

`planPartBudget(assetClass, parts)` computes what the `modular-part` rationale only
claimed. Its comment states the bug plainly: *"each part was previously budgeted at the
flat `modular-part` limit, and nothing checked the sum: eight parts at 8k is 64k against
a 40k character budget."* The function takes the whole's `faceLimit`, floors it by the
part count, and applies the division only when `naive * parts > whole.faceLimit`,
returning `constrained: boolean` plus a rationale sentence that names both totals.
Unknown class or `parts < 1` returns `undefined` — *"a budget that cannot be honoured is
never invented."*

## The two honesty rules, as implemented

`resolveAssetClass` refuses to promote an unknown class. Absent or unrecognised input
does **not** become a "typical" class; it degrades to the class-blind defaults and
returns a `gradedAs` sentence saying exactly that, listing the recognised classes. The
comment gives the reason: promoting silently *"would grade a character against a prop's
component budget and fail it for being assembled"*, and an unknown string previously
*"vanished into an empty threshold override with no signal anywhere"*.

`localCritiqueDeps` refuses to fabricate a request. For generators that accept no face
budget, it sets `thresholds` and `size` but deliberately **not** `budget`, because
`budget` means "the budget this generation was REQUESTED at" — a fabricated one *"would
report 'the provider ignored your budget' about a budget nobody ever sent."* Those
meshes are graded against `warnAbove`, the honest class-aware line for a service you
cannot instruct. It also sets `stage: 'raw'`, declaring that the producer hands over
pre-retopology output — *"a statement of fact about the producer, not a guess about the
mesh"* — which is what stops a failing verdict from reading as a defect in an artifact
nobody claimed was finished.

## What this application demonstrates about the technique

- Two comparisons, two records: `faceLimit` is what a generation is **requested** at,
  `warnAbove` is what a delivery is **held to**, and the ~1.5x gap between them is
  deliberate.
- Every number ships with its rationale and its basis (camera distance, platform,
  pipeline stage) in the same record.
- Both failure-to-grade cases — no class, no request — produce a stated sentence, never
  a silent default.
