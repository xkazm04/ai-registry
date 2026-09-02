---
layer: application
type: application
subject: sprite-and-atlas-production
technique: pixel-grid-and-resolution-contract
stack: process
status: forged
verified_on: 2026-09-02
---

# A class resolution contract written into a brief, and the request that ignores it

PoF authors two-dimensional art through pipeline steps whose `produce()` writes a specification in
prose, which a generative step then illustrates. The icon family's first step —
`src/lib/catalog/pipelines/icon-sets.ts:26-60`, labelled `Family Brief` — is a clean realization of
the technique's first rule: the class resolution and its basis are written down, once, before any
image exists. Citations resolved 2026-09-02 against the working tree on branch `master`.

## The contract, as authored

The brief states, in one sentence, the four numbers the technique asks for
(`icon-sets.ts:38-42`):

- authored size: "rendered at 256 px";
- page geometry derived from it: "packed to a 4096×4096 atlas with 256 px cells (256 icon slots)";
- the smallest mark: "a 2 px outline stroke";
- the basis that makes the mark meaningful: "that holds weight at the HUD's smallest display size
  of 32 px".

The accessibility step then restates the same relation as a computed consequence rather than as a
second opinion (`icon-sets.ts:189-192`):

```
minDisplaySize: 32,
outlineWeight: '2 px at 256 px source; maps to ~0.25 px at 32 px — must be anti-aliased, not dropped',
```

That is a number carrying its unit *and* its basis, and it is the reason the file can make a real
decision at the end of it. A quarter of a screen pixel cannot be drawn as a hard edge, so the class
either accepts anti-aliasing at its display size or the outline has to get heavier — and the brief
says which, out loud, instead of leaving it to whoever imports the art. The presentation ratio here
is 8:1 down, which is a whole-number reduction and therefore compatible with the technique's rule
that reductions divide evenly.

The mip floor in the atlas step (`icon-sets.ts:222-224`) is derived from the same basis: the chain
stops where a cell reaches 32 px, because 32 px is the smallest size the art is drawn at. One
declared number, three consumers — the brief, the accessibility criteria, the mip depth. That is
the single-authority shape the technique asks for, and it is the strongest thing in this path.

## Where the process falls short

**The request does not carry the contract.** The 2D generation call has no knowledge of the 256-px
class. `src/lib/visual-gen/image-providers.ts:355` issues the hosted image request as
`{ width: req.width ?? 512, height: req.height ?? 512, numImages: 1 }` — a square default that no
icon step overrides. The declared class resolution is 256; the generator's fallback is 512; nothing
reconciles the two, and nothing downstream resamples on a whole-number factor. Under the technique
this is a request that was never told its target, and per
[a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output) the surplus is spent:
the model fills 512 pixels with detail finer than the class's own outline weight, and that detail is
what has to be thrown away later.

**Nothing checks a delivered pixel dimension anywhere.** Across `src/lib` there is no read of an
image's width or height after generation — no intake comparison against a class resolution, no
whole-number-factor assertion. The acceptance for the art step is
`selected('selected', 'A family style candidate is selected')` (`icon-sets.ts:172`), a human
choosing one of four candidates. The contract is stated in the brief and enforced nowhere, which is
the specific failure the technique exists to prevent: the class resolution survives as prose, and
prose does not fail to compile.

**The 3D half of the same tree already solved this.** `src/lib/visual-gen/texel-density.ts:13-40`
records precisely this defect for baked material maps — "a 10 cm coin and a 12 m cave chunk receive
the same 1024² map" — and replaces the flat default with a density target,
`DEFAULT_TARGET_PX_PER_M = 1024`, that derives the resolution an asset earns from its real-world
size. The 2D path has the same defect and has not had the same fix. A pixels-per-world-unit constant
for each 2D art class, read by the generation request the way `texel-density` is read by the bake, is
the missing piece and it is a small one.

## The transplantable shape

What is worth copying from this process is not the numbers but the ordering: the class contract is
authored in the first step, restated as a derived consequence in a later step rather than as an
independent claim, and used to floor a third decision. What is worth learning from its gap is that a
contract in a brief reaches the generator only if some code puts it there — and that a pipeline can
declare a resolution in prose, request a different one in a call, and pass every acceptance check it
owns.
