---
name: contract-renewal-window-watch
version: 0.1.0
status: seed
domain: legal_compliance
path: legal_compliance/deadlines
---

# Contract renewal window watch

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Renewal clocks run whether anyone is watching or not, and the date everybody
watches is the wrong one. An evergreen contract ending on the last day of December with
ninety days notice had to be decided at the start of October, so a watch anchored to the
end date raises its first warning two months after the last day anything could have been
done. It looks like a working watch right up until the year it costs a full renewal
term.

**Input.** Every tracked contract with its end date, the notice window inside it and how
far ahead notice must be served, plus which windows have already been raised and to
whom.

**Core action.** Compute the last day action is still possible by subtracting the notice
period from the end date and then the decision lead time from that, and raise the window
against that date rather than against the renewal.

**Output.** Nobody discovers a renewal after the fact, every window is raised while a
decision could still be made and served, and the person accountable can say what renews
next and what has changed since anyone last asked.

## Activities

1. Survey end dates, notice periods and notice windows across every tracked contract
*(observe)*
2. Compute the last day action is possible, and judge how urgent each window has become
*(decide)*
3. Set aside windows already raised at the same urgency where nothing has changed
*(decide)*
4. Raise the window with its owner while there is still time to decide and to serve
*(act)*
5. Escalate a window that closed without action rather than letting it pass quietly
*(act)*
6. Keep a current answer to what renews next and what has changed since last time
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every window is raised against the date action must be taken by, not against the date
the contract ends.**

- Urgency is computed from the end date less the notice period less the time the
  decision itself takes, so a contract with a long notice period is raised earlier than
  one with none.
- A contract whose notice window has an earliest date as well as a latest one is raised
  for both edges, because notice served too early can be as ineffective as notice served
  late.
- A register that holds an end date but no notice period is reported as unwatchable for
  this purpose rather than watched against the end date, which is the failure that looks
  like coverage.

**Nothing renews unnoticed and nothing lapses that somebody wanted to keep.**

- The same window is never raised twice at the same urgency unless something about it
  changed.
- A window that closed with no action is escalated as a lapse, and named as either an
  unwanted renewal or an unintended expiry, since those are opposite failures with the
  same shape.
- An amendment to a contract causes its dates to be read again, because a superseded
  renewal date watched diligently is worse than no watch.

**The person accountable can say what is coming up and what changed without going to
look.**

- The account leads with what needs a decision and keeps the inventory underneath it.
- It says what changed since the last one rather than restating the same list, and the
  first one says it is establishing the list rather than reporting a change.
- It says plainly when nothing needs attention instead of padding out a quiet period.

## Guidance

Watch the notice deadline, not the renewal date. A term ending in December with ninety
days notice had to be decided in October, so a watch anchored to the end date fires
after the last day anything could be done. Subtract twice: the notice the contract
itself requires, then how long the decision takes. Notice periods vary by contract and
by jurisdiction, so establish each one rather than assuming a default, and check whether
the window has an early edge, since notice served too soon can be invalid.

## Where this is worth adopting

- A company whose software spend is mostly evergreen subscriptions, where the practical
  cost of missing one window is another full year of a tool nobody wanted, and the
  register only ever recorded the end date.
- An operations lead who has been asked what renews this quarter and has to answer from
  a spreadsheet that was last accurate when it was created.
- A team that decided last year not to renew a vendor, discovered in January that it had
  renewed anyway, and now wants the difference between the decision date and the service
  date to be something the system knows rather than something a person remembers.
- A finance function planning next year's budget, where the useful question is not what
  is being spent but which commitments can still be stopped and by when.
- Any portfolio where some contracts must be actively renewed and others renew unless
  stopped, since a watch that only knows how to prevent renewal will quietly let the
  ones you wanted expire.

## Connector types

`spreadsheet`, `messaging`, `email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Each contract carries its own clock and its own notice arithmetic, so the
thing being watched is a computed date approaching rather than a Monday arriving. A
weekly sweep wakes on quiet weeks and can still be five days late for a window that
opened on a Tuesday, which is the margin that decides whether notice can be served in
time.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The notice period each contract actually requires, which is a term of that contract
  and is shaped by the jurisdiction it was written under, so it is established per
  contract at adoption and never carried over as a default from another one.
- Whether the register records notice periods at all, because without them this recipe
  cannot compute the date that matters and should say so rather than degrade to watching
  end dates.
- How long a renewal decision actually takes here, since replacing a vendor needs weeks
  of internal agreement and continuing one needs an afternoon, and the same notice
  period gives them very different lead times.
- Which contracts renew unless stopped and which stop unless renewed, because those two
  need opposite alarms and a register rarely distinguishes them.
- Who owns each contract, since a register with a missing owner is the common real
  failure and defaulting to whoever filed it produces a reminder that looks handled.
- What the adopter counts as at risk, which is a business judgment about value and
  switching cost rather than a threshold.

## Dependencies

None.
