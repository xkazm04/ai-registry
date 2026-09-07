# Reddit as the `social` source

What was learned mapping this recipe onto Reddit specifically. Nothing here is part of the
recipe: swap the connector and this file stops applying while the recipe does not change.

## What the mapping has to decide

**The sort order is an editorial decision you are inheriting.** Pulling the top or hot
items from a subreddit means the platform's own ranking has already chosen what matters,
and a theme that never ranked is invisible to the digest no matter how many people were in
it. The digest then reports the community's front page rather than the community. If the
adopter wants early signal, sort by new and pay for it in noise; if they want the loud
stuff, sort by top and say in the digest that this is what it means. Do not leave the
choice implicit, because both answers are defensible and only one of them matches what the
reader thinks they are reading.

**Comment count measures contention, not reach.** Two people arguing produce hundreds of
comments, and this recipe's whole discrimination between a theme and a loud thread depends
on not being fooled by that. Distinct authors are available here, so use them: a thread
with four hundred comments from eleven accounts is a smaller event than four threads with
forty accounts between them.

**Each subreddit's register is its own baseline.** A support flavoured subreddit is
negative by construction and an enthusiast one is positive by construction. Sentiment
compared across a mixed set of them produces a ranking of the subreddits rather than a
reading of the week, and it will report the same subreddit as the problem every single
period. Baseline per source or do not report sentiment at all.

**A cross posted story is one story.** The same content appears under several ids in
several subreddits, and clustering that keys on the item rather than the content will
report a single announcement as three separate themes with corroborating sources.

**Content disappears between passes.** A thread can be deleted or removed by moderators
after it was covered, so evidence for a theme reported last period may simply not exist
this period. That is not a collector fault and should not be retried or reported as an
error.

**Rate limiting is the ordinary failure here, not the exception.** The honest response is a
shorter digest that names which sources went unread, which is exactly what this recipe's
second outcome requires. An abandoned run and a quiet week are the two things a reader
must never have to tell apart by guessing.

## What transfers to any social source

- Ask what the platform's default sort already decided. A digest built on a ranked feed is
  a digest of the ranking.
- Count distinct authors. Volume is a measure of argument, not of spread.
- A source's baseline register is part of its baseline. Absolute sentiment across mixed
  sources ranks the sources.
