---
layer: technique
type: technique
subject: agent-memory
technique: durable-store-failure-posture
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, deletion-is-not-repair]
shared_with: []
use_when: [a durable memory store fails to parse and more than one code path must react, deciding whether a corrupt store reads as empty, the read path runs on every turn and cannot be allowed to throw, choosing what the model is told when its own memory is unreadable, a store the agent both reads and writes is shared across concurrent sessions]
---

# Durable store failure posture

[recall-injection](./recall-injection.md) already separates *empty* recall from
*failed* recall — the store unreachable, the query errored — and demands a
status signal between them. That covers the read path when the store is
absent or offline. This technique covers a third state the read-side rule
cannot see and the write path has no answer for: the artifact is present, it
is reachable, and it does not parse, or it parses into something that is not
the shape the store promised. The degraded read here *is* recall-injection's
failed-recall state carried through to the model as content; what is new is
what the write path owes at that moment, and the distinction between a store
that is missing and one that is broken. That is not an
exotic state — a partial write, an interrupted migration, a hand-edit, a version
skew all produce it — and the reason it deserves its own rule is that **the two
paths that touch the store want opposite answers, and the obvious design gives
them the same one.**

## Two callers, two obligations

A memory store has at least two consumers with different jobs:

- **The read path** runs on the way into the model — recall injection, every
  turn, every session. It is not allowed to fail, because failing it does not
  degrade memory, it stops the agent.
- **The write path** runs when the agent decides to remember or forget. It is
  allowed to fail, and more importantly it is the path that can *destroy* what is
  still there.

Now consider the two symmetric designs, which is what a team reaches for first:

**Fail open to empty, on both paths.** The corrupt store reads as `{}`. The
agent is told it remembers nothing, behaves accordingly, and then saves a fact —
and the write path, having also read empty, serialises a one-entry store over the
damaged one. The damage was recoverable up to that moment. This is
[deletion spelled as repair](../../../../_laws.md#deletion-is-not-repair), executed
by the component least aware it is happening, and the audit trail records a
normal save.

**Fail hard, on both paths.** Nothing is destroyed, and the agent is bricked: the
read path runs before every model call, so a single unparseable byte in a
non-critical store takes the whole system down until a human intervenes.

Both are defensible in isolation and both are wrong, because they answer one
question where there are two.

## The rule

> **The read path degrades and says so. The write path refuses.**

The read path catches the parse failure, records it where an operator will see
it, and returns a *degraded* result to the model. The write path lets the failure
propagate: a write that cannot first read the current state is refused, because
executing it would overwrite state that has not been examined.

The asymmetry is the mechanism, not a compromise between two postures.

## The degraded read says "unavailable", never "empty"

This is the half that gets lost in implementation, and it is the half that
matters, because the consumer's *behaviour* forks on it. An agent told its memory
is empty will re-derive what it can and save it — writing into a store it has not
successfully read. An agent told its memory is unavailable will not, and will say
so to the person it is talking to. Reporting corruption as emptiness is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
at the one boundary where the consumer is an actor that will respond by writing.

The distinction has to survive to the model as *content*, not as an absence the
model is left to interpret —
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value). A prompt
that simply omits the memory block when the store is broken has told the model
"empty" in the only vocabulary the model has.

**A missing store is not a corrupt store.** Absence is a legitimately empty
store and takes the empty path on both sides; only present-and-unparseable takes
the refusing path. Collapsing those two is how a first run starts by refusing to
write anything.

## Assert the asymmetry in one paired test

A test on either posture alone passes on a codebase that has quietly aligned
them — and alignment is exactly what a later refactor does, because two
different error handlers around one store read like an inconsistency to anyone
who does not know why. So the test is a **pair, in one file**: seed the store
with a payload that exists and does not match the shape, then assert that the
write path rejects *and* that the read path returns a degraded note rather than
throwing. What is being pinned is the difference between them, and only a test
that exercises both sides can pin a difference.

## The boundary: this rule does not cover concurrent loss

The refusing write path protects the store from being overwritten by a caller
that could not read it. It does nothing about two callers that both read it
*successfully*. Where the store is shared — one store per agent, several sessions
or channels running turns against it at once — a read-modify-write cycle with no
version check loses updates without ever producing a corrupt state: both callers
read version N, both write N+1, one fact silently ceases to exist, and every
failure posture in this technique is satisfied throughout.

That is a different defect with a different fix — an optimistic write that
rejects when the version moved, or an append-entry operation that never rewrites
the whole store — and it belongs to whichever layer owns the artifact's
versioning. Name it explicitly when adopting this rule, because a store hardened
against corruption *feels* durable, and the concurrent path is the one that will
still be losing data afterwards.
