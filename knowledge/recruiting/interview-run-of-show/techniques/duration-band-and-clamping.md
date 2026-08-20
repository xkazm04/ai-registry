---
layer: technique
type: technique
subject: interview-run-of-show
technique: duration-band-and-clamping
status: forged
laws: [say-only-what-the-record-holds]
shared_with: []
use_when: [a generated interview plan comes out much shorter or longer than the slot, deciding what duration to promise a candidate, setting the rules a plan generator must obey]
---

# Duration band and clamping

A plan's total length must not be a free variable. Compute it however you like — sum the
blocks, scale by question count, take it from a template — and then **clamp it into a
documented band** with a stated floor and a stated ceiling. The band is a published part
of the round's design, not a defensive constant buried in whoever wrote the generator.

## Why a band rather than a fixed number

A fixed number forces every round to be padded or truncated to fit. A free variable lets
a thin brief produce an eighteen-minute plan and a rich one produce a seventy-minute
plan, both labelled with whatever the invitation happened to say. The band admits that
some variation is legitimate — a candidate with a dense record genuinely warrants more
probing — while refusing the variation that is really a defect.

Set the floor at the shortest conversation that can still be called an interview for this
round: enough for the fixed opening, at least the minimum question count at the
per-question floor, and the closing. Set the ceiling at the point past which candidate
and interviewer attention degrade and the marginal minute stops buying signal; for a
single conversational round that is usually somewhere around an hour, and a design that
wants more should be two rounds, which is round design's decision, not this one's.

## The procedure

1. Take the booked duration as the target.
2. Deduct the fixed opening and closing blocks.
3. Budget the remainder across the question blocks and the open block.
4. Sum the actual plan.
5. Clamp the sum into the band.
6. **If the clamp bound, say so, and say which way.** A clamp that fires is a signal,
   not a repair.

Step six is the one teams skip, and skipping it is what converts a safety rail into a
concealment. A clamped-up plan (the computed schedule was below the floor) means the
generator did not have enough material; a clamped-down plan means the design is asking
for more than the round can hold.

## Make the clamp a no-op you can assert

The strongest version of this contract is one where the clamp *never actually fires in
the downward direction*, because the other constraints already guarantee the ceiling: a
maximum question count, multiplied by the tightened per-question minutes, plus the fixed
blocks, is arithmetically below the ceiling. The clamp then exists only to pad a sparse
plan up to the floor, and its downward branch is a defensive no-op that documents the
contract rather than repairing a violation.

Aim for that, because a clamp that regularly fires downward is a clamp that is
routinely deleting content somebody planned, and nobody watching the output can tell
which content. Write the arithmetic out where the constants are defined — "six questions
at four minutes plus seven fixed is thirty-one, which is over, so the tighter value takes
over past five" — so that the next person to change a constant sees the bound they are
about to break.

The corollary is a build rule rather than a hiring one, and it is worth stating anyway:
keep the timing contract free of dependencies on the rest of the system, so it can be
exercised in isolation and its bounds asserted automatically. A duration band that is
only checked by someone reading a rendered plan is a band that holds until the first
busy week.

## Decision rules

- **When the computed plan is below the floor, do not stretch the blocks to fill the
  band.** Inflating per-question minutes to reach a number produces a plan whose blocks
  are longer than the material in them, and the interviewer improvises the difference.
  Either add material — which usually means fixing the brief the questions were
  generated from — or shorten the booking.
- **When the computed plan exceeds the ceiling, cut content, never compress the fixed
  blocks.** The opening and closing are outside the negotiable budget by construction.
- **The duration a candidate is promised is the truthful shorter of the plan and the
  booking, never the aspirational longer.** If the plan runs twenty-five minutes and the
  slot is forty-five, tell them twenty-five to thirty. Overrunning a short promise is a
  pleasant surprise; under-running a long one reads as dismissal, and it is the process
  that supplied the evidence for that reading. Say only what the plan holds, per
  [say-only-what-the-record-holds](../../_laws.md#say-only-what-the-record-holds).
- **The band belongs to the round type, not to the plan generator.** Different rounds
  legitimately have different bands. One global constant across a screening call and a
  final panel is a band that fits neither.
- **The promised duration must be computable without producing the plan.** Whatever
  surface quotes a length to a candidate — an invitation, a scheduling link, a
  confirmation — asks the question at a moment when the plan may not exist yet, and it
  must be able to answer without triggering generation. Two things go wrong when it
  cannot: the answer stalls behind work the candidate is waiting on, or it invents a
  number. The rule that resolves it: when no plan exists, quote the round type's floor —
  the shortest honest version — rather than a length the eventual plan may not fill.
- **A plan is never labelled with a duration it does not sum to.** If the header and the
  end of the last block disagree, the header is wrong. This is the check that catches a
  short conversation dressed up as a full interview, and it is worth running as an
  assertion rather than a review habit.

## What to record

Store the computed total, the clamped total, and whether the clamp bound, alongside the
plan. Two months later, "our screening plans clamp up two-thirds of the time" is the
finding that tells you the briefs feeding them are too thin — and that finding is
invisible if the clamp silently returns a tidy number.

## When not to use this

- **Genuinely open-ended conversations.** An exploratory first contact or a
  founder-to-candidate conversation is not a run of show and should not be clamped; it
  is also not producing comparable ratings.
- **Rounds whose length is externally fixed by the activity.** A timed work sample or a
  standardised assessment has its duration set by the instrument. Band the wrapper
  around it, not the instrument.
- **Panels where each assessor holds their own segment.** The band applies per segment,
  and the panel's total is the sum plus handoffs; clamping the total alone hides which
  assessor is over.
