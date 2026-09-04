---
layer: application
type: application
subject: data-viz
technique: encoding-vocabulary
stack: react
status: forged
verified_on: 2026-09-01
verified_against: react@19
---

# The colour-blind fallback collapsed under the layout that needed it

*Verified against the project tree at `b6dcf28aa` (React 19.2, TSX, Vite,
Vitest + Testing Library).*

The technique's rule that hue is never the only channel was implemented here
exactly as written — and the redundant channel it added was destroyed by the
geometry of the surface it was added to. This is the amendment's case: the
second channel is an encoding, and it can be corrupted by a transform that
never touches colour.

## The surface

A capability sigil is a radial glyph: eight petals arranged around a centre,
each petal one persona dimension, each dimension carrying its own hue. In
colour-vision-deficiency mode the hue is not enough, so
`src/features/shared/glyph/dimPatterns.tsx` defines eight SVG `<pattern>`
tiles — horizontal lines, vertical lines, forward diagonal, back diagonal,
grid, cross-hatch, single dot, twin dots (`:14-38`) — each with a faint tint
of its dimension's colour and a line/dot shape that carries the distinction.
`petalPatternFill(dim, uid)` (`:8-9`) hands a petal the `url(#…)` fill, and
`CapabilitySigil.tsx:195` swaps hue for texture when `cvdSafe` is on.

Eight shapes, eight dimensions, WCAG 1.4.1 satisfied on paper.

## The collapse

Each petal `<path>` is drawn inside a group that rotates it into its slot:

```tsx
// CapabilitySigil.tsx:187 — and SigilPetal.tsx:138, the same shape
<g transform={`translate(${center}, ${center}) rotate(${angle})`}>
```

The patterns declare `patternUnits="userSpaceOnUse"` (`dimPatterns.tsx:70`),
which resolves the tile in the *referencing element's* user space — the
rotated one. So each tile turned with its own petal, by that petal's angle.

The eight textures are eight distinct shapes only at their designed
orientation. Turned by the petal angles the layout assigns:

- `task` (vertical lines, +45°) and `connector` (forward diagonal, +90°) both
  land at 135° — one shape.
- `review` (grid, +180°) and `memory` (cross-hatch, +225°) both land on the
  same orthogonal grid — one shape.

Two of four pairs merged, in the exact vocabulary that exists so the petals
can be told apart *without* colour. The legend was still correct about its own
swatches, which are drawn unrotated; it was wrong about the picture. Nothing
threw, no audit fired, and the mode looked like it was working — the textures
were visibly present, just not eight of them.

## The fix

One attribute, one line:

```tsx
// dimPatterns.tsx:70-71
patternUnits="userSpaceOnUse"
patternTransform={`rotate(${-PETAL_ANGLES[dim]})`}
```

The counter-rotation lives on the pattern definition, not at the use site —
the technique's "pin the encoding to something the mark's transform cannot
reach". The pattern element carries its own transform, applied to the tile
independently of the referencing mark, so every texture renders at the
orientation it was drawn for regardless of where its petal landed. Because
the angle is read from the same `PETAL_ANGLES` table the layout rotates by, a
future petal reordering cannot desynchronize the two.

Landed in `d371c3423b6fa0d7000d982484752a48e6c097af` (2026-08-27), one item of
a seven-fix sweep: *"CVD-safe petal textures turned with their own petals and
collapsed two pairs"*.

## What can observe it

Nothing in the running app could. The failure is a *similarity* between two
rendered fills; no type, no lint, no snapshot of the DOM notices that two
patterns produce the same picture once transformed, and the mode is off by
default so no screenshot path crosses it.

So the invariant is pinned structurally instead
(`__tests__/dimPatterns.test.tsx`): three tests assert one uniquely-identified
pattern per dimension (`:35-46`), that every pattern's `patternTransform` is
exactly `rotate(-PETAL_ANGLES[dim])` (`:48-59`), and that `patternUnits`
remains `userSpaceOnUse` so the counter-rotation stays meaningful (`:61-66`).
The third test is the interesting one: it pins the *cause* as well as the
cure, so a later change to the units silently invalidating the counter-rotation
fails loudly rather than re-collapsing the vocabulary. The reasoning is
written into the module (`dimPatterns.tsx:47-57`) and the test file (`:7-23`),
because a bare `rotate(-angle)` reads as arbitrary and is exactly the kind of
line a cleanup deletes.

## What this cannot do or prove

- **No one looked at it in CVD mode.** The collapse and the repair are both
  derived from the geometry — eight named shapes, eight known angles — and
  checked against the code, not against a rendered sigil or a simulated
  colour-vision deficiency. Whether the eight textures are discriminable *at
  petal size* is a separate and unasked question; correcting the orientation
  does not make a 5px tile legible.
- **The test asserts an attribute, not an appearance.** It proves the
  counter-rotation is emitted, not that the resulting fills look different.
  Two textures that were never distinct at rest would pass it.
- **Only rotation was audited.** The petals are also scaled and hover-brightened;
  the sweep checked the angle interaction because that was the observed defect.
  A non-uniform scale on a tile would be the same class of bug and nothing here
  would catch it.
- **Sibling consumer verified by shape, not by execution.** `SigilPetal.tsx:138`
  carries the identical `rotate(angle)` group; it inherits the corrected defs,
  which was read rather than run.
