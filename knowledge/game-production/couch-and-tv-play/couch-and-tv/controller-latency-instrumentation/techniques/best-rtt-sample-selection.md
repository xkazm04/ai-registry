---
layer: technique
type: technique
subject: controller-latency-instrumentation
technique: best-rtt-sample-selection
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [many probe samples exist and one offset must be chosen, an offset looks unstable between probes, deciding when an old sample must be replaced]
---

# Best-RTT sample selection

A stream of probes yields a stream of offsets, and they disagree. The disagreement is not
random in the way averaging assumes: it is almost entirely queueing delay, which only
ever adds time, and which is rarely symmetric between the two legs. So the sample worth
keeping is the one that was queued least, and the evidence that a sample was queued least
is that its round trip was the smallest seen.

## The reasoning

The offset error of one sample is bounded by half its round trip, and the round trip is
the floor of what the path costs plus whatever waited in a buffer. A sample at the
observed minimum has the least waiting in it and so the tightest bound and, in practice,
the most symmetric legs. Averaging offsets from samples of mixed quality blends a good
estimate with several biased ones and produces a number that is no better than the
average sample. Taking the median does somewhat better and still carries every
persistently queued probe. Selecting the minimum round trip discards, rather than
averages, the samples that are known to be worse.

Network time implementations settled on the same rule long ago, over a short sliding
window of recent exchanges, and for the same reason: as delay rises the offset variation
rises with it, so the lowest-delay sample is the best candidate.

## Procedure

Keep a running record of the smallest round trip seen so far on this connection, starting
at infinity. For each completed probe compute its round trip; when it is strictly smaller
than the record, replace the record, recompute the offset from this sample, and publish
the new offset together with its round trip. When it is not smaller, change nothing. The
consumer applies the most recently published offset to every input from then on.

The record must reset when the connection does. A round trip measured before a reconnect
describes a different socket and possibly a different path, and a stale minimum would
refuse every honest sample on the new one.

## The weakness, and the fix

Pure minimum selection has one defect that a short test never shows: the record never
ages. A single lucky sample early in a long session, perhaps one that happened to coincide
with an idle radio, sets a minimum no later probe can beat, and the offset is then frozen
while the two clocks drift apart under it. Drift between ordinary device clocks is
measured in tens of parts per million, which is a few milliseconds over several minutes,
the same order as the quantity being measured. A long soak with a frozen offset slowly
bends its own age series.

The remedy is a window rather than a record. Keep the best sample from the last several
probes or the last tens of seconds, let the record expire, and re-select. A short window
tracks drift and tolerates a burst of congestion; a long window finds a better minimum and
tracks drift worse. Choose the window so that the expected drift across it is well under
the error bar of the best samples, and state the window beside the reported offset. An
alternative that suits long runs is to keep two or more offsets from far-apart moments
and fit a slope, which removes drift instead of chasing it, at the price of more code and
a more complicated failure surface.

## Decision rules

- **When two samples tie on round trip, prefer the later one.** It is closer in time to
  the inputs it will correct.
- **When the best round trip is itself large compared to the quantity being reported,
  say so.** If the best sample ever seen has a round trip of forty milliseconds, no age
  below twenty is meaningful, whatever the selection did.
- **When the offset changes by more than the new sample's half-round-trip between
  consecutive selections, log it.** A step larger than the error bar is a clock jump, a
  path change, or drift that the window is too long to follow; any of the three is worth
  seeing in the record.
- **Never select on the one-way inbound estimate alone.** The round trip is the only
  quantity observable from one side without already knowing the offset, which is why it is
  the selector.
- **Publish the selected round trip with the offset.** The consumer cannot compute the
  error bar without it.

## When not to use it

- **When the link is so stable that all round trips cluster within a millisecond.** The
  choice then changes the offset by less than the measurement resolution, and the extra
  state is not earning anything.
- **When the probe count is tiny.** With fewer than a handful of samples the minimum is
  mostly luck; report the offset as provisional until a few samples have arrived.
- **When the quantity of interest is the tail.** The minimum-round-trip offset is the
  right correction for placing inputs on the screen device's timeline, and has nothing to
  say about how bad the worst round trips were; those belong to the distribution
  techniques.

## What it does not remove

The asymmetry that survives even the best sample is not reducible by selection, and it is
the same for every sample on the connection. Selection removes the avoidable error, never
the unavoidable one, so the half-round-trip bound of the chosen sample is still the number
a report must carry.
