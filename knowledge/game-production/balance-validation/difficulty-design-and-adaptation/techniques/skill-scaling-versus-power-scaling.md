---
layer: technique
type: technique
subject: difficulty-design-and-adaptation
technique: skill-scaling-versus-power-scaling
status: forged
laws: [structural-proof-is-never-sufficient, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [adding a higher difficulty tier, an elite variant is only a bigger version of its base, deciding what a new difficulty level should change, an opponent has become unbeatably fast or accurate]
---

# Skill scaling versus power scaling

The named concern: choose deliberately between raising the opposition's *numbers* and
improving the opposition's *play*, knowing that the two buy different things, cost
different amounts, and have a defensible proportion between them — and knowing where the
second one stops being difficulty at all.

## What each purchase buys

**Power scaling** multiplies quantities: enemy health, enemy damage, spawn count, density,
respawn rate. It costs one coefficient. There is no new behaviour, no new telegraph to
read, no new failure mode, no new defect surface. It ships in an afternoon, which is
exactly why it is the common approach.

What it buys is **resistance**. The fight lasts longer and punishes harder. It asks the
player nothing they were not already being asked.

**Skill scaling** changes behaviour: a trait the opposition did not have, a mechanic that
changes what the player must do, better target selection, better use of cover and spacing,
a willingness to punish a specific mistake. It costs real content — authored behaviour,
its own bugs, its own readability burden, its own telegraphs.

What it buys is **engagement**. The player is asked a different question rather than the
same question louder.

The asymmetry that makes this a rule rather than a preference: a coefficient change is a
*structural* change to the encounter, and
[structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)
applies directly. That the numbers went up proves the numbers went up. Whether the
encounter now plays differently is a behavioural claim on a higher rung, and a difficulty
tier that has only ever been verified at the coefficient rung has not been verified as a
difficulty tier.

## Power scaling is legitimate, and sometimes mandatory

The rule is about proportion, never prohibition, and the prohibition reading is the way
this technique gets misapplied.

Whole genres require power scaling. Where progression *is* numbers going up, opposition
whose numbers do not go up leaves the loop with nothing to push against, and the player's
growth stops registering. In those games power scaling is the medium the design speaks in,
and a tier that fails to scale numbers is broken rather than principled.

Two further honest points in its favour. Enemy **count** is a power lever whose
second-order effect is sometimes a genuine change to the tactical question — crowd
control, positioning and area coverage matter at six enemies in a way they do not at two —
which is real, and is also why teams over-rate it and reach for it when the tactical change
they wanted needed authored behaviour. And power scaling is the only lever available at the
speed a live tuning pass sometimes needs.

The defect is narrower and easier to check than "too much power scaling": **a difficulty
tier whose entire change list is coefficients is a rename of the tier below it.** Its
characteristic product is the top setting where every enemy absorbs punishment and removes
the player in two hits. Nobody plays better there. They play slower and more cautiously,
and the encounter's dramatic shape flattens into something the duration instruments will
correctly report as spongy and punishing at the same time — a health problem and a damage
problem, created by one knob.

The corollary about basis: a scaling factor must state *which terms it scales*. "Plus
fifty percent" applied to an unnamed bundle of quantities is not a number, and the two
opposite duration failures cannot be told apart afterwards because nobody recorded which
of them the multiplier was capable of causing.

## The ceiling on the other side

Enemy skill has a limit past which it stops being difficulty and becomes a category change.

A machine can aim perfectly, react inside a single frame, track through cover, and issue
more commands per second than a human hand can produce. None of that is hard in the sense
players mean. Uncapped, it produces a game in which the demand is not *play better* but *be
a machine*, and the player's correct response is to stop.

The precedent worth carrying is from real-time strategy, where a competent computer
opponent is deliberately capped on actions per minute. The cap is not a concession or a
handicap; it is the statement that the contest is about decisions rather than throughput,
and without it the opponent wins by doing an unrelated thing very fast.

Generalised: **every enemy-skill lever carries a stated, human-plausible ceiling, written
down as a design decision.** Reaction latency, accuracy, tracking rate, decision frequency,
perfect-information awareness — each gets a bound derived from what a strong human can do,
not from what the implementation is capable of. A ceiling that is merely whatever the code
happens to produce is not a ceiling, and it will move the next time somebody optimises the
behaviour for an unrelated reason.

## Procedure

1. **Write the tier's change list** before implementing it, one line per change, each
   tagged as a number or a behaviour.
2. **Require at least one behaviour entry per tier above the baseline.** A list with none
   is a rename; either add one or merge the tier into its neighbour.
3. **Name what each coefficient scales**, with its basis, so a later reader can attribute a
   sponginess complaint or an unfairness complaint to the right half.
4. **Bound every skill lever** with a stated human-plausible ceiling and record where the
   bound came from.
5. **Verify at the behavioural rung.** Confirm the tier plays differently — different
   openings, different player responses, different beat structure — not merely that the
   numbers differ. Structural confirmation is the floor, never the verdict.
6. **Check the tier against the duration envelopes** its class already has. Power scaling
   is the most reliable way to breach both ends of an envelope at once.

## Decision rules

- When a tier's diff is entirely coefficients, that is the finding, whatever the playtest
  says. The playtest was run by people who already know the fight.
- When both levers are available and the budget allows one, take the behaviour change. It
  is the one that cannot be added later by a coefficient pass, and the coefficient pass can
  always be added later by anyone.
- When a genre mandates power scaling, scale power *and* add at least one behaviour per
  tier. These are not alternatives; the mandate constrains the floor, not the ceiling.
- When an opponent's competence comes from information the player does not have — seeing
  through cover, knowing an unrevealed position — classify it as neither power nor skill.
  It is an information asymmetry, and it reads to players as cheating regardless of how the
  win rate looks.
- When enemy count is the proposed lever, state which tactical question the extra bodies
  change. If the answer is "none, there is just more of it", it is a power change and
  should be priced as one.

## When not to use this

- **On the baseline tier.** The default difficulty is not scaled from anything; it is
  authored against the assumed skill level directly, and framing it as a scaling decision
  imports a reference point that does not exist.
- **Where behaviour cannot be made legible.** A smarter opponent whose new decisions the
  player cannot perceive is indistinguishable from random punishment and is worse than a
  coefficient. If the behaviour cannot be telegraphed or inferred, it is not ready to ship
  as difficulty.
- **As a retrofit to a system with no behaviour authoring at all.** Where the opposition
  has no decision layer to improve, the honest answers are to build one or to accept power
  scaling as the medium — not to fake skill with reaction-time and accuracy constants,
  which is the version players detect fastest.
