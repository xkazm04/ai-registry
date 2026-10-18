---
layer: technique
type: technique
subject: live-response-latency-budgeting
technique: say-gap-ceiling
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [deciding whether a live host's pacing is acceptable, the stream goes quiet when chat is quiet, building a rehearsal gate or a live watchdog for dead air]
---

# Say-gap ceiling

Dead air is the failure a live audience notices first and forgives least, and
it is invisible to every per-reply metric. A host can answer every message
promptly and still sit silent for half a minute between them. The say gap is
the instrument for this: the stretch of stream time between one host utterance
and the next. Its maximum over a stream is held under a ceiling, enforced as a
gate in rehearsal and as a watchdog on air.

## Measure the maximum, in stream time

Record the time of every host utterance on the stream clock, and compute the
gaps between consecutive ones. Report the **maximum**, and the count of gaps
over the ceiling; report a high percentile if it helps diagnosis. Do not
report the mean as the pacing figure. A stream whose mean gap is a few seconds
can contain the one long silence in which half the room left, and the mean
hides it by construction.

The clock is the stream's. In a simulated or accelerated stream the
generation calls take wall time while the stream advances on its own clock;
the gap that matters is the one a viewer would have sat through, so the
utterance times are stamped in stream time. Where a slow call stalls the
simulated clock instead of advancing it, the simulation is hiding exactly the
silences this metric exists to catch; check that a call slower than a tick
shows up as a gap. A simulation that advances one fixed step per beat however
long the beat's calls took measures only the silences the host chose, never
the ones its latency caused; report the two separately, or charge each beat's
measured call time to the stream clock.

The gap's resolution is the loop's period. A host that can only speak on a
beat every few seconds can only produce gaps in multiples of that beat, so a
reported maximum is accurate to one beat at best, and a ceiling must be
several beats wide for the gate to distinguish a host that is pacing well
from one that is merely lucky with its timing.

## The ceiling is a number, set from the audience

The ceiling is the longest silence the show accepts, set from what its
audience tolerates and stated as a number. A live host that is silent for
much longer than a quarter of a minute has, to a viewer arriving at that
moment, nothing on air. Set the gate at the edge of tolerance and the
watchdog well inside it, because the watchdog's job is to act before the gate
would fail.

In rehearsal and simulation, a run whose maximum gap exceeds the ceiling
fails pacing, whatever its other scores. Do not average it away across runs;
a tier or a tone that produces one long silence in a handful of runs will
produce it on air.

## On air, it is a watchdog

On stream the ceiling becomes a timer that resets on every utterance. As the
gap approaches the watchdog threshold, the host is made to speak: from the
fast lane if a line or beat is ready, from the stalling deck if the host is
waiting on its own work, from the premise deck if the room is simply quiet.
The watchdog does not care which; its only job is that the gap closes before
the ceiling.

## Declared pauses

A host may choose silence: a dramatic beat before a reveal, a pause for a vote
to come in, a moment held after something sincere. Those are declared, with a
length, at the moment they begin, and the gap measure excludes them up to the
declared length. A pause that runs past its declaration is a gap again.
Undeclared silences all count. A ceiling that cannot tell a choice from a
failure gets loosened until it measures neither.

## Decision rules

- When a run exceeds the ceiling, it fails pacing; find which lane was empty.
- When the maximum gap tracks quiet chat, the premise deck is thin; when it
  tracks slow calls, a role is in the wrong latency class or the stalling
  ration is too small.
- When choosing between tiers for the voice, compare their maximum gaps
  alongside their latency; the longer silence decides against a tier that
  looks faster.
- When the gap metric has not been recorded for a run, pacing is unmeasured,
  not passed.

## When not to use it

A stream with intentional long silences as its format (an ambient or
co-working stream where the host speaks rarely) has a different ceiling, not
none; set it from that audience. A recorded piece edited after the fact has
no live gap to watch, though it still has dead air to cut.
