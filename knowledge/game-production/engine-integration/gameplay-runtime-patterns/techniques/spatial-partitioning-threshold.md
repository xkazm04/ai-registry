---
layer: technique
type: technique
subject: gameplay-runtime-patterns
technique: spatial-partitioning-threshold
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a gameplay system compares every participant against every other, deciding whether a broad-phase structure has earned itself, choosing a cell size or a tree depth, an acceleration structure made things slower]
---

# Spatial partitioning threshold

The named concern: decide whether the quadratic pairwise work in a gameplay system has grown
large enough to pay for an acceleration structure, and if so which one and at what
granularity. The two failures are symmetric and both common in generated code: a partition
adopted at a population where exhaustive comparison was faster, and no partition at a
population where the step has quietly become the frame's largest cost.

## The shape of the problem

A system in which every participant must consider every other performs comparisons growing
with the square of the population. That growth is invisible at small counts and abrupt at
large ones: doubling the participants quadruples the work, so a system that is comfortable at
two hundred is in trouble at eight hundred without anything having changed but the content.

An acceleration structure replaces "compare with everyone" with "compare with everyone
nearby". It buys the removal of the quadratic term. It costs a structure that must be kept
current as participants move, a granularity parameter that has to be chosen, memory, and a
sensitivity to how the population is distributed that the exhaustive version does not have.

## Where the crossover actually sits

Lower than intuition suggests in one direction and higher in the other. Exhaustive pairwise
testing over simple bounding volumes stays competitive into the low hundreds of
participants — published broad-phase benchmarks put the useful boundary for the naive
approach in the region of a few hundred rather than in the thousands — because the
comparisons are trivially cheap, perfectly predictable in memory, and have no maintenance
overhead at all. Above that region the gains from partitioning become large fast; benchmarks
on populations in the tens of thousands report speedups of two to three orders of magnitude
against exhaustive testing.

Treat those figures as an order-of-magnitude guide to where to *start measuring*, never as
the decision itself, because the true crossover depends on the cost of one comparison, on
how much of the population moves each step, and above all on how the participants are
distributed. What the numbers are good for is settling the arguments at the two extremes: at
forty participants the answer is no structure, and nobody should spend an afternoon on it;
at forty thousand the answer is a structure, and the only open question is which.

## Distribution is part of the decision, not a detail

A uniform grid is close to optimal when participants are evenly spread and similar in size,
because each participant then touches a bounded number of cells and each cell holds a bounded
number of participants — the conditions under which its lookup is genuinely constant-time. It
degrades badly outside them, in two specific ways worth naming because both are typical of
game content rather than exotic.

**Clustering.** Real levels concentrate participants: a crowd in an arena, everything stacked
around one objective, a pile at the bottom of a slope. In the limit every participant lands
in one cell and the grid has reproduced the exhaustive comparison plus the cost of
maintaining a grid. A hierarchy — a tree that subdivides where density demands it — costs
more per query and does not collapse this way.

**Size disparity.** One participant much larger than the cell spans many cells and is
inserted into all of them, so the structure's maintenance cost is dominated by a handful of
large objects. Either separate the large ones into their own list compared exhaustively, or
choose a structure whose node size adapts.

The rule that follows: **the distribution is measured from real content before a structure is
chosen, not assumed to be uniform.** A grid selected against an imagined even spread and
deployed on a clustered level is slower than the code it replaced, and the report will say
the optimisation was applied.

## Granularity carries its unit and its basis

A cell size is meaningless as a bare number. It is stated in world units, next to the typical
participant extent it was chosen against and the population density it assumed, or the next
author to change the world scale will silently invalidate it. The serviceable starting point
is a cell on the order of the typical participant's bounding extent — small enough that a
cell holds few participants, large enough that a participant touches few cells — and it is
then tuned by measurement rather than by argument.

The same discipline applies to a tree's depth limit and to its split threshold. Each is a
tuned number with a basis, each interacts with the content it was tuned on, and each must be
re-measured when the content changes character. A structure tuned once and never re-measured
is a structure whose parameters describe a build that no longer exists.

## Procedure

1. **Measure the current cost.** Population, comparisons per step, and the step's measured
   share of the frame, taken from representative content and not from a stress scene. Without
   this the adoption is unjustified regardless of how large the population sounds.
2. **Exhaust the cheap wins first.** Cull participants that cannot possibly interact — by
   layer, by team, by activity state, by a coarse region — and reject early on a cheap test
   before the expensive one. Halving the effective population quarters the work, and no
   structure was needed to do it.
3. **Characterise the distribution** from real content: spread against clustering, and the
   ratio of the largest participant extent to the typical one.
4. **Choose the structure that matches the distribution.** Even spread with similar sizes: a
   uniform grid. Clustered or widely varying sizes: a hierarchy, or a grid plus a separate
   exhaustive list for the outliers.
5. **State the granularity with its unit and its basis** in the code and in the change that
   introduces it.
6. **Measure again and compare against step one.** An acceleration structure that did not
   move the measured number is removed, not retained on the grounds that it is more correct
   in principle.

## Decision rules

- **When the population is in the tens, do not partition, because the maintenance costs more
  than the comparisons.** This is the majority of gameplay systems and the honest answer is
  usually the boring one.
- **When the population is in the thousands and every participant considers every other, the
  step is already the frame's problem whether or not anyone has noticed.** Measure it before
  the content grows further; quadratic growth gives no warning.
- **Between those, decide by measurement, never by the size of the number.** "Thousands
  sounds like a lot" is not a threshold.
- **When the structure is rebuilt every step, count the rebuild against the savings.** A
  fully mobile population can make maintenance the dominant cost; an incremental update, or a
  rebuild only when participants have moved beyond a margin, is what keeps it paying.
- **When queries are rare relative to updates, prefer no structure.** The savings accrue to
  queries; the cost accrues to movement. A structure maintained every step and queried
  occasionally has the trade backwards.
- **When only one participant needs the query — one player against everything — that is not a
  quadratic problem and does not need a partition.** It is a single linear scan, and a scan
  with an early rejection is very hard to beat.
- **When the structure is adopted, keep the exhaustive implementation available behind a
  switch and compare their outputs on a sample.** An acceleration structure that misses pairs
  produces gameplay that intermittently ignores an interaction, which reads as a design bug
  and is nearly unfindable without a reference implementation to differ against.

## When not to use this

- **On a fixed, small cast.** A handful of participants against a handful of others, at any
  frequency, is a nested loop and should stay one.
- **Where the platform already provides a queryable scene structure.** Building a second one
  duplicates maintenance for the same information and the two will disagree about who is
  present. Query the existing one and, if it is too slow, measure why before replacing it.
- **As a substitute for reducing the population.** A thousand participants of which nine
  hundred are inert is a content problem. Removing them is cheaper, simpler and helps every
  other system in the frame — a structure that makes the inert nine hundred efficient to skip
  has optimised the wrong thing.
