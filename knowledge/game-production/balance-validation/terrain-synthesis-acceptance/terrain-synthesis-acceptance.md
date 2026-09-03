---
layer: golden-path
type: golden-path
subject: terrain-synthesis-acceptance
status: forged
use_when: [accepting a generated heightfield as ground a game can be played on, a generated landscape looks magnificent and nothing on it can be walked, declaring the units and vertical basis of synthesized terrain, checking biome and material masks against the height and slope they claim to describe, handing generated ground to a level planner]
techniques:
  - heightfield-resolution-and-vertical-basis
  - slope-traversability-envelope
  - drainage-coherence-as-plausibility-gate
  - biome-mask-cross-consistency
  - playable-area-versus-backdrop-ratio
  - terrain-to-room-graph-handoff
---

# Terrain synthesis acceptance

A generator returns ground: a grid of elevation samples and a stack of masks painted over
it — where the rock is, where the grass is, where the trees may stand, where the water
sits. The question this subject answers is whether that output is **terrain a game can be
played on**, as opposed to a very good picture of terrain.

The two are easy to confuse and expensive to confuse, because a heightfield cannot be
malformed. It is a rectangular array of numbers. Every value in it is a valid number,
every neighbour relation is defined, the array parses, loads, tessellates and renders.
There is no structural defect available for a structural check to find, which means the
entire class of proof that carries most content pipelines —
[structural proof](../../_laws.md#structural-proof-is-never-sufficient) — buys nothing
here at all. It passes on the first try, forever, on ground that is unplayable.

So the acceptance question is never "is this well-formed". It is a set of questions about
**relations to declared quantities**: how big is a cell and in what unit, how steep is
steep for the things that move on it, whether the water can leave, whether the layers
agree with each other and with the ground beneath them, and how much of this map is
actually available to a player rather than scenery behind an invisible wall.

## The shape of the failure this subject exists to catch

A coherent-noise generator with an erosion pass produces a magnificent mountain range. It
renders beautifully in a preview. Nothing above the treeline can be walked on, because the
gradient there sits at three times the character's walkable limit. The rivers, carved by a
pass that ran before the mountains were raised, run uphill. The biome mask paints desert
across a glacier because it was keyed on latitude and never consulted elevation. And of
the enormous map, the fraction a player can reach and stand on is a few percent — nobody
knows which few percent, because nobody computed it.

Every automated check in the line passed. That is not an indictment of the checks; it is
the definition of the medium. Ground is accepted by measuring it against stated intent,
and where no intent was stated there is nothing to measure against and the honest verdict
is *not gradeable*, never *fine*.

## A heightfield without a declared basis is a picture

The first discipline is bookkeeping, and skipping it invalidates every check downstream.
Three quantities travel with the field or it is not terrain: the **horizontal spacing
between samples**, the **vertical range the sample values span**, and the **unit both are
expressed in**. A grid of values between zero and one is not elevation. It becomes
elevation only when something states that the grid covers so many metres across and that
full scale means so many metres up.

Two of those three are routinely lost. Horizontal spacing is implicit in "the map is this
big and the grid is this many samples", so it survives as a division somebody has to
remember to perform; the moment a field is resampled for collision or for a distant
tile, the division changes and nothing announces it. The vertical is worse, because it is
usually stored twice — once as the numeric range of the samples and once as a multiplier
applied at import — and two stored copies of one quantity is exactly the condition
[one authority per quantity](../../_laws.md#one-authority-per-quantity) forbids. Terrain
whose vertical scale lives in the exporter and again in the importer will eventually
disagree with itself, and the symptom is a world that is subtly, uniformly too dramatic.

That last word names the specific trap. **Vertical exaggeration is the lie that makes a
preview beautiful and the ground impossible.** Stretching the vertical by a factor of two
turns pleasant hills into alps in a thumbnail and doubles every gradient in the field —
which is to say it takes terrain that was inside the walkable envelope and puts most of it
outside, without changing a single sample. An exaggeration factor is a legitimate authoring
control and an illegitimate secret: it is part of the basis, it is declared, and every slope
number is computed after it is applied, never before (heightfield-resolution-and-vertical-basis).

The neighbouring craft of world scale at the import edge for generated assets is the same
problem in a different medium, and the discipline transplants directly rather than needing
restating: a generator destroys size information, size is re-established at the receiving
end from something real, and the correction is derived rather than tuned. Read that subject
for the discipline; what is specific here is that a heightfield carries *two* scales, not
one, and that the vertical one is the dangerous one because it silently multiplies slope.

## Slope is the acceptance criterion, and it is two-sided

Whether ground can be traversed is a question about its gradient field, and it has a
precise answer that nobody should be eyeballing from a screenshot. Compute the gradient at
every sample, convert it to the angle the runtime will compare against, and compare the
result to a **declared envelope per locomotion class** — because a walker, a climber, a
mount and a wheeled vehicle do not share a limit and a single global maximum is either too
loose for the vehicle or too tight for the climber.

Two things make this harder than it sounds, and both are where teams get it wrong.

The first is that the answer must be a **distribution, not a maximum**. A map's steepest
sample tells you almost nothing: every interesting landscape has cliffs, and a cliff is not
a defect. What matters is what fraction of the ground sits inside the envelope, where that
fraction is, and whether the inside-envelope ground forms one connected region or a
scattering of islands separated by walls. A map that is ninety percent walkable in twelve
disconnected pockets is worse than one that is forty percent walkable in a single connected
sheet, and a maximum-slope check cannot tell them apart.

The second is that **slope is a property of the sampling, not only of the terrain**. The
same hillside measured on a two-metre grid and on an eight-metre grid returns different
angles, because coarsening averages away the local steepness — and this matters practically,
because the representation a physics or navigation system actually consults is frequently
not the one that was authored. Measure at the spacing the runtime will use, and state the
spacing beside the number, per
[a number carries its unit and its basis](../../_laws.md#a-number-carries-its-unit-and-basis).

The envelope is two-sided because a floor exists as well as a ceiling. Ground that is
uniformly flat is not free of defects; it is a parade ground. It drains nowhere, it gives
the player no landmark relief, it reads as untextured in motion, and it is the signature of
a generator whose amplitude was set for a thumbnail rather than for a playable region. State
the minimum interesting relief per class alongside the maximum traversable angle
(slope-traversability-envelope).

## Drainage coherence is a cheap plausibility rung, and it is only a rung

There is one computation that separates ground that could plausibly exist from ground that
could not, and it costs almost nothing: **follow the water**. Assign each sample a flow
direction toward its steepest downhill neighbour, accumulate flow along those directions,
and ask whether the water can leave. Terrain that fails this test fails it loudly — rivers
that climb, channels that terminate in a wall, standing water perched on a slope, a
drainage network whose branches flow into each other's headwaters.

The failure is not exotic; it is the normal output of a pipeline whose passes ran in the
wrong order. Carve the rivers, then raise the mountains, and the rivers now run over the
ridges. Blend two heightfields that were each internally coherent and the seam between them
is a hydrological impossibility. Nobody looking at a rendered frame reliably notices, and
everybody feels it.

Be precise about what this proves, because it is routinely oversold. It proves that the
field is **internally consistent as a surface water can move over**. It does not prove the
terrain is geologically credible, that its landforms are attractive, that its scale reads
correctly, or that it is any fun to walk. It is a rung on a ladder of evidence and it sits
below every perceptual judgment; a map that drains perfectly can still be a lumpy mess. Say
which rung was reached and stop there (drainage-coherence-as-plausibility-gate). And a
closed basin with no outlet is not automatically a defect — such basins exist in the real
world — but an undeclared one is, because the difference between an intended salt flat and
a pit the erosion pass forgot to resolve is a statement of intent that only a human makes.

## Masks must agree with the ground and with each other

Over the height field sits a stack of masks: which biome, which surface material, where
vegetation may stand, where water is, where the play boundary runs. Each is generated by
its own rules, frequently by a different pass, and their **mutual consistency is nobody's
job by default** — which is why it is the failure that survives into production.

Three families of contradiction are worth checking, and all three are detectable before a
single object is placed. **Against height**: a snow mask below its own declared snow line,
a beach material at an elevation the water never reaches, an alpine biome in a basin.
**Against slope**: a dense-forest mask on ground steeper than a tree can root, a swamp on a
forty-degree face, a road material climbing a cliff. **Against each other**: a vegetation
mask outside the biome that is supposed to support it, two exclusive biomes both claiming
the same sample, material weights that do not sum to full coverage so that some region
resolves to whatever the shader happens to have in slot zero.

The consequence downstream is always the same and always expensive: impossible placement.
A scatter pass reads the vegetation mask, faithfully plants trees at forty degrees, and the
result is a forest of trunks intersecting a cliff face, discovered by an artist a week
later. The mask check is worth having precisely because it is cheap and early, and because
the fix at that point is a rule change rather than a manual cleanup pass.

The subtle failure in this family is a check that examines nothing. A mask that was never
written, or was written empty, satisfies every consistency rule trivially — no sample
contradicts anything, because no sample is set. So the check states the size and identity
of what it examined beside its verdict, and an empty mask is a loud failure rather than a
silent pass, which is exactly what
[an instrument proves it had input](../../_laws.md#an-instrument-proves-it-had-input)
demands (biome-mask-cross-consistency).

## How much of this is a map, and how much is a view

Large synthesized worlds are mostly backdrop, and that is correct. Distant mountains exist
to be looked at. The defect is not the presence of backdrop; it is the **absence of a
declared ratio**, which lets a generator produce whatever fraction its parameters happened
to land on while the map's advertised size implies something else entirely.

State the intended playable fraction per map class as a shape, not a ceiling — an arena, a
corridor-shaped approach, an open exploration region and a vista-dominated set piece want
completely different numbers, and a generator handed a ceiling will spend it, per
[a budget shapes the output](../../_laws.md#a-budget-shapes-the-output). Then measure the
delivered fraction with a stated definition of *playable*, because the word carries most of
the weight: playable ground is inside the traversable slope envelope, inside the declared
play boundary, and **connected to where the player starts**. The third clause is the one
everybody omits, and it is the one that turns a comfortable-looking number into an honest
one — a plateau nobody can climb to is not playable area, however gentle its slopes
(playable-area-versus-backdrop-ratio).

## What terrain hands the level planner, and what it may not decide

This is the sharpest boundary in this subject, and it is worth stating as a rule rather
than a sentiment. The neighbouring discipline of **procedural level planning** owns the
*graph*: rooms and connections, room sizes and difficulty values, seed determinism and the
parameter-support matrix, pacing rules, landmark roles, gate-and-key solvability, and the
critical-path shape of a space. This subject owns the *ground*: the field, its basis, its
gradient, its masks, and the honest statement of which parts of it can be stood on.

The handoff runs one way and carries a small, precise payload: a traversable-region
description in stated units — the traversable mask at a stated spacing, its connected
components with their areas and adjacency, the slope envelope and locomotion class it was
computed under, and the basis the whole thing rests on. The planner places rooms and routes
connections **inside** those components and nowhere else. Terrain does not decide how many
rooms there are, where the ending fight goes, which connections are gated, or what the
pacing is; those are the planner's, and a terrain pass that starts nominating boss arenas
has taken a decision it cannot justify from a gradient field. Conversely the planner does
not re-derive walkability with a threshold of its own — the envelope is single-sourced or
the two systems will disagree about the same hillside — and it does not assume a region is
reachable because it lies inside the map boundary. When the planner needs a region the
ground does not offer, the correct move is a **regeneration request with a stated
constraint**, not a room placed on a cliff and a note in a document
(terrain-to-room-graph-handoff).

When the two disagree, the ground wins. The plan is a request over the terrain; the
traversable mask is a measurement of it.

## What this subject does not own

It does not own the graph, as above. It does not own the *contents* of the space — what
encounters sit in it, whether they are fair, how the difficulty ramps — which are simulation
and pacing concerns answered by other instruments entirely. It does not own the world-scale
discipline for generated meshes placed onto the terrain, which is its own subject at the
import edge and is referenced rather than duplicated; a rock that is four percent large and
a heightfield whose vertical is doubled are the same law applied to different media, and
only one of them belongs here. It does not own the surface shading, the tiling behaviour of
the materials the masks select, or the density budget of the vegetation those masks admit.
And it stops at the point the ground is accepted: streaming layout, lighting, audio scenes
and navigation baking all consume this output, and the quality of every one of them is
bounded by whether the terrain honestly reported what it is.

## Failure modes of the naive reading

**"The heightfield is valid, so the terrain is fine."** A heightfield is always valid. It is
a grid of numbers and it cannot be malformed, which is why a structural pass here is a pass
about nothing. Every real criterion in this subject is a relation to a declared quantity.

**"It looks incredible in the preview."** A preview is rendered from above, at a distance,
with the vertical exaggerated to flatter it. Every one of those choices hides exactly the
property that decides playability. Judge slope from the gradient field, not from a picture.

**"The maximum slope is under the limit."** Then either the terrain is a plain or the check
is measuring something else. The useful number is the distribution and the connectivity of
the region inside the envelope, and a single maximum conceals both.

**"The generator has an erosion pass, so the drainage is fine."** Erosion is a filter, not a
guarantee, and the common defect is pass ordering rather than the pass itself. Compute the
flow; it is cheap, and it is the only thing that actually answers the question.

**"The masks came out of the same generator, so they agree."** They came out of different
passes with different keys, and their contradictions are invisible until something is placed
using them. Check the layers against the ground and against each other while a fix is still a
rule change.

**"The mask check reported no conflicts."** Ask how many samples it read. A mask that is
empty conflicts with nothing, and a consistency check over an empty set is the cheapest clean
result in the pipeline.

**"The map is enormous."** The map's extent is not its playable area, and the two are
routinely off by an order of magnitude. Declare the ratio, measure the ratio, report both.

**"The planner will handle it."** The planner reasons over a room graph, and a room graph
assumes the ground beneath it exists and is walkable. That assumption is precisely what this
subject is for; nothing downstream re-derives it, and nothing downstream can.
