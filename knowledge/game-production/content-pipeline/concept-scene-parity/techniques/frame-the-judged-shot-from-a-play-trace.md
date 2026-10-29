---
layer: technique
type: technique
subject: concept-scene-parity
technique: frame-the-judged-shot-from-a-play-trace
status: forged
laws: [unmeasured-is-not-a-pass, grade-against-what-ships-not-on-a-curve]
shared_with: []
use_when: [a look is judged from one hand-placed shot, the shot copies the concept's framing rather than play, a character's distance or motion in the judged frame was chosen by the builders, a technique that fails up close is being scored at a distance, deciding whether a flat or impostor character will hold up]
---

# Frame the judged shot from a play trace

The named concern: the frame a look is judged on is chosen by people, usually to match the
concept's composition. Play chooses differently. If the judged frame puts a character farther away,
stiller or more front-on than play does, every score is taken under conditions that flatter the
techniques that fail up close or in motion. Billboards, impostors, low-resolution sprites and
painted cards are the usual beneficiaries. The fix is to measure where play actually puts things
before deciding where to judge them.

## The trace

Replay or simulate a representative session. Use the real AI and the real rules, not a staged
scene, and record per tick:

- the distance from the player's eye to each character and each salient effect;
- each character's speed, split into motion across the line of sight and along it;
- the character's facing relative to the player;
- which animation state or clip is active, including states that outrank locomotion (casting,
  being hit) while the character moves.

Summarise the trace as distributions: median and interquartile distance, the share of time moving,
the share of moving time spent in non-locomotion states, and facing spread.

## The procedure

1. **Run the trace before the first look round,** and again when the rules change spacing or
   pacing.
2. **Judge at the trace's distances.** Add one shot at the median distance and one at the near
   quartile next to the concept's shot. Keep the concept's shot for parity, but do not let it decide
   alone.
3. **Judge the motion the trace shows.** If characters move most of the time, include a short
   capture of a moving character, and record whether the technique can show movement at all, or
   whether the figure slides.
4. **Feed the trace into the technique choice.** A flat or card character that holds at the spawn
   distance and in an idle pose may read as cardboard at the median distance in stereo, and slide
   through most of play.

## What the trace changed

In one project, the opponent was judged for many rounds at 16 m, the distance of the concept
frame and of the opponent's spawn. A late replay trace showed:
- the opponent fought at 3.5 to 8 m, median 6.9 m;
- it moved 81 % of the time;
- 93 % of its moving time was spent in casting or hit states that outranked the walk clip, so a
  sprite route would slide through most of the fight.

The route had been chosen and polished on a frame that flattered it. The trace took about an hour.

## Decision rules

- **When the judged shot's distance is outside the trace's interquartile range, add a shot that is
  inside it.** The score at the concept framing alone is not the score of the game.
- **When a character moves most of the time, judge it moving.** A still of it is not evidence about
  it.
- **When the state mix shows locomotion is outranked while moving,** cost the moving variants of the
  outranking states before choosing a character route.

## When not to use this

- **For fixed-camera or menu scenes,** where play has one framing.
- **When the concept itself is the deliverable** (key art, a trailer frame). Then the concept's
  framing is the requirement.
