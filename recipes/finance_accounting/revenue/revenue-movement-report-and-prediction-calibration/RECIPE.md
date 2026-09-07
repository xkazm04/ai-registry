---
name: revenue-movement-report-and-prediction-calibration
version: 0.1.0
status: seed
domain: finance_accounting
path: finance_accounting/revenue
---

# Revenue movement report and prediction calibration

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A net revenue figure hides every force that produced it: a flat month can be
strong acquisition covering heavy churn, and nobody reading the total would know. The
report that is supposed to explain this then never checks its own predictions, so it
repeats the same mistakes every period while sounding more confident each time.

**Input.** Payment and subscription movement for the period, the account risk scores
predicted in earlier periods whose horizon has now elapsed, what actually happened to
those accounts, and the provider's own record of what was collected.

**Core action.** Sort every movement into exactly one bucket and check the parts against
the ending figure, then ask whether accounts scored at a given risk actually failed at
that rate, which is a different and harder question than how many calls were right.

**Output.** A report of revenue movement by component, health distribution, and how well
earlier predictions held up, together with either a recorded weight adjustment or a
recorded statement that too few outcomes have resolved to justify one.

## Activities

1. Pull the period's payment and subscription movement *(observe)*
2. Sort every movement into exactly one of new, expansion, reactivation, contraction and
churn, and check the parts against the period's ending figure *(decide)*
3. Attribute each component to the products or accounts behind it *(decide)*
4. Score the predictions whose horizon has now elapsed against what actually happened,
band by band rather than as a single hit rate *(decide)*
5. Move the scoring weights only when enough outcomes have resolved to tell a change
from noise, and record either the adjustment or the refusal *(act)*
6. Reconcile the figures against the provider's own record and state any gap rather than
smoothing it *(act)*
7. Deliver movement, distribution and calibration in one report *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The reader can tell where revenue moved and why without opening the payment dashboard,
and the decomposition is arithmetic rather than narrative.**

- Every movement lands in exactly one of new, expansion, reactivation, contraction and
  churn, and the components together account for the change between the opening and
  closing figures, with any residual reported rather than absorbed
- A returning customer is reported as reactivation and not as new, because counting them
  as new overstates acquisition and hides that they had left
- Each component names the products or accounts behind it
- Figures reconcile with what the provider says was collected, and any gap is stated
  rather than smoothed
- A step change is reported when it appears rather than held until the period boundary

**Every claim the scoring made is checked against the world on the terms it was made,
and the check measures whether the numbers were honest rather than whether the verdicts
were popular.**

- A prediction is recorded with its horizon before the outcome is known, and is scored
  only after that horizon has elapsed, so a report never claims accuracy for predictions
  that have not yet had a chance to be wrong
- Accounts are grouped by the risk they were scored at, and each group is compared
  against how many of them actually failed, because a score that says forty percent
  should be right about four in ten and a count of correct calls cannot tell you whether
  it was
- Accounts that lapsed because a payment could not be collected are separated from
  accounts that chose to leave, since a model trained on the two together learns to
  predict payment infrastructure and is then acted on as if it had predicted
  dissatisfaction
- The first calibration report says it is opening a record and scores nothing, rather
  than reporting an accuracy figure over predictions that were never made

**The scoring changes when the evidence supports a change and holds still when it does
not, and either way the decision is on the record.**

- No weight moves in a period where fewer outcomes resolved than the adopter's stated
  minimum, and that refusal is written into the report rather than passing as silence
- Every adjustment records what moved, by how much, and which comparison justified it,
  so a later reader can tell a correction from a drift
- Where too few outcomes resolve in any single period, outcomes are pooled across
  periods rather than the minimum being quietly lowered
- A run of periods with no adjustment is reported as the model holding rather than as
  the calibration not running

## Guidance

Movement matters more than totals: sort every change into exactly one of new, expansion,
reactivation, contraction and churn, and check that the parts add up to the ending
figure, because that check is the only thing standing between a decomposition and a
story. Score predictions only once their horizon has elapsed, and ask whether accounts
scored at a given risk churned at that rate, which is a different question from how many
calls were right. Move weights only when enough outcomes have resolved to tell a change
from noise.

## Where this is worth adopting

- A founder reading a flat month and concluding nothing happened, when the truth is that
  record acquisition is covering a churn problem that will be visible three months from
  now and is visible in the decomposition today.
- A team that has been running a churn score for two quarters, has never written a
  prediction down before its outcome, and therefore has no way to answer whether the
  score has ever been right about anything.
- A small book of accounts where a handful of churns a month means precision and recall
  swing violently, and where the useful behaviour is to refuse to retune and say so
  rather than to chase the noise.
- A finance owner preparing figures somebody else will check, for whom the value is that
  the components reconcile against what the provider actually collected and the gaps are
  named rather than rounded away.
- A business whose subscriptions include seat changes and downgrades, where treating
  every reduction as churn has been quietly overstating the problem and hiding that the
  accounts are still there.

## Connector types

`finance`, `messaging`, `email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[stripe](examples/stripe.md) for `finance`.

## Recommended trigger

`self_paced`. The billing month is a real anchor for totals, so a period summary belongs
near a month boundary, but it is an anchor rather than an obligation: a step change
should be reported when it appears rather than waiting for the boundary, and a
prediction should be scored when its own horizon elapses, which does not fall on the
month boundary. That combination is exactly what self-paced expresses and what a time
trigger would prevent.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which payment account and which products count as revenue here, because test data,
  refunds and internal transfers otherwise read as movement that never happened
- How the adopter draws the line between a downgrade and a departure, because that line
  decides which bucket most of the interesting movements land in and no default is right
  for everyone
- The horizon a risk score is making a claim over, because without it the prediction has
  no deadline, every score is eventually correct, and the calibration cannot start
- How many resolved outcomes the adopter wants to see before the weights move, which
  depends entirely on how many accounts they have and is the difference between learning
  and chasing noise
- Who receives the report and at what depth, because the same figures are a summary for
  one audience and an audit trail for another

## Dependencies

- A way to derive recurring revenue from subscription and invoice data, because payment
  providers expose the underlying subscriptions and invoices but no recurring-revenue
  figure to read
- Somewhere durable to write a prediction before its outcome is known, since a score
  that only exists at the moment it is read can never be scored afterwards
