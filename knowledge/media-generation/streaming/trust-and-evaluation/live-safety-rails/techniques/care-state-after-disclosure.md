---
layer: technique
type: technique
subject: live-safety-rails
technique: care-state-after-disclosure
status: forged
laws: []
shared_with: []
use_when: [a viewer has disclosed a crisis or sincere distress and the stream continues, deciding how long the host's care for one viewer must last, enforcing that a host never roasts a viewer about what they disclosed]
---

# Care state after disclosure

A disclosure sets a care state on that viewer which outlives the moment, and the state is
enforced by the machinery that picks targets and gates output - not by the model's memory
of the moment. The handoff line is the visible part of the response; the care state is the
part that keeps it true for the rest of the stream.

## Why the moment is not enough

This failure is observed, not imagined: a host that dropped the bit, gave one kind line and
pointed to real help came back to the same viewer under three minutes later and roasted
them about the very detail they had disclosed - a person they had said they could reach out
to. A host that does that has not made a tone mistake. It has made a structural
one: the care lived only in the reply that contained it. By the time the viewer chats again
the disclosure has scrolled out of the window the model sees, or is still there but
outweighed by the persona's standing instruction to roast whoever is talking. The model
did nothing wrong by its own lights; nothing told it this viewer was different now.

So the obligation cannot be left to recall. It is state, set deterministically by the same
event that triggered the handoff, and read by every component that decides what the host
does next. A per-turn instruction that says "this viewer may be in distress" is not the
state: it is attached to the turn that carried the disclosure and is gone on the next one.
Neither is a judge that catches the later roast after the fact - it measures the failure,
it does not prevent it.

## What the state does

A viewer in care state:

- **is not a roast target.** The picker does not select their messages for the roast,
  insult or menace treatment, and the crowd-voice summariser does not fold them into a
  mocking summary. They can still be greeted, thanked and answered warmly.
- **has their disclosure sealed.** The details they shared never reappear in any host line,
  for any reason, including affectionate callbacks. The output gate checks lines addressed
  to or naming the viewer against the roast classifier and against the sealed details.
- **is out of the steering economy's reach.** No vote, gift or proposal can target them for
  a punishment, a bit or a spotlight.
- **survives every path.** The fast lane, scripted beats and canned lines all read the same
  state; a stall line that improvises a roast of "whoever spoke last" must not land on them.

The state also protects the viewer from the room: messages from other viewers that mock the
disclosure are moderation's to drop, and the host never amplifies them.

## Duration and lifting

The state lasts at least for the rest of the stream. A viewer saying "I'm fine now, roast
me" does not lift it within the same stream: a person who disclosed danger minutes ago is
not in a position to consent to being the bit, and the room cannot tell whether the
retraction is sincere. Only the owner or a human moderator may clear it early, and doing so
is a recorded act.

Whether the state carries into the next stream is a privacy decision as much as a safety
one. If it carries, store the minimal flag and an expiry, never the content of the
disclosure, and let it decay; a viewer should not be treated as fragile forever because of
one night. If it does not carry, say so in the safety policy rather than leaving it to
whatever the memory system happens to retain.

## Decision rules

- **When a sincere-class message arrives (sadness, not danger)**, set a lighter, shorter
  care state: not a roast target and no callbacks to the detail for a window, without the
  full sealing. Sadness mined for material twenty minutes later is the same failure at a
  smaller scale.
- **When the care state and a segment rule conflict** - a segment whose format is roasting
  each viewer in turn - the care state wins and the segment skips the viewer silently, with
  no announcement that it is doing so.
- **When the state cannot be read** (store unavailable, viewer identity uncertain), fail
  toward care: treat the viewer as in care state.

## When not to use it

Do not set it from third-person or fictional references, or from dark humour classified as
neither crisis nor sincere. And do not make it visible: no badge, no on-screen marker, no
host line announcing that the viewer is being treated gently. A care state the room can see
is a spotlight.
