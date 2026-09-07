---
name: high-intent-lead-alerting
version: 0.1.0
status: seed
domain: sales_marketing
path: sales_marketing/lead-handling
---

# High intent lead alerting

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A lead judged promising decays over minutes rather than hours, so the gap
between the judgment and a person seeing it is where most of the loss happens. The
plausible version of the failure is not silence but noise: a channel that fires on every
enquiry gets tuned out within weeks, and the one submission that genuinely earned an
interruption then arrives into a feed nobody opens any more.

**Input.** A lead that has just been judged promising, the reasoning and signals behind
that judgment, who owns leads of that kind, and the adopter's rule for which cases are
worth interrupting somebody over.

**Core action.** Decide whether this lead earns an interruption and at what level, then
put it in front of the person who owns it with enough context that they can act without
going to look anything up. The threshold is half the work, because it is what keeps the
channel worth opening.

**Output.** The person who owns the lead knows about it while acting is still worth more
than the interruption, holding the reasoning, the signals and a way straight into the
record, plus a durable note of when the alert went out and whether anyone picked it up.

## Activities

1. Take in the newly judged lead, its reasoning and its signals *(observe)*
2. Decide whether this one earns an interruption, and at which level *(decide)*
3. Compose the alert so the reader can act without going to look *(act)*
4. Send it to whoever owns this kind of lead, on the route the level earned *(act)*
5. Record that the alert went, when, and whether it was picked up *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A lead judged worth attention is in front of the person who owns it while acting on it
is still worth more than the interruption.**

- The alert carries the reasoning behind the judgment, the signals that drove it, and a
  way straight into the record, so acting on it needs no lookup.
- The most promising cases reach the assigned person directly rather than only a shared
  channel.
- The delay between the judgment and the send is recorded, so the share of response time
  this recipe owns is told apart from the share a human owns.
- A delivery failure never silently drops a promising lead: it falls back or queues, and
  says which of the two it did.

**The alert route is still read months later, because what arrives on it has stayed rare
enough to be worth opening.**

- How often each route fires is reviewable, so a threshold that has drifted into
  alerting on everything is visible before the channel is abandoned.
- An alert that fired and was never picked up is visible as unpicked, rather than
  indistinguishable from one that was acted on.
- A period in which nothing crossed the threshold is reported as a quiet period, so
  nobody has to guess whether the pipeline was empty or the alerter was broken.

## Guidance

Speed is the asset. Contact and qualification odds fall away over minutes, not hours, so
everything done between the judgment and the send is spent from one budget: spend it on
context rather than on formatting. The threshold is the other half of the craft and it
is a claim about the reader's attention, not about the lead. A route that fires on
everything has already been tuned out, and the alert that mattered arrives there too.

## Where this is worth adopting

- A small sales team where every enquiry lands in one shared channel, so the person who
  would have called the serious one back inside the hour is scrolling past it alongside
  forty newsletter signups.
- A founder who is the only person able to answer a technical enquiry and is not at a
  desk most of the day, who needs the difference between what can wait until evening and
  what cannot decided before their phone buzzes.
- A team that already tried alerting on every lead, watched the channel go unread within
  a month, and now has no working route at all for the ones that matter.
- A business whose enquiries arrive from a time zone where its own people are asleep,
  where the honest question is not how fast the alert fires but what should happen to it
  until somebody is awake.
- An operation where the CRM is the system of record and nobody opens it unprompted, so
  a lead that was captured perfectly still sits untouched until somebody happens to
  look.

## Connector types

`messaging`, `crm`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[slack](examples/slack.md) for `messaging`,
[microsoft-teams](examples/microsoft-teams.md) for `messaging`,
[hubspot](examples/hubspot.md) for `crm`.

## Recommended trigger

`event`. The alert is worth exactly as much as its freshness and the decay is measured
in minutes, so a schedule would guarantee the loss it exists to prevent. It fires when a
lead is judged. What the adopter still owns is what happens to an alert that fires
outside working hours, which is a decision rather than a cadence.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which cases are actually worth interrupting somebody over, in the adopter's own terms,
  because this is the single setting that decides whether the channel keeps being read.
- Where the people who act on leads actually are, and who owns which kind of lead, since
  a shared channel and a direct message are different levels of interruption and reach
  different people.
- What context that person needs in order to act without going to look it up, which
  differs by how their first sales conversation usually opens.
- What should happen to a lead that crosses the threshold outside working hours, because
  the decay does not pause overnight and holding the alert until morning is a decision
  the adopter should make deliberately rather than inherit.

## Dependencies

None.
