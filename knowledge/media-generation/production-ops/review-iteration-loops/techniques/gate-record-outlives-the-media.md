---
layer: technique
type: technique
subject: review-iteration-loops
technique: gate-record-outlives-the-media
status: forged
laws: [unmeasured-is-not-pass, output-never-outruns-evidence]
shared_with: []
stage: team
use_when:
  - a human review gate runs somewhere other than where the work was generated
  - deciding what a review loop keeps after a decision and what it destroys
  - approvals have accumulated and nobody can say which were acted on
  - a verdict record and the artifacts it judged have drifted apart
  - designing the commit step of a review gate
---

# The gate record outlives the media

## The concern

A human review gate produces two things: a **verdict**, and the work the
verdict was about. They have opposite properties in every dimension that
matters to storage.

The media is heavy, cheap to remake from its recipe, and bounded by a quota
somebody will eventually hit. The verdict is light, and it cannot be remade at
all — it is a person's attention, spent once, on a specific artifact. It is
also the only thing the gate existed to produce. A loop that keeps both in one
place inherits the worse half of each: it hoards bytes in order to protect a
judgement, and it loses the judgement the first time somebody cleans up the
bytes.

The split becomes compulsory, rather than merely tidy, as soon as the reviewer
is not sitting where the work was made. Generation runs where the hardware is;
review runs where the person is; and the media usually cannot travel between
them at all — it is too heavy, and it is about to be deleted anyway. What can
travel is whatever channel the participants already replicate between
themselves.

> **At the moment a decision is recorded, the verdict and one piece of evidence
> per approval become durable in the channel the loop's participants already
> share. Everything else the decision touched is destroyed in the same
> operation, and the record says that it is gone.**

This is the loop's arm of the asset boundary the pipeline draws elsewhere: a
human decision is what mints an asset, so the decision and its evidence are the
assets, and the batch the decision was made from stops being one at the same
instant.

## What is kept, and why exactly one frame

- **The row.** What was judged, which claim it tested, what the machine judges
  had said and how strongly, who decided, and when. This is the durable
  artifact and it is small enough that there is never a reason to prune it.
- **One frame per approval.** Zero is not enough. An approval row with nothing
  to look at is a claim about an artifact nobody can see again, and it stops
  being readable within weeks — the reader cannot tell what "better" looked
  like, so the row supports no later argument and gets re-litigated or
  ignored. It is the record outrunning its evidence
  ([output-never-outruns-evidence](../../../_laws.md#output-never-outruns-evidence)),
  in the one place where re-deriving the evidence is impossible. Keeping *all*
  of them is the other failure: the storage exhaustion date, chosen in advance
  and not written down. One kept frame is the smallest thing that keeps a
  verdict legible — enough to recognise what was approved, never enough to
  reconstruct the batch.
- **Nothing for a rejection.** The artifact a rejection is about is exactly the
  thing nobody will need again; the row carries the reason, and the reason is
  the part that transfers.

## The commit is destructive, one-way, and scoped to what was decided

Three orderings, each of which has a silent failure on the other side:

- **Copy the keeper before destroying the source.** The keeper's source is
  itself one of the files the cull is about to take. Copy first and a crash
  costs a duplicate; cull first and it costs the only evidence the verdict will
  ever have.
- **Only decided items are touched.** Undecided work keeps its media, which is
  what makes a half-reviewed batch resumable rather than restartable — the one
  property that lets a reviewer stop in the middle without paying for it.
- **Record the destruction in the item; do not remove the item.** A record that
  a file is gone and the absence of any record are different states, and only
  the first can be distinguished from a loss. This is the same discipline that
  makes considered-and-unchanged distinguishable from forgotten
  ([refusal-as-valid-outcome](./refusal-as-valid-outcome.md)), applied to
  storage instead of to notes.

## The record is a work queue, not an archive

A verdict almost always obliges a change somewhere else — an approved claim has
to be written into whatever surface the next run reads, or the approval bought
nothing. So each row carries a **discharge marker**: unset while the change the
verdict authorized is still owed, and afterwards the identifier of the change
that discharged it.

Without the marker a loop fails in two ways, and the second is worse than the
first. Approvals accumulate and nobody can say which have been acted on; then
somebody works one twice, and a standard gets edited toward a claim it already
contains. A record that cannot say what is still owed is an archive, and an
archive does not close a loop.

## The channel is only shared if the write happens inside it

This is the failure that makes the whole arrangement worth writing down,
because it is invisible from the side that commits.

A shared workspace can have more than one working copy. A commit performed in a
secondary one does everything correctly — it copies the keeper, it culls, it
appends the row — and the row never reaches the history the other participant
reads. The evidence files and the record can also desync *independently*, so
the result is not a clean absence but a record that disagrees with the evidence
sitting beside it, in either direction.

Both directions were present in one live loop's record when it was read on
2026-09-20: seventeen rows, seven of which cite a kept frame, against eight
frames actually present in the shared history — four cited frames that never
arrived, and five present frames that no row accounts for. Neither number is
alarming on its own, and that is the point: the record looks complete from
every position except the one that compares the two halves.

> **Reconcile the record against the kept evidence from the reading end, not
> the writing end.** The writing end always believes it succeeded.

Coverage is part of the verdict
([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)). A ledger
that under-reports reads as complete, and a gate whose record is missing cycles
has reported a clean pass over sessions it never recorded.

## Failure modes

- **The vanished verdict** — media and judgement stored together, cleaned up
  together; the human attention is the part that cannot be regenerated.
- **The hoarded batch** — every trial kept in order to protect a verdict that
  one frame would have protected.
- **The un-evidenced approval** — a row saying "better" about an artifact that
  no longer exists anywhere, which no later reader can use.
- **The undischargeable queue** — approvals with no marker for whether they
  were acted on; the second symptom is the same approval landed twice.
- **The private ledger** — a commit made in a working copy nobody else reads,
  which looks identical to a successful one from inside.

## When not to use it

A loop where the reviewer and the work share one machine, and where nothing is
ever culled, owes none of this: the record can live wherever the media lives.
The split becomes due the moment either of those stops being true — the first
cull, or the second participant.

And do not solve the sync problem by routing the heavy media through the shared
channel. That is the hoarding failure with a larger blast radius, because a
shared history is usually one that never forgets: the bytes stop being
deletable, and every participant pays to carry trials that were disposable the
moment the human decided.
