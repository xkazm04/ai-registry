---
layer: technique
type: technique
subject: sprite-and-atlas-production
technique: atlas-packing-and-bleed-margins
status: forged
laws: [a-number-carries-its-unit-and-basis, a-budget-shapes-the-output, unmeasured-is-not-a-pass]
shared_with: []
use_when: [packing authored frames onto shared pages, a thin bright or dark fringe crawls along a sprite silhouette, sizing the gutter between packed regions, deciding how many atlas pages an art class may have]
---

# Atlas packing and bleed margins

## The concern

Packing many sprites onto one page removes bindings and draw submissions, and it introduces
a relationship the individual sprites never had: each region now has neighbours. A filtered
sample taken near a region's boundary blends the texels *around* the sample point, and at the
boundary some of those texels belong to whatever was packed next door. The result is a
one-pixel fringe of a stranger's colour along a silhouette, appearing only at certain camera
positions, certain scales and certain neighbour pairings — a defect that reproduces on the
reporter's machine and not on the fixer's.

The technique is to size the gutter from the sampling behaviour rather than by habit, to fill
that gutter with the region's own edge rather than with emptiness, and to treat page count as
a declared budget rather than as whatever the packer happened to need.

## Procedure

1. **Derive the margin, do not pick it.** The margin is how far a sample can stray outside a
   region. That is the filter's reach — one texel for bilinear interpolation — multiplied by
   the reduction factor of the deepest reduced-resolution level in use. With no such levels,
   one to two texels suffices. With four halvings, a texel at the deepest level spans sixteen
   at the top, and a two-texel gutter is meaningless there.
2. **Extrude, then pad.** Copy each region's outermost row and column outward into the gutter,
   repeating the region's own edge colour. A sample that strays now reads the sprite's own
   colour. Padding without extrusion leaves the stray sample reading transparent or black,
   which shows as a dark halo — quieter than the neighbour's colour, and still a defect.
3. **Extrude in the space the sampler works in.** For art with transparency, extrude the
   colour channels outward *underneath* transparent texels rather than extruding the composite:
   a sampler that interpolates colour and transparency independently will otherwise pull the
   background colour stored in fully-transparent texels into the visible edge, which is the
   classic dark outline nobody can find the source of.
4. **Decide the reduced-resolution levels before packing, not after.** They change the margin,
   and on a page whose regions are not aligned to the block structure of those levels they
   also mix neighbours together at the lower levels regardless of margin. Where the art class
   is drawn at a fixed size — interface elements, most sprites — the honest answer is usually
   to generate none.
5. **Group regions by lifetime and by co-occurrence, then optimise density.** Everything on a
   page loads and unloads together, so a page mixing a boss's frames with an interface icon
   set keeps the boss resident for the whole game. Density is the second objective and it is a
   long way second.
6. **Address regions by name, and record the map as an artifact.** A consumer that stores a
   region's coordinates rather than its identifier breaks silently the next time the page is
   repacked — the art it draws is now some other sprite, at plausible coordinates, with no
   error anywhere.
7. **State the page budget per art class and grade against it.** Pages are the unit an artist
   and a programmer can both plan in; area is not. A class allowed two pages that arrives on
   five has overrun in the same way a mesh overruns its triangles.

## Decision rules

- **When a gutter width is quoted without its basis, it is not a specification.** "Two pixels
  of padding" is meaningless without the sampling mode and the reduced-level depth it was
  computed for
  ([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
  Record the margin together with the filter and the level count it was derived from, so the
  next person to enable those levels sees that the margin no longer holds.
- **When sampling is nearest-neighbour, a margin is still required.** The sample point is
  quantised, not clamped, so a position rounding across a boundary reads a neighbour texel
  exactly. Nearest sampling makes the fringe rarer and harder to reproduce, which makes it
  worse to diagnose, not safer to ignore.
- **When reduced-resolution levels are generated, the depth is floored by the region, not by the
  page.** The chain belongs to the page and a chain that is sensible for a large page is
  catastrophic for the small regions inside it: seven halvings of a four-thousand-texel page leave
  each two-hundred-texel region four texels across, averaged wholesale with its neighbours, and no
  gutter survives that. Derive the depth from the smallest size a region is ever *drawn* at, and
  state the region's size beside the page's wherever the chain is specified — a mip count quoted
  against the page's dimensions is the number that looks right and is wrong.
- **When a region will be rotated or scaled at runtime, widen the margin rather than trusting
  the base case.** Rotation puts sample points at arbitrary phases against the grid, which is
  precisely the condition that reaches furthest outside the region.
- **When the packer is asked to fill a page, it will.** A generous page budget is spent
  ([a-budget-shapes-the-output](../../../../_laws.md#a-budget-shapes-the-output)): given four
  pages, a pipeline will emit four rather than fitting into two, because nothing ever asked it
  to fit. State the intended page count as a target for the class, not merely as a limit.
- **When a page was packed without recorded margins, treat it as unmeasured rather than
  clean.** An atlas whose gutter is unknown has not been checked; the fringe is invisible
  until a specific camera position finds it, so absence of a report is not evidence of absence
  ([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).
- **When density and addressing stability conflict, take stability.** A few percent of wasted
  page area is cheap, permanent and boring. A repack that renumbered regions is a whole class
  of "the wrong sprite appeared" incidents whose cause is not visible from the symptom.

## When NOT to use it

- **Tiling material surfaces.** A texture that must be continuous with a translated copy of
  itself must be sampled with wrap-around addressing over its whole area, and a gutter breaks
  exactly the continuity being relied on. Tiling textures get their own page, unpadded, and
  are never packed with sprites — that is the sharpest practical line between this subject and
  tiling texture acceptance.
- **Single large art shown alone** — a background plate, a full-screen illustration. It has no
  neighbours, so it has no bleed, and packing it costs the flexibility of streaming it
  separately.
- **Art whose set changes at runtime**, such as user-supplied or downloaded imagery. Packing
  implies a stable, known set; a dynamic set needs an allocator with the same margin discipline
  but a different structure, and forcing it into a build-time packer produces a rebuild for
  every addition.

## What this technique does not tell you

A correctly margined, well-grouped page says nothing about whether the art on it is coherent,
correctly scaled, or the right art at all. It also says nothing about how many pages a material
may bind at once — that is a sampler budget, and it belongs to shader budget authoring, which
consumes this page count as an input.
