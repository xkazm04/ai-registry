---
layer: technique
type: technique
subject: video-assembly
technique: generated-shot-sourcing
status: forged
laws: [cost-per-usable-output, refusal-is-a-state, style-is-restated-not-remembered]
shared_with: []
use_when: [briefing a generative video model to produce shots for a cut, deciding between text-only and image-anchored conditioning for a shot, accepting or rejecting generated clips into an assembly, handling clips that arrive with their own baked-in audio]
---

# Generated-shot sourcing

Generated-shot sourcing is the craft of directing generative video models to
produce assembly material, and of accepting that material into the cut with
the same discipline as delivered footage. The models are real now — a cut
can be sourced shot by shot from generation — but a generated clip is not a
finished scene: it is a candidate that must clear the same bar as anything
else a block on the timeline claims to be. The technique's whole posture:
**generation is a sourcing channel, not an assembly shortcut.** Everything
downstream of acceptance — lanes, marks, spotting, drift — treats a
generated clip exactly like a shot one.

## The conditioning ladder

How much of the shot you pin down before asking is a decision, and it has
rungs, ordered by how much control they buy:

1. **Text only.** Cheapest to brief, least controlled. The model chooses
   composition, palette, motion, and identity. Acceptable for atmosphere and
   one-off illustrative shots; unacceptable wherever anything must match an
   adjacent shot.
2. **Single-image anchor.** A still conditions the first frame; the model
   invents the motion outward from it. Locks the head's composition and
   identity; the tail is still the model's guess, and identity degrades with
   distance from the anchor.
3. **Head-and-tail anchors.** Stills condition both the first and last
   frame; the model interpolates a motion path between them. The strongest
   structural defense against mid-clip identity drift, and the only rung
   that lets the *assembly* own where a shot ends — which matters, because
   the next shot's head can then anchor to this shot's tail.
4. **Reference-conditioned.** Identity and style references held across
   many requests, for recurring subjects. This is the style law applied to
   motion: references decay unless the full contract is restated per call.

Choose the lowest rung that satisfies the shot's contract. Every rung up
costs more preparation; every rung skipped is paid for later in rejected
takes.

## Clip caps are a structural constraint

Models emit seconds, not scenes — single-digit to low-double-digit seconds
per request, with multi-shot modes stitching a handful of connected shots at
best. A scene longer than the cap is a multi-request scene *by
construction*, and the seams between requests are edit points somebody must
choose. Choose them at brief time, on structural beats, with tail-to-head
anchoring across the seam — a seam left to land wherever the cap fell is a
cut nobody made. Budget duration the way spotting budgets cues: the brief
states the clip's length to the second, because the timeline slot it must
fill already exists.

## Baked-in audio is a mix decision a model made

Current models ship clips with native synchronized audio — dialogue,
effects, ambience. That sound is not free material; it is a mix decision
made outside the assembly, and the lane grammar does not bend for it.
Decide per clip, explicitly: keep it as an atmosphere lane, demote it under
the cut's own voice and music, or strip it. A generated clip's baked audio
never silently occupies the voice or music lane — the cut's narration and
score are authored against picture, not inherited from a generator's guess.

## Acceptance and economics

- **A refusal or a failed render is a sourcing outcome**, handled exactly as
  spotting handles a refused cue: the slot reverts to an honest empty state,
  labeled with what was asked and what came back — never blind-retried,
  never papered over by widening a neighbor.
- **Price per usable second, not per rendered second.** Acceptance rate is
  part of the price: a cheap model that clears the brief one take in five is
  the expensive model. Track takes-to-accept per shot class and route
  future shots on that number.
- **Provenance travels with the clip.** The prompt, the conditioning rung,
  the anchors, the model class, and the date are part of the accepted
  material. A generated block whose brief is lost cannot be re-briefed —
  only regenerated, which voids every review the clip has passed.

## Decision rules

- When two adjacent shots share a subject, condition the second on the
  first's tail, because unanchored adjacency is where identity drift
  becomes a visible continuity error.
- When a shot must land on a structural beat at an exact duration, brief
  the duration as a hard constraint and anchor the end, because trimming a
  generated clip to fit discards the tail the model composed toward.
- When a model's take is close but wrong in one region, prefer the smallest
  re-brief (same anchors, amended purpose sentence) over a fresh unanchored
  request, because every unanchored request re-rolls everything that was
  already right.
- When per-shot routing across several models beats one house model, take
  it — the cut cares that the shots match each other, not that they share a
  vendor; matching is the style contract's job, restated per call.

## When not to use this

Material that exists should be used, not imitated: a generated
reconstruction of a scene you could shoot or license competes on cost only
until the first viewer asks whether it is real — in factual work,
checkability routes that choice, and record-of-event shots are not
generation candidates. And a cut still in structural flux should not be
sourcing final generated shots at all; generate rough, cheap, low-rung
takes as placeholders, marked provisional, and spend the anchored requests
only once the picture is locked enough that their durations will survive.
