---
layer: technique
type: technique
subject: lead-quality-and-source-diagnosis
technique: cheap-cpl-splits-spam-from-mistargeting
status: forged
laws: [label-convention-as-convention, not-measured-is-not-zero]
shared_with: []
use_when: [a paid source has a low qualification rate and the diagnosis must choose between spam and mis-targeting, setting the "cheap" threshold for a lead-source rule, corroborating a spam verdict with form telemetry]
---

# Cheap cost per lead splits spam from mis-targeting

## The concern

Two sources have the same poor qualification rate. One is a flood of bots and
incentivised fillers; the other is an honest audience of the wrong people. The action
differs completely - harden the form against the first, re-aim the campaign for the
second - and the qualification rate cannot tell them apart. Cost per lead can,
because the two populations are bought at different prices.

## Why the price splits them

A submission optimiser rewarded for submissions finds the cheapest humans and
non-humans who will submit. Bots are free to whoever runs them; incentivised fillers
cost pennies; the merely curious click a "free" promise for nothing. When a source's
leads are barely qualifying **and** cost well under what a real click-and-fill costs
in that market, the population is almost certainly not the one the campaign targeted;
it is whoever the optimiser could find. When the leads barely qualify **and** cost
what real humans cost, real humans clicked in good faith and filled the form, and the
campaign reached the wrong ones.

This is a heuristic with a mechanism behind it, not a law. A spam flood on an
expensive keyword is possible; a mis-targeted campaign on a cheap social lead form is
common. The split is therefore stated relative, not absolute, and corroborated.

## The procedure

1. **Establish "cheap" relative to two baselines.** The source's own trailing cost
   per lead over the previous comparable period, and the median cost per lead of its
   paid peers in the same period. Cheap means well under both - under half is the
   convention this technique uses, and it says so.
2. **Read the qualification rate on the sample-gated count.** Below the junk
   threshold, proceed; above it, this technique does not apply.
3. **Split.** Cheap and unqualified reads as spam; unqualified at a normal price
   reads as mis-targeting.
4. **Corroborate spam with form telemetry when the business has any.** Practitioner
   reporting in the fraud-detection trade describes the recurring shapes: forms
   completed in under a few seconds, optional fields skipped in identical patterns,
   dozens of fills within the same minute or spaced perfectly evenly, disposable
   email domains, one phone number across many submissions, geographies the
   campaign never targeted. Two of these beside a cheap cost per lead make the spam
   call firm; none of them beside a cheap cost per lead leaves it a heuristic and the
   copy says "likely".
5. **Corroborate mis-targeting with the population itself.** Company size, region,
   the service asked for, against the profiles the business actually closes. The
   fit axis of the per-lead score (`two-axis-fit-engagement`) averaged over the
   source's leads is exactly this number.

## Decision rules

- **When cost per lead is absent - an unpaid source, or a paid source whose spend
  was not imported - do not split, because** the discriminator is not measured, and
  not measured is not cheap. The diagnosis returns mis-targeting on the qualification
  evidence alone and says the cost was not available.
- **When the source is cheap and unqualified but the form telemetry is clean,
  downgrade the verdict to "likely spam" and recommend a verification step before a
  budget change, because** the money action is irreversible for the period and the
  evidence is one heuristic.
- **When the source's cost per lead fell sharply in the same period that its
  qualification rate fell, read spam first, because** a sudden cheapening with a
  quality collapse is the signature of an optimiser discovering a non-human
  population, and the trend is stronger evidence than the level.
- **When the threshold is written down, write it relative to deal value or to the
  peer median and label it, because** a currency constant for one market transplants
  to another market or vertical as a wrong answer with the same badge.

## The "cheap" threshold

There is no published cost per lead below which a lead is spam; the number depends
on the market, the vertical, the channel and the year. The convention here is
relative - under half the peer median and under half the source's own prior - and a
stack that needs an absolute for a demo labels it as a demo anchor for one market
and one business size. The standard is a per-business constant with a source and a
confidence band, revisited when the business's own cost history is long enough to
set it.

## When NOT to use

- Not when qualification is acceptable; the split is between two kinds of
  unqualified.
- Not when spend is unmeasured.
- Not as the sole evidence for a "spam" call that triggers a budget cut without the
  approval gate; a diagnosis recommends, a person moves money.
- Not for an unpaid source, where cheap has no meaning.
