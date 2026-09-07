---
name: correspondence-drafting-and-reply-review
version: 0.3.0
status: seed
domain: general_professional
path: general_professional/correspondence
---

# Correspondence drafting and reply review

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Replies written on someone's behalf either sound generic enough to be noticed
or need so much editing that they save nothing. The path from assisted to unattended is
worse than either, because it is usually built on a run of approvals, and a reviewer who
has approved thirty correct drafts is measurably less able to catch the thirty-first
that is wrong. The run is evidence of the reviewer's growing confidence, not of the
drafts improving.

**Input.** An inbound message flagged as needing a reply, the history with that contact,
the style profile built from earlier drafts to them, and the record of how much a human
changed each of those drafts.

**Core action.** Write for this recipient rather than for the channel, and grant
autonomy on how little a human had to change recent drafts rather than on how often they
pressed approve, keeping the categories where a wrong send cannot be taken back off that
path entirely.

**Output.** A sent reply that reads like the requester wrote it, a style profile that
needed less changing than the last one, and a graduation record built from edit
magnitude with a stated window in which any unreviewed send can still be stopped.

## Activities

1. Load the recipient's style profile and the history with them *(observe)*
2. Decide whether there is enough context to write in the requester's voice at all, and
decline if not *(decide)*
3. Compose the draft for this recipient rather than for the channel *(act)*
4. Decide whether this contact and this category may send without review *(decide)*
5. Route to review, or send inside a window in which it can still be stopped *(deliver)*
6. Fold the size and the kind of each human change back into the profile *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A reply sent on the requester's behalf reads like something they would actually have
written to that specific recipient.**

- The profile behind a draft reflects that recipient's own history rather than a house
  voice applied to everyone.
- A human change updates the profile so the next draft to that recipient needs less
  changing.
- A wholesale rewrite is recorded as a rewrite rather than folded in as a small
  correction, because the two teach opposite lessons about what was wrong.

**Sending without review is granted on how little the drafts needed changing, and it
remains reversible.**

- Graduation is measured on the magnitude of the changes a human made, never on a count
  of approvals.
- An approval returned faster than the draft could plausibly have been read does not
  count toward graduation.
- Messages carrying money, a legal position, a commitment, a date, a first contact or
  emotional weight never graduate, whatever the record shows.
- Anything sent without review is sent inside a stated window during which it can still
  be stopped, so a graduation that turns out to be wrong is recoverable rather than only
  regrettable.

**A message that cannot be written in the requester's voice is handed back undrafted
rather than filled in with something plausible.**

- A message declined for want of context is returned with what was missing, so the gap
  can be closed rather than guessed at.
- The number of messages declined is reported, so a rising decline rate reads as a
  context problem rather than as a quiet week.
- No draft is produced from a profile with too little history behind it to be that
  recipient's, since a generic draft is the output most likely to be approved unread.
- A draft that comes out in the register a model falls back to, the servile opening, the
  inflated significance, the group of three, is evidence the profile was too thin rather
  than a draft to be edited, because a reviewer approves that register faster than they
  approve a wrong one.
- A message returned undrafted that the requester then answers themselves has handed
  over the very writing the profile was too thin to produce, so their reply is folded
  into that recipient's profile the way an edit to a draft would be, because a decline
  otherwise teaches nothing and the thinness that caused it survives every later message
  to that contact.

## Guidance

Trust is earned by how little a human had to change the draft, not by how often they
pressed approve. A long run of approvals is what automation bias looks like from the
inside, and an approval returned faster than the draft could be read is not one. Keep
money, dates, commitments and first contact off the graduation path whatever the record
says. When there is not enough context to write in their voice, return nothing rather
than something generic.

## Where this is worth adopting

- An operator whose reply volume is the bottleneck in their week, who has tried
  templates and found that the replies people notice as templates cost more goodwill
  than the time saved was worth.
- Somebody already running assisted drafting who approves nearly everything and has
  started to suspect they are no longer reading, and wants the system to stop counting
  those approvals as evidence.
- A founder who writes very differently to investors, to candidates and to their oldest
  customer, where a single learned voice would be wrong for all three and the useful
  unit of learning is the person, not the account.
- A small business where the first message to a new customer sets the relationship, and
  the automation has to be structurally incapable of sending that one however good its
  record on everything else.
- A support or sales role where drafts are frequently missing the one fact that decides
  the reply, and the honest output is a refusal naming the missing fact rather than a
  fluent message built around the gap.

## Connector types

`email`, `messaging`, `database`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[personas_database](examples/personas_database.md) for `database`.

## Recommended trigger

`event`. The work is defined by one inbound message needing a reply, so it starts when
that message is flagged and has nothing to do until then. A reply also has a freshness
window, and pacing the work would spend the thing it exists to protect. Where a bound
channel cannot push, adoption falls back to a poll, which is a limitation of the channel
rather than a property of the work.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which channels and accounts the persona may reply from, because sending as someone is
  the least recoverable action available here.
- How much changing counts as light, because that judgment is the whole graduation rule
  and it depends on whether the requester edits for accuracy or for taste.
- Which categories must never graduate, because an exclusion the persona has to infer
  costs several bad sends to learn and each of those sends is out in the world.
- How long an unreviewed message should be held before it actually goes, because a
  holdback that is shorter than the requester's attention is a reversal path that exists
  only on paper.
- Samples of how the requester actually writes to different kinds of contact, because a
  profile with no starting point spends its first weeks producing exactly the generic
  draft this work is supposed to refuse.

## Dependencies

None.
