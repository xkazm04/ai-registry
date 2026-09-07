---
layer: technique
type: technique
subject: usage-aggregation-semantics
technique: level-valued-time-integral
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [billing something the customer holds rather than consumes, a metric whose value between events is nonzero, an invoice line that should be fractional, deciding what a period with no events costs]
---

# The time-integral of a level

A level metric has a value **between** its events, and billing must charge
for the between. The events are not quantities consumed; each is a **delta
to a level**, and what the customer owes is the level integrated over the
period — the area under a step function, not the sum of the steps.

The whole technique is producing that area with two properties: the period's
opening and closing instants both carry values, and the computation is a
single uniform pass with no special case for the first or last event.

## The shape of the computation

State it once, in units, before any query is written. For each interval
during which the level was constant, the contribution is

> level during the interval × (duration of the interval ÷ duration of the
> period)

and the aggregate is the sum of those contributions. Dividing by the period
duration is what makes the result comparable to a price quoted per period —
"seat-months per month" is "mean seats". Skip the division and the number is
in level-seconds, which is also a defensible metric, but the choice must be
made once and written down, because both are plausible and they differ by
several orders of magnitude.

The mechanical form that produces it without branching:

1. **Order the period's events by time**, with a total order — a stable
   secondary key breaks timestamp ties, or two events at the same instant
   produce two different answers on two runs.
2. **Running level.** Each row's level is the cumulative sum of every delta
   up to and including it. This is the one place a running total is exactly
   right, because the deltas *are* a flow even though the thing they move is
   not.
3. **Holding duration.** Each row holds its level until the next row's
   timestamp. The last row holds its level until the period's closing
   instant.
4. **Weight and sum.** Multiply each running level by its holding duration
   over the period duration and add them up.

Step 3 is where implementations acquire their branches, and step 3 is what
the next section removes.

## Close both boundaries by construction

The instinct is to handle the ends with conditionals: if there is a first
event, treat everything before it as the seed; if there is a last event,
extend it to the period end. Three cases break that instinct, and they are
not exotic — every one of them occurs in a customer's first month.

- **A period with no events at all.** There is no first row and no last row.
  A customer holding a stable level for a whole period emits nothing, and
  the branchy implementation returns zero for the customer who is easiest to
  bill.
- **A period with exactly one event.** The first row and the last row are
  the same row, and code that applies a first-row rule and a last-row rule
  to it applies both to one row.
- **A period whose level was set before it opened.** The first row in range
  is not the first change to the level, so treating it as "the level starts
  here" discards everything the customer already held.

The construction that removes all three: **materialize the boundaries as
rows.** Before the fold, add two synthetic entries to the event set — one at
the period's opening instant carrying the opening level as its delta, and
one at the period's closing instant carrying a delta of zero. Then run the
uniform pass over the union. Every real event now has a predecessor and a
successor by construction; the empty period degenerates to two synthetic
rows whose integral is exactly the seed held for the whole period; the
single-event period has three rows and no ambiguity.

The synthetic rows are the technique's actual content. They convert a
problem about edge cases into a problem about data, and data is testable in
a way that a conditional distributed across four expressions is not.

**The closing row must be neutral twice over**, and the second half is the
one implementations miss. Its delta is zero, so it adds nothing to the
running level — that part is obvious. It must also hold its level for zero
time, which happens for free when the "duration until the next row" lookup
defaults to the period's closing instant: the closing row's successor is
itself, so its duration is zero. Get only the first half right and the
closing row bills a final interval of arbitrary length.

Two more rules keep the sentinels honest. **They are constructed, never
stored** — writing them into the event table makes them indistinguishable
from real usage on every other read. And **the opening row's delta is the
seed**, which for a window-closed metric is zero and for a period-crossing
one comes from elsewhere; see the seeded-recurring aggregate technique in
this subject. When the metric is dimensioned, there is one opening sentinel
*per group*, carrying that group's own seed.

## Decision rules

- **If the metric's value between two events is zero, this is the wrong
  technique.** Requests served, bytes transferred, tokens generated: sum
  them. Applying an integral to a flow multiplies by a duration that has no
  meaning and produces a number that is wrong by exactly the ratio of the
  event spacing to the period.
- **If the customer would describe the metric with a verb of holding**
  — stored, running, assigned, provisioned, subscribed — it is a level.
  If they use a verb of doing — sent, called, rendered, processed — it is a
  flow. This heuristic is not a joke; it is more reliable than inspecting
  the event schema, because the schema of a level metric and a flow metric
  are usually identical.
- **If the answer should be the peak rather than the mean, do not integrate.**
  Billing the maximum level reached is a different, entirely legitimate
  metric with different customer-visible behaviour, and it needs the seed
  but not the weighting. Say which one the price refers to on the invoice
  line; a customer comparing a mean against their own monitoring dashboard's
  peak will open a ticket, and they will be right to.
- **If deltas may be negative, assert the running level never goes below
  zero** — or decide deliberately that it may. A negative level integrates
  to a negative charge, which the pricing layer will happily turn into a
  credit nobody approved. The usual cause is a remove that arrived without
  its add, and it is a data problem masquerading as an arithmetic one.

## One fold, two numbers — and only one is the bill

The pass produces the integral. It should be made to produce a second number
at the same time, because the second one is needed and is trivially
available: the **level at the period's closing instant**, which is the
opening seed plus the plain sum of the period's deltas.

They are different quantities and swapping them is silent:

- **The integral** answers "what did the customer hold on average across the
  period". It is what the invoice line bills.
- **The terminal level** answers "what does the customer hold now". It is
  what seeds the next period, and it is what a support screen should show.

An implementation that carries the integral forward as the next period's
seed decays the customer's level toward zero, one period at a time, and each
individual period's arithmetic checks out. Emit both, label both, and never
let the seeding path read the billed figure.

## Integration granularity is a policy, not an implementation detail

Nothing above says how finely time is measured. Seconds is the obvious
choice and it is not the only defensible one: whole days, in the customer's
own calendar and timezone, is common and is what a customer expects when the
product's language is "days of storage". Both are correct; the choice is a
billing policy and must be declared, because they produce different invoices
for the same events.

Coarse granularity carries an obligation that fine granularity does not.
**When the granule is larger than the event spacing, churn inside a granule
must be collapsed explicitly.** A unit added, removed and re-added on one
day is one billable day, but the naive fold sees two separate holding
intervals in that day and bills two. The compensation is a rule that
discards the intra-granule pair — and it has to be written, because nothing
about the integral produces it on its own. Fine granularity needs no such
rule, which is the honest argument for preferring it unless the customer's
mental model demands otherwise.

Whose calendar defines the granule is the second half of the policy. Day
boundaries in the customer's timezone and day boundaries in the system's are
different invoices, and the difference is largest for exactly the customers
who operate across timezones.

## What the result must carry

The number is fractional, its unit is a level and not a count, and it is
meaningless without its window. Per
[a count carrying its predicate](../../../../_laws.md#count-carries-predicate),
whatever this technique emits travels with the period it was integrated
over, the boundary convention used, and whether it was divided by the period
duration. A stored aggregate that carries only the figure will, within two
quarters, be compared against a figure computed under a different convention
and the difference will be attributed to a bug in the wrong component.

The stored result also names how it is recomputed, per
[derivation naming recomputation](../../../../_laws.md#derivation-names-recomputation):
for an in-arrears level metric that path is genuinely "re-run the fold over
the period's events with this seed", and it must be invokable, because it is
the only defence available when a customer disputes a line.

## When not to use this

- **Charges issued before the period closes.** The integral is not final
  until the period is, so an advance charge cannot bill it; it bills an
  increment to a peak instead. See the high-water-mark technique in this
  subject.
- **Metrics whose level changes continuously rather than in steps** —
  a temperature, a rate, anything sampled rather than evented. The step
  function assumption is wrong and the answer will be biased by whichever
  end of each interval the sampler happened to land on. Those need a
  sampling policy, which is a different subject entirely.
- **Very short periods relative to event spacing.** When a period contains
  one or two changes, the mean and the peak converge and the extra machinery
  buys nothing a maximum would not. Integrate when the period contains
  enough variation for the mean to differ from the extremes in a way the
  customer would notice.
