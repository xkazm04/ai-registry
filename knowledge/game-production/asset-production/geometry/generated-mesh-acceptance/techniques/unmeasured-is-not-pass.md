---
layer: technique
type: technique
subject: generated-mesh-acceptance
technique: unmeasured-is-not-pass
status: forged
laws: [unmeasured-is-not-a-pass, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [designing a gate's output contract, a dashboard is greener than the pipeline, a metric extractor is optional or versioned]
---

# Unmeasured is not a pass — as an output contract

The law says an unmeasured thing must render as unmeasured. This technique is the
*mechanical* half: how a scorecard's own output shape lets a consumer read which
properties were examined and which were not, without knowing anything about the extractor
that produced the metrics.

## The three states, and why two of them are not numbers

Every property on a card is in exactly one of three states, and each must be a distinct,
type-visible value:

- **Measured and compliant** — a value plus its basis.
- **Measured and defective** — a finding with a code and a severity.
- **Not measured** — no finding *and* an explicit marker. This is the one that gets
  collapsed into the first, and collapsing it is how a dashboard goes green on absence.

The rule is that the absence must be visible without inference. Three concrete forms it
takes:

- **An optional field is genuinely absent, never defaulted.** A per-component histogram
  that the extractor did not emit is undefined, not an empty list. An empty list reads as
  "measured, and there are none", which is a different and false claim.
- **A boolean readiness answer has three values**, not two: yes, no, and null-with-a-reason
  when the input to decide it was missing.
- **A request-relative grade is omitted when no request was made.** No budget was supplied
  means the budget grade is absent — not a satisfied budget. Silence about a budget must
  never read as compliance with one.

## The derived-split flag

The most valuable single piece of the contract is a **boolean on any derived structure
saying whether it was measured at all**. When a component split is computed from a missing
histogram, it returns zeros — and zero parts, zero specks is indistinguishable from a
clean single-shell prop. Carrying an explicit `measured: false` alongside the zeros makes
the ambiguity unrepresentable: every consumer must check the flag before reading the
counts, and the type system can make them.

Write the flag's meaning down where it is declared: *false when the extractor emitted no
histogram — callers must not infer from the counts.* A flag whose semantics live only in
the reader's head gets dropped in the next refactor.

## Procedure

1. **Enumerate the properties the card can carry**, including ones only some extractor
   versions produce.
2. **For each, decide the not-measured representation** — absent key, explicit null, or a
   `measured` flag on a derived struct — and make it structurally different from every
   compliant value.
3. **Make the fallback path conservative, not silent.** When the better measurement is
   unavailable, apply the older, blunter rule unchanged and say which rule was applied. A
   missing input must never become a loosening.
4. **Resolve partial measurements toward the harsher verdict.** Where data is truncated and
   you cannot tell which side an omitted item falls on, count it on the side that makes the
   verdict worse, and check every branch against the property that *neither branch can
   manufacture a pass*.
5. **Grade the always-gradeable properties even without a request**, so the card can state
   the honest negative. World scale is the example: generators normalise output to a unit
   box, so a card that stays silent lets a hero-sized asset pass at a fraction of its
   intended size. Grade it always, and let the verdict be "normalised, target size
   unknown".
6. **Propagate the distinction upward.** An aggregate that averages away a not-measured
   entry re-creates the exact lie the card avoided.

## Decision rules

- **When a neutral constant is proposed for a missing metric, refuse.** There is no neutral
  constant; a label is the only honest representation.
- **When a card is consumed by a router, make the router fail loudly on not-measured**
  rather than treating it as either verdict. An unroutable artifact is a result.
- **When a not-measured entry appears on a dashboard, count it in its own bucket** and show
  the bucket. A completion percentage whose denominator quietly excludes the unmeasured is
  a fiction.
- **When the extractor is versioned, do not backfill.** Old verdicts measured less; that is
  a fact about them, and re-deriving a value they never had is fabrication.

## When not to use this

- **Where the absence genuinely is the measurement.** "No degenerate faces found" is a
  measured zero and should read as one; the discipline is about telling that apart from a
  check that never ran, not about doubting checks that did.
- **As a reason to block on every gap.** A visible gap is survivable and is the whole
  point; the failure mode being prevented is the invisible one.
