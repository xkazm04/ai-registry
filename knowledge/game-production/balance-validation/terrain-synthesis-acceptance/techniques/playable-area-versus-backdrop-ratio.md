---
layer: technique
type: technique
subject: terrain-synthesis-acceptance
technique: playable-area-versus-backdrop-ratio
status: forged
laws: [a-budget-shapes-the-output, a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [declaring how much of a generated map is meant to be playable, a vast generated world turns out to have a few percent of usable ground, comparing two generated maps that advertise the same size, budgeting a map class before generation]
---

# Playable area versus backdrop ratio

A synthesized map has two kinds of ground: the part a player can occupy and the part that
exists to be looked at. Both are legitimate — distant relief is content, and a world without
it feels like a diorama. What is not legitimate is failing to declare the split, because
then the map's advertised extent implies a scale of play that nothing has ever checked, and
a generator produces whatever fraction its parameters happened to land on.

The naive reading is that this is a ceiling to stay under, as in "no more than so much
backdrop". It is the opposite: it is a **statement of the intended shape of the map**, and
it is handed to the generator as a target, per
[a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output). A generator told
"up to" spends up to. A generator told "an arena-class map: nearly all of it playable, with a
thin framing band" produces the map that was wanted.

## The definition carries the weight

Most of the difficulty in this technique is in the word *playable*, and a figure computed
under a loose definition is worse than no figure. Playable ground satisfies three conditions
simultaneously:

- it is **inside the traversable slope envelope** for the map's declared locomotion class;
- it is **inside the declared play boundary** — the region the design intends the player to
  be in, whatever mechanism enforces it;
- it is **connected, over traversable ground, to where the player enters the map**.

The third clause is the one everybody omits and the one that makes the number honest. A
gentle plateau ringed by cliffs is inside the envelope, inside the boundary, and worth
nothing: it is scenery with a comfortable gradient. Computing area without connectivity
routinely overstates the playable fraction by a large multiple, and the overstatement is
invisible in every summary a stakeholder sees.

State the basis beside the ratio — the locomotion class, the sample spacing the area was
measured at, and the entry region connectivity was resolved from — per
[a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis).
The same map yields materially different fractions for a walker and for a climber, and both
are correct.

## Procedure

1. **Declare the target ratio per map class before generating**, as an intended shape with a
   stated tolerance, not as a limit. The classes are few and stable: an arena or an interior
   region is nearly all playable; a corridor-shaped approach is mostly playable with framing
   relief on both sides; an open exploration region carries a substantial backdrop by design;
   a vista set piece is mostly backdrop and says so.
2. **Compute the traversable mask** from the slope envelope for the declared class.
3. **Intersect it with the declared play boundary.** Where no boundary is declared, report the
   ratio as unmeasurable rather than defaulting to the full extent, per
   [unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass) — a map with no
   boundary has no backdrop and therefore no ratio.
4. **Resolve connected components and keep the one containing the entry region.** Report the
   discarded components: their number and their total area is the "looks playable, is not"
   figure, and it is the single most useful diagnostic this technique produces. Carry it as a
   **single connectivity ratio** as well — the entry-connected component over all in-envelope
   ground, one at a fully connected map — because one number travels into a build report and
   a list of components does not.
5. **Report achieved beside declared,** with the basis. A map that asked for three-quarters and
   delivered two-fifths is not automatically a failure, but showing only the request implies it
   was met.
6. **Attribute the shortfall.** Ground lost to slope, ground lost to the boundary, and ground
   lost to disconnection are three different problems with three different fixes, and an
   undifferentiated shortfall sends a designer to re-roll.

## Decision rules

- **When the achieved fraction is far below target, look at the discarded components before
  changing the generator's amplitude.** A shortfall that is mostly disconnection is a
  connectivity problem — one ramp fixes it — and turning down the relief to fix it produces a
  flat map that hits the number and plays worse.
- **When a map class is not declared, refuse to grade the ratio.** The same terrain is an
  excellent vista set piece and a broken arena; grading against an assumed class yields a
  confident finding about the assumption.
- **When a map is assembled from regions with different classes, budget per region and derive
  nothing from the whole map's number.** A single figure over a map containing an arena and a
  mountain range describes neither, and repeating the whole map's allowance for each region
  builds every region to the size of the map.
- **When the fraction is met but the playable component is a thin sliver, report the shape as
  well as the area.** Area alone cannot distinguish a usable region from a ribbon, and a
  compactness or width figure alongside it costs nothing.
- **When backdrop is generated at the same fidelity as playable ground, treat it as a budget
  finding rather than a quality one.** Backdrop that nobody reaches carries the cost of ground
  that everybody walks; the ratio is what makes that cost visible and attributable.
- **When the entry region is not yet known, compute connectivity from every candidate and
  report the range.** A single number computed from a guessed entry point is a fabrication
  wearing a measurement's clothes.

## When not to use this

- **Fully bounded spaces with no scenic exterior** — an interior, a closed arena, a level whose
  extent is exactly its play space. The ratio is one by construction and the check is
  ceremony.
- **Continuous streaming worlds where the play boundary is the world's edge** and backdrop is a
  distance-based rendering concern rather than an area one. There the relevant question is
  reachability of regions, not a fraction of a rectangle.
- **As a quality verdict.** A map that hits its declared ratio exactly can be tedious, ugly and
  unreadable. This technique establishes that the map has the shape it declared; whether that
  shape was the right one, and whether the ground inside it is worth walking, are separate
  questions with separate instruments.
