---
layer: technique
type: technique
subject: hand-tracked-timing-windows
technique: tracking-loss-as-a-game-state
status: draft
laws: [every-effect-on-the-rules-is-visible, an-instrument-proves-it-had-input]
shared_with: []
use_when: [the hands leave the sensor's view mid-action, a held defence persists after tracking is lost, deciding what the simulation receives while the hands are unseen]
---

# Tracking loss as a game state

The named concern: a tracked hand is not always tracked. It leaves the sensor's view, it is
hidden behind the other hand, or its confidence drops below any usable floor. These are
not errors to log and ignore. They happen many times per session, and each time the game
has to decide what the simulation believes the hand is doing and what the player is shown.

The general rule that a lost input releases what it held belongs to
[neutralise on every loss path](../../../couch-and-tv/phone-controller-input-protocol/techniques/neutralise-on-every-loss-path.md).
This technique adds only what is particular to a tracked sensor: its loss modes, a bounded
coast across short gaps, the re-acquisition hazard, and how the loss is shown.

## The sensor's loss modes

- **Out of view**: the hand has left the sensor's field. It usually happens at the edges,
  during wide swings, or when the player looks away from their hands.
- **Occluded**: one hand covers the other, or a held object covers the hand.
- **Low confidence**: the hand is reported, but below the floor that any decision uses.
- **Runtime-level loss**: the tracking system pauses or hands control to another input
  mode, for example when a controller is picked up.

List them per platform, because the runtime's own states differ, and map each to one of
the game's states below.

## The game's states

1. **Tracked**: samples are above the floor and decisions proceed.
2. **Coasting**: a gap shorter than the **coast bound**. The simulation keeps the last
   trusted state, a held ward stays up, and no new verdict may be earned from data inside
   the gap. Coasting bridges the flicker that fast motion causes without punishing it.
3. **Lost**: the gap has exceeded the coast bound. Everything the hand held is neutralised
   (wards drop, holds release, strokes in progress abort), and the simulation receives a
   neutral hand. In a single-player game the lost state may instead pause the simulation, so
   the player takes no hits while they cannot act. That choice is written into the design,
   and it is subject to the same coast bound so that flicker does not pause the game.
4. **Re-acquiring**: tracking has returned. For a short settle interval, samples are shown
   but not trusted for motion. Release checks, onset searches and velocity-based recognizers
   ignore them.

The coast bound, the settle interval and the confidence floor are thresholds in the canon.

## Why re-acquisition needs its own state

A hand that comes back at a new position appears to have travelled the whole distance in
one sample. Its apparent speed is enormous. Any recognizer that reads speed will fire on it:
a swipe, a thrust, a block onset. Recognition and onset recovery must never span a gap, and
the first samples after one are marked untrusted until the settle interval passes.

The same holds for a pose. A hand that enters tracking already in the defensive pose, whether
at the start of a session or after a loss, was never seen making the motion. It is not a fresh
action, and it earns no timing reward until it has been seen released and raised again. A
freshness rule that treats "never seen lowered" as "fresh" hands a perfect to a hand that sat
in the pose while the sensor was blind.

## Showing the loss

The player cannot fix what they cannot see. In every state other than tracked, the hand's
rendering says so: frozen in its last pose while coasting, faded or coloured when lost.
Where the cause is known, say it in words near the hand, for example that the hands are out
of view or crossed. A defence that drops because tracking was lost must look different from
a defence that failed, or the player learns the wrong lesson about their timing.

## Procedure

1. Map every runtime loss signal to a game state, and test each one by provoking it: hands
   behind the back, hands crossed, a fast swing to the edge.
2. Implement coasting with an explicit bound and log each gap's length. The distribution
   of gap lengths sets the bound. Choose a bound that bridges most fast-motion flicker and
   is shorter than any window, so a gap cannot carry a defence through a whole attack.
3. Neutralise through the same path every other loss uses.
4. Count verdicts that were awarded during coasting or re-acquisition. The count must be zero.

## Decision rules

- **When a ward stays up with the hands in the lap, the coast bound is missing or too long.**
- **When blocks fail at the edge of view, distinguish loss from timing in the logs before
  touching the window.**
- **When the player keeps losing tracking in one motion, change the motion before
  tuning the bound.** The defensive pose should be one the sensor can see.
- **When the runtime offers prediction across short gaps, treat predicted samples as
  coasting**, shown but not eligible for verdicts.

## When not to use it

- **For inputs with a physical hold**, such as a controller trigger. The hardware reports
  release reliably, and loss is a disconnection handled by the general rule.
