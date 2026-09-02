---
layer: technique
type: technique
subject: adaptive-music-authoring
technique: music-acceptance-beyond-decode-checks
status: forged
laws: [structural-proof-is-never-sufficient, no-gate-self-certifies, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a music pipeline reports green because every file opened, building a gate for generated or delivered music, deciding which rungs a one-shot cue may defer]
---

# Music acceptance beyond decode checks

## The concern

The check every music pipeline has is: did the file decode, is it the right length, is it
at the right loudness. All three pass on a beautiful thirty-second rendering that fades in,
fades out, sits at no stable tempo and cannot loop, layer or transition. The line reports a
green music pipeline, and what it has reported is a fact about files
([structural-proof-is-never-sufficient](../../../../_laws.md#structural-proof-is-never-sufficient)).

This technique is the ladder above that floor: which rungs music needs, what each measures,
and the defect each one catches that the rung below is structurally blind to. The ladder's
general vocabulary — what makes a rung strictly stronger, the four statuses, why a check
that cannot run here is *deferred* with a stated reason rather than passed or failed — is
owned by a neighbouring subject and is used here rather than restated.

## Rung 0 — the file is a file

Decodes, has the declared duration, sample rate and channel count, is not silent, is not
clipped. Keep it, name it honestly, and never let a summary treat it as musical evidence.

## Rung 1 — declared state, cross-checked

The declaration exists and is internally consistent:

- Every layer in a set has an **identical sample count**. This is the rung that catches the
  set which will drift apart over minutes of play, and nothing above it will — a drifting
  set sounds correct for its first thirty seconds, which is the length of every audition.
- Every segment reachable in a transition matrix shares a meter, and each declares its
  entry and exit points.
- The loop boundary is expressed in samples at the file's own rate, and lies inside the
  file.
- Every declared intensity tier names a layer subset that exists.

## Rung 2 — measured against declared

Here the ladder starts being about music, and this is the rung most production lines do not
have.

- **Tempo recovered from the audio matches the declared tempo** within a stated tolerance.
  The tolerance is tight for a reason: a drift of 0.05 beats per minute across a two-minute
  piece accumulates to roughly a third of a second of slip by the end, which in a layered
  set is a phase disaster. State the tolerance and the window it was measured over.
- **An onset grid is detectable and aligns to the declared downbeat.** A piece with no
  recoverable grid fails here regardless of how it sounds, because a scheduler cannot enter
  it on a boundary that does not exist.
- **Integrated loudness sits in the target band and true peak is under the ceiling**,
  measured over the whole piece rather than a peak meter.

The rule that makes this rung mean anything: **the declaration must be measured from the
audio, not typed beside it.** A tempo somebody asserted turns rung 2 into a comparison of
metadata with itself, which is a producer certifying its own output
([no-gate-self-certifies](../../../../_laws.md#no-gate-self-certifies)). Where a supplier
provides a declaration, treat it as an input to the verdict and re-measure.

## Rung 3 — the loop under repetition

Render several consecutive cycles as one continuous stream and look for a **periodic
artifact at exactly the loop period**:

- a sample-delta outlier at the seam is a click;
- an energy notch is a truncated tail;
- a level dip is an over-long crossfade concealing one of the two.

A single pass finds none of these reliably, because a single pass has no periodicity for
the ear or the meter to lock onto. A loop is judged the fortieth time.

## Rung 4 — combination

- **Sum the full layer set** and check for cancellation between layers and for onset
  alignment across them.
- **Check the subsets.** Every tier's arrangement holds its own ceiling and stands on its
  own musically. This is the most-missed check in the ladder and the reason is structural:
  a layered score is always auditioned full, and the arrangement the player hears for most
  of the game is a subset. A layer set separated out of a finished mix passes rung 4's
  full-set half and fails its subset half, which is exactly the defect that separates
  composed layers from sliced ones.

## Rung 5 — scheduled behaviour

Request transitions under load and measure the actual first rendered sample against the
declared boundary. A non-zero delta is a defect even when it is inaudible on the machine it
was measured on, because the margin it consumed belonged to a slower one. Exercise every
declared tier and every declared transition path; report how many of each the run reached.

## Rung 6 — perceptual

Does the higher tier read as more intense rather than merely busier. Does the loop read as
endless over several minutes rather than several seconds. Does the transition read as music
rather than as a cut. This rung needs a listener — human or machine — and whatever it is, it
is shown a defined excerpt: a stated number of loop cycles, a stated transition path, at a
stated tempo. That sampling is part of the instrument, and a score produced under one
sampling is not comparable to a score produced under another.

## The rules that keep the ladder honest

**Each rung names a defect the one below cannot see.** Rung 0 cannot see a missing grid.
Rung 2 cannot see a truncated tail, because a truncated tail is perfectly on-grid. Rung 3
cannot see a layer set that cancels, because it examines one file. Rung 4 cannot see a
scheduler that starts late. If a rung cannot name its own defect, it is decoration and it
inflates every completion figure quoted from the ladder.

**Every non-pass carries a reason** in the same format the rest of the line uses, so an
outstanding rung is a work order rather than a shrug.

**A rung that could not run states what it examined.** An acceptance run that reached one
of five tiers and reported clean has reported almost nothing; the count of what was examined
travels beside the verdict, and a run over an empty set is a loud failure
([unmeasured-is-not-a-pass](../../../../_laws.md#unmeasured-is-not-a-pass)).

## When not to use this

- **For a one-shot cue.** A stinger, a fanfare, a defeat sting has no loop and no layer set.
  Rungs 3 and 4 are *deferred* with the stated reason that the class does not loop and has
  no set — never passed, because a pass there would be green manufactured from an absence.
- **For a freely-timed ambient bed with no pulse.** Rung 2's grid check and rung 5's
  boundary measurement do not apply; declare the piece as unpulsed and defer them with that
  reason, rather than inventing a tempo so the gate has something to compare against.
- **As a substitute for a brief.** This ladder answers whether music can be assembled. It
  does not answer whether it is the right music, and a score that passes every rung and does
  not suit the game has failed at a stage upstream of anything here.
