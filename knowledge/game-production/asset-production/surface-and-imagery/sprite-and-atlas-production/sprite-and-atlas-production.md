---
layer: golden-path
type: golden-path
subject: sprite-and-atlas-production
status: forged
use_when: [accepting generated two-dimensional art that a renderer has to draw, a sprite shimmers or jitters while every single frame looks correct, packing authored frames into an atlas, choosing the palette and the compression a piece of flat art may survive, completing a tile set that has to cover every neighbourhood]
techniques:
  - pixel-grid-and-resolution-contract
  - atlas-packing-and-bleed-margins
  - palette-discipline-across-frames
  - sprite-sequence-timing-and-pivot-stability
  - lossy-compression-acceptance-for-flat-art
  - autotile-rule-set-completeness
---

# Sprite and atlas production

A sprite is not a picture of a thing. It is a picture at a stated size, drawn on a grid
the image itself does not carry, anchored at a point the image itself does not mark, in a
palette it is expected to share with images it has never met. Every difficulty in this
subject follows from that missing declaration. A mesh carries its own vertices; a material
carries its own channels; a sound carries its own sample rate. Each of those artifacts
states most of its own contract, and a consumer that reads the file learns most of what it
needs. A sprite states almost none of its. The authored pixel unit, the anchor, the shared
palette, the margin it will need when it is packed beside a stranger, the duration it is
held on screen — every one of those facts lives *outside* the image, and a production line
that does not carry them alongside it will lose them, silently, at the first hand-off.

That is why this is a subject and not a corner of general image craft. Composing a good
image, locking a style, directing a frame and grading it as a picture are the business of
the neighbouring generative-media discipline, and nothing here improves on that work. What
belongs here is the narrower question that discipline cannot answer: **will a renderer draw
this, at the size it was authored, beside its siblings, without the art falling apart?**

## The defect an image rubric cannot see

Take the failure that motivates the whole subject, because it is now the common one. A
diffusion image model is asked for a character's run cycle and returns eight frames. Each
frame is beautiful. Each frame scores highly on every criterion a general image gate holds
— composition, anatomy, lighting, style adherence, prompt fidelity. Every frame passes.
The sprite is unusable.

It is unusable because the defects are not *in* any frame. They are relations:

- between the image and a grid — the art was rendered at some arbitrary size, so its
  smallest meaningful mark is one and a third screen pixels wide and there is no scale
  factor that makes it clean;
- between one frame and the next — each frame was generated independently, so the
  character's coat is four slightly different browns across the cycle and the outline
  hardens and softens as the loop plays;
- between the frame and its anchor — the feet sit two pixels lower in frame five, so the
  character bobs while running on flat ground;
- between the sprite and its atlas neighbours — the frame was packed tight against the
  next one, so at any camera position that is not a whole number the renderer samples a
  sliver of the neighbour and a bright edge crawls along the silhouette.

Not one of those is visible in a single image, and a rubric that scores single images is
structurally incapable of seeing any of them
([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).
This is the same shape as a seam in a tiling texture — cheap to check, routinely unchecked,
expensive to discover late — but with a wider surface: a seam is one relation, and a sprite
has four.

The response is not a better eye. It is to write the missing declarations down, carry them
with the asset, and check the relations arithmetically before anything is packed.

## The authored pixel is a unit, and it needs its basis

The first declaration is the smallest. Every piece of two-dimensional art has an **authored
pixel** — the size of the smallest mark the artist intended as an atom — and a
**presentation scale** that maps it onto screen pixels. Sixteen authored pixels per world
unit, drawn at three screen pixels each, is a contract two people can build against.
"Roughly five hundred across" is not.

Get the scale wrong and the art does not merely soften; it comes apart. At a whole-number
scale each authored pixel becomes an identical square block and the image is exactly what
was drawn, only larger. At a fractional scale some authored pixels get three screen pixels
and their neighbours get four, so a line that was uniform in the source is now visibly
uneven along its length — and as the camera moves, the *choice* of which pixel is fat moves
with it, so the art crawls. No filter fixes this. Smoothing the interpolation trades the
uneven line for a blur that dissolves exactly the hard edge the style was made of.

The budgeting instinct that says a bigger number is safer is wrong here in the same literal
way it is wrong for geometry: this is a target, not a ceiling
([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)), and an asset
generated at four times the size it will be shown at is not higher quality — it is off-grid
art wearing a plausible resolution. So the pixel grid is stated once per art class, as a
number with its unit and its basis
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)),
and everything downstream derives from it rather than choosing for itself.

## An atlas is an addressing scheme that happens to save memory

The second declaration is spatial. Packing many sprites onto one page is usually sold as a
performance measure — fewer bindings, fewer draw submissions — and it is one. Treating it
as *only* that is what produces the bug. An atlas changes what is next to what, and a
filtered sample near the boundary of a region reads outside that region by design: the
sampler blends the texels around the sample point, and at a region's edge some of those
texels belong to whatever was packed next door. Tight packing therefore trades a small
amount of memory for a class of defect that appears only at certain camera positions, only
at certain scales, and only for certain pairs of neighbours — which is to say, a defect
that will not reproduce on the machine of the person asked to fix it.

The remedy is old and unglamorous: leave a gutter between regions, and **extrude** each
region's own edge into that gutter, so a sample that strays outside reads the sprite's own
colour rather than a stranger's. Padding alone leaves the stray sample reading empty space,
which shows as a dark or transparent fringe; extrusion is what makes the stray sample
harmless. The margin needed is not a matter of taste — it is derived from how far a sample
can stray, which is the filter width plus, where reduced-resolution mip levels are generated
at all, the halving depth those levels imply. Two texels of padding is fine until the fourth
mip level, where two texels of the top level are a quarter of a texel and the neighbour is
being averaged in wholesale.

The other half of the atlas contract is addressing stability. Repacking a page to squeeze
out waste moves every region on it, and anything that recorded a region's position rather
than its name now points at the wrong art. Pack for predictable addressing first and
density second: a page whose contents are grouped by what will be loaded and unloaded
together costs a few percent of area and removes an entire class of "the wrong sprite
appeared" incident.

## A sprite is a set, and its coherence is the deliverable

The third declaration is the one generative production gets most consistently wrong,
because it is invisible to a workflow that treats one image as one job. A walk cycle, a
directional idle set, a tile set and a screen of interface icons are all **sets**, and their
coherence is the deliverable — not the quality of their best member. Independent generation
of set members produces per-member excellence and set-level incoherence every time, and the
incoherence reads to a player as cheapness in a way no individual frame ever reads as cheap.

Colour is the sharpest instance. Constrain the set to a declared palette, hold that palette
as the single authority for every member
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)), and quantise
every delivered frame into it — then drift is not something you hope against, it is
something the pipeline cannot express. The palette also buys the cheapest acceptance check
in this whole subject: count the distinct colours in a delivered frame, and a frame that
arrives with nine thousand of them was not authored to the contract, whatever it looks like.

Anchor and timing are the same argument along different axes. A sprite's anchor is the point
the renderer places, rotates and flips it about, and if it moves between frames the
character bobs, the held weapon detaches, the muzzle flash misses the barrel. The anchor is
a per-frame declaration, it is checkable against a stable feature of the art, and a set whose
anchors were never declared has them all at some default corner — right for exactly those
frames whose art happened to be centred there. Frame durations are a declaration too, with a
unit that must be stated, because the same bare number means a fifth of a second in one
system and four hundredths in the next.

## Compression is not neutral, and flat art is where it stops being neutral

The fourth declaration is what the art is allowed to survive. Fixed-rate block compression —
the family that divides an image into small blocks and stores a pair of endpoint colours per
block with a couple of index bits per pixel — was designed for photographic and painterly
surfaces, where a block's colours genuinely do lie near a line through colour space and the
eye is forgiving of a small error. Flat art violates both premises at once. A block
straddling a hard dark outline between two flat fills holds three colours that do not lie on
a line, so the encoder must approximate, and the approximation appears as a halo of invented
intermediate colours along exactly the edges the style is made of. The same encoder is
nearly invisible on a rock surface and disfiguring on an icon.

The rule is therefore stated by *class of art*, not per asset: art whose value is in flat
regions and hard edges — interface elements, pixel art, line art, tile sets, anything
carrying text — takes a lossless or palette-indexed path, and the memory that costs is
budgeted up front rather than negotiated asset by asset. Where a lossy path is unavoidable,
acceptance is a measurement against the source, not an assumption: an encoder reports
success on every image it is handed, and its report is a self-assessment
([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)), never a verdict.

## A tile set is enumerable, which makes completeness a machine's job

The last piece of the subject is the one where automation is strictly better than
craftsmanship, and it is worth naming because it is so rarely treated that way. An
autotiling rule-set answers one question — given which of a cell's neighbours match, which
image is drawn — and the space of neighbourhoods is finite and small. Every case is
reachable in play, so a case with no image renders as a hole or a fallback in the middle of
a finished level, discovered by a player walking somewhere the level designer did not.

Because the space is enumerable, the completeness check is total rather than sampled: walk
every neighbourhood the rule-set can be asked about and assert that each one resolves to an
image. And because the check is total, it must also assert that it *had* something to walk —
a completeness check over an empty rule-set passes brilliantly and meaninglessly
([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)).
State the size of the enumeration beside the result, and a set claiming full coverage of
zero cases fails loudly.

## Where this subject stops

**Against tiling texture acceptance.** Both subjects care about seams and repetition, and
they are not the same defect. A tiling texture is a *continuous material surface*: its
correctness condition is that the image be continuous with a translated copy of itself, and
its unit of judgment is texels per unit of world space on a three-dimensional surface. A
sprite is *discrete authored imagery*: it is never continuous with a copy of itself, it has
a silhouette and an anchor, and its correctness condition is that it be drawn at the size it
was authored. Where the two meet is a tile set, and the rule for picking is what the seam is
between — if the boundary is between an image and a shifted copy of *itself*, that is tiling
acceptance; if it is between an image and a *different, catalogued* image that must meet it,
a grass tile meeting a grass-to-sand transition, that is this subject's rule-set
completeness. Bleed margins are the clean case of the distinction: a tiling texture must
never be padded, because padding destroys the very continuity being checked, while a sprite
must always be padded, because it has neighbours it is not continuous with.

**Against shader budget authoring.** That subject owns what happens once art is bound into a
material: how many samplers a surface may use, what each feature costs, which shading path a
description implies. It consumes atlas pages as inputs and is entitled to know how many
there are; it is not entitled to decide what goes on them. The seam is the page count. This
subject decides the page budget and what is packed where; the neighbour decides how many
pages a material may bind at once and what it does with them.

**Against asset class poly budgeting.** The doctrine is the same one in a different unit, and
it should be read for its shape before this one is applied: a budget is declared per asset
class with its unit fixed on the authoring side, converted explicitly at any service boundary
that counts differently, and graded delivered-against-requested with an honest *unmeasured*
when either half is missing. This subject states that budget in **authored pixels per world
unit and in atlas pages per class**, where the neighbour states it in triangles. The failure
signature is identical — a clean ratio between what was asked for and what arrived,
discovered at review — and so is the remedy.

**Against generative image craft next door.** Prompt composition, style locking, provider
routing and grading a picture as a picture belong to the neighbouring generative-media
discipline; what this subject adds is everything that only becomes true once a renderer, a
grid, an atlas and a sibling frame are involved.

## The acceptance sequence

1. **Declare the grid** for the art class — authored pixels per unit, presentation scale,
   filtering rule — and generate or author against it rather than resampling afterwards.
2. **Declare the palette** for the set, and quantise every member into it.
3. **Check each frame against the contract**: dimensions on the grid, colour count inside the
   palette, anchor declared and consistent with the art.
4. **Check the set as a set**: anchor stability across frames, silhouette drift, durations
   present with their unit, loop closure.
5. **Pack with derived margins** — padding and extrusion sized from the filter width and the
   mip depth actually in use — and record the addressing.
6. **Choose the compression path by art class**, and where the path is lossy, measure the
   result against the source instead of trusting the encoder's report.
7. **Enumerate the rule-set** where the art is a tile set, asserting both the coverage and the
   size of what was enumerated.

Steps 3 through 7 are arithmetic and run without a human. Steps 1 and 2 are craft, and they
are decisions taken *before* generation rather than judgments passed afterwards — which is
the whole argument. Every one of the relational defects that opens this subject is unfixable
after the fact and nearly free to prevent, and a pipeline that only inspects finished frames
will keep finding them one build too late.

## Failure modes of the naive reading

- **Treating resolution as quality.** A larger frame is not a better sprite; off the declared
  grid it is a worse one, and the extra pixels are noise the renderer must resample away.
- **Accepting frames individually and shipping them as a set.** Every member passes, the set
  is incoherent, and no per-frame gate can ever report it.
- **Packing tight because the page looked wasteful.** The waste is the fix. Margins are
  derived from the filter and the mip depth, not chosen by eye.
- **Letting the anchor default.** An undeclared anchor is a declared one at a corner, right by
  accident for some frames and wrong for the rest.
- **Trusting an encoder's report.** Every encoder succeeds. Whether the art survived is a
  separate measurement against the source.
- **Sampling a tile set's completeness.** Spot-checking an enumerable space is choosing not to
  answer a question that has a total answer.
- **Recording nothing about what was checked.** An asset accepted without a grid check and one
  accepted with a clean grid check must be different values downstream, or nobody can say how
  much of the library was ever verified
  ([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).
