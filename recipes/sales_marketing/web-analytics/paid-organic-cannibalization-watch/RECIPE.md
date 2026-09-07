---
name: paid-organic-cannibalization-watch
version: 0.2.0
status: seed
domain: sales_marketing
path: sales_marketing/web-analytics
---

# Paid and organic keyword cannibalization watch

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Money goes on terms the site already wins organically, and because spend and
ranking live in different systems nobody puts them side by side. The comparison that
does eventually get made is worse than none: a savings figure produced by assuming the
organic listing would have absorbed the click, which is the one thing neither system can
tell you.

**Input.** The terms currently being paid for with their spend and whether each is a
brand term, the organic position the site holds for those same terms, and the record of
which overlaps the adopter has already decided to keep paying for and why.

**Core action.** Find where paid spend and a strong organic position are competing for
the same click, bound each one by the spend genuinely at risk rather than by an assumed
saving, and rank them as candidates for the holdout that could actually settle them.

**Output.** A ranked shortlist of terms whose overlap is worth testing, each carrying
the spend at risk, the organic position, whether it is a brand term and what the test
would be, alongside the terms deliberately defended and the ones nothing can be
concluded about.

## Activities

1. Read which terms are being paid for, what they cost and which are brand terms
*(observe)*
2. Read the organic position the site holds for those same terms *(observe)*
3. Find where paid spend and a strong organic position compete for the same click
*(decide)*
4. Bound each overlap by the spend at risk and keep brand terms separate *(decide)*
5. Rank the overlaps by what settling them is worth and name the holdout that would
*(act)*
6. Hand over the shortlist, the defended terms and the ones nothing can be concluded
about *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Overlap between paid spend and organic position is surfaced with the money at risk,
and never with a saving that was assumed rather than measured.**

- Every flagged term carries the spend actually at risk and the organic position it
  overlaps, both read from a source rather than modelled.
- No term carries a savings figure. What a paused term would have kept is a claim about
  a counterfactual, and this recipe hands that claim to a test instead of asserting it.
- Brand terms are separated from the rest, because near total overlap is the expected
  condition on a brand term and is not by itself an argument to stop paying.
- Nothing is concluded when only one of the two sides has data; the term is listed as
  unresolvable rather than quietly omitted.

**Every overlap raised comes with the test that would settle it, so the shortlist is a
work queue rather than an opinion.**

- Each candidate names the holdout that would answer it: what is paused, over which
  population, and for how long before the answer means anything.
- A term the adopter has already decided to defend appears as defended with the reason,
  rather than being raised again on every run.
- A first run says it is establishing the overlap picture rather than reporting a change
  in one.
- Where no holdout is available to the adopter at all, the shortlist says so instead of
  implying the findings are settled.
- A holdout the adopter actually ran is read back against the overlap that argued for
  it, because this shortlist refuses to assert the saving and defers to a test, which
  makes a returned test the only settled evidence it will ever hold, and nothing here
  reads one.

## Guidance

The overlap is observable; the saving is not. Both listings compete for the same session
and whichever was clicked takes the credit, so no attribution model in either system can
say what a paused term would have kept. Put a number on the spend at risk, keep brand
terms in their own column where near total overlap is normal and defending the name may
still be correct, and let a holdout rather than a spreadsheet decide which overlaps are
genuinely costing money.

## Where this is worth adopting

- An account where brand terms are a large share of spend and nobody has tested whether
  pausing them changes anything, because the reporting shows those campaigns as the best
  performers by cost per acquisition and always will.
- A site that spent a year earning the rankings it also bids on, and now holds both,
  with nothing in the reporting that ever notices the two are buying the same click.
- A team about to cut budget under time pressure, needing a defensible order to cut in
  rather than the order the cost per acquisition column happens to suggest.
- A competitor who has started bidding on the operator's own name, where paying anyway
  is the right answer but only if it is a decision somebody made once rather than a
  default nobody revisits.
- An agency handing a paid account back to a client, where every overlapping term is a
  question the client will ask and the honest answer has to separate what was measured
  from what was assumed.

## Connector types

`advertising`, `analytics`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[google-ads](examples/google-ads.md) for `advertising`.

## Recommended trigger

`self_paced`. Overlap changes when bids change or when a ranking moves, and both move on
their own schedule. Look when the bidding strategy changed, when a term moved into or
out of the first few organic positions, or when spend on a term crossed what the adopter
considers worth an argument. A fixed weekly look mostly re-reports the list it produced
last week.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which terms the adopter is deliberately defending even though the site ranks for them,
  because a competitor bidding on the adopter's own name turns the overlap into a
  decision rather than a mistake.
- Where the organic position actually comes from, since this is the harder of the two
  bindings and a position averaged across countries, devices or a whole month is not the
  position the paid click was competing against.
- What counts as a meaningful amount of money in this account, which decides whether a
  small overlap is worth naming at all and is the only thing keeping the shortlist from
  becoming a keyword export.
- Which terms the adopter treats as brand terms, including the misspellings, because no
  advertising platform supplies that classification and getting it wrong puts brand
  spend in the column where overlap looks scandalous.
- Whether the adopter can run a holdout at all, over geography or over time, since a
  recipe whose findings can only be settled by a test they cannot run should say that on
  the first run rather than the tenth.

## Dependencies

None.
