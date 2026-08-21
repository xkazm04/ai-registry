---
layer: technique
type: technique
subject: asset-class-poly-budgeting
technique: part-split-budget-division
status: forged
laws: [a-budget-shapes-the-output, one-authority-per-quantity]
use_when: [generating an asset as separate parts, a modular kit assembles into one shipped thing, the assembled result overruns while every part passed]
---

# Part-split budget division

## The concern

Generating a complex asset as several separate parts beats single-shot generation on
local quality: each part keeps sharp detail that a whole-subject generation smears, and
each can be re-rolled independently. The budgeting consequence is routinely missed.
Each part is commissioned at the flat per-part class limit, every part passes its own
check, and nothing ever sums them. Eight parts at eight thousand triangles is
sixty-four thousand against a forty-thousand character budget — a 60% overrun in which
no individual artifact is at fault.

The per-part limit's rationale usually *claims* it leaves headroom for the assembled
whole. That claim is what this technique replaces with arithmetic.

## Procedure

1. **Establish which class the assembled thing belongs to.** The budget that binds is
   the whole's, not the part's. A part is not a shipped asset; it is a component of one.
2. **Compute the naive total**: the per-part class limit multiplied by the part count.
3. **Compare it to the assembled budget.** If the naive total fits, keep the per-part
   limit — a three-part split does not need squeezing, and squeezing it would trigger
   the shaping problem in the other direction.
4. **If it does not fit, divide**: the assembled budget floored by the part count is
   the per-part limit, and every part is commissioned at that figure.
5. **Return the decision with a rationale sentence and a flag** saying whether the
   division actually bound. Downstream needs to distinguish "budgeted freely" from
   "budgeted under constraint", because a constrained split is a signal that the split
   may be too fine for the class.
6. **Refuse for a non-positive part count or an unknown class.** A budget that cannot
   be honoured is never invented.

## Decision rules

- **Divide equally by default; weight only with evidence.** An equal division is
  defensible without argument, and a weighted one (a head deserves more than a boot)
  needs measurements per part or it becomes a negotiation. When you do weight, weight
  by projected screen area at the reference camera distance, not by enthusiasm.
- **When the constrained per-part figure drops below the density a part needs to
  resolve at all, the split is wrong, not the budget.** Ten parts of a
  forty-thousand-triangle character is four thousand each, which is under the useful
  floor for a hand or a head. Merge parts or raise the class budget deliberately —
  do not quietly let the parts overrun.
- **Budget the joins.** Parts that overlap or interpenetrate carry hidden geometry that
  the assembled measurement pays for and the per-part review never notices. Where a
  finishing pass removes it, division against the pre-merge sum is conservative; where
  it does not, reserve a slice of the whole's budget for the overlap.
- **The assembled thing gets measured.** Per-part grading is necessary and not
  sufficient: measure the merged result against the whole's budget, because that is the
  artifact the runtime pays for.
- **One authority for the assembled budget.** The whole's class record owns it; the
  part budget is *derived* every time, never a second stored number that can drift.

## When not to use it

- **When the parts ship independently.** A modular kit whose pieces are placed
  separately in a level is not an assembled whole; each piece is a shipped asset and
  gets its own class budget. The test is whether one instance of the finished thing
  contains all the parts at once.
- **When parts are shared across many wholes.** A swap-slot piece reused across dozens
  of characters is budgeted for its worst-case host, not divided down for one of them,
  because its cost is amortised over instances rather than duplicated.
- **When the split is a generation strategy and the parts are merged and retopologised
  before anything ships.** Then the pre-merge counts are scratch, and the budget binds
  on the finished mesh — the division still helps as a guardrail against a generator
  spending wildly per part, but it is guidance rather than a gate.
