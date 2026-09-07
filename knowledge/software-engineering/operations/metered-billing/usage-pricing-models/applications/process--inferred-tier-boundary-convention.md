---
layer: application
type: application
subject: usage-pricing-models
technique: inferred-tier-boundary-convention
stack: process
status: forged
verified_on: 2026-09-07
---

# Auditing an inferred boundary convention across every path that prices a ladder

A worked audit against an open-source usage-based billing engine at commit
`a24f3abe` (2026-09-04). The engine infers its graduated-ladder boundary
convention rather than declaring it, does so correctly on the main path, and —
as the technique predicts — does not do so on two of the paths that consume the
same ladders. This document is the procedure that finds that, written so it can
be run against any pricing tree.

## Step 1 — find the inference, and read what it asks

`app/services/charge_models/graduated_service.rb:20-26`:

```ruby
def adjacent_ranges?
  return false if ranges.size < 2

  ranges.each_cons(2).all? do |prev, curr|
    BigDecimal(curr[:from_value].to_s) == BigDecimal((prev[:to_value] || 0).to_s)
  end
end
```

Three properties of a correct detector, all present: it reads the **whole
ladder** (`each_cons(2).all?`, not a single pair), it compares in an
arbitrary-precision decimal rather than by string or float equality, and it
returns a single verdict for the ladder.

One property is missing. A ladder with fewer than two ranges returns `false` —
the non-adjacent, `+1` reading — with nothing recorded. That is the
single-tier case the technique says has no signal: here it silently resolves to
one of the two definite answers rather than to a named default that anyone can
see fired.

## Step 2 — follow the verdict to its consumer

`graduated_service.rb:14` passes it as an argument rather than letting the
consumer re-derive it:

```ruby
ChargeModels::AmountDetails::RangeGraduatedService.call(
  range:, total_units: units, adjacent_model: adjacent_ranges?
)
```

and `app/services/charge_models/amount_details/range_graduated_service.rb:53-65`
is the one place the convention becomes a number of units:

```ruby
# NOTE: compute how many units to bill in the range
def units
  effective_total = ...
  return effective_total if BigDecimal(from_value.to_s).zero?

  diff = effective_total - BigDecimal(from_value.to_s)
  @adjacent_model ? diff : diff + 1
end
```

This is the whole technique in one expression. `0–5, 6–inf` gives `diff + 1`
(the sixth unit starts tier two); `0–5, 5–inf` gives `diff`. Old plans keep
billing to the cent, new plans read naturally, and no migration was needed.

## Step 3 — enumerate every other site that turns a range into units

This is the step that finds the defect, and it is a search, not a review. Two
searches suffice:

```
grep -rn "adjacent" app/ lib/          # who knows the convention exists
git ls-files | grep -i graduated       # who prices a ladder
```

The first returns **five hits, in exactly two files** — the two above. The
second returns five services under `app/services/charge_models/` that price
graduated ranges, plus two validators under `app/services/charges/validators/`.
Subtracting one search from the other leaves the sites that price or validate a
ladder while unaware a convention exists:

| path | how it counts units in a tier | convention it asserts |
|---|---|---|
| `graduated_service.rb` (+ `amount_details/range_graduated_service.rb`) | `@adjacent_model ? diff : diff + 1` | **detected** |
| `prorated_graduated_service.rb:131,144,149,164` | `full_sum - from_value + 1`, `from_value - 1` | hardcoded non-adjacent |
| `amount_details/range_graduated_percentage_service.rb:53-64` | `total_units - from_value + 1` | hardcoded non-adjacent |
| `graduated_service.rb:44-58` (projection) | `range_to - priced_units_count` | none — see below |

The projection path is the instructive negative result. It looks like a third
fork and is not: it derives each tier's capacity from the *cumulative units
already priced* rather than from `from_value`, so it produces the same answer
under both conventions. Worth stating because an audit that flags it loses
credibility for the two findings that are real — and because that formulation
is the actual fix for the other two.

## Step 4 — read the forks and say who they harm

`app/services/charge_models/prorated_graduated_service.rb:125-151` prices the
same `graduated_ranges` for a prorated charge and never asks about adjacency:

```ruby
def calculate_overflow(full_sum, to_value, from_value)
  return full_sum - from_value + 1 if to_value.nil?
  ...
    full_sum - from_value + 1
end

def skip_overflow_calculation?(full_sum, to_value, from_value)
  return full_sum >= from_value - 1 if to_value.nil?
```

and its own comment at `:40-42` shows which format its author had in mind —
"*We have two tiers: 0 - 5, 6 - inf*". The `+ 1` and the `- 1` are the
non-adjacent convention written into the arithmetic. The same is true of
`range_graduated_percentage_service.rb:53-64`, which has no `adjacent_model`
parameter at all and whose caller
(`graduated_percentage_service.rb:14`) has no `adjacent_ranges?` to pass.

The direction is exactly the one the technique predicts. Detection was added to
protect the legacy format, so legacy plans are right everywhere. A plan authored
in the **new**, touching format prices correctly on the ordinary graduated path
and **one unit per tier too many** on the prorated path and on every
graduated-percentage charge. Newest format, least-travelled paths, fewest
customers.

## Step 5 — check the validator, because it decides which ladders reach the detector

The technique says to include the well-formedness validation in the
enumeration, and here it is the most consequential omission of the four.
`app/validators/range_bounds_validator.rb:5-14`, included by
`app/services/charges/validators/graduated_service.rb:6`, accepts a range whose
lower bound is *either* reading:

```ruby
valid_from = from == next_from || from == next_from + 1
```

The choice is made **per range**, so a ladder may legitimately mix the two
conventions — and the engine's own fixture at
`spec/services/charge_models/graduated_service_spec.rb:78-80` does:

```ruby
{from_value: 0,    to_value: 0.01, ...},   # touches
{from_value: 0.01, to_value: 10,   ...},   # touches
{from_value: 11,   to_value: nil,  ...}    # gap of one
```

`adjacent_ranges?` requires *all* consecutive pairs to touch, so one gapped pair
at the end flips the whole ladder to the `+1` reading — and applies it to the
two pairs that touch. That is the malformed ladder the technique says to refuse,
admitted by the validator and then resolved to a definite answer by the
detector. The fixture compounds it: the bounds are fractional (`0.01`), and a
`+1` gap over a quantity that can be fractional leaves everything between `10`
and `11` priced by no tier at all.

Two fixes, and the validator's is the one that must land first: **the ladder's
bounds are all-touching or all-gapped, decided once for the ladder**, and a
gapped ladder over a metric that can produce fractional units is rejected
outright.

## Step 6 — the assertion that would have caught it

The engine's specs cover the detector well —
`spec/services/charge_models/graduated_service_spec.rb` and
`spec/services/charge_models/amount_details/range_graduated_service_spec.rb`
both exercise adjacent and non-adjacent ladders — and
`spec/services/charge_models/prorated_graduated_service_spec.rb` covers the
prorated path against its own expected values. Both suites pass. That is the
shape the technique warns about: each path tested against itself, neither tested
against the other, and the expected values in the second suite encode the fork.

The missing assertion is one test: **the same ladder, in both encodings, priced
through every path, asserting the paths agree with each other.** It needs no new
fixtures — only the two existing ladder shapes crossed with the four services.

## Step 7 — the exit from inference

`ChargeModels::PricingStructure` (`app/services/charge_models/pricing_structure.rb`)
is where a declared `boundary_convention` would live: every charge model already
receives it, `properties` already flows through it, and the detector at
`graduated_service.rb:20-26` becomes the one-time back-fill that writes the
answer onto each plan. After that the four sites read a field instead of three
of them guessing, and the single-tier case stops resolving silently.
