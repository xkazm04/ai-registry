---
layer: technique
type: technique
subject: rigid-body-simulation-stability
technique: filter-the-pair-after-proving-the-class
status: forged
laws: [an-instrument-proves-it-had-input]
shared_with: []
use_when: [a jointed mechanism that is unstable only when it folds on itself, non-adjacent links interpenetrating, deciding whether to disable self-collision, a filter that did nothing]
---

# Filter the pair after proving the class

The named concern: disable the collision between a pair of links only after proving that
self-collision is the cause, and disable the pair, not the class. The defect this prevents
is shipping a global self-collision disable that cured the test scene and removed contact
the model needs for its job, or filtering a pair that was already excluded and concluding
nothing could be done.

## The decision rule

A mechanism with joints can collide with itself between links that share no joint. A chain of
three links A, B, C joined A to B and B to C: the joints already exclude the adjacent
pairs (A,B) and (B,C), so the only active pair is (A,C), and if the corner of one penetrates
the other it is the one that needs attention. Filtering (A,B) is a no-op that leaves the
real pair live and hides the cause behind an apparent null result.

The procedure has three moves, in order.

1. **Prove the class, once.** Disable self-collision for the whole mechanism and rerun the
   reproducible scene (`instability-triage-by-stiffness-source`). If the instability goes
   away, self-collision is the cause. If it does not, stop; the filter will not help, and
   the search moves to drives, mass ratios or external contacts. This disable is an
   experiment, not a fix, and is not committed.
2. **Restore it and find the pair.** Re-enable self-collision and identify which
   non-adjacent pair is touching, from a recorded contact dump of the failing scene. A viewer
   can mislead because the penetrating corner may be inside a link's own volume. Prove the
   dump is live by confirming a pair you know touches is listed.
3. **Filter that pair and nothing else.** Add the single exclusion, rerun, and confirm the
   instability is gone and the contact dump no longer lists the pair. If other pairs
   appear, repeat; each is an individual decision.

## Why not the global disable

Self-collision is usually needed: a folded arm that passes through itself is not a valid
result, a gripper's fingers that pass through each other cannot hold anything, and a
character whose limbs interpenetrate reads as broken. A global disable that was proven
necessary to pass a test must be reverted before the model ships. The shipped state is the
pair filter, because it removes exactly the contact that is unphysical for this mechanism (a
link pair whose geometry overlaps by design) and keeps the rest.

A pair filter is also a statement about the model: the two links never meaningfully touch.
If that is false (they do touch in operation) the filter hides a modelling problem; fix the
geometry instead, by trimming a collision shape or separating the links in the rest pose.

## Failure modes

- **Filtering an adjacent pair.** No effect, since the joint excluded it already. The
  unchanged behaviour then reads as proof that self-collision is not the cause. Always
  identify the pair from the dump rather than guessing by proximity.
- **Concluding from the global disable that the pair filter will work.** The disable removes
  every pair; the cause may be several. Verify with the filter in place.
- **Forgetting the experiment.** A global disable left on after step one is a silent
  regression, and no test notices, because tests of a mechanism that cannot collide with
  itself pass. Keep the disable out of any shared configuration.

## When not to use it

Do not use it where the instability is not contact-shaped; use the triage first. Do not
filter pairs that interact through a deliberate contact (a hand closing on a link it is
supposed to hold). And do not accumulate dozens of pair filters on one mechanism without
revisiting the collision geometry; a long list of filters usually means the shapes are too
large for the mechanism's range of motion.
