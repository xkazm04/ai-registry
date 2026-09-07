---
name: revenue-signal-alerting-and-outreach
version: 0.1.0
status: seed
domain: customer_support
path: customer_support/retention
---

# Revenue signal alerting and outreach

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Money that was going to arrive and did not, and accounts drifting toward
leaving or ready to grow, all fail quietly. The window in which any of them can still be
acted on is short, and by the time one reaches a revenue report it has closed. The trap
in between is that a signal the provider will fix by itself and a signal that will never
resolve look identical from outside: both keep retrying, both keep counting.

**Input.** Signals crossing a threshold on a paying account, the reason the provider
gave in its own terms, how many attempts have been made and whether any of them actually
executed, the record of what has already been raised, and whether the operator has
agreed to any customer contact at all.

**Core action.** Separate a signal that will resolve on its own from one that never
will, judging on the reason the provider gave rather than on the attempt count, since a
counter climbs in both cases. Raise it once with its cause, and never contact a customer
on the operator's behalf unless he has explicitly said that is wanted.

**Output.** No revenue signal passes unnoticed, none is reported twice, every one is
closed either as recovered or as given up on, and any outreach that went out is outreach
the operator agreed to.

## Activities

1. Take a signal as it crosses its threshold, with the reason the provider gave
*(observe)*
2. Separate a signal that will resolve on its own from one that never will, on the
reason rather than the count *(decide)*
3. Check whether this account was already raised inside the suppression window
*(decide)*
4. Check the account's situation still holds before anything goes out *(observe)*
5. Alert the team and the account owner with the cause in the provider's own terms
*(act)*
6. Draft outreach matched to the situation, sending only where the operator has said
that is wanted *(act)*
7. Close a signal as recovered or as given up on, and report repeats on one account as a
pattern *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Revenue is not lost to a signal that nobody saw.**

- A signal is raised once with its cause and its attempt count rather than on every
  retry
- A signal that recovers is closed as recovered, and one the provider has stopped trying
  to recover is closed as given up on rather than left open indefinitely
- Repeated signals on one account are reported as a pattern
- A period with no signals is reported as quiet, so silence from this work is
  distinguishable from the work having stopped

**Whether a person is needed is decided by what actually went wrong, not by how loud the
signal is.**

- Whether a signal will resolve without anybody is judged on the reason the provider
  gave, not on how many attempts have been made, because an attempt counter can climb
  whether or not anything is being attempted
- A cause the provider or the payment network will fix on its own is neither escalated
  nor sent to a customer
- The cause reaches whoever acts on it in the provider's own terms, so it can be looked
  up rather than paraphrased into something unsearchable

**No customer hears from this seat unless the operator decided they should.**

- Outreach is drafted rather than sent wherever the adopter has not explicitly enabled
  sending
- The account's situation is re-checked immediately before any contact goes out, so a
  customer who has already paid, upgraded or cancelled does not receive a message about
  the state they left
- The same account is not contacted again inside the suppression window
- Retention and expansion outreach read as different situations rather than as one
  template with a different subject line

## Guidance

Read the reason, not the counter. A provider that cannot retry a charge often keeps
scheduling attempts anyway, so a rising attempt count is no evidence that anybody is
still trying, and the reason the provider gave is the only fact separating a signal that
will recover from one that never will. Do not contact a customer on the operator's
behalf unless he has said that is wanted, and re-check the account immediately before
anything goes out. Close every signal one way or the other.

## Where this is worth adopting

- A subscription business where a real share of cancellations are payments that failed
  rather than decisions anybody made, and none of them are visible until the monthly
  revenue number comes in short.
- A team whose alerting posts on every retry, so one account produces eight messages
  over two weeks and the ninth message, about a different account, is the one nobody
  reads.
- An account manager who learns during a renewal call that the customer's card has been
  dead for a month, because the failure looked recoverable by the provider and then
  quietly was not.
- A founder who wants to know about churn risk and does not want automated email going
  to his customers under his name, and has never once been asked which of the two he
  meant.
- A product with genuine expansion signals, where the same retention template reaches an
  account about to leave and an account about to buy more, and one of the two reads as
  an insult.

## Connector types

`finance`, `messaging`, `email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[stripe](examples/stripe.md) for `finance`.

## Recommended trigger

`event`. A threshold crossing is a real external occurrence with a short window in which
it can still be recovered, so this wakes on the signal rather than pacing itself. Memory
of what has already been raised is what stops a retrying provider from producing an
alert per attempt.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Whether the operator wants any customer contact at all from this seat, because sending
  on somebody's behalf is a decision he has not made and must not be made for him
- Which causes here resolve without anybody, since that set is specific to the provider
  and the payment methods in use, and misjudging it produces either noise or a customer
  contacted about a problem that was fixing itself
- How long the provider's own recovery window runs and what it does at the end of it,
  because a signal that is left open, marked unpaid or cancelled are three different
  endings and only some of them announce themselves
- Which signals are worth interrupting a person over, since a provider that retries on
  its own produces many that are not
- Who owns an account here, because an alert that reaches the wrong owner looks handled
  and is not

## Dependencies

None.
