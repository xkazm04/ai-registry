# Slack as the `messaging` connector

What was learned mapping this recipe onto Slack specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**A failed escalation is worse than a late one, so it queues.** Delivery to a channel fails
for reasons that resolve on their own, and the failure is silent from the reporter's side:
the issue is marked escalated and nobody was told. Hold the undelivered escalation and retry
it on the next pass, and mark the issue as escalation pending rather than escalated, so the
two states cannot be confused by the pass that runs after.

**An escalation has to carry its own case.** Whoever is pinged is not looking at the tracker,
so a message that is only a link makes them open one thing to learn whether it was worth
opening. Include why this one was escalated, since that is the fact the recipe produced and
the tracker does not hold: tone, priority, how long it has waited, whether this reporter has
been here before.

**The channel stops being read the moment it is flooded.** A first pass over an untriaged
backlog will find far more escalations than a steady state does, and posting them
individually trains the channel to be muted before the recipe has ever run normally. Post one
summary above a threshold and name the count, and treat the threshold as a property of the
channel's audience rather than of the queue.

**Threads are the only place the outcome can come back.** A person replying in the thread is
the cheapest available signal that an escalation was right or wrong, and it is the input this
recipe's known-solution confidence is starving for. Escalating into a thread the pass can
read again later is worth more than escalating into a channel it cannot.

## What transfers to any messaging connector

- Escalation pending and escalated are different states; do not collapse them on a failed send.
- The message carries the judgment, not just the link; the link is what the tracker already had.
- Above a flood threshold, one summary. The threshold belongs to the audience, not the queue.
