---
layer: technique
type: technique
subject: convergence-loop-and-requeue
technique: own-writes-are-not-triggers
status: forged
laws: [record-precedes-effect, creation-names-reaper, absent-guard-is-loud]
shared_with: []
applied: code
ab_verdict: better
use_when: [a loop writes into the same space its trigger stream reads, a watcher fires on the file or record the pass just wrote, deciding whether a debounce is enough to stop a self-triggered pass, a downstream consumer counts change events as evidence that something outside changed, a transform is re-run on an artifact it produced, choosing between filtering by origin and claiming at the write door]
---

# Own writes are not triggers

A convergence pass reads a space and writes to a space, and the two are
routinely the same one. It writes an observation onto the record it watches, a
derived file into the tree it scans, a status block beside the declaration it
reconciles. The notification layer does not know the difference, so the write
comes straight back as a trigger, and the loop is woken by itself.

Two of this subject's central properties look like they cover this and do not.
The pass is **idempotent in the convergent sense** — run twice against an
unchanged world it converges once and then does nothing — but that clause is
written about the *world*, not about the record: a pass that changed nothing
outside and still stamped a last-observed field has satisfied idempotence and
produced a trigger. And the queue **coalesces** a burst for one key into one
pass, but a self-trigger is not part of a burst: it arrives after the pass
completed, finds no twin to collapse into, and gets a slot of its own.
Coalescing bounds how many triggers cost how many passes; it cannot remove a
trigger that should never have existed.

The third property is the one that makes this a trigger-layer problem rather
than a pass-layer one. [told-that-not-why](./told-that-not-why.md) reduces
every arrival to a bare key *before* it enters the queue, and the reason — who
wrote, which watcher saw it — is retained for tracing and excluded from
identity. That erasure is what makes a lost notification a latency problem, and
it is also the deletion of the only field that could say "this one was mine".
**So the self-exclusion runs at the boundary where the trigger is still an
event, or it cannot run at all.** After the collapse there is nothing left to
filter on, and a pass that tries to work it out for itself — comparing what it
is about to write against what it just wrote — has reintroduced the
reason-shaped dependency the collapse exists to prevent.

The narrow case is already stated one category over, for a job that commits a
regenerated artifact to the branch it watches
([post-merge-regeneration](../../../../engineering-process/build-and-release/codegen/techniques/post-merge-regeneration.md)
— skip runs whose author is the job's own identity, and prefer the identity
check to a marker in the message). That rule assumes the medium carries an
author. This technique is what to do when it does not.

## Two remedies, and the question that picks one

**Can a reader tell your output from genuine input, at the read boundary,
without asking you?**

**Yes — filter by origin.** A commit has an author, a record has the writer
that last set the field, a document has an origin. Drop the arrival whose
origin is you, at the boundary, before the reason is erased. This is the
strong form: it is stateless, it survives a restart, and it needs no
cooperation from whoever writes. Prefer an identity the medium itself
maintains over a marker you put in the content — a marker is one careless edit,
one reformat, one copy-paste away from being wrong in the direction that spins.

**No — claim at the write door.** A filesystem write, a byte range in a shared
buffer, a row an ordinary client could also have written: the medium records
*that* the bytes changed and nothing about who changed them. The origin cannot
be recovered downstream, so it is recorded upstream. Before the write, the door
tells the read boundary exactly what it is about to put there; the boundary
drops an arrival whose content still matches a live claim
([record-precedes-effect](../../../../_laws.md#record-precedes-effect) — a
claim written *after* the write races its own notification and loses on a fast
filesystem).

A claim is not a mute button on a path, and three properties are what keep it
from becoming one:

- **Matched on content, not on the path.** If the bytes there are not the bytes
  you said you were writing, somebody else wrote them and the arrival is real.
  This is the clause that keeps a foreign edit to a path you also write from
  disappearing, and it is the one authors skip.
- **Consumed on the first match.** The next change to that path is foreign as
  far as the ledger is concerned. A claim that persists turns one write into a
  permanent blind spot.
- **Expiring, with a reaper.** A claim nobody ever matches — the write failed,
  the boundary was not listening, the platform coalesced the notification away —
  must not silence a path for the life of the process
  ([creation-names-reaper](../../../../_laws.md#creation-names-reaper)). The
  deadline is part of the claim, and the ledger is bounded so a leak is a
  bounded leak.

A write door that does not claim is reported as foreign, which is the safe
direction to fail — but it is also a guard absent by omission, so the doors
that write into the watched space are a reviewable list and not a habit
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## When the output overwrites the input

Both remedies above assume the output lands *beside* the input. Where the
transform writes over the thing it read, there is no input left to exclude
anything from: the second run reads the first run's output because that is all
there is, and each run compounds on the last. Neither an origin filter nor a
claim helps, because the problem is not misattribution — it is that the
pre-image is gone.

The remedy is structural: **the input needs a home the write does not reach.**
Where the artifact can be split, the declared side and the derived side are
separate subtrees and the loop writes only into the second. Where it cannot —
the artifact is one buffer a human edits and expects to stay one buffer — the
pre-image is retained *inside* it under a marker the transform reads and every
downstream consumer strips. The transform then always reads the marked
pre-image and never its own previous output, and re-running is idempotent for
the same reason the split is: the input still exists. Choosing the marker
carries the usual cost of markers, so it is a fallback for the unsplittable
case and not the default.

## The damage is a false count, not only a spin

A self-triggered loop is usually described as a cost problem: passes that do
nothing, a queue that never empties, an idle system at load. That framing
misses the expensive half. Everything reading the change stream treats an
arrival as *news* — something outside changed — and acts on it: a progress
figure advances, a checklist item goes green, a freshness stamp moves, a digest
reports what is new. When the arrival was your own write, none of that is
evidence and all of it is counted. The loop then reports its own output back to
the operator as independent confirmation that the work it did was done, which
is the one failure that survives every retry budget and every cap, because
nothing about it looks like a failure.

Measured at a seam where a write door and a recursive watch shared one tree:
the door's two files produced two change events, a debounce coalesced them into
a single batch and removed neither, and each arrival reached a consumer that
turned a declaration into a completed item. With claims at the door, the same
two writes produced zero arrivals while both foreign-origin controls — an
unclaimed file, and a later foreign edit to a path the door had written —
continued to arrive unchanged.

## Decision rules

- Ask whether the loop writes anywhere its own trigger stream reads. If yes,
  the exclusion is a design element, not a tuning knob.
- Put the filter at the trigger boundary, before the arrival is reduced to a
  key. A pass cannot filter what a queue has already anonymised.
- Filter by an identity the medium maintains when there is one; claim at the
  write door when there is not; never rely on a marker in the content as the
  primary discriminator.
- Match a claim on content, consume it once, and expire it. State the deadline
  where the claim is made.
- Do not count a debounce, a coalescing queue or a per-key exclusion as
  self-exclusion. They bound the work done per trigger and leave the trigger in
  place.
- Where the transform overwrites its own input, split the derived side out or
  keep a marked pre-image; an origin filter cannot recover a pre-image that no
  longer exists.
- List the doors that write into the watched space. A door added later that
  does not claim reintroduces the loop silently.

## Where this ends

Two neighbouring shapes look like this one and are not, and the discriminator
in each case is what the self-reference costs.

Where the output re-enters a body of *evidence* rather than a trigger stream —
an aggregation that treats every source it finds as an independent sighting,
and finds one of its own publications — the failure is not a loop at all. The
pass runs once, terminates, and returns a number that is wrong: independence
has been double-counted, and the remedy belongs wherever that count's predicate
is defined, because exclusion there is a property of the ingest boundary and
cannot be added downstream of it. The question that separates the two: does the
self-read make the system *run again*, or make it *believe more*? This
technique owns the first.

Where a screen sits upstream of the oracle that would correct it, the
self-reference runs the other way: nothing of the system's own output re-enters
its input, but its output *suppresses* the input that would overturn it. A loop
excluding its own writes is still correct there; the defect is in what the
filter was trained on, not in where the trigger came from.
