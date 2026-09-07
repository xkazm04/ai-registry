---
name: contract-obligation-and-deadline-watch
version: 0.2.0
status: seed
domain: legal_compliance
path: legal_compliance/deadlines
---

# Contract obligation and deadline watch

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A signed contract's consequences are carried by dates buried inside it: notice
windows, delivery obligations, insurance certificates, warranty expiries. Nobody rereads
a contract they already signed, so those dates arrive as surprises. The version that
looks like it is working is worse, because a ladder of reminders at fixed intervals
fires on time for every obligation and still fires too late for the ones whose action
takes three weeks to arrange.

**Input.** Every tracked contract with the dates it commits somebody to, who owns each
of them, and the record of what has already been raised and to whom.

**Core action.** Work backwards from each date by how long its action actually takes,
rather than forwards from today by a fixed ladder, and judge who can act, how urgent it
has become, and whether raising it again would say anything new.

**Output.** No date with a consequence passes without the person who could have acted on
it having been told while acting was still possible, and a date that was raised and then
ignored is visible as ignored rather than as handled.

## Activities

1. Survey every tracked obligation and the date attached to it *(observe)*
2. Judge urgency backwards from each date by how long its action takes to arrange
*(decide)*
3. Set aside dates already raised at the same urgency, where nothing has changed
*(decide)*
4. Raise the date with the person who can actually act on it *(act)*
5. Escalate a date that keeps being raised and keeps not being acted on *(act)*
6. Record what was raised, to whom and at what urgency, so the next pass does not repeat
it *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Nobody is surprised by an obligation, a notice window or a warranty expiry arriving.**

- Every tracked date is raised at each level of urgency while the action it requires can
  still be completed, not merely before the date itself.
- A date already raised at a given urgency is not raised again at that same urgency
  unless something about it changed.
- Urgency is derived from how long the action takes, so an obligation needing a signed
  certificate and one needing an email are not raised on the same ladder.
- An owner who answers a raise by saying it arrived too late to arrange, or who closes
  it the same afternoon it landed, has corrected the lead time for that kind of
  obligation, and the correction is kept alongside what was raised, because the lead
  time is this work's own estimate rather than a term of the contract and only the
  person doing the arranging can calibrate it.

**A reminder that went out and produced nothing is visible as such, instead of counting
as coverage.**

- A date that passed with nobody acting is recorded as a miss whether or not the message
  was delivered.
- A date raised more than once with no response is escalated as a pattern rather than
  raised a fourth time.
- A date with no owner is reported as unowned rather than sent to a default recipient,
  because a reminder that reaches somebody with no authority to act looks handled and is
  not.

**The dates being watched are the dates the contracts currently carry.**

- An amendment or a renegotiation causes the obligations for that contract to be read
  again, because a superseded date watched faithfully is worse than no watch at all.
- A pass where nothing was near enough to raise says so, so a quiet week is
  distinguishable from a watch that stopped running.
- The first pass says it is establishing what is being watched rather than implying that
  everything before it was clear.

## Guidance

Measure backwards. The date that matters is the last day the action is still possible,
which is the deadline minus however long that action really takes to arrange, and that
lead time is a property of the obligation rather than of the calendar. Reach whoever can
act, not whoever submitted it. A date that passed with nobody acting is a miss even
though the message went out, and a date ignored three times is a pattern to escalate
rather than a reminder to resend.

## Where this is worth adopting

- A company whose contracts each carry two or three quiet obligations, an insurance
  certificate, a report, a security attestation, where the breach that eventually
  happens is administrative rather than commercial and entirely avoidable.
- An operations lead who inherited a folder of signed contracts nobody has read since
  signature, and needs to know what is committed before finding out from the
  counterparty.
- A team whose reminder ladder already works for renewals and fails on obligations that
  require somebody else to produce a document first, because the lead time is measured
  in weeks and the ladder in days.
- A small business where the same person receives every reminder and can act on almost
  none of them, so the reminders became noise long before the deadline that mattered.
- Any contract portfolio that gets amended, where the durable risk is not a missed date
  but a diligently watched one that the amendment already moved.

## Connector types

`spreadsheet`, `email`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[gmail](examples/gmail.md) for `email`.

## Recommended trigger

`self_paced`. What is being watched is a set of dates approaching, and each obligation
carries its own lead time, so no single interval is right for all of them. A daily sweep
is one way to notice a date but it is not the thing being noticed, and it wakes the work
on the many days when nothing is near. Nothing statutory forces a calendar here.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which dates this adopter tracks and where they are recorded, since a deadline nobody
  wrote down cannot be watched and the honest answer is often that the register is
  incomplete.
- How long each kind of action actually takes to arrange here, because that lead time
  and not the deadline is what decides when to raise it.
- Who can act on each kind of date, because a reminder that reaches the wrong person
  looks like coverage and is not.
- What happens when an obligation is amended, since the register and the contract can
  diverge silently and only the adopter knows which one their team treats as true.

## Dependencies

None.
