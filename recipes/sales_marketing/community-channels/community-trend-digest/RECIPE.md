---
name: community-trend-digest
version: 0.2.0
status: seed
domain: sales_marketing
path: sales_marketing/community-channels
---

# Community discussion trend digest

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** The communities where a product's users talk about it move faster than anyone
can read, and the digest that is supposed to fix that fails in a specific way: it pads
to a consistent length, so a quiet week arrives looking exactly like a loud one and the
reader learns within a month that the length carries no information. What it reports as
a trend is usually one thread that got amplified, which is one voice rather than a
movement.

**Input.** Recent activity from the communities the adopter follows, the index of what
previous digests already covered, each source's own normal volume and register, and the
corrections reviewers made to earlier digests.

**Core action.** Separate a theme that genuinely ran from a single loud thread by
counting distinct voices rather than volume, judge each against what is normal for that
particular community, and ship fewer themes on a quiet day rather than stretching thin
material to a familiar length.

**Output.** A short themed digest of what those communities actually discussed, each
theme saying what if anything it asks of the reader, delivered where the team reads,
with the covered index and the reviewer's corrections written back so the next run
starts from them.

## Activities

1. Pull recent activity from the followed communities *(observe)*
2. Set aside what previous digests already covered *(act)*
3. Cluster the remainder into the themes that genuinely ran *(decide)*
4. Weigh each theme against that community's own volume and register *(decide)*
5. Write it short, saying what each theme asks of the reader *(act)*
6. Deliver it where the team reads, and record what was covered *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**The digest reflects what the followed communities actually discussed, and its length
carries information because it was never padded to look consistent.**

- A theme is supported by distinct voices in the community rather than by the comment
  count on a single thread.
- The same story appearing across three communities is reported as one theme, not three.
- The digest ships fewer clusters on a quiet day rather than stretching thin material to
  reach a configured maximum.
- Counts are given as counts where the numbers are small, because a move from three
  mentions to six is two people and not a doubling.

**A reader can tell a quiet week from a broken collector without asking anyone.**

- A period with no new discussion ships a short note saying so rather than going silent.
- A source that could not be read is named as unread, so an absent theme is never
  mistaken for an absent conversation.
- Something that was there in an earlier pass and is gone from this one is reported as
  removed rather than quietly dropped, since a deletion is evidence about whoever
  published it, and a digest that reads only what is currently present reports a quiet
  week that was not quiet.
- The first digest declares that it is establishing what normal looks like, rather than
  reporting a change against nothing.

**Each digest leaves the next one better informed, rather than starting from the same
blank page every period.**

- What was covered is written back, so a theme already reported does not return next
  period as news.
- A reviewer's reason for rejecting or cutting something is recorded with the reason,
  not just the cut, so the same judgment is not relearned every period.
- Which themes anyone actually followed up on is carried forward, so a digest that
  nobody acts on is visible as such rather than continuing indefinitely.

## Guidance

A theme is not volume. One thread with four hundred comments is one voice amplified;
three threads in three places is a theme, so count distinct originators rather than
posts. Judge each against that community's own normal, including its register: a support
forum is negative by construction and reading that as a sentiment shift is the commonest
false finding here. Ship fewer themes on a quiet day and say the day was quiet. A digest
that padded once is skimmed forever.

## Where this is worth adopting

- A product whose users discuss it in three or four communities the team cannot keep up
  with, where somebody currently skims one of them on a good week and nobody reads the
  others at all.
- A team that already runs a daily community digest and has watched it become wallpaper,
  because it is the same length every day whether or not anything happened.
- A company that found out about a serious complaint thread from a customer rather than
  from its own monitoring, and wants the difference between a bad afternoon and a real
  pattern decided before it reaches anyone senior.
- A launch or an outage week, when volume rises across the board and the usual reading
  of a spike as a signal would report the whole week as significant.
- A solo founder whose competitors and users are in the same forums, who needs a short
  read that is honest about quiet weeks rather than one that manufactures a reason to
  exist.

## Connector types

`social`, `messaging`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[reddit](examples/reddit.md) for `social`, [slack](examples/slack.md) for `messaging`.

## Recommended trigger

`self_paced`. Communities are busy on their own rhythm, so a fixed cadence guarantees
both padded digests on quiet days and truncated ones during a surge. Look when enough
new discussion has accumulated to form a theme, and less often on quiet sources. A
delivery habit such as a morning standup is a real preference, but it belongs to the
charter rather than to the craft.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which communities the adopter actually follows and what they are watching for there,
  because relevance in a community digest is entirely a function of the reader's current
  work.
- What normal looks like in each of those communities, in volume and in register, since
  sentiment is only readable against a source's own baseline and a support forum is
  negative by construction.
- Where the digest should land and who is expected to act on it, since a digest posted
  where nobody looks is not a digest and the delivery point does more for adoption than
  the quality of the clustering.
- What the adopter considers out of bounds to surface, which is a judgment about their
  own team and their own users rather than a content filter setting.

## Dependencies

None.
