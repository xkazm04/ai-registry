---
layer: technique
type: technique
subject: agent-memory
technique: durable-store-failure-posture
status: forged
laws: [failure-not-empty-success, unknown-is-not-a-value, deletion-is-not-repair, creation-names-reaper]
shared_with: []
use_when: [a durable memory store fails to parse and more than one code path must react, deciding whether a corrupt store reads as empty, the read path runs on every turn and cannot be allowed to throw, choosing what the model is told when its own memory is unreadable, a store the agent both reads and writes is shared across concurrent sessions, a consolidation pass copies the store, lets a model work on the copy and swaps it back over the live store, a pass held across a model call keeps being refused because the store moved under it]
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

### The long-window instance: a staged pass that swaps

The lost update above is usually described as two quick writers. It has a slower
form that the optimistic-write fix has to be applied to *deliberately*, because the
window is minutes instead of milliseconds: a consolidation or rewrite pass that
copies the store, lets a model work on the copy, and swaps the copy back over the
live store when it finishes. Nothing in that design fails; every write to the copy
succeeds, the swap succeeds, and any fact written to the live store while the model
was thinking is gone.

Executed against one such pass, with a model stub held open while a project memory
was written into the live store, the post-swap listing held only the merged result and
the mid-pass fact was absent. The same run had a second, less visible symptom: the
store's "an undo is available" flag stayed true, so the operator was told the state
was recoverable while the lost write could not be recovered by the undo either, because
the undo's before-image predated it. A second scope written by another session
mid-pass was lost the same way.

The rule that closes it is the one already named, applied at the swap: **record the
live store's version when the copy is taken, compare it when the copy is swapped
back, and on a mismatch either reject the swap or replay the writes made since.** A
pass that can run for minutes also owns a *readiness* claim, and that claim is derived
from the same comparison, not from the fact that a before-image exists: an undo is
ready only if the live state is exactly the state the pass produced. A leftover copy
of a failed or rejected pass is a reaper's problem
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)) — the executed
failed-pass run left its staging directory beside the live one.

### Compare what the pass read, not the whole store

The version check above is right about what it protects and too coarse about what it
compares. A store that captures continuously, a write every few tool calls from every
session, moves its version during almost any pass that waits on a model, so "reject on a
mismatch" refuses the pass, the retry re-reads a store that moves again, and the
consolidation that was supposed to keep the store small never lands. "Replay the writes
made since" needs a log of those writes, which most stores do not keep.

The narrower check is on the **read set**. The pass names the items it read, with a token
for each (the content it saw, or a per-item version), and its publish step removes or
replaces only those, in one transaction, after confirming each one is still present, still
in the same scope and unchanged. Anything written while the model was thinking was never
part of the read and is left alone. A changed or missing read item is the only reason to
refuse, and the refusal names those items, as a stale result rather than an error. This
still closes every case the store-wide check exists for: an item edited meanwhile is not
deleted along with a correction the summary never saw, an item forgotten meanwhile does not
come back through the summary, and two passes over the same items do not leave two
summaries. What it adds is that new writes, and the part of a topic that did not fit in the
prompt, survive by construction instead of by rejection. One open-source memory engine
made exactly this change to its consolidation interface and accepted the breaking release
it cost: the call that used to replace a whole topic now takes the ids that were read and
writes nothing without them.

Measured on a small instance of the same shape, a prune that moves the oldest entries of an
append-only shared notes file and publishes with a whole-file comparison and five retries:
with an append landing while each attempt was planning, the whole-file check gave up after
five attempts and wrote nothing, and the read-set check (the file still begins with the text
that was read; the appended tail is carried over and planned once more in memory) finished
on the first attempt with no line lost. With no concurrent writer the two produced
byte-identical files and output.

Two limits, both measured on the same instance. The read-set check **narrows** the window,
it does not close it: the instant between the final confirmation and the publish remains,
and with an append landing at every temporary write both checks refused alike. And the
window it removes is the time spent between the read and the publish, so where that is a
few milliseconds of pure computation the gain is small; the rule pays where the read is held
across a model call. The check also needs the read set to be expressible: stable ids, an
append-only order, or a per-item version. Where items are immutable once written, the token
reduces to a liveness check. A store that rewrites items in place and versions nothing can
only compare the whole.
