---
layer: technique
type: technique
subject: music-video-production
technique: segment-on-the-master-clock
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [a song is longer than a video generator's clip cap, generated segments drift against the song as the video goes on, choosing where one generated segment ends and the next begins, reassembling generated pieces against a fixed track]
---

# Segment on the master clock

A song is longer than any video generator's clip cap, so a music video is
generated in segments. The segments are a production artifact, not an editorial
one: they exist because the generator is short, and the audience must never be
able to find them. Three properties make that true.

1. **Segments are cut at phrase boundaries from the track map**, not wherever the
   cap runs out.
2. **Every segment has handles** — extra picture, generated against extra audio,
   before its in-point and after its out-point.
3. **Every segment carries its master-clock offset as data**, and reassembly
   places it by that offset, never by eye.

The rule: **a segment is defined by a master in-point, a master out-point and its
handles; it is generated against exactly that slice of audio; and it is placed by
the in-point it carries.** Anything placed by dragging until it looks right has
been placed by a guess, and the guess shows on the first word that is held.

## Where the seams go

Read the seams off the vocal activity map before the bar grid. A seam inside a
sung word is the worst seam available: the two halves of the word are generated
under two conditionings and the mouth will not agree with itself across the join.
Seams go where the performer's stem is silent — a breath between lines, the gap
before a chorus — and, among those, at or near a bar line, so that the cut a seam
eventually becomes can sit on the grid. A held note that crosses a section
boundary is a region in which no seam may fall, and the segment containing it is
planned to contain all of it.

## Handles, and why the audio needs them too

The handle gives the editor room to move the cut a beat either way without
regenerating. On a music video it has a second job: the picture's handle is
generated against the master's audio around the phrase, so the mouth is already in
the state of the music when the usable part begins. Live productions start playback
a bar or two before the take they need for the same reason; a performer who starts
on the first word is still arriving at it.

## The drift arithmetic

A segment is a slice of the master expressed two ways, and the two must agree:

- **audio**: S samples at the master's sample rate R lasts S / R seconds;
- **picture**: N frames at the clip's frame rate f lasts N / f seconds.

They disagree in three ordinary ways, and each has a different size:

- **Duration quantisation.** Generators emit durations in their own steps — whole
  seconds, or frame counts of a fixed form — and the requested slice rarely
  matches. The clip is then longer or shorter than its slice. Decide, per
  generator, whether the conditioning audio is placed at the clip's head (the
  surplus is at the tail) or stretched to fill it (every frame is off by a
  proportion), and record which; the second is a rate error disguised as a
  convenience.
- **Frame-rate mismatch.** A clip generated at 24 frames per second and placed on a
  25 fps timeline frame for frame runs 4% fast. Over a ten-second segment the
  picture is four hundred milliseconds ahead of the song by the tail, several
  times past the point where a viewer sees a mouth miss even in the forgiving
  direction. Conform the rate at the source, as
  drift-correction requires for any rate mismatch; no offset fixes a slope.
- **Offset.** The usable part starts a handle's length in, and the handle length
  as generated is not always the handle length as requested. That is a constant
  slide, and drift-correction's offset rules apply as they stand.

## The check that catches it

Measure each placed segment at its head and at its tail against an anchor event
both domains share — a plosive against a lip closure, a downbeat against a strike —
and compare. Equal error is an offset; growing error is rate. Where the generator
returns the conditioning audio in its output, that audio is a sync witness before
it is discarded: cross-correlating its envelope with the master slice gives the
clip's offset and stretch as numbers, without anyone watching lips. A segment that
has not been measured is reported as unmeasured, not as placed, and the count of
unmeasured segments travels with the cut.

## Boundaries with neighbours

drift-correction in video-assembly owns sync as a signed number and rate mismatch in
general; this technique applies it to a fixed track and adds where the seams go and
what each segment carries. chunk-boundary-continuity in multi-speaker-speech-production
is the closest analogue and runs the other way: there the cut chooses the content
(the script is split, each chunk is rendered, the seam is where two renderings
meet), so the cut point decides what is said. Here the content is fixed — the song
does not change — and only the cut point moves, so the question is never "what
should this piece say" but "where does this piece sit". The clip-cap rule in
generated-shot-sourcing (seams chosen at brief time, on structural beats) is the
general form; this technique names the structural beats for a song and makes the
offset data.

## Decision rules

- When planning segments, place seams in silences of the owned stem first and near
  bar lines second; never inside a sung word or a held note.
- When generating a segment, give it handles at both ends, and generate the handles
  against the master's audio around the phrase.
- When a segment is accepted, store its master in-point, out-point, handle lengths,
  frame rate and frame count with it; a segment without them cannot be placed except
  by eye.
- When head and tail error differ, conform the rate at the source rather than
  sliding the segment.
- When the generator's duration step cannot express the slice, prefer the next
  longer duration with the audio placed at the head over stretching the audio to
  fit, because a surplus is a trim and a stretch is a rate error.

## When not to use it

A track short enough to fit in one generation has one segment and no seams. A
visualizer rendered per frame from the audio has no generated segments at all; its
timing is a function of the frame and is exact by construction. And a video cut so
fast that no shot outlives a single phrase is generating shots, not segments — each
shot still carries its offset, but the seam rules collapse into the cut.

## Sources

The arithmetic is elementary and stated here as such. The 4% rate figure is 25/24.
The detection thresholds (sound early from roughly 45 ms, late from roughly 100 to
125 ms) are the ones drift-correction already cites. Starting playback before the needed take is
training-data convergence on live music-video production practice, not fetched.
Using a generator's returned audio as a sync witness is a proposal: whether any
given generator returns the conditioning audio unaltered is render-unverified.
