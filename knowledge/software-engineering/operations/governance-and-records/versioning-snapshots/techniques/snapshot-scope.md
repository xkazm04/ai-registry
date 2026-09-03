---
layer: technique
type: technique
subject: versioning-snapshots
technique: snapshot-scope
status: forged
laws: [gate-sees-target, one-validation-door]
shared_with: []
use_when: [deciding what state a version must capture, choosing embed or reference for a shared pointer, restore yields an old head with new limbs]
---

# Snapshot scope

A snapshot's scope is the answer to one question, asked before any code is
written: **what is the complete set of state that this entity's observable
behavior depends on?** Not "what is in the entity's main record" — what
would have to be identical for the restored entity to *behave* identically.
The gap between those two sets is where chimeras come from: a version that
captured the instructions but not the capabilities, the template but not
the parameters, the body but not the attachments. A restore from an
under-scoped snapshot produces a state that never existed — old head, new
limbs — and it fails silently, later, in behavior rather than at restore
time where the operator is watching.

## Enumerate the graph, then draw the line

Walk the entity's behavioral dependencies and classify each one:

- **Owned children** — rows or sub-documents that exist only as parts of
  this entity (its tool attachments, its step list, its field overrides).
  Always in scope. These are the limbs; omitting any of them is the
  chimera defect by definition.
- **Configuration the entity carries** — parameters, model/mode selections,
  flags that alter behavior. In scope, even when they live in a different
  table or a serialized blob; behavior-altering state has no exemption for
  being inconvenient to copy.
- **Referenced shared entities** — things the entity points at but does not
  own (a shared credential, a common library item, another entity it
  collaborates with). Here the scope decision is real, and it must be made
  per reference, in writing: **embed** (copy the referent's content into
  the snapshot — the version means *that exact thing*) or **reference**
  (store the pointer — the version means *whatever that thing is at
  restore time*, deliberately floating). Both are legitimate; the defect
  is not choosing. A pointer embedded when it should float resurrects
  stale dependencies; a floating pointer that should have been embedded
  re-creates the chimera one hop out.
- **Excluded state, with reasons** — runtime statistics, execution history,
  timestamps of activity, secrets held on the entity's behalf. Exclusions
  are correct and necessary, but they are part of the scope declaration:
  an **exclusion ledger** naming each excluded field and why, so the next
  maintainer extends the snapshot instead of guessing whether an omission
  was a decision or an accident.

## Capture atomically, through one door

The snapshot of a multi-part entity is one logical read at one instant. A
capture that copies the head, then the limbs in a second step, can be
interleaved by a concurrent edit and produce a snapshot of two different
moments — an under-diagnosed source of "restore looks subtly wrong"
reports. The standard mechanics: a **set-based full-graph copy inside a
single transaction** — insert the version head, then copy each owned child
collection with set operations keyed to the new version's id, all
committed together. One transaction is what makes the snapshot a *moment*
rather than an interval.

And there is exactly one capture path
([one-validation-door](../../../../_laws.md#one-validation-door)): every event
that produces a version — manual save, pre-restore capture, variant fork,
automated checkpoint promotion — goes through the same snapshot routine.
Two capture implementations will disagree about scope within a quarter,
and the one written second will be the under-scoped one, because it was
written for the narrow case that motivated it.

When the capture is triggered *by a change* (version-on-save, the
commonest trigger), it also joins the change's own transaction rather
than opening its own: a history writer that commits independently can
record a version of an edit that subsequently failed validation and was
never applied — history of a state that never existed, the temporal
cousin of the chimera. And a conditional capture door ("only version if
something changed") must compare the *whole declared scope*, not one
convenient field — a dedupe gate that diffs a single field silently
exempts every other field from history, and the exemption is invisible
until someone asks where an old value went.

## Scope drifts when the entity grows

The scope declaration is correct on the day it ships and decays every time
the live entity gains a new behavioral dependency. The team that adds a
new capability field to the entity will not remember the snapshot routine
— which is why the scope must be **guarded, not remembered**
([gate-sees-target](../../../../_laws.md#gate-sees-target)): a test or check
that compares the entity's behavioral surface against the snapshot's
captured set and fails when a new field appears in one but not the other.
Without the guard, the versioning feature silently degrades from "returns
the past" to "returns most of the past" — and no restore will announce
which kind it was.

## The schema-compatibility clause

Snapshots outlive schemas. A version stored under schema N will be read
under schema N+3, and the restore path is the least-exercised reader in
the system. Two defensible postures: **migrate stored snapshots** with the
schema (the migrations subject's data-migration machinery must then treat
snapshot tables as first-class), or **version the snapshot format** and
keep readers for old formats alive until the last old snapshot is pruned.
The indefensible posture is the default one: snapshots as opaque blobs
that no migration touches and no test restores, discovered unreadable at
the exact moment someone needs the past back.

### When a downgrade is a conversion rather than a refusal

Both postures above assume the corpus-wide default, stated flatly by the
migrations subject: **downgrade is refusal, not tolerance** — code that meets
a store written under a newer shape stops, because forward-only is the only
one-way door that can be reasoned about. That default is correct here and
stays. It is correct *because of a condition that usually holds and sometimes
does not*, and naming the condition is worth more than restating the rule.

The condition is **you own every reader**. Refusal is available only to a
system that can upgrade the thing it just refused. Where the readers are
independently deployed clients on their own release schedules — a published
interface, a third-party integration, a fleet of agents an operator upgrades
when they feel like it — refusal is not a policy, it is an outage, and the
shape that replaces it is:

**One stored version, several served versions, one conversion in the middle.**
Exactly one version of the shape is marked as the one actually persisted;
every other published version is a *projection* of it, produced on read by a
single conversion step that the serving side runs. A reader pinned to an older
version is not refused and is not tolerated — it is **served**, from converted
data, and the conversion is a first-class component with its own tests rather
than a compatibility branch inside each reader.

Two questions discriminate, and they must be answered in this order:

1. **Does a lossless conversion exist between the stored version and the
   served one?** If a field added in the new version has no representation in
   the old, a downgrade projection silently drops it, and a client that reads
   the old version and writes it back destroys the field for everyone. Where no
   round-trip exists, refusal is still the answer — but it moves: refuse to
   *publish* the older version, at registration time, rather than refusing the
   reader at request time. A version whose projection cannot round-trip is not
   a servable version.
2. **Who runs the conversion?** One place, on the serving side, or N places
   with N drifts. A conversion implemented per reader is not schema
   compatibility; it is every reader's private guess about what the new shape
   meant, and the guesses diverge on exactly the fields that changed.

For snapshots specifically the default holds in almost every case, because a
snapshot's only reader is the restore path in the same system that wrote it —
you own every reader, so migrate the stored snapshots or version the format
and keep old readers alive. Reach for served conversion only when a snapshot
format has genuinely become an interface someone else reads on their own
schedule; at that moment it stops being an internal storage detail and
acquires all of the obligations above, including the one that catches teams
out — that the newest version and the *preferred* version are then two
different questions over the same set, and the set needs both orderings
written down.

## Prohibitions

1. No snapshot that captures the entity's record but not its owned
   children — the chimera defect.
2. No embed-vs-reference decision made implicitly by whatever the copy
   code happened to reach.
3. No exclusion without a ledger entry naming it and the reason.
4. No multi-transaction capture of a single logical snapshot.
5. No second capture path — every version-producing event uses the one
   snapshot routine.
6. No snapshot format without a stated plan for surviving schema change.
7. No older shape served by conversion without a demonstrated round-trip and
   one conversion point — a lossy downgrade projection is a data-loss bug that
   only the reader who wrote back will ever trigger.
