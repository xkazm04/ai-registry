---
layer: technique
type: technique
subject: aaa-craft-rubric-authoring
technique: named-benchmark-anchors-per-level
status: forged
laws: [grade-against-what-ships-not-on-a-curve, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [defining the quality levels of a craft rubric, scores cluster in the middle band, two reviewers disagree about what excellent means]
---

# Named benchmark anchors per level

Every quality level in a craft rubric names a concrete reference standard that an
examiner can picture, instead of an adjective the examiner must interpret. The anchor
is the unit the score is denominated in. Without it a level is a word, every examiner
supplies a different meaning, and the resulting number carries no basis — it is a
five-point scale measuring five different things depending on who read it.

## The procedure

For each level of the scale, from top to bottom:

1. **Choose a reference that is specific, current, and publicly available.** Specific
   means one product, one release, one recognisable piece of work — not a genre, not a
   studio's catalogue, not "AAA". Current means shipped recently enough that the
   craft standard it represents is the one the market holds today. Publicly available
   means every examiner, including a new one, can go and look.
2. **Test it for shared recognisability.** Hand the level to two practitioners in the
   medium and ask each to describe what a piece at that level looks like. If the two
   descriptions differ in kind rather than in detail, the anchor is not doing its job
   and needs replacing with something narrower.
3. **State what about the reference is the anchor.** A reference product is not
   uniformly excellent; name the attribute the level is anchored on — its silhouette
   language, its transition coverage, its mix discipline, its telegraph clarity. This
   is what stops an anchor from importing every unrelated quality of the reference.
4. **Anchor the bottom too.** The failing level needs a reference as much as the top
   one does, and it is the harder one to write, because nobody wants to name a piece
   of shipped work as the floor. The workable form is a class of output rather than a
   product: "what a generative pass produces before any human pass" is a floor an
   examiner can recognise and does not libel anyone.
5. **Keep the ladder monotone in one craft dimension.** Levels must differ by amount
   of the same thing. If level 3 is anchored on technical cleanliness and level 4 on
   artistic ambition, examiners cannot order them, and artifacts strong on one and
   weak on the other land arbitrarily.

## Name the differentiators, then derive the level from them

The most useful thing an anchor carries is not the product but the *practices that
distinguish it from the level below*. Write them down: for the top level, the two or
three named practices a reference product demonstrably has and the level beneath does
not — a specific review discipline, a specific structural technique, a specific
measured standard it holds itself to. The level below is then defined mechanically:
professional throughout, but missing two or more of the named differentiators.

This turns level assignment from an impression into a count, and it makes the ladder
auditable. A reviewer disputing a grade argues about whether a named differentiator is
present, which is a question about the artifact, rather than about whether the piece
"feels" top-tier, which is a question about the reviewer. It also exposes a common
authoring bug immediately: if you cannot name what separates two adjacent levels, they
are one level.

## Decision rules

- **Three to five levels, never more.** Anchoring is expensive and the anchors have to
  be genuinely distinguishable. If you cannot write four anchors that a practitioner
  would place in that order without being told, you have a three-level scale.
- **When the medium has sub-crafts, anchor per sub-craft.** A schematic, an icon set
  and a finished composition in the same medium need different reference standards.
  Sharing anchors across them is the same error as sharing a rubric across them.
- **When no current reference exists at a level, say so and leave it empty rather than
  inventing one.** An empty level is a known gap; a vague anchor is a silent one, and
  examiners will fill it with the middle of the scale.
- **Re-anchor on a schedule, not on complaint.** The market standard moves. Review
  anchors when a class's grades stop moving — a distribution frozen for two quarters
  usually means the anchors have aged out, not that the work has plateaued.
- **The anchor names a standard, never a target to imitate.** Grading a piece on how
  much it resembles the reference produces derivative work that scores well. The
  anchor fixes the *level*; the criteria fix what is being levelled.

## Why adjectives fail specifically

Anchoring is not a stylistic preference for concreteness. Examiners — human and
machine — exhibit strong central tendency on unanchored scales, and the effect grows
with scale width. Given "poor / fair / good / excellent" and no referents, the mass of
grades lands on the two middle levels regardless of the input distribution, because
the middle is where an uncertain rater is safest. Concrete anchors move grades to the
ends by making the ends reachable: an examiner who can picture the top can also see
that the artifact in front of them is not it.

The second failure of adjectives is drift without a diff. Two examiners, or one
examiner across two months, reinterpret "good" freely, and nothing in the record shows
that the standard moved. An anchored level changes only when someone edits the anchor,
which is a visible, reviewable, versionable act.

## When not to use it

- **Where the bar is a measured threshold, not a comparison.** If the level can be
  stated as a number with a unit — a loudness figure, a primitive budget, a frame
  count — state the number. A reference product is a worse instrument than a
  measurement whenever a measurement exists. Anchors are for the qualities that resist
  measurement, which in craft is most but not all of them.
- **In a pass/fail conformance check.** Conformance has one bar and no ladder; anchors
  add nothing and invite examiners to grade a gate.
- **For an internal-only artifact class with no market analogue.** Some deliverables —
  scaffolding, intermediate representations, planning documents — have no shipped
  reference. Anchor those on internal exemplars held as fixtures instead, and accept
  that the anchor is only as stable as the fixture.

## The failure this prevents

The characteristic damage of unanchored levels is that the whole rubric goes quiet: it
keeps producing numbers, the numbers keep landing between the second and third level,
and the production line reads that as "our content is consistently adequate". It is
not a measurement of the content at all. It is a measurement of examiner uncertainty,
and it will report the same value after the generator improves and after it regresses.
