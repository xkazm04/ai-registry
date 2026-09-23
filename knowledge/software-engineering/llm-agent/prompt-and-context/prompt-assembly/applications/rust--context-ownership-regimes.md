---
layer: application
type: application
subject: prompt-assembly
technique: context-ownership-regimes
stack: rust
verified_on: 2026-09-05
verified_against: rust@1.96.1
applied: simulation
ab_verdict: unmeasurable
proof: structural-only
---

# A companion in the agent-held regime, with memory in the projection regime

The local-first desktop companion from the sibling application
([live-attachment-delta-resharing](./rust--live-attachment-delta-resharing.md)),
observed toolchain `rustc 1.96.1`, crate floor 1.80.0. Its conversation is
held by a coding-agent process it drives through a resumable session id; the
companion never holds the message list.

## Three cases from the tree, under both policies

Policy A is the client-held reading: add client-side editing and compaction
to the companion. Policy B is the technique: the agent-held regime, with the
client's discipline confined to the prefix it composes.

1. **The reset lever.** The only context reset the companion owns is
   `clear_claude_session_id` (`src-tauri/src/companion/session/transcript.rs:11-20`):
   drop the agent session pointer so the next turn starts a fresh agent
   session, and leave the episodic store untouched because *every prior turn
   is still on disk and re-enters the prompt via retrieval*. Under A there is
   no list to edit, so the added lanes would run on nothing; under B this is
   the regime's resume story, correct as written. Falsifier: a companion path
   that holds a message list for a stateless endpoint.
2. **The remaining lever.** The turn ledger records the agent's reported
   usage per turn (`turn_ledger.rs:59-88`) and the prompt's per-block sizes
   and hashes beside it. The series in the sibling application (cache
   creation 310k to 172k per turn against 11k to 15k of reads) is the
   technique's named health signal for this regime: the prefix, the one thing
   the client still owns, was being rewritten every turn. Under A nothing in
   the added lanes would have seen it; under B it is the instrument the
   regime says to watch. Prediction: the cache ratio inverts once the
   volatile blocks move below the stable ones; falsifier: it does not.
3. **Two regimes at once.** `wipe_transcript` (`transcript.rs:24-107`) deletes
   episode rows and archives the on-disk episodes directory while preserving
   doctrine, identity and semantic facts. The durable record of the
   conversation is an append-only store *outside* any message list, rebuilt
   into the prompt per call through retrieval, which is the regime
   [tiered-history-projection](../techniques/tiered-history-projection.md)
   owns. So the companion is agent-held for the live conversation and
   projection-regime for memory, and the technique's question is answered per
   layer, not per system. Under A a client compactor would have to choose
   which of the two it was compacting; under B neither is the client's.

## Verdict

**Unmeasurable.** The tree already sits in the regime the technique routes it
to, and there is no counterfactual arm to run: policy A adds lanes that have
no list to operate on. The instrument that would make it measurable is a
stateless endpoint path in the companion, at which point the client-held
regime applies and the two-trigger lanes in
[history-compaction](../techniques/history-compaction.md) become owed; until
that path exists, the row's value is the structural fact in case 3.

## What this realization cannot do

It cannot see the agent's own compaction. When the agent process compacts its
held conversation, the companion learns nothing of it: no event, no count, no
summary. A companion that wanted to reason about what its agent has
forgotten would need the agent to report the compaction, which the protocol
in use here does not.
