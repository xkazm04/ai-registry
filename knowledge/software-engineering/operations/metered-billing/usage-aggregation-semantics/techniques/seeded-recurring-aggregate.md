---
layer: technique
type: technique
subject: usage-aggregation-semantics
technique: seeded-recurring-aggregate
status: forged
laws: [unknown-is-not-a-value, one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [a metric measures something that existed before the period opened, the first period after enabling a recurring metric, a customer is billed for storage they never re-uploaded, a recurring count grows every period]
---

# Seeding a period-crossing aggregate

A *recurring* metric measures state that persists across period boundaries:
storage uploaded in one month and still held in the next, seats assigned
last quarter, instances that have been running since before the customer
was on this plan. The period contains no event about any of it. So the
aggregate at the instant the period **opens** is a real, nonzero quantity
that the period's own events cannot supply, and it has to be seeded.

Getting the seed is the easy half. The hard half — the one that produces a
bill growing without bound and takes weeks to diagnose — is keeping the seed
in agreement with the aggregation's own assumption about what was true
before the window.

## Three sources, in order

The opening value is resolved from three sources, tried in a fixed order,
and *which one answered* is part of the result:

1. **A carried-over stored value.** If the previous period closed and
   persisted its terminal state for this (customer, subscription, metric,
   group), that value is the seed. This is the fast path and the normal
   one, and it is the only source that is O(1).
2. **Re-derivation from the prior stream.** If no stored value exists — the
   metric was enabled mid-life, a period was never closed, a migration
   dropped the row — the seed is computed by folding the earlier events,
   using the same fold this period will use. It is expensive and it is
   correct, which is the right trade for a path that should be rare.
3. **An explicit zero.** Only when there is genuinely nothing before: the
   subscription is new, or the metric provably has no prior events. This is
   an assertion about the world, not a fallback.

The order matters because the sources disagree in a specific way when
history is imperfect. A stored value reflects what was *billed*; a
re-derivation reflects what the events *say*. When they differ, the stored
value is the one to prefer for continuity — the customer's previous invoice
was built on it — and the difference is worth surfacing rather than
silencing.

**The seed is not the previous period's bill.** For a level metric the
period produces two numbers — the integral, which was invoiced, and the
level at the closing instant — and it is the second one that seeds. Reading
the stored aggregate without checking which of the two it holds decays the
customer's level toward zero one period at a time, with every individual
period's arithmetic checking out.

**Record what answered, and when.** Alongside the seed, store which of the
three sources produced it and the timestamp of the last event it accounts
for. Both are cheap at write time and unreconstructible later, and both are
the first things anyone asks during a dispute: a seed with no provenance
cannot be defended, and a seed whose "last accounted event" is older than
the previous period's end is visibly a gap rather than a number to argue
about.

## The seed follows the customer, not the subscription row

The lookup key deserves a paragraph of its own, because getting it wrong
produces a defect that only fires on plan changes and therefore only on
paying customers who are upgrading.

An upgrade or downgrade very often does not mutate a subscription record —
it **terminates one and creates another**, so that each carries its own
plan, price and dates. A seed keyed on the internal subscription row
therefore finds nothing on the first period after any plan change, falls
through to source 2 or 3, and the customer's entire carried level either
gets re-derived at cost or silently vanishes. The metric measures something
the customer holds; the customer did not put it down when they upgraded.

Key the seed on the identity that spans the change — the customer-facing
subscription identifier the emitter uses, which is stable across the
replacement — per
[identity surviving reuse](../../../../_laws.md#identity-survives-reuse). The
same reasoning makes source 2's re-derivation window span the *prior*
subscription's events rather than the current row's, which is the only
reason source 2 is able to answer at all in the case it exists for.

## An absent seed is not a zero seed

The failure that turns this from bookkeeping into a defect: source 3 used as
a *default* rather than as an assertion. Per
[unknown not being a value](../../../../_laws.md#unknown-is-not-a-value), "we
could not find carried-over state" and "the customer held nothing" are
different facts, and only one of them is safe to bill.

Both directions cost money and only one is visible:

- **Unknown read as zero** bills a customer nothing for everything they
  already held. It looks like a quiet month. Nobody reports it.
- **Unknown read as a re-derivation over a store that has been pruned**
  produces a seed that is confidently too small, with the same effect and a
  worse audit trail, because the number now has a provenance that looks
  legitimate.

So the resolution records its source, and a run that reached source 3
without being able to assert emptiness is a *failure*, not a zero. Refuse to
close the period; park it for review. A zero on an invoice line for a
customer with a terabyte in the store is the single hardest billing error to
detect after the fact, because there is no anomaly — there is an absence.

## The boundary convention has exactly one authority

Here is the trap, and it is worth the whole technique.

Any fold that replays state over a window must decide what an entity's state
was **immediately before the window opened**, and it answers that with a
default buried in the query — the value a lookback takes when there is no
prior row. For a window-closed metric that default is "not held", which is
what makes a leading remove absorbable and a leading add meaningful.

The seed answers the same question from the other side, and for a recurring
metric it answers **the opposite**: things were held before the window; that
is what recurring means.

Two halves of one decision, maintained in two places, by two people, in two
languages. When they disagree, nothing crashes. What happens instead:

> The seed asserts that a hundred identifiers were held at the period's
> opening instant. The replay's own default asserts that nothing was held
> before the window, so every identifier still present is read as a fresh
> addition inside this period. The period bills a hundred new units. The
> next period does it again. And the one after that. The bill is not wrong
> by a constant — it is wrong by the entire carried population, every
> period, and it looks exactly like a growing customer.

The rule, per
[one authority per vocabulary](../../../../_laws.md#one-authority-per-vocabulary):
**the pre-window convention is declared once and both halves derive from
it.** Not a comment in each; one value that the seed loader and the fold
both read. When the metric is recurring, the pre-window state is "held" on
both sides; when it is window-closed, it is "not held" on both sides. A
metric that can be either must carry the flag into the fold, not just into
the loader.

Test it with the case that distinguishes them: a customer with prior state
and **zero events in the period**. A window-closed reading returns zero; a
recurring reading returns the carried level. If the code returns the carried
level for one metric shape and zero for another where both should agree, the
two halves have already diverged.

## Grouping multiplies the seed

A metric dimensioned by anything — region, product, tier, tenant sub-account
— needs **one seed per group**, resolved independently. A single global seed
applied to a grouped fold assigns the whole prior population to whichever
group the fold happens to attribute it to, and the totals still add up,
which is why it survives review. Grouped metrics are also where source 2
becomes genuinely expensive, and where a missing carried-over row for one
group among forty is easiest to overlook. Resolve per group, record the
source per group, and fail the period if any group landed on an unasserted
zero.

## The seed is stored, so it names its recomputation

The carried-over value is a persisted derived number and falls under
[derivation naming recomputation](../../../../_laws.md#derivation-names-recomputation).
Its path is source 2 — fold the prior events — and unlike the high-water
mark's, this one is a genuine oracle: a recurring seed *is* a pure function
of the history, so a periodic comparison of stored seeds against a
re-derivation is a legitimate and valuable check. Run it on a sample,
compare, and alert on divergence rather than silently rewriting: a
divergence means either the store was pruned or a period closed wrongly, and
which one it is changes what you do about it.

## Decision rules

- **If the metric's subject cannot outlive a period, it is not recurring.**
  Requests, deliveries, renders: the events are the whole story and a seed
  is a permanent source of confusion. Recurrence is a property of the thing
  being measured, never a configuration convenience.
- **Seed at the period's opening instant, not at the first event.** These
  coincide only when an event happens to land on the boundary, and the
  difference is the interval a customer holds state unbilled.
- **When enabling recurrence on an existing metric, backfill the first
  seed deliberately.** The transition period has no carried-over row by
  construction, so it will take source 2 over the entire history or, worse,
  source 3. Compute the first seed as a migration step and store it.
- **Do not seed from the current state of the customer's system.** It is
  the state *now*, not the state at the period's opening instant, and using
  it makes the aggregate non-deterministic — the same period re-run
  tomorrow returns a different number, which forfeits every dispute.

## When not to use this

- **Window-closed metrics.** A seed of zero that is genuinely asserted is
  not this technique; it is the absence of it. Do not install the machinery
  to hold a constant.
- **Where the previous period's terminal state is not trustworthy** — a
  first migration, a store known to have gaps, a metric whose definition
  changed. Re-derive explicitly for as long as that is true, and say in the
  runbook when the fast path becomes safe again.
- **Where the customer would not accept a charge with no corresponding event
  in the period.** Some contracts require every billed unit to trace to
  something the customer did during the period. That is a commercial
  constraint, not a technical one, and it makes the metric window-closed
  whatever the storage looks like.
