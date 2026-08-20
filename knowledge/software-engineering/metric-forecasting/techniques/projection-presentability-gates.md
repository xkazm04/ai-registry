---
layer: technique
type: technique
subject: metric-forecasting
technique: projection-presentability-gates
status: forged
laws: [gate-sees-target, one-validation-door]
shared_with: []
use_when: [deciding whether a trend line may be displayed, explaining why no forecast is shown, guarding a forecast surface against thin histories]
---

# Projection presentability gates

Before any fit is computed, one question is answered: **is this history
allowed to produce a visible projection at all?** The gate that answers it is
the highest-value component in the subject, because a projection that should
not have been drawn is not a small error — it is read, quoted, and planned
against.

## Point count is necessary and badly insufficient

"At least N observations" is the first rule everyone writes and it fails in a
predictable way. Five samples taken across one afternoon — someone running a
scan repeatedly while tuning a configuration — satisfy any point-count
threshold. The slope fitted across them is per-day arithmetic over a span of
hours, so an hour of fiddling extrapolates to a confident annual trajectory.
A slope read off a one-day span and extrapolated to a target date is noise
wearing a lab coat.

The gate therefore tests **two independent dimensions**, and both must pass:

- **Enough observations** — a minimum count, above the degenerate floor where
  fit confidence is meaningless. Three is the arithmetic minimum; four or five
  is the practical one.
- **Enough calendar span** — the first and last observation must be separated
  by a minimum number of days, chosen so the slope's unit (per day) is
  actually exercised by the data. A week is a defensible floor for a metric
  sampled weekly; a day is not a floor at all.

A third dimension applies wherever the metric's definition can change beneath
the series: **one definition across the span**. A reweighted rubric, a changed
input set, or a new scoring version means earlier points are not on the same
axis as later ones, and a fit across that seam measures the redefinition
rather than the work. Treat a definition change as a series boundary and gate
the forward segment on its own count and span.

Note what the gate must read to do this: the **actual points the fit consumed**
— after same-day collapsing, after any definition-boundary cut — not the raw
row count, not a cached "samples" counter, not the length of the series before
empty buckets were dropped. The distinction is not academic: forty
observations gathered across two days is a two-point fit, and a gate reading
row count sees forty and waves it through. A gate that counts a proxy passes
exactly when the proxy and the target diverge, which is
[the moment the gate existed for](../../_laws.md#gate-sees-target). The clean
construction is for the fit itself to report the count and span it used, and
for the gate to read those fields rather than recount the input.

## The refusal is a designed output

A gate that returns a bare boolean pushes the hard part onto every consumer.
Each surface then invents its own explanation of why there is no line, and the
explanations diverge: the chart says "not enough data", the digest omits the
section silently, the export prints an empty column, the generated narrative
claims the metric is stable. One history, four different accounts of it.

The refusal therefore carries **copy-ready prose naming the missing
evidence**: how many observations exist, how many are needed, how many days
they span, and how many days are needed. "Two scans across 1 day — a trend
needs at least four scans spanning 7 days" tells a reader exactly what would
make the projection appear, which converts a dead end into an instruction.

Structurally, this makes the gate the **single door** every forecast surface
passes through: one place computes presentability, one place phrases the
refusal, and every consumer either receives a projection or receives the
reason there isn't one. Scattering the check across call sites is the same
mistake as scattering validation — it is
[the check minus whichever site is added next quarter](../../_laws.md#one-validation-door),
and the site added next quarter is always the one on the executive summary.

## Gate first, then fit

Ordering matters for more than efficiency. If the fit runs first and the gate
filters afterwards, the fit's outputs — slope, confidence, estimated date —
exist in memory and in logs, and they leak: into a debug panel, a cached
response, a downstream consumer that reads the field without checking the flag
beside it. A refused projection should have **no numbers to leak**. Compute
presentability, and only on a pass compute anything else.

The same ordering makes the refusal cheap, which matters on surfaces that
evaluate many metrics at once: most of them will refuse, and refusal should
cost a count and a subtraction.

## Decision rules

- **When count passes but span fails, refuse.** This is the case the gate
  exists for; it is also the case reviewers most often argue about.
- **When the thresholds are tuned, tune them in one place.** They are part of
  the door, not per-surface configuration.
- **When a definition change sits inside the span, cut the series at it.**
  Then re-gate the forward segment; it will often refuse, correctly.
- **When refusing, say what is missing and what is needed.** Numbers, in
  words, ready to render.
- **When a surface really cannot show prose, it shows nothing** — never a
  fallback flat line, never a zero slope, never last period's projection.

## When not to use this

- **On a series that is not being extrapolated.** Displaying the history
  itself needs no presentability gate; a two-point history is a perfectly
  honest two-point chart. The gate governs the *projected* segment only.
- **As a substitute for fit confidence.** The gate answers "may we fit"; it
  says nothing about whether the resulting line describes the points. Both
  checks run, in that order.
- **Where a domain guarantees regular sampling and a long history** — a
  metric emitted hourly for years — the span dimension is trivially satisfied
  and the gate reduces to a freshness check. Keep it anyway; sampling
  guarantees lapse quietly.
