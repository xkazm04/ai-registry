---
layer: technique
type: technique
subject: search-term-mining
technique: spend-and-click-floors-before-negation
status: forged
laws: [statistical-honesty-before-a-verdict, label-convention-as-convention]
shared_with: []
use_when: [setting the thresholds of a negative-keyword rule, a mining pass emits hundreds of cheap negatives, deciding the lookback window for search-term mining]
---

# Spend and click floors before negation

Zero conversions is evidence only after the query has been given a chance to convert
and has cost enough for a permanent criterion to be worth the attention of the person
approving it. Two floors sit in front of the negative branch, both read on the same
window as the conversion count and both subordinate to the invariant that a converting
query is never negated. This technique is about sizing them, what they are relative
to, and the window they are read on.

## The two floors and what each guards against

- **The click floor** guards against inference from noise. Three clicks with no
  conversion says nothing at a 3% conversion rate; the query has been given roughly
  one-tenth of a chance. Below the floor, "zero conversions" is not a finding.
- **The spend floor** guards against attention cost. A query that has spent a trivial
  amount, however many clicks, is not worth a criterion that someone must approve,
  someone must be able to revert, and that will sit in the account forever. Below the
  floor, the operator's minute costs more than the leak.

They are separate because they fail separately: a cheap query with many clicks fails
spend and passes clicks; an expensive query with few clicks (a high-CPC term) passes
spend and fails clicks. Both must pass.

## The absolute form, and why it is a convention

A team's first version fixes both floors as constants: a currency amount and a click
count, chosen for the account in front of them. That is a legitimate starting point,
and it is **practitioner convention** - no platform documents it and no study fixes
it. State it as such where the constants live, and expect it to be wrong in one of two
directions for any account other than the one it was written for: too strict for a
high-converting account, where a wasteful query is obvious after a dozen clicks, and
too loose for a low-converting one, where a hundred clicks without a conversion is
unremarkable.

## The relative form, which is the standard

Once the account has a measured conversion rate and an agreed target cost per
acquisition, replace the constants with expressions of them:

- **Click floor from the conversion rate.** The number of clicks at which zero
  conversions would be unlikely if the query converted at the account's rate. For a
  rate *r* and a tolerance of one-in-twenty, that is roughly `ln(0.05) / ln(1 - r)`,
  about `3 / r`: 150 clicks at 2%, 30 at 10%, 300 at 1%. Use the rate of the campaign
  or ad group the query served under when it is measured; fall back to the account
  rate when it is not. The one-in-twenty tolerance is itself a convention.
- **Spend floor from the target CPA.** A query that has spent one to two target CPAs
  without a conversion has out-spent what a conversion is worth to the business. One
  CPA is the aggressive setting for an account that mines weekly; two is the
  conservative one. Both are convention; the CPA they multiply is the business's own
  number and is taken from the one agreed target, never a benchmark.

The relative form also answers the question the absolute form cannot: when a query
with 40 clicks and zero conversions is flagged, the rule can say *why* - "at your 8%
rate, 40 clicks without a conversion is a one-in-thirty event" - which is what a
recommendation needs to carry to be approved rather than trusted.

## The window and its lag allowance

Both floors and the conversion count are read over one window, and the window must
respect conversion lag. Clicks are counted the day they happen; conversions arrive
over the conversion window, for many businesses days later. A window that ends today
therefore contains clicks whose conversions have not been reported yet, and those
queries look like zero-converters with full spend. Two remedies, either sufficient:

- End the mining window before the account's typical conversion lag (the platform's
  own days-to-conversion report gives it; a week is a common allowance where it is
  unknown, and is a convention).
- Or keep the window current but exclude a query whose clicks are concentrated in the
  last few days of it.

A mining pass that ignores lag negates Monday's converters on Tuesday and cannot be
told apart, from the row alone, from a correct one.

## Decision rules

- When the account's conversion rate is measured on the window, derive the click floor
  from it and say so in the recommendation, because a fixed click count is wrong for
  every rate but one.
- When the business has an agreed target CPA, state the spend floor in multiples of
  it, because a fixed amount is unrelated to what a lost conversion costs.
- When neither is available, keep the absolute constants and label them convention,
  because an unlabelled constant becomes documented behaviour in the next reader's
  mind.
- When the window ends within the conversion lag, shorten it or exclude tail-heavy
  queries, because a click without its conversion yet is a false zero.
- When an aggregate (an n-gram token) is mined instead of a row, apply the same floors
  to the aggregate's summed clicks and spend, because the token's evidence is the sum
  of its queries.

## When NOT to use

- Do not apply floors to the **promote** side; promotion is gated by conversion count
  and match type, not by spend and clicks.
- Do not let the floors substitute for the invariant. A query above both floors with
  0.3 conversions is still never negated; the floors decide whether a zero is
  evidence, not whether a fraction is.
- Do not tune the floors to produce a target number of negatives per pass. A quiet
  account produces few; forcing more lowers the standard.
