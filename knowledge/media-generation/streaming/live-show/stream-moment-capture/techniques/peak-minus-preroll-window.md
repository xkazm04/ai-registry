---
layer: technique
type: technique
subject: stream-moment-capture
technique: peak-minus-preroll-window
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when: [deciding where a clip cut from a stream starts and ends, turning a scored peak into a clip interval, diagnosing clips that open on a reaction without its cause]
---

# Peak minus pre-roll window

A scorer hands over a point in time: the peak of a fused signal. A clip is an interval,
and the interval is where most stream clips are lost. The signal peak marks the reaction,
not the cause; the cause, the setup the reaction answers, sits seconds earlier. The
technique opens the window **backward from the peak by a pre-roll long enough to carry the
setup, closes it forward past the payoff and one beat of reaction, snaps both edges to
speech, and clamps the result to the band the short container wants**.

## Why the window leans backward

Every capture signal lags the moment. A host's marker follows the line it marks by a beat.
Audio energy peaks on the laugh, after the punchline. The crowd lags most of all: the
moment has to reach viewers through the delivery delay of a live-streaming platform, be
read, be reacted to and be typed, and that chain can run to many seconds. A window centred
on the peak is therefore centred on the reaction, and a window that starts at the peak
opens on laughter at a joke nobody hears. A clip without its setup has no "therefore": it
is a reaction shot, and a reaction shot travels only to people who were already in the
room.

## Procedure

1. **Anchor on the peak, corrected for its signal's lag.** If the peak was driven mainly
   by the host's marker, the anchor sits close to the line; if mainly by the crowd, move
   the anchor back by the crowd's measured lag before applying any pre-roll. When the
   scorer scored units of the show (beats, exchanges) and credited each with the reaction
   in a window after it, the lag is already paid: the anchor is the unit's line, and it is
   not moved again.
2. **Open backward by the pre-roll.** Start from a default reach that covers a typical
   setup, on the order of ten seconds or so before a marker-driven anchor and longer
   before a crowd-driven one, then extend it to the start of the setup the transcript
   shows: the question asked, the premise stated, the turn that the payoff answers.
3. **Close forward past the payoff.** End after the payoff and one beat of reaction, the
   laugh or the reply, not on the punchline's last syllable; a clip that cuts the instant
   the line ends feels clipped.
4. **Snap both edges to speech.** Never open mid-word or mid-sentence. The opening edge
   moves *earlier* to the start of the setup sentence, never later past it; the closing
   edge moves to the end of the reaction beat.
5. **Clamp to the format band.** Hold the interval inside the duration band the target
   short format wants. If the snapped window overruns the band, trim connective tissue
   inside it only where the setup survives; if the setup itself cannot fit, flag the
   moment for re-authoring or drop it. Never meet the band by cutting the setup.
6. **Record provenance.** Store the in-point and out-point on the stream's own clock, with
   the anchor, the lag applied and the pre-roll used, so the cut can be audited against
   the transcript and re-derived if the defaults change. Record the lag the code actually
   applied, and how: a field that names a correction nobody made is provenance with
   nothing behind it, and an audit that trusts it re-derives the wrong cut.

## The defaults are craft, not measurement

The pre-roll and the duration band are sensible opening positions: a reach of roughly ten
to fifteen seconds before a host-anchored peak, and a band in the tens of seconds, sit
inside what working clippers use, and practitioner tooling that anchors on chat spikes
reaches back further, often half a minute, because the crowd lags so much. None of these
figures is a measurement of what retains viewers for a given show. The measurement that
earns one is the share of cut clips whose setup an independent reviewer judges present,
and the retention of published clips by pre-roll length, each with its sample size and
date.

## Decision rules

- **When the peak is crowd-driven**, apply the crowd lag before the pre-roll, because
  otherwise the pre-roll is spent recovering latency instead of setup; unless the crowd
  was credited forward to the unit it answered, because then the anchor is already the
  cause and a second shift lands on the line before it.
- **When the setup spans more than the band allows**, hand the moment on as a
  re-authoring case rather than a cut, because a derived short needs a whole question
  answered inside it and a trimmed setup does not answer one.
- **When the moment carries a factual claim**, use a longer band than a quick exchange
  gets, because the clip must also show the claim's source and grade, and that time comes
  out of the band, not out of the setup.
- **When two candidate windows overlap**, merge them into one window if the merged
  interval fits the band, because two clips of one moment compete with each other.
- **When the moment is a long build with no single peak**, anchor on the payoff and let
  the setup extension do the work, because the fused peak of a slow build is often in
  the wrong place.

## When not to use

A moment that is entirely visual and instantaneous, with no setup to carry, needs only a
short pre-roll for orientation, and stretching it to a default reach pads it with dead
air. And a window is a cut decision, not an edit: re-authoring a moment whose setup will
not fit, with a new hook and a new close, belongs to the derived-short craft downstream.
