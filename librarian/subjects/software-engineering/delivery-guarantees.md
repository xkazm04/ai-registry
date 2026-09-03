---
subject: delivery-guarantees
domain: software-engineering
last_touched: 2026-09-01
touched_by: intake
dry_streak: 0
---

# delivery-guarantees

First touch: [[2026-09-01-matrix-rust-sdk]], intake of a messaging SDK's
send-queue module doc and its changelog. Gained `ordered-lane-blocking` -
the lifecycle table answered what becomes of one dead-lettered event and
was silent on the events queued behind it; the silent default (keep
draining) is right for an entity lane and wrong for a stream lane, and the
source paid for the wrong default (messages delivered out of order after a
wedged send). The discriminator - would item N still mean what its author
meant if N-1 vanished - is stated here and mirrored from the client side in
client-state/optimistic-write-path, whose "waiting on a predecessor is not
inheriting its failure" rule is the entity-lane half of the same boundary.

Applied at `simulation` against a connected project's conversation queue
(react application, verdict better): the drain fired on a `finally` block
that could not tell success from failure.

## Open leads (banked, convergence rule applies)

- A wedge must persist across restarts like the rest of the spine; the
  source persists its queue and its wedged flag, and nothing in this subject
  yet says a wedge that evaporates on relaunch resumes draining out of order.
- The classifier's precision bounds the technique where the lane class is
  inferred per item rather than declared per class (the connected project
  infers it from text).
