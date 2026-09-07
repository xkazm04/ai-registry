---
name: unsigned-contract-signature-chasing
version: 0.1.0
status: seed
domain: legal_compliance
path: legal_compliance/deadlines
---

# Unsigned contract signature chasing

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A contract sitting unsigned costs whatever it was going to be worth, and
chasing it is a relationship rather than a queue. Too few nudges and it dies quietly;
too many and the counterparty stops reading anything from that address. Most reminders
fail for a third reason, which is that they repeat a request the recipient never
disagreed with, when what is actually holding the contract up is a question on their
side that nobody asked about.

**Input.** Contracts still out for signature, which recipient each is actually waiting
on, how long it has waited, what has already been sent, and how this counterparty has
responded before.

**Core action.** Work out who is genuinely holding the contract and what is likely
blocking them, ask about that rather than repeating the request, and judge when chasing
has stopped producing information and the contract belongs to a person instead.

**Output.** Every unsigned contract has either moved, been handed to somebody with a
name, or been called dead, and none is still cycling reminders at a recipient who
stopped reading them weeks ago.

## Activities

1. Survey contracts still unsigned, and which recipient each one is actually waiting on
*(observe)*
2. Check whether the signer already responded somewhere the tracker did not see
*(observe)*
3. Weigh how this counterparty normally responds, and what is plausibly blocking this
one *(decide)*
4. Ask about the blocker rather than repeating the request, within what the relationship
can bear *(act)*
5. Hand a contract that has stopped producing information to the owner, and then to a
person *(act)*
6. Record what was sent, what came back, and when a contract was called dead *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**An unsigned contract is chased a sensible number of times and then belongs to a named
person, never to the reminder loop.**

- Reminders to a signer never exceed the cap the adopter set, and the cap is a property
  of the relationship rather than of the deadline.
- A contract past the point where chasing is still producing information reaches a
  person, and that handoff is observably picked up rather than only sent.
- A contract nobody is going to sign is marked as such, because a dead contract left
  open looks exactly like an active one and keeps costing attention.

**The message reaches the person who can move the contract, and asks about what is
holding it.**

- Where a contract routes through several signers, the nudge addresses the one it is
  currently waiting on rather than the original contact.
- A second nudge differs from the first: it offers to resolve something, or asks what is
  needed, rather than restating the request.
- A signer who already replied outside the tracker is not nudged, because a reminder to
  somebody who answered is the fastest way to be filtered.

**A counterparty who is slow but reliable is not treated like one who has gone silent.**

- How long this counterparty has historically taken informs when the next nudge is due,
  so a signer who always takes two weeks is not chased on day four.
- Anything leaving for an external party is seen by a person first, unless the adopter
  has explicitly said otherwise.
- A sweep with nothing due to chase says so, rather than lowering its own bar to have
  something to send.

## Guidance

A stalled contract is usually not forgetfulness. It is a question on the other side that
nobody asked about, so the second nudge should offer something the first did not: a
shorter path, a different signer, an answer. Chase whoever the document is actually
waiting on, not whoever you know. Stop when the nudges stop producing information,
because a fourth message teaches you nothing the third did not and costs you the
address. Calling a contract dead is a result.

## Where this is worth adopting

- A small sales team where the founder is the only person who chases, so chasing happens
  on the days they remember and the contracts that go quiet are the ones nobody liked
  chasing.
- A company selling into larger organisations, where a contract sits for three weeks in
  a procurement queue the sender cannot see and every reminder to the champion is a
  message they can do nothing with.
- An operation that has been sending automatic reminders for a year and cannot say
  whether they work, because nothing recorded which contracts moved after a nudge and
  which moved anyway.
- A renewals desk carrying dozens of open envelopes at once, where the real cost is not
  the unsigned contract but the attention spent every week rereading a list that
  includes deals which died in March.
- Any team whose counterparties include both a two day signer and a two month one, where
  a single reminder interval is wrong for both and being wrong in the fast direction is
  the expensive one.

## Connector types

`spreadsheet`, `forms`, `email`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Act from the state of each contract rather than from a calendar: check
whether any has reached the point where a nudge would say something new, and stay quiet
when none has. A weekday sweep nudges on the schedule's terms rather than the
counterparty's, which is precisely the failure the recipe exists to avoid.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- How long the adopter is willing to wait before nudging, which is a relationship
  judgment and differs by counterparty type more than by contract value.
- How many times a signer may be nudged before it becomes harassment, since the same
  three messages are attentive from a supplier and pushy from a vendor.
- What is usually blocking contracts here, because the useful second nudge names it, and
  a team selling into procurement heavy buyers has a different answer from one selling
  to founders.
- Which outbound messages need a person's approval before they leave, especially
  anything going to an external party.
- What the adopter wants done with a contract that will never be signed, since marking
  it dead is a commercial decision rather than an administrative one.

## Dependencies

None.
