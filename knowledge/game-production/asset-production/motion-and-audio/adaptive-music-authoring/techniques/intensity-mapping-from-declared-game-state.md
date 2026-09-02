---
layer: technique
type: technique
subject: adaptive-music-authoring
technique: intensity-mapping-from-declared-game-state
status: forged
laws: [an-instrument-proves-it-had-input, unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [the score flips tier every few seconds, deciding what drives musical intensity, a composer cannot see or test what drives their own score]
---

# Intensity mapping from declared game state

## The concern

Somewhere a function turns game state into musical state. In most projects that function
is a handful of conditionals inside gameplay code, written by whoever integrated the
music, and three things follow immediately: the composer cannot see what drives their own
score, the designer cannot change it without a programmer, and nobody can test it without
playing the game and listening.

The mapping is an artifact. It is authored, reviewed, versioned and tested like any other,
and it is tested without playing a note.

## The shape of the artifact

**Inputs are named signals, each with its unit and its range.** Enemies alive, as a count.
Health, as a fraction of maximum. Distance to the objective, in world units. Time elapsed
in the encounter, in seconds. Boss phase, as an ordinal. A raw count and a fraction cannot
be combined without a declared normalization, and a mapping that adds them anyway has an
implicit scaling nobody wrote down
([a-number-carries-its-unit-and-basis](../../../../_laws.md#a-number-carries-its-unit-and-basis)).
Normalize each input to a stated range at the edge of the mapping, where the conversion is
visible, rather than inside the expression where it is not.

**The output is a small ordinal set of tiers — three to five.** Not a continuous number.
Layers are discrete, so a continuous knob has to be quantized somewhere, and quantizing it
per frame is what produces gain jitter. Where a continuous value genuinely is wanted — a
gradual swell driven by proximity — it drives a slew-limited envelope, and the slew limit
is part of the declaration.

**Thresholds are written where a person reads them**, next to the tier they promote to,
not distributed through code.

## Hysteresis, or the mapping thrashes

A mapping with a single threshold per tier oscillates at that threshold, and oscillation
is the artifact. One enemy dies and another spawns across the boundary; the score changes
tier twice in four seconds; the player does not hear adaptation, they hear the system.

Three parts, all three required:

- **Separate rise and fall thresholds.** The fall threshold sits meaningfully below the
  rise threshold — on the order of **15 to 25 percent** of the input's range below it. Too
  small a gap and the oscillation returns; too large and the score stays hot long after the
  fight ended.
- **A minimum dwell, measured in bars.** Once a tier is entered it holds for at least a
  full musical phrase — four or eight bars, depending on the material — before any change
  is considered. Bars, not seconds, because the exit can only happen on a musical boundary
  anyway and a dwell expressed in seconds will straddle one.
- **Asymmetric slew.** Intensity rises fast and falls slowly. This is dramatically correct
  as well as technically necessary: threat arrives suddenly, relief is earned. A symmetric
  mapping makes every skirmish sound like it ended the moment the last enemy fell, which is
  the opposite of how the moment feels.

A fourth part is worth adding wherever the game has an explicit notion of an encounter:
**hold the tier for the encounter's duration and release on its end event**, rather than
letting a continuous signal drift the score down mid-fight because the player found cover.

## The top tier also needs a ceiling

The dwell floor stops thrash. The dwell *ceiling* stops fatigue, and it is the half almost
every mapping omits. The most intense material in a score is the least tolerable to
repeat: a climax layer is dense, loud and harmonically unresolved by design, and after
half a minute of it the player stops hearing intensity and starts hearing noise. A fight
that runs long — because the player is struggling, which is exactly when the score matters
most — will sit at the top tier indefinitely unless something says otherwise.

So the top tier carries a **maximum dwell** as well as a minimum: after a stated ceiling on
the order of **thirty seconds**, the mapping steps down one tier regardless of input, and
may re-enter only after a stated recovery. This is a deliberate divergence between the game
state and the musical state, and it is correct — the mapping's job is to make the music
serve the moment, not to be a faithful readout of a variable. Write the divergence down
where a designer will read it, because to anyone reading a log it looks like a bug.

## Testing it without audio

This is the technique's best property and the reason it belongs outside gameplay code.
Replay a recorded state trace through the mapping — a real trace from real play, or a
scripted one — and plot the tier over time. From that plot, three measurements:

- **Changes per minute.** More than roughly **one tier change per eight bars** over a
  representative encounter is thrash, not adaptation. Count it rather than judging it.
- **Dwell distribution.** Any dwell shorter than the declared floor is a bug in the
  implementation, not in the tuning.
- **Tier coverage.** Which tiers the trace actually entered.

That last one is a guard, not a statistic. A mapping test run over a trace in which combat
never started proves nothing about a combat mapping, and it returns exactly the same clean
result as a test that exercised everything
([an-instrument-proves-it-had-input](../../../../_laws.md#an-instrument-proves-it-had-input)).
So the report states the trace's length and the tiers it reached, an empty or single-tier
trace is a loud failure rather than a quiet pass, and a tier the trace never entered renders
as *not measured* rather than as passing
([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).

## Failure modes

- **The mapping in gameplay code.** Invisible to the two disciplines that need to change
  it. The tell is that tuning the score requires a build.
- **The single threshold.** Oscillation at the boundary, every time, on the exact input the
  designer picked because it was easiest to read.
- **Dwell in seconds.** The tier changes mid-phrase and the transition machinery either
  waits — silently violating the dwell — or cuts.
- **The unreachable tier.** A top tier whose threshold no real encounter produces. It is
  composed, mixed, shipped and never heard, and a coverage measurement is what finds it.
- **Too many tiers.** Seven tiers over a four-layer set means several tiers are
  indistinguishable, and a change the listener cannot hear is a cost with no benefit.
  Collapse any two adjacent tiers whose arrangements differ by less than one layer.

## When not to use this

- **When intensity is authored on a timeline.** A linear set piece, a scripted sequence, a
  cutscene: the composer has written the arc against picture, and deriving it from state
  produces music that fights the scene. Drive those from the timeline and say so in the
  declaration, so nobody later "fixes" them by wiring them to state.
- **When the game has no continuously varying state to map.** A puzzle game whose only
  musical states are menu, playing and solved needs three cues and a transition matrix, not
  a mapping with thresholds.
