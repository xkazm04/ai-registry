---
layer: technique
type: technique
subject: delivery-guarantees
technique: ordered-lane-blocking
status: forged
laws:
  - failure-not-empty-success
  - identity-survives-reuse
  - deletion-is-not-repair
shared_with: []
use_when: [deciding whether a dead-lettered item releases the items queued behind it, messages in one conversation arrive out of order after a failure, a failed upload's local echo still says sending, choosing whether a stuck head blocks or is skipped]
---

# Ordered-lane blocking

The lifecycle spine of this subject answers what happens to *one* event when
it fails for good: it leaves the retry cycle and lands in the dead-letter
lane. It is silent on a second question that every real queue answers by
default, and usually by the wrong default: **what happens to the events
queued behind it?** The obvious implementation skips over the dead item and
keeps draining, because throughput is what a queue is for. For most event
classes that is right. For one class it is a correctness bug that presents
as a mystery — the user's second message arrives before their first, the
edit lands before the thing it edits, the thumbnail event references an
upload that never happened — and the mystery is invisible in every log,
because every individual send succeeded.

## The discriminator: is the lane keyed by an entity or by a stream?

Two shapes of queue look identical in code and behave oppositely on failure.

- **An entity lane** holds independent intents against one thing: toggles,
  renames, field edits. Item N does not depend on item N−1 having landed;
  the latest intent often supersedes the earlier one. Here a failed
  predecessor **must not** hold up its successors — propagating one failure
  down the lane turns one bad write into a cascade on unrelated intents.
  That is the rule the client-side mutation mutex already carries
  ([optimistic-write-path](../../../../client-architecture/client-state/techniques/optimistic-write-path.md)).
- **A stream lane** holds an ordered sequence whose order is *meaning*:
  messages in a conversation, operations on a document, the content upload
  that a later event describes. Item N is written on the assumption that
  N−1 exists. Here a failed predecessor **must** block its successors —
  draining past it delivers the sequence out of order, which the receiving
  side cannot detect and cannot repair, and the sender's own view (which
  painted them in order) now disagrees with everyone else's.

The question that sorts a lane is: *if item N−1 vanished, would item N still
mean what its author meant?* Yes → entity lane, skip the wedged head. No →
stream lane, and the head of the line blocks the line. Neither answer is a
property of the transport or the queue library; it is a property of the
event class, decided once and written beside the guarantee selected for that
class (see guarantee-selection). A queue that carries both classes carries
two lanes with two policies, keyed so they never share a head.

## Wedged is a state, and it is visible

In a stream lane the exhausted head does not leave the lane — it **wedges**
it. The lane stops draining, the head sits in a state that says so, and
every item behind it is *blocked*, which is a different word from *pending*
and from *sending*. Three properties make the wedge honest:

- **The head shows its verdict on its own local echo.** A failed upload
  whose local echo still reads "sending" is the anti-pattern in one line —
  the failure reached the queue and never reached the surface, so the user
  sees a spinner and an unexplained silence behind it
  ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
  The send error is attached to the item that failed, and the items behind
  it say *blocked behind* it, not *in progress*.
- **Two verbs, and only two, release the lane.** *Retry* clears the wedge
  and resumes draining from the head; *remove* drops the head and resumes
  from the next item. Both are user or operator decisions, because in a
  stream lane the queue cannot know whether the sequence still makes sense
  without item N−1 — that is exactly the knowledge that made it a stream.
  Automatic skip-over is not a third verb; it is the entity-lane policy
  applied to the wrong lane.
- **Removing a head that already left is a compensating event.** Between
  "the user pressed remove" and "the queue processed it", the head may have
  been sent after all. Then the removal cannot be a local delete; it has to
  materialize as a retraction on the far side, carrying the reason the user
  gave, and that retraction is itself a queued item in the same lane
  ([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair)).

## Classification decides who wedges — and its cost is asymmetric here

Whether the head wedges at all is the retry subject's decision: a transient
failure keeps retrying in place and the lane merely waits; a permanent one
wedges
([error-classification-for-retry](../../../resilience/retry-backoff/techniques/error-classification-for-retry.md)).
What a stream lane changes is the *price* of a wrong class. In an entity
lane a false-permanent costs one item; in a stream lane it costs the whole
conversation until a human acts, and a false-transient costs an infinite
retry loop with everything behind it waiting. The non-standard status code
an intermediary returns for "something upstream broke" is the recurring
instance — classified as permanent, it wedges every user behind that proxy
at once. The retry subject's default of *unknown → conservative retry, never
permanent by accident of branch ordering* is what keeps that from being a
lane-wide outage, and a stream lane is the place to check that the default
actually holds.

## Local-only items carry their own state, because they have no identity yet

Items in the lane that the far side has not acknowledged have no
server-minted identity, and code that compares items by identity treats two
such items as equal. A head that moved from *sending* to *cannot be sent*,
or was retried, or gained a second local item behind it, is then "unchanged"
to every observer — the surface never repaints, and the wedge is invisible
for a second reason. Local items compare by their local state, not by the
absence of an id
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse): the
local identity is the one that survives until the server's arrives).

## Decision rules

- Sort every event class into an entity lane or a stream lane by the one
  question above, and record the answer with the class's guarantee.
- In a stream lane, an exhausted head **blocks**; it never skips. The lane
  exposes *wedged* and *blocked* as distinct states on distinct items.
- Exactly two release verbs, both deliberate: retry the head, or remove it.
  Removal of an item that may already have landed is a queued retraction
  with a reason, not a local delete.
- Reflect the head's failure on the head's own echo the moment the queue
  learns it; "still sending" over a dead item is a lie the user pays for.
- Audit the classifier from the lane's side: any code that can wedge a
  stream lane must be a class the taxonomy assigned on purpose, and unknown
  codes retry conservatively rather than wedge.
- Persist the lane and its wedge across restarts, the way the rest of the
  spine persists claims and counters — a wedge that evaporates on relaunch
  resumes draining out of order the moment the app comes back.
