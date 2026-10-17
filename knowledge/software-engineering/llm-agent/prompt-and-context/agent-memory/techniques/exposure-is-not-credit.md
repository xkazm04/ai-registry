---
layer: technique
type: technique
subject: agent-memory
technique: exposure-is-not-credit
status: forged
laws: [count-carries-predicate, derivation-names-recomputation]
shared_with: []
use_when: [a memory or rule store learns helpful or harmful from task outcomes, a session verdict is applied to every item the session was shown, items are promoted to a trusted or proven class by accumulated credit, an always-on or generic tier collects feedback, retrieval weights are tuned offline from outcome labels, a passive harvester joins delivered items to later success or failure]
---

# Exposure is not credit

A memory system that learns from outcomes has to answer one question before any
arithmetic: **which item does this outcome belong to?** The cheapest answer, and the one
most stores reach for first, is "every item the run was shown". A session ends, it is
graded, and the grade is copied onto each rule or fact that reached its context. The
signal is signed, it arrives for free, and it looks like exactly the thing the usage
term in [memory-value-model](./memory-value-model.md) was waiting for.

It is not. **A verdict on a whole run, copied onto every item that run delivered, is
signed per run and unsigned per item.** Its expected value for an item is the number of
contexts the item reached multiplied by the base rate at which runs succeed, whatever
the item contributed. Agents finish most of what they start, so the base rate is high,
and the sign carries almost nothing: the score is the delivery count again, wearing a
plus.

## What the shared verdict actually ranks

Measured on a replayed year of one simulated user (194 probes, a recorded context per
probe of 59 to 100 items, 92% of answers graded correct), crediting every delivered item
with its probe's grade produced scores whose rank correlation with **how often the item
was delivered was 0.82**, and with **whether the item ever carried the answer, 0.06**.
Of the 36 items that crossed a conventional promotion bar (ten decayed helpful marks,
under 10% harm), **25 never carried an answer to any probe.** The store's second read
mode reproduced it: 0.81 against 0.05, and 23 of 33. Nothing in either context was
selected by the feedback; the credit was computed after the fact over contexts a
relevance retriever had already chosen, which is the condition under which the shared
verdict had its best chance to look sound.

The items that win are the ones delivered most, and in a live store those are the
standing items: the always-on tier, generic process advice that matches every task, a
record whose wording overlaps many queries. The feedback loop then promotes exactly the
material [recall-injection](./recall-injection.md) says must be jealously guarded, and
because promotion raises delivery, it does so on a ratchet.

## A guard on blame does not repair the unit

The first symptom anyone notices is the flood in the other direction: one failed run
marks dozens of shown items harmful at once. The natural fix withholds blame when the
delivered set is large, or when the negative signal is weak. That leaves credit
ungated, which is the ratchet above with its only brake removed.

Making blame symmetric instead is worse, and measurably: on the same contexts, applying
each failure to every delivered item pushed **44 and 69 genuinely useful items below
neutral** in the two read modes and dropped the share of useful items among the top 25
from 0.36 to 0.08. The base-rate failures land wherever the run looked. **The defect is
the unit of attribution, not the sign or its guard.**

## Attribute through a channel the outcome can name

An outcome may credit an item only through evidence that ties the outcome to that item.
In descending order of strength:

1. **A contrast.** The run's outcome with the item against the outcome without it, by a
   held-out or randomized omission. This is the signed probe memory-value-model
   specifies where a consumer's uncertainty is observable; a randomized omission slot is
   its form when only the final grade is.
2. **Use evidence.** The consumer's output demonstrably used the item: it cited the item
   deliberately, or carried distinctive content that the question did not. Measured on
   the contexts above, crediting only items the answer used raised the share of useful
   items in the top 25 from **0.36 to 0.92** (and 0.32 to 0.96 on the second mode).
3. **Propensity weights**, where the evidence is a choice made over a ranked list. The
   probability that the ranker exposed an item is estimated and the feedback divided by
   it; the counterfactual learning-to-rank literature derives this correction for
   position-biased clicks, and the memory case is the same estimator with the context
   pack as the list.

**One channel cannot carry both kinds of mark.** A protocol that asks the consumer to
name the ids it followed, and a grader that then harvests every id-shaped token from the
transcript, have merged deliberate citations with incidental mentions, and a size
heuristic is the only thing left to tell them apart. Mark the citation at its source.

## Blame through use has its own failure

Use evidence says an item was **read**. It does not say the item **misled**. On the same
contexts, blaming every item an incorrect answer used pushed **7 and 11 useful items
below neutral** against none under the shared verdict, which failed the floor declared
for the comparison. Read one by one, the 18 split three ways. Five were supersedence
records that carry both values ("moved from the old one to the new one"), blamed when
the reader picked the old value out of a record that also held the current one. Nine
were procedures, fixes or failure causes that the answer applied and that were still
graded wrong, so the item was right and the answer around it was not. Only four stated a single value that had since changed, the one case where the
item itself was what misled. In fourteen of eighteen, the error was the read's or the
grade's, not the item's; [stale-served-versus-stale-answered](./stale-served-versus-stale-answered.md)
measures the read's layer separately for the same reason.

So blame through use only where the item's own content is what was wrong - it states a
value for the key that is not current - and otherwise attribute the error to the read or
the grade and record it there. Without blame through use, the same arm held the floor at the same
precision (measured after the fact, on the same data, so it is a lead for the next
store rather than a result).

## Silence is neutral, and silence is most of the store

Use credit is sparse. It reached about 56% of the useful items in a simulated year and
carried no item over the promotion bar at all, because an answer uses a handful of the
items it is shown. Three consequences:

- **No credit is not harm.** An item without evidence scores neutral, never below it,
  and never "unproven, therefore demote".
- **Credit is a bounded tiebreak**, applied inside relevance and never instead of it,
  under a stated bound like the one the value model puts on usage, and shrunk toward
  neutral while the evidence count is small - so a precise but thin signal reorders
  near-equals and cannot enthrone anything.
- **Promotion by credit needs volume the store states.** A promotion bar that a precise
  channel cannot reach in a year is a bar that only the imprecise channel will ever
  clear. Either the bar is set against the precise channel's rate, or promotion goes
  through review instead.

## Learning offline from outcomes inherits the exposure

A tuner that fits retrieval weights to outcome labels is the same attribution with a
longer delay. Its labels exist only for items the incumbent ranking already put in
front of a consumer, and an item the incumbent ranked below the cut contributes nothing
to the fit, so the tuner converges on its own teacher. A deterministic grid, an abstain
floor and an explicit promote step make that convergence reproducible and reversible;
they do not make it independent. It needs one of: a small randomized exploration slot in
the live pack, propensity weights on the labels, or labels from a channel that does not
pass through the ranker. **Report the share of labels from items the incumbent ranked
below the cut.** Zero means the tuner cannot disagree with what it is tuning.

## Three quieter exposure channels

- **Rediscovery as reinforcement.** A write path that records a helpful mark when the
  distiller re-proposes an existing item is crediting the distiller's repetition. The
  item was re-derived, not used.
- **The proposer reads the scores.** A reflection pass shown each item's credit counts
  proposes in the light of them, so whatever bias the counts carry feeds the next
  generation of items.
- **The store grades its own calls.** Where the system's own model calls are captured
  through the same door as real sessions, an id that appears only inside a prompt the
  store wrote can earn credit for itself. Exclude the store's own traffic at capture
  and again at grading; either guard alone has been observed to leak.

## Derived signals cannot promote alone

A passive harvester that joins delivered items to later evidence (a passing check, a
closed task, a revert) is a better source than a session verdict and still an
exposure-shaped one. The discipline that keeps it from feeding itself: a low base
weight, at least two corroborating signals, a cap per item per window, never overriding
an explicit mark, and **no promotion or retirement on derived signals alone**. Each of
those cuts the same loop - credit raises rank, rank raises delivery, delivery raises
credit - at a different point.

## The check

Before trusting a feedback-derived score, rank-correlate it on a recorded window
against **exposure** (delivery count) and against an **independent marker of
usefulness** (the item carried the answer; a human mark; a contrast). A score that
tracks exposure more closely than usefulness is measuring delivery, and every count it
reports carries that predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)). The check
needs recorded contexts and verdicts, and no model calls.

## When not to use it

- **Where a per-item contrast exists**, use it; this technique is about outcomes that
  arrive per run.
- **Where nothing flows back from the consumer**, nothing here applies, and the bounded
  delivery count in memory-value-model is the honest instrument.
- **Where delivered sets are small and runs fail often**, a shared verdict carries more
  information per item than in the measurement above. That is a reason to run the check,
  not to skip it.
