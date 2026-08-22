---
layer: technique
type: technique
subject: docs-sync
technique: cross-repo-drift-detection
status: forged
laws: [gate-sees-target, derivation-names-recomputation, count-carries-predicate]
shared_with: []
stage: multi-service
use_when: [the documented system lives in a repository the documentation's own build cannot see, choosing how coarse a watch declaration should be, a per-document history query makes the check too slow to run]
---

# Cross-repository drift detection

Every other technique in this subject assumes one tree. The coupling map globs
paths a single walk can reach, the change-boundary check reads a diff that
contains both halves of the obligation, the rot scan compares a document's
timestamp against sources sitting a few directories away. Break that
assumption — the documentation ships from one repository and the system it
describes ships from another — and each of those mechanisms degrades to
nothing without saying so. The doc's own history is no evidence at all: the
prose can be untouched for a year while the thing it describes was rewritten
twice, and every local signal reports a healthy document.

This technique is what replaces them. Each document **declares the source
areas it makes claims about and the date a human last reviewed it against
them**; the detector asks the *other* repository's history what changed under
those areas since that date. It is the only shape available, because the one
fact the local tree cannot hold is what happened somewhere else.

## The direction across the boundary is what makes this gateable

[coupled-surface-inventory](./coupled-surface-inventory.md) already settled the
opposite direction and its verdict stands: *my* change owing a surface over
*there* cannot be gated, because the gate would be asserting facts about a
checkout that may not exist on the machine running it. This technique runs the
other way — *their* change owing a re-review of a document *here* — and the
asymmetry is the whole reason it is worth building. The artifact that must
change is local. The obligation lands on a document in this tree, on a field
this tree owns, discharged by an edit this tree's review sees. Only the
*evidence* is remote, and evidence that cannot be obtained is a skip, which is
a state the report can carry honestly
([checked-vs-skipped-denominators](./checked-vs-skipped-denominators.md)).

So: the cross-repository *obligation* is still a report. The cross-repository
*staleness of a local document* is gateable, and a team that conflates the two
either builds nothing or builds something that fails on every fresh clone.

## The declaration: a watch set and a review date

Two fields on each document, and they must be structured data rather than
prose, because prose cannot be queried:

- a **watch set** — the source areas in the other repository whose change
  makes this document suspect;
- a **review date** — when a human last read this document against that
  repository and believed it.

Together they are a self-describing freshness claim
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)):
the document states not just "I was checked" but *what against* and *when*, so
the check is re-runnable by anyone, at any later date, without asking the
original reviewer what they looked at. A review date without a watch set is a
timestamp nobody can act on; a watch set without a review date has no
`since` bound and therefore no query.

Where those fields live on the record, what type they carry, and what their
absence is declared to mean is a content-model decision and belongs to the
subject that owns the record. This technique owns only the query over them.

Two rules on the date. **Bound the query by commit dates in the other
repository, never by file modification times** — a fresh checkout stamps every
file with the moment it was cloned, so a modification-time comparison reports
"everything changed" on a build machine and "nothing changed" on the
developer's box, which is the same defect wearing two faces. And **never let
the tool advance the review date.** An auto-advanced date records that a
program ran, not that a human read; once the field means the former, every
downstream freshness claim built on it is a measurement of the scheduler.

## Watch granularity is a signal-to-noise decision, not a precision one

The instinct is to make the watch set precise — name the exact files whose
content the document describes — and the instinct is wrong. Precision is not
the objective; a *usable rate of true alarms* is. The two ends both fail, and
they fail identically:

- **Too fine.** Name individual files and the signal fires on every typo fix,
  every import reorder, every formatting sweep. Documents are flagged that
  needed nothing, reviewers learn the flag means nothing, and the review date
  stops getting bumped — at which point the field is dead and so is every
  check over it.
- **Too coarse.** Watch the whole repository and every document is flagged
  every time, which is the same information as flagging none of them.

The workable setting is deliberately coarse — a feature area or subsystem
directory, one to three of them per document, chosen so that "something
changed in here" is genuinely a reason for a human to re-read the page. Two
consequences follow and should be planned for rather than discovered.

First, coarse watch sets **survive renames better than fine ones**, because a
file moving inside its feature area does not leave the set. They do not
survive a rename *of the area*, and a watch path matching nothing on the other
side can never drift — the dead-glob failure this subject has already paid
for. So the detector asserts every declared watch path still resolves on the
other side and reports the ones that do not as a distinct failure class, not
as a quiet zero.

Second, coarse watch sets **saturate**. Against an actively developed
repository, a coarse set over a several-month window will report change for
almost every document, and a report where nine rows in ten are flagged is
triage material, not a work list. The remedy is not to narrow the set — that
resurrects the first failure — but to **rank**: order the flagged documents by
volume of change under their watch set, review downward from the top, and let
the review dates you bump on the way naturally shrink the next run. Ranking
converts a saturated boolean into a usable priority.

## One query per distinct pair, not one per document

The cost of this check is entirely in the history queries, and the naive
implementation runs one per document. That is the difference between a check
that runs on every build and a check that gets moved to a nightly job and then
forgotten, so the caching is not an optimisation — it is what keeps the gate
alive.

The observation the cache exploits: documents cluster hard. Many documents
describe the same feature area, and a batch of documents reviewed in one
sitting shares one review date. So the cache key is the **distinct (watch set,
since) pair**, not the document, and the query result is reused across every
document that resolves to that pair. **Normalise the watch set before keying**
— sort and de-duplicate the paths — or two documents watching the same two
areas in the opposite order pay for two identical queries, which is a cache
that misses exactly where the clustering is densest.

Cache the *failures* too. A query that could not run resolves to a distinct
sentinel stored under the same key, so a broken history tool costs one attempt
rather than one per document — and, more importantly, so that the failure is a
value the reporting layer can count rather than an exception that unwinds the
run.

## The verdict is "re-review owed", never "the document is wrong"

Change under a watched area is evidence that the document *might* be stale. It
is not evidence that any specific sentence is false, and the detector must not
pretend otherwise — most of what lands under a feature area does not touch
anything the document claims. So the finding is an obligation to look, phrased
as one, and it carries the predicate that produced it
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): *this
many changes, under these areas, since this date*. A finding reading "drifted"
with no bound, no path list and no volume cannot be acted on, cannot be
compared against last week's, and cannot be argued with.

And the honest framing of the whole instrument
([gate-sees-target](../../../../_laws.md#gate-sees-target)): its target is a
history in a repository it does not own, reachable only when a checkout is
present and a history tool works. Both preconditions fail routinely — a fresh
clone, a shallow checkout with no history before the review date, a build
image without the tool. Each of those makes the check *unable to look*, and
every one of them produces an empty change list that is indistinguishable, at
the arithmetic layer, from a clean result. Resolving that is not this
technique's job to hand-wave; it is the reason the next technique exists.

## When not to reach for this

When both artifacts are in one tree, do not build this — the diff already
contains both halves, so [source-doc-mapping](./source-doc-mapping.md) plus
[same-change-enforcement](./same-change-enforcement.md) give you a real gate at
the change boundary instead of a report after the fact. When you own the other
repository's automation, prefer publishing the obligation *from* the side that
made the change: a change that knows it altered a documented area can say so
at the moment it happens, which is strictly better evidence than a query
guessing at it afterwards. This technique is what you build when you can only
**read** the other side — which, for documentation of a product shipped by a
different team on a different cadence, is the normal case and not the
degenerate one.
