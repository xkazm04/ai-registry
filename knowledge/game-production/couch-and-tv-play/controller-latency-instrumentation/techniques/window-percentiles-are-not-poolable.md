---
layer: technique
type: technique
subject: controller-latency-instrumentation
technique: window-percentiles-are-not-poolable
status: forged
laws: [a-number-carries-its-unit-and-basis, an-instrument-proves-it-had-input]
shared_with: []
use_when: [summarising a long soak made of many reported windows, combining percentile readings across clients or sessions, an overall percentile is about to be the mean of window percentiles]
---

# Window percentiles are not poolable

A percentile is an order statistic. It is a property of one particular set of samples and
cannot be rebuilt from the percentiles of the subsets. This is easy to say and constantly
violated, because a long soak naturally produces a column of numbers, one row per reporting
window, and the eye wants a single line at the bottom.

## What goes wrong

Take three windows of equal size whose ninety-fifth percentiles are fifty, fifty and four
thousand milliseconds. The mean of the three is about thirteen hundred. The ninety-fifth
percentile of the pooled samples is four thousand if the bad window's tail is large enough
to occupy more than five percent of the pooled population, and fifty if it is not. The mean
is neither of those; it is the ninety-fifth percentile of nothing. The same holds for
medians of medians, for the maximum of a mean, and for any weighted combination: weighting
by sample count fixes the arithmetic and not the problem, because the missing information is
the shape of each distribution's tail, which the percentile discarded.

The failure is also directional. Averaging dilutes the single bad window into the quiet ones,
so the summary reads better than the worst thing that happened, which is the opposite of what
a latency summary is for.

## What to do instead

There are exactly three honest options, in order of preference.

**Pool the distributions, then take the percentile once.** If each window kept a histogram
with the same bucket geometry, histograms merge by adding counts bucket by bucket, and the
quantile of the merged histogram is the pooled quantile to within one bucket. This requires
that every recorder uses the same bucket edges, so decide the geometry once and never vary
it. If raw samples are retained, concatenate them and compute the quantile directly.

**Report the extremes of the windows, labelled as such.** The largest window ninety-fifth
percentile and the largest window maximum are real statements: "in no ten-second window did
the ninety-fifth percentile exceed this". They are different windows' worth, so say they are
from different windows when they are, and give the window count they range over. This is
the right summary when the only retained records are window percentiles and the raw
material is gone.

**Report a distribution over windows.** The count of windows whose percentile exceeded the
budget, out of all windows, is a defensible figure, provided it is named as a window-level
statistic and the window length is stated.

## Companion rules for the numbers beside it

- **Window sample counts that are sums of overlapping populations are not unique sample
  counts.** If a poller reads a rolling window more often than the window length, or with
  gaps between polls, consecutive readings share samples or miss some. A total of "fifty-three
  thousand samples" over many polls is a sum of window populations, and the report says so
  rather than presenting it as the number of distinct events.
- **Phases are separate populations.** Active play, menu, countdown and content-load
  transitions have different latency behaviour. Report them separately and keep the maxima
  of each, instead of burying a transition spike inside the mean of an active-play figure or,
  worse, excluding the spike so the active figure looks clean. When a single window straddles
  a transition, say it does.
- **Lifetime histograms and window quantiles differ in kind.** The lifetime figure carries a
  resolution and a cap; the window figure is exact. A table that puts them in one column
  without a header that says which is which has pooled them by layout.

## Procedure for a soak summary

1. Choose the recorded structure before the run: shared bucket geometry for every window,
   or raw samples retained to disk.
2. During the run, record per window the count, the exact quantiles, the exact maximum and
   the phase.
3. At the end, produce the pooled quantiles from merged histograms or retained samples where
   they exist, and the worst-window figures where they do not, each labelled with which it is.
4. Print the number of windows, the sum of their counts, and the statement that the sum
   counts rolling populations.
5. Compare to a budget only the figure whose basis matches the budget's: a budget stated for
   the whole run takes a pooled figure; a budget stated for every window takes the worst
   window.

## Decision rules

- **When the budget is "no window exceeds X", use the worst window; it needs no pooling.**
- **When the budget is "ninety-five percent of all samples under X", pool.** A worst-window
  figure is a stricter claim and a mean is no claim at all.
- **When only window percentiles survive, refuse to produce a pooled percentile.** Say that
  one cannot be recovered. A reconstruction by interpolation invents a distribution.
- **When a client's windows and another client's windows are about to be combined, treat
  them as two populations unless they share a basis.** Different devices, different clock
  offset errors.

## When not to use it

When there is one window, there is nothing to pool. And when the percentile is being used as
a threshold alarm over a single recent window, as in a live status page, the window figure is
the right thing to show, unpooled and labelled with its length.
