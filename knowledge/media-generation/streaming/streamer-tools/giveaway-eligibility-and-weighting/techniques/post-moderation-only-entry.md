---
layer: technique
type: technique
subject: giveaway-eligibility-and-weighting
technique: post-moderation-only-entry
status: forged
laws: [typed-input-owns-its-channel]
shared_with: []
use_when: [deciding which chat messages may create a giveaway entry, adding a manual, imported or re-opened entry path, a viewer under moderation restriction tries to enter]
---

# Post-moderation-only entry

A giveaway entry is created by a chat message — a keyword, a command, a reaction — and the
chat that carries it is the same chat the moderation layer is screening. If entry reads
the raw stream, a message moderation removed still enters its sender, a restricted viewer
still enters, and a bot farm the moderator is busy banning is already in the list. The
technique closes that gap by making a **passed moderation verdict the only thing an entry
can be built from**.

## The procedure

1. **Give the passed message its own type.** The moderation layer emits verdicts — pass,
   hold, shadow, remove. A passed message is wrapped in a type that can be constructed
   only from a pass verdict, and the entry intake accepts nothing else. Held, shadowed and
   removed messages never become that type; a held message that a human later approves
   becomes it only through the same verdict path, never by the reviewer's tool building
   it directly.
2. **Make the intake the only constructor of an entry.** There is no second path —
   no "add viewer by name", no import from a previous list, no re-open that replays old
   messages without their verdicts. A path the streamer needs (the viewer whose message
   was eaten by a network drop) is satisfied by asking the viewer to enter again, which
   runs through moderation like any message. The intake feeds only draws that are still
   open: a frozen list is not merely refusing new entries, it is absent from the intake, so
   no late message can reach it by any route.
3. **Key entries by stable identity and dedupe at intake.** The platform's account
   identifier, never the display name. A second qualifying message from an identity
   already entered changes nothing, and the intake says so in its result rather than
   silently counting it.
4. **Read eligibility attributes from verified metadata.** Subscriber, follower,
   moderator and loyalty tier come from the platform's verified fields or the show's own
   records, never from text. When a field is missing, stale or could not be fetched, a
   gated draw excludes the viewer — fail closed — and the exclusion carries the reason.
5. **Re-check restrictions at the freeze.** A viewer who entered cleanly and was then
   banned or timed out before the freeze is removed at the freeze, with the removal in the
   record. After the freeze nothing is removed; ineligibility discovered later is the
   draw's replacement rule.

## Decision rules

- **When a new entry path is proposed**, it either produces the passed-message type or it
  does not exist. The question is never whether the path is trustworthy; it is whether it
  passed the room's one gate.
- **When the chat stream drops messages**, the lost interval is a gap, and a message inside
  it gets no verdict and no entry — never a presumed pass. The viewer whose entry fell in
  the gap enters again.
- **When moderation is unavailable**, entry is closed, not open. A giveaway that accepts
  entries while the screen is down accepts exactly the messages the screen would have
  stopped.
- **When a moderation rule is only observing**, its would-have-acted match is a pass and
  the sender enters, because entry follows the verdict in force, not the advisory one. Do
  not invent a stricter gate for draws alone — a message the room saw and the draw refused
  is a second, invisible moderation policy — but show on the draw's configuration screen
  which rules are armed, so the streamer knows what actually guards the entry list.
- **When a shadow-restricted viewer enters**, they are not entered, and the intake does not
  tell them why in chat — the restriction is invisible to its subject by design, and the
  intake does not undo that.
- **When a held message is approved after entries close**, it does not enter. Approval is
  not a time machine.

## When not to use it

A draw whose entrants are not chat participants — a list of email sign-ups, a raffle
among the streamer's own guests — has no moderation verdict to require. Use whatever
admission gate that list has, and apply the same structure: one constructor, one gate.
