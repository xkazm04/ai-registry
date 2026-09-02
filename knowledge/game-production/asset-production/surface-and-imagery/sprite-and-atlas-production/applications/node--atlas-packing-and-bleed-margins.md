---
layer: application
type: application
subject: sprite-and-atlas-production
technique: atlas-packing-and-bleed-margins
stack: node
status: forged
verified_on: 2026-09-02
verified_against: node@24
---

# An icon atlas declared in a pipeline step, and the two halves it gets right and wrong

PoF's catalog pipeline defines an icon family as a sequence of authoring steps, and the fifth of
them — `src/lib/catalog/pipelines/icon-sets.ts`, the step labelled `Atlas` (`icon-sets.ts:203-258`)
— produces a machine-readable atlas declaration rather than a picture. It is the closest thing in
the tree to the technique's "record the page contract as an artifact", and it is worth reading
because it gets the budget half almost exactly right and the margin half exactly wrong.

Citations resolved 2026-09-02 against the working tree on branch `master`; the runtime is
Node 24.14.

## What the declaration carries

```
textureSize: '4096×4096 px'                      // icon-sets.ts:214
cellSize:    '256×256 px'                        // :215
gridLayout:  '16×16 grid'                        // :216
slots: 256, slotsAllocated: 224, slotsReserved: 32   // :218-220
```

and, one step earlier, the same numbers as a stated budget rather than as a count:
`atlasBudget: '256 cells total in the 4096×4096 atlas (16×16 grid); 224 allocated, 32 reserved'`
(`icon-sets.ts:144`).

That line is the technique's page budget realized well. It names the intended occupancy *and* the
headroom, in the same sentence, in the unit an artist can plan in — cells, not area. A family that
arrives with 250 members has visibly overrun something a reviewer can point at.

The UV addressing is by cell index, not by pixel rectangle:
`FIconSetRow.AtlasU + FIconSetRow.AtlasV (cell indices 0–15)` with
`UV = vec2(AtlasU, AtlasV) / 16.0 + uv_in_cell / 16.0` (`icon-sets.ts:225-228`). A uniform grid
addressed by index is the strongest form of the technique's addressing-stability rule: a repack
cannot renumber anything, because the numbering is the geometry.

## The mip floor, which is an upward lesson

```
format: 'BC7 (DXT5-equivalent, full alpha for transparency) — mip chain floored where a CELL
         reaches 32 px: atlas mips 4096→2048→1024→512 (cells 256→128→64→32), mip count = 4.
         (Judge-fleet fix 2026-07-07: the old line claimed a 32 px floor AND mip count 7 —
         7 mips would run cells down to 4 px.)'
                                                        // icon-sets.ts:221-224
```

The correction embedded in that comment is the useful part, and it sharpened the technique's
statement of the rule. The mip chain belongs to the **page**, but the quantity that must be floored
is the **cell**: seven levels is a perfectly sensible chain for a 4096-pixel texture and a
catastrophic one for a 256-pixel icon inside it, because at level seven each icon is four pixels
and is averaged together with its neighbours regardless of any gutter. The page's dimensions are
what a texture tool shows you; the cell's are what decides the answer. The tie to the minimum
display size (`minDisplaySize: 32`, `icon-sets.ts:191`) is the right basis: the chain stops at the
smallest size the art is ever drawn at.

## Where it falls short of the technique

- **`packing: '4096×4096 atlas — 256 px cells, 16×16 grid, no padding (UV boundary = cell
  boundary)'` (`icon-sets.ts:217`).** No gutter, no extrusion, and four mip levels. This is the
  exact combination the technique forbids: at mip level 4 a cell's edge texel is an average of
  sixteen source texels, several of which belong to the neighbouring icon, so a filtered sample at
  a cell boundary reads a neighbour's colour. Cell-index addressing makes it *cheap* to fix — the
  in-cell UV can be inset by the margin without touching any row data — and cheap to specify. The
  standard stands: 256-pixel cells with four mip levels need at least four texels of extruded
  margin, and the cell budget should be stated as a 248-pixel usable area inside a 256-pixel cell.
- **Nothing measures any of it.** The step's acceptance is
  `fieldsPopulated('atlas', …, ['texture','packing','slots'])` composed with
  `wiringContractSound('atlas')` (`icon-sets.ts:254-257`). Both check that *strings are present and
  name something real* — no bytes are read, no page is packed, no gutter is measured. The
  L2/L3 verification text at `icon-sets.ts:245-250` asks a human to confirm "contrast + 32 px
  legibility verified in editor", and the test-gate check at `icon-sets.ts:268` reads
  `imports without compression artefacts (BC7, no mip below 32 px)` — a claim nothing computes.
  Under the technique's rule, this page's margins are *unmeasured*, not clean.
- **The declaration is prose about an atlas nobody has packed.** The step produces a spec; the art
  step before it (`icon-sets.ts:155-172`) is a four-candidate gallery whose acceptance is a human
  selection. There is no packer in this path, so the cell budget is a plan and the addressing
  contract is a promise.

## What the tree gets right that the technique should keep borrowing

The gallery grader next door refuses to pass a selection with no provenance:
`galleryArtifact.ts:141-151` returns `deferred` with the reason "nothing proves any candidate was
ever generated for this step", because "the index alone proves nothing" (`galleryArtifact.ts:40`).
That is the instrument asserting it had input, applied to art selection — and it is exactly the
posture the atlas step is missing. The same repository states the rule in one step and omits it in
the next, which is the ordinary way a good convention fails to spread.
