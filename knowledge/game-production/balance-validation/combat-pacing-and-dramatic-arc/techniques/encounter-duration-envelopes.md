---
layer: technique
type: technique
subject: combat-pacing-and-dramatic-arc
technique: encounter-duration-envelopes
status: forged
laws: [a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [a fight feels spongy or ends before it starts, setting length targets per encounter class, separating a health problem from a damage problem]
---

# Encounter duration envelopes

The named concern: bound how long an encounter — and each side's survival inside it — is
allowed to take, at both ends, with the floor and the ceiling checked separately because they
have different causes and different fixes.

## Why two sides and four bounds

Duration fails in four distinct ways, and a single "time to kill" target catches at most one:

- **Enemy dies too fast.** Below a few seconds — three is a workable floor for a fight meant
  to be a fight — no arc fits. The curve has too few windows to contain a beat, and the
  encounter reads as decoration. Not always a defect: filler exists. It is a defect when the
  encounter was authored as a test.
- **Enemy dies too slowly.** Past a stated ceiling — around 45 seconds for a standard
  non-boss encounter — the fight is *spongy*. The distinctive complaint is not "too hard" but
  "my hits do not matter", and it is produced by health, not by damage. A related structural
  signal catches it before the timer does: an enemy carrying several multiples of the player's
  effective health — five times is a reasonable alarm — will be tedious even if the numbers
  say the fight is winnable.
- **Player dies too fast.** Below a stated floor — around five seconds — a death is
  *punishing* rather than hard: the player could not observe the cause, so the death teaches
  nothing and the retry is uninformed. This is a damage problem, fixed on the incoming side.
  A death later in the fight is a different, milder statement — survival is not guaranteed —
  and the two should not share a severity. Same condition, two thresholds, two voices.
- **Player survives indefinitely.** No failure pressure at all; the threat term never rises and
  the encounter has no stakes. This usually surfaces as flat pacing first.

Spongy and punishing are frequently confused because both are called "the fight feels bad".
They are opposite fixes — reduce enemy health versus reduce enemy damage — and a tuning pass
that treats them as one difficulty knob makes one of them worse every time.

## Procedure

1. **State envelopes per encounter class**, not per encounter and not globally. Filler,
   standard, elite and boss want different floors and ceilings; a boss ceiling that a corridor
   fight is measured against produces noise.
2. **Express the bound with its unit and its basis.** Seconds of engaged combat time, measured
   from first contact to resolution, excluding traversal — an envelope measured against a
   different clock than the one the designer imagines is worse than no envelope.
3. **Check the structural proxy alongside the timer.** Relative effective-health ratio between
   the sides catches spongy encounters at authoring time, before anyone runs a trial.
4. **Bucket the encounter and read both tails of the bucket distribution.** A fight can sit
   inside its duration bound and still be misshapen. Cut it into small fixed buckets — a couple
   of seconds each — and sum incoming damage per bucket. An **empty** bucket is dead time, the
   padding a total-time check cannot see, and it hands the beat taxonomy its dead-zone
   candidates. An **over-full** bucket is the opposite defect: incoming damage in a single
   bucket exceeding a large fraction of the player's effective health — around forty percent —
   is a burst spike, and it is worth reporting at the highest severity you have, because it is
   the mechanism behind most deaths that feel unfair. Express it as a percentage of health, not
   as a raw damage figure; the raw figure means nothing without the health it is measured
   against.
5. **Report the measured value, the bound, and which side of it you are on**, in the same line.

## Decision rules

- When an encounter breaches the ceiling, look at effective health before damage. When it
  breaches the floor, look at damage before health. Reversing this is the single most common
  wasted tuning pass.
- When an encounter is inside every bound but contains long runs of empty buckets, the finding
  is padding, not length. The fix is content — an added phase, a mechanic, an add wave — not a
  number.
- When simulated duration and observed duration disagree, the simulation is missing a cost:
  repositioning, animation lock, resource downtime. Trust the observed clock and instrument
  the gap rather than adjusting the envelope to fit.
- When a class's envelope is repeatedly breached across many encounters, the envelope is
  probably wrong for that class. One breach is a fight to fix; a pattern is a target to revise.

## When not to use this

- **Encounters with player-controlled pacing** — a stealth section, an optional arena the
  player enters and leaves — where duration is a player choice rather than a tuning outcome.
  Measure engaged time only, or skip the check.
- **Encounters where length is the mechanic**, such as a survival wave scored by how long the
  player lasts. There the ceiling is the point; keep the floor and drop the ceiling.
- **As an acceptance gate on its own.** Every bound here can be satisfied by a perfectly
  flat fight of exactly the right length. Duration is a necessary check and never a sufficient
  one.
