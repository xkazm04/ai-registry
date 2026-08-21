---
layer: technique
type: technique
subject: game-economy-tuning
technique: economy-philosophy-multipliers
status: forged
laws: [one-authority-per-quantity, law-and-check-share-one-source]
use_when: [expressing a design stance on scarcity or generosity, comparing two tuning philosophies, preventing a design intent from dissolving into scattered edits]
shared_with: []
---

# The design stance as a multiplier vector

The named concern: **where a game's economic philosophy lives.** Not what the
philosophy should be — that is a design argument — but in what form it is written down,
so that it can be stated, compared, reverted and argued about at all.

The failure this replaces is universal and looks like diligence. A team decides the
game should feel more generous. Over the following months, someone raises a drop rate,
someone lowers a repair cost, someone doubles a completion payout, someone widens a
loot table. Each edit is individually reasonable and individually reviewed. At the end
the stance exists nowhere: it is smeared across sixty numbers in a dozen tables, it
cannot be described in a sentence, it cannot be undone, and no one can answer "how
generous are we, compared to six months ago?"

## The shape

Keep every individual value at its neutral, first-principles setting — the amount the
system would use if the game had no stance at all. Then define the stance as a **short
vector of multipliers applied over whole classes of value**, resolved at the point the
economy is evaluated. For a resource economy the useful decomposition is three factors:

- **an acquisition factor**, multiplying every faucet's rate;
- **a consumption factor**, multiplying every sink's cost;
- **a reward-generosity factor**, multiplying drop or reward frequency.

Three named stances make the shape concrete. A loot-driven stance runs acquisition
above neutral, consumption below it, and reward generosity well above — roughly 1.2,
0.8 and 1.3. A scarcity stance inverts it — roughly 0.7, 1.3 and 0.6. A balanced stance
is exactly 1.0, 1.0, 1.0, and its existence matters: **the neutral stance must be
representable as a vector too**, or the neutral configuration becomes a special case
that lives in different code than the others and drifts away from them.

Those six numbers are a design document. They fit in a sentence, they diff cleanly, and
"ship the scarcity build instead" becomes a one-line change and a re-run.

## Procedure

1. **Recover the neutral values.** For every faucet and sink, ask what the value would
   be with no stance applied, and write that down as the base. This is the hard step
   when retrofitting, because the current numbers are already stance-contaminated;
   recovering neutrality is a series of design conversations, not a division.
2. **Name the stances the project actually wants to be able to ship** — usually two
   poles and a middle. More than about four is a sign the vector is being used to encode
   per-system tuning it should not carry.
3. **Choose the factor axes.** Each axis must correspond to a coherent design lever
   somebody can hold an opinion about. An axis that multiplies an arbitrary subset of
   values is not a philosophy, it is a patch with a nice name.
4. **Apply the vector at evaluation time, never by writing multiplied values back into
   the tables.** The instant a stance is baked into stored numbers, the neutral base is
   lost and you are back to archaeology.
5. **Make the active stance part of every economy report.** A net-flow verdict computed
   under an unnamed stance is not reproducible.
6. **Store the stance where the design canon states it**, so the vector that documents
   the philosophy and the vector the simulation applies are the same object.

## Decision rules

- **When a designer wants to change one number to change the feel, ask which axis they
  mean.** If the answer is an axis, move the axis. If it genuinely is one value that is
  wrong on its own merits, change the base value — and that is a different, smaller,
  reviewable claim.
- **When an axis needs an exception for one system, resist once, then record it as an
  exception with a reason.** The vector's value is its smallness; the second-worst
  outcome is a vector with twelve axes, and the worst is a hidden exception nobody wrote
  down.
- **When two stances produce the same simulated outcome, one of them is not a stance.**
  Either the axes do not reach the values that matter or the multipliers are too timid to
  express the difference the design is claiming.
- **When comparing stances, compare the same horizon and the same progression point.**
  A generosity difference that is dramatic at hour two and invisible at hour two hundred
  is a statement about early pacing, not about the economy.
- **One stance is authoritative at a time.** A per-region, per-mode or per-difficulty
  override that is also a stance vector produces two systems answering the same question
  about the same currency; make the override an explicit derivation of the one
  authoritative stance, or do not have it.

## Why it must be multipliers and not presets

The tempting alternative is whole preset tables — a generous table, a stingy table.
Presets fail for a specific reason: they multiply maintenance by the number of presets.
Every new faucet must be authored three times, the copies drift, and within two
releases the stingy table is missing systems the generous table has. A multiplier vector
over one set of base values keeps the maintenance at one and makes the stance a
*transformation* rather than a duplicate world.

## When not to use this

- **When the game has exactly one economy configuration and will never have another.**
  The vector still helps documentation, but the comparison benefit — its main payoff —
  is absent, and a mandatory 1.0 vector everywhere is ceremony.
- **For values that are not economic magnitudes.** Cooldowns, capacities and structural
  gates do not belong on an economic stance axis; scaling them there produces surprises
  in systems that never consented to the philosophy.
- **As a substitute for fixing a broken base value.** A stance multiplier applied to
  hide a faucet that is wrong by a factor of five distorts every other value on that
  axis to compensate, and the distortion is invisible until someone changes the stance.
