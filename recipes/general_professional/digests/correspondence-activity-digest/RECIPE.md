---
name: correspondence-activity-digest
version: 0.1.0
status: seed
domain: general_professional
path: general_professional/digests
---

# Correspondence activity digest

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Whoever runs an assisted-reply pipeline cannot tell whether it is keeping pace
without opening every channel. The count of things waiting is the number everyone
reaches for and it answers nothing, because a large queue that clears hourly is healthy
and a small one holding something nine days old is not. Meanwhile a total absorbs the
channel that stopped and reports its silence as progress.

**Input.** Arrivals, drafts produced and drafts cleared per channel over the period, the
age of the oldest item still waiting on a human, the contacts approaching unreviewed
sending, and the same measurements from the previous readout.

**Core action.** Lead each channel with the age of its oldest unserviced item rather
than the depth of its queue, set arrivals against clearances so a growing queue is
distinguishable from a merely large one, and never let a total stand in for the channels
underneath it.

**Output.** A per-channel readout carrying oldest-item age, arrival and clearance rates,
contacts near the point of sending unreviewed, and an explicit zero for any channel that
produced nothing, delivered as information that requires no response to have been worth
reading.

## Activities

1. Measure arrivals, drafts produced and drafts cleared for each channel over the period
*(observe)*
2. Find the oldest item still waiting on a human in each channel *(observe)*
3. Set arrivals against clearances to say whether each queue is holding or growing
*(decide)*
4. Identify the contacts approaching the point where their drafts would send unreviewed
*(decide)*
5. Compose the readout channel by channel, stating a zero as a zero *(act)*
6. Deliver it as information, carrying nothing that demands a response *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Whether the pipeline is keeping pace is answerable from the readout, rather than only
how much is sitting in it.**

- Each channel leads with the age of its oldest item still waiting on a human, not the
  number waiting.
- Arrival and clearance are both reported, so a queue that is growing is distinguishable
  from one that is simply large.
- The first readout states that it is a baseline and reports levels without claiming a
  trend.
- A contact is reported as approaching unreviewed sending before it happens, since the
  moment to object is beforehand.

**A channel that stopped is visible, because nothing is reported only in aggregate.**

- Every configured channel appears, including one that produced nothing, and a zero is
  written as a zero rather than left out.
- A fall in the total pending count is attributable to the channels that produced it.
- A channel that could not be read at all is named as unread, never reported as quiet.

**The digest informs without manufacturing something to do.**

- The digest is useful with no action taken on it.
- Its wording does not escalate in order to justify having been sent.
- A channel that is genuinely failing is handed to whatever raises alarms, and the
  digest records that it did so rather than becoming the alarm itself.

## Guidance

Report the age of the oldest thing still waiting on a human, not how many are waiting. A
queue of forty that clears every hour is healthy and a queue of three whose oldest item
is nine days old is not, and only the age separates them. Read each channel on its own,
because a total absorbs the channel that stopped and reports its silence as progress.
This is a readout, so let a quiet period read as quiet rather than dressing it up.

## Where this is worth adopting

- An operator who has handed several inboxes to assisted drafting and now has a second
  thing to supervise, where the failure they will not notice is not a bad reply but a
  channel that silently stopped being read at all.
- A small team where approving drafts is somebody's side duty, so the pending queue
  grows quietly for a fortnight and the first sign of it is a contact asking why nobody
  replied.
- The weeks after raising the volume a pipeline handles, when the only question worth
  answering is whether clearance kept up with arrival, and a headline count answers it
  either way depending on the day it was taken.
- A pipeline where contacts graduate to sending without review, and the operator wants
  to see who is approaching that line while there is still time to say no rather than
  after the first unreviewed message went out.
- Somebody who has been burned by a dashboard that found something urgent every day, and
  will only keep a recurring readout that is allowed to say the week was ordinary.

## Connector types

`database`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. A fixed interval produces a readout whether or not the picture moved, and
a readout sent on a clock is the kind a reader learns to close. Speak when enough has
accumulated that one look replaces a round of checking, and stay quiet when the levels
and the ages have not changed. The one thing a clock would buy, catching a queue that
stopped clearing, is better bought by watching the oldest-item age.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- How much detail is wanted, because the same digest reads as reassurance at one length
  and as an interruption at another.
- What keeping pace means for this pipeline, because an oldest-item age of two days is
  normal correspondence in one setting and a broken promise in another.
- Whether an unhealthy channel should wait for the digest or interrupt immediately,
  because those are two different pieces of work and only the calm one is this recipe.
- Which channels exist at all, because a channel nobody declared cannot be reported as a
  zero, and an absent channel is exactly the failure this readout is meant to catch.

## Dependencies

None.
