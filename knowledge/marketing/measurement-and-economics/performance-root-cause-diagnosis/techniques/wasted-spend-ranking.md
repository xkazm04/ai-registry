---
layer: technique
type: technique
subject: performance-root-cause-diagnosis
technique: wasted-spend-ranking
status: forged
laws: [not-measured-is-not-zero, one-target-one-threshold]
shared_with: []
use_when: [choosing which campaigns a diagnosis names, ranking "worst" for a prompt or a digest, a small campaign with a terrible ratio keeps topping the list]
---

# Wasted-spend ranking

"Worst" in a diagnosis means the campaign whose fix recovers the most money, not the
campaign with the ugliest ratio. The two disagree constantly: a tiny campaign at a
tenth of target return leaks a few hundred a month, while a large campaign slightly
over target leaks thousands. A diagnosis that names the first has picked a subject
whose fix will not move the portfolio number, and the owner will notice when the
outcome chip stays grey.

## The definition

Wasted spend is the money the agreed target does not justify:

- A campaign that spent nothing wastes nothing.
- A campaign with no conversions, or no conversion value, wastes **all** of its spend.
- A converting campaign wastes the part of its spend above what its conversion value
  earns at the target cost share: spend minus (conversion value times target cost
  share), floored at zero.

A campaign at or under target therefore wastes zero regardless of its neighbours. The
target is the business's single agreed one for the scope, read from the same place
every badge reads it ([one target, one threshold](../../../_laws.md#one-target-one-threshold));
the ranking must never carry its own.

**When ranking campaigns for a diagnosis, sort by wasted spend descending and break
ties by spend, because waste is the recoverable amount and spend is the exposure -
never sort by return or by cost share alone.**

## Procedure

1. Compute waste per campaign from the target. Rank descending, ties by cost.
2. Take the top few with positive waste as the "worst" set. Six is the convention this
   subject was reconciled against - enough to cover a portfolio's real problems, few
   enough that a prompt or a card stays readable.
3. If no campaign wastes, take the single least efficient spender - highest cost share
   of revenue, ties by cost - so the diagnosis still has a subject. An empty worst list
   over a healthy portfolio reads as a broken tool.
4. Build the "best" set from the remainder: spending, converting, not in the worst
   set, ranked by return then by conversion value. Three is the convention. These are
   the destinations a lever may name.
5. Scope the whole ranking to one currency. When networks disagree on currency, rank
   and total the primary network alone and label the scope; a ranking that adds two
   currencies has ordered a fiction
   ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).

## Why waste and not return

Return on ad spend is a ratio and ratios hide magnitude. Ranking by return puts every
zero-conversion campaign at the top regardless of size, and then orders the converting
ones by a number that says nothing about how much money is at stake. Waste puts a
currency amount beside each campaign - "this one leaks this much" - which is the
sentence the owner can act on, and which the lever can quote. It also makes the
subject of the diagnosis deterministic: re-running unchanged data names the same
campaign, so the ledger keys stay stable.

## Decision rules

- When a campaign's conversions are positive but its value is zero (a lead campaign
  with no value assigned), treat it as wasting all of its spend and say why: the target
  is a value share, and without value the target cannot justify anything. The owner's
  fix may be to assign a value, not to pause.
- When the target is absent, fall back to the scope's default target and label the
  fallback; never rank against no target, and never invent one.
- When the worst set contains a campaign the model was not shown, the ranking and the
  prompt have diverged; rebuild the request rather than patching the response.
- When a diagnosis is about a cohort or a lead source rather than a portfolio, the same
  shape applies with a different quantity: the lowest lifetime-value ratio, the source
  with the worst cost per qualified lead. Rank by the amount at stake, not by the
  ratio alone.

## When NOT to use

- For profitability. Waste against a revenue-share target is an efficiency reading;
  with a margin the analogous ranking is profit destroyed, which belongs to the profit
  economics subject. Do not present waste as loss.
- For campaigns whose role is prospecting under a last-click read. Their return is
  under-credited by construction, and waste computed from it over-ranks them; the
  triage discipline's funnel roles decide which campaigns a return threshold may judge.
- Across currencies, ever.
- As the whole diagnosis. Ranking picks the subject; the ladder picks the cause. A
  ranking without a cause is a table, not a diagnosis.
