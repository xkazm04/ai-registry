---
layer: technique
type: technique
subject: audience-absorption-at-scale
technique: room-scaled-rate-caps
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [limiting how many messages or answers one viewer gets, a few viewers dominating a busy room, a lone engaged viewer going unheard in a quiet room]
---

# Room-scaled rate caps

A per-viewer rate cap bounds how much of one viewer the show takes in over a short window
— messages admitted per minute at the input, or answers given per few turns at the picker.
The technique is to make every such bound a **function of room size** rather than a
constant, so the same rule is generous when the viewer is most of the room and strict when
they are a sliver of it.

## Why a constant cap fails both ways

Set a fixed flood cap of a handful of messages per viewer per minute. In a busy room it is
sensible: nobody needs to read ten lines a minute from one person. In a room of three it
is a gag. The one viewer actually conversing with the host types faster than the cap
because the host is answering them — a real conversation at that size runs well above any
flood threshold — and the cap silently discards most of what they say. The host, seeing
an inbox with nothing in it, fills the gap with monologue, and the viewer concludes they
are being ignored. Raise the constant to suit the small room and a determined handful in a
room of eighty can bury everyone else. No constant is right at both ends, because what
the cap protects — every other chatter's share — is proportional to how many other
chatters exist.

## The shape of the scaled cap

Let B be the base cap that is right for a busy room, S the largest room still treated as
small, and A the distinct active chatters in the last minute. A cap of the shape
**B × (S + 2 − A) for A at or below S, and B above it** works well: in a room of one it is
several times the base, it steps down by one base allowance per additional chatter, and it
meets the base exactly where the room stops being small. The constants matter less than
three properties of the shape:

- **It is monotone in room size.** More chatters never loosens the cap.
- **It is continuous at the boundary.** The lenient regime hands over to the base cap
  without a cliff, so a room growing by one chatter does not suddenly start dropping a
  viewer's messages.
- **It loosens only for messages addressed to the host.** In a small room a message that
  names the host or asks a real question is part of a conversation; one that does neither
  is chatter, and gains nothing from leniency. Gating the leniency on address keeps the
  small room from becoming a free pass for spam.

The same logic applies to an answer cap at the picker: the bound on how many recent turns
may go to one viewer should loosen as the room shrinks, until in a room of one or two a
viewer may be answered on consecutive turns. Whatever the constants, they are tuning
parameters, and they ship with the measurement behind them — the peak message rate a
featured chatter actually reaches in a small simulated room, and answer concentration at
several sizes — not with an impression that the cap "felt fair".

## Decision rules

- **When choosing the cap's input**, count distinct chatters over the same window the
  picking mode uses, including the current batch, so the cap and the mode agree on how big
  the room is.
- **When the cap drops a message**, record the drop with its reason. A cap that discards
  silently is invisible in review, and the small-room gag above is found only by someone
  reading the drop log.
- **When an answer cap leaves only capped candidates**, yield to the least recently
  answered rather than leaving the host silent.
- **When a viewer's first message, an unanswered sincere question or a safety-critical
  message arrives**, skip the cap; those exemptions are governed elsewhere, and the safety
  bypass is never part of this tuning surface.
- **When a viewer is capped because they are flooding** — the same line repeated, baiting —
  that is moderation's persistence signal; keep it separate so that ordinary enthusiasm is
  never scored as an offence.

## When not to use it

A show that answers only curated questions submitted in advance, or one where each viewer
is answered once by design (a queue of callers), has no burst to shape. And a per-viewer
cap is no defence against coordinated accounts; ten accounts each under the cap are a
moderation problem, not an allocation one.
