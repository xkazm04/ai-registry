---
layer: technique
type: technique
subject: recruiting-cost-and-automation-economics
technique: date-every-derived-money-figure
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, say-only-what-the-record-holds]
use_when: [publishing a cost-per-hire figure, blending spend from several sources, deciding whether a money number is still true, exporting a cost figure out of the product]
shared_with: []
---

# Date every derived money figure

A derived money figure carries an as-of date, and where it blends several
inputs, the date it carries is the date of its **stalest** input, not the
moment the arithmetic ran.

A rate is a historical fact: a conversion rate for last quarter stays true
about last quarter forever. A currency amount behaves differently. Rate cards
are renegotiated, agency terms change, advertising prices move seasonally,
and the cost of a unit of computation falls without warning. A figure derived
from those inputs is not a fact about a period, it is an *estimate of today*
built from inputs of assorted ages — and nothing in the rendered number
announces which. Averaging is a laundering operation for staleness: a blend
of one current input and one two-year-old input looks exactly as fresh as a
blend of two current ones.

## Procedure

1. **Attach an as-of date to every input at the point it enters the model** —
   invoiced amounts, rate cards, per-unit prices, the manual baseline, the
   loaded hourly rate. An input with no date is treated as maximally stale
   until someone dates it.
2. **Propagate by minimum.** A composite's as-of date is the earliest date
   among its contributing inputs. Propagate through every layer; a
   three-level derivation must not reset the clock at each division.
3. **Render the date next to the figure**, not in a tooltip and not in an
   export footnote. The date is part of the number in the same way a currency
   symbol is.
4. **Define a staleness horizon per input class** and say what happens past
   it. An invoiced fee ages slowly; a compute rate card ages in months; a job
   advertising price ages in weeks during hiring season. One global expiry is
   wrong for all of them.
5. **Past the horizon, degrade rather than hide.** Show the figure with an
   explicit "as of" and a stale marker. Silently withholding an old number
   leaves the reader with nothing, and they will fetch a worse number from
   somewhere else.
6. **Carry the date into every export.** A figure copied into a slide loses
   its interface; if the date is not in the cell, it is gone.

## Decision rules

- When a recomputation refreshes only some inputs, the composite's date does
  not advance. This is the rule that costs the most to implement and prevents
  the most damage: a nightly job that re-runs the arithmetic over an unchanged
  two-year-old rate card must not stamp today on the result.
- When an input's date is unknown, do not guess it forward. Unknown means
  stale; the figure is published with the stale marker or not at all.
- When a figure is compared against a target or a prior period, both sides
  state their dates, and a comparison across a rate-card change is annotated
  as such — otherwise a pricing change renders as an efficiency win.
- When a money figure is stored, store the date beside it rather than
  reconstructing it later from a modification timestamp. A row's write time is
  not the same as the vintage of the prices that produced it.
- When a per-unit price is versioned, price historical usage at the rate in
  force when it was consumed, not at today's rate. Repricing history makes
  past periods move every time the vendor changes their card, and the movement
  will be attributed to the hiring team.
- When someone asks to hide the date because it makes the figure look old,
  that is the technique working
  ([say only what the record holds](../../../_laws.md#say-only-what-the-record-holds)).
  The fix is refreshing the input.

## The freshest-looking number is usually the least trustworthy

The counter-intuitive rule worth stating for anyone building one of these
surfaces: **prefer a visibly old figure to a freshly-computed one built on
inputs of unknown age.** The first tells the reader exactly how much to trust
it. The second is indistinguishable from a good number until a finance team
asks where each component came from, at which point it collapses along with
everything shown next to it. A dated figure survives that meeting; an undated
one takes the dashboard down with it
([a claim carries its sample and its basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).

## When not to use this

Do not date a raw recorded count. "Forty-one applications received in July"
needs a window, not a vintage — the observation window is a funnel-metric
concern and is already governed there. This technique applies to figures whose
*value depends on prices*, which is money and only money.

Do not use an as-of date as a substitute for refusing. A figure built on an
input so old that it is certainly wrong is not rescued by being labelled; past
some horizon the honest output is that the figure cannot currently be given.

Do not let dating become the only honesty control on the surface. A correctly
dated figure computed over a denominator nobody can defend is still an
indefensible figure, dated.
