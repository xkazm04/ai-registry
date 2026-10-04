---
layer: technique
type: technique
subject: encounter-balance-simulation
technique: rotation-confound-cross-check
status: forged
laws: [an-instrument-proves-it-had-input, one-authority-per-quantity]
shared_with: []
use_when: [assigning classes, courses and slots from one run index, a class-by-course table looks suspiciously clean or empty in places, accepting a mixed sweep result]
---

# Rotation confound cross-check

A mixed sweep crosses several factors: which class leads, which course is raced, which grid slot
or side it starts from. The cheap way to cover the cross is to derive every factor from the run
index by modulo and let the index count up. That is also the cheapest way to confound the
factors, because two factors derived with the same modulus are the same factor. The technique is
a review of the **assignment**, not of the result: before the numbers are read, the harness
proves that every cell of the intended cross is actually populated, and by comparable counts.

Status of claims: the confound is a **structural** property of the schedule, shown by
enumeration. Any win rate taken from a confounded schedule is **simulated** and, per the failure
below, also wrong about what it appears to isolate. Nothing here is a human-felt result.

## The failure

Take five classes and five courses and give run `i` the class `i mod 5` and the course
`i mod 5`. The run index cycles, and every class meets exactly one course for the whole sweep:
class zero is only ever raced on course zero. The totals look perfect, each class has the same
number of runs, each course the same number of runs, and the result table is full of confident
rates that mix "this class" with "this course" so completely that no analysis can separate them.
Nothing crashes; the report is plausible; a class that happens to suit its one course reads as
strong and one that does not reads as weak. This is aliasing in the experimental-design sense:
the effects of two factors are carried by one column.

The structure is a Latin-square question. A design that wants factors balanced against each
other needs the assignments to be *crossed*: every pair of levels occurs, equally often, and the
order in which levels are presented is balanced as well.

## The cross-check

1. **Enumerate the schedule, not the results.** Run the assignment function for every run index
   without simulating anything, and tally the pairs: class by course, class by slot, course by
   slot.
2. **Assert the cross is complete.** Every cell of every pair table has at least one entry, and
   the cell counts are equal, or differ by at most one when the run count is not a multiple of
   the cell count. The assertion lives in the test suite, so a later edit to the rotation fails a
   test rather than relying on a reviewer's memory.
3. **Decorrelate by construction.** Use a mixed-radix split: the course advances once per block
   of the other factor's period, so `class = i mod classCount` and
   `course = (i / classCount) mod courseCount`; the slow factor changes only when the fast one has
   cycled through. Where three factors are crossed, give each its own digit of the index.
4. **Say what is held fixed.** In a sweep where each class keeps its own controller style, the
   result is a roster-balance measurement, not an isolated estimate of the class's power. Write
   down which factors were varied independently and which ride along; the design cannot support a
   causal claim about the ones that ride along.
5. **Treat position as a factor.** A grid or spawn advantage for the lead slot is a nuisance
   factor; rotate it across classes, or report it as its own column, rather than leaving it
   inside the class effect.
6. **If the schedule was wrong, discard the result and keep the summary.** A result produced under
   a confounded schedule is evidence about the schedule. Rerun on the corrected preset and keep
   the discarded summary, labelled, so the review trail shows what was caught.

## Companion rule: legal scenarios only

A mixed sweep often includes a strengthened lead to probe progression. The scenario must be built
from the same purchases a player can make, not from a forced maximum. Setting every upgrade tier
to its ceiling can install a part on a class that is already capped on it, with a side effect no
player can buy, so the scenario measures a build that cannot exist. Construct the strengthened
state by running the real acquisition path to exhaustion, and assert that every remaining offer
is refused for a legal reason (at the class limit, at the maximum tier). This is the rule of one
authority per quantity applied to the scenario: the harness must not hold a second, cheaper way to
reach a state the game gates.

## Decision rules

- If two factors are derived from one index, their roles differ: one fast, one slow, or a proof
  that the moduli are coprime and the run count covers the full period.
- If a cross has an empty cell, no statement about that cell is made and the report names it as
  not measured. An empty cell is never rendered as zero.
- If a cell count is too small for a rate (a few dozen runs leaves a spread of several points),
  mark the cell underpowered rather than ranking it.
- If a scenario could not be reached through the real acquisition path, it is labelled a
  hypothetical and does not stand in a balance table beside legal ones.

## When not to use it

- **When one factor is fixed.** A per-course scenario with a rotated class has only one rotation
  to check; the existing equal-entries assertion is the cross-check.
- **When the factors are drawn at random with enough replicates.** Randomisation breaks aliasing
  in expectation. It still needs the cell-count tally, because a small sample can leave a cell
  empty by chance.
- **For a deliberately unbalanced scenario** such as an extreme lead against stock rivals. State
  that it is a stress probe and do not read its rate as a roster property.
