---
layer: application
type: application
subject: subscription-proration
technique: prorated-path-inherits-every-convention
stack: process
status: forged
verified_on: 2026-09-07
---

# Running the audit against a real fork

The technique's audit, executed step by step against an open-source
usage-based billing engine at commit `a24f3abe` (2026-09-04). It found a live
fork in four steps, and the sequence is reproducible on any codebase that has
grown a prorated variant of a pricing path. This document is the procedure
with its worked output, not a summary of the finding.

## Step 1 — name the pair

Locate the primary path and its variant, and read them as two files rather
than one feature.

- Primary: `app/services/charge_models/graduated_service.rb`
- Variant: `app/services/charge_models/prorated_graduated_service.rb`

They are siblings under one base class (`ChargeModels::BaseService`) and are
selected by `app/services/charge_models/factory.rb`. Neither file references
the other. That is the precondition for the defect: **two implementations, no
shared inference, no test that compares them.**

## Step 2 — enumerate what the primary reads

Read the primary path and list every input, including the properties it
*derives* rather than reads. The derived ones are the whole point; they are
invisible in the data and invisible in the signature.

The primary's derived property is at `graduated_service.rb:20-26`:

```ruby
def adjacent_ranges?
  return false if ranges.size < 2
  ranges.each_cons(2).all? do |prev, curr|
    BigDecimal(curr[:from_value].to_s) == BigDecimal((prev[:to_value] || 0).to_s)
  end
end
```

The rate card does not say whether its bands touch. The code decides, by
looking: a ladder written `0-10, 10-100` touches; one written `0-10, 11-100`
does not. The answer is passed into the band arithmetic at `:14`, and it
changes the unit count by one at `app/services/charge_models/amount_details/range_graduated_service.rb:64`:

```ruby
diff = effective_total - BigDecimal(from_value.to_s)
@adjacent_model ? diff : diff + 1
```

Note the constructor default at `range_graduated_service.rb:6`:
`adjacent_model: false`. **A caller that does not pass it gets the
non-adjacent convention and no warning.** An optional argument with a default
is where an inference goes to die.

## Step 3 — grep the variant for each enumerated input

Mechanical, and the step that produces the finding. One search, one positive
control, one verdict:

```
$ grep -rn "adjacent" app/services/charge_models/
  amount_details/range_graduated_service.rb:6    def initialize(range:, total_units:, adjacent_model: false)
  amount_details/range_graduated_service.rb:10   @adjacent_model = adjacent_model
  amount_details/range_graduated_service.rb:64   @adjacent_model ? diff : diff + 1
  graduated_service.rb:14                        ... adjacent_model: adjacent_ranges?)
  graduated_service.rb:20                        def adjacent_ranges?
```

Five hits, in three files. `prorated_graduated_service.rb` is not among them.
The search returned the primary path's own definition and use, which is the
positive control that makes the absence meaningful rather than a mistyped
pattern — an absence proven by a search that found nothing is not proof of
anything.

What the variant does instead is hardcode one of the two conventions.
`calculate_overflow` (`prorated_graduated_service.rb:143-151`):

```ruby
def calculate_overflow(full_sum, to_value, from_value)
  return full_sum - from_value + 1 if to_value.nil?
  if full_sum >= to_value
    full_sum - to_value
  else
    full_sum - from_value + 1
  end
end
```

and `skip_overflow_calculation?` at `:163-167` (`full_sum >= from_value - 1`),
and the band selection in `range` at `:125-141`. The `+ 1` is the
non-adjacent convention, written three times, in three helpers, with no
condition above it.

**The fork, stated as an observable:** two customers on the same graduated
ladder, one prorated and one not, are billed on different band-boundary rules
whenever the ladder's ranges touch. The difference is one unit at each band
edge. It appears only on prorated charges, only on touching ladders, and only
when a quantity lands at or near a boundary — which is why it survives.

## Step 4 — price the same ladder through both paths at a coefficient of one

The step that would have caught it before it shipped, and the artifact worth
leaving behind. For each ladder in the corpus, drive both paths with a
segment covering the whole period, and assert equality on the amount:

| ladder | quantity | why it is in the set |
|---|---|---|
| `0-10 @ 1.00`, `10-100 @ 0.50` | 10, 11 | touching bands; the boundary unit |
| `0-10 @ 1.00`, `11-100 @ 0.50` | 10, 11 | non-touching bands; same quantities |
| `0-10 @ 1.00`, `10-nil @ 0.50` | 10, 1000 | unbounded final band |
| single band `0-nil @ 0.50` | 0, 1 | the degenerate ladder |
| `0-10 @ 1.00 + flat 5`, `10-100 @ 0.50 + flat 2` | 5, 50 | flat components |
| any of the above, zero-decimal currency | boundary | minor-unit exponent |

Assert **exact** equality of the amount, not a tolerance. A tolerance is a
decision not to notice a one-unit difference at a band edge, which is the only
thing this test exists to notice.

The engine's own suite has scenario coverage of the whole-period denominator
(`spec/scenarios/subscriptions/upgrade_proration_spec.rb`) and unit coverage
of each charge model separately. It has no test that drives both graduated
paths with one ladder and compares them, which is precisely why the missing
inference is still there.

## Step 5 — decide the direction of the fix, before fixing

The variant is wrong and the primary is right, because the primary is what the
majority of invoices were priced under and moving it reprices history. So:

1. Extract `adjacent_ranges?` to a place both paths call — it depends only on
   `ranges`, so it belongs on the shared base rather than on the primary.
2. Make `adjacent_model` a required argument at
   `range_graduated_service.rb:6`. Removing the default converts every future
   forgetful caller from a silent wrong answer into a failure at load.
3. Add the equivalence suite from step 4, and add a case to it in the same
   change as any future convention.
4. Quantify the exposure before repricing anything: how many prorated
   graduated charges exist on ladders with touching ranges, and what the
   one-unit difference sums to. A fix without that number is a repricing with
   no impact estimate.

## The generalization this run supports

The same audit run against the adjacent variants in the same tree finds the
same shape waiting:

- `compute_projected_amount` exists on both paths
  (`graduated_service.rb:36-61`, `prorated_graduated_service.rb:96-101`) and
  they are structurally different — the primary re-walks the bands, the
  variant divides the current amount by a period ratio. That is a **third**
  implementation of the ladder, on the projection path, and nothing compares
  it to either of the other two.
- The prorated variant's own `unit_amount` (`:103-108`) divides the computed
  amount by the *full* unit total, so a displayed unit price on a prorated
  charge is on a different basis than on an unprorated one.

Neither is a proration bug. Both are the same defect class: a variant path
written for a real need, inheriting the arithmetic and not the conventions.
The audit is cheap enough to run on all of them at once, and the enumeration
from step 2 is reusable across every variant of the same primary.

## What transplants

- The pair is named before it is read. Two files, two implementations, and no
  reference between them is the shape to look for.
- The enumeration covers derived properties, not just fields. What the primary
  *infers* is what the variant loses.
- Every absence claim carries a positive control in the same search output.
- An optional argument with a default is a convention that fails silently;
  make it required when a second caller appears.
- The equivalence test at the parameter value where the variant reduces to the
  primary is the deliverable. The audit finds today's fork; the test prevents
  the next one.
