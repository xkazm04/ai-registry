# Slack as the `messaging` connector

What was learned mapping this recipe onto Slack specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A message is not a decision record.** A posted approval can be edited, and the edit is
not visible to anyone reading the thread later. Whatever the chain writes as the verdict
has to be written somewhere the approver cannot silently revise, and the Slack message is
then a notification pointing at it rather than the record itself. Treating the thread as
the audit trail is the most common way this mapping fails a review that asks who approved
what.

**Identity in the channel is not identity in the system being granted.** The person who
answers in Slack is a workspace member; the access is granted to an account somewhere
else. Establish the mapping between the two at adoption, because a chain that records the
Slack handle has recorded a name that no later reconciliation can join against the grant.

**A direct message is invisible to everyone who is not in it.** Routing an approval to a
person privately makes the chain quiet in exactly the way this recipe exists to prevent:
nobody else can see that a request has been sitting for two days. Route to a channel the
escalation target can also read, and use the direct message only for the nudge.

**Volume is what breaks the human gate here, and Slack hides it.** Every request looks the
same in a channel, so an approver has no sense of how many they approved this week. The
share of requests reaching the human gate is a number this recipe has to report explicitly
because the surface will never show it.

## What transfers to any messaging connector

- The verdict lives in a durable record; the message is a pointer to it, never the record.
- The identity that answers and the identity that receives access are different, and the
  join between them is set at adoption.
- Route to a place the escalation target can see, so a stalled request is visible before it
  times out.
