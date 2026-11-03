---
layer: technique
type: technique
subject: platform-extension-release-ladder
technique: viewer-content-needs-identity-and-approval
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [an extension that lets viewers submit text or images, deciding what viewer submissions may appear in a streamer's panel, designing what a viewer's paid currency may buy inside an extension]
---

# Viewer content needs identity and approval

An extension that accepts anything a viewer authors — a caption, a drawing, a question, an
uploaded image — publishes it only when four conditions hold: the viewer shared their
platform identity before submitting, the streamer could review the item and approved it,
the published item carries the author's name, and the streamer can remove it at any time
afterwards. Viewer money inside the extension obeys a sibling rule: it buys looks and
acknowledgement, never the way in and never an outcome.

## Why each condition exists

**Identity before submission** makes every item attributable to an account the platform
can act on. Anonymous submissions turn the extension into a channel the platform's own
moderation cannot reach.

**Approval before publication** keeps the streamer the publisher of their own panel.
Auto-publication means the first time the streamer sees an item is when their audience
does, which is too late for the one item that matters.

**The author's name beside the item** tells the audience who said it, so the streamer is
not read as the speaker, and it gives the author the credit and the accountability
together.

**Removal at any time** covers the item that was fine when approved and is not now — the
author turned out to be a harasser, the image is a reference the streamer did not get.

The platform requires all four, and a version missing any of them will not pass review.
They would be the right design without the requirement.

## Procedure

1. **Gate submission on shared identity.** If the viewer has not shared their identity
   with the extension, the submit control explains why and asks; it does not accept the
   item and attach identity later.
2. **Hold every submission in a queue the streamer sees.** Pending is a visible state.
   Moderation tools may pre-filter the queue — rejecting obvious abuse, flagging
   likely problems — but nothing reaches the public view without a streamer decision, and
   a delegated moderator's decision counts only if the streamer granted that delegation.
   An automated operator — a model that runs the extension's rounds — proposes approvals
   into the same queue and acts on its own only if the streamer explicitly set it to,
   and that setting is a recorded grant the streamer can withdraw.
3. **Store the decision with the item.** Approved, rejected, removed: each with who
   decided and when. A rejected item is a state, told to its author plainly, never a
   silent drop the author reads as a bug.
4. **Render the author's name from the platform's record**, not from anything the viewer
   typed.
5. **Give removal one step, everywhere the item appears.** Removing an item removes it
   from every viewer's next snapshot, and the broadcast carries the removal at once.
6. **Bound what a submission can be.** Length, size, type and count per viewer per
   window. An unbounded queue is a denial of the streamer's attention.

## Money buys looks, never the way in

When the extension accepts the platform's paid currency, define what each purchase does
inside the extension's own catalogue: a visual effect, a highlighted acknowledgement, a
cosmetic. Two lists keep everything else off it, and they are not the same list.

**The platform forbids** money as the price of access to a game, of an entry into a draw
or contest (directly or through a token the money buys), of an item chosen by chance, of
a wager on an outcome the viewer does not control, of a chosen track, of voice features,
and of an item or experience the streamer or viewer names in free text instead of picking
from the extension's own predefined list. Most of that list is about the way in, not
about winning. A participation queue is the trap: buying a place in the queue to play
buys the way in for whoever it moves ahead. Keep it off the catalogue unless the platform
confirms otherwise, because a reviewer who reads it as access to a paid game rejects the
version.

**The show forbids** a vote's outcome and extra weight in a decision. The platform's list
does not name either one. The show's own rule forbids both, because each would let money
reach the room's decisions. A purchase the platform allows can still be off the show's
menu, and the catalogue holds only what both lists allow.

## Decision rules

- **When a feature lets viewers author anything that others will see**, it carries all
  four conditions or it does not ship.
- **When a moderator tool auto-rejects**, that is allowed; when it auto-approves, it is
  not.
- **When a purchase would change who wins, what is chosen or by how much**, it is off
  the catalogue.
- **When a purchase would let a viewer in** (to play, to a draw, to a contest, even
  through a token or a place in a queue), it is off the catalogue, however small the
  price.
- **When the streamer is offline**, submissions wait; they are not published to keep the
  panel lively.

## When not to use it

An extension where viewers only select among options the streamer or the team wrote —
a vote over fixed choices, a reaction from a fixed set — has no viewer-authored content
and needs only the money rule.
