# In-app messaging as the `messaging` escalation channel

What was learned mapping this recipe's escalation onto the platform's own inbox. Nothing
here is part of the recipe: swap the connector and this file stops applying while the
recipe does not change.

## What the mapping has to decide

**It reaches somebody when they next look, and this recipe's whole value is time
sensitive.** The evidence is captured either way, which is the part that cannot be
recovered later, so an escalation that is read in the morning is still worth far more
than none. But the recipe's promise of a hypothesis while the condition is live is not
kept by this connector, and an adoption that needs a bounded response has to bind
something that reaches a phone. Say that at adoption rather than during the first
overnight incident.

**The captured evidence does not belong in the message.** Snapshots taken several times
over an incident are long, and the reader during an incident wants the hypothesis, the
one assumption it rests on, and what would confirm it. Put the evidence where it is
durable and link it, because the message is also the worst possible durable store: it
cannot be queried by the next incident of the same shape and the recipe's third outcome
depends on that being possible.

**There is no acknowledgement, so escalation cannot climb here.** Nothing reports that
the message was read, which means this connector cannot support an escalation that grows
in force when nobody responds. Where that matters, it is a second binding, and treating
the sent message as an escalation that happened is the failure this connector invites.

**One incident should be one thread of messages, not one per snapshot.** The capture step
runs several times, and an adoption that sends each one produces a stream that reads as
several incidents. Send once, when the hypothesis is formed, and reference the captures.

## What transfers to any messaging connector

- Capturing evidence and escalating are separable, and only the first is time critical in
  a way that cannot be recovered.
- A channel is not a store; the record the next incident reads has to be somewhere else.
- Without an acknowledgement signal, escalation cannot climb, and a delivered message must
  not be treated as a response.
