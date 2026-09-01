---
layer: application
type: application
subject: client-state
technique: optimistic-write-path
stack: react
verified_on: 2026-09-01
verified_against: react@19
applied: simulation
ab_verdict: better
proof: structural-only
---

# The companion send path, read against the stream-lane inversion

The companion chat's send pipeline (`athenaChatSend.ts`) is an optimistic
write in this technique's sense: it paints the user's bubble before the IPC
round trip, raises the conversation's streaming flag ahead of the request so
a client-owned turn can be told from a backend one, and replaces the paint
with the canonical transcript on success. Two of the technique's clauses
are met in the tree's own words, and the third — the one this application
was opened for — is met on the entity axis and missed on the stream axis.

## What the tree confirms

- **Local items carry a minted local identity.** The optimistic bubble is
  appended with an `optim_<timestamp>` id, so two unconfirmed items are
  never equal by id-absence; the amendment's "compare local items by their
  local state, never by the absence of an id" is satisfied structurally,
  because no code path can produce an id-less local item.
- **The critical section holds the whole attempt.** A synchronous
  `sendingRef` flips before the first `await`, with a comment naming the
  exact race the technique names — two sends in one tick both passing a
  `!streaming` gate captured in a render closure — and the guard is on the
  live store value plus the ref, never on the closure.
- **The second action waits; it is not dropped.** Mid-turn input is queued
  per conversation in `athenaChatQueue.ts` with its nonce, and drained one
  per completed turn.

## What it misses, and why the miss is the amendment's case

The queue drains on the streaming true→false edge, which the send path
raises in its `finally` block on success and on failure alike. That is the
entity-lane rule — *waiting on a predecessor is not inheriting its failure*
— applied to a lane whose items are follow-ups to the running turn, and it
is the exact default the amendment says inverts for a stream. The three
cases, the policies, and the verdict are recorded once, on the
delivery-guarantees side
([react--ordered-lane-blocking](../../../backend-platform/work-execution/delivery-guarantees/applications/react--ordered-lane-blocking.md));
this application exists so the client-state reader finds the seam from the
technique they are actually holding. **Verdict: better**, same evidence,
filed as the project's next change.

## What the realization cannot do

The lane's class is decided per message by a text classifier
(`classifyMidTurnIntent`), so the discriminator the amendment asks for is
approximated rather than declared. A misclassified follow-up skips a failed
head under either policy, and the tree has no measure of that rate.
