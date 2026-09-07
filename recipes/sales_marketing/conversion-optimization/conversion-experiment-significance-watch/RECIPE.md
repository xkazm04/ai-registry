---
name: conversion-experiment-significance-watch
version: 0.2.0
status: seed
domain: sales_marketing
path: sales_marketing/conversion-optimization
---

# Conversion experiment significance watch

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** An experiment called early is worse than no experiment, because the wrong
variant then ships carrying the authority of a measurement. The usual way it happens is
not carelessness: it is a team looking at the numbers whenever they change and stopping
the first time the line goes green, which turns a nominal one in twenty chance of a
false winner into something closer to one in four.

**Input.** The ledger of in flight experiments with their per arm exposure counts, the
metric each was declared against, the horizon each declared before it started, and the
record of what has already been proposed and refused.

**Core action.** Decide for each experiment whether it has actually earned a verdict
under a rule fixed before the data was seen, check that the measurement itself is sound
before reading any effect from it, and propose what to do rather than doing it.

**Output.** Each in flight experiment carries a current classification that names which
rule produced it, experiments that cannot answer their own question are said to be
unanswerable, and every promote, revert or archive sits as a proposal a person accepts
or refuses.

## Activities

1. Read every in flight experiment, its declared horizon and its per arm exposure counts
*(observe)*
2. Check the health of the measurement before reading any effect from it *(decide)*
3. Judge each experiment against the horizon it declared before it started *(decide)*
4. Classify each as still running, decided, or unable to resolve at this traffic *(act)*
5. Put each promote, revert or archive up as a proposal and record the look either way
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**No experiment is called before the horizon it declared, and no verdict rests on a
statistic that repeated looking has already invalidated.**

- An experiment that declared no horizon before it started is reported as unreadable
  rather than given a verdict, because a fixed horizon significance test read at a
  moment the data chose is not evidence.
- Either a look before the horizon reports progress toward it and says nothing about the
  effect, or the statistic used is one that remains valid under repeated looking, and
  the read says which of the two it is.
- Repeated looking is treated as the normal condition of this work rather than as an
  exception, because a watch that runs whenever data arrives is peeking by construction.
- A declared duration covers whole weeks, so a stop does not land on an unrepresentative
  slice of the weekly cycle.
- An experiment whose declared effect is unreachable at this traffic within any duration
  the adopter would tolerate is reported as unable to answer, and that is delivered as a
  verdict rather than left quietly running.
- A refusal is treated as a claim about the stopping rule rather than about the number,
  so it is recorded against the rule that later experiments will declare and dated, and
  never applied to the experiment in flight, whose horizon was fixed before anybody
  looked.

**A broken measurement is caught before anybody reads a result from it, rather than
after the result has shipped.**

- The observed split between arms is tested against the intended split before any effect
  is reported, and an experiment whose allocation has drifted is reported as invalid
  with its effect withheld rather than shown alongside a caveat.
- That test runs at a far stricter threshold than the one applied to the effect, because
  it is applied to every experiment at every look and a false alarm there halts a sound
  experiment.
- A result the arithmetic argues against, a negative lift reading as a win or a rate
  outside the range the counts allow, is reported as a defect in the measurement rather
  than as a surprising finding.

**Nobody's live traffic changes without a person having approved it, and the number of
times the experiment was looked at is itself on the record.**

- Every promote, revert or archive sits in review before anything is called, and a
  refusal is recorded with its reason rather than retried silently.
- Every look leaves a durable record, including the looks that changed nothing, so how
  often an experiment has been examined is observable rather than assumed.

## Guidance

Significance is not a line an experiment eventually crosses; it is a property of a test
whose stopping rule was fixed before it began. A watch that looks whenever data arrives
breaks that by construction, so either report progress toward the declared horizon and
stay quiet about the effect, or use a statistic that survives repeated looking, and say
which you did. Check the allocation before the effect: a split that has drifted has no
valid result to caveat. Tell an underpowered experiment early.

## Where this is worth adopting

- A team that opens the experiment dashboard every morning and ships whichever variant
  is green that day, which is the most reliable way there is to ship a coin flip with a
  measurement behind it.
- A site with a few thousand visitors a week to the page under test, where the lift the
  team is hoping for would take months of traffic to detect and nobody has ever worked
  out that it cannot be found.
- A program where a redirect, a bot filter or a caching layer sends more traffic to one
  arm than the other, and every result since it started has been read as a finding.
- An operator running experiments alone with no statistician to argue with, who needs
  the watch itself to be the thing that refuses to call a winner early.
- A quarter in which every experiment came back positive, where the honest reading is
  that the stopping rule produced the results rather than the variants.

## Connector types

`analytics`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[posthog](examples/posthog.md) for `analytics`.

## Recommended trigger

`self_paced`. An experiment reaches its horizon on its own traffic rather than on a
calendar, so a clock is the wrong instrument. The honest consequence is that this recipe
looks repeatedly and at moments the data influences, which is exactly the condition that
invalidates a fixed horizon test, and the method has to account for it rather than the
schedule pretending it does not happen. Look when enough new exposure has accumulated to
move an experiment toward its horizon, and less often once every one is far from it.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What the adopter counts as a conversion here, since every verdict is computed against
  one metric and the wrong one produces confident nonsense.
- The smallest change the adopter would actually act on, because that number together
  with the traffic decides whether any of these experiments can be answered at all, and
  it is the input nobody supplies unprompted.
- How much traffic the page under test really gets, since a sample size floor set
  without it either never fires or never lets anything finish.
- Whether the binding that reports the per arm counts can also deploy a variant, because
  when it cannot, an accepted proposal has nowhere to land and the adoption needs a
  second binding or the loop honestly stops at the proposal.
- How consequential a live traffic change is considered here, which sets how cautious a
  classification has to be before it is offered at all.

## Dependencies

- an experimentation backend able to split traffic and report per arm exposure counts
