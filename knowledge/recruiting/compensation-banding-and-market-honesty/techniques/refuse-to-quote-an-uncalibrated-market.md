---
layer: technique
type: technique
subject: compensation-banding-and-market-honesty
technique: refuse-to-quote-an-uncalibrated-market
status: forged
laws: [say-only-what-the-record-holds, absence-of-evidence-is-not-evidence, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [adding a market or a role family the corpus does not cover, a pricing path must always return something, deciding what an uncalibrated market emits]
---

# Refuse to quote an uncalibrated market

The most valuable behaviour a compensation system can have is the ability to
produce **no number**. Almost none do, because a function that returns a figure
is easier to write than one that returns a figure or a reasoned silence, and
because a blank space looks like a bug to everyone who sees it.

## The empty default is a legal value

Model a market as a **configuration record**: currency, period, plausibility
ceiling, rounding grain, modifier clamps, and the default seniority bands. Then
make the crucial declaration explicit — **an empty default-band list is a valid,
deliberate configuration**, meaning "this market exists, we know its currency
and its rules, and it has not been calibrated". It emits nothing and routes to
a human.

Writing it down matters more than it sounds. An empty list that is merely a
consequence of nobody filling it in will be filled in by the next person who
sees a blank, usually with a plausible-looking placeholder copied from a
neighbouring market and never revisited. An empty list documented at its
definition as *the correct state for an uncalibrated market* survives that
person. The comment is the control.

The alternative — seeding new markets with defaults so the code path always
returns — produces the worst possible artefact: a placeholder somebody typed
while stubbing out a country, wearing the same label as a sourced band, quoted
at a hiring manager, printed in an advert, and defended in a negotiation
([say only what the record holds](../../_laws.md#say-only-what-the-record-holds)).

## The demonstration market

A related and easily-missed case: the second market that exists to prove the
configuration seam is real. It has a currency, a period, a ceiling and a
location, all plausible, and no benchmark data behind them whatsoever.

Such a market must **declare in its own definition that it is a
non-production sample and not a claim to hold real data for that country**, in
the same place a reader meets it. A demonstration market that looks like a
configured one is quoted within a quarter, because it is indistinguishable from
the real one at every call site. Its bands stay empty for exactly the reason
above; the label stops someone helpfully filling them in.

## What refusal must look like

A refusal is a **stated outcome, not an absence**. Three requirements:

1. **It is visible.** A sentence naming the reason — "no calibrated band exists
   for this role family in this market" — where the number would have been. A
   greyed control, a dash or an empty card is read as a loading state or a bug,
   and is worked around rather than escalated.
2. **It names a next actor.** Refusal that ends the interaction stalls the
   requisition, and a stalled requisition eventually gets an invented number.
   Route it: to the compensation owner, to the corpus reviewer, to whoever can
   authorise a range without a benchmark ([no adverse outcome is solely
   automated](../../_laws.md#no-adverse-outcome-is-solely-automated)).
3. **It is counted.** Refusals per market and per role family are the backlog
   for corpus work. Uncounted, refusal is indistinguishable from coverage, and
   the gap never closes.

## The trigger conditions

Refuse — do not estimate — when any of these hold:

- **No calibrated band** exists for the market at all.
- **No cell** exists for the role family, or the role's title does not map into
  any recognised family.
- **The cell is below its sample floor** and cannot be coarsened without
  crossing a boundary that would make it meaningless.
- **The source is past its staleness limit**, so aging would be forecasting.
- **The figure exceeds the market's plausibility ceiling**, which means the
  derivation or the configuration is wrong and the output must not be shown.
- **The comparison is incomparable** — currency, period, gross-versus-net, base
  versus total — with no dated, sourced conversion.

In each case the refusal must say *which* condition fired. "No band available"
is a dead end; "no band for this role family in this market — thirty-one other
families are calibrated here" is a work item.

## Silence must survive the whole path

The hardest part of this technique is not producing the refusal but keeping it.
Silence is fragile, and it is lost in the same three places every time:

- **A default parameter** two layers down that turns a missing band into zero,
  or into the market's midpoint.
- **A rendering fallback** that shows the previous value, the neighbouring
  market's value, or a hard-coded example when the real one is absent.
- **An aggregate** that folds refusals into a denominator. A dashboard reading
  "eighteen percent of roles are below market" computed over a population where
  a third of the comparisons refused is a fabricated statistic; unknown is a
  category, not a negative ([absence of evidence is not
  evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

Test the refusal path as deliberately as the success path. A refusal that has
never been exercised end-to-end in a test is a refusal that is being quietly
converted into a number somewhere in the middle.

## Decision rules

- When creating a market, **create it uncalibrated** with an empty band list —
  never seeded from a neighbour.
- When a caller needs a number and none exists, **return the refusal with its
  reason**, and let the caller decide. Never let the producer invent a fallback
  on the caller's behalf.
- When a refusal reaches a person, **name who can resolve it**.
- When counting anything derived from bands, **partition into yes, no and
  cannot-say** and publish the third.
- When pressure arrives to "just show something", the answer is to **calibrate
  the market**, and the count of refusals is the argument for the budget to do
  it.

## When not to use this

- **Where a legally mandated posted range makes silence non-compliant.** A
  jurisdiction requiring a good-faith range in the advertisement leaves no room
  for "no figure" in the posting itself. Refusal then escalates *earlier* — the
  posting is blocked until a human sets a defensible range — rather than
  disappearing. The refusal moves; it does not become an estimate.
- **Where a rough order of magnitude genuinely suffices** and is framed as such
  to a single expert reader who will treat it as a prior. Even then, it must
  not be stored in the field consumers read, or it will be quoted as a band by
  the end of the week.
