---
layer: technique
type: technique
subject: cost-metering
technique: price-tables
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [deciding what an unpriced model should cost, estimate and actual diverge for one model, retroactively repricing already-written rows, a vendor published the date its introductory rate ends, a rate row is keyed by the constant that names the current model]
---

# Price tables

Everything downstream of metering — ledgers, budgets, dashboards — deals in
currency, but the provider deals in units: tokens in and out, minutes,
generations, requests. The price table is the single conversion between the
two, and because *everything* consults it, its defects are systemic: a wrong
rate does not make one number wrong, it makes every cost the product has ever
shown for that model wrong, in agreement.

One scoping rule before any of the mechanics: **the table is not the bill.**
When the provider's own meter reports a per-call cost, that figure is
authoritative and the ledger records it verbatim; the table's jobs are
pricing *estimates* before the call and *sanity-bounding* actuals after it.
A local units-times-rate reconstruction silently omits every unit class and
discount the table does not model, and the gap grows exactly as the provider's
pricing gets more sophisticated. Where no meter reading exists, the table is
the fallback authority — and the row says which of the two priced it.

## The shape of a rate

A usable rate entry is more granular than "this model costs X":

- **Direction split.** Input units and output units are priced separately,
  routinely differing by 3–5×. A single blended rate is wrong on every call
  and wrong differently per workload: a summarization call (huge input, tiny
  output) and a generation call (tiny input, huge output) at the same
  blended rate mis-cost in opposite directions, so the errors do not even
  cancel in aggregate — they redistribute cost between features.
- **Family resolution.** Providers version models faster than tables update,
  but variants within a family usually share pricing. Resolving a concrete
  model identifier to a priced *family* (by declared prefix rules, not
  substring luck) keeps the table small and makes it robust to point
  releases — while still recording the *concrete* identifier on the ledger
  row, because the family is a pricing convenience and the identifier is the
  attribution fact.
- **Unit denomination stated.** Rates quoted per unit, per thousand, per
  million — off-by-a-thousand is the classic price-table bug, and it is
  unfindable by inspection unless the denomination is part of the entry, not
  a convention in someone's head. This is
  [a count carrying its predicate](../../../../_laws.md#count-carries-predicate)
  applied to a rate.
- **Threshold schedules, where the rate depends on the call itself.**
  Several providers price the *same* unit class differently by the call's
  own context length — one rate up to a published token threshold, a
  higher rate (input commonly doubling) beyond it — while others sell the
  full window at a flat rate. A single per-class number is therefore not
  always a rate; sometimes it is a schedule, and flattening it misprices
  exactly the calls that dominate spend — the longest ones — and in the
  dangerous direction, underestimation. The entry carries the schedule,
  the estimator prices against the call's *projected* size, and the
  sanity bound evaluates actuals against the tier the call actually
  landed in, not the headline rate.
- **All the unit classes the provider meters, not just two.** Providers
  invent unit classes faster than "input/output" admits: cached-context
  reads and writes at their own rates, batch-discounted units, reasoning
  units billed separately. A two-column table applied to a workload
  dominated by a third class does not degrade gracefully — it can miss the
  real bill by an order of magnitude while every row looks plausible. When
  the table cannot yet express a class the provider bills, that is a
  *known* gap with a name, not a rounding error.
- **Dated.** The entry (or the table) carries when its rates were last
  verified against the provider's published prices. An undated table cannot
  even be *suspected* of staleness — the date is what converts "probably
  fine" into a checkable claim.

## One table, one authority

The estimator prices prospective calls; the ledger writer prices completed
ones; the dashboard prices historical aggregates. The moment these consult
different tables — a constant in the estimator, a config file in the writer,
a hardcoded map in the dashboard — the product has
[two authorities for one vocabulary](../../../../_laws.md#one-authority-per-vocabulary),
and they will disagree the first time a provider reprices and only one copy
is updated. The symptom is distinctive: the preflight estimate and the
recorded actual diverge *systematically for one model*, which looks exactly
like estimator drift and burns a debugging day before anyone thinks to diff
the tables. One table, one loader, every consumer imports it.

## The default for unknowns: loud, conservative, counted

A lookup miss is not an edge case; it is the *guaranteed* state for every
model newer than the table. What the miss returns is a policy decision with
exactly one defensible answer:

- **Never zero.** Zero-cost misses make the newest models — typically the
  most expensive per unit — invisible to budgets, free under every ceiling,
  and absent from every dashboard. The failure is silent and compounds until
  the invoice arrives.
- **Never dropped.** Refusing to write a ledger row for an unpriceable call
  trades a wrong cost for a missing call, which is strictly worse — the
  units consumed are gone from the record entirely.
- **A documented, deliberately high default.** Priced at or above the most
  expensive known family, so the error runs in the safe direction: budgets
  over-enforce slightly rather than under-enforce silently, and the
  overcharge is visible on the dashboard as an anomaly someone investigates.
- **Counted.** Every default hit increments a staleness metric and marks the
  row as default-priced. "The table missed 400 times this week" is an
  actionable maintenance signal; 400 silently mispriced rows are not.

## Repricing without stranding history

Providers change rates. The table is therefore **versioned data**, and the
question every versioning scheme must answer is what happens to costs
already written. The clean contract:

- A ledger row's stored cost names its source: meter-reported, or a
  **derivation** — units × rate — and
  [a stored derivation names its recomputation](../../../../_laws.md#derivation-names-recomputation).
  A table-derived row stores the raw units *and* enough pricing provenance
  (table version, or the resolved rate itself) that the cost can be
  re-derived, audited, or restated later; a meter-reported row stores the
  units anyway, because they are what the sanity bound checks against. A
  row storing only the currency amount is an orphan number after the next
  repricing.
- **Historical rows keep their historical price.** Spend already incurred
  was incurred at the rate then in force; retroactively repricing history
  makes closed periods change value after the fact, which breaks every
  comparison and every reconciliation against a real invoice.
- **The effective date lives in the table**, so a backfill or a late-arriving
  row prices by *when the call happened*, not by when the row was written.

## A rate with a published end date

The dated bullet above answers "has this rate gone stale". It does not answer the
case where **the vendor has already told you the rate changes, and when** — an
introductory or promotional rate with a published expiry, commonly a step of 2x on
a named date. That is not staleness. Staleness is a rate that may have moved
without anyone noticing; this is a rate that is *certain* to move, on a date you
already have, and the two need opposite handling: staleness wants a re-check
cadence, a scheduled change wants an alarm.

The first question is not how to store it but **what the number is for**, because
that decides which rate is correct, and two defensible answers exist:

- **If the figure is shown as what is being spent now, or is persisted onto a
  record**, carry the rate actually in force. Booking the future standard rate
  overstates every current cost, and an overstated figure filed beside a user's
  work is as wrong as an understated one.
- **If the figure feeds a comparison across models — a routing decision, a
  bake-off, an ROI argument —** carry the standard rate. A promotional rate makes
  one candidate look cheaper for exactly as long as the promotion lasts, and the
  ranking silently flips back when it lapses. Nothing in the comparison records
  that its winner was chosen on a temporary price.

Both are right for their purpose and they conflict, so a table serving both jobs
has to say which one it is doing. **Whichever is chosen, the choice is written
down next to the number**, because a bare rate cannot be audited against the
vendor's published sheet by anyone who does not know which of the two it is.

Then the date needs somewhere to live that is not a comment. A comment is read
once, by the person who wrote it. The mechanism that works is to **let the
schedule fail something on the day it changes** — a test that asserts the current
date is still inside the promotional window and throws with the new rate in its
message when it is not. This deliberately puts a clock in the suite rather than a
date dimension in the lookup, and that is the trade: a table with no date
dimension stays a pure lookup, and the one temporary exception becomes a build
failure somebody must act on instead of a line nobody re-reads. It costs one test
and it converts a known future defect into a scheduled interrupt.

Two details decide whether it works. The failure message carries **the replacement
rate**, so acting on it is an edit rather than an investigation. And when a later
model ships onto the *same* promotion, it usually inherits the original expiry
rather than opening a fresh window — so the guard covers the set of rows on that
schedule, and adding a row to the table means adding it to the guard.

## A key that follows the model while its value does not

Family resolution above is about a lookup finding the right row. There is a
quieter failure on the other side of the same join, and it survives every check
this technique has so far described.

When a rate row is keyed by **the same constant that names the current model**
rather than by a literal identifier, a version bump edits one place and changes
two things. The key follows the constant automatically, so any test asserting
"every model the router can select has a rate row" stays green — the row exists,
it is reachable, it is correctly named. The *value* underneath it does not follow,
because a number cannot know what it was the price of. The table now confidently
prices the new model at the old model's rate, and the discrepancy can be an order
of magnitude when the versions sit in different pricing tiers.

This is worth stating as a general shape because the guard reads as sufficient and
is not: **an existence check over a computed key proves a row exists for the
current model, never that the row is that model's.** The two claims look identical
in the assertion and diverge the moment the constant moves.

The cheap corrective is to make the join literal where it is checkable — key rows
by the identifier, so a renamed model produces a *missing* row, which the unknown
model policy above already handles loudly and conservatively. A missing rate is a
defect the system is built to survive; a wrong rate wearing the right key is not.
Where a computed key is kept for other reasons, the rate change becomes a second,
explicit edit that no test will ask for, and the file says so at the key.

## Smells

- A currency constant in more than one source file.
- A rate map with no unit denomination in the entry or its type.
- `unknown → 0` (or `unknown → skip`) in the lookup, with no counter.
- Ledger rows that store cost but not units — history that cannot survive a
  repricing audit.
- Estimate-vs-actual drift confined to a single model family (two tables, one
  stale).
- Two lookups in one product with *opposite* unknown-model policies — one
  defaults to a mid-tier price, one to zero — so callers cannot even say
  which failure mode they got.
- A blended per-call rate applied to a direction-split workload.
- A promotional rate with a known expiry recorded only in a comment — or booked
  without saying whether the table prices what is spent now or what models cost
  when compared.
- A rate row keyed by the constant that names the current model, so a version
  bump carries the key across and leaves the number behind.
- A headline per-token rate applied to a workload that routinely crosses
  the provider's long-context threshold.
- A units-times-rate "audit" of meter-reported spend treated as the truth
  when the two disagree — the table is the estimate; the meter is the bill.
