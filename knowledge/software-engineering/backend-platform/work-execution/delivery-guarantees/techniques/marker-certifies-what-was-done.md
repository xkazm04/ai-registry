---
layer: technique
type: technique
subject: delivery-guarantees
technique: marker-certifies-what-was-done
status: forged
laws:
  - failure-not-empty-success
  - unknown-is-not-a-value
  - count-carries-predicate
  - record-precedes-effect
shared_with:
  - job-coordination
applied: code
ab_verdict: better
use_when: [a watermark or offset advances after a batch is sent, a seen or consumed marker is written at fetch time and a later stage is capped or can skip, a run that exited cleanly but changed nothing is recorded as done, an idempotency check skips work because a record with the right name already exists, a container is created before its contents and completed last, a producer may append to the input while the consumer is reading it]
---

# Marker certifies what was done

Every consumer that avoids redoing work keeps a marker: an offset, a watermark,
a seen-set, a consumed flag, a record whose name says *this window is
captured*. The marker is the only thing the next run reads, so it is the
promise. This subject already says where the promise usually breaks, and it
names one cause: the process dies after claiming and before finishing. The
corpus orders the write for that case. The effect becomes durable first and the
position write follows, and a marker kept in a different store than its effect
is flagged as a trap
([step-position-and-resumability](../../job-coordination/techniques/step-position-and-resumability.md)).

**Nothing has to crash.** A marker can go wrong on a run that succeeds, by
covering more than the run did or by being read as more than it proves. Both
failures are at-most-once by accident. Neither logs an error. The work that was
skipped cannot be found later, because the one record that would show it now
says the work is done.

## Half one: the marker covers exactly what was acknowledged

The marker has to be computed from what was sent and acknowledged. Reading
where the input ends when the run finishes is the defect, and it arrives three
ways, all on the success path:

- **A planned cap.** The run reads N items and processes at most B of them, per
  call or per budget. Or it skips the stage entirely when a dependency is down.
  If it then marks all N, the other N minus B are recorded as processed and
  will never be offered again. This is the delivery bug in its quietest form:
  the cap was a deliberate design decision, the run exited clean, and the loss
  is proportional to how busy the system was.
- **A producer that keeps writing.** The consumer reads the input, sends it,
  then sets the watermark to the input's size *now*. Anything appended in
  between sits behind the watermark and was never read.
- **A torn tail.** The input was read while its producer was halfway through a
  record. The partial record is correctly skipped as unparseable, and the
  watermark moves past its start. When the producer finishes the record, it is
  already behind the watermark.

The remedy is the same for all three. **Carry each item's end position through
the pipeline, and advance to the end of the last item the far side
acknowledged.** A capped batch ends at its own last item, and the remainder is
the next call's batch. A tail with no terminator is not covered. The price is
at-least-once at the boundary. A far side that deduplicates on a stable
identity absorbs that price, and silent loss is worse.

The same rule covers a marker that certifies a *run* rather than an *effect*. A
pass recorded as done because it exited 0 is certified by its exit status. A
pass that exited 0 and changed nothing is recorded identically to one that did
the work, so an unproductive pass retires its input for good
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
The done flag has to name the effect it certifies and be conditioned on the
effect's count: items judged, edits made, rows written. A zero is recorded as
its own outcome and retried, never folded into success
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

## Half two: a skip re-reads the completion, not the existence

An idempotency check that skips work is a reader of the marker, and it can
read a stronger claim than the marker makes. The common shape is a container
used as its own marker: a named dataset, an output directory, a job row, a
manifest entry. It is created first so its contents have somewhere to go,
filled, and marked complete at the end (frozen, closed, renamed into place).
A run that fails partway leaves the container behind under the right name. A
check that asks *does a record with this name exist* then treats the failure as
already captured on every later run, and the error that left the container
has scrolled away.

So the skip reads the **completion value** the artifact carries (the frozen
flag, the closed status, the final rename, the recorded count) and never the
presence of the artifact. Existence proves at most that an attempt happened.
This is the two-values-are-not-enough point of
[in-flight-is-a-position](../../job-coordination/techniques/in-flight-is-a-position.md),
seen from the reader's side. A job record gains a third value so recovery can
tell *attempted* from *complete*. A skip check that ignores the value it
already has has rebuilt the two-valued design one layer up
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

Where the marker lives apart from the artifact, such as a ledger of finished
units or a manifest beside the generated files, the ledger entry is a claim
about the artifact. Before it may skip work, re-verify it against the artifact:
the file exists, its content hash matches what the entry recorded, the unit's
completion value is set. A stale entry must not keep a pending unit from
running.

## Record first, completion last: the discriminator

[record-precedes-effect](../../../../_laws.md#record-precedes-effect) says the
record of an action is written before the action, which reads like the
opposite of this technique. It is not. There are two records, and each has its
own position:

| record | says | written |
|---|---|---|
| intent / attempt | this is authorised, or this was dispatched | **before** the effect, so an effect never exists that nothing accounts for |
| completion / consumption | this is done, skip it next time | **after** the effect is acknowledged, and covering only what was acknowledged |

The defects in this technique all come from a single marker doing both jobs:
one flag written at fetch time and then read as *done*, or a container created
at the start and then read as *captured*. Split the marker in two, or give it
the extra value, and each half has only one correct position.

## Decision rules

- **Compute the watermark from what was acknowledged, never from how far the
  input reaches at the end.** If the code reads a size, a length, or the "latest"
  position after the send, that is where it goes wrong.
- **A cap, a page, or a skip-when-down makes a stage partial by design.** When
  one sits between reading and marking, the marker has to move to after it, or
  down to the item level.
- **A done flag names its effect and is conditioned on the effect's count.** A
  clean exit with zero effect is a distinct outcome.
- **A skip reads the completion value, not the name.** If a check skips on
  existence, ask what a failed attempt leaves behind under that name.
- **An incomplete leftover is either in flight or abandoned, and the skip
  cannot tell which from the artifact alone.** Where two runners can overlap,
  rebuilding beside the leftover risks a duplicate. A duplicate can be
  recovered; a skipped window cannot. Where duplicates are expensive, put the
  holder and age on the claim ([atomic-claiming](./atomic-claiming.md)) and do
  not guess.
- **The test sits on the success path.** Replay a run with more input than the
  cap, a producer appending during the send, and a record torn at the read
  boundary. Count what the far side received against what was offered. A suite
  that only kills the process tests the case the corpus already covers.
