---
layer: application
type: application
subject: campaign-anomaly-triage
technique: spend-spike-without-return
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: experiment
ab_verdict: better
---

# Spend spike without return - a zero base is not a rise

Verified against the systedo-case workspace at commit `32356d13` (2026-10-14), Node 24.x.
The rule matched the technique on its constants: cost up at least 50%, value up by
less than half of the cost rise, warning severity, both deltas quoted, and new or
removed campaigns exempt through their own change kind.

## The seam that did not hold

The seam was chosen to falsify the technique's own decision rule "never compute a
delta against a zero base as a percentage". The sync-over-sync diff computes its
relative change with a helper that returns +100% when the prior value is zero and
the current one is not. A campaign present in both syncs but with no spend in the
first (paused, then re-enabled) therefore arrived as a "changed" row with cost
+100%, and value +100% if it had any, or 0% if it had none. The rule read the
stand-in as a measured rise and fired on a resumed campaign that had returned nothing.

The arm added one condition: the prior cost must be positive. Target: 200 seeded
resumed campaigns with no or weak return through the real diff and triage, rule
fires A 99 of 200, B 0. Floor: 200 genuine spikes on a prior base still fire, 200
proportional growths stay quiet, 342 campaign tests, tsc and eslint green. Shipped
systedo-case 45a2e5a8 on origin master.

Not measured: how often a real account resumes campaigns between two syncs.

Return condition: a production history containing a paused-then-resumed campaign.
