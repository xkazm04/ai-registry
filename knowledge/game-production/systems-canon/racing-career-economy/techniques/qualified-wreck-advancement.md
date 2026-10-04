---
layer: technique
type: technique
subject: racing-career-economy
technique: qualified-wreck-advancement
status: forged
laws: [a-number-carries-its-unit-and-basis, structural-proof-is-never-sufficient]
shared_with: []
use_when: [a combat racing career lets a wrecked or eliminated player still earn a result, a bounty is paid for wrecking opponents, deciding what counts as career progress when the player's car did not finish]
---

# A wreck-out advances the career only if the car was racing

The named concern: **when a result in which the player's own car was destroyed or eliminated
counts as career progress, and how the bounty for destroying others is bounded.** Two
different wreck events live in a combat racing career and they need two different rules.

## The two rules

- **A progress rule, about the player's own car.** A race can end for the player by wreck or
  elimination and still produce a finishing position, and a career that pays and advances on
  position alone lets a player clear a round by being destroyed at the start line. So a result
  advances the career only if the car is **qualified**: it completed at least one lap, or it
  was wrecked or eliminated after covering a stated minimum fraction of the course. An
  unqualified result is refused progress with a message that says what to do ("complete a lap
  or make progress before a wreck"), not with silence.
- **An economy rule, about opponents.** The bounty for each destroyed opponent is a data value,
  and the number of wrecks that pay per race is capped. The cap bounds the faucet; it says
  nothing about progress.

The two are separate on purpose. The progress rule answers *was this a race the player took
part in*. The economy rule answers *how much can one race pay out for violence*. A combined
rule is tuned for one and silently fails the other.

## Money and progress are different guarantees

A career that has a no-dead-end money guarantee still needs a progress gate, and the gate must
not take the money back. The result of a wreck-out that was not qualified still settles its
payout through the ticket — the participation floor and the repair cap still apply — and only
the progress does not advance. The player who is wrecked at once is paid, repaired and invited
to try again, not stranded and not promoted. A qualified wreck-out advances and pays, so a
player can lose a race and still move on, which is the point of keeping losing survivable.

## Why a share of the course

The minimum is a **fraction of the course length**, not a time and not a position. Time depends
on how fast the car is; position depends on the field; a fraction does not. It is cheap to state
and cheap to test, and it removes the degenerate case without punishing a mid-race wreck.

## Procedure

1. Define the minimum fraction in data, with the course length as its basis.
2. Evaluate qualification once, from the car's own state, at the end of the race, and pass the
   boolean into the settlement — settlement does not recompute it.
3. Order the writes under one ticket check: refuse a stale ticket before either progress or
   money moves.
4. Cap paid opponent wrecks per race in data and write both counts on the receipt.
5. Test with a scripted car that is destroyed at the start (no progress, money still settles),
   one destroyed after the minimum (progress and money), and one that never moves.

## Decision rules

- **When the result is unqualified, pay it and refuse the progress.** Taking the money back
  breaks the floor; granting the progress breaks the gate.
- **When the bounty cap binds in most races, the bounty is the prize.** Reduce the bounty or the
  cap.
- **When a wreck costs the wrecker repair, price both in one settlement.** A wreck-heavy race
  nets through the repair cap like any other.
- **When the player can destroy themselves, never pay a bounty for it.** Credit only an inflicted
  wreck.
- **When the minimum is raised, re-check the earliest rounds.** A new player who is wrecked
  early often cannot reach it, and the gate becomes the dead end.

## Evidence grade

Both rules are exact and testable with scripted cars. Whether the minimum fraction is the right
number for human play is not measured; it is set against a simulated driver.

## When not to use this

- **In a race with no destruction.** There is no wreck to qualify.
- **In a pure arena or demolition mode.** Every car is racing from the first frame; the bounty
  cap alone remains.
