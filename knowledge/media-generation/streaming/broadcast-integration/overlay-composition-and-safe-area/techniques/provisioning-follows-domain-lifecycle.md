---
layer: technique
type: technique
subject: overlay-composition-and-safe-area
technique: provisioning-follows-domain-lifecycle
status: forged
laws: [causality-over-sequence]
shared_with: []
use_when: [deciding when an overlay source is created and removed, designing a stream set-up step for a tool with several overlays, an overlay never appeared on stream or lingered after its moment]
---

# Provisioning follows the domain lifecycle

An overlay shows a thing — a ballot, a draw, a duel, a meter for a running goal. Its source
in the scene is created when that thing begins to exist and removed when it ends. The
overlay's lifecycle is the domain object's lifecycle, not the set-up wizard's and not the
broadcast's.

## The failure of "set up everything first"

A one-shot set-up step that provisions all overlays at once is attractive: the streamer
sees the full layout, and the tool touches the scene only once. It goes wrong in two
directions. If set-up creates overlays for things that do not exist yet, those sources
render an empty frame or a placeholder on air for an hour. If set-up creates only the
overlays whose data exists, every overlay whose subject is born later — the result plate
that exists only once a draw is sealed, the duel board that exists only once a duel is
called — is never created, and the first time anyone learns of it is the moment it should
have appeared. Both failures pass a set-up checklist.

## Procedure

1. **List each overlay kind with its birth and death event.** "Ballot bar: born when a
   ballot opens, dies when its result has been shown for the dwell time." "Result plate:
   born when a draw is sealed, dies when the streamer dismisses it or the session ends."
   An overlay kind without both events is not designed yet.
2. **Provision on the birth event.** The handler that moves the domain object into being is
   the one that brings the source into play, with its declared placement. It does not wait
   for the streamer to find a set-up screen. Where the product keeps the streamer in charge
   of their own scene — no source appears without a deliberate act — the birth event
   *offers* the overlay where the streamer is already working: one confirm, placement
   already filled, at the moment the thing exists. What fails is an overlay whose only
   way onto the stream is a separate screen the streamer must remember to visit.
3. **Remove on the death event, and prove it.** Removal is part of the lifecycle, not a
   cleanup job; a stale overlay on air is a false claim that the thing is still running.
4. **Show the future in set-up.** The set-up screen lists every overlay kind, including those
   not yet born, with the event that will create them ("appears when you seal a draw") and
   lets the streamer choose and preview their placement now. The streamer arranges the
   whole layout once; the tool creates each piece when it is real.
5. **Order the events causally.** The overlay appears because the thing happened, close
   enough in time that a viewer connects them; an overlay that appears long before or
   after its cause reads as unrelated.

## Decision rules

- **When an overlay's data does not exist yet**, the overlay does not exist yet; do not air
  an empty shell.
- **When the domain object ends**, the overlay leaves, after a deliberate dwell if the
  ending is the point (a result), immediately otherwise.
- **When a session restarts or a rehearsal resets**, overlays born in the previous session
  are removed with it; nothing carries over by accident.
- **When the streamer has placed a future overlay in set-up**, the birth event uses that
  placement, not the default.

## When not to use it

Some overlays are persistent furniture — a standing contribution meter, a channel badge —
whose subject exists for the whole broadcast. They are provisioned at set-up and that is
correct; their lifecycle is the session's. The technique is for overlays tied to events.
