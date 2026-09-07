---
layer: technique
type: technique
subject: subscription-proration
technique: prorated-path-inherits-every-convention
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target]
shared_with: []
use_when: [adding a prorated variant of a pricing path, a preview that disagrees with the invoice, auditing two code paths that price the same thing]
---

# A variant path is a second implementation

The moment a system grows a prorated version of a pricing path, it has two
implementations of that path. The second one was written by copying the first,
which means it inherited the first's *code* — and not the first's
**conventions**, because the conventions were never in the code the copier was
looking at. They were inferred, at price time, from the data.

This is a defect class, not an incident. It is worth stating at full strength
because it is expensive, silent, and mechanically preventable.

## The shape of it

A graduated ladder is a list of bands with bounds and rates. Nothing in that
list says whether the bands **touch or overlap** — whether a band ending at
100 and the next beginning at 100 means the hundredth unit is priced low or
high, or whether a band ending at 100 and the next beginning at 101 is the
same ladder written a different way. Real rate cards are authored both ways,
so a mature pricing path *infers* the convention: it looks at whether
consecutive bounds are equal or adjacent, and prices accordingly.

That inference is invisible in the ladder's data and invisible in the function
signature. Copy the pricing loop into a prorated variant and you copy the
arithmetic and lose the inference. The variant then prices the boundary unit
under whichever convention its author happened to assume.

The result: two customers on the same plan, differing only in whether their
charge was prorated, are billed under different boundary rules. The difference
is one unit at one tier edge. It appears on a minority of invoices. It sums
to real money over a year and it survives for years, because there is no test
anywhere that compares the two paths.

## The conventions that get lost

Enumerate them, because the list is longer than anyone expects and every entry
is a real fork:

- **Tier boundary inclusivity**, inferred from whether ranges touch.
- **The absent upper bound** on the final band — infinity, or a validation
  error, or zero.
- **Zero quantity** — no charge, or the first band's flat component anyway.
- **Per-tier flat components** and how they compose with the per-unit rate:
  charged once on entering the band, or per band traversed.
- **Rounding mode and precision**, and whether rounding happens per band or
  once on the total.
- **The currency's minor-unit exponent** — not every currency has two
  decimal places, and a variant that hardcodes two is wrong in the ones that
  do not.
- **Block or package rounding** — whether a partial block is charged as a
  whole one.
- **Discount and credit ordering** — before or after the ladder.
- **The free band** or included allowance, and whether it is consumed before
  or across bands.
- **The treatment of a quantity above the last band's bound.**

Each of these has a right answer that lives with the ladder. The variant that
re-decides any of them has created a second authority for a vocabulary that
should have exactly one —
[one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
applies to a pricing convention as squarely as it does to a status enum.

## The remedy, in order of strength

**1. Share the inference.** The convention detection is extracted into one
function that both paths call. This is the only remedy that is correct by
construction: a convention added next quarter is acquired by both paths on the
day it lands, without anybody remembering the variant exists.

**2. Compose rather than duplicate.** Better still, do not write a second
pricing path at all: scale the quantity, then call the primary path. The
variant becomes a wrapper, and there is nothing to fork. This is not always
possible — a variant sometimes genuinely needs different arithmetic, for
instance when a period contains several segments at several quantities that
must be priced together — but it is possible far more often than it is done.

**3. Assert the equivalence.** Where the paths genuinely differ, one property
test pins every convention at once:

> **At a coefficient of one, the prorated path returns exactly what the
> primary path returns.**

Run it over the ladders the system actually has — including the awkward ones:
touching bands, adjacent bands, an unbounded final band, a zero-rate first
band, a single-band ladder, a ladder with flat components, a currency with a
different minor unit. Assert exact equality on the amount, not a tolerance. A
tolerance is a decision to not notice the boundary unit, which is the only
thing this test exists to notice.

The equivalence test is strictly stronger than a checklist because it
**observes the primary path itself** rather than a written description of it —
[a gate must see its target](../../../../_laws.md#gate-sees-target). A checklist
of conventions is a proxy, and it goes stale exactly when the primary path
acquires the convention nobody updated the checklist for. The test does not go
stale; it fails.

**4. The enumeration, as a fallback.** Where an equivalence test is genuinely
impossible, list the inputs the primary path reads — every field, every
inferred property — and assert the variant reads each one. Keep the list beside
both paths. It is a weaker instrument and it should be labelled as one.

## Where the variant does not exist, refuse the combination

The remedy nobody reaches for, and often the correct one. A variant is written
for one pricing path at a time. Somebody implements the prorated version of
the simple per-unit path; the banded and block-priced paths do not get one,
because they are harder. The question is what happens when a rate card asks
for a combination that has no variant behind it.

The wrong answer — and the default one, because it requires writing no code —
is to fall through to the unprorated path. A partial-period customer is then
charged a full period, on a rate card that says the charge is prorated, and
nothing anywhere reports a problem.

The right answer is to **refuse the combination where it is defined**, with a
validation that enumerates exactly which pricing models support proration
under which billing timing, and rejects the rest at authoring time. This is
uncomfortable to write, because the enumeration is a list of what has not been
built yet and it looks like an admission. It is one, and it is the whole
value: the list is visible, a rate card cannot be authored into the gap, and
the day a variant is implemented the list is where the change lands. An
unimplemented variant that fails loudly at definition time costs one error
message; the same gap discovered on an invoice costs a refund and a
credibility conversation.

## The audit, when you inherit the code

You are handed a system that already has both paths. In order:

1. **Diff the two implementations line by line**, and for every difference ask
   whether it is *required by proration* or merely *how the copy came out*.
   Anything in the second category is a fork.
2. **Grep the primary path for reads of the ladder's data** that the variant
   does not perform. A field read on one side only is a convention on one side
   only.
3. **Price a spread of real ladders through both paths at a coefficient of
   one** and compare. This will usually find the fork faster than reading
   will.
4. **Check the boundary unit specifically.** Fencepost differences hide in the
   one quantity that sits exactly on a band bound, and random test data almost
   never lands there.
5. **When a fork is found, fix the variant to match the primary** — the
   primary is what the majority of invoices were priced under, and moving it
   reprices history. Then write the equivalence test, so the next fork fails
   instead of shipping.

## This is not about proration

Proration is where the class shows up most reliably, but every one of these is
the same defect:

- a **preview or estimate** path that quotes a price the invoice then
  contradicts;
- a **dry-run** mode that validates under looser rules than the real run;
- a **currency-converted** path that rounds where the primary does not;
- a **trial** path that applies the allowance differently;
- a **migration** path that re-prices historical periods with today's
  inference;
- a **reporting** path that recomputes revenue and disagrees with the
  invoices it is reporting on.

In each case a second implementation exists because a variant was needed, and
in each case the fix is the same three-step ladder: share the inference,
compose instead of duplicating, and assert the equivalence at the parameter
value where the variant is supposed to reduce to the primary.

## Decision rules

- **When a variant path is proposed,** the first question is whether it can be
  a wrapper. Answer that before writing any arithmetic.
- **When a convention is added to the primary path,** the same change adds the
  equivalence test case that would have caught its absence in the variant.
  Adding it later means it is never added.
- **When the variant must differ,** the difference is written down where both
  paths can be read together, stating what differs and why the divergence is
  intended. An undocumented difference is indistinguishable from a bug, and
  will be "fixed" in the wrong direction by somebody in a hurry.
- **When the equivalence test fails after a change to the primary,** the
  variant is wrong. That is the direction of the fix, unless somebody can say
  which invoices were priced by which path and is prepared to reprice them.

## When not to use this

- **Where there is exactly one pricing path** — no preview, no variant, no
  estimate — there is nothing to keep in step, and building the machinery is
  premature.
- **Where the variant is genuinely a different product** — a quote for a
  bespoke contract, priced by a person under a different agreement — the two
  are not supposed to agree, and an equivalence test would assert something
  false.
