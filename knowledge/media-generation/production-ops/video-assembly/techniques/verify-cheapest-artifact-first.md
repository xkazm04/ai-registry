---
layer: technique
type: technique
subject: video-assembly
technique: verify-cheapest-artifact-first
status: forged
laws: [unmeasured-is-not-pass, checkability-routes-the-pixel]
shared_with: []
use_when:
  - a cut is compiled from source and the full render takes minutes, needs a GPU, or costs money
  - an assistant is about to render a finished video to find out whether a composition is right
  - a person is in the loop and will judge the result by watching it
  - a composition renders without error and the output is blank, black or wrong
---

# Verify the cheapest artifact first

A composition that compiles from source can be inspected at several costs
before anything is encoded, and each cost buys an answer to a *different*
question. The mistake is to treat the finished render as the first check. It
is the most expensive artifact the pipeline makes, it answers every question
at once, and so a failure in it points at nothing: a black frame could be a
missing font, a layer parked off the canvas, an opacity stuck at zero, a
codec, or a bad timing curve, and the only way to tell is to go back down the
ladder anyway.

So build the ladder deliberately and climb it in order. Each rung is named by
the artifact it produces and the defect class it can see.

| Rung | Artifact | Sees | Cost |
| --- | --- | --- | --- |
| 1 | Type check and schema validation of the compiled spec, then static lint | malformed input, impossible values, silent-default traps | milliseconds, no device |
| 2 | One still at each moment that matters: entrance, peak, exit | layout, text fit, colour, which layer is on top | one frame |
| 3 | A contact sheet: a grid of sampled frames with their numbers | easing, hitches, wrapping that jumps at a keyframe, a cut that does not cut | a handful of frames, one image |
| 4 | Pixel and bounding-box probes in the test suite | a property that must hold on every run: this colour here, this box inside that box | a few frames, automated |
| 5 | A live preview with sound, when a person is judging | timing against audio, taste, feel | real time |
| 6 | The full export | codec, mux, length, loudness - the things only the finished file has | the whole render |

## Why order matters more than the list

The rungs are not alternatives; they are filters ordered by cost per
answer. A bug caught at rung 1 or 2 costs seconds. The same bug found after
a thirty-second export at four times the resolution costs minutes and, worse,
costs the *diagnosis*, because the export has thrown away the structure the
earlier rungs read directly. The rule is to stop at the first rung that
fails, fix it there, and re-climb from that rung - not from the top and not
from the export.

Two rungs deserve a reason, because they are the ones people skip.

**The contact sheet** earns its place because motion is the property a single
still cannot show and a full render shows too late. A sheet of eleven frames
across an intro sweep reveals a hitch in the easing, a text block that wraps
differently across a boundary, or a transition that never arrives, in one
image that can be read in a glance and attached to a message. It is also the
artifact a machine can hand to a person: showing the sheet before the export
is a request for a decision that costs the person seconds.

**Probes** earn theirs by turning a one-time look into a standing check. The
still at rung 2 is judged once, by eye; a probe that asserts "the title is not
black at frame 30" is judged on every later change. A failure here is the
only one in the ladder that survives the session that found it.

## A cheap rung is only representative of what it can reproduce

The ladder is honest only while a cheap artifact is a stand-in for the
expensive one. That fails for any effect whose output at frame *n* depends on
the frame drawn just before it - a detector or tracker that reads the
previous result, a feedback or trail effect, a simulation stepped per frame.
Such an effect has no output at the first frame it is asked for, and a still
or contact-sheet frame rendered by jumping straight to it is computed from
whatever frame the renderer happened to draw last: the sheet shows a ghosted
double of the subject, or a cutout that is transparent, and neither is a
defect in the composition.

For those effects the cheap rungs need a **warm-up**: render at least two
consecutive frames with the same renderer and keep the last, or declare that
the sheet is not representative for that layer and rely on rungs 4-6. A
preview has the same limit while the playhead is paused or the device skips
frames. The failure to design against is a sheet that looks wrong, gets
"fixed" in the composition, and is then right in the export only by luck.

## Decision rules

- When a render is expensive and the composition is in source, run the cheap
  rungs first and stop at the first failure; never use the export to find out
  whether the composition is valid.
- When a still looks wrong, name the rung that should have caught it before
  fixing it, and add that check there so it is caught earlier next time.
- When timing or easing is in question, make a contact sheet; do not
  render a video to look at motion.
- When a property must hold on every change - a colour, a box inside a box, a
  non-empty frame - promote it from a look to a probe.
- When a person is judging, show the cheap artifact before spending the
  render: the sheet, then the preview with sound, then the export.
- When a layer's output depends on the previous frame, give the cheap rungs a
  warm-up or exclude the layer from them, and say which in the report.
- When the output is blank or black and the rungs above were skipped, climb
  back down before touching anything: lint, then one still at a known-good
  frame, then widen.

## When not to use it

When the whole render is cheaper than the ladder - a few seconds, no device
contention, no cost per run - the ladder is overhead; render and look. It also
does not replace the full export for the properties only the finished file
has: container, codec, duration, loudness. A ladder that never reaches rung 6
has verified a composition, not a deliverable.
