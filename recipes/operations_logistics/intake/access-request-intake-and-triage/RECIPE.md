---
name: access-request-intake-and-triage
version: 0.1.0
status: seed
domain: operations_logistics
path: operations_logistics/intake
---

# Access request intake and triage

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Access requests arrive as ordinary messages among everything else, so the same
ask gets entered twice, or read once and forgotten, and the record of who asked for what
stops being something anyone would defend. The request that does reach an approver
arrives naked: it says what was asked for and nothing about what the person already
holds, which is the one thing that would have decided the answer.

**Input.** Inbound request messages, the organisation's own access level vocabulary, the
record of requests already captured and how they were answered, and what the requestor
currently holds.

**Core action.** Decide what each message is really asking for and why, whether it has
already been captured or already been satisfied, and how much privilege it carries, then
assemble the context the approver cannot see for themselves, because a request that
arrives without it gets approved without being read.

**Output.** One durable, deduplicated request record per real ask, classified by
privilege, carrying the reason behind the ask and what the requestor already holds, and
ready for a decision.

## Activities

1. Collect inbound access requests from the watched channel *(observe)*
2. Read the requestor, resource, access level and urgency out of each message, and the
reason behind the ask *(observe)*
3. Check what the requestor already holds and how the same ask was answered before
*(observe)*
4. Set aside repeats, asks that are already satisfied, and senders who may not ask
*(decide)*
5. Judge privilege level against the organisation's own access vocabulary *(decide)*
6. Write each real request as a durable record carrying the context the approver will
need *(act)*
7. Hand the classified request to the approval decision *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every incoming access request is captured once, correctly classified, and never
lost.**

- Each distinct request produces exactly one record, with duplicates and malformed
  requests handled without dropping the underlying ask
- Every request carries a privilege classification stated in the organisation's own
  vocabulary before it reaches the approval chain
- A window with no requests is recorded as a window with no requests, so a quiet channel
  and a broken watch look different

**The approval chain never starts deciding on an incomplete, unverified or already
answered request.**

- Requests from unverified or external senders are flagged rather than queued for
  approval
- The record exists and is durable before the approval work is notified
- A request for access the person already holds is closed as already satisfied, with
  what they hold named, rather than passed on
- A repeat of an ask that was previously denied is presented as a repeat with the
  earlier reason attached, not as a new request

**What reaches the approver is the access the problem needs, or an honest statement that
the ask is wider than the reason given.**

- Every record carries the reason behind the ask, not only the level requested
- Where the requested level is wider than the stated reason supports, both are recorded
  and the difference is named rather than the wider one being passed on silently
- The record is never narrowed on the requestor's behalf without saying so, because
  deciding the scope is the approver's job and not intake's

## Guidance

Intake decides what an approver sees, which means it decides whether they read. A
request that arrives with the reason behind it and with what the person already holds
gets a real answer; one that arrives as a bare level gets a reflex. Catch the ask that
is already satisfied before it costs anyone attention. Classify privilege in the
organisation's own words, since that classification is what later forces a human to
speak. Completeness beats speed, and an unverified sender is a signal rather than a
queue item.

## Where this is worth adopting

- A team where requests arrive in three places at once, a shared inbox, a channel and
  direct messages to whoever seems responsible, and the only record that a request
  happened is that somebody remembers it.
- An organisation that has just adopted an approval chain and discovered that the chain
  works fine while the queue feeding it is full of duplicates, requests for access
  already held, and asks from contractors nobody checked.
- A growing company where the person who used to know everyone's access by memory has
  stopped being able to, and approvals have quietly become guesses dressed as decisions.
- A period after an incident, when access requests spike and the pressure to move fast
  is exactly when a request from outside the organisation is most likely to be waved
  through.
- Preparation for an audit that asks for the population of access requests over a year,
  where an incomplete queue is not a gap in a report but an admission that the
  population was never known.

## Connector types

`email`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`event`. A request arriving is a real external occurrence and the work has no value
before it. Adoption may realise this as inbox polling where the bound connector cannot
push, but the kind of thing being waited on is an arrival, not a clock.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The organisation's access level vocabulary, because privilege classification is the
  whole judgment here and the words differ per organisation
- Which inbox, label, folder or channel carries real requests, since the seat should not
  read everything
- Who counts as allowed to ask, because a request from outside is a security signal
  rather than a queue item, and because a request forwarded on someone's behalf has a
  sender who is not the requestor
- Where the record of what people currently hold can be read, because without it the
  context that stops an approver rubber stamping is not available and the recipe should
  say so rather than pretend to assemble it

## Dependencies

None.
