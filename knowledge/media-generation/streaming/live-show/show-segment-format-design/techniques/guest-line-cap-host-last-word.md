---
layer: technique
type: technique
subject: show-segment-format-design
technique: guest-line-cap-host-last-word
status: forged
laws: []
shared_with: []
use_when: [a format puts a foil, guest character or called-up viewer on stage, a second voice starts dominating the host, two generated voices trade lines without end]
---

# Guest line cap, host last word

When a format brings a second voice on stage — a foil character, a guest, a viewer
called up to the hot seat, a co-host — that voice gets a short, fixed allowance per
turn, and the host speaks after it every time. The cap keeps exchanges fast enough
for chat to follow and join; the last word keeps the show's frame, its judgement
and any correction in the voice the audience came for and the one that carries the
show's rules.

## Why both halves are needed

A cap alone keeps guests brief but lets an exchange end on the guest's line — and a
guest's line is where the show is least controlled: a called-up viewer's claim, a
foil's provocation, a guest's aside about a real person. Whatever is said last is
what the room takes away. The last word alone keeps the host closing, but lets the
guest's turn grow until the host is reacting to monologues. Two generated voices
without either rule converge on a known pathology: they trade increasingly long
lines with each other, the audience becomes spectators to a dialogue they cannot
enter, and the session ends wherever the context ran out.

## Procedure

1. **Declare the allowance in the segment's table** — typically one sentence per
   turn for a foil, a short fixed character budget for a viewer's line read on air.
   The allowance is a property of the format, not of the guest.
2. **Enforce the cap mechanically.** Generate or accept the guest's line, then cut
   it at the allowance on a sentence boundary before it reaches the audience. A
   direction that says "keep it short" is a wish; a cut is a rule. Tell the guest
   voice its allowance too, so it writes to fit rather than being truncated
   mid-thought.
3. **Schedule the host after every guest turn.** The turn order is guest, host —
   never guest, guest; never guest as the final utterance of a segment state. If the
   host's turn fails (a timeout, an empty response), the exchange is closed by a
   short host fallback line, not left on the guest.
4. **Give the host the guest's line as quoted input**, marked as someone else's
   words. The host may agree, mock, correct or overrule it; it never continues the
   guest's sentence as if it were its own, because that is how a guest's claim
   becomes the host's assertion.
5. **Limit exchange depth.** A guest-host exchange runs a small fixed number of
   rounds, then the host returns to the room. The audience is the show's main
   partner; the guest is a device for the audience's benefit.

## Decision rules

- **When the guest is a viewer**, the line read on air passes the same input
  moderation as any chat message, and the host's last word is where anything
  unacceptable in it is declined in character — not repeated, not elaborated.
- **When the guest's line contains a factual claim**, the host's last word is where
  the claim is graded: endorsed only if the show can stand behind it, otherwise
  framed as the guest's claim. An exchange that ends on an ungraded claim has
  published it.
- **When a format genuinely needs a long guest turn** — a story, a confession — make
  it a distinct state with its own clock, and keep the host's close after it.
  Raising the cap globally to fit one state breaks every other state.
- **When the host and guest are the same underlying generator playing two roles**,
  either generate them as separate calls with separate allowances, or — when the
  latency budget only affords one call — have the single call return an ordered,
  speaker-tagged list and enforce the rule on the parsed result: guest entries cut
  to the allowance, no two guest entries in a row, a host entry last, and guest
  lines accepted only for the guest who is actually on stage. One call writing both
  sides, trusted as written, drifts toward balanced dialogue, which is exactly what
  this rule exists to prevent; the single call is fine, the trust is not.
- **When the segment hands over while a guest is on stage**, the guest does not
  carry its seat into the next format. Dismiss it, or demote it to an occasional
  observer with a low rate of its own (a line every several minutes), so the new
  format opens as the host's.

## When not to use it

Formats built around an equal pairing — a debate between two hosts of equal
standing, a duet — need a symmetric turn rule instead, with a neutral close
(a timer, a vote) rather than one voice's last word. The asymmetry here is a
choice for host-centred shows, not a universal law of dialogue.

## Failure modes

- **The guest who took the show** — no cap; the foil's turns lengthen until the host
  is the sidekick.
- **Ending on the guest** — the segment closes on a viewer's or foil's line and the
  room carries it away as the show's position.
- **Truncation without notice** — the cap is enforced but the guest is never told,
  so every line is cut mid-sentence and reads broken.
- **Ping-pong** — guest and host trade rounds indefinitely while chat waits.
