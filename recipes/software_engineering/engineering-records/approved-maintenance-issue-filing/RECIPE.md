---
name: approved-maintenance-issue-filing
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/engineering-records
---

# Approved maintenance issue filing

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A maintenance proposal that a person approves and that then goes nowhere is
worse than never proposing it, because the approval felt like the work getting done and
the same proposal comes back a month later. The issue that does get filed usually
carries what was easy to write rather than what a maintainer needs, so it sits in the
tracker technically present and practically unpickable, and every attempt to start it
opens with a question.

**Input.** One approved proposal with the change and the context behind it, the code as
it stands now, and wherever work is actually tracked in this operation.

**Core action.** Turn the approval into a findable work item carrying what a maintainer
could act on without asking a question, with somebody named on the other end of it, and
never let a transport failure lose the decision.

**Output.** A work item carrying the change, how to see the situation it addresses, what
finished looks like, and a reference back to the approval it came from, or a durable
local record when there is no tracker or the tracker could not be reached.

## Activities

1. Take the approved decision with its change and its context *(observe)*
2. Confirm the change still applies to the code as it stands *(observe)*
3. Compose what a maintainer could act on without asking, and name who can answer
*(act)*
4. File it where work is actually tracked here, with a reference back *(act)*
5. Write the outcome back so the approval and the work item are one thing *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every approved maintenance decision becomes a findable work item that somebody could
start without a preliminary conversation.**

- The item carries the change itself, how to see the situation it addresses, and what
  finished looks like. A description of the problem alone is a finding and is not filed
  as a work item.
- Somebody is named who can answer a question about it, because what gets an item picked
  up is the conversation attached to it at least as much as the template it arrived in.
- The step from approved to filed is a recorded event with an actor and an identifier,
  not an implied consequence of the approval.
- The item carries a reference back to the approval it came from, so the same approval
  cannot be filed twice and a reader of either can find the other.

**A decision survives the tracker being unreachable, and the record says which of the
two happened.**

- A failure to reach the tracker produces a durable local record that names where the
  item should have gone, so it can be replayed rather than rewritten from memory.
- A fallback record is reported as a fallback and never counted as a successful filing,
  because the two are indistinguishable afterwards if nobody says which it was.
- Having no tracker at all is a legitimate arrangement: the local record is then the
  tracked work, not a degraded version of something better.

**A rejected proposal teaches the thing that proposed it, instead of disappearing.**

- A rejection is recorded with a reason specific enough that the same shape is not
  proposed again blindly.
- A proposal whose premise the code has already overtaken between approval and filing is
  recorded as overtaken rather than filed, and what is genuinely left of it is named.

## Guidance

The gap between a finding and a work item is everything a maintainer would otherwise
have to ask. Carry the change itself, how to see it, and what finished looks like, and
put a name on the other end: an item is picked up because of the conversation attached
to it more than the template it arrived in. Filing is a recorded event with an actor,
never an implied consequence. If the tracker cannot be reached, write the decision
somewhere it can be replayed.

## Where this is worth adopting

- A maintenance loop where proposals are approved in a review session and the tracker
  shows nothing new the next morning, so the same proposal is approved again a month
  later and the approval starts to feel like the work.
- A tracker full of items that describe a problem and stop, where each one costs a
  conversation before anybody can start it, and so almost none of them are started.
- A team whose approvals happen in one system and whose work happens in another with
  nothing linking the two, so nobody can answer whether an approved change ever shipped.
- An operation with no external tracker at all, where a local record is the honest
  arrangement and the real failure would be treating its absence as a misconfiguration
  to work around.
- An hour when the tracker is unreachable, where the difference between losing an
  afternoon of decisions and losing none is whether each one was written down before the
  call failed.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`event`. An approval is a real event made by a person, and the whole point of this work
is that as little as possible happens between the approval and the item existing. A
sweep would introduce exactly the interval in which an approval feels done and is not,
which is the failure the recipe is built to remove.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Where work is actually tracked in this operation, including the legitimate answer that
  nowhere is and the record stays local.
- Which repository or project an item belongs in, because an item filed in the wrong
  place is indistinguishable from a correctly filed one until somebody goes looking for
  it.
- What the labels mean here, since a label nobody filters on adds nothing and a label
  invented for this work's own bookkeeping quietly becomes noise for everyone else.
- Who is expected to answer questions about a filed item, because naming nobody is what
  turns a well written item into one that is never started.
- What this operation treats as enough detail to start work, since that floor is the
  difference between a tracker people read and one they skip.

## Dependencies

None.
