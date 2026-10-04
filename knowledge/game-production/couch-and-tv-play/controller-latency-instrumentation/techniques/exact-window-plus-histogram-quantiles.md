---
layer: technique
type: technique
subject: controller-latency-instrumentation
technique: exact-window-plus-histogram-quantiles
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [a live service must report latency percentiles without unbounded memory, choosing histogram resolution and cap, a tail value must not be hidden by bucketing]
---

# Exact window plus histogram quantiles

A latency recorder in the hot path of a game has three constraints that pull in different
directions: it must not allocate, it must answer "what is it doing right now" without
approximation, and it must remember the whole session without growing. No single structure
satisfies all three. The working answer is two structures fed by the same call, each used
for the question it can answer exactly, plus two exact scalars that bracket the
approximate one.

## The structures

The recent window is a fixed-capacity ring of raw samples, each stored with its arrival
time. To report, take the samples whose age is within the window length, sort that small
set, and read the quantiles by rank. This is exact: the reported median and ninety-fifth
percentile are actual samples, not estimates. The ring's capacity must exceed the maximum
number of samples the window can hold at the highest sample rate, otherwise the ring
silently becomes a shorter window than advertised. At a sixty-per-second sampling rate and
a ten-second window that is six hundred samples; a capacity of several thousand leaves
headroom for a faster rate, and the reported sample count shows whether the window filled.

The lifetime histogram is an array of counters over equal-width buckets from zero to a
declared cap. Each sample increments the bucket it falls in; values past the cap land in
the last bucket. To report a lifetime quantile, walk the buckets accumulating counts until
the target rank is reached and return that bucket's value. The error is at most one bucket
width, which is the declared resolution, and the memory is fixed regardless of how long
the session runs.

Two scalars sit beside them and are exact: the count of all samples and the maximum ever
seen. They are what keep the histogram honest. The cap makes the histogram blind above it,
so a stalled input that aged for thirty seconds appears in the last bucket as if it were
the cap; the exact maximum is what shows the real figure, and the count shows how many
samples the quantiles are built on.

## Choosing resolution and cap

Resolution is chosen against the smallest difference the report must resolve, and cap
against the largest value that is still a measurement rather than a fault. A frame-time or
input-age recorder where differences of a tenth of a millisecond matter and nothing above a
few seconds is a useful reading wants a tenth-of-a-millisecond bucket and a cap of several
seconds, which is under a hundred thousand counters. A recorder for a sub-millisecond
simulation step wants a thousandth-of-a-millisecond bucket and a cap of tens of
milliseconds, because everything above that is a different failure. Different quantities
get different geometries, and each declares its own. Write the resolution and the cap into
the report next to the numbers; a quantile with no stated resolution is one of the
unitless figures that look precise and are not.

Two behaviours of bucket readout need stating. Returning the bucket's lower edge biases
every lifetime quantile low by up to one bucket; returning the upper edge biases it high.
Pick one, say which, and make the width small enough that the bias is below the question.
And a value that is stale rather than slow will inflate the lifetime histogram toward the
cap: if samples keep being recorded for a disconnected source whose last input keeps
ageing, the quantiles drift upward without anything on the path having changed, so decide
explicitly whether such samples are recorded and label the choice.

## Procedure

- Record every sample once, into both structures, under one lock or from one thread; a
  window and a histogram updated by different threads disagree about the count.
- At report time, filter the ring by age, copy to a scratch array, sort, and index by rank
  using the ceiling of quantile times count, minus one, clamped. State the definition of
  the quantile, since interpolating definitions give different values on small windows.
- Report window quantiles, window count, lifetime quantiles, lifetime count, exact maximum,
  the resolution and the cap. An empty window reports a count of zero and is not rendered
  as a zero latency.

## Decision rules

- **When the question is about now, read the window.** The histogram smooths over the very
  episode you are trying to see.
- **When the question is about the whole run, read the histogram and the maximum
  together.** A lifetime median of twelve milliseconds and a maximum of a hundred and ten
  tell two different stories, and both are needed.
- **When a window holds fewer samples than its ring could, say how many.** A ninety-fifth
  percentile over ten samples is a statement about the second-worst sample.
- **When more than one source feeds the system, give each its own recorder.** Merging two
  sources into one recorder hides the one that is wrong.

## When not to use it

- **For offline analysis.** With the whole sample set on disk, compute exact quantiles over
  all of it; the histogram is a concession to the hot path, not a preference.
- **When a mergeable sketch is needed across many hosts.** Fixed-width buckets merge by
  addition and are fine for that, but a skewed range would be better served by buckets
  whose width grows with the value; choose that before the first report, because buckets
  with different geometries cannot be merged.
- **When the tail beyond the cap is itself the object of study.** Raise the cap or record
  the exceedances separately.
