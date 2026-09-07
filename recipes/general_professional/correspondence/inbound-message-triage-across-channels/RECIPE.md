---
name: inbound-message-triage-across-channels
version: 0.1.0
status: seed
domain: general_professional
path: general_professional/correspondence
---

# Inbound message triage across channels

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Messages arrive across several channels at once, and the ones that go missing
are not the ones somebody read and misjudged. They are the ones a resumable read stepped
over: an item that committed late but carried an earlier timestamp, a cursor advanced
before the rows were stored, a channel whose credentials expired while the other four
kept working and made the pass look clean.

**Input.** New messages from every connected channel, the position each channel was last
durably read to, and the record of which source identifiers have already been logged.

**Core action.** Resume each channel from a position taken from the source's own data
rather than the reader's clock, overlap it deliberately, and carry both the
classification's confidence and the pass's own coverage forward instead of collapsing
either into a verdict.

**Output.** A logged, classified record of everything that arrived, each carrying the
confidence behind its reply-needed judgment, alongside a per-channel account of what was
attempted, read and failed, delivered so that a channel which stopped is reported
through one that has not.

## Activities

1. Resume each channel from the position the last pass durably recorded, with a
deliberate overlap *(observe)*
2. Collect from every channel, carrying a per-channel result whether it worked or not
*(observe)*
3. Reject what has been seen before by the identifier its source gave it, not by its
text *(decide)*
4. Classify urgency, intent and entities, keeping the confidence rather than a verdict
*(decide)*
5. Hand each message on with its confidence, so the bar is set where the action is taken
*(act)*
6. Move each channel's position forward only once its messages are durably stored
*(deliver)*
7. Report attempted, read and failed per channel, warning about a dead channel through
one that still works *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**A message that arrived is in the log, including the ones that arrived out of order or
during a failure.**

- Each channel resumes from a position recorded only after the messages before it were
  durably stored, so an interrupted pass re-reads rather than skips.
- The resume point comes from what the source's own data said, never from the reader's
  clock, and overlaps far enough back to catch an item that committed late under an
  earlier timestamp.
- Where a source offers a monotonic sequence or offset it is used in preference to a
  timestamp, because a timestamp can go backwards and an offset cannot.

**A pass that read four channels out of five is not reported as a pass.**

- Every pass reports channels attempted, read and failed, so a partial run is
  distinguishable from a clean one without anybody noticing that a person went quiet.
- A channel that could not be read is reported through a path that does not share the
  failure it is reporting.
- Triage continues on the channels that still work rather than abandoning the pass, and
  the failure does not roll back what the working channels produced.

**Whatever acts on a message can still weigh the classification, because it was not
decided for them at collection.**

- A classification is handed on with the confidence behind it rather than collapsed into
  a flag at the point of collection.
- Re-reading the same message produces one record, keyed on the identifier its source
  gave it and never on its text.
- Two genuinely separate messages carrying identical text are two records, because a
  person who says the same thing twice said it twice.

## Guidance

Resume from what the source's own data said, never from your clock, and overlap the
window on purpose so a message that arrived late is read rather than stepped over. Move
the position forward only after the messages are stored. Deduplicate on the identifier
the source gave, not on the text: somebody who writes the same word twice wrote twice.
Carry the confidence forward instead of a verdict, and let whatever acts set its own
bar.

## Where this is worth adopting

- Somebody whose work arrives across mail, chat and a form inbox, where each channel is
  checked at a different rhythm and the quiet one is checked least, which is exactly
  where a missed request sits longest.
- A team that already has triage running and has never once been able to say whether a
  pass was complete, so a channel whose token expired sat unread for a fortnight while
  every run reported success.
- An operator whose downstream drafting work trusts a reply-needed flag completely,
  where the useful change is not a better classifier but handing on the uncertainty so a
  borderline call gets a human rather than a confident reply.
- Any setup where the same message reaches two connected channels, such as a mail alias
  that also posts into a chat room, and the cost of the second copy is a duplicate reply
  to a real person.
- A channel that pushes events rather than being polled, where the pass still needs a
  resumable position because the events that arrive while the reader is down are the
  ones nobody will ever look for.

## Connector types

`email`, `messaging`, `database`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`event`. Triage exists because a message arrived, which is a real external event with a
freshness window attached to it. Where a bound channel cannot push, adoption falls back
to a poll, and that is a limitation of the channel rather than a property of the work.
Either way the resumable position is still required, because an event stream missed
while the reader was down leaves nothing behind to notice.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which channels and accounts are in scope, because reading more than was intended is
  the one mistake here that cannot be taken back.
- What urgency means for this person, because a classification calibrated to somebody
  else produces confidence values nothing downstream should weigh.
- Which channel is trusted to carry a warning about the others, because the report of a
  dead channel has to travel a path that is not the one that died.
- Which senders or categories should never be surfaced at all, because filtering after
  classification still means the message was read, and for some senders that is itself
  the objection.
- How far back the overlap should reach, because it is sized against how late that
  source's items can commit, and a source nobody has measured gets an overlap chosen by
  guess.

## Dependencies

None.
