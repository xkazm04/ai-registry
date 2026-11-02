---
layer: technique
type: technique
subject: contribution-reactive-visuals
technique: presets-with-consequence-lines
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [designing the settings a streamer uses to tune a reactive visual, a streamer who cannot tell what a setting will do on stream, writing the copy beside a tuning control]
---

# Presets with consequence lines

A reactive visual is tuned by a handful of numbers — the curve's control points, the
half-life, a weight per source — whose interaction no streamer can simulate in their head
minutes before going live. So the settings offer a few **presets** for each axis, and each
preset is labelled not by its numbers but by a **consequence line**: a short phrase, in the
streamer's own terms, saying what the stream will look like.

## What a consequence line says

The line answers what a streamer actually wants to know, about a night like theirs:

- **Does it light?** "Stays dark" on a quiet night is a finding, not a failure of copy.
- **How high, for how long?** "Peaks 74%, lit 12 minutes."
- **Does it pin?** "Sits at full blaze for 8 minutes" during a gift wave.
- **How long does it linger?** For the cooling axis: a flash that settles within minutes,
  a glow through a lull, a slow build that is hard to cool.

It never says "half-life 300 s, knee at 30". Raw numbers can sit behind an advanced fold for
the streamer who wants them, with the line updating live as they move, so even the expert
sees the effect of the knob rather than the knob.

## Compute the line by replaying a night

A consequence line is a claim about behaviour, so it is computed, by running a preset over
**representative generated nights** — a quiet sample night, a gift wave, a raid rush, a
steady trickle of subscriptions — through the same weighting, decay and curve the live
engine uses. Single shots ("one subscription lifts it a third") are useful in a test, but
they hide what matters on a real night: whether the curve pins through a wave or never
leaves the floor on a slow evening. A trace of a whole night shows both, and two nights side
by side ("Sample night: peaks 74% · Gift wave: full blaze for 8 min") show the range.

The replay must use the live rules, not a second implementation of them. When the settings
screen runs its own copy of the curve and decay — common, because it runs in a different
process or language — the copy and the engine drift, and the line describes a visual that
no longer exists. Either call the engine's own preview, or pin the copy to it with a parity
test over the same nights. A hand-written line drifts the first time someone edits a
preset and forgets the copy; where a line must be hand-written, say so in review and check
it against a replay.

## Offer the fix the trace earns

The replay also says when a curve is wrong for a night: pinned at full blaze for most of a
wave, never lit, or peaking well short of full. When it does, offer **one** point move —
push full blaze out, pull the lighting point in — and show the new trace beside the old one,
with a one-press way back. A single suggested move is a decision a streamer can make; a
curve editor is not.

## Choosing the presets

Three strengths cover most rooms — gentle, balanced, eager — plus "as it is" for a curve
the streamer already tuned. Name them by feeling, not by room size: a small room may want
eager. Three or four coolings cover the time axis. Each preset is checked against the
curve's properties and looked at on the real overlay, at rest and at full blaze, over a
real stream background before it ships.

## Decision rules

- **When adding a tuning control**, ship the consequence line with it, computed from the
  live rules.
- **When a preset's numbers change**, its line changes with them, because it is computed.
- **When the settings screen has its own model**, add a parity test against the engine over
  the same generated nights.
- **When the replay shows a pinned or dark night**, offer one point move and its trace.
- **When the line cannot be said simply**, the preset is too complicated; simplify the
  numbers, not the copy.

## When not to use it

A visual with one fixed behaviour has nothing to preset, though one consequence line on its
description still helps. A streamer-authored design that carries its own curve gets its line
computed from that curve, not a preset laid over it.
