---
layer: technique
type: technique
subject: streamer-in-charge-moderation
technique: decide-on-the-stored-original
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [showing a streamer the evidence behind a proposed moderation action, binding a moderation decision to what was actually said, answering a viewer's appeal after the stream]
---

# Decide on the stored original

The person deciding a moderation action sees the evidence itself: the message exactly as
it was captured when the rule fired, the sender's identity as the platform stamped it,
and the time. The decision is bound to that stored record. Nothing that stands between
the streamer and the evidence — a summary, a model's label, a fresh fetch of the account
— may replace it.

## Why the original, and why the stored one

A classifier's label is a claim. "Hate speech, 0.91" or a one-line summary written by a
model tells the streamer what the machine concluded, and a streamer under time pressure
will confirm a conclusion without reading the evidence if the evidence is one click
away. The label goes on the card; the original goes on the card first, and larger.

The original must also be the *stored* one. Chat moves: the author deletes the message,
the platform removes it, the account renames itself. A tool that re-fetches at decision
time shows the streamer whatever is true now — often nothing, sometimes a different
message — and binds the action to that. A tool that shows the record it captured shows
the thing the rule actually judged, and the action and its evidence can be audited as a
pair forever after.

## The procedure

1. **Capture at intake.** When a message enters the pipeline, persist the raw text, the
   platform's message identifier, the sender's stable account identifier and display
   name at that moment, and the receive time. The rule's verdict refers to this record.
2. **Render the original faithfully.** Show the text exactly, with look-alike characters
   and invisible characters made visible rather than normalised away, because the
   normalised form is the classifier's view and the person needs the viewer's. Show
   context: the few messages before it from the same account.
3. **Bind the decision to the record identifier.** The confirm request carries the
   proposal's identifier and nothing else — no text, no account name — and the deciding
   code reads the original from its own store. A text field on the confirm payload is a
   door for a caller, a summariser or a stale client to substitute the evidence. When the
   original is loaded, check that its message identifier and sender match what the
   proposal recorded; a mismatch is a corrupted association and refuses the action. The
   confirmed action carries the evidence record's identifier into the action log, so
   "who banned whom, for what" is a join, not a recollection.
4. **Reverse by identifier too.** Undo and petition work on the decision's identifiers
   alone. They never reconstruct or re-summarise the text, so a reversal cannot quietly
   rewrite what the original decision was about.
5. **Keep the record for the appeal horizon.** Retain the evidence for as long as the
   action can be appealed, then delete it on schedule; a moderation log that keeps chat
   forever has become surveillance. Erasure removes the text, not the fact that a decision
   happened: keep the decision's identifiers in the append-only log, and count an erased
   decision conservatively wherever counts matter (a ceiling of removals per hour), so
   deleting a viewer's data never resets a limit.

## Decision rules

- **When the stored original is unavailable** — not captured, purged, corrupted — the
  proposal cannot be confirmed, and the card says so instead of offering a confirm button
  that will fail. Offer a manual action the streamer takes on their own authority, logged
  as such.
- **When the evidence is a pattern across messages** (spam, flood), show the set, not a
  representative one.
- **When the message is in a language the streamer does not read**, show the original
  and a machine translation clearly labelled as one; the translation never replaces it.
- **When the evidence includes another viewer's personal data**, show it to the
  decider, and keep it out of any public surface, summary or clip.

## When not to use it

Room intents — slow mode, followers-only — are decided on the state of the room, not on a
message, and need no stored original. The technique applies wherever a decision lands on
an account.
