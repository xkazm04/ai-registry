---
layer: technique
type: technique
subject: streamer-in-charge-moderation
technique: ban-review-window-with-invalidation
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [automation wants to remove or time out a viewer, designing the confirm step for a proposed ban, deciding what an unanswered moderation proposal resolves to]
---

# Ban review window with invalidation

When automation concludes that a person should be removed, it creates a proposal, not an
action. The proposal sits in front of the streamer for a bounded window. Confirmation
inside the window executes it; expiry executes nothing and releases nothing — the message
stays held, the person stays untouched, and the case goes back to review; and any change
to the facts the proposal was built on voids it before it can be confirmed.

## Why bounded, and why expiry means no

An open-ended queue becomes a backlog the streamer clears after the stream by clicking
"confirm all", which is exactly the unreviewed automation the queue existed to prevent. A
window short enough to matter — on the order of a minute or two — keeps decisions close
to the moment, when the streamer still remembers the context and the viewer is still in
the room. And because the streamer is performing, the most common outcome of a proposal
is that nobody looked at it. That outcome must be harmless. A proposal that executes on
timeout is an automatic ban with a delay and a fig leaf. A proposal that *releases* on
timeout is the opposite mistake: the line the rule caught reaches the room because the
streamer was busy. Expiry resolves to held.

The queue is durable. A proposal survives a restart of the tool, and the window is
measured from when the rule fired, not from when the queue was reloaded — otherwise a
crash would hand every stale proposal a fresh two minutes.

## What invalidates a proposal

A proposal records its premises and is re-checked against them at the moment of
confirmation, not only at creation:

- **the evidence changed** — the message was deleted by its author or a moderator, or
  edited where the platform allows it;
- **the target changed** — the account was already timed out or banned by someone else,
  was granted moderator or VIP status, or left and was renamed;
- **the rule changed** — the rule that produced it was edited or disarmed, so the
  judgement behind it no longer stands; compare the rule now running with a snapshot
  stored on the proposal, not a version number that an edit might forget to bump;
- **the session changed** — the stream ended, the session was forced into shadow, the
  gate became unavailable, the tool lost its platform connection and cannot verify the
  target's state, or the proposal and the session disagree about whether chat is
  simulated: a proposal born in a rehearsal can never be confirmed against a real
  account;
- **care took over** — the viewer entered a care state after a disclosure, which voids
  every pending proposal against them.

An invalidated proposal is shown as voided, with the reason, and stays in the record. It
is never silently removed and never silently re-created.

## The procedure

1. **Create** the proposal with its evidence reference, target identity, suggested
   action, rule version and an expiry time. Show the countdown.
2. **Confirm** re-validates every premise, then sends exactly the confirmed action —
   never a harsher one, and the streamer may always choose a lighter one (delete only,
   short timeout) from the same card.
3. **Report the result** as the platform returned it: confirmed, refused (with the
   platform's reason) or unknown. A refused ban is a visible state, not a retry loop.
4. **Expire** to *held*, recorded as expired-or-withheld, with the count of expired
   proposals shown to the streamer in words that say nobody was removed.
5. **Dismiss** is a decision too: the streamer's "no" is recorded and fed back to the
   rule's shadow statistics as a false-positive signal.
6. **Keep the way back open.** Every confirmed removal or timeout can be undone by a
   person and petitioned by the viewer. Both are new records that point at the decision
   they reverse, never edits to it, so the log keeps what was decided and what was
   decided afterwards. Resolving a decision twice is a conflict, not an overwrite.

## Decision rules

- **When several proposals target one account**, merge them into one card with all the
  evidence; never present the same person to the streamer twice at once.
- **When the window is shown on one surface and enforced on another**, the enforcing
  side's clock decides. A countdown the interface keeps with its own copy of the window is
  a display; the confirm is re-checked where the action is taken.
- **When the window would expire during an incident**, do not extend it automatically.
  The streamer can act manually, or issue a scoped grant.
- **When a proposal's suggested action is permanent**, require the stored original to be
  open on screen before confirm is enabled.

## When not to use it

Holding a single message for review — the platform's own held-message queue — is not a
proposal against a person and needs no invalidation machinery; the message simply waits.
And actions the streamer initiates directly, by hand, are decisions already made: they
go straight to execution with honest result reporting.
