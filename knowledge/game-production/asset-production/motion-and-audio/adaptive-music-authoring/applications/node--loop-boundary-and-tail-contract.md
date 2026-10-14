---
layer: application
type: application
subject: adaptive-music-authoring
technique: loop-boundary-and-tail-contract
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: unmeasurable
---

# Loop boundary and tail contract in a generated sound-effect pack

A VR game generates its looping sound effects (a crowd bed, a ward hum, a drawing trail)
with a Node tool and ships them as 16-bit PCM at 48000 Hz. It carries no music, but the
loop seam is the same concern, and the tool already does most of what the technique
asks, which makes it a good place to try to break the technique.

## What the tool does

- **Tail fold in samples.** After trimming dead tail and head below -50 dBFS, the last X
  samples are faded out on a quarter-sine curve and summed at unity with the first X
  samples faded in on the same curve; that mix becomes the head and the file is X
  samples shorter. X is 3840 samples for the short loops and 12000 for the crowd bed,
  rounded to a sample count rather than carried in seconds, with a clamp at a quarter of
  the file.
- **Whole-file looping.** The engine loops the wave from end to start, so the boundary is
  the file edge and there is no separate loop declaration to drift from the audio.
- **One authority.** A manifest records sample rate, channels, crossfade, a seam delta
  and a sha256 per file.
- **A seam gate.** The generation run fails a loop whose first-to-last step exceeds a
  multiple of the median step in the body.

## The experiment

The seam was chosen to falsify the technique, not to confirm it: a crossfade of 80 to
250 ms is far over the technique's ten-millisecond ceiling, so if "a long fade conceals
a content problem and dips the level" were true, these three files would show it.
A caught outcome would have been an energy notch at the join, which would have
qualified the ceiling for tail-fold loops (as against concealing crossfades).

Each delivered loop was concatenated for three cycles and read for the periodic
artifacts the technique names: the step at the seam against the 99th-percentile step of
the file, and 20 ms RMS windows from 100 ms before to 80 ms after the join against the
file's own minimum and maximum window. Results over 3 files:

- Seam step was 0.11 to 0.31 of each file's 99th-percentile step: not an outlier, no click.
- No window at the join fell outside the file's own range; no notch, no dip. Equal-power
  correlated-or-not mixing in the fold does not produce the pulse the technique
  attributes to a long concealing fade, because the fade is not hiding a discontinuity
  of content; the tail is present in the head.
- Manifest sha256 and seam delta matched all three files exactly.

The technique held. Its ten-millisecond ceiling applies to a fade that hides a join; a
fold that carries the decay into the head is a different mechanism and the file's own
level distribution shows no pulse. That is worth keeping apart in how the ceiling is
read, and is stated here without changing the technique.

## What remains open

The imported engine asset is a derived copy of the WAV. The project's engine test
asserts only that the wave's looping flag matches the cue and that the source WAV
exists; nothing compares the imported wave's sample count with the manifest. A
re-import from a trimmed or re-encoded WAV would move the boundary with no gate to see
it, which is the technique's re-encode clause in a place the tool cannot reach. No
project change was made: the gate belongs in the engine's own test, and the instrument
(a headless read of the imported sample count) was not available. Verdict
`unmeasurable`; the return condition is a headless editor or cook step that can read
sample counts.
