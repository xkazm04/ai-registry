---
layer: application
type: application
subject: video-assembly
technique: unreferenced-channels-resample
stack: python
status: forged
verified_on: 2026-10-21
verified_against: python@3.14
applied: render
ab_verdict: better
proof: ab-paired
grader: operator
---

# Python: the same line twice, with and without a voice to hold it to

This application tests the technique's central claim — *a channel the model
synthesises and nothing conditions is re-sampled on every call* — on a local
joint video-and-audio generator, where the claim is falsifiable in the only
place it can be: the output's sound.

The stack is a node-graph generation server at version 0.42.1 under Python
3.14.8, on PyTorch 2.16.0.dev20261012+cu134 against a single Blackwell-class
GPU (all four witnessed from the running server's own status endpoint, not
from a manifest). The model is a reference-to-video-and-audio checkpoint that
emits picture and sound from one sample and exposes two autogrow reference
sockets — images and audios — plus a separate audio decoder. Its own tooltip
for that decoder is what made the test worth running: *without it, reference
audio only conditions the text encoder.* The decoder was wired in **both**
arms, so the test is about the reference, not about the plumbing.

## The seam

One character in a forge interior, a medium shot at the anvil, speaking one
line: *"The gate holds till dawn. Not an hour past."* Both arms carry the same
identity image in the reference role map, the same style block, the same shot
description, and — this matters — the same textual voice direction, *"in a low
gravelly older man's voice"*.

- **Arm A**: identity image only. The voice is described in prose and
  conditioned by nothing.
- **Arm B**: the same, plus one voice sample attached as reference audio and
  declared in the role map with a negative scope — *controls only the voice,
  never the words, never the performance, never anything in the picture*.

Each arm was rendered twice at two noise seeds, 70101 and 70999, with every
other field held identical — verified by diffing the two request documents,
which differ in exactly two fields: the seed and the output name. The
turbo-distillation adapter was bypassed in all arms (twenty sampler steps, base
weights) so that step count could not confound the comparison.

## What the pair answers, and what it cannot

The production-relevant question is whether a voice holds across *different
beats*. That pair was rendered too, and it is the weaker instrument: two beats
carry different lines and different deliveries, which move the measured
register for legitimate reasons, so a difference between them is not yet
evidence of drift. The **same-setup, two-seed** pair isolates the channel,
because nothing but the seed differs, and it is the pair this application is
built on. The cross-beat numbers are reported below as directional only.

## Result

A dependency-free instrument (long-term average spectrum over voiced frames,
plus median fundamental, energy-gated so that room tone cannot be scored as
speech) measured each pair:

| | distance |
| --- | --- |
| unreferenced arm, two seeds | **0.4432** (125.0 Hz vs 92.5 Hz — four tenths of an octave) |
| referenced arm, two seeds | **0.0623** (106.0 Hz vs 101.9 Hz) |
| ratio | **7.11x** |
| cross-beat, unreferenced / referenced | 0.2973 / 0.2158 — directional, n=1, **not** established |

The operator was then shown the two arms blind, as neutrally-named clips with
the key sealed, and asked only whether each clip sounded like one person twice.
They picked the referenced arm, naming consistency as the reason, without being
told what the variable was — so the instrument and the ear agree without having
seen each other. Verdict **better**.

Two findings the run did not expect, both of which constrain the technique
rather than confirming it:

- **The prose direction did not pin anything.** Both arms were briefed with the
  same voice adjectives, and the unreferenced arm still moved four tenths of an
  octave between takes. A description names a class; it does not fix an
  instance.
- **The reference pins stability, not likeness.** Distance from each output to
  the attached sample was unchanged by attaching it — the referenced takes sat
  no closer to the sample (mean 0.210) than the unreferenced ones did (mean
  0.210). The sample works as an anchor identical on every call, not as a
  target the model imitates. A pipeline that grades a candidate sample for
  likeness is grading the wrong property.

The picture floor held: frame 48 of each arm shows the same character, the
forge mouth, the anvil and the hammer, with no loss of identity or legibility
in the treated arm. The operator noted one cost against the treatment — one
unreferenced take had the clearest sound of the four — which is recorded in the
technique as a trade rather than discounted.

## What this does not establish

Every cell is a single render. The proof establishes that the mechanism exists
and that it is audible; it prices nothing. The cross-beat axis — the one
production actually buys — remains directional. Return with repeated seeds per
cell and a multi-beat sequence before quoting an effect size.
