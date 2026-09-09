---
layer: application
type: application
subject: attribution-and-incrementality
technique: last-click-under-credits-prospecting
stack: node
status: forged
verified_on: 2026-09-09
verified_against: node@24
---

# Last click under-credits prospecting - a funnel-role table nothing reads

The workspace at commit `2893314930546ed3a314a19a155bcf2f8841a0ea` encodes the
technique's first procedural step and none of the rest. `src/lib/campaigns/types.ts:55-73`
declares a `CampaignTypeRole` of `"performance" | "prospecting" | "neutral"` and a
`CAMPAIGN_TYPE_ROLES` map: search, the automated performance type and shopping are
`performance`; display, demand generation and video are `prospecting`; `other` is
`neutral`. The comment above the map is the technique's thesis in the tree's own
words: "Performance types answer existing demand and are fairly judged by direct
(last-click) ROAS; prospecting types *create* demand, which last-click attribution
systematically under-credits - so they trend 'red' against the same target without
being broken."

The structural fact this proves is the one the technique warns about: **the tree
acknowledges the under-credit in prose and no rule acts on it.** The same comment
says so - "Deliberately informational: no triage threshold moves based on the role."

## What is right

- The role lives in one map, "encoded once here so the prompts, breakdowns and any
  future per-role tolerance read one map" (`types.ts:59-60`). One table, every reader
  - the technique's first step.
- Unmapped types go to `neutral`, not to `performance`: "Unmapped channel types carry
  no funnel framing - judged neither by the strict performance lens nor the
  prospecting one, so they never distort either rollup" (`types.ts:69-71`). That is
  the technique's second decision rule exactly, and it pairs with the channel-type
  mapping in `src/lib/sklik/types.ts:72-111` and `src/lib/google/ads.ts:507-534` where
  an unknown type maps to `other`, never to search.
- The role has a user-facing label in both locales (`types.ts:75-87`), so a breakdown
  can show it.

## What is missing, and why it matters

The triage spine in `src/lib/campaigns/triage.ts:23-42, 175-232` reads every campaign's
last-click ROAS against one portfolio target - critical below 0.6 of target, below
target, below break-even - and the map is not an input to any of those rules. The
budget-move donor ranking in `src/lib/campaigns/budget-moves.ts:162-243` ranks donors
by revenue waste `cost x (1 - roas/target)` with no role term, so a display campaign
at 60 % of target is the first donor every time. The tree's own comment predicts this
- prospecting "trend[s] red against the same target" - and then lets the red drive
the pause.

The scout's F-item 3 for the paid territory records the same gap from the other
side: measurement is "last-click and window-naive (7-before/7-after, no holdout, no
lag)". There is no instrument in the tree that could set the per-role tolerance the
comment anticipates, so the technique's fourth step - route the causal question to a
holdout and let its result set the tolerance - has no landing place yet.

## Confirmed at the target layer

`src/lib/targets.ts:10-14` with `types.ts:147-156` sets the paid-portfolio PNO target
at 0.18 deliberately looser than the blended whole-business 15 % "because paid carries
prospecting", and requires every surface to label the scope. That is a portfolio-level
concession to the under-credit - one tolerance for the whole paid portfolio rather
than per role - and it is labelled as scope, which is what the `one-target-one-
threshold` law asks. It is a convention, not a measured tolerance, and nothing in the
tree presents it otherwise.

## Deviation, not upward lesson

The standard stays: a role table that no threshold reads has documented the problem
and acted on the folklore. The smallest change that would move the tree to the
technique is to exclude `prospecting` campaigns from the `roas_critical` and
`below_target` snapshot rules and from donor ranking until a per-role tolerance
exists, reporting them in their own rollup - which the map's comment already says is
the intended future.
