---
layer: technique
type: technique
subject: music-video-production
technique: coverage-across-the-phrase
status: forged
laws: [cost-per-usable-output]
shared_with: []
use_when: [planning how many angles a phrase needs, a generator was asked to cut between its own angles, the edit has no in-sync alternative at the cut point it wants, deciding whether chorus footage can serve every chorus]
---

# Coverage across the phrase

A live music video is shot in passes. Each camera setup — the wide, the close-up,
the low angle, the moving shot — records the performer against playback of the
whole song, or at least of whole sections. In the edit every take is in sync with
every other take, because every one of them ran against the same clock, and the
editor can cut from any setup to any other at any bar without a sync problem. The
cut points are chosen in the edit, from the music, after the material exists.

Generated production keeps that property only if it is built in on purpose:

> **Generate each phrase from several setups under the same conditioning slice, so
> any cut point between them is already in sync, and take the cut points from the
> track map, not from the generator.**

## What coverage means here

- **The unit is the phrase.** A setup covers the whole phrase — from the seam
  before it to the seam after it, with the segment plan's handles — not the two
  bars the planner expects to use. The value of coverage is that the cut is free to
  move; a setup that only covers the moment someone predicted forecloses the
  choice the edit exists to make.
- **Every setup gets the same slice.** Same master in-point, same conditioning
  audio, same handles. That is what makes setups interchangeable at a cut. A setup generated
  against a slice shifted by half a beat is not coverage; it is a different take
  that will have to be slid into place, and sliding is where sync is lost.
- **Setups differ in what the camera does, not in what the performer sings.** The
  angle vocabulary — what a low angle or an orbit means — belongs to
  cinematic-language; this technique only requires that each setup be a deliberate
  choice from it and that the setups for a phrase be different enough to cut
  between.

## The generator's own cuts are scouting

A video generator can be asked to cut between angles inside one clip — "a new
angle every second" — and the result can be striking. It is also on the
generator's clock: the model places its cuts where it chooses, not on the track's
bars, and the cuts arrive already made, inside a clip the assembly cannot re-cut.
The generated-shot-sourcing technique in video-assembly already owns that
mechanism: a clip with internal cuts is an angle library, cheap to make and useful
as a probe, and a cut inside a clip is one the assembly does not own.

For a music video the consequence is specific. **Treat a multi-cut generation as a
scouting pass, not as coverage.** Find the angles worth keeping in it, then
generate each of those as a setup across the phrase under the phrase's slice. Use a
multi-cut clip in the cut directly only where its internal cuts happen to land on
the grid closely enough to pass the cut-rate section's tolerance — and check, do
not assume, because the model was never told where the bars were.

## Budgeting setups

Coverage multiplies cost. Three setups on every phrase of a four-minute song is
three times the generation, and a sung shot must clear the mouth as well as the
picture, so its acceptance rate can only be at or below that of the same shot
without a mouth. Price it per
usable second, and spend it where the cut needs it:

- **Choruses first.** The chorus recurs, carries the hook and is usually cut
  fastest, so it needs the most setups.
- **Repeated sections can share coverage, if the audio really repeats.** Footage
  generated for one chorus can serve another only where the two are the same
  audio: the same lyric, the same arrangement, the same performer's stem. Compare
  the stems before reusing; an ad-lib added in the last chorus or a key change is
  enough to make the reused mouth wrong. Where they match, one well-covered chorus
  is cheaper than three thinly-covered ones, and reuse across repeats is a
  long-standing practice of the form.
- **Verses can be thinner.** A verse carrying story needs coverage of the story's
  shots, not of a performance, and a narrative shot with no mouth is not tied to
  the slice at all.

## Decision rules

- When a phrase will be cut across, generate at least two setups for it under the
  identical slice; when it will hold on one shot, one setup is enough.
- When a cut point is chosen, take it from the track map — a bar, a downbeat, a
  phrase boundary — not from where a clip happened to change.
- When a generator offers internal cuts, use the clip to choose angles, then
  regenerate the chosen angles as setups across the phrase.
- When reusing coverage between repeated sections, compare the owned stems over
  both intervals first; reuse only where they match.
- When the budget forces a choice, cover the hook before the verses.

## When not to use it

A one-take video — a single continuous shot through the song — has no coverage by
design and its risk is concentrated in that take. A visualizer has no setups. And a
narrative shot with no singing face is ordinary generated coverage, governed by the
general sourcing rules, with no slice to share.

## Sources

Shooting each setup against playback of the whole song and cutting across setups is
training-data convergence on live music-video production practice, not fetched. The
model-placed-cut mechanism is the generated-shot-sourcing technique's, cited not
restated. The scouting-pass reading of a multi-cut generation originates in a
practitioner's tutorial in which one generation produced a dozen-plus hard-cut
angles; whether those cuts land off the bar grid is render-unverified here and is
stated as a risk to check, not as a measured fact.
