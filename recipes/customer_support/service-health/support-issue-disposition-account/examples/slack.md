# Slack as the `messaging` connector

What was learned mapping this recipe onto Slack specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The account has to survive being read on a phone.** A channel post is skimmed in a
scroll, which is what forces the recipe's link-out discipline to be real rather than
stylistic. Anything past the first screen is not read, so the few named issues have to be
the first thing in the message and the counts have to come after them, which is the
opposite order from how the account is assembled.

**A channel post is not a record.** It is retained by a workspace policy the adopter does
not control, it cannot be re-read by the next run, and a failed post leaves nothing behind.
This recipe's third outcome is unmet by posting alone: write the account somewhere durable
first, then post, and treat the post as the notification rather than the artifact.

**Threads split the audience.** Posting each account as a reply in one long thread keeps
the history together and makes it invisible to anyone who has not opened the thread; posting
each to the channel keeps it visible and scatters the history. Pick one at adoption and say
which, because switching later silently loses whichever half the reader was relying on.

**A failed post should queue, not disappear.** Delivery fails for reasons that resolve on
their own, and an account that was written but never announced is a worse failure than a
late one, because nothing indicates it happened.

## What transfers to any messaging connector

- Named items first, counts second. The assembly order is not the reading order.
- The message is the notification; the record is somewhere else.
- Queue a failed delivery rather than dropping it, and say in the next account that it was
  late.
