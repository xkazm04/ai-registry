---
layer: technique
type: technique
subject: motion
technique: direction-from-the-cause
status: forged
laws: []
shared_with: []
applied: experiment
ab_verdict: better
use_when: [a carousel pager or stepper slides content left or right, the direction of a transition is computed from the previous and next index, a list that wraps around animates the wrong way at its ends, deciding where a slide transition learns which way to travel]
---

# Direction from the cause

A sliding transition has to know which way to travel, and the nearest thing to
hand is the state: compare the index before with the index after and take the
sign. That works for as long as the state is a position on a line. It stops
working the moment two different gestures can produce the same pair of states,
because the direction was a fact about the gesture and the comparison only sees
what the gesture left behind.

Stepping forward to slide three and stepping backward to slide three both set
the index to three. On a list that wraps, the last slide's *next* lands on slide
zero, and the sign of that change says *backward*.

## The rule

**Record the direction where the update is caused, and carry it with the update.
Never reconstruct it from the states on either side.**

The handler for *next* knows it means forward. The handler for *previous* knows
it means backward. A jump to a dot knows where that dot sits on the rail. Each
writes its direction beside the index in one update, so the two cannot disagree
and a later render has nothing to infer.

## The repair that looks sufficient and is not

The first fix a reviewer proposes keeps the comparison and makes it circular:
take the shorter way around the ring. It fixes the wrap on a long list and moves
the error elsewhere. Replayed exhaustively over lists of two to six items with
next, previous and direct jumps, the plain comparison was right on 100 of 110
steps and wrong on all 10 that wrapped. The circular one was right on 86 of 110:
it answered the wrap and then broke direct jumps, sending a jump from the first
item to the last the short way round, against the order the rail shows. A
two-item list has no shorter way at all.

The limit is structural. In that replay 10 of 70 distinct (from, to, length)
triples were reached by causes with opposite truths, so any function of the
states alone is wrong on at least one of them, however clever it is.

## Where the comparison stays right

A rail that clamps at its ends and cannot wrap is a line, and on a line the sign
of the change is the direction: the same replay over clamped rails scored 100 of
100 for the comparison. Two cases legitimately keep it:

- **A linear wizard or stepper**, with no wrap and no second route between two
  steps.
- **A value whose order is its meaning**, such as a counter rolling up or down.
  The number going up is the cause.

The same holds for an update nothing gestured at, such as a record moving a
linear flow to its next stage. There is no gesture to carry a direction, and on
a line the order answers it. The moment that flow can wrap, it needs an explicit
direction from whatever moved it, or no slide at all.

## A change with no direction gets none

Carrying the direction means a change can also arrive without one: a restored
session, a deep link, a rollback after a failed write. Do not reuse whichever
direction the last gesture left in state. The value is stale by then and reads
as a confident claim about a gesture that never happened. Give those updates an
explicit no-direction value and have the transition fade or cut.

## Decision rules

- Write direction beside the index, in the same update, at the handler that
  knows the gesture.
- Keep a before/after comparison only on a rail that cannot wrap and has one
  route between any two positions.
- Do not repair a wrapping comparison with shortest-path arithmetic. It trades
  the wrap error for a jump error.
- Treat an update with no gesture as having no direction, unless the rail is
  linear.
- When a list gains wrap-around, re-open every direction derived from its
  index: the change that adds the modulus is the change that breaks them.

## When not to use it

A surface that cross-fades has no direction to get wrong. A rail with a single
linear order and no wrap needs nothing beyond the comparison, and carrying a
direction there is state with no reader.
