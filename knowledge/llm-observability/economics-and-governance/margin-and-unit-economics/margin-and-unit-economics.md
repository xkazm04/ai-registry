---
layer: golden-path
type: golden-path
subject: margin-and-unit-economics
status: reconciled
use_when:
  - deciding which customers or products are unprofitable
  - building a per-customer P&L over LLM traffic
  - evaluating a price change before making it
  - reporting gross margin for an inference-backed product
techniques:
  - cogs-by-construction
  - revenue-recognition-rules
  - loss-first-ordering
  - below-filter-honesty
  - pricing-what-if-simulation
  - margin-erosion-forecasting
---

# Margin and unit economics

Margin is the first number in an LLM observability stack that a board can act
on. Everything upstream — telemetry, pricing, attribution — exists so that one
subtraction can be trusted: **recognized revenue minus attributed inference
cost, per customer or per product, over a window**. The subject is the craft of
making that subtraction honest, and of using it for the two questions it
uniquely answers: *who is unprofitable right now*, and *what would happen to
margin if the price changed*.

This is an operator-side P&L, and the boundary matters. The builder side of the
seam asks "did this feature cost more than it saved?" — a question about one's
own system, answered by metering one's own runs against an internal baseline.
This subject asks a different question about other people's money: it joins
**two independent event streams** — billing events arriving by webhook from a
payment processor, and inference events arriving from instrumented traffic —
on a linkage (a customer or product identifier carried in call metadata) that
is **optional and frequently missing**. Neither stream was designed for the
other. The billing stream has refunds, currencies, and periods; the traffic
stream has untagged calls and unpriceable costs. The whole discipline of the
subject is refusing to paper over the impedance mismatch.

## The equation is easy; every term is a decision

`margin = recognized revenue − attributed cost` looks like arithmetic. Each
term hides a policy choice a principal practitioner makes explicitly:

**Which costs count.** Only the cost of serving production traffic is cost of
goods sold. Judge scoring, benchmark runs, offline evaluation, model
experimentation — the quality apparatus — is operating expense, not COGS, and
the field treats this as settled: training and evaluation spend belongs with
research cost, production inference belongs with revenue cost. The naive
implementation sums "everything the provider billed us" and silently books its
own measuring instrument against its customers' margins. The correct
implementation makes the wrong sum *impossible*, not merely avoided — quality
spend is segregated at write time into a different store, so the COGS query
cannot reach it even by accident (cogs-by-construction).

**When revenue counts.** A subscription payment is not revenue on the day the
card was charged; it is revenue ratably over the period it purchased — the
standard accounting treatment for subscription software. A margin window that
books an annual prepayment entirely into one month will report one absurdly
profitable month and eleven fictitious losses. Refunds are negative revenue in
the window they occur. One recognition rule, written once, must serve every
surface that reports revenue — the monthly rollup, the daily trend, the
simulation baseline — or the surfaces will disagree with each other and the
reader will trust none of them (revenue-recognition-rules).

**Which key joins them.** Attribution rides on an identifier the caller may or
may not have supplied. The unattributed bucket is not an error state to hide;
it is a first-class row. Cost that cannot be attributed still happened, still
reduces the business total, and its size is itself a health metric: an
unattributed bucket growing faster than traffic means the integration is
losing its linkage, and every per-customer number is quietly becoming a floor
rather than a truth.

## The output is a ranking, not a report

A margin table sorted alphabetically is a report; sorted by margin ascending it
is a work queue. The operator's question is "who is losing me money" — so the
most unprofitable row comes first, always, and derived surfaces that cap their
row count cap by *absolute* margin, because a large loss is exactly as
interesting as a large gain (loss-first-ordering).

Two null-discipline rules keep the ranking honest. A customer with cost and no
revenue has **no margin percentage** — not a margin of −100%, not −∞, but an
absent value, because a ratio with a zero denominator is not a measurement.
And filters over margin percentage must still catch these rows: a free-tier
customer burning inference is below every breakeven threshold even though
their percentage is undefined. A filter that quietly drops undefined rows
hides precisely the customers most likely to be pure loss
(below-filter-honesty).

Filtered views carry a second obligation: a response that shows only the
below-threshold cohort must *say so in the payload*, echoing the predicate it
applied, so a cohort subtotal can never be mistaken for a business total by a
reader — human or machine — who did not see the request.

## Simulation: the P&L as decision support

Once the actual P&L is trustworthy, it earns a second life: the same cost data
under a hypothetical price model answers "what if I charged differently"
*before* the repricing email goes out. The discipline is strict
(pricing-what-if-simulation):

- **Real costs, hypothetical revenue.** The simulation replaces the revenue
  term only. Cost is the measured, windowed truth; inventing both sides makes
  the exercise fiction.
- **The actual rides alongside.** Every simulated row carries the real margin
  next to the simulated one, and their delta. A simulated number without its
  actual counterpart cannot be sanity-checked and will be misread as a
  forecast.
- **Simulation announces itself.** The response is stamped as simulated and
  echoes every assumption — the hypothetical prices, the proration basis —
  because a simulated payload that escapes into a dashboard unlabeled becomes
  next quarter's "actuals".
- **Read-only, always.** A what-if that writes anything is a repricing, not a
  simulation.

Known weaknesses are stated, not hidden: a flat monthly fee applied per key is
approximate for the unattributed bucket (many customers roll up under one
key), and the simulation says so.

## Erosion: margin is a curve, not a snapshot

The single-window rollup answers "who is unprofitable"; it cannot answer "who
is *becoming* unprofitable". Inference cost scales with usage in a way classic
software cost never did — the field's benchmark bands tell the story: classic
subscription software runs high-seventies to eighty-percent gross margin,
while inference-backed products commonly land in the fifties to seventies,
with inference alone reaching double-digit percentages of revenue at scale.
And the share tends to *grow* as a product matures, because usage deepens
faster than prices rise. A customer profitable at signup erodes toward
breakeven as their usage compounds under a flat price. The daily margin trend
— revenue recognized per day by the same rule as the rollup, cost from the
per-day attribution series — exists to catch that trajectory while there is
still time to reprice, and to make the thin-margin band visible before it
crosses zero (margin-erosion-forecasting).

## Failure modes of the naive reading

- **Booking the measuring instrument into COGS.** Quality spend in the cost
  sum inflates every customer's cost and, worse, couples "we scored more
  traces this week" to "our customers got less profitable".
- **Cash-basis revenue.** Recognizing payments at charge time makes margin a
  sawtooth artifact of billing dates. Amortize.
- **Zero-filling the unattributed.** Dropping untagged cost, or spreading it
  pro-rata across customers, both fabricate precision. It gets its own row.
- **Percentage worship.** Ranking by margin percentage buries the large
  absolute losses of large customers under the dramatic percentages of tiny
  ones. Rank by dollars; show percentage as color.
- **Two recognition implementations.** The rollup and the trend drifting apart
  by even one refund's sign convention destroys trust in both.
- **The unlabeled simulation.** One screenshot of a what-if without its
  "simulated" stamp, forwarded twice, becomes the number the company believes.

The subject is small — a handful of pure functions over two event streams —
but it is the point where observability stops being engineering telemetry and
starts being the company's accounting. It deserves accounting's discipline.
