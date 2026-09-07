# Slack as the `messaging` connector

What was learned publishing this digest into Slack specifically. Nothing here is part of the
recipe: bind a different destination and this file stops applying while the recipe does not
change.

## What the mapping has to decide

**A channel is a feed, not an archive.** The digest's claim to being retrievable later does not
survive a busy channel, a retention policy, or a workspace plan that trims history. If the
digest is meant to be the record of what the numbers were, it needs somewhere durable and the
Slack post should link to it rather than being it. This is the single most consequential
mapping decision here and it is easy to skip because posting feels like publishing.

**Message structure has hard limits and they truncate rather than fail loudly.** Rich layouts
cap the number of blocks in a message and the characters in each text block, so a digest that
grew over a busy period is the one that gets cut. Since the recipe already requires dropping
lines that would not change anybody's behaviour, treat hitting the limit as evidence the
selection step was too generous rather than as a formatting problem to work around.

**One message per period, edited, beats a thread of corrections.** A digest that has to be
amended because a source came back later is better updated in place, with the amendment noted,
than followed by a second post. Readers scan for the newest post and will otherwise read the
incomplete one.

**Where the digest is posted decides who is accountable for it.** A digest into a general
channel is read by everybody and owned by nobody. Posting into the channel of the team that
owns the affected tables is what turns a line about a table into somebody's item, which is the
difference between the digest being informative and being useful.

## What transfers to any messaging connector

- If the digest is the record, publish it somewhere durable and let the message point at it.
- A truncating destination is a signal the digest is too long, not a formatting obstacle.
- Amend in place; a correction posted after the fact is read second or not at all.
- Choose the destination by who owns the numbers, not by who might be interested.
