# In-app messaging as the `messaging` connector

What was learned mapping this recipe onto the platform's own inbox rather than an
external channel. Nothing here is part of the recipe: swap the connector and this file
stops applying while the recipe does not change.

## What the mapping has to decide

**A report about the platform's own reliability landing in the platform's own inbox is
the natural default, and it needs no external account, which is why it is the honest
floor for adoption.** It is also the weakest possible distribution: the report reaches
whoever opens the application, which for a report meant to inform a funding decision is
usually the wrong person.

**The channel does not preserve the measures, only the prose about them.** This recipe's
third outcome asks that the numbers be written where the next report can read them, and
delivering to an inbox does not satisfy that. The message is the human view; the record
the next run compares against has to be somewhere else. An adoption that binds only this
connector and treats the sent message as the record will produce a first report every
time and never a trend.

**Length is not free here and there is no thread.** An external channel lets a summary
carry a link to the long version. In the inbox the long version is the message, so the
short pulse and the longer verdict this recipe distinguishes are two messages rather than
one with an expander, and sending both at once means the second is not read.

**There is no acknowledgement.** Nothing here reports that the report was opened, so the
recipe's claim that recommendations turn into work cannot be checked from the delivery
side. It is checked from the work queue instead, which is a separate binding and worth
making explicit at adoption rather than assuming the report implies it.

## What transfers to any messaging connector

- Delivering a report is not recording its measures; a channel is a view, not a store.
- Where the channel has no threads, a summary and a full report are two deliveries and
  the second one competes with the first.
- If nothing downstream acknowledges, the follow-through claim has to be checked
  somewhere other than the channel.
