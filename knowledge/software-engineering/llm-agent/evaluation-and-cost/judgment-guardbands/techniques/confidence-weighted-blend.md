---
layer: technique
type: technique
subject: judgment-guardbands
technique: confidence-weighted-blend
status: forged
laws: [derivation-names-recomputation, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [deciding how much of a model verdict lands in a score, evidence coverage varies by dimension, a model returns a confidence value]
---

# Confidence-weighted blend

Inside the guardband, a weight decides how much of the model's proposed
correction is actually applied. The technique's whole content is *what that
weight is a function of*. Get this wrong and the band still holds — the
damage is bounded — but the system spends its bounded budget in exactly the
wrong places, handing the model the most influence on the runs where it saw
the least.

## The shape

The published value is the computed value plus the model's delta scaled by an
effective weight, all of it clamped:

- a **base weight**, a declared constant, stating how much of the band the
  model may use under ideal evidence conditions;
- an **evidence-coverage factor** in the unit interval, describing how much
  of the material the model read was actually inspected;
- an **effective weight** derived from the two — in the simplest defensible
  form, their product — which is the number actually multiplied into the
  delta.

Everything about that derivation is written down where the weight is computed
([_laws: derivation-names-recomputation_](../../../../_laws.md#derivation-names-recomputation)).
An effective weight that appears in the record but cannot be recomputed from
the record's other fields is an unfalsifiable number, and a reviewer looking
at a surprising score will have no way to tell whether the blend or the
detectors produced it.

## Weight by coverage, in the direction people get backwards

The relationship is direct, and the first attempt almost always inverts it:
**low coverage damps the model and leans harder on the deterministic
signals.**

The reason is that coverage is not symmetric between the two contributors.
The backbone is coverage-robust by construction — it reads structured,
enumerable facts, and a truncated or rate-limited run degrades it far less
than it degrades a model reading sampled excerpts of the artifact. When
coverage falls, the model is extrapolating from a fragment. That is when its
reading is least grounded, and it is also when any planted text inside the
sample makes up the largest share of what it saw. Damping is the correct
response on both counts.

The tempting inversion — "the computed number is weak here, so let the model
speak" — applies a coverage argument to the wrong contributor. It reaches the
opposite conclusion by assuming the model saw everything the detectors
missed, which is exactly what a low-coverage run means it did not.

Watch for the failure this scaling was introduced to fix. A coverage figure
that is computed, displayed, and never fed into the arithmetic is the common
intermediate state: a half-seen artifact then blends the model with the same
weight as a fully-inspected one, and the report shows a precision it did not
earn. Coverage that is reported but not spent is decoration.

Three boundary cases need explicit policy rather than arithmetic:

**Full coverage must reproduce the calibrated path exactly.** The scaling is
introduced so that thin runs behave differently, not so that every run does.
If the effective weight at coverage 1 is not identical to the base weight,
you have silently re-tuned the well-understood case while trying to fix the
degraded one.

**Coverage that could not be computed is not zero coverage.** A missing or
broken estimate defaults to the calibrated path and records that it did. Any
other choice damps every score toward the backbone for a reason nobody
recorded, and it will be discovered as a mysterious cohort of unusually
conservative results
([_laws: failure-not-empty-success_](../../../../_laws.md#failure-not-empty-success)).

**Coverage at zero collapses the model's contribution to nothing.** That is
the safe direction and needs no special case — but the *dimension* may still
be unpublishable, and that decision belongs to the backbone's
measured-nothing versus could-not-measure distinction, not to the blend.

One knob-separation rule holds throughout: coverage moves the *weight*, and
the audit channel moves the *band*. "The evidence is thin" and "the evidence
is wrong" are different claims with different remedies, and a design that
routes both into one number can no longer tell them apart in its own record.

## Do not weight by the model's stated confidence

A model's self-reported confidence looks like the natural input here and is
the wrong one, for three independent reasons.

**It is not calibrated.** Judgment models render verdicts in a uniformly
assured register; the stated number correlates weakly with correctness and
tends to compress into a narrow high band regardless of the actual difficulty
of the case.

**It is model output.** It arrives through the same channel as the score, so
anything that can influence the score can influence the confidence. Scaling
the model's authority by a value the model supplies gives away the dial that
the whole guardband exists to hold. Where a guardrail's threshold is itself
model-supplied, an attacker's job reduces to writing a number.

**It measures the wrong thing.** Confidence, at best, describes the model's
certainty about its own reading. The blend needs to know how much the
*deterministic layer* managed to establish — a fact about the instrument,
which the instrument itself reports.

If you collect a confidence value anyway — it is legitimately useful as a
review-triage signal and as a record field — keep it out of the arithmetic
that produces the number.

## Guard the trust boundary on any model-supplied number

Every numeric field that arrives from the model crosses a trust boundary and
is validated at the edge, before it reaches any arithmetic. The required
checks are unexciting and non-negotiable: it is a number; it is finite; it
falls in its declared range. A not-a-number value is the dangerous one,
because it does not throw — it propagates silently through every subsequent
operation, turning an entire score sheet into non-values, and it surfaces
only in the display layer as blanks, long after the provenance is gone.

Reject at the edge, substitute a declared default, and record the rejection.
A rejected value that leaves no trace is indistinguishable from a value that
was never sent, and you will want to know which model version started sending
malformed confidences.

**Bind the sanitized value once, and let the math and the display share that
binding.** The half-fix is the dangerous one: guard the value where the
arithmetic reads it, keep writing the raw value into whatever is persisted
and rendered, and you get a correctly-blended score sitting next to an
impossible confidence figure — a not-a-number that serializes to a null and
blanks every percentage and threshold check downstream, or an out-of-range
estimate rendering as an inspection percentage above one hundred. The
arithmetic clamped; the display did not. One sanitized binding, two
consumers, and they cannot drift apart again.

## Decision rules

- **When coverage is low, damp the model** — it read less, the backbone did
  not.
- **When coverage is full, the effective weight equals the base weight
  exactly** — verify this, it is the regression the scaling most easily
  introduces.
- **When coverage cannot be computed, use the calibrated default and record
  that you did** — never treat it as zero.
- **When a model-supplied number fails validation, use the declared default
  and record the rejection** — never propagate, never silently coerce.
- **When a sanitized value exists, no consumer reads the raw one** — the math
  and the rendered figure come from the same binding.
- **When you want to raise model influence globally, raise the base weight,
  not the band.** The weight governs typical behaviour; the band governs the
  worst case. Conflating them means every tuning nudge is also a security
  change.

## When not to use this

Blending is inappropriate when the two contributors measure different things.
If the detectors measure presence and the model measures quality, averaging
them produces a number that is neither — report them as two dimensions and
let the composite decide. Blending also has nothing to offer when the
backbone has no per-dimension coverage signal: without coverage, the
effective weight collapses to the base weight, which is a fixed-weight blend
and should be called that rather than dressed up as adaptive. Build the
coverage signal first; the adaptive weight is worthless without it.
