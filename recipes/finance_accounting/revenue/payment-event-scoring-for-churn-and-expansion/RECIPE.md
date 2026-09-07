---
name: payment-event-scoring-for-churn-and-expansion
version: 0.2.0
status: seed
domain: finance_accounting
path: finance_accounting/revenue
---

# Payment event scoring for churn and expansion

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** An account sliding toward churn, or ready to expand, is visible in payment
behaviour long before it shows up in a business review, and a failed payment has a short
window in which it can still be recovered. A large share of subscription losses are
accounts that never decided to leave at all, and treating those as churn risk is how a
team ends up sending a retention offer to a customer whose card simply expired.

**Input.** Payment and subscription events as they arrive, the payment credentials due
to expire before the next charge, customer context from a CRM where one is bound, and
the current per-account scores and open alert windows.

**Core action.** Decide which kind of leaving each signal points at, an account choosing
to go or an account about to lapse for a reason nobody chose, then turn the first into a
movement in that account's risk and readiness scores and the second into a collection
problem, and speak only when a band was crossed that somebody would act on.

**Output.** One alert per real crossing, naming the factors behind it and which kind of
problem it is, with duplicates inside the window suppressed, resolved failures closed,
and every score written down with the claim it is making.

## Activities

1. Receive payment and subscription events as they arrive, and notice the payment
credentials due to expire before the next charge *(observe)*
2. Enrich with CRM context where one is bound, degrading gracefully when not *(observe)*
3. Separate a collection failure that will clear on its own from one the customer has to
act on, and both from a decision to leave *(decide)*
4. Move the account's churn risk and expansion readiness scores, keeping a failure to
collect out of the risk score *(decide)*
5. Judge whether a band was crossed and whether this window is already open *(decide)*
6. Record the score, what it claims, and the horizon it is claiming over *(act)*
7. Raise the crossing with its factors, or close a failure that resolved on retry
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**An account sliding toward churn or ready for expansion is known within minutes of the
signal appearing, not discovered at the next business review.**

- Every threshold crossing, a churn risk band change or an expansion score clearing its
  bar, fires on its own rather than waiting for a batch report
- A customer too new to have a pattern is scored at low confidence rather than treated
  as equally reliable as an established account
- A duplicate alert for the same account inside the configured window is suppressed
- Every score is recorded with the horizon it is claiming over, so a later pass can ask
  whether accounts scored at this level actually did what the score said
- An account the people who know it say was never at risk is recorded against the score
  that claimed it was, with their reason, so the next crossing on that account carries
  what its score has already been wrong about to whoever the alert reaches

**A customer who never decided to leave is never reported as one who did.**

- A lapse caused by a payment that could not be collected does not move the churn risk
  score, because that score is a claim about the customer's intent and a failed card is
  a claim about a card
- Every alert says which of the two kinds of problem it is, since the useful next step
  for one is a conversation and for the other is a card update, and doing the wrong one
  is worse than doing nothing
- An account carrying both, a payment problem and a genuine drop in engagement, is
  reported as both rather than collapsed into whichever fired first

**Revenue is not lost to a payment that failed quietly, or to one that was going to fail
and could have been prevented.**

- A decline the provider will retry on its own is not raised to a person on the first
  attempt, and one the provider cannot retry without new details from the customer is
  raised immediately, because waiting on retries that cannot succeed spends the whole
  recovery window
- A payment credential known to expire before the next charge is surfaced before the
  charge fails, since a failure that has not happened yet is the cheapest one to prevent
- A failure is raised once with its cause and attempt count rather than on every retry
- A failure that resolves on retry is closed rather than left open, so the count of open
  collection problems is true
- Repeated failures on one account are reported as a pattern rather than as a series of
  incidents

## Guidance

The most useful judgment here is which kind of leaving this is. An account whose card
expired has not decided anything, and scoring it as churn risk produces a save offer
where a card update was needed. Separate a decline that will clear on its own from one
the customer has to act on, and involve a person only for the second. Degrade to payment
data alone with the gap flagged. Suppress repeats inside the window, and never contact a
customer unless the adopter has said to.

## Where this is worth adopting

- A subscription business that has never separated the customers who left from the ones
  whose payments stopped working, and for whom the first honest measurement of that
  split will change what the retention work is aimed at.
- A team whose churn alerts are read as background noise because every retry of the same
  failed invoice produced another one, and where the value of adoption is mostly in what
  stops being sent.
- A small revenue team with no dedicated collections process, where a failed payment
  currently sits until somebody notices at month end and the recovery window has closed
  by then.
- A product with usage-based or seat-based billing, where an expansion signal appears in
  payment behaviour weeks before anybody in the company would have thought to ask for
  the upgrade.
- An operation running a churn score that nobody has ever checked, where writing down
  what each score claims and by when is the precondition for ever finding out whether it
  works.

## Connector types

`finance`, `crm`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[stripe](examples/stripe.md) for `finance`, [hubspot](examples/hubspot.md) for `crm`.

## Recommended trigger

`event`. A payment event is a real external event with a short recovery window, so the
recipe wakes on it rather than pacing itself. A short polling interval is an
approximation of this, not a preference: it exists where polling is the only mechanism
available, and it should be replaced by the provider's own event delivery where that
exists.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Whether the adopter wants any customer contact at all from this work, because the
  source template sent retention email automatically and that is a decision they have
  not made and must not be made for them
- Which accounts and products are in scope, because test and internal accounts otherwise
  produce scores and alerts for movement that never happened
- What band crossing is worth an interruption, because the same score movement is a
  crisis in a small book of accounts and noise in a large one
- Who handles a collection problem and who handles a retention conversation, because
  they are usually different people and an alert that does not know which one it is
  going to will reach the wrong one
- How long the provider's own retry schedule runs, because that period is the difference
  between an alert that arrives while something can still be done and one that arrives
  after the subscription has already ended

## Dependencies

None.
