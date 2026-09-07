---
name: source-artifact-channel-repurposing
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/social-publishing
---

# Source artifact repurposing for channels

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Something published once reaches only the audience of the place it was
published, and reformatting it by hand for every other channel is the work that quietly
stops getting done. The automated version usually makes it worse: the piece is cut into
excerpts, each of which was written assuming what came before it, so every variant reads
as a fragment of something the reader cannot see.

**Input.** One published artifact in whatever form it exists, a video, an article, a
transcript or pasted text, plus the written voice description for each channel in scope
and each channel's hard constraints.

**Core action.** Decide what each channel actually wants from this source, then write it
as a piece that stands on its own in that channel, grounded in that channel's own voice,
rather than reformatting the same text or lifting a passage out of the middle.

**Output.** One draft per channel in scope, each complete without the source in front of
the reader, each respecting that channel's constraints and voice, each waiting on its
own separate approval.

## Activities

1. Resolve the source artifact into text worth working from, and name what could not be
resolved *(observe)*
2. Read the voice description and the hard constraints for each channel in scope
*(observe)*
3. Decide what each channel wants from this source, or that it wants nothing from it
*(decide)*
4. Write a channel specific draft that stands on its own, rather than an excerpt *(act)*
5. Present each draft for its own separate approval, with any constraint it could not
meet *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Something published once is present wherever its audience is, in a form that belongs
to each place.**

- Each draft is a rewrite grounded in that channel's own written voice, not the same
  text reformatted and not a passage lifted out of the middle.
- Each draft restates whatever the source assumed its reader already knew, because a
  reader who met this in a feed did not arrive through the link.
- Nothing is published without an explicit approval for that specific channel, and one
  refusal does not hold the others.

**Each variant has decided whether it delivers the value or points at it, and the rest
of the draft follows from that decision.**

- A draft that delivers the value is complete in the channel, so a reader who never
  follows the link has still had the thing.
- A draft that points at the source says what the reader gets by going there.
  Withholding the finding as bait is not pointing at it.
- Where a channel's hard constraint cannot be met, the failure is shown beside the draft
  rather than resolved by truncating it.

**A source or a channel that should be left alone is left alone, and the decision is
written down rather than left as an absence.**

- A channel whose voice description is missing is held back and named, rather than
  drafted for generically.
- A source judged not worth repurposing produces that finding, instead of four drafts
  nobody is going to approve.
- A source whose claim has been overtaken since it was published is checked before it is
  rewritten, and the check has the authority to decline and say why.

## Guidance

The claim transfers between channels and almost nothing else does. An opening written
for someone who followed a link fails in a feed, where the reader arrived by accident
and knows nothing. So restate the premise every time, and never lift an excerpt, which
was written assuming what came before it. Decide per channel whether the draft delivers
the value or points at it, because that one choice sets the length, the structure and
the ending. Withholding the finding as bait is not pointing at it.

## Where this is worth adopting

- A team that publishes one substantial piece a week and announces it on three channels
  as a title plus a link, and cannot work out why almost nobody follows it.
- A solo operator whose best work is a video or a talk, whose buyers read written
  channels instead, and for whom reformatting takes about as long as making the original
  did.
- A company where the same paragraph goes out everywhere on the same morning, reaching
  one heavily overlapping audience that experiences the reach as noise.
- A team whose repurposing is an automation that cuts a long piece into five excerpts,
  each of which reads as a fragment of something the reader cannot see.
- A channel newly added to the mix whose voice nobody has written down, where every
  draft made for it comes back rejected on tone and nobody can say what the tone should
  have been.

## Connector types

`research`, `web_scraping`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[youtube_data](examples/youtube_data.md) for `research`,
[firecrawl](examples/firecrawl.md) for `web_scraping`.

## Recommended trigger

`event`. The work begins when a source artifact is published. There is nothing to
repurpose before that and no reason to look on a clock. An adopter with a backlog of
already published work should expect a first run to be a batch and say so, rather than
treating the backlog as a stream of events.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which channels are in scope, since drafting for a channel with no account is waste and
  drafting for one whose voice has never been written down produces rejections.
- Where source artifacts come from and whether their arrival should trigger this at all,
  because a channel feed and a manual paste are different levels of automation and only
  one of them needs a judgment about what deserves a fan out.
- What the adopter considers a source worth repurposing, since not everything published
  deserves one, and the recipe needs permission to say so.
- Whether the variants are meant to land together or be spread out, because a single
  overlapping audience seeing the same claim five times in a morning experiences reach
  as repetition.

## Dependencies

None.
