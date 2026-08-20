---
layer: technique
type: technique
subject: metric-forecasting
technique: horizon-caps-and-flat-bands
status: forged
laws: [one-authority-per-vocabulary]
shared_with: []
use_when: [bounding how far a projection may claim, deciding when a slope counts as flat, suppressing far-future estimates]
---

# Horizon caps and flat bands

A straight line is infinite in both directions. A trustworthy forecast is not.
Two bounds close it: a **floor on slope magnitude**, below which movement is
noise, and a **ceiling on distance**, past which any date is withheld. Both
are named constants with exactly one definition; both fail in the same way
when they are absent, which is that the arithmetic keeps producing plausible
output long after it stopped meaning anything.

## The flat band

Below some slope magnitude, a metric is not moving — it is being measured. A
slope of 0.003 points per day is indistinguishable from rounding, sampling
jitter, and the ordinary wobble of a composite score, and yet it will happily
produce a crossing estimate eleven years out, formatted as a date.

Define a band and check it **before** any crossing solve:

- Inside the band, the verdict is **flat**. Not "rising slowly", not a
  distant date, not a zero. Flat is a state with its own rendering.
- Outside it, the direction is real enough to report and the crossing solve
  may run.

Choosing the band: it should be a little larger than the metric's own
measurement noise over one sampling interval. If a re-scan of unchanged
material moves the score by up to half a point, a per-scan slope under half a
point is not signal. Where that noise is unknown, the practical starting point
is the smallest change the surface can even display — a slope that cannot move
the rendered value within the visible horizon is flat by definition.

The band is one constant, referenced everywhere. "Flat" meaning one thing on
the chart and another in the digest is
[one vocabulary with two hand-maintained definitions](../../_laws.md#one-authority-per-vocabulary),
and it drifts the first time someone tunes one of them. The same applies to
the band's sign symmetry: rising and falling use the same magnitude, or a
metric is judged stable in one direction and moving in the other.

## The horizon cap

Past some distance, a linear extrapolation of an engineering or product metric
is fantasy rather than planning. A year is a defensible cap and is roughly
where the reasoning bites: over that span the team composition, the codebase,
the metric's definition, and the priorities driving it will each have changed
more than the slope has. The line is still arithmetically valid; it has simply
stopped describing anything a reader can act on.

Past the cap, the output is **"beyond the forecast horizon"** — not the date,
not a clamped date at the cap, not a range ending at the cap. Emitting the
capped date is the tempting compromise and it is wrong: it asserts a crossing
at exactly the boundary the cap was drawn at, which is a claim nobody made.

This is not a rendering nicety. A far-future date is **more** dangerous than
no date, because it reads as a plan: it lands in a roadmap, it becomes the
answer to "when", and it survives long after the three points behind it were
superseded. No date at all provokes the correct next question — what would we
have to do to get there — which the required-rate output of
[pace-against-a-deadline](pace-against-a-deadline.md) answers directly.

Where a horizon-exceeding estimate still needs to convey something, convey the
*rate*, which is honest at any distance: "improving about 0.4 points per
month; at that pace the target is more than a year out." The rate is measured;
the date would have been invented.

## The cap on what is shown is not the cap on what is reasoned with

One subtlety separates a good implementation from a naive one. A single
horizon constant applied everywhere destroys information the verdicts need: if
a crossing four years out is discarded at the source, a deadline comparison
downstream cannot distinguish "reaches the target long after the deadline"
from "no estimate at all", and both collapse into the same neutral output —
so a hopelessly behind goal reads exactly like a brand-new one.

Two bounds, then, with different jobs. A **generous derivation horizon** keeps
far-future crossings computable, so a pace comparison can conclude "behind"
with confidence. A **tight display horizon** governs what may be printed as a
date. The far number exists, drives the verdict, and never reaches the screen
as a date; the screen gets the verdict and the rate.

Where a system has only one of the two, prefer the generous derivation horizon
plus a display rule, not the tight cap alone — a suppressed estimate is
recoverable at the presentation layer, a discarded one is not.

## Both bounds are checks, not clamps

The distinction decides the shape of the code. A clamp transforms a value and
lets it continue downstream, where nothing can tell it was clamped. A check
**changes the kind of the result** — from an estimate to a different, explicit
state — so no consumer can accidentally treat it as a date. Concretely: the
result type has variants for flat and for beyond-horizon, and neither of them
carries a date field for a template to reach into.

Order them with the flat band first: a slope inside the band would otherwise
produce a horizon violation, and "flat" is the more informative of the two
answers.

## Decision rules

- **When the slope is inside the band, report flat and skip the solve.**
  Before the division, not after formatting.
- **When an estimate exceeds the cap, withhold the date and report the rate.**
- **When tempted to clamp to the cap, don't.** A date at the boundary is a
  claim the data does not make.
- **When the band or cap needs tuning, tune the one definition.** Both are
  shared constants, not per-surface parameters.
- **When a metric's sampling noise is measurable, derive the band from it**
  rather than guessing; a re-measurement of unchanged material is the cheapest
  noise experiment available.

## When not to use this

- **Fast-moving metrics with dense sampling.** A metric sampled many times a
  day with real movement may warrant a much tighter band and a shorter
  horizon; both bounds are domain constants, not universal ones. The technique
  is *having* them, not the specific numbers.
- **Contractual or physical deadlines.** When the question is "will we make
  the audit date in fourteen months", the horizon cap must not silently
  suppress the answer; report that the deadline is beyond the reliable
  horizon, explicitly, rather than omitting the goal.
- **Backward-looking statements.** The bounds govern projections. A historical
  statement about the last two years is measured, not forecast, and neither
  bound applies to it.
