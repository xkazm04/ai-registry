---
layer: application
type: application
subject: subscription-proration
technique: whole-period-denominator
stack: sql
status: forged
verified_on: 2026-09-07
verified_against: sql@16
---

# The denominator that is computed but never stored

Read against an open-source usage-based billing engine at commit `a24f3abe`
(2026-09-04), whose relational schema is `db/structure.sql` and whose prorated
subscription fee is built in `app/services/fees/subscription_service.rb`. The
engine implements the whole-period rule correctly and completely in code, and
then stores only half of it in the row — which is the gap this document is
about, because the row is what an invoice is re-rendered from years later.

## The rule, confirmed in code and in a scenario test

`Subscriptions::Dates::MonthlyService#compute_duration`
(`app/services/subscriptions/dates/monthly_service.rb:35-39`) is the
denominator, and its comment at `:31-34` states the technique's period-
resolution rule almost verbatim:

```ruby
# NOTE: `from_date` is not necessarily the beginning of the period: on a subscription resulting
#       from an upgrade, it is clamped to `started_at` while the anniversary is inherited from the
#       previous subscription. The duration is the one of the whole period, so it is measured from
#       the beginning of the period holding `from_date`.
def compute_duration(from_date:)
  period_start = compute_previous_beginning_of_period(from_date.to_date)
  (compute_to_date(period_start).to_date + 1.day - period_start).to_i
end
```

The period is **resolved** — walked back from the segment start to the
boundary containing it — never read off the record being billed.
`compute_previous_beginning_of_period` has one implementation per interval
(`.../monthly_service.rb:103`, `quarterly_service.rb:90`,
`semiannual_service.rb:168`, `weekly_service.rb:54`, `yearly_service.rb:137`),
so the resolver is the single door the technique asks for, opened six times
onto six calendars.

The scenario test `spec/scenarios/subscriptions/upgrade_proration_spec.rb:19-56`
proves it end to end: a customer subscribes on 15 Jan on a quarterly plan,
upgrades on 20 May, and terminates on 20 Jun. The new subscription's
`started_at` is 20 May but its `subscription_at` is 15 Jan (`:43-44`), so the
period holding the segment is the one opened on 15 Apr — 91 days. At 91 000
cents a quarter that is 1 000 cents a day, and the terminated fee is asserted
at 32 000 (`:53`). Divided by the truncated span instead, the same fee would
have been 91 000.

## The half the row does not keep

A fee stores its own segment boundaries in a jsonb column and nothing else
about the derivation. `db/structure.sql:3752` declares
`properties jsonb DEFAULT '{}'::jsonb NOT NULL`, read back through
`app/models/fee.rb:352-369` as `from_datetime` / `to_datetime` (with
`charges_from_datetime` and `fixed_charges_from_datetime` for the other fee
kinds), and indexed for ordering by `app/models/fee.rb:89-90`:

```sql
(properties->>'from_datetime')::timestamptz NULLS LAST
```

So the numerator's bounds survive in the row. **The period bounds and the
denominator do not.** Re-deriving a historical prorated line from the database
alone is impossible; it requires re-running the interval-specific resolver
against a subscription whose plan, interval and anniversary may since have
changed. The technique's rule — persist both dates, the denominator, the
whole-period amount, the exact coefficient and the convention's name — costs
four more keys in a jsonb column that already exists:

```sql
-- what the row keeps today
properties ->> 'from_datetime'
properties ->> 'to_datetime'

-- what makes the line reconstructable without the resolver
properties ->> 'period_from_datetime'
properties ->> 'period_to_datetime'
properties ->> 'period_duration_days'
properties ->> 'day_count_convention'
```

A partial index on `((properties ? 'period_duration_days'))` turns "which fees
predate the derivation record" into a query rather than a migration guess.

## Exact numerics are already in the schema, and the proration path bypasses them

The engine stores money at two scales — `amount_cents bigint NOT NULL`
(`db/structure.sql:3744`) beside `precise_amount_cents numeric(40,15)`
(`:3777`) and `precise_unit_amount numeric(30,15)` (`:3771`) — so the exact
arithmetic the technique asks for is available at the storage layer.

The subscription proration path does not use it. `single_day_price`
(`app/services/subscriptions/dates_service.rb:197-200`) is:

```ruby
duration = compute_duration(from_date: optional_from_date || compute_from_date)
(plan_amount_cents || plan.amount_cents).fdiv(duration.to_i)
```

`fdiv` is float division, and the result is multiplied by a day count at four
call sites (`app/services/fees/subscription_service.rb:178`, `:209-213`,
`:244`, `:265`). That is the technique's per-day-price disguise exactly: the
inexact division is performed first and its error is then multiplied. The
scenario test's own comment at `spec/.../upgrade_proration_spec.rb:9-10` says
the plan amount was chosen as "a multiple of the quarter duration, so that a
single day costs 1000 cents" — the fixture is built so the division is exact,
which is the tell that the inexact case is the untested one.

The whole computation fits in one exact expression, and the ordering matters:

```sql
-- multiply first, divide once, round once
SELECT (f.period_amount_cents::numeric * f.served_days) / f.period_days
       AS precise_amount_cents,
       round((f.period_amount_cents::numeric * f.served_days) / f.period_days)
       AS amount_cents
FROM   fee_segments f;
```

`numeric` here is not a preference: `bigint * int / int` in integer arithmetic
truncates toward zero on every segment, which biases a multi-segment period
downward, and `double precision` reintroduces the problem the two-scale schema
was built to avoid.

## The day count, and its three corrections

`Utils::Datetime.date_diff_with_timezone`
(`app/services/utils/datetime.rb:55-69`) counts days as elapsed seconds over a
day, rounded up:

```ruby
to += 1.second if to_in_time == to_in_time.beginning_of_day # To make sure we do not miss a day
from_offset = from.in_time_zone(timezone).utc_offset
to_offset   = to.in_time_zone(timezone).utc_offset
offset      = from_offset - to_offset
(to - from - offset).fdiv(1.day).ceil
```

Two of the technique's predicted corrections are visible in five lines — a
daylight-offset subtraction and a one-second nudge so an end boundary at
midnight is not rounded down. The third is at a call site:
`app/models/subscription.rb:257-269` subtracts one day when the subscription
is `terminated? && upgraded?`, which is the boundary day being un-billed so the
two segments of an upgrade do not both claim it, with a `negative? ? 0` floor
under it.

Each is correct. Together they are a convention distributed across three
files, and the fourth seam has no correction because nobody has hit it. The
positive finding in the same code is the one worth copying: the day count is
taken in `customer.applicable_timezone`, not the server's — the day boundary
belongs to the contract, as the technique requires.

A calendar-day count in the database needs none of the three:

```sql
-- half-open, calendar days, in the subscription's own zone
SELECT (
  (upper(seg) AT TIME ZONE s.timezone)::date
  - (lower(seg) AT TIME ZONE s.timezone)::date
) AS served_days
FROM subscription_segments;
```

with `seg` a `tstzrange` declared `'[)'`, so the boundary instant belongs to
exactly one segment by construction rather than by subtraction.

## The partition invariant as a query

The invariant the engine has no assertion for, expressible as a check that
runs over real data rather than over a fixture:

```sql
-- every period whose segments do not sum to exactly one period
SELECT period_id,
       sum(served_days)  AS segment_days,
       max(period_days)  AS period_days
FROM   fee_segments
GROUP  BY period_id
HAVING sum(served_days) <> max(period_days);
```

Zero rows is the invariant. Run it over history and it names, per period, every
place a boundary day was double-counted or dropped — including the ones the
three corrections do not cover. `EXCLUDE USING gist (subscription_id WITH =,
seg WITH &&)` on the segment table makes the double-count structurally
impossible instead, at the cost of requiring every segment to be materialized.

## What transplants

- Resolve the period; never read it off the record being billed. The engine's
  comment at `monthly_service.rb:31-34` is the rule, and its inheritance case
  is the reason.
- Store the denominator with the segment. The row already has a jsonb column;
  four keys make the line reconstructable without the resolver.
- Multiply before dividing, in `numeric`. A per-day price is a coefficient
  rounded early.
- Count calendar days over a half-open range in the contract's zone, and let
  the range type hold the boundary rule instead of accumulating corrections.
- Assert the partition as a query over history, not as a property of a
  fixture.
