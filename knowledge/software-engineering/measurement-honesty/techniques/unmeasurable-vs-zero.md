---
layer: technique
type: technique
subject: measurement-honesty
technique: unmeasurable-vs-zero
status: forged
laws: [failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [a detector returned nothing and you must decide what that means, designing the return type of a signal collector, a subject disputes a zero in its report]
---

# Unmeasurable vs. measured zero

A detector returned nothing. Exactly one of two facts is true, and the
detector's return type usually cannot express the difference:

- **Measured zero** — the detector could see the subject, looked, and there was
  none of the thing. A finding. Actionable, defensible, worth reporting in bold.
- **Unmeasurable** — the detector structurally cannot see this subject's
  instance of the thing, for a reason that can be named. Not a finding. Not the
  subject's fault. Not eligible to lower any number.

Rendered, the two are the same glyph. Downstream, they are opposite verdicts.
This is [failure-not-empty-success](../../_laws.md#failure-not-empty-success)
at the granularity of a single signal: the instrument that could not run must
not produce the same value as the instrument that ran and found nothing.

## The procedure

1. **Type the signal as three-valued at the source.** The collector returns
   *value*, *zero*, or *unmeasurable-with-reason*. A collector that returns a
   plain number cannot participate in this discipline, and no amount of
   downstream care recovers what its return statement already threw away. The
   type change is the first move of any retrofit, not the last.
2. **Attach the reason, not just the flag.** *Unmeasurable* carries a short
   machine-readable cause — the named mechanism (below). A bare "unknown" is
   almost as lossy as a zero, because nothing downstream can decide whether it
   is permanent (exclude from this subject's denominator forever), pending
   (retry), or an incident (page someone).
3. **Apply the conservative test.** Classify as unmeasurable **only** when a
   concrete invisibility mechanism is present in the evidence. Absence of
   evidence is not the mechanism; the mechanism is a positive signal that the
   thing exists somewhere the detector cannot follow.
4. **Exclude, renormalize, disclose.** Unmeasurable inputs leave the arithmetic
   entirely — see
   [renormalize-over-present](renormalize-over-present.md) — and appear in the
   output as a distinct "not measured — *reason*" row, never as a zero bar and
   never as a silently omitted row a reader will not miss.
5. **Keep measured zeros loud.** The point of the escape hatch is to make the
   remaining zeros *credible*. A zero that survives the test is a stronger
   claim than a zero from a system with no test at all.

## The named-mechanism rule, and why it is deliberately stingy

The whole technique turns on one decision rule:

> **When the evidence names a concrete mechanism by which the signal would be
> invisible to this detector, classify unmeasurable. Otherwise the zero
> stands.**

Concrete mechanisms are things like: the work is declared to happen in a system
this collector has no access to; the configuration explicitly delegates the
step elsewhere; the subject's declared structure places the artifact outside
the scanned scope; the source truncated the listing and said so. Each is a
positive statement found in the evidence, not an inference from silence.

The stinginess is the point, and it is easy to lose. A generous rule — "if we
did not find it, maybe we could not see it" — inverts the technique into a
laundering machine: every genuine failure becomes an instrument problem, the
report loses the ability to say anything negative, and the number becomes an
elaborate way of writing *no comment*. There is a reliable smell for having
crossed this line: **if the unmeasurable rate rises when subjects get worse,
the rule is too generous.** For an honest rule the rate is roughly independent
of subject quality, because invisibility is a property of the topology between
detector and subject, not of the subject's diligence.

Two supporting constraints keep the rule from drifting:

- **Pattern-matched mechanisms stay narrow and are reviewed as policy.** A rule
  that recognizes invisibility by matching declarations or configuration text
  is a piece of policy with real consequences; widening the match to catch one
  complaint from one subject silently excuses a whole class of genuine zeros.
  Widen only with an example of a *correct* exclusion the current rule misses.
- **The escape hatch is one-directional.** Where the invisibility claim comes from
  a judgment channel — a reviewer, a model, an appeal — that channel may only
  *remove* the signal from the arithmetic. It must never be able to *raise* a
  measured value. The asymmetry is what stops the hatch from becoming a backdoor
  for talking a number up: the worst a successful claim can achieve is "not
  counted", which is bounded, auditable, and visible in the coverage
  disclosure. A hatch that can add points has no such ceiling.
- **The mechanism is disclosed to the subject.** "Not measured — the pipeline
  declares this step in an external system" is checkable by the subject, and a
  subject who can check the exclusion can also dispute it. That feedback loop
  is what keeps the rule calibrated; a silently applied exclusion never gets
  corrected.

## Distinguishing the flavors of absence

*Unmeasurable* is one of three absences, and they carry different next actions:

| flavor | meaning | denominator effect | next action |
| --- | --- | --- | --- |
| unmeasurable | structurally invisible here | removed for this subject | none — it is not a gap |
| not yet measured | instrument has not run | pending; excluded meanwhile | run it |
| measurement failed | instrument ran and errored | excluded; run is suspect | fix the instrument |

Collapsing the last two is the expensive one: a broken collector that presents
as *pending* is a queue nobody drains, and the number it feeds decays for
months without anyone being on the hook. The failed case must reach whoever
owns the instrument, and — where enough of them accumulate — must escalate to
the completeness predicate in
[incomplete-not-verdict](incomplete-not-verdict.md).

## When not to use it

- **When the zero is the product.** For a signal whose entire purpose is to
  detect the absence of something (no unresolved critical findings, no expired
  credentials), an unmeasurable escape hatch weakens the only claim the signal
  makes. Here the correct handling of an unmeasurable input is to fail the
  *run*, not to soften the *finding*.
- **When you cannot name the mechanism yet.** Shipping the three-valued type
  with no principled classifier produces uniform "unmeasurable" and a report
  that says nothing. Ship the type, keep the rule narrow, and widen it one
  named mechanism at a time.
- **When the audience cannot act on the distinction.** A one-line summary for a
  reader who will never open the breakdown gains nothing from a third state;
  what that reader needs is the coverage disclosure from
  [renormalize-over-present](renormalize-over-present.md) — one number that says
  how much of the intended measurement actually happened. The three-valued type
  still belongs underneath: it is what makes that coverage number computable at
  all, per [count-carries-predicate](../../_laws.md#count-carries-predicate).
