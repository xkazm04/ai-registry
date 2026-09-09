---
layer: technique
type: technique
subject: attribution-and-incrementality
technique: last-click-under-credits-prospecting
status: forged
laws: [platform-reported-is-not-causal, one-target-one-threshold, label-convention-as-convention]
shared_with: []
use_when: [a display, video or demand-generation campaign reads red against a portfolio return target, a triage or reallocation rule judges every campaign by direct return, a retargeting campaign is being praised as the best in the account]
---

# Last click under-credits prospecting

A last-click rule hands every conversion to the touch that immediately preceded it,
which is systematically the touch that harvested demand rather than the one that
created it. Campaigns that prospect - display, video, demand generation, any upper-
funnel placement - therefore read as expensive against a return target they were never
fairly measured by, and campaigns that close - branded search, retargeting, shopping
on a chosen product - read as efficient for closing sales already in progress. The
technique is to give every campaign a funnel role and let the role decide which lens
may judge it.

## The roles

- **Performance.** Answers existing demand: search on non-brand and brand terms,
  shopping, the automated performance campaign type. Fairly read by direct return
  against the portfolio target.
- **Prospecting.** Creates demand: display, video, demand generation, audience
  campaigns with no search intent behind them. Not fairly read by direct return. Read
  by cost of reach, by assisted or view-based figures labelled as platform-attributed,
  and decisively by a holdout.
- **Unclassified.** An unmapped campaign type carries no funnel framing and is judged
  by neither lens, so it distorts neither rollup.

The role is encoded once, in one table, and every threshold, prompt and breakdown
reads that table. A role that lives in prose and a threshold that ignores it is the
common failure: the tree documents the under-credit and then cuts the campaign anyway.

## Procedure

1. Map every campaign type to a role in one place. Unknown types go to unclassified,
   never to performance, because an unmapped campaign silently judged by the strict
   lens is the one that gets cut by mistake.
2. Apply the portfolio return target to performance campaigns only. Report prospecting
   campaigns in their own rollup, with their own descriptive metrics, and never colour
   them red or green against the performance target.
3. Where the platform offers assisted, view-through or data-driven credit, show it for
   prospecting campaigns as a labelled platform-attributed read - it corrects the
   direction of the under-credit without being causal.
4. Route the causal question - does the prospecting campaign move bookings at all - to
   a holdout on that campaign, and let its result set a per-role tolerance if one is
   wanted. Until a holdout has run, the tolerance is unmeasured and no threshold moves
   on the role.
5. Apply the same discipline in reverse to retargeting: label its direct return as
   last-click, and treat a holdout as the only reading of what it added.

## Decision rules

- When a prospecting campaign fails the portfolio return target, do not pause it on
  that reading; measure it with a holdout or a labelled assisted read, because a
  last-click target cannot see the demand the campaign created.
- When a campaign type is not in the role table, treat it as unclassified and exclude
  it from both rollups, because a default to performance makes an unknown campaign the
  first casualty of triage.
- When a per-role tolerance is proposed - "prospecting may run at 60 % of target" -
  require a holdout result behind the number, because a tolerance typed from
  intuition is a convention presented as a measurement.
- When retargeting is the account's best campaign by direct return, say "by last-click
  return" in the sentence, because the qualifier is the finding.

## What is convention here

That last click under-credits demand creation is a property of the rule, not a
convention. Every tolerance number is convention until a holdout on that account sets
it, and the one vendor figure in circulation - retargeting incrementality of roughly a
fifth to two-fifths across direct-to-consumer brands - is vendor research over other
businesses, cited for direction and not applied as a discount.

## When NOT to use

Do not use the role to exempt a prospecting campaign from all judgement: a campaign
that spends and whose holdout shows no lift is a loss, and the role table is what made
the holdout the right instrument, not a shield. Do not apply the technique to a
single-campaign-type account - a search-only advertiser has no under-credited
prospecting and its direct return is the right read. And do not use the role table as
a substitute for the platform's own attribution settings: a data-driven model
redistributes credit within the platform's touches and is worth switching on, but it
does not change which lens a role deserves.
