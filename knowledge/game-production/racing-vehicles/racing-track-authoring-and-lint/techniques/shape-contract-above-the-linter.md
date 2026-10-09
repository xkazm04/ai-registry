---
layer: technique
type: technique
subject: racing-track-authoring-and-lint
technique: shape-contract-above-the-linter
status: forged
laws: [structural-proof-is-never-sufficient, law-and-check-share-one-source, a-verdict-is-bound-to-its-content, unmeasured-is-not-a-pass]
shared_with: []
use_when: [every circuit passes the linter and the library still reads as a set of ovals, accepting new circuits into a library rather than loading one at run time, a pacing edit such as stretching a lap for duration, deciding what sits between not degenerate and a person liked it]
---

# A shape contract above the linter

The linter answers one question: is this circuit unraceable? A library can pass it on every
circuit and still be a set of rounded rectangles that nobody wants to drive twice. The technique
is a **second instrument, kept apart from the linter**, that measures the shape of the whole lap
and the rhythm it implies against stated minimums. Every gate has a planted geometry built to
fail it, and the instrument decides what is **accepted into the library**. It does not decide what
may load.

## Why the linter cannot do this

Every lint rule is local or degenerate-case: a width at a point, a curvature at a vertex, a
fraction of the whole lap. None of them sees the outline. The straight-fraction band has the same
blindness by design: three short straights and one long one give the same number. The measured
case is a library of 29 circuits that passed every lint rule and failed a shape contract on all
29. It had already been rejected by a person as ovals. Nothing in the lint layer could have said
so, because "oval" is a property of the whole outline and of how one circuit compares with the
next.

Three independent sources measure rhythm by its distribution and its placement, not by one
fraction. Research on generating racing tracks scores diversity as the entropy of the curvature
profile and of the speed profile, and finds the two only loosely correlated. Motorsport circuit
regulations define a corner by its angle and radius and cap the length of a straight rather than
its share. A practitioner's checklist asks for corner-type variety, the longest flat-out stretch
and a simulated driver's speed profile. The contract collects those measures in one place.

## What the contract measures

Three families of measure, each with a minimum or maximum in one table:

- **Outline.** How far the lap departs from its own convex hull, as lap length over hull
  perimeter. An oval follows its hull and scores near one. Add the absolute turning and the count
  of left-right changes, the number of direction reversals, and a fold-back share: arc where the
  road runs back alongside itself. Fold-back is measured with the exclusion rule described under
  "Use one exclusion" below.
- **Rhythm.** Corner count; the number of corner families, meaning radius classes, or an entropy
  over radii; the longest straight; and **placed straight-brake pairs**, a straight of a stated
  number of car lengths that ends in a corner of at least 45 degrees tighter than a stated radius.
  A placed pair answers where the straights are, which the fraction cannot.
- **Race behaviour under simulation.** Overtakes per lap, contacts per car-kilometre, early wreck
  rate from the lead slot, spins and stalls, and the entropy of the lateral line the drivers use.
  These are run on seeded opponents. The evidence is stated as seed count, grid rotations (every
  slot gets every car) and the share of seeded runs that actually differ. Without that last
  number, twelve seeds can be one run twelve times.

Add a **library-level** check beside the per-circuit gates. Compare every pair of outlines under
normalisation for position, scale, rotation, reflection and start point, and flag pairs that are
too similar. A library of ten distinct-looking ovals passes every per-circuit gate it can pass. A
similarity pass is what says it is one circuit ten times.

## Rules

1. **Kept apart from the linter.** A lint failure refuses the circuit at load. A shape finding
   refuses it entry to the library. Merging the two makes the linter slow and opinionated, and it
   makes the shape contract look as certain as geometry, which it is not.
2. **Shared quantities come from the linter's table.** Minimum radius, minimum width and the
   straight threshold are read from the same rows the linter reads, never copied
   ([the law and the check share one source](../../../_laws.md#law-and-check-share-one-source)).
   The contract's own minimums live in their own table, each beside the hypothesis it encodes
   ("more than one radius family is present"), so a reader can argue with the hypothesis and not
   only the number.
3. **Every gate has a planted witness.** A circle should fail the outline and rhythm minimums. A
   real figure of eight should fail the crossing gate. Rotated, scaled and reflected copies should
   fail the similarity check. Witnesses are baked through the same pipeline as content, not
   written as invented metric rows. The discipline is the linter's, from mutate-good-track-to-prove-linter.
   In the measured case a planted circle first counted as a hairpin under an unbounded angle rule,
   and the witness caught it.
4. **Re-run after every pacing edit.** Stretching a lap to hit a target duration is a geometry
   edit. In the measured case it removed two circuits' hairpins, and lint plus simulation did not
   notice. A shape verdict is bound to the geometry it judged
   ([a verdict is bound to its content](../../../_laws.md#a-verdict-is-bound-to-its-content)).
   Key any simulated evidence on everything that changes the experiment, including the grid
   position, not only the node file.
5. **Report "accepted shape", never "good".** The minimums are authored hypotheses. A circuit
   that passes is not an oval and has placed rhythm. Whether it is fun is a person's verdict, and
   the contract must not be reported as one
   ([unmeasured is not a pass](../../../_laws.md#unmeasured-is-not-a-pass)).

## Use one exclusion for every nonlocal measure

Fold-back, proximity and the linter's distant-overlap rule all need to ignore arc neighbours,
because every point is close to the points beside it. Exclude neighbours over an arc length that is
large against both the car and the road, several car lengths or several road widths, whichever is
greater. An exclusion stated only in road widths can be shorter than one baked segment on a coarse
bake. The neighbour two samples along then falls outside the exclusion, and the rule fires on a
road's own continuation.

## What was measured, simulated, authored

The shape metrics are exact computations on the baked curve, and a planted witness's rejection is a
measurement of the instrument. The race metrics are simulation: they describe the seeded opponents,
not people. Every minimum is authored. The 29-of-29 rejection agreed with an earlier human rejection
of the same library. It does not show that the contract's minimums are where a person would put them.

## When not to use this

- **A handful of circuits that a designer drives every lap.** The contract replaces judgment at
  scale. At four circuits the person is cheaper and better.
- **A circuit that is one-note on purpose**, such as an oval. Give it a reasoned exemption. Do not
  loosen the gates.
- **Point-to-point stages**, where hull and fold-back measures mean something else. Use rhythm
  and simulation measures only.
- **As a replacement for the linter.** The contract assumes the circuit is raceable. Run it on
  circuits that already pass lint.
