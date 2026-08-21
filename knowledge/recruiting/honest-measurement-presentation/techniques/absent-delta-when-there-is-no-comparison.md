---
layer: technique
type: technique
subject: honest-measurement-presentation
technique: absent-delta-when-there-is-no-comparison
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [adding a change indicator to a metric tile, the first period of a series, a metric definition changed mid-window, colouring a direction of change]
---

# No comparison, no delta

The change chip — a small arrow, a number, a colour, sitting under a metric —
is the densest claim on a measurement surface. In about twelve pixels it
asserts four things: that a comparison period exists, that it is comparable to
this one, that the difference exceeds noise, and, through its colour, that the
difference is good or bad. Most implementations assert all four and check
none, because the chip is built as a formatting concern.

The technique is a refusal. **When any of the four conditions fails, nothing
renders where the chip would be.** Not a zero chip. Not a grey chip reading
"0%". Not a chip-shaped element containing a dash. The absence of the element
is the honest rendering, because the chip's mere presence is the assertion.

## When there is no comparison

- **First period.** No predecessor exists. The chip that renders "+100%"
  against a prior of nothing is the canonical version of this bug.
- **Unmeasured prior.** The prior period has no measurement — not a zero, an
  absence. Computing a change against it is the dash-as-zero failure in a new
  costume ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
- **Zero prior.** A percentage change from zero is undefined. Render an
  absolute movement ("+4 hires") or nothing; never a percentage, never an
  infinity.
- **Definition change.** The metric's denominator, cohort basis or window
  moved between the two periods. The numbers exist and are not comparable,
  which is the most dangerous case because nothing looks wrong.
- **Incomparable window lengths.** A partial current period against a complete
  prior one is a guaranteed decline. Either compare like periods, compare
  period-to-date against period-to-date, or render nothing.
- **Immature cohort.** The current period's candidates have not had time to
  reach the outcome being counted; the figure will rise on its own and the
  delta measures elapsed time, not performance.
- **No baseline was ever taken.** The strongest case and the one product teams
  most want to route around: a "% improvement versus before" claim where
  nothing measured *before*. There is no prior period to find, only a
  counterfactual, and a counterfactual is a marketing number with a decimal
  point. Refuse the figure outright and say what you do measure instead.

There is a fourth chip state that is *not* a refusal and must stay
distinguishable from one: **measured, and unchanged**. Both sides exist, both
are measured, the difference is zero. That is a finding, and it renders — as a
neutral, uncoloured "no change" label, never as a coloured zero and never as
the same nothing that means *no comparison*. Three states: a movement, a
measured flat, and nothing at all.

## Exclude by construction, not by suppression

The cleanest version of this technique does not render-and-suppress; it never
forms the comparison. Only **cohort-shaped** figures have a prior-window
analogue — counts, rates and durations that are meaningful for a past group of
candidates. **As-of-now** figures do not: the current age of active candidates,
the live bottleneck, the present distribution across stages. Their "prior
value" is not a worse measurement, it is a category error, and the comparison
object should simply not exist for them.

Deciding this at the metric layer, and naming which figures are in the diff and
which are deliberately out, is what prevents the yearly re-litigation where
somebody adds a chip to a live gauge because every other tile has one.

## The procedure

**1. Compute the comparison as a resolved object, not as a subtraction.** The
metric layer returns either a comparison — prior value, prior basis, period
label, comparability flag — or nothing at all. The surface renders a chip if
and only if it received one. A surface that receives two numbers and subtracts
them cannot know whether it was allowed to.

**2. Name the comparison period on the chip or immediately beside it.** "vs
prior 30 days", "vs same period last year". A bare arrow leaves the reader to
assume, and different readers assume differently
([a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

**3. Separate direction from valence.** The arrow is direction, which is a
fact. The colour is valence, which is a judgement and needs the same licence
as any other verdict colour — a declared polarity for the metric, or a goal
somebody set. Time-to-hire falling is usually good and is bad when a stage was
skipped; application volume rising is good until it is a spam wave. Where
polarity is not declared, the chip shows the direction and takes no colour.

**4. Suppress the chip when either side is too thin.** A change between two
small samples is noise rendered as news. The claim-side discipline on small
samples decides the floor; this technique honours it by dropping the chip
rather than by shrinking its font.

**5. Prefer absolute movement where the base is small.** "3 → 5 offers" is
true and readable; "+67%" from the same numbers is technically true and
actively misleading. Below a declared base, render counts, not percentages.

**6. Round the chip and the value consistently.** A tile reading 31% beside a
chip reading "+0.4pts" where the prior displayed as 31% too invites the reader
to conclude the panel is broken. Compute the delta on the displayed precision,
or state more precision on both.

## Points versus percent

Two different quantities share the same glyph and are constantly confused: a
rate moving from 30% to 33% has risen **3 percentage points** and **10
percent**. On a hiring dashboard the second is almost always the wrong one to
show and the easier one to compute. Fix the convention once — percentage
points for rates, percent for counts — label the unit on the chip, and hold it
across every surface and export.

## Decision rules

- **When a series has gaps**, a delta may only bridge measured points, and the
  chip must name the actual comparison period rather than "prior period" when
  the immediate prior was skipped.
- **When a filter changes the population**, the comparison must be recomputed
  over the same filter. Comparing a filtered current period against an
  unfiltered prior is the most common silent incomparability in a dashboard
  with saved views.
- **When a goal exists**, distance-to-goal is usually a better chip than
  period-over-period change, because it is the claim the reader wants and it
  carries its own benchmark.
- **When the chip is suppressed**, do not reserve the space with a placeholder
  glyph. Reserve the layout space if the grid needs it; render nothing in it.

## When not to use this

- **Where the surface is explicitly a comparison tool** — a period-versus-
  period report the reader constructed — the comparison is the subject and the
  reader chose both sides. The comparability checks still apply; the
  render-nothing default does not, because an empty comparison report needs an
  explanation instead.
- **In a real-time operational counter** where "change" means since page load
  and the reader knows it. Label it as such; it is not a period comparison.
- **Where the delta is the metric.** Net headcount change, pipeline growth —
  these are measured quantities in their own right and are rendered as values,
  under the rules for values, not as chips under something else.
