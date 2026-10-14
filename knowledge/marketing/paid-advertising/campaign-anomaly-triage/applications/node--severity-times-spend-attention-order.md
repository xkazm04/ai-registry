---
layer: application
type: application
subject: campaign-anomaly-triage
technique: severity-times-spend-attention-order
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Severity times spend - two queues, two weights

Verified against the systedo-case workspace at commit `7461562c` (2026-10-14), Node 24.x.
The weight is a pure function in the triage module (severity rank times a constant
above any spend, plus cost), the table sorts severity then spend, and the table's
evaluation queue sorts by the weight. The technique matched on all of that.

## The seam that did not hold

The seam was chosen to falsify "every surface uses the same weight". The table's
queue fed the weight the agreed target and the stored daily series (so a slow bleed
and a target-relative band count). The server batch route that buys the same
evaluations after a sync fed it neither, so it ranked on the default bands and on
snapshot severity only: the two queues spent credits in different orders, and quota
exhaustion cut off a different tail. Neither broke a spend tie on identifier, so a
reshuffled input reordered the queue.

The arm added one shared ordering function (severity, spend, id ascending) and used
it in both places, with the route reading the client's agreed goal and the stored
series. Target: orders that change under an input shuffle, A 193 of 200 seeded
portfolios, B 0; goal-blind order differing from the goal-aware one on 198 of 200.
Floor: severity never rises down the queue (0 breaks), the set of ids is unchanged,
340 campaign tests, tsc and eslint green. Shipped systedo-case 2afda110 on origin
master.

Not measured: how often a real portfolio has spend ties, and the share of real
campaigns whose bleed history changes the rank; the seeded generator draws spend
from four values on purpose.

Return condition: a production portfolio, to count reorders between the old and new
route.
