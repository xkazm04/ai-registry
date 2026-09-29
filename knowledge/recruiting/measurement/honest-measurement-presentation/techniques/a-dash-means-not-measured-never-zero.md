---
layer: technique
type: technique
subject: honest-measurement-presentation
technique: a-dash-means-not-measured-never-zero
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds]
shared_with: []
use_when: [formatting a metric value for display, a denominator is zero, a series has gaps, a benchmark figure is unavailable]
---

# A dash means not measured, never zero

Three states reach a formatter: a measured value, an absence of measurement,
and a value that does not apply. Most formatters accept one input and return
one string, so the second and third states arrive as `null`, `undefined`,
`NaN` or a defaulted `0`, and the surface says *zero*.

Zero is a measurement. Saying it where nothing was measured is a claim about
the world that nobody made — [absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence) —
and on a hiring surface it is a claim that usually costs someone something: a
source killed for producing no hires when attribution was never wired, a stage
declared dead when a renamed column stopped mapping to it, a slice reported as
zero representation when the field was optional.

## The procedure

**1. Carry the state to the surface; do not let it collapse upstream.** The
value that reaches a renderer is a pair — a state and, when the state is
*measured*, a number. A bare nullable number is not enough, because it cannot
distinguish *not measured* from *not applicable*, and the two render
differently and read differently. The discipline that decides which state a
figure is in is the metric layer's; **showing** the state beside the value is
this surface's job, and it is the whole job.

**2. One mark, one meaning, everywhere, and the meaning written down.** Pick
the not-measured mark once and use it in tiles, tables, charts, tooltips,
exports and digests. Two marks for the same state, or one mark doing double
duty for *unmeasured* and *not applicable*, defeats the technique: the reader
learns the vocabulary from the surface and must be able to trust it.

The dash is not a convention readers bring with them, and official tables use
it for the opposite fact. In Czech Statistical Office tables a dash in place of
a number means the event did not occur, and a dot means the figure is not
available. German official tables gloss the dash as "nothing there, exactly
zero". Eurostat prints it for *not applicable*, and Statistics Canada used an
em dash for nil until it replaced it with 0. A reader trained on those tables
reads a bare dash as a zero, which is the error this technique exists to
prevent. So the surface cannot lean on the glyph. It states the mark's meaning
in words: a legend or a note on the surface, a reason where there is room
(step 5), and an accessible name on the cell. The accessible name is not
optional. Common screen readers read straight through an em dash or only
pause on it, so a bare dash tells a screen-reader user nothing. The UK Government Analysis
Function stopped recommending symbols in tables for that reason; it uses
bracketed codes ([x] unavailable, [z] not applicable, [c] confidential) and
keeps 0 for a true zero. Where a cell has room for a word ("not measured",
"neměřeno"), the word beats any mark.

**3. Zero renders as zero.** The mirror failure is equally dishonest.
Rendering a measured zero as a dash hides a real finding: a stage that truly
converted nobody this month is information, and a source that truly produced
no hires after being properly attributed is a decision-grade fact. Preserving
the distinction in both directions is the point.

**4. A zero denominator produces *not applicable*, not a zero and not an
error.** No candidates entered the stage, so there is no rate. Not 0%, which
asserts total failure. Not infinity or `NaN`, which leak the arithmetic. And
not the not-measured mark either: nothing went unmeasured, the rate does not
exist. Statistics offices keep the two apart (a dot and a cross in Czech
tables, a colon and a dash at Eurostat, [x] and [z] in the UK), because "we do
not track this" and "there was nothing to divide" send the reader to different
fixes. Guard the ratio at the point of computation and emit the
not-applicable state.

**5. Give the dash a reason wherever there is room.** A tooltip, a caption, a
row note: "no transitions recorded in this window", "attribution not
configured for this source", "field optional before March". A bare dash
generates the support conversation the reason would have prevented, and a
reader who cannot tell *broken* from *empty* assumes broken.

**6. Gate on finiteness, not on null.** This is the rule that catches the
cases a null check misses, and they are the ones that reach production. The
minimum of an empty set is positive infinity; a ratio built from it is not a
number; a scale built from a single value divides by zero. None of those are
null, so a `value != null` guard passes them straight through to the screen —
and to the accessible name, where a screen reader announces the literal words.
One predicate, used everywhere, asking whether the value is a finite number.
Every colour scale, every axis and every percentage helper takes the same
guard, because a non-finite input that reaches a colour function typically
throws and takes the whole panel down with it.

**7. Preview an empty surface with dashes, never with plausible figures.** A
first-run state that fills the layout with sample numbers to show what the
panel will look like is a fabricated measurement, and readers do not reliably
notice the "example" label. Preview the shape with literal dashes: the layout
is demonstrated, the vocabulary is taught, and nothing is claimed.

**8. Exclude unmeasured points from aggregates and state the base.** An
unmeasured month is not a zero month, so it does not enter an average, a
total, or a trend line. In a time series the gap is a gap — the line breaks or
the points render hollow; it never draws through the missing period at zero,
which paints a crash that did not happen. Where any aggregate excluded
points, say how many it was computed over.

## The hide-versus-dash decision

Not every absence deserves a dash. The rule:

- **Show the dash** where the reader is entitled to expect a number and would
  otherwise be misled about what was measured. A metric the panel promises, a
  row in a table whose other rows have values, a stage in a funnel.
- **Hide the element entirely** where the figure is an optional enrichment the
  product may or may not have — an external market figure, a peer benchmark,
  a third-party estimate. A tile reading "market median: unavailable" is worse
  than no tile: it names an absence the reader was not thinking about, invites
  them to imagine the missing figure, and makes a working surface look broken.
  Say only what the record holds
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)) —
  and where the record holds nothing and nothing was promised, say nothing.

The test is whether the absence changes what the reader should conclude about
the *measured* figures around it. If it does, dash. If it does not, hide.

Hiding has a grammar of its own, and it is a ladder rather than a switch. In
descending order of preference: **demote to a fact you do have** (a tile whose
pay figure is missing leads with the opening count instead); **state the part
you have and mark it partial** (a floor with no ceiling reads "from X", never a
bare figure that a reader will take for a midpoint); **drop the clause** from
a sentence rather than publishing a zero into it; **drop the element**, keeping
its layout space so the grid does not reflow; **drop the group entirely** where
nothing in it is measured. What is never acceptable is a shape rendered with a
missing value inside it — an empty legend, a scale with no range, a chip with
nothing to compare.

**The ladder is for whole elements, never for points inside a chart.**
Removing a missing point from a series, or imputing one, is the hide rule
applied at the wrong grain. In a controlled study, removing missing values
lowered perceived data quality and confidence, and produced wrong answers where
the gap broke the chart's visual continuity; highlighting the missing values
was rated higher than downplaying or removing them (Song & Szafir 2018).
Inside a chart, mark the gap: a break in the line, a hollow point, a neutral
fill for a region with no figure. A missing value never takes a position on a
colour scale, because a mid-scale default reads as an ordinary value.

**A withheld figure is not an absent one.** Where a figure exists but a sample
policy says it must not be published as a headline, do not null it on its way
to the surface — that laundering destroys the invariant this whole technique
rests on, that a missing value always means *no data* and never *we chose not
to say*. Pass the real value with a state saying it is thin, and let the
surface label it. Two different silences that render identically are one
silence, and the reader cannot tell which they are looking at.

## Decision rules

- **When a formatter can receive both a fraction and a percentage**, guard the
  domain and refuse rather than guess. A confidence arriving as 85 where 0.85
  was expected renders as a wildly wrong figure with nothing to signal it.
- **When a chart library needs a number for every point**, do not feed it
  zeroes for gaps. Feed it nulls and configure the break, or split the series.
  A flat line at the axis is the most convincing lie on a dashboard.
- **When an export has no dash convention**, write the reason text, not an
  empty cell — an empty cell in a spreadsheet becomes a zero the moment
  somebody sums the column.
- **When a filter or a threshold hides rows**, count rows-below-the-floor and
  rows-unmeasured separately. Conflating them lets a performance filter
  quietly discard the unmeasured.

## When not to use this

- **Where the count is genuinely a count.** "0 open requisitions" is a
  measured zero and belongs on screen as a zero; dashing it would hide a fact
  the reader needs.
- **In an internal throughput monitor** whose consumers are engineers who know
  the nulls were filtered upstream — and even there keep the base visible, so
  a figure that escapes into a slide still carries what it was computed over.
- **Where a single dash would replace an entire empty surface.** A dashboard
  with no data at all needs an empty state that explains and offers the next
  action, not a grid of dashes; the no-data answer for a whole panel is a
  different craft problem from the no-data answer for one cell.
