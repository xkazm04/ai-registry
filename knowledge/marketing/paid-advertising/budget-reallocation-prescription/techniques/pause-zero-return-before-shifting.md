---
layer: technique
type: technique
subject: budget-reallocation-prescription
technique: pause-zero-return-before-shifting
status: forged
laws: [efficiency-is-not-profitability, a-gate-before-money-and-copy]
shared_with: []
use_when: [a campaign has spent and converted nothing, ordering the moves inside a prescription, deciding whether a burner should donate or stop]
---

# Pause zero-return spend before shifting any

A campaign with cost above the noise floor and no conversions is not a donor. A
donor gives part of its spend to somewhere better; a burner has nothing worth
keeping, so the only honest move is to stop it. This technique makes that a
distinct move kind, ranks it first, and keeps it out of the shift arithmetic.

## Why a separate kind

Treating a burner as a donor produces three wrong things. It shifts a fraction of
the burner's spend and leaves the rest burning. It consumes a recipient that a real
donor needed. And it projects a value gain from re-pointing money that was buying
nothing - a gain that is arithmetically the recipient's full ratio on the amount,
which looks spectacular and is a fabrication about the donor side.

A pause has no recipient, no re-pointing and no extrapolation risk. Its projection
is the removal of the donor's spend from the portfolio and of whatever that spend
was buying, which for a burner is zero. Its value gain is therefore zero - the
saved spend is the gain, and the amount already carries it - and under a margin its
profit gain is the full amount, because profit on that spend was minus the spend.

## Procedure

1. **Admit** burners explicitly. The default recommender treats a zero ratio as
   out of scope so that a downstream apply path expecting only shifts is never
   handed a pause it cannot execute; the surfaces that can execute a pause opt in.
2. **Rank** them with the same waste metric as every donor: cost times one minus
   zero, the full cost. They out-rank every partial donor without a special case.
3. **Emit** a pause move with the donor's full period spend as its amount, both
   ratios at zero, no recipient, value gain zero, profit gain equal to the amount
   when a margin is present.
4. **Do not consume a recipient**, and do not count the pause against the
   projection's confidence - it re-points nothing.
5. **Continue** to the shifts only after every admitted pause is in the list, so
   no shift is computed against a recipient set that includes a burner.

## Decision rules

- When cost is at or above the noise floor and the unrounded conversion count is
  zero, recommend a pause, not a shift, because a fraction of nothing is still
  nothing and the remainder keeps burning.
- When a burner is inside the noise floor, do nothing yet, because the floor exists
  to keep a two-day-old campaign from being paused on its first hundred units of
  spend; that floor is a convention and is labelled as one.
- When the account cannot honestly say the count is zero - a tracking gap, a
  conversion action that reports late, a platform that never returned the column -
  the finding is "not measured", not "no return", and a pause on it is wrong. The
  triage neighbour's tracking-gap rung fires first for a reason.
- When a burner is a prospecting campaign judged by last click, do not pause it on
  this evidence alone, because the zero is an attribution artefact.

## The pause in the gate

A pause is the move most likely to be over-applied by an automation, because it
looks safe: no money moves. It is not safe. A paused campaign loses its bid
history, its learning, and any impression share it held, and a paused-then-resumed
campaign re-learns from cold. So the pause goes through the same gate as a shift -
simulate, guardrail, approve, ledger - and the prior serving state is snapshotted so
a revert resumes exactly what was paused and nothing else. The per-move amount cap
reads a pause's amount as its period spend, so a large burner breaches the cap and
requires the override like any large shift.

## When NOT to use

- When the ratio is small but non-zero: that campaign is a donor, and the shift
  path handles it. A pause on a low-but-positive return throws away the returning
  part.
- When the zero comes from sample data, a degraded sync, or a period shorter than
  the conversion lag, because the count is absent rather than zero.
- When the campaign's budget is shared with other campaigns through one budget
  object: pausing it is fine, but shifting *from* it is not, and a mixed
  prescription must know the difference.
