---
layer: technique
type: technique
subject: broadcast-software-control
technique: read-the-peer-not-the-ledger
status: forged
laws: []
shared_with: []
use_when: [deciding whether a scene or source exists before acting on it, showing the streamer whether a tool's overlay is set up, a tool's view of the broadcasting software disagrees with what the streamer sees]
---

# Read the peer, not the ledger

Whenever a decision depends on whether something exists in the streamer's broadcasting
software right now, the tool asks the software. Its own ledger answers whether an object is
the tool's; it never answers whether the object is still there.

## Why the ledger goes stale

The broadcasting software is edited by more hands than the tool's. The streamer deletes,
renames and duplicates through its interface; another tool connected to the same socket adds
and removes; switching scene collections replaces the entire set of objects in one action;
restarting the software with a different profile does it again. None of this passes through
the tool. Event subscriptions narrow the gap but do not close it: events are missed while
disconnected, some removals are not announced individually, and the first moment after a
connection is always blind.

A ledger that is treated as the state of the software therefore drifts, and every action
built on the drift misfires on air: a placement added to a scene that no longer exists fails
with an error the streamer does not understand; an "ensure the scene" step that consults the
ledger skips creation and leaves the tool with nowhere to put its overlay; a status panel
shows the overlay "live" while the streamer's own preview shows nothing.

## The procedure

- **Ensure-style operations read first.** "Ensure the tool's scene exists" lists scenes,
  looks for the owned identity, and creates only on observed absence. A create that is
  answered "already exists" is a sign the read was skipped or raced, and is resolved by
  reading again - then applying the claim rule, because what exists may not be the tool's.
- **Status shown to the streamer comes from a read**, stamped with when it was taken. "Overlay
  in scene: yes, as of 3 s ago" is honest; a green light computed from the ledger is a claim
  about the past dressed as the present.
- **After any gap in the connection**, the first act is a full inventory read and a
  reconcile against the ledger, before any mutation.
- **Events update a cached view between reads**; the cache is invalidated on reconnect, on a
  scene-collection change event, and on any request that fails for a reason implying the
  cache was wrong.

## Decision rules

- **When the read and the ledger disagree**, the read wins for existence and the ledger wins
  for ownership. An identity in the ledger but not in the read is absent; an object in the
  read but not in the ledger is not the tool's.
- **When a read is too expensive to make before every decision** (a large scene collection,
  a busy socket), cache with a short horizon and re-read before any destructive or
  on-air-visible change. Reads are cheap compared with a misfire on stream.
- **When the read fails**, the state is unknown and the UI says so; it does not fall back to
  the ledger's answer as though it were current.

## When not to use it

Ownership questions - may I remove this, is this object one I created - are answered by the
ledger and only the ledger; the peer cannot tell the tool who created an object, and asking it
leads straight back to trusting names.
