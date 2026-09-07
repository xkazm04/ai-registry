---
layer: application
type: application
subject: usage-pricing-models
technique: exact-money-with-one-rounding-boundary
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@16
---

# The rounded/exact column pair, and the two scales it is stored at

Read against an open-source usage-based billing engine at commit `a24f3abe`
(2026-09-04), whose relational schema lives in `db/structure.sql` and whose
money-bearing model is `app/models/fee.rb`. The engine is a full realization of
this technique on the storage side, and it also exhibits the scale-mismatch
failure the technique warns about — both are visible in one table definition.

## The pair, in the schema

`CREATE TABLE public.fees` (`db/structure.sql:3739`) carries the rounded amount
and the exact amount as separate columns with different types:

```
amount_cents              bigint          NOT NULL          -- structure.sql (fees)
precise_amount_cents      numeric(40,15)  DEFAULT 0.0 NOT NULL   -- :3777
taxes_precise_amount_cents numeric(40,15) DEFAULT 0.0 NOT NULL   -- :3778
precise_unit_amount       numeric(30,15)  DEFAULT 0.0 NOT NULL   -- :3771
```

The integral boundary is `bigint` in the currency's smallest unit; the exact
value is a fixed-point decimal with fifteen fractional digits. The same pair
repeats on every money-bearing table the pricing path writes —
`fees_taxes` (`:4034`, exact column at `:4046`), `pricing_unit_usages` (`:5423`,
exact columns at `:5430` and `:5435`), and `adjusted_fees` (`:2156`), whose
`unit_precise_amount_cents` at `:2174` is the per-unit price carried at full
precision so a re-priced line can be rebuilt from it
(`app/services/invoices/regenerate_from_voided_service.rb:180-188`).

At the model layer, `app/models/fee.rb:43-49` monetizes both members of the
pair in adjacent lines:

```ruby
monetize :amount_cents                                              # :43
monetize :taxes_amount_cents, with_model_currency: :currency        # :44
monetize :total_amount_cents                                        # :45
monetize :precise_amount_cents, with_model_currency: :currency      # :46
monetize :taxes_precise_amount_cents, with_model_currency: :currency # :47
monetize :precise_total_amount_cents                                # :48
```

Each rounded amount and its exact twin sit within three lines of each other, so
a reader adding a fourth money column sees the convention rather than having to
be told it.

`precise_amount_cents` appears in **55 files** under `app/`, `lib/` and `db/`
(`grep -rl precise_amount_cents app/ lib/ db/ | wc -l`), which is the honest
measure of how load-bearing the twin is: it is not a debugging column, it is the
value most of the downstream arithmetic actually reads.

## One rounding, at the point the charge becomes money

`app/services/charges/apply_pay_in_advance_charge_model_service.rb:26-34` is the
boundary, and the comment above it names it:

```ruby
# NOTE: amount_result should be a BigDecimal, we need to round it
# to the currency decimals and transform it into currency cents
rounded_amount = amount.round(currency.exponent)
amount_cents   = rounded_amount * currency.subunit_to_unit
...
result.precise_amount = amount * currency.subunit_to_unit.to_d
```

Three things to take from four lines. The rounding happens **once**, on a value
that arrived as an arbitrary-precision decimal from the charge model. The scale
factor is **derived from the currency** — `currency.exponent` and
`currency.subunit_to_unit`, never a literal hundred — which is the
`limits-are-derived` half of the technique realized rather than asserted. And
the exact value is written on the same result object in the next statement, from
the *unrounded* `amount`, not from `rounded_amount`.

## The three consumers that divide

Each of the three stages the technique names as dividers exists here, and each
reads the exact column:

- **Proportional allocation of coupons and taxes across credit-note items.**
  `app/services/credit_notes/apply_taxes_service.rb:72-92`:
  `item_fee_rate = item.precise_amount_cents.fdiv(item.fee.amount_cents)`, then
  `item.precise_amount_cents - prorated_coupon_amount`. The ratio is taken off
  the exact value; the sum `items.sum(&:precise_amount_cents)` (`:72`) is the
  denominator.
- **Minimum-commitment shortfall.** `app/services/fees/create_true_up_service.rb:26`
  and `:73`: `precise_amount_cents = prorated_min_amount_cents - used_precise_amount_cents`.
  The commitment is compared against a sum of exact line values, not of rounded
  ones — which is what keeps the true-up from drifting by half a minor unit per
  line.
- **Partial credits against a redrafted fee.**
  `app/services/credit_notes/refresh_draft_service.rb:68`:
  `item.precise_amount_cents.fdiv(old_fee_amount_cents) * fee.amount_cents` —
  the fraction of the old line is preserved exactly and re-applied to the new
  one.

## Where it falls short: two scales for one value

The technique's rule that the scale must be uniform wherever the value travels
is **not** met. In the same `fees` table:

```
precise_amount_cents           numeric(40,15)   -- :3777
precise_coupons_amount_cents   numeric(30,5)    -- :3768
precise_credit_notes_amount_cents numeric(30,5) -- :3782
```

and `app/models/credit_note.rb:8` fixes `DB_PRECISION_SCALE = 5` to match the
narrower pair, with explicit truncation at the crossing —
`app/services/credit_notes/create_from_termination.rb:150`
(`item_amount.truncate(CreditNote::DB_PRECISION_SCALE)`) and
`app/services/credit_notes/refresh_draft_service.rb:45`. So a value computed at
fifteen decimals on the fee is truncated to five the moment it becomes a credit
or a coupon allocation. The truncation is at least explicit and named rather
than left to the store — which is the better of the two failure modes — but the
system has two exactnesses, and a reconciliation that crosses the boundary
cannot be exact on both sides. The standard is unchanged: derive one scale for
money-in-flight and declare it on every column that can hold such a value.

## A pricing behaviour gated on an edition flag

Also visible from the storage side's perspective, and worth recording because it
breaks the reproducibility premise the twin exists to serve:
`app/services/charge_models/percentage_service.rb:125-126` gates per-transaction
minimum and maximum on a licence check —

```ruby
def should_apply_min_max?
  return false unless License.premium?
```

— and its spec pins both answers for one identical fixture
(`spec/services/charge_models/percentage_service_spec.rb:284-292`): `301.691`
without the licence, `16.142` with it. Same charge, same events, same
configuration, an eighteen-fold difference in the amount. No column on the fee
records which edition computed it, so the stored inputs are not sufficient to
re-derive the stored amount — the defect the technique's reproducibility rule
exists to prevent, arriving from a direction that has nothing to do with
rounding.
