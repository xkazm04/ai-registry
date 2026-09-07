---
name: webhook-classification-and-routing
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/event-routing
---

# Webhook classification and routing

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Incoming events arrive in every shape from every system, and without one door
that classifies and fans them out they either reach nobody or reach everybody. The door
itself has three failure modes that are all silent: it reads a payload before
establishing who sent it, it does work before acknowledging receipt and so trains the
sender to send everything twice, and it drops what matches no rule without anybody being
able to count what was dropped.

**Input.** An incoming payload with the headers that authenticate it, the routing rules
currently in force, and the record of what has already been received.

**Core action.** Establish that the payload is genuine and durably held before anything
is decided from it, classify it well enough that the right rule applies, and treat both
losing an event and acting on one twice as failures, knowing that repeat delivery is
normal rather than exceptional.

**Output.** The event delivered once in effect to every destination its rule names, or
held where somebody is watching, with what matched no rule counted rather than
discarded.

## Activities

1. Establish the payload came from who it claims, before reading it *(observe)*
2. Hold the raw payload and acknowledge receipt before doing any work *(act)*
3. Classify by source, kind and consequence *(decide)*
4. Find the rule that applies, or take the catch all path *(decide)*
5. Shape the payload for each destination the rule names *(act)*
6. Fan out, and land what could not be delivered where somebody is watching *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every event that arrives is either delivered or held somewhere a person is looking,
and never merely gone.**

- An event that fails every destination is held with its original payload and the
  headers that authenticated it, so it can be replayed later without being
  re-authenticated by guesswork.
- The holding place is watched by both how much is in it and how old the oldest thing in
  it is, because a queue nobody reads is a discard with extra steps.
- An event matching no rule takes an explicit catch all path and is counted, so an
  unrouted event is a number somebody can look at rather than a silence.

**The same event arriving twice has the effect of arriving once.**

- Identity comes from what the sender assigned to the delivery, not from the shape of
  the payload, so two genuinely separate events that look identical are both acted on.
- The window over which repeats are recognised is longer than the sender's own retry and
  manual replay surface, and that surface is established at adoption rather than
  assumed.
- Where a destination is outside the operation, the identity is passed to it rather than
  only checked locally, since nothing held here makes a remote effect safe.

**The receiver stays fast and available under the loads it is actually given.**

- Receipt is acknowledged after the payload is durably held and before any routing work,
  so slow downstream work does not read to the sender as a failed delivery.
- An event of a kind this operation does not handle is accepted and counted rather than
  refused, because a refusal is retried for as long as the sender retries and can end
  with the sender turning the connection off.
- A payload that will never succeed however often it is retried is separated from one
  whose destination is merely down, so the first does not consume the retry budget of
  the second.

## Guidance

Authenticate before you read, because a classifier fed an unverified payload is routing
on an attacker's say so. Acknowledge after you have kept it and before you have used it,
because work done ahead of the acknowledgement is what turns one event into a retry
storm. Assume repeats. Take identity from the sender, never from the payload's shape,
since two identical real events are not one event. A person redirecting an event by hand
is correcting the rule that matched it, so the rule is what changes.

## Where this is worth adopting

- A small operation wiring up its first few external systems, where the receiver is a
  single script and the failure that has not happened yet is the one where a destination
  is down for an hour.
- An operation whose sender turned the connection off after a slow deploy made every
  delivery time out, so events stopped arriving entirely and nothing reported that they
  had.
- A payments or billing flow, where the same notification is redelivered for days and a
  receiver that acts each time charges, emails or credits more than once.
- A team that has been dropping unmatched payloads for months and has no idea how many,
  so nobody can argue about whether a rule is missing.
- An event source that fans out several notifications for one underlying change and does
  not promise their order, so a receiver treating arrival order as truth overwrites the
  newer state with the older.

## Connector types

`messaging`, `knowledge_base`, `spreadsheet`, `email`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[local-messaging](examples/local-messaging.md) for `messaging`,
[google-sheets](examples/google-sheets.md) for `spreadsheet`.

## Recommended trigger

`event`. An external system posting a payload is as literal an external event as this
corpus contains, and the work has no existence apart from it. This is the clearest event
case in the lane, and the reason the receiver's speed is part of the craft: the sender
is waiting.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which systems actually post here and how each one authenticates itself, because
  verification is the first step and it is different for every sender.
- How long each sender keeps retrying and how far back it can be asked to replay, since
  that surface is what sets the window over which repeats have to be recognised.
- Where each kind of event should land, since the destinations are the whole point and
  no default can guess them.
- Which effects need to be gated by a person before they run, which differs sharply
  between operations and is usually about money or about anything that reaches a
  customer.

## Dependencies

None.
