---
name: approved-draft-channel-publishing
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/social-publishing
---

# Approved draft channel publishing

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Approved work sits unpublished, and the person who approved it has no way to
tell whether their decision reached the world. The automated version of the same gap is
worse: a request that timed out after the post went up gets retried and the audience
sees it twice, or a piece is trimmed to fit a channel it was not approved at that length
for.

**Input.** A draft that has been approved for one named channel, that channel's own
limits and required fields, and the adopter's preference for whether approved work goes
live now or joins a queue.

**Core action.** Carry the approved draft through to being live or scheduled on the
channel it was approved for, without changing what was approved to make it fit, and
confirm what actually happened by reading the destination rather than by trusting the
response.

**Output.** The piece is live or queued on its channel, the approver has a link or a
scheduled time and knows which of the two it is, and a piece that could not be published
is back in their hands unchanged with the reason.

## Activities

1. Read the approval, the channel it names and what was actually approved *(observe)*
2. Check the piece against that channel's limits and required fields, and hand it back
rather than trim it *(decide)*
3. Publish or queue it once, carrying something that makes a repeat recognisable *(act)*
4. Read the destination back to learn whether the piece is live, queued or neither
*(observe)*
5. Confirm to the approver with the link, or with the scheduled time and how its outcome
will be observed *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**An approved draft reaches the channel it was approved for, or the person who approved
it hears why not.**

- The destination matches the channel the draft was approved for, rather than one
  dispatch path applied to everything.
- A piece that does not fit the channel is handed back with what does not fit named,
  never trimmed to fit, because trimming publishes something nobody approved.
- A destination failure leaves the draft intact and says what to do about it, rather
  than dropping it or rerouting it to a different channel.

**Live and queued are reported as different states, and a queued piece has an observable
end.**

- A confirmation says which of the two happened. A scheduled time is never reported as
  publication.
- Something later observes whether a scheduled piece actually posted, and the approver
  hears about it when it did not.
- A piece still sitting in a queue past its scheduled time is visible as stuck rather
  than indistinguishable from one that went out.

**Retrying after an uncertain result does not put the same piece in front of the
audience twice.**

- The publish carries something that lets the destination or the recipe recognise a
  repeat, so a request that timed out after succeeding does not become two posts.
- Before any retry the destination is read back, rather than the previous response being
  taken as evidence of what happened.

## Guidance

The dangerous case is not a failure, it is a success that looked like a failure: a
request that timed out after the post went up, retried, becomes two. Read the
destination back before you retry. Scheduled is not published, and a confirmation
carrying only a time has told the approver nothing about whether it went out. Where the
approved text does not fit the channel, hand it back. Trimming it to fit publishes
something nobody approved.

## Where this is worth adopting

- A team whose approvals live in one place and whose posting is done by hand somewhere
  else, where the gap between the two is a person who has other work and the backlog is
  invisible until someone asks.
- A creator whose automation double posted once in front of an audience, who now checks
  every publish by hand and has lost the whole benefit of automating it.
- A publisher on three channels with different limits, where the same approved copy fits
  two of them and arrives on the third with its last sentence missing.
- An approver who cannot say whether the things they approved last week actually went
  out, and has no way to find out short of opening each channel.
- A team that schedules a week ahead, where a piece that failed at its scheduled time
  looks exactly like a piece that succeeded until somebody notices the silence.

## Connector types

`social`, `knowledge_base`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[buffer](examples/buffer.md) for `social`, [linkedin](examples/linkedin.md) for
`social`, [x_twitter](examples/x_twitter.md) for `social`, [notion](examples/notion.md)
for `knowledge_base`.

## Recommended trigger

`event`. An approval is a real external event and the only honest starting point.
Publishing before it would defeat the gate, and polling for it would add latency for
nothing. The scheduled half of the work needs its own later observation, which is a
different question from what starts this recipe.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which channels the adopter actually posts to, since a destination with no working
  account is a failure waiting for the first approval rather than a gap discovered
  gradually.
- Whether approved work publishes immediately or joins a queue, which is a control
  preference rather than a configuration value, and which decides whether this recipe
  ever produces a link.
- Who should be told when a publish fails, because the failure is only useful if it
  reaches the person who approved the draft, and the person who approved is not always
  the person who set the recipe up.
- What each channel counts as a duplicate, since that decides whether a safe retry is
  possible at all or whether an uncertain result has to be resolved by a human.

## Dependencies

None.
