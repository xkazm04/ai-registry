---
layer: application
type: application
subject: delivery-guarantees
technique: ordered-lane-blocking
stack: react
verified_on: 2026-09-01
verified_against: react@19
applied: simulation
ab_verdict: better
proof: structural-only
---

# A conversation queue that drains past a failed head

The companion chat composer is never disabled: a message typed while a turn
is streaming is classified as an *interrupt* (a redirect, a "stop") or a
*queue* item (additive or ambiguous), and queued items drain one per turn
completion. That is a stream lane in the technique's sense — the queued
message was written against a turn the user assumed had landed — and the
tree carries the exact default the technique names, in one effect.

## The seam, and the structural fact

`src/features/plugins/companion/chat/athenaChatQueue.ts` drains on the
`streaming` true→false edge of the focused conversation: it shifts the next
queued message and sends it. The edge is raised by the send pipeline's
`finally` block in `athenaChatSend.ts`, which runs on success **and** on the
IPC rejection path, where the only other effect is `setSendError`. So the
drain has no way to tell a completed turn from a failed one; a failed send
flips `streaming` false exactly like a finished one, and the next queued
message is sent on top of a turn the backend never received. Nothing in the
store distinguishes *blocked* from *pending*: `queuedByConversation` is a
flat list with `shift`, `remove` and `clear` — the two release verbs exist
as store operations, but nothing wires them to the head's failure.

The structural fact is the more interesting half. The lane was built
correctly for its *other* axis: the same-thread guard on the drain, the
nonce that rides with each queued item so the drained send dedupes on the
key it was minted with, the interrupt path that stops the running turn
before the redirect fires. Ordering across the *success* boundary was
designed; ordering across the *failure* boundary fell out of the `finally`
block, which nobody designed, because `finally` is the idiom for "clean up
the spinner".

## The three cases, under both policies

Policy A is the tree as it stands (skip past a failed head). Policy B is the
technique (a failed head wedges; the lane shows it; retry or remove release
it).

1. **IPC rejection with a queued follow-up.** The user sends "summarise the
   last build", then types "and list the failing steps" mid-turn; the first
   send rejects at the IPC boundary. A: the error chip appears for the first
   message, `streaming` flips false, the drain fires, "and list the failing
   steps" is sent alone — the backend answers a follow-up to a question it
   never saw, and the transcript shows the follow-up's answer beside a
   failed first message. B: the queue holds; the first message's echo shows
   the failure; the follow-up shows *blocked behind* it; retry re-sends the
   head and the drain resumes. Falsifier: if queued messages are in practice
   independent of the running turn — measurable from the mid-turn intent
   classifier's split between `interrupt` and `queue`, which the store
   records per item — then B holds the user's second message for no reason
   and A is the better policy. The classifier's *queue* class is defined as
   "additive or ambiguous", which is the stream case by construction.
2. **A redirect while streaming.** The user types "stop, do X instead";
   classified `interrupt`, the turn is cancelled, `streaming` flips false,
   the drain fires the redirect. A and B agree: a redirect *supersedes* the
   head, which is the entity-lane shape inside the stream, and the technique
   sends it. The case is here because it shows the discriminator is per
   intent class, not per queue — the same effect must skip for one class
   and block for the other.
3. **A drained send that never starts.** The drained item's nonce is
   already in the accepted-nonce ledger (a replayed intent after a restart).
   `sendAsync` returns before it touches `streaming`, so no edge is raised,
   so the drain never fires again, and every item behind it waits until the
   user manually sends something. A: silent — no error, no spinner, a queue
   that is stuck with nothing on screen saying so. B: the same early return
   is a *cannot be sent* verdict on the head; the head's echo shows it and
   the items behind it show *blocked*, which is the difference between a
   stuck lane and a wedged one. Falsifier: if the nonce ledger cannot
   contain a queued item's nonce (it is minted at enqueue and recorded at
   send), the case is unreachable; it is reachable because the same nonce
   is reused across the enqueue and the drain by design.

**Verdict: better** — B is correct on cases 1 and 3 and identical on case 2.
The change is not a few lines: the drain must read the head's outcome, the
store needs a *blocked* state on queued items, and the error chip needs the
two verbs, so it is filed as the project's next change rather than shipped
from this run.

## What the realization cannot do

The mid-turn intent classifier decides the lane per message from text, so a
follow-up misclassified as `interrupt` will skip a failed head even under
policy B. The classifier's precision is the bound on the technique here, and
nothing in the tree measures it.
