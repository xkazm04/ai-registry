---
layer: technique
type: technique
subject: declarative-resource-lifecycle
technique: per-field-write-ownership
status: forged
laws: [identity-survives-reuse, one-authority-per-vocabulary, verdict-survives-boundary]
shared_with: []
use_when: [two or more independent processes write parts of the same record, a value keeps reverting and nobody can say which writer restored it, deciding whether a writer may overwrite a field somebody else set, a writer's name is derived from its process or its version]
stage: multi-service
---

# Per-field write ownership

Several writers hold opinions about one record and each has an opinion about
only part of it. The naive store has one answer for them — the last write
wins — which is not a conflict policy but the absence of one, and it fails in
a specific, slow, maddening way: a value is set, something restores it a
minute later, and nothing anywhere records who did it or why.

The contract that replaces it has three moving parts and they are one
mechanism. **A writer names itself. The store records which field paths that
name owns. A write that would take a path owned by another name fails, unless
the writer seizes it deliberately.**

## Why this is one technique and not two

It is tempting to split the ledger from the refusal — record ownership here,
resolve conflicts there. The evidence refuses the split, because every
resolution path *is* a mutation of the ledger. Seizing a field writes it: the
path leaves every other owner's entry. Relinquishing writes it: the path
leaves this owner's entry, and the value may be removed with it. Agreeing
writes it: the path gains an owner and becomes shared. There is no
conflict-resolution step that reads the ledger without changing it, and no
ledger write whose purpose is anything other than a future refusal.

Split in two, each half would have to restate the other to state its own
decision rule, and the split would imply a system could adopt the ledger and
skip the refusal — which is exactly the degenerate design this technique
exists to rule out: a provenance annotation that records who touched what and
enforces nothing, which changes what reviewers believe without changing what
the system does.

## The writer's name must outlive the writer

The name is an identity and it obeys the rule identities obey: mint it once,
from the **role** the writer plays, and carry it
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)). A
name derived from a process instance, a host, a container, or a release
version fails in the worst available direction. It does not error. It
orphans: every field the previous instance owned is now held by a name that
will never write again, so the ledger fills with dead owners, and the next
legitimate write conflicts against a ghost that nothing can dislodge except
seizure — which then becomes routine, which is how the refusal stops meaning
anything.

Two corollaries follow. The name vocabulary is closed and defined in one
place ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
a writer that spells its own name at each call site has as many identities as
call sites, and each owns a fragment of the record. And renaming a writer is
a **migration**, not a configuration change: the old name's holdings do not
move, and the plan for them (seize them under the new name, or relinquish
them from the old before the rename) is part of the change.

## Send what you own, whole

The write is not a delta. It is the writer's complete statement of the fields
it manages, and the store computes ownership by comparing that statement to
what the name held last time.

That is what makes **absence meaningful**. A field the writer used to state
and no longer states is a field it has given up; a writer that sends only
what changed can never give anything up, because it never sends an absence.
This is the single most common misreading of the mechanism, and it produces a
system whose ledger only grows — every field any writer ever set stays owned
by it forever, and the intended lifecycle (a feature is removed, its fields
should return to their defaults) never runs.

## Relinquishment has a consequence, and it is not "nothing happens"

When a path leaves its last owner's statement and no other owner claims it,
the store does not leave the value sitting there. It removes it, or resets it
to its declared default. That is the correct behaviour — a value nobody
claims is a value nobody is maintaining — and it means two intentions that
feel identical must be spelled differently:

- *I no longer manage this field*: omit it. The value goes.
- *I want this value to stay but I do not want to be its sole owner*: state
  the value the record currently holds. The path gains you as an additional
  owner and keeps its value.

A writer that omits a field meaning the second thing has just deleted
production configuration, and the deletion looks like a successful write.

## Shared ownership is legitimate, and it is a trap

Two writers that state the same value for one path **share** it, and neither
is refused. That is deliberate: agreement is not conflict. The trap is that
the next change by *either* of them is a conflict, and a system that arrived
at shared ownership by accident discovers this the first time somebody needs
to change the value — which, by construction, is during an incident.

So shared ownership is a design decision, taken on purpose for the fields
where it belongs (a field several parties must all assert, where any
unilateral change should be refused), and designed out everywhere else by
arranging that exactly one writer states each path. Audit for accidental
sharing the same way you audit for anything else invisible: enumerate the
paths with more than one owner and ask, of each, whether somebody intended
it.

## Seizure is a claim, an act, and a record

Seizure — writing anyway, over another owner's path — is available and must
stay available; a system where a field can become permanently unwritable is
worse than one with last-writer-wins. But it is a *claim of sole ownership*,
not a merge: the path leaves every other owner's entry, and the writers who
lost it are **not notified**. They discover it on their next conflict, which
for a writer that has stopped stating that field is never.

Three rules keep it honest. A seizure is recorded at the call site with who
seized what and why — the record is the only thing that will exist when
somebody asks in six months. A seizure that is unconditional in code is not a
decision, it is the old last-writer-wins with extra syntax; the conditional
path (attempt, catch the refusal, decide) is the shape that preserves the
mechanism. And a process that seizes on every pass has told you something
about its design rather than about the record: two writers hold one field and
neither will yield, and the fix is upstream of this technique.

## The refusal must arrive as a verdict

A conflict is not a generic write failure. It carries which paths were
contested and which name holds each, and that classification must reach the
outermost consumer intact
([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)).
Flattened into "the write failed", it produces the single worst outcome
available: a retry loop, because a failed write is a thing you retry, against
a condition that will never clear on its own. A caller that can read the
verdict can do the three correct things — yield the field, share it, or seize
it — and a caller that cannot will do the fourth.

## Make the impossible combination unrepresentable

Two errors are decidable before a request leaves the process, and both should
be refused there rather than diagnosed from a server response. A seizure flag
is meaningless on a write shape that carries no ownership statement — it can
only mean something on the statement-shaped write, and setting it on any
other is a mistake about what the write does. And a writer name that exceeds
the store's limit will be refused after a full round trip, at a call site
that has no idea why. Validate both at construction. The point is not the
saved round trip; it is that the author of the call learns the rule at the
moment they break it, instead of reading a server's error a month later and
guessing.

## The rejected alternative: read-modify-write under a version check

Read the record, change the fields you care about, write the whole thing back
with a version precondition; retry on mismatch. Every store has the
primitive, no server-side ledger is needed, and it is genuinely correct
against *concurrent* writers — two writes racing will not lose one.

It is wrong against *independent* writers, and the difference is the entire
subject. The retry loop re-reads the record and writes it back **whole**, so
a writer that succeeds has re-asserted every field it read — including the
fields another owner set an hour ago, which this writer has no opinion about
and now claims by having transmitted them. When the two writers disagree, the
loop converges to a fight rather than to a value. The version check catches
the collision it was built for and is silent about the reversion, and the
reversion is the failure that gets reported, weeks later, as "the setting
keeps coming back" — with no writer, no timestamp and no owner attached to
it.

The other alternative, a lock over the record, fails on the premise rather
than in practice: the writers are independent processes with independent
lifetimes, so a lock held by one of them is a wedge the moment it dies, and
the mechanism designed to survive that is the one this whole subject refuses
to import.

## Boundary

The nearest neighbour is
[sync-replication](../../../../backend-platform/data-layer/sync-replication/sync-replication.md)'s
[conflict-detection-and-policy](../../../../backend-platform/data-layer/sync-replication/techniques/conflict-detection-and-policy.md).
That technique governs **two copies** of one record that operated apart and
must be brought back into agreement: it needs content comparison to tell
divergence from independent convergence, a three-way compare against a common
ancestor, and a policy — merge, last-writer-wins scoped to one human, or park
it for a person.

None of that applies here, because there is one copy. Nothing diverged;
several writers are simply claiming parts of the same object at the same
time. There is no ancestor to compare against, no merge function to choose,
and the answer to a conflict is not a resolution policy but a **refusal with
an owner's name on it**. The rule: if two versions of the record exist and
must converge, that technique; if one record exists and several writers claim
parts of it, this one.
