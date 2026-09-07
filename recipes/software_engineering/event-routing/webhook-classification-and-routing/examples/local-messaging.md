# In-app messaging as the `messaging` destination

What was learned mapping this recipe's catch-all and fan-out onto the platform's own
inbox. Nothing here is part of the recipe: swap the connector and this file stops
applying while the recipe does not change.

## What the mapping has to decide

**This is the destination that makes the catch-all path affordable, which is why it
matters more here than its capability suggests.** The recipe insists that an event
matching no rule take an explicit path and be counted, and the usual reason operations
skip that is that the catch-all needs a channel somebody set up. Delivering unmatched
payloads to an inbox that already exists removes the excuse. An adopter with nothing else
configured can still satisfy the outcome.

**It is a destination and not the durable hold.** The recipe's fallback has to survive a
restart, keep the original payload and its authenticating headers, and report the age of
its oldest item. An inbox message keeps none of those things in a form that can be
replayed. Bind this as the place the fallback is announced, and keep the fallback itself
in storage.

**Unmatched payloads are exactly the ones you should not paste in full.** A payload that
matched no rule is by definition one nobody has decided is safe to display, and it may
carry tokens, personal data or an entire object graph. Send the classification, the
sender, the delivery identity and where the raw copy is held, and let the reader go and
get it.

**A burst arrives as a burst.** There is no batching or rate limit between the router and
this inbox, so a sender replaying two days of failed deliveries lands two days of
messages at once. That is the moment the recipe's counting of unmatched events becomes
more useful than announcing them, and an adoption that only announces will bury the
inbox.

## What transfers to any messaging destination

- The cheapest available channel is what makes the catch-all path real rather than
  aspirational, and the catch-all is the highest-value line in most rule sets.
- Announcing a held event is not holding it.
- Never inline a payload nothing has classified; send the pointer and the identity.
