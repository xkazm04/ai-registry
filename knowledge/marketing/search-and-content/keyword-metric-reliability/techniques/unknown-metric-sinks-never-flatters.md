---
layer: technique
type: technique
subject: keyword-metric-reliability
technique: unknown-metric-sinks-never-flatters
status: forged
laws: [not-measured-is-not-zero, provenance-is-binary-and-labelled]
shared_with: []
use_when: [merging keyword ideas from more than one provider, a provider omits volume or competition or cost per click for some rows, choosing a default for a missing metric that feeds a ranking]
---

# An unknown metric sinks, never flatters

When keyword ideas arrive from more than one provider - a dominant ad platform, a second
national one, a synthetic sample for a workspace that has connected nothing yet - some
rows will lack a metric the ranking needs. A null cannot always be carried through a
score. The rule for the value that stands in for it: it must place the row *lower* in
every derived ordering than any measured row would, so that an absence is never
mistaken for a strength. And the merge rule that precedes it: a real record beats a
synthetic one whatever the synthetic's numbers say.

## Why the default's direction is the whole question

A ranking is a comparison, and a defaulted row is compared against measured ones. Any
default is a claim about the row's position. Zero competition claims "easiest term in
the set"; zero cost per click claims "free clicks" in a spend-efficiency ratio, or
"worthless" in one that divides by it; a headline volume claims "biggest". The honest
claim for an unknown is "no evidence this row should be near the top", and the default
that makes that claim is the one that sinks.

The trap is that direction is per score, not per metric. A single default value can sink
a row in one ordering and float it in another:

- Cost per click **zero** sinks a row in "opportunity per unit of cost" if the formula
  returns zero on a zero divisor, and floats it to infinity if the formula divides
  naively.
- Competition **zero** sinks nothing; in an "ease = 1 minus competition" term it awards
  the row full ease points and floats it.
- Volume **zero** sinks a row in a volume sort and, in a formula normalised to the
  set's maximum, contributes nothing - which is the sinking behaviour wanted - but a
  zero rendered as a number reads to a human as "measured, no demand", which is a
  fabricated verdict.

So the procedure is not "pick conservative defaults"; it is "for each score this row
feeds, prove the default sinks it, and label the row so a reader sees the absence."

## Procedure

1. **Enumerate the metrics each provider can omit** - volume, competition, cost per
   click, bid range - from the provider's own documentation or from a real pull, and
   write the default beside each with its reasoning.
2. **For each derived score**, trace the default through the formula and confirm the
   row lands below any measured row. Where it does not, change the default *for that
   score* or gate the score: an unknown cost yields no efficiency figure rather than an
   infinite or a zero one.
3. **Choose defaults that sink**: unknown competition is *mid*, not low; unknown volume
   is a small floor that keeps the row visible but contributes nothing to a normalised
   volume term; unknown cost per click produces no bids and an excluded or last-place
   efficiency.
4. **Carry provenance per row.** When sources are mixed, each row names its provider;
   when a single provider served everything, the label is omitted so the shape is
   unchanged. A synthetic row is labelled as illustrative and never blends into a real
   set silently ([provenance is binary and labelled](../../../_laws.md#provenance-is-binary-and-labelled)).
5. **Merge by provenance first, then richness.** On a keyword both providers return, a
   real record beats a synthetic one regardless of volume; real against real keeps the
   richer record - the higher measured volume, then the one carrying bid data, then the
   first seen - and the kept record keeps its own provider label so the numbers shown
   are attributed to whoever supplied them.
6. **Render absence as absence wherever a number is displayed**, even when the score
   underneath used a default: "not reported" in the cell, the default only inside the
   ordering ([not measured is not zero](../../../_laws.md#not-measured-is-not-zero)).

## Decision rules

- When a provider omits competition, default to the middle of the scale, because the
  low end awards ease the row has not earned and the high end punishes a term for the
  provider's silence.
- When a provider omits cost per click, produce no bid range and score the row last in
  any per-cost ratio, because a zero divisor must not become infinity and a zero result
  must be understood as "unranked", never "free".
- When a provider omits volume, use a floor small enough to contribute nothing to a
  normalised volume term, keep the row visible, and label the cell as not reported.
- When a synthetic sample and a real provider both return a keyword, keep the real
  record whatever the volumes say, because the sample's figures were generated to look
  like head terms and will otherwise discard the only measurement in the row.
- When a real provider's record is the one with the *lower* volume against another real
  provider, keep the higher measured one and say which provider it came from, because
  two real figures for one family differ by bucketing, not by demand.
- When a formula normalises volume to the set's maximum, check what a synthetic head
  term does to the denominator before trusting any score in that set.

## When not to use this

Do not turn a measured zero into a default. A provider that reports zero volume for a
term has made a claim - the term is below its smallest bucket - and that claim renders
as zero with the provider's name beside it. Do not apply sinking defaults to a report
surface where no ranking happens; there the only honest rendering is the blank or "not
reported", and any number is an invention. Do not use a sinking default to avoid asking
the owner for a figure they hold - revenue per job, average ticket - which are questions,
not metrics a provider forgot. And do not let a defaulted row's lowly rank be read as a
finding about the keyword; it is a finding about the provider's coverage, and the map
says so.
