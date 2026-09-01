---
layer: technique
type: technique
subject: concurrency-guards
technique: atomic-file-publish
status: forged
laws:
  - one-validation-door
  - failure-not-empty-success
shared_with: []
use_when: [publishing a file that another process reads at any moment, a replace step fails intermittently with a permission or sharing error, deciding whether write-temp-then-rename is finished as written, a reader occasionally sees half a document, choosing what a writer does when the destination is momentarily held]
---

# Atomic file publish

A file that one process writes and another reads is a shared mutable cell with
no admission control. Write into it in place and the reader's timing decides
what it gets: a truncated document, a document with a new head and an old tail,
a document that parses but means something that was never true. This is the
same class as the finish races the rest of this subject polices, but the
substrate is a directory rather than a memory set, and the participants
frequently do not know about each other at all — a poller, a watcher, a search
index, a scanner.

The standard answer is **publish by replacement**: write the whole new content
to a temporary neighbour, flush it, then replace the destination with it in one
step. The reason it works is the reader's half. A reader either resolves the
name to the old content or to the new one; there is no interval in which the
name resolves to a partial document, because no partial document ever wore the
name. Every byte the reader can reach was complete before it became reachable.

## The writer's half is not free everywhere

The mechanism above is stated as if replacement were an unconditional
primitive. On at least one major desktop platform it is not. **Where the
platform's file handles carry sharing modes that the replace call must
satisfy, replacing a destination that any other process currently has open
fails** — a permission or sharing-violation error, raised not because the
writer lacks rights but because someone else is mid-read. The platform's own
reference for its move-and-replace call describes replacement of contents and
the access-control conditions on it; it makes no atomicity promise and no
open-handle promise, and the observed behaviour is that a concurrently opened
destination is refused.

Notice which case that is. It is precisely **the polled file** — the case the
pattern was reached for. A destination nobody ever reads never needed atomic
publish; a destination read continuously is the one where a reader's handle is
open at a randomly chosen moment, which is every moment. So on that platform
the naive pattern does not remove the race, it **converts** it: a torn read
becomes a failed write. That is a better failure, because it is loud and it is
on the side that can retry — but only if the writer is written to know that,
and a writer that lets the error escape as a hard failure has traded an
occasional corrupt read for an occasional lost update, which is not obviously
the better trade and is never the intended one.

The same platform offers related calls with different open-handle behaviour,
and newer editions expose replace semantics that tolerate open readers the way
other platforms always have. Neither fact makes the retry optional: the
tolerant path is not what every runtime's standard rename reaches for, its
availability is version-dependent, and the interfering handle is often not a
reader you control at all.

## Third-party handles are the normal case, not the pathological one

The writer's mental model is usually "my reader and me," and the population is
larger. On a machine with a background scanner, an indexer, or a
synchronization client, a file that was just written is *interesting* — those
services open recently-modified files precisely because they were recently
modified, so a freshly written temporary neighbour and a freshly replaced
destination are both prime targets, opened milliseconds after the writer
touched them and held for a short, unpredictable interval.

This is why the failure is intermittent, environment-dependent, and
unreproducible on the machine of whoever wrote the code. It is also why the
right conclusion is *transient*: a handle held by a scanner is going away on
its own within a bounded time, with nothing to diagnose and nobody to blame.
The evidence that this is the normal case rather than an exotic one is that
the ecosystem is full of it — version-control tooling on that platform reports
failures to unlink or replace working files and tells the operator to retry;
general-purpose runtimes ship compatibility layers that retry rename with
backoff for exactly this family of errors; and libraries whose entire purpose
is atomic publish have shipped without the retry and been reported as broken
under the load that finds it.

## The mechanism: replacement plus a bounded retry

- **Write elsewhere, then replace.** Content goes to a temporary neighbour in
  the same directory as the destination — same directory because replacement
  across storage volumes usually degrades into copy-then-delete, which is the
  in-place write again with extra steps. Flush the content to durable storage
  before replacing; a replace that publishes a name pointing at unflushed bytes
  is atomic against readers and not against a power cut.
- **Treat the sharing violation as transient.** The writer classifies the
  replace call's errors into two sets: the permission/sharing family, which
  means *someone has it open right now*, and everything else, which means the
  write is genuinely wrong. Only the first set is retried. This classification
  is the load-bearing part; a writer that retries every error hides real ones,
  and a writer that retries none is the naive pattern.
- **Retry with backoff, bounded.** Sleep briefly, replace again, lengthen the
  wait, give up at a stated bound. The interfering handle's lifetime is short
  and not under the writer's control, so the schedule should start well under
  it and the total budget should comfortably exceed a plausible scan. Bounded
  matters as much as backoff: unbounded retry against a destination held open
  by something that is not going to let go — an operator's editor, a wedged
  process — is a writer that never returns, which is stuck work in the sense
  the golden path warns about.
- **Exhaustion is a failure, spelled as one** (law:
  failure-not-empty-success). When the budget runs out the publish did not
  happen, and the caller must be told in a way it cannot read as success. The
  error should name what it was: retries exhausted against a held destination,
  with the attempt count and elapsed time — not a bare permission error, which
  sends the next reader hunting for an access-control problem that does not
  exist.
- **Clean up the temporary on every exit.** The neighbour is a created
  resource and names its reaper (see release-guarantees): abandoned on the
  failure path it accumulates, and a directory that fills with orphaned
  neighbours eventually confuses the very readers the publish was protecting.
- **One publish door.** The retry, the classification, the flush, the cleanup
  and the same-directory rule are five things to get right, so they are written
  once and every writer of a shared file goes through them (law:
  one-validation-door). A second call site that does its own write-then-replace
  because it was "just a small file" is where the untreated sharing violation
  comes back, and it comes back only in production, only on that platform, only
  under load.

## What the retry is and is not

The retry is not a guard and does not make the write idempotent. It closes one
specific gap: the platform's refusal to replace a busy destination is a
statement about *this instant*, not about the operation's validity, and the
only correct response to a statement about this instant is to wait and re-ask.
Every other concurrency question about the file remains open. Two writers
racing to publish different content still need a guard over the destination's
key (see guard-key-design), and last-to-replace still wins unless the writers
carry attempt identity (see attempt-attribution) — replacement is atomic, not
serializing. Publish-by-replacement plus retry buys exactly one property:
**readers never see a partial document, and writers never silently lose one.**

Two adjacent postures are worth naming because they look like this technique
and are not. Retrying the *reader* instead — open, get a sharing error, try
again — accepts torn reads whenever the read does succeed mid-write, which is
the original bug. And having the writer take an exclusive handle for the
duration of the write makes the reader fail instead of tearing, which is a
legitimate design but a different one: it moves the retry burden onto every
reader, including the readers that are scanners nobody wrote.

## Decision rules

- Any file read by a process other than its writer is published by
  write-elsewhere-then-replace, never written in place — including the "it is
  only rewritten occasionally" ones, because occasionally is the same as
  always to a poller.
- Assume the replace step can fail while a reader has the destination open;
  design for that platform even when today's deployment target is not it,
  because the cost is a small retry loop and the alternative is a bug that
  reproduces nowhere it is being debugged.
- Classify replace errors explicitly into transient (held destination) and
  terminal; retry only the first set, and never widen the transient set to
  quiet an unexplained error.
- Bound the retry in both attempts and total time; an unbounded wait for a
  handle nobody will release is a wedged writer.
- Report exhaustion as a distinct failure naming the held destination, the
  attempts and the elapsed time — not as the raw platform error.
- Keep the temporary neighbour in the destination's own directory and delete it
  on every exit path, success or failure.
- Route every publisher of shared files through one publish function; a second
  hand-rolled write-then-replace is the untreated case waiting for load.
