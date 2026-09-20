---
layer: technique
type: technique
subject: data-viz
technique: empty-and-degraded-chart-states
status: forged
laws: [failure-not-empty-success]
shared_with: []
use_when: [deciding what an empty plot area actually says, unmeasured buckets plotting as flat zero, two observations drawing a confident trend line]
---

# Empty and degraded chart states

A chart's frame makes a claim before any data does: axes and gridlines say
"something was measured here". That makes chart emptiness more treacherous
than a table's — an empty plot area inside rendered chrome does not read as
*absence*, it reads as **measured flat zero**, which is a finding the surface
just fabricated. The general async doctrine
([async-ui-states](../../../feedback-and-style/async-ui-states/async-ui-states.md)) applies in
full; this technique covers what charts add to it.

## Never draw an axis around nothing

The hard rule: **chart chrome renders only around data.** Before the first
response, the chart's reserved slot shows a placeholder (per
[chart-loading-economics](./chart-loading-economics.md)); when the response
arrives empty, the slot shows a typed empty state; on failure, a failure
state. In none of these does the surface draw axes, gridlines, or a zero
line — a labeled frame around an empty plot is the empty-flash defect
upgraded from "momentarily confusing" to "quietly asserting a measurement of
nothing".

## Four facts that must not share a rendering

A chart slot with nothing plotted is hiding one of four different facts, each
with a different next action, and the reader can only tell them apart if the
surface does:

1. **Nothing exists yet** — the instrument is live but the activity it
   measures hasn't happened. Say what will appear and, where applicable, what
   action starts the flow. This is a first-run surface and deserves design,
   not a shrug.
2. **Nothing in this window** — data exists, the current range or filter
   excludes it. Name the predicate ("no activity in the last 24h") and offer
   the widening move. The user's real question is "is my data gone?" —
   answer it.
3. **Not being measured** — the instrument itself is off: collection
   disabled, integration not connected, permission missing. This is the fact
   most often disguised as one of the others, and the disguise is expensive:
   a user who reads "not measured" as "measured, zero" concludes things are
   fine precisely when they are blind. The next action is configuration, not
   waiting.
4. **Could not answer** — the query failed. Per
   [failure-not-empty-success](../../../../_laws.md#failure-not-empty-success),
   failure is spelled differently from every empty: the surface states that
   it could not look (never that the answer is zero), preserves the window
   and filters, and offers retry. If a *refresh* fails while a chart is
   drawn, the drawn data stays, the failure is admitted ambiently, and the
   staleness is stated.

## Gaps inside a series: unmeasured is not zero

The same taxonomy recurs *inside* a populated chart. For every empty bucket,
the data contract must say which fact it is, and the rendering must honor it:

- **Measured, zero** → plot the zero. A flat run on the floor is real
  information.
- **Not measured** (collector down, entity not yet created, instrumentation
  deployed mid-window) → a **gap**: the line breaks, the region is visibly
  unknown. Plotting unmeasured as zero fabricates a crash; interpolating
  across it fabricates continuity. Both have the same geometry as truth,
  which is what makes them lies rather than glitches.
- The distinction requires the data pipeline to *transport* it — a series
  format that cannot represent "no observation" distinctly from "observed
  zero" has decided the question upstream, wrongly, for every chart it feeds.
  The decision point is often earlier than the rendering: a derivation that
  returns 0 for an empty denominator, or a value type that cannot be null, or
  a defensive "coalesce missing to zero" at the fetch edge each collapse
  unmeasured into zero before any surface gets a vote. The value type is the
  contract: a displayable metric is "number, or explicitly absent" all the
  way from derivation to pixel, and absent renders as a neutral mark (a dash,
  a dimmed placeholder) — never as 0, and never as a vanished tile.
- A gap large enough to dominate the window earns an explicit annotation
  ("no data collected before the 12th"), because a mostly-gap chart otherwise
  reads as a rendering bug.

## Degraded data: below the threshold of shape

Between "no data" and "a trend" is a band where data exists but cannot
honestly support the chart's claim:

- **Too few points.** Two points draw a line and a line reads as a trend, but
  two observations are an anecdote with a slope. Below a stated minimum,
  render the observations as points with the summary number, or state that
  the trend is still forming — do not draw the confident line.
- **A single dominating outlier** can flatten every other value into an
  unreadable baseline stripe. The honest moves are explicit: clip and
  annotate, or offer the rescale — never silently drop the point that is
  probably the most important one on the chart.
- **Partial coverage** — a series that starts mid-window renders from its
  start, with the uncovered region left visibly empty, not zero-filled and
  not stretched to fit.
- **Below the form's own structural minimum, the form draws nothing.** Some
  chart forms need a minimum number of members before their geometry exists
  at all: an enclosed-area form needs three axes, a slope needs two points, a
  distribution needs enough members to have a shape. Below that minimum the
  arithmetic stays perfectly valid and returns well-formed coordinates that
  happen to describe a degenerate figure — one vertex, a zero-area outline —
  so nothing throws, nothing is missing, and the surface renders an invisible
  mark over data that plainly exists. It is the worst pairing available: the
  chart looks broken *and* the numbers are unreadable, and falling through to
  the empty state would be worse still, because it asserts an absence that is
  false. The honest move is to **degrade to a form whose structural minimum is
  lower** — the same values as labelled magnitudes — carrying the same
  accessible contract and the same interactions, and to say in words why the
  form changed. A form's minimum is a property of the form, not of the data,
  so it is known before any data arrives and belongs in the component that
  owns the form rather than in each caller.

## A length encoding cannot draw its own zero

"Measured, zero — plot the zero" is a rule a line can keep and a length
cannot. A bar, a ring, an arc or a fill encodes value as extent, so a value of
zero is no extent: nothing rendered, in the same place where an unmeasured
value renders nothing and a failed render renders nothing. Three of the four
facts above collapse into one picture, and the collapse is uniquely hard to
notice because nothing is *missing* from the screen — there was never anything
there to miss. A line chart at least gives the reader a flat run on the floor
to look at; a magnitude glyph gives them clean empty space and no reason to
ask a question.

What draws the zero is the **track**: the unfilled channel, ring, or slot the
mark would have occupied, rendered whenever the mark is not. The track is what
turns "measured, and it is at the floor" from an absence into a visible
statement, and it is the reason bounded encodings should never be drawn as a
lone mark on bare background. A hairline of fill standing in for zero is not a
substitute — it is a small non-zero value, which is a different claim, and at
glyph size it is indistinguishable from a real one.

But the track alone does not finish the job, because an unmeasured value draws
exactly the same empty track. Geometry can carry magnitude and cannot carry
which of the four facts produced it, so the distinguishing mark sits beside
the geometry, not inside it: an explicit zero where the value is zero, a
neutral absence mark where there is no value, a failure statement where the
system could not look. A product that renders the empty track for both facts
and lets the reader infer the difference from context has made the same choice
as the surface that renders an axis around nothing — it just made it in a
smaller box.

The through-line of every rule here: a chart is trusted as measurement, so
the states around and inside it must be exactly as honest as the plotted
line. Absence, silence, failure, and zero are four different sentences; a
surface that renders them alike has chosen to let the reader guess which one
it means.
