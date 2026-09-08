---
layer: technique
type: technique
subject: durable-agent-operations
technique: total-restart-point-by-reference
status: forged
laws: [unknown-is-not-a-value, one-authority-per-vocabulary, creation-names-reaper]
shared_with: []
use_when: [designing what a crashed agent operation leaves behind, recovery has to work out where it was, a full-state checkpoint is rejected as too expensive, deciding where large in-flight content lives]
---

# Total restart point by reference

An operation that outlives its process needs a durable answer to one question:
*what happens next?* There are three ways to store that answer and only one of
them survives contact with a long run. You can append what just happened and
fold the appended entries back into a position at read time. You can store a
difference against a previous value and walk the chain. Or you can store the
complete current state and replace it whole at every durable transition. This
technique is the third, plus the reference discipline that makes it cheap: the
state carries bounded policy and the **identities** of large content, and the
content itself lives at sibling addresses the operation owns and the terminal
transaction deletes.

## The rule

After every durable transition, replace the operation's state with the
**complete, total** current state. Never a delta against the previous value,
never an appended journal entry, never a partial patch. Recovery then reads one
value and dispatches to the procedure responsible for it: it does not fold
history, does not replay, and does not infer where it is from what is missing.

The last clause is the one that gets violated by accident, and it is the reason
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) sits at
the head of this technique. A design that reasons "the response identity is
absent, so we had not sent the request yet" has converted *we did not store
that* into *it did not happen*. The absence has one meaning under a clean write
and another under a crash between two writes, and nothing distinguishes them.
The rule that removes the whole class is stated as a storage invariant: **no
read on a hot path may fold history or infer state from an absent value.** If a
procedure needs a fact to decide, the fact is a field of the current state.

The state's shape is a closed vocabulary of leaves, and it has exactly one
definition that both the executing procedure and the recovery procedure derive
from ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
Two hand-maintained tables — one listing the phases execution can be in, one
listing the phases recovery knows how to handle — drift the day somebody adds a
phase, and they drift in the direction where the new phase is unrecoverable.
There is no *finished* leaf: terminal completion deletes the state and writes
one immutable result record, so "open" is exactly "a state value exists".

## Why this escapes the full-versus-delta binary

The custody discipline for a conversation record states the representation
choice as a binary, and states it correctly: a checkpoint that stores complete
state at every step is self-contained and costs storage quadratic in the turn
count, because each of N checkpoints carries up to N messages; a delta
checkpoint is linear and is not self-contained, so reading one means walking
its ancestry. Faced with that trade, most systems take deltas and inherit the
ancestry walk.

The escape is to notice what the quadratic term was a property of. It was never
totality. It was **what was inside** the total value. A conversation inside a
checkpoint grows with the run, so replacing the whole checkpoint costs more each
time. A state value that contains only bounded policy and identities does not
grow: replacing it costs the same at turn thirty as at turn one, and totality
becomes constant cost per transition. A thirty-turn run writes the state thirty
times, each write the size of a handful of fields.

The neighbour's binary is therefore correct within its premise and the premise
is escapable. State the escape that way — not as a claim that full checkpoints
are cheap, which is false, but as a claim that a restart point does not have to
contain the conversation to name the next procedure. Where the durable record
*must* carry the conversation, the binary stands and the custody discipline
governs.

## Large content lives beside the state and is named by identity

The state names content; it does not carry it. Streamed partial output, tool
arguments, a finalized-but-unplaced result, a prepared summary, a bounded
progress snapshot — each lives at its own address, and the state holds the
identity that reaches it. Three properties make this safe rather than merely
tidy:

- **The identity is minted before the content exists.** That is the neighbouring
  intent technique's job, and it is what lets a recovery write occupy the slot
  the real write would have used.
- **Every address has exactly one owner and dies with placement or cleanup.**
  Staged content that outlives its purpose is the leak this design would
  otherwise trade for its cheapness.
- **Absence of an optional address is legal; absence of a required one is a
  fault.** A missing progress snapshot means no progress was recorded. A missing
  set of tool arguments under a state that says a tool is pending is corruption,
  and the consuming procedure must fault rather than invent a value.

Reading such content is allowed only through an address the *current state
named*. A recovery that enumerates a store looking for what might be relevant
has reintroduced the fold it was designed to avoid.

## Cleanup is deletion, not collection

Because the state is replaced rather than accumulated, and because everything
the operation owns hangs off addresses the operation names, the end of an
operation is a deletion, not a sweep. The terminal transaction deletes the
state and every operation-owned address in the same commit that writes the
immutable result — [creation-names-reaper](../../../../_laws.md#creation-names-reaper)
satisfied at the strongest available grade, since the reaper is not a later
process but the same transaction that ends the work. What remains afterwards is
exactly the conversation, the spend ledger, and a few long-lived values.

The consequences are worth stating because teams expect the opposite. There is
no garbage collector for operation state. There are no tombstones. There is no
compaction of the state store, because nothing accumulates in it. And a stuck
row is not a genre this design has: a state value exists if and only if an
operation is open, so the inventory of open work is a scan of what exists
rather than a query with a predicate somebody has to keep correct.

The one obligation this creates: **deleting every operation-owned address must
leave a complete, valid conversation.** If orchestration data leaked into the
conversation record, or conversation content was only reachable through
operation-owned state, cleanup becomes destructive. Test it directly — delete
the operation's addresses on a completed run and read the conversation back.

## The counterpart obligation

Totality buys enumerable crash states. Because a transaction has no visible
interior, a crash lands **between** transactions and never inside one, so the
set of states a restart can find is the set of leaves times the set of durable
positions inside each — finite, listable, and therefore testable one at a time.
That is not a side benefit; it is the warrant. A design that cannot list its
crash states cannot claim its recovery is correct, only that it has not failed
yet. The enumeration and what to do with it belong to
[recovery-prefix-enumeration](./recovery-prefix-enumeration.md).

## Decision rules

- Replace the whole state at every durable transition; never append, never
  diff, never patch.
- Put in the state only bounded policy and identities. If a field grows with
  the length of the run, it belongs at a referenced address instead.
- Never infer a phase from an absent value. If a decision needs a fact, the
  fact is a field.
- Define the state vocabulary once and derive both the execution dispatch and
  the recovery dispatch from it. A leaf with no recovery case is a build
  failure, not a runtime surprise.
- Give every referenced address exactly one owner and delete it in the
  transaction that places or cleans up its content.
- Fault on a missing required reference; treat a missing optional one as the
  legal absence it is.
- Delete operation-owned state in the terminal transaction, together with the
  immutable result. Do not sweep, do not tombstone, do not collect.
- Assert that deleting every operation-owned address leaves a valid
  conversation.

## When not to use it

Where the durable value genuinely must contain the growing artifact — the
conversation itself, an accumulating document, a large model output that has
nowhere else to live — totality is quadratic again and the custody discipline's
delta representation is the right answer, with its marker, its single accessor
and its fail-closed compatibility gate. The technique also earns nothing for
work whose entire body is one idempotent step: there is one state, recovery is
"run it again", and a state machine with a single leaf is ceremony. It starts
paying at the second uncertain effect in one unit of work, because that is the
first point at which "where was I" has more than one answer.
