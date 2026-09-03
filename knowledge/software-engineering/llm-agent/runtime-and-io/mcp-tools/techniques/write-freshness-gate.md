---
layer: technique
type: technique
subject: mcp-tools
technique: write-freshness-gate
status: forged
laws: [gate-sees-target, one-validation-door, failure-not-empty-success]
shared_with: []
use_when: [a model edits a file it read many turns ago, two parallel tool calls write one path in the same turn, an agent keeps appending a section it already wrote, deciding whether a write tool needs a precondition, a summarised context still holds an edit in flight]
---

# Write-freshness gate

A host that exposes read and write tools over shared artifacts has handed
the model an editor whose only picture of the file is a message in its
context. That picture goes stale three ways, and none of them announces
itself: a parallel session writes the same path; the model's own previous
write changes the file it is about to edit again; context compaction drops
the read result while the intent to edit survives. The observed failure is
not corruption first — it is **drift**: the model appends a section it has
already appended, or overwrites a colleague's edit with its own older
copy, and reports success, because the write succeeded.

The rule: **a write to an existing artifact is admitted only with proof
that the writer saw the artifact's current version.** The proof is a
content hash. A successful read stamps `{path, hash-of-full-content}` onto
its own result; a write — overwrite of an existing file, append, or
substring replace — is checked against the newest mark for that path in
the writer's context, and blocked unless the mark's hash equals the file's
hash *now*. Creation of a file that does not exist passes with no mark,
and its first edit is subject to the gate like any other.

This is the protocol layer's conditional request — the precondition header
that makes an update succeed only against the version the client last saw
— relocated to where the client is a reasoning model. What changes is where
the proof lives and what it is bound to.

## Four properties carry the technique

1. **The mark lives on the read result, not in server state.** The gate
   scans the writer's messages, newest to oldest, for the path's mark. So
   a compaction that drops the read result drops the proof, structurally:
   the gate blocks, and the model re-reads. No reservation list, no hook
   into the summariser, no state that can disagree with the context the
   model is actually reasoning from
   ([gate-sees-target](../../../../_laws.md#gate-sees-target) — the target
   here is the model's picture of the file, and the mark *is* that picture's
   fingerprint).
2. **Writes never refresh marks.** Every successful write changes the hash,
   so the last read expires at once and the next edit forces a re-read
   between consecutive modifications. This is the whole cure for drift;
   a gate that refreshed the mark on write would let the model edit its
   own stale intent forever.
3. **The check and the write are one critical section, per path.** The
   runtime executes a turn's parallel tool calls concurrently. Serialise
   gate-check-plus-write, and read-plus-mark, on one lock keyed by the
   writer and the normalised path: the second same-path write in one turn
   waits, finds the hash changed, and is refused deterministically. A
   read-then-write pair issued in the *same* turn is refused too, and
   rightly — the model has not seen the read result yet. Without the
   critical section the gate has a check-then-act window exactly where
   the parallel duplicate lives.
4. **A blocked write returns a recoverable error that says what to do.**
   "Read the file first" — and for an append, "read its last lines" — so
   the model can repair without reasoning about the mechanism, and the
   result stays well-formed for every outer consumer
   ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Fail direction, chosen from the gate's position

The gate stands *in* the write path, consulted on every call, so its own
breakage cannot be allowed to brick the tool. When the gate cannot inspect
the target — a binary the hasher cannot decode, a transient sandbox fault,
a sandbox that reports a missing file as an error *string* rather than by
raising — it **fails open, loudly**: the write proceeds, no mark is
stamped, and the log says why. The refusal branch is reserved for the case
the instrument could evaluate and rejected. This is the in-path split from
quality-gates' unmeasurable-criteria: open on the instrument's own
failure, closed on a stale mark.

One authorization decision covers the composed call: the pre-write
inspection, the write itself, and the post-read hashing run under a single
scope of the sandbox's permission check
([one-validation-door](../../../../_laws.md#one-validation-door)); a denial
there is an error result, never one of the inspection fail-open paths.

## What the gate cannot see, stated

- **A shell edit bypasses it.** A command tool that modifies the file does
  not pass through the write gate — but it changes the hash, so the next
  structured write is forced to re-read. The bypass and the gate point the
  same direction; it is a hole in coverage, not in safety.
- **It is a freshness guard, not a duplication guard.** A model that reads
  the current version and *still* decides to append the same section has
  passed the gate honestly. Semantic duplication belongs to a structured
  artifact state or a final-draft check, and this gate should not be
  extended to guess at it.
- **The hash is of the whole file, even for a ranged read.** A read of
  lines forty to sixty stamps the full-content hash, because the question
  is whether the file changed, not whether the viewed slice did.

## Decision rules

- Stamp a full-content hash on every successful read; require a matching
  newest mark for every write to an existing path; never refresh a mark on
  write.
- Keep the mark on the read message so context loss is proof loss.
- Serialise check-and-write per (writer, normalised path); refuse the
  second same-turn write and the same-turn read-then-write.
- Fail open with a log when the gate cannot inspect; fail closed only on a
  stale mark; make the refusal name the recovery.
- Say in the tool's description that an existing file must be read first
  and a stale write is refused, so the model can interpret the error.
