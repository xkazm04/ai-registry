---
layer: application
type: application
subject: usage-pricing-models
technique: advance-billing-refuses-retroactive-models
stack: process
status: forged
verified_on: 2026-09-07
---

# Three layers refusing one pair, in a usage-billing engine

Read against an open-source usage-based billing engine at commit `a24f3abe`
(2026-09-04). The engine forbids exactly one (pricing model, billing timing)
pair — volume charged in advance — and it asserts the refusal at three
independent layers rather than once. This is the reference realization of the
technique's central claim, and it also shows the delta machinery that advance
billing requires beyond non-retroactivity.

## Layer 1 — the record cannot be saved

`app/models/charge.rb:55` registers `validate :validate_pay_in_advance`, and
`:136-142`:

```ruby
def validate_pay_in_advance
  return unless pay_in_advance?

  if volume? || !billable_metric.payable_in_advance?
    errors.add(:pay_in_advance, :invalid_aggregation_type_or_charge_model)
  end
end
```

The refusal is on the **pair**: the guard fires only when the timing is advance,
and then rejects the model. Neither attribute is forbidden alone. The same
refusal is repeated for the other chargeable kind at
`app/models/fixed_charge.rb:81-87`, with its own error code
(`:invalid_charge_model`) — two charge kinds, two validations, one rule.

The one weakness at this layer is legibility: the error code
`invalid_aggregation_type_or_charge_model` is shared between the volume case and
the unrelated aggregation-compatibility case in the same conditional, so the
message that reaches the person configuring the plan cannot say which of the two
it was. The technique's requirement that the refusal reach the authoring
boundary as a *typed statement about pricing* is met structurally and blunted in
the wording.

## Layer 2 — the selector has no cell for it

`app/services/charge_models/factory.rb:64-83` is a second, total case statement
used only for the advance path:

```ruby
def self.in_advance_charge_model_class(pricing_structure:)
  case pricing_structure.charge_model.to_sym
  when :standard then ChargeModels::StandardService
  when :graduated then ChargeModels::GraduatedService
  when :graduated_percentage then ChargeModels::GraduatedPercentageService
  when :package then ChargeModels::PackageService
  when :percentage then ChargeModels::PercentageService
  when :custom then ChargeModels::CustomService
  when :dynamic then ChargeModels::DynamicService
  else
    raise NotImplementedError, "Charge model #{pricing_structure.charge_model} is not implemented"
  end
end
```

Compare it against the arrears selector twenty lines above (`:37-62`), which is
the same list **plus `:volume`**. The design is the technique's table over the
product of two closed sets, expressed as two exhaustive functions: every cell is
decided, and the forbidden cell is decided by omission from a case statement
whose `else` raises. This catches everything layer 1 cannot — a plan created
before the validation existed, a bulk import, a fixture, an internal caller that
assembled the arguments directly.

## Layer 3 — the fall-through raises rather than returning

The `else` branch is the third layer and it is doing real work: it raises rather
than returning `nil`, and the single caller
(`app/services/charges/apply_pay_in_advance_charge_model_service.rb:48-52`)
memoizes the class and immediately calls `.apply` on it. A selector returning
`nil` here would have produced a method-missing failure at a distance, or —
worse, in a slightly different implementation — an amount of zero. That is the
failure-spelled-as-empty-success shape on a money path, and the raise is what
prevents it.

## The delta machinery, and the flat-fee suppression it needs

`apply_pay_in_advance_charge_model_service.rb:20-24` is the incremental
formulation the technique describes, verbatim:

```ruby
amount = if with_persisted_event?
  amount_from_aggregation - amount_excluding_persisted_event
else
  amount_including_non_persisted_event - amount_from_aggregation
end
```

Two evaluations of the same charge model, at two hypothetical quantities,
subtracted. This is why a retroactive model cannot participate: with volume, the
subtrahend can exceed the minuend and the difference is a negative fee.

And it is why the technique's *second* requirement exists. The excluding
evaluation is built at `:79-84` by merging `exclude_event: true` into the
properties, and each model that is allowed in advance reads that flag to
suppress its flat components. `app/services/charge_models/graduated_service.rb:28-33`:

```ruby
def compute_amount
  # On the first pay-in-advance event: delta = cost(1 unit) - cost(0 units, exclude_event: true).
  # Here we exclude the flat fee from cost(0 units, exclude_event: true).
  return 0 if units.zero? && properties[:exclude_event]
  ...
```

with the same comment and the same handling at
`graduated_percentage_service.rb:15-17`. The flag is an **input**, not an
inference from the quantity being zero — which is what keeps a genuinely
usage-free period from being confused with a delta evaluation. The engine's own
`percentage_service.rb:68-69` carries a standing TODO to respect the
`exclude_event` flag — a model that *is* allowed in advance and does not yet
implement the suppression. That is the technique's warning ("every model allowed
in advance implements it, not just the ones with flat fees today") recorded by
the engine against itself, on the one shape that carries a per-transaction fixed
fee.

## The refusal follows the model into partial-period paths

`app/models/charge.rb:158-172` extends the same reasoning to proration, with the
rule written out as a comment above the code:

```
# - for pay_in_arrears, price model cannot be package, graduated and percentage
# - for pay_in_advance, price model cannot be package, graduated, percentage and volume
```

and `app/models/fixed_charge.rb:89-100` refuses graduated + prorated +
pay-in-advance separately. Partial-period arithmetic is a second place where a
quantity is not final, and the engine re-asserts the constraint there rather
than re-arguing it.

## Where it falls short

`app/services/charge_models/prorated_graduated_service.rb:112-116` clamps a
negative result to zero inside the prorated graduated path:

```ruby
def result_with_flat_amount(result, total_full_units, max_full_units)
  return 0 if total_full_units.negative?

  flat_amount = 0
  result = 0 if result.negative?
```

The technique's rule is that a negative fee is treated as a structural defect
until proven otherwise and never clamped, because a clamp converts a signed
error into a silent undercharge with no trace. Here the clamp is reachable from
removal events on a recurring metric rather than from a retroactive model, so it
is not the volume case — but it is the same instrument, and it will absorb the
volume case too if the refusal above is ever routed around. The standard stays:
the negative should surface as a classified refusal, not as a zero.
