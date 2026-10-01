---
layer: technique
type: technique
subject: agent-behaviour-authoring
technique: no-double-grip-penalty
status: forged
laws: [one-authority-per-quantity, structural-proof-is-never-sufficient, unmeasured-is-not-a-pass]
shared_with: []
use_when: [an opponent car cannot finish a race on one surface class while finishing on the others, adding a new surface or a new car class to a game with driven opponents, a grip or friction value is read in more than one place in the opponent code, an opponent is slower than its stated skill predicts]
---

# No double grip penalty

The named concern: a quantity that reduces an opponent's speed, grip above all, is applied
exactly once on its way to the speed the opponent chooses. The defect this guards against
is not exotic. It appears whenever one author writes a physical limit and a second author, or
the same author a week later, adds a defensive multiplier for the same physical effect.

## What the defect looks like

A derived corner speed already contains the surface: the grip scale sits inside the square
root, so a slippery surface lowers the speed through the root, by the square root of its
grip. If the code then multiplies the result by a second surface-dependent factor, the
opponent slows twice for one cause. On a high-grip surface the second factor is close to one
and the error is invisible. On the lowest-grip surface it is at its largest, and it multiplies
a speed that was already the smallest in the table.

The failure is characteristically a **completion failure on one class**, not a handling
failure anywhere. The opponent drives the slippery surface correctly in every observable way —
it does not spin, it does not hit the wall, its lines are clean — and it is simply slow
enough that the slowest opponent car does not finish the course inside the time the race is
allowed to take. No single line is wrong in isolation. A reviewer reading either the limit
or the multiplier sees a reasonable piece of code, and an opponent watched on any ordinary
surface looks right. The defect lives in the product of two correct lines.

The repair is to delete one of the two, not to compensate. Adding power to the affected class
makes the race finish and leaves the opponent applying the penalty twice, which now shows up
as that class being oddly weak whenever the surface changes again. Removing the duplicate
returns the pace to what the single authority says it should be.

## The two places a factor hides

**The limit and the multiplier.** The speed target is built from a physical limit, and a
separate multiplier on the finished target is built from the same physical input. Name the
quantity at the place where it enters the target and refuse a second entry. Where a second
factor is genuinely needed, for a different effect on a different part of the road, it must
be defined over a *different* quantity or a different region and carry a name that says so.

**The look-ahead and the current surface.** One factor is sampled at the point ahead, another
at the car's position. The two are reading the same table at two places and each looks
innocent. Decide which segment of the road each is for — corners use the look-ahead, straights
may use the underfoot value — and make them exclusive by construction, so a corner cannot
pay both.

## The test that finds it

Reading does not reliably find a duplicated factor; running does. The reliable instrument is
a **completion test across every surface and every car class**: a seeded race on each surface
in the game, each with every class represented, with a stated time limit, asserting that every
car finishes. It is cheap, it is deterministic, and it fails in the shape of the defect —
one cell of the matrix, the slowest car on the lowest-grip surface, goes red while the others
stay green.

Three properties make the test worth writing before the defect exists. **The matrix is the
whole surface list**, not the surfaces the tester drives by hand; a new surface is a new row
the moment it is authored. **The limit is the race's allowed time**, not a looser safety net;
the defect is a pace defect, and a generous limit lets it through. **The result is written
out**, with the finishing time per cell, so a surface whose slowest car finishes with one
second to spare is visible as a near miss before it is a failure
([unmeasured-is-not-a-pass](../../../_laws.md#unmeasured-is-not-a-pass)).

A test that asserts only that the opponents were assigned a grip-aware speed and that the
function returned a number has checked a structural rung and nothing else
([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).
The defect passes every such check.

## Decision rules

- **When one class fails to finish on one surface, suspect a duplicate before suspecting the
  class.** Sum the factors applied between the physical limit and the final target and list
  which of them read the same input. Two is the finding.
- **When a surface is added, run the completion matrix before tuning anything.** The first
  failure on a new row is almost always a surface-dependent factor that was written for the old
  rows and assumed the surface values would stay in the range the code was written against.
- **Do not fix a completion failure by raising power, extending the time limit or loosening
  the skill fraction.** Each makes the symptom go away and leaves the cause. If the physical
  limit is applied once, a class that still cannot finish has a different defect, and the
  completion test will say so.
- **Give every opponent speed factor a one-line statement of its single cause**, beside its
  definition. A factor that cannot say what it is for is the second copy of one that can.

## When not to use this

- **When the two factors are over different quantities.** A grip-derived corner limit and a
  separate caution on a straight that is about wetness underfoot, with its own table, are not a
  double count. The rule is one application per cause, not one multiplier per path.
- **For a deliberately handicapped opponent.** A tutorial rival may be slowed by a stated,
  separate handicap fraction. What is forbidden is an unstated one that arrives through a
  physical input.
- **As a licence to skip the playtest.** A passing completion matrix proves that the opponents
  finish; it does not prove they are fun to race. That claim needs a human and a controller.
