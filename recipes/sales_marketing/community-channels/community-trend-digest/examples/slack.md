# Slack as the `messaging` delivery channel

What was learned mapping this recipe onto Slack specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**Above the fold is the digest.** Slack collapses a long message behind a show more
control, and most readers never open it. Whatever survives that cut is what the digest
actually communicated, so the theme order is not presentation, it is the editorial
decision. On a quiet day this matters most: the line saying nothing happened has to be the
first line, because a quiet digest whose honesty is hidden behind show more reads as a
digest that failed to load.

**Put the detail in the thread and the headlines in the message.** The top level message
should be scannable in five seconds, with each theme's evidence and links in a thread reply
underneath. This is the opposite of what a lead alert wants from the same connector, and
for a different reason: an alert needs to be seen, a digest needs to be skimmed without
being lost.

**A digest posted where nobody is subscribed is delivered and unpublished.** Slack will
report success for a channel every member has muted. Before adoption, establish that
somebody actually gets notified, because this recipe already turns on the delivery point
mattering more than the clustering quality and a muted channel silently removes the whole
value.

**Decide now whether a correction is an edit or a post.** Slack allows editing in place,
which quietly rewrites history for everyone who has not read it yet and does nothing for
everyone who already did. If reviewers cut or correct after delivery, post the correction
rather than editing the digest, or the record of what the team was told stops matching what
the team was told.

**Reactions are the cheapest follow up signal available.** This recipe's third outcome
wants to know which themes anyone acted on, and an agreed reaction is the least intrusive
way to collect it. Pick the signal before the first digest, because retrofitting it means
the first months of history are unreadable.

**A bot that is not in the channel is a setup failure, not a delivery failure.** Hold the
digest, say so once, and let somebody fix it. Recording it as delivered is how a team
discovers three weeks later that the digest has been going nowhere.

## What transfers to any delivery channel

- Find out what the surface does to a long message, then write the digest for that. Above
  the fold is the digest.
- Delivery success is not readership. Establish that somebody is notified before adoption
  rather than inferring it from silence.
- If the surface allows silent edits, decide whether corrections are edits or posts before
  the first correction, not during it.
