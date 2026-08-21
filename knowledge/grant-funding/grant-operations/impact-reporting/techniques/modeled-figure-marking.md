---
layer: technique
type: technique
subject: impact-reporting
technique: modeled-figure-marking
status: forged
laws: [never-fabricate-a-figure, provenance-per-field]
shared_with: []
use_when: [publishing an estimate derived from a model rather than a count, designing impact dashboards or board reports, reviewing public impact claims for overclaiming]
---

# Modeled figure marking

Impact roll-ups need numbers that were never counted. "Jobs enabled" from
dollars divided by a cost-per-job constant; "CO₂ avoided" from activity times
an emissions factor; "economic value created" from a multiplier — all useful,
all legitimate, and all one presentation mistake away from fabrication. The
technique: **a modeled figure carries an approximation marker on the figure
itself, on every surface it appears, with the model's parameters
recoverable.** The marker is the boundary line between an estimate and a lie.

## Why the footnote is not enough

The instinctive treatment — print the number clean, disclose the methodology
in a footnote — fails because figures travel and footnotes don't. A dashboard
number gets screenshotted into a board deck, quoted in a newsletter, pasted
into the next proposal; at each hop the footnote falls away and the estimate
hardens into a fact. Attaching the marker to the formatted value itself (an
"approximately" glyph as part of the number: "≈4.2") means every surface that
renders the figure — internal dashboard, exported document, public page —
inherits the honesty automatically, because there is no unmarked form of the
number to copy. This is [provenance per field](../../../_laws.md#provenance-per-field)
compressed to one character: the figure discloses its own epistemic status at
the point of use.

One refinement: a value that already reads as approximate needs no extra
marker — "<1" is self-evidently a bound, and "≈<1" is noise. Mark to inform,
not to decorate.

## Rules for the model behind the marker

1. **One formula, one constant, one owner.** The conversion rate lives in a
   single named definition that every computation imports. Two surfaces
   applying two vintages of the constant produce two different "truths" with
   the same label — a self-inflicted credibility wound no marker repairs.
2. **State the parameters where the figure is explained.** "Modeled at $X
   per job-year" in the methodology note. A reader who can recompute your
   estimate can trust it; a reader who can't must take it on faith, which is
   exactly what the marker exists to avoid asking.
3. **Guard the denominator.** A rate-driven division must refuse a zero,
   negative, or non-finite rate and fall back to the sanctioned default — an
   infinity or a wild figure reaching a public surface is a fabricated
   figure produced by arithmetic
   ([never fabricate a figure](../../../_laws.md#never-fabricate-a-figure)).
4. **Feed the model only real inputs.** Dollars entering the conversion must
   themselves pass the ledger's countability rule (actually awarded,
   positive amount). A modeled figure over inflated inputs is marked *and*
   wrong — the marker covers the model's uncertainty, not the input's.
5. **Never launder the estimate through language.** "Enabled approximately
   4.2 job-years (modeled)" is honest; "created 4 jobs" from the same
   arithmetic is a fabrication with rounding as the accomplice. The verb
   must match the epistemics: modeled figures *enable*, *suggest*,
   *are estimated at* — they do not *create*, *deliver*, or *count*.

## Choosing what to model at all

A model is justified when the true count is unknowable at reasonable cost and
the estimate genuinely informs a decision or a story. It is not justified as
a magnifier — chaining multipliers until a modest grant "generates" an
impressive ripple is overclaiming with extra steps, and sophisticated funders
recognize the pattern instantly. Prefer one conservative, defensible
conversion over an impressive cascade; when a real count exists (actual hires
made, actual participants served), report the count and drop the model for
that figure entirely.

## When not to use it

Counted figures never take the marker — diluting it onto real counts teaches
readers it means nothing. Reports whose destination forbids estimates
(financial filings, audited statements) get actuals only; the modeled layer
is for impact storytelling surfaces, and the two must not blend. And when
the model's uncertainty is too wide to inform anything, publish no figure at
all: a marker discloses approximation, it does not license meaninglessness.
