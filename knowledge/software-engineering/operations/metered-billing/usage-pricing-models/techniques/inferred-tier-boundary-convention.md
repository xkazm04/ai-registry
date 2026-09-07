---
layer: technique
type: technique
subject: usage-pricing-models
technique: inferred-tier-boundary-convention
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value, derivation-names-recomputation]
shared_with: []
use_when: [defining a tiered charge, migrating plans between two range encodings, an invoice off by one unit per tier]
---

# The ladder's boundary convention is data, and if it must be inferred, it is inferred everywhere

A tiered ladder is a list of ranges. Two encodings of the same intent are both
natural, both in wide use, and indistinguishable from a single range:

- **Touching ranges.** `0–10`, `10–20`, `20–∞`. The upper bound is exclusive;
  the tier holds `upper − lower` units. This is the only reading that stays
  coherent when the quantity can be fractional, because ten and a half has to
  belong to a tier.
- **Integer-unit ranges.** `0–10`, `11–20`, `21–∞`. Both bounds are inclusive;
  the tier holds `upper − lower + 1` units. It reads the way a person counts —
  "the eleventh unit starts tier two" — and it only means anything if units are
  whole.

The difference is one unit per tier. Systematic, same sign for every customer,
invisible in aggregate because there is nothing for it to vary against.

## Declare it

The correct shape is a field on the pricing model, written at creation,
carried with the plan, read by every consumer. Then the convention is
[one authority for one vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
it is versioned with the plan it belongs to, it appears in the recorded inputs
of every line the plan prices, and re-deriving a nine-month-old amount does not
require knowing which release computed it.

Everything below is what to do when that field does not exist and cannot be
back-filled — a corpus of plans authored under one encoding, a newer editor
that emits the other, and no record of which is which. Inference is a
**migration bridge**. It is not an architecture, and a system that has been
inferring for two years has an undeclared field, not a clever design.

## Infer once, from the ladder as a whole

The signal is adjacency. If tier *k*'s upper bound equals tier *k+1*'s lower
bound, the ranges touch and the convention is exclusive-upper; if there is a
gap of exactly one, the convention is inclusive-both. Four rules make that
reading safe:

1. **Ask the whole ladder, not a pair.** The convention is a property of the
   authoring format, so it is uniform across the ladder or the ladder is
   malformed. A ladder where some pairs touch and some are separated by one
   has no answer — and picking per pair invents one. Refuse it. This is
   [unknown declining to render as a definite value](../../../../_laws.md#unknown-is-not-a-value);
   the definite value here is a number of units, and it is wrong in a
   direction nobody chose.
2. **A single-tier ladder has no adjacency to observe.** There is no signal.
   Fall back to an explicit, named default and record that the fallback fired —
   not silently, because the day a second tier is added the same plan changes
   convention and every amount moves.
3. **Compute it once, at the top of pricing, and pass the verdict down.** The
   result is an argument, not something each helper re-derives. Re-derivation
   at N sites is N chances for one of them to receive a subset of the ranges
   and read a different answer off it.
4. **Gaps larger than one are not a convention, they are a hole.** `0–10`,
   `15–20` prices nothing between them. Refuse at authoring.

## The failure this technique exists to prevent

A pricing engine rarely has one path through a model. It has the ordinary path,
and then it has the variants: the one that weights units by the fraction of the
period they were active, the one that produces an estimate before the period
closes, the one that recomputes for a preview or a credit note, the one behind
a reporting export. Each is a separate implementation of the same arithmetic.

Inference lands in the path someone was looking at — the one the migration was
about. The variants keep whatever they were written with, which is the **older**
convention, because they were written before the newer format existed. Now the
same plan, on the same quantity, prices two ways depending on which path ran,
and there is **no declaration to check either answer against**. A declared field
would have made the two paths disagree loudly, or agree; an inference makes them
disagree quietly and each look locally correct.

The direction of that fork is worth stating, because it decides who is harmed
and therefore how long it survives. Detection is added to protect the *legacy*
plans, so after the change the legacy plans are right on every path and the
**new** format is the one that misprices — but only in the variants, which are
the less-travelled paths, on the newer plans, which have the fewest customers.
The defect is therefore concentrated exactly where nobody is looking, and it
does not grow into visibility; it grows with adoption of the new format, by
which time the variants have accumulated their own fixtures encoding the wrong
answer.

So the rule generalises past tier boundaries: **an inferred convention must be
inferred at every site that consumes it, or the inference is a fork.** The
procedure is an enumeration, and it is not optional:

- List every site that converts a range into a count of units, or decides
  which tier a quantity lands in. Include the variant paths. Include the
  validation that checks a ladder is well-formed, which will otherwise reject
  or accept the wrong ladders.
- Each site either receives the verdict as a parameter or calls the one
  detector. Neither of those is "it computes the same thing inline".
- Pin it with a fixture per encoding, run through **every** path, asserting
  the paths agree with each other and not merely with themselves. A test that
  covers the main path and the variant separately, each against its own
  expected value, is the test that lets this defect live: both pass, and the
  expected values encode the fork.

Any amount stored under an inferred convention
[names how it is recomputed](../../../../_laws.md#derivation-names-recomputation),
and the honest recomputation path here is "run the same detector over the same
ranges" — which is only true if the ranges are immutable once priced. If a plan
can be edited in place, the inference is not reproducible and the field is no
longer optional.

## Decision rules

- **When you can add the field, add the field.** Inference is what you do
  because the past exists, never because the field seemed like ceremony.
- **When you add the field to a corpus that has been inferred,** back-fill it
  by running the detector once per plan and writing the answer down. The
  migration is the detector's last useful act.
- **When a new authoring surface is built,** it emits the declared convention.
  A second inferred format is a second fork waiting for its own variant path.
- **When two paths disagree on a real invoice,** the declared convention wins,
  and if there is none, the path that has been billing customers wins — a
  correction is a credit note and a conversation, and changing the *other*
  path silently reprices a cohort that never noticed.
- **When the metered quantity can be fractional, the inclusive-both encoding
  is not merely unfashionable, it is invalid.** Reject it at authoring rather
  than inferring it, because there is no unit-of-one to add.

## When not to use this

- **Greenfield.** There is exactly one encoding; declare it and stop.
- **Ladders expressed as widths rather than bounds** ("first 10 units, next
  90 units, then the rest"). The ambiguity does not exist, which is a good
  argument for that encoding.
- **Ladders over a continuous quantity** — seconds, bytes, fractional
  compute-units. Only the half-open reading is coherent; there is nothing to
  infer, and an inference here would be reading noise.
- **Boundaries that are not numeric ranges at all** — a tier selected by a
  named plan attribute or a membership set. Adjacency is undefined and the
  detector must not be pointed at it.
